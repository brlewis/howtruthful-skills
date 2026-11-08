#!/usr/bin/env -S deno run --allow-all
// Runs the eval suite against two versions of the skills and compares them.
// See evals/README.md. Both versions get the working tree's suite, so the only
// difference between them is skills/.

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { basename, dirname, join, resolve } from "jsr:@std/path@1";
import { checkOutput, type CheckSpec } from "./check.ts";
import {
  compare,
  measureNoise,
  mergeNoise,
  type Noise,
  type Run,
  summarize,
  type VersionResult,
} from "./compare.ts";

const TAG = "flf-epistack-2026";
const MODEL = "claude-sonnet-5-5";
const RUNS = 3;
const FAST_BUDGET_USD = 15;
const FULL_BUDGET_USD = 40;
const TOOLS_REMOVED = [
  "Agent",
  "Task",
  "TaskStop",
  "Edit",
  "NotebookEdit",
  "ToolSearch",
];
const ALLOWED_TOOLS = ["Read", "Write", "Glob", "Grep", "Skill"];
const SKILL_LOADED = "skill-loaded";

const evalsDir = dirname(new URL(import.meta.url).pathname);
const repoRoot = dirname(evalsDir);

interface CaseSpec extends CheckSpec {
  skill: string;
  tags: string[];
  inputs: Record<string, string>;
  rules: string[];
  judgeContext?: Record<string, string>;
  maxTurns?: number;
  timeoutSeconds?: number;
}

async function sh(cmd: string, args: string[], cwd = repoRoot) {
  const { code, stdout, stderr } = await new Deno.Command(cmd, {
    args,
    cwd,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const text = new TextDecoder();
  return { code, out: text.decode(stdout), err: text.decode(stderr) };
}

async function mustSh(cmd: string, args: string[], cwd = repoRoot) {
  const result = await sh(cmd, args, cwd);
  if (result.code !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed:\n${result.err}`);
  }
  return result.out;
}

/** Resolves a `tag:path` or `fixture:name` source to its text. */
async function readSource(source: string): Promise<string> {
  const [kind, path] = [
    source.slice(0, source.indexOf(":")),
    source.slice(source.indexOf(":") + 1),
  ];
  if (kind === "tag") return await mustSh("git", ["show", `${TAG}:${path}`]);
  if (kind === "fixture") {
    return await Deno.readTextFile(join(evalsDir, "fixtures", path));
  }
  throw new Error(`Unknown source: ${source}`);
}

async function loadCases(): Promise<Map<string, CaseSpec>> {
  const cases = new Map<string, CaseSpec>();
  for await (const entry of Deno.readDir(join(evalsDir, "cases"))) {
    const path = join(evalsDir, "cases", entry.name, "case.json");
    cases.set(entry.name, JSON.parse(await Deno.readTextFile(path)));
  }
  return new Map([...cases].sort(([a], [b]) => a.localeCompare(b)));
}

function shellQuote(text: string) {
  return `'${text.replaceAll("'", `'\\''`)}'`;
}

/** The scaffold's environment is stripped, so paths are baked in here. */
function scaffoldScript(spec: CaseSpec) {
  const lines = ["#!/usr/bin/env bash", "set -euo pipefail"];
  for (const [name, source] of Object.entries(spec.inputs)) {
    const path = source.slice(source.indexOf(":") + 1);
    lines.push(
      source.startsWith("tag:")
        ? `git -C ${shellQuote(repoRoot)} show ${
          shellQuote(`${TAG}:${path}`)
        } > ${shellQuote(name)}`
        : `cp ${shellQuote(join(evalsDir, "fixtures", path))} ${
          shellQuote(name)
        }`,
    );
  }
  return lines.join("\n") + "\n";
}

/** Writes one case in the layout `claude plugin eval` reads. */
async function stageCase(dir: string, name: string, spec: CaseSpec) {
  const graders = join(dir, "graders");
  await Deno.mkdir(graders, { recursive: true });
  const prompt = await Deno.readTextFile(
    join(evalsDir, "cases", name, "prompt.md"),
  );
  await Deno.writeTextFile(
    join(dir, "prompt.md"),
    `---
name: ${name}
tags: ${JSON.stringify(spec.tags)}
plugins: ["../.."]
max_turns: ${spec.maxTurns ?? 15}
timeout_seconds: ${spec.timeoutSeconds ?? 300}
allowed_tools: ${JSON.stringify(ALLOWED_TOOLS)}
---

${prompt}`,
  );
  await Deno.writeTextFile(
    join(dir, "case.yaml"),
    `schema_version: "1.1"\nname: ${name}\ncontext:\n  scaffold_script: scaffold.sh\n`,
  );
  await Deno.writeTextFile(join(dir, "scaffold.sh"), scaffoldScript(spec), {
    mode: 0o755,
  });
  await Deno.writeTextFile(
    join(graders, `${SKILL_LOADED}.md`),
    `---
type: tool_used
tool: Skill
input_match: '"skill"\\s*:\\s*"(?:[\\w-]+:)?${spec.skill}"'
---
`,
  );
  let context = "";
  for (const [label, source] of Object.entries(spec.judgeContext ?? {})) {
    context += `\n\n## ${label}\n\n${await readSource(source)}`;
  }
  for (const rule of spec.rules) {
    const rubric = await Deno.readTextFile(
      join(evalsDir, "rubric", `${rule}.md`),
    );
    await Deno.writeTextFile(join(graders, `${rule}.md`), rubric + context);
  }
}

/** A throwaway worktree of `ref`, optionally with another skills/ laid over. */
async function stageVersion(
  tmp: string,
  label: string,
  ref: string,
  skillsDir: string | null,
  cases: Map<string, CaseSpec>,
) {
  // Same basename for both, because it becomes the plugin's name in the prompt.
  const root = join(tmp, label, "howtruthful-skills");
  await Deno.mkdir(dirname(root), { recursive: true });
  await mustSh("git", ["worktree", "add", "--detach", root, ref]);
  if (skillsDir) {
    await Deno.remove(join(root, "skills"), { recursive: true });
    await mustSh("cp", ["-r", skillsDir, join(root, "skills")]);
  }
  for (const [name, spec] of cases) {
    await stageCase(join(root, "eval-cases", name), name, spec);
  }
  return root;
}

interface EvalOptions {
  root: string;
  outDir: string;
  tag: string | null;
  caseGlob: string | null;
  runs: number;
  budget: number;
}

async function runEval(o: EvalOptions) {
  const args = [
    "plugin",
    "eval",
    ".",
    "--eval-dir",
    "eval-cases",
    "--ablation",
    "none",
    "--model",
    MODEL,
    "--judge-model",
    MODEL,
    "--runs",
    String(o.runs),
    "--allow-tools",
    "Write",
    "--disallow-tools",
    ...TOOLS_REMOVED,
    "--scaffold",
    "--keep-temp",
    "--no-publish",
    "--trust-plugin",
    "--threshold",
    "0",
    "--concurrency",
    "3",
    "--max-cost-usd",
    String(o.budget),
    "--output-dir",
    o.outDir,
    ...(o.tag ? ["--tag", o.tag] : []),
    ...(o.caseGlob ? ["--case", o.caseGlob] : []),
  ];
  const { code } = await new Deno.Command("claude", {
    args,
    cwd: o.root,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  return code;
}

interface RawGrader {
  name: string;
  passed: boolean;
}
interface RawRun {
  error: string | null;
  tracePath: string | null;
  graders: RawGrader[];
}
interface RawResult {
  partial: boolean;
  costUsd: number;
  cases: { name: string; arms: { with: RawRun[] } }[];
}

async function readOutput(tracePath: string | null) {
  if (!tracePath) return null;
  const runDir = dirname(dirname(tracePath));
  // The kept directory is sealed. Only reading a file is safe in there.
  await mustSh("chmod", ["700", runDir, join(runDir, "sealed")]);
  try {
    return await Deno.readTextFile(
      join(runDir, "sealed", "home", "cwd", "output.md"),
    );
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return null;
    throw error;
  }
}

async function removeRunDir(tracePath: string | null) {
  if (!tracePath) return;
  const runDir = dirname(dirname(tracePath));
  if (!basename(runDir).startsWith("claude-eval-")) return;
  await sh("chmod", ["-R", "u+rwx", runDir]);
  await Deno.remove(runDir, { recursive: true });
}

/** Saves each run's output, runs the script checks, and reads the graders. */
async function collect(
  outDir: string,
  exitCode: number,
  cases: Map<string, CaseSpec>,
): Promise<VersionResult & { costUsd: number }> {
  let raw: RawResult;
  try {
    raw = JSON.parse(
      await Deno.readTextFile(join(outDir, "aggregate-result.json")),
    );
  } catch {
    return { partial: true, cases: {}, costUsd: 0 };
  }
  const result: VersionResult = { partial: raw.partial, cases: {} };
  if (exitCode !== 0) result.partial = true;
  for (const rawCase of raw.cases) {
    const spec = cases.get(rawCase.name)!;
    const transcript = spec.transcript
      ? await readSource(spec.transcript)
      : "";
    const runs: Run[] = [];
    for (const [index, rawRun] of (rawCase.arms.with ?? []).entries()) {
      const output = await readOutput(rawRun.tracePath);
      await removeRunDir(rawRun.tracePath);
      const graders = Object.fromEntries(
        rawRun.graders.map((g) => [g.name, g.passed]),
      );
      const { [SKILL_LOADED]: triggered, ...rubric } = graders;
      const run: Run = {
        status: rawRun.error
          ? "error"
          : !triggered
          ? "not-triggered"
          : output === null
          ? "no-output"
          : "ok",
        rubric,
        checks: [],
        warnings: 0,
      };
      if (output !== null) {
        const dir = join(outDir, "outputs", rawCase.name);
        await Deno.mkdir(dir, { recursive: true });
        await Deno.writeTextFile(join(dir, `run-${index + 1}.md`), output);
        const check = checkOutput(output, spec, transcript);
        await Deno.writeTextFile(
          join(dir, `run-${index + 1}.check.json`),
          JSON.stringify(check, null, 2) + "\n",
        );
        run.checks = Object.keys(check.failures);
        run.warnings = Object.values(check.warnings).flat().length;
      }
      runs.push(run);
    }
    result.cases[rawCase.name] = runs;
  }
  return { ...result, costUsd: raw.costUsd };
}

async function main() {
  const flags = parseArgs(Deno.args, {
    boolean: ["full", "noise"],
    string: ["base", "skills", "case", "runs", "budget"],
    default: { base: "main" },
  });

  const tag = await sh("git", ["rev-parse", "-q", "--verify", `refs/tags/${TAG}`]);
  if (tag.code !== 0) {
    console.error(
      `Tag ${TAG} is missing, and the cases read their inputs from it.\n` +
        `Fetch it with: git fetch origin tag ${TAG}`,
    );
    Deno.exit(1);
  }

  const allCases = await loadCases();
  const cases = flags.full
    ? allCases
    : new Map([...allCases].filter(([, c]) => c.tags.includes("fast")));
  const budget = Number(
    flags.budget ?? (flags.full ? FULL_BUDGET_USD : FAST_BUDGET_USD),
  );
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const results = join(evalsDir, "results", stamp);
  await Deno.mkdir(results, { recursive: true });
  const tmp = await Deno.makeTempDir({ prefix: "howtruthful-evals-" });
  const skillsDir = flags.noise
    ? null
    : resolve(flags.skills ?? join(repoRoot, "skills"));

  const roots: string[] = [];
  try {
    const versions = [
      { label: "base", skills: null as string | null },
      { label: "head", skills: skillsDir },
    ];
    const outcomes = await Promise.all(versions.map(async (version) => {
      const root = await stageVersion(
        tmp,
        version.label,
        flags.base,
        version.skills,
        cases,
      );
      roots.push(root);
      const outDir = join(results, version.label);
      const code = await runEval({
        root,
        outDir,
        tag: flags.full ? null : "fast",
        caseGlob: flags.case ?? null,
        runs: Number(flags.runs ?? RUNS),
        budget: budget / 2,
      });
      return await collect(outDir, code, cases);
    }));
    const [base, head] = outcomes;

    const noisePath = join(evalsDir, "noise.json");
    let noise: Noise | null = null;
    try {
      noise = JSON.parse(await Deno.readTextFile(noisePath));
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
    if (flags.noise) {
      noise = mergeNoise(noise, measureNoise(base, head));
      await Deno.writeTextFile(
        noisePath,
        JSON.stringify(noise, null, 2) + "\n",
      );
      console.log(`Wrote ${noisePath}:\n${JSON.stringify(noise, null, 2)}`);
    }

    const comparison = compare(base, head, noise);
    const cost = base.costUsd + head.costUsd;
    const summary = summarize(comparison, flags.base) +
      `\nModel ${MODEL}, ${
        Object.keys(head.cases).length
      } cases, $${cost.toFixed(2)}\n`;
    await Deno.writeTextFile(join(results, "summary.md"), summary);
    await Deno.writeTextFile(
      join(results, "comparison.json"),
      JSON.stringify({ base, head, comparison }, null, 2) + "\n",
    );
    console.log(`\n${summary}\nDetails: ${results}`);
    Deno.exitCode = comparison.incomplete ? 2 : comparison.regressed ? 1 : 0;
  } finally {
    for (const root of roots) {
      await sh("git", ["worktree", "remove", "--force", root]);
    }
    await Deno.remove(tmp, { recursive: true }).catch(() => {});
  }
}

if (import.meta.main) await main();
