import { assertEquals } from "jsr:@std/assert@1";
import {
  compare,
  measureNoise,
  mergeNoise,
  type Run,
  type VersionResult,
} from "./compare.ts";

const run = (passed: boolean, over: Partial<Run> = {}): Run => ({
  status: "ok",
  rubric: { signs: passed },
  checks: [],
  warnings: 0,
  ...over,
});
const version = (runs: Run[], partial = false): VersionResult => ({
  partial,
  cases: { sky: runs },
});
const yes = run(true);
const no = run(false);

Deno.test("a rubric drop within the noise is not a regression", () => {
  const c = compare(version([yes, yes, yes]), version([yes, yes, no]), {
    signs: 0.5,
  });
  assertEquals(c.regressed, false);
});

Deno.test("a rubric drop beyond the noise is a regression", () => {
  const c = compare(version([yes, yes, yes]), version([yes, no, no]), {
    signs: 0.5,
  });
  assertEquals(c.regressed, true);
});

Deno.test("a drop exactly equal to the noise is not a regression", () => {
  const c = compare(version([yes, yes, yes]), version([yes, yes, no]), {
    signs: 1 / 3,
  });
  assertEquals(c.regressed, false);
});

Deno.test("rules are compared separately, not averaged", () => {
  const both = (a: boolean, b: boolean) =>
    run(true, { rubric: { signs: a, attribution: b } });
  const c = compare(version([both(true, false)]), version([both(false, true)]), {
    signs: 0,
    attribution: 0,
  });
  assertEquals(c.rules.filter((r) => r.regressed).map((r) => r.rule), ["signs"]);
});

Deno.test("any new script failure is a regression, ignoring noise", () => {
  const c = compare(
    version([yes, yes]),
    version([yes, run(true, { checks: ["length"] })]),
    { signs: 1 },
  );
  assertEquals(c.newFailures, ["sky: length (0 -> 1)"]);
  assertEquals(c.regressed, true);
});

Deno.test("an existing script failure is not new", () => {
  const failing = run(true, { checks: ["length"] });
  const c = compare(version([failing]), version([failing]), { signs: 0 });
  assertEquals(c.regressed, false);
});

Deno.test("not-triggered is reported apart from rule scores", () => {
  const skipped = run(false, { status: "not-triggered", checks: ["format"] });
  const c = compare(version([yes]), version([yes, skipped]), { signs: 0 });
  assertEquals(c.regressed, false);
  assertEquals(c.rules[0].head, 1);
  assertEquals(c.statusCounts.head["not-triggered"], 1);
});

Deno.test("a missing output is a failed run", () => {
  const missing = run(false, { status: "no-output" });
  const c = compare(version([yes]), version([yes, missing]), { signs: 0 });
  assertEquals(c.newFailures, ["sky: output (0 -> 1)"]);
  assertEquals(c.regressed, true);
});

Deno.test("a capped run is incomplete, not a low score", () => {
  const c = compare(version([yes]), version([], true), { signs: 0 });
  assertEquals(c.incomplete, true);
  assertEquals(c.regressed, false);
});

Deno.test("an errored run is incomplete", () => {
  const c = compare(version([yes]), version([run(false, { status: "error" })]), {
    signs: 0,
  });
  assertEquals(c.incomplete, true);
});

Deno.test("with no noise figure a rule can't regress", () => {
  const c = compare(version([yes]), version([no]), null);
  assertEquals(c.regressed, false);
  assertEquals(c.rules[0].noise, null);
});

Deno.test("noise is the per-rule gap between two runs", () => {
  assertEquals(
    measureNoise(version([yes, yes]), version([yes, no])),
    { signs: 0.5 },
  );
});

Deno.test("a version never regresses against its own measured noise", () => {
  const a = version([yes, yes, yes]);
  const b = version([yes, yes, no]);
  assertEquals(compare(a, b, measureNoise(a, b)).regressed, false);
});

Deno.test("merged noise keeps each rule's largest gap", () => {
  assertEquals(
    mergeNoise({ signs: 0.5, attribution: 0 }, { signs: 0.2, attribution: 0.3 }),
    { signs: 0.5, attribution: 0.3 },
  );
  assertEquals(mergeNoise(null, { signs: 0.2 }), { signs: 0.2 });
});
