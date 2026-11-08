#!/usr/bin/env -S deno run --allow-read
// Script checks for a HowTruthful markdown output. These are the rules that
// need no judgment, so they run without a model. `claude plugin eval` has no
// script grader, which is why this is a separate step (see evals/README.md).

export interface CheckSpec {
  /** Text the output must contain (case-insensitive). */
  must?: string[];
  /** Text the output must not contain (case-insensitive). */
  mustNot?: string[];
  /** Transcript fixture that every `&t=` URL must be copied from. */
  transcript?: string;
  /** Allow any 1-5 top-level rating, for cases that record the user's views. */
  ratedRoots?: boolean;
}

export interface CheckResult {
  /** Failed rule names mapped to what failed. A rule that passed is absent. */
  failures: Record<string, string[]>;
  /** Never count as failures: attribution children legitimately match. */
  warnings: Record<string, string[]>;
  statements: number;
}

export interface Statement {
  line: number;
  depth: number;
  prefix: string;
  text: string;
}

const MAX_STATEMENT_LENGTH = 255;
const BARE_URL = /^https?:\/\/\S+$/;
const TIMESTAMP_URL = /https?:\/\/\S*[?&]t=\S*/g;
const REPORTING_FRAME =
  /\b(argues? that|argued that|claims? that|claimed that|critics (say|claim|argue)|proponents (say|claim|argue)|supporters (say|claim|argue)|opponents (say|claim|argue)|a popular belief|some (say|argue|claim|believe))\b/i;

function fail(result: CheckResult, rule: string, message: string) {
  (result.failures[rule] ??= []).push(message);
}

export function parseStatements(
  markdown: string,
  result: CheckResult,
  ratedRoots = false,
): Statement[] {
  const statements: Statement[] = [];
  let previousDepth = -1;
  markdown.split(/\r?\n/).forEach((raw, index) => {
    if (!raw.trim()) return;
    const line = index + 1;
    const match = raw.match(/^( *)- (\S+)(?: (.*))?$/);
    if (!match) {
      fail(result, "format", `line ${line} is not a list item: ${raw}`);
      return;
    }
    const [, indent, prefix, text = ""] = match;
    const depth = indent.length / 2;
    if (!Number.isInteger(depth) || depth > previousDepth + 1) {
      fail(result, "format", `line ${line} has bad indentation: ${raw}`);
    }
    const root = ratedRoots ? /^[1-5]$/ : /^3$/;
    if (!(depth === 0 ? root : /^[+-][1-5]$/).test(prefix)) {
      const wanted = depth === 0
        ? (ratedRoots ? "a number" : "3")
        : "a sign and a number";
      fail(result, "format", `line ${line} should start with ${wanted}: ${raw}`);
    }
    statements.push({ line, depth, prefix, text: text.trim() });
    previousDepth = depth;
  });
  if (statements.length === 0) fail(result, "format", "no statements found");
  return statements;
}

export function checkOutput(
  markdown: string,
  spec: CheckSpec = {},
  transcriptText = "",
): CheckResult {
  const result: CheckResult = { failures: {}, warnings: {}, statements: 0 };
  const statements = parseStatements(markdown, result, spec.ratedRoots);
  result.statements = statements.length;

  for (const { line, text } of statements) {
    if (BARE_URL.test(text)) continue;
    if (/https?:\/\//.test(text)) {
      fail(result, "bare-url", `line ${line} wraps a URL in prose: ${text}`);
    }
    if (text.length > MAX_STATEMENT_LENGTH) {
      fail(result, "length", `line ${line} has ${text.length} characters`);
    }
    if (REPORTING_FRAME.test(text)) {
      (result.warnings["reporting-frame"] ??= []).push(`line ${line}: ${text}`);
    }
  }

  if (spec.transcript) {
    const allowed = new Set(transcriptText.match(TIMESTAMP_URL) ?? []);
    const used = markdown.match(TIMESTAMP_URL) ?? [];
    for (const url of used) {
      if (!allowed.has(url)) {
        fail(result, "timestamp", `not in the transcript: ${url}`);
      }
    }
    if (used.length === 0) fail(result, "timestamp", "no timestamp citations");
  }

  const lower = markdown.toLowerCase();
  for (const text of spec.must ?? []) {
    if (!lower.includes(text.toLowerCase())) {
      fail(result, "must", `missing: ${text}`);
    }
  }
  for (const text of spec.mustNot ?? []) {
    if (lower.includes(text.toLowerCase())) {
      fail(result, "must-not", `present: ${text}`);
    }
  }
  return result;
}
