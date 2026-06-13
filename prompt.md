Convert the input into a structured recursive markdown list for HowTruthful.

The input is freeform text about one or more debatable statements. Extract the
main claim or claims being debated, then organize the supporting and opposing
evidence under those claims.

Output rules:

- Output only markdown. Do not add explanation, commentary, code fences, or a
  title.
- Use a recursive unordered list.
- Each top-level list item should be a debatable claim.
- Prefer one top-level claim when the input is centered on one question or
  proposition. Use multiple top-level claims only when the input clearly
  contains separate debates.
- Evidence supporting a claim must be nested under that claim and prefixed with
  `+3`.
- Evidence opposing a claim must be nested under that claim and prefixed with
  `-3`.
- Evidence supporting or opposing an evidential statement may be nested under
  that evidential statement, also using `+3` or `-3`.
- Split causal statements into separate list items. For a statement of the form
  "X because Y", output "X" as the claim or evidence item, then nest "Y" under
  it as supporting evidence with `+3`. For example, "The sky is gray because it
  is cloudy" should become "The sky is gray." with "+3 The sky is cloudy."
  nested underneath.
- Each list item must be a complete standalone sentence. Avoid pronouns or
  references that depend on a parent item, such as "this", "that", "it",
  "they", "he", "she", or "the above".
- Preserve the meaning of the input, but rewrite claims and evidence for
  clarity, brevity, and standalone readability.
- Do not invent evidence or claims that are not present in or strongly implied
  by the input.
- When the strength of evidence is unclear, still use `+3` or `-3`; do not
  introduce other numbers.

Example output shape:

- The sky is blue.
  - +3 The sky looks blue.
  - -3 The sky is gray.
    - +3 The sky is cloudy.
