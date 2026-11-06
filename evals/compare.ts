// Compares two versions' results. Pure, so its regression rules can be tested
// without paying for a run. The rules are in evals/README.md.

export type RunStatus = "ok" | "not-triggered" | "no-output" | "error";

export interface Run {
  status: RunStatus;
  /** Rubric rule name to whether the grader passed. */
  rubric: Record<string, boolean>;
  /** Script rule names that failed. */
  checks: string[];
  warnings: number;
}

export interface VersionResult {
  /** True if the cost cap or anything else stopped the run early. */
  partial: boolean;
  cases: Record<string, Run[]>;
}

/** Per-rule gap between two runs of unchanged main. */
export type Noise = Record<string, number>;

export interface RuleRow {
  rule: string;
  base: number | null;
  head: number | null;
  noise: number | null;
  regressed: boolean;
}

export interface Comparison {
  rules: RuleRow[];
  /** Script failures that are new in head, as `case: rule (base -> head)`. */
  newFailures: string[];
  statusCounts: Record<"base" | "head", Record<RunStatus, number>>;
  incomplete: boolean;
  regressed: boolean;
}

function passRates(result: VersionResult): Map<string, number> {
  const tally = new Map<string, { passed: number; total: number }>();
  for (const runs of Object.values(result.cases)) {
    for (const run of runs) {
      if (run.status !== "ok") continue;
      for (const [rule, passed] of Object.entries(run.rubric)) {
        const entry = tally.get(rule) ?? { passed: 0, total: 0 };
        entry.total++;
        if (passed) entry.passed++;
        tally.set(rule, entry);
      }
    }
  }
  return new Map(
    [...tally].map(([rule, { passed, total }]) => [rule, passed / total]),
  );
}

function failureCounts(runs: Run[] = []): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (rule: string) => counts.set(rule, (counts.get(rule) ?? 0) + 1);
  for (const run of runs) {
    if (run.status === "no-output") add("output");
    if (run.status === "ok") run.checks.forEach(add);
  }
  return counts;
}

function countStatuses(result: VersionResult): Record<RunStatus, number> {
  const counts = { ok: 0, "not-triggered": 0, "no-output": 0, error: 0 };
  for (const runs of Object.values(result.cases)) {
    for (const run of runs) counts[run.status]++;
  }
  return counts;
}

export function compare(
  base: VersionResult,
  head: VersionResult,
  noise: Noise | null,
): Comparison {
  const baseRates = passRates(base);
  const headRates = passRates(head);
  const names = [...new Set([...baseRates.keys(), ...headRates.keys()])].sort();
  const rules = names.map((rule) => {
    const b = baseRates.get(rule) ?? null;
    const h = headRates.get(rule) ?? null;
    const gap = noise?.[rule] ?? null;
    const regressed = b !== null && h !== null && gap !== null &&
      b - h > gap + 1e-9;
    return { rule, base: b, head: h, noise: gap, regressed };
  });

  const newFailures: string[] = [];
  const caseNames = new Set([
    ...Object.keys(base.cases),
    ...Object.keys(head.cases),
  ]);
  for (const name of [...caseNames].sort()) {
    const before = failureCounts(base.cases[name]);
    for (const [rule, after] of failureCounts(head.cases[name])) {
      const was = before.get(rule) ?? 0;
      if (after > was) newFailures.push(`${name}: ${rule} (${was} -> ${after})`);
    }
  }

  const statusCounts = { base: countStatuses(base), head: countStatuses(head) };
  return {
    rules,
    newFailures,
    statusCounts,
    incomplete: base.partial || head.partial || statusCounts.base.error > 0 ||
      statusCounts.head.error > 0,
    regressed: newFailures.length > 0 || rules.some((row) => row.regressed),
  };
}

/** Each rule's gap between two versions that are really the same version. */
export function measureNoise(a: VersionResult, b: VersionResult): Noise {
  const noise: Noise = {};
  for (const { rule, base, head } of compare(a, b, null).rules) {
    if (base !== null && head !== null) {
      // Round up: rounding down would make a drop equal to the gap exceed it.
      noise[rule] = Math.ceil(Math.abs(base - head) * 1000) / 1000;
    }
  }
  return noise;
}

/** One gap can understate the noise, so keep each rule's largest. */
export function mergeNoise(previous: Noise | null, latest: Noise): Noise {
  const merged = { ...previous };
  for (const [rule, gap] of Object.entries(latest)) {
    merged[rule] = Math.max(merged[rule] ?? 0, gap);
  }
  return merged;
}

const percent = (rate: number | null) =>
  rate === null ? "n/a" : `${Math.round(rate * 100)}%`;

export function summarize(c: Comparison, baseLabel: string): string {
  const verdict = c.incomplete
    ? "INCOMPLETE: some runs did not finish, so this is not a pass or a low score"
    : c.regressed
    ? "REGRESSED"
    : "No regression";
  const lines = [
    `**${verdict}** (${baseLabel} vs. working tree)`,
    "",
    `| Rule | ${baseLabel} | Working tree | Noise | |`,
    "|---|---|---|---|---|",
    ...c.rules.map((row) =>
      `| ${row.rule} | ${percent(row.base)} | ${percent(row.head)} | ${
        percent(row.noise)
      } | ${row.regressed ? "regressed" : ""} |`
    ),
    "",
    `New script-check failures: ${c.newFailures.join("; ") || "none"}`,
  ];
  for (const version of ["base", "head"] as const) {
    const s = c.statusCounts[version];
    const label = version === "base" ? baseLabel : "Working tree";
    lines.push(
      `${label} runs: ${s.ok} ok, ${s["not-triggered"]} not-triggered, ${
        s["no-output"]
      } no output, ${s.error} errored`,
    );
  }
  if (c.rules.some((row) => row.noise === null)) {
    lines.push("", "Rules with no noise figure can't regress: run eval:noise.");
  }
  return lines.join("\n") + "\n";
}
