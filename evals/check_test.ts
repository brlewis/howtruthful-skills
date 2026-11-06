import { assertEquals } from "jsr:@std/assert@1";
import { checkOutput } from "./check.ts";

const good = `- 3 The sky is blue.
  - +3 The sky looks blue.
  - -3 The sky is gray.
    - +3 https://example.com/sky

- 3 Coffee is widely traded.
`;

Deno.test("valid map passes", () => {
  const result = checkOutput(good);
  assertEquals(result.failures, {});
  assertEquals(result.statements, 5);
});

Deno.test("format: commentary and code fences fail", () => {
  assertEquals(
    Object.keys(checkOutput("Here is the map:\n" + good).failures),
    ["format"],
  );
  assertEquals(
    Object.keys(checkOutput("```markdown\n" + good + "```\n").failures),
    ["format"],
  );
});

Deno.test("format: empty output fails", () => {
  assertEquals(Object.keys(checkOutput("\n").failures), ["format"]);
});

Deno.test("format: wrong prefixes and indentation fail", () => {
  for (
    const bad of [
      "- +3 Top-level with a sign.",
      "- 5 Top-level rated 5.",
      "- 3 Parent.\n  - 3 Child without a sign.",
      "- 3 Parent.\n   - +3 Odd indent.",
      "- 3 Parent.\n    - +3 Skipped a level.",
    ]
  ) {
    assertEquals(Object.keys(checkOutput(bad).failures), ["format"], bad);
  }
});

Deno.test("bare-url: a URL wrapped in prose fails", () => {
  const md = "- 3 Claim.\n  - +3 According to https://example.com/a, yes.";
  assertEquals(Object.keys(checkOutput(md).failures), ["bare-url"]);
});

Deno.test("length: limit is 255 and skips bare URLs", () => {
  const at = `- 3 ${"a".repeat(255)}`;
  const over = `- 3 ${"a".repeat(256)}`;
  const url = `- 3 Claim.\n  - +3 https://example.com/${"a".repeat(300)}`;
  assertEquals(checkOutput(at).failures, {});
  assertEquals(Object.keys(checkOutput(over).failures), ["length"]);
  assertEquals(checkOutput(url).failures, {});
});

Deno.test("timestamp: URLs must be copied exactly from the transcript", () => {
  const transcript = "https://www.youtube.com/watch?v=abc&t=61s\tsome words\n";
  const spec = { transcript: "t.tsv" };
  const ok = "- 3 Claim.\n  - +5 https://www.youtube.com/watch?v=abc&t=61s";
  const off = "- 3 Claim.\n  - +5 https://www.youtube.com/watch?v=abc&t=60s";
  assertEquals(checkOutput(ok, spec, transcript).failures, {});
  assertEquals(
    Object.keys(checkOutput(off, spec, transcript).failures),
    ["timestamp"],
  );
  assertEquals(
    Object.keys(checkOutput("- 3 Claim.", spec, transcript).failures),
    ["timestamp"],
  );
});

Deno.test("must and must-not ignore case", () => {
  const spec = { must: ["SKY IS BLUE"], mustNot: ["joe"] };
  assertEquals(checkOutput(good, spec).failures, {});
  const failures = checkOutput("- 3 Joe said so.", spec).failures;
  assertEquals(Object.keys(failures).sort(), ["must", "must-not"]);
});

Deno.test("reporting frames warn and never fail", () => {
  const md = "- 3 Claim.\n  - +3 Otto Rössler argued that the Earth is at risk.";
  const result = checkOutput(md);
  assertEquals(result.failures, {});
  assertEquals(Object.keys(result.warnings), ["reporting-frame"]);
});
