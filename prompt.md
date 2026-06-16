Convert the input into a structured recursive markdown list for HowTruthful.

The input is freeform text about one or more debatable statements. Extract the
main claim or claims being debated, then organize the supporting and opposing
evidence under those claims.

Output rules:

- Output only markdown. Do not add explanation, commentary, code fences, or a
  title.
- Use a recursive unordered list.
- Each top-level list item should be a debatable claim, prefixed with `3`.
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
- Preserve distinctive concepts, metaphors, quoted phrases, and terms of art
  when they carry argumentative meaning. If the input says an effect can be
  "infectious", represent the spread, adoption, or transmission claim directly
  rather than replacing it only with downstream consequences.
- Include important implied intermediate claims when the input strongly signals
  them, especially when a metaphor, analogy, example list, or causal transition
  depends on the implication. Include only implications that a careful reader
  would likely infer from the text. Anchor each implied claim in specific
  wording from the input, and do not add background facts or speculative claims.
- Each list item should be self-contained and not rely on its parent for
  context, conditions, timing, or causal setup. Do not write child evidence that
  only makes sense if the reader mentally imports the parent claim. For example,
  "People would drive slower" is not self-contained evidence for "Lower speed
  limits would make us safer". A self-contained wording would be "Lower speed
  limits lead to people driving slower." Likewise, "More people can more often
  see through misinformation" is not self-contained evidence for "Upgrading
  information scrutiny can be infectious", because it relies on the parent for
  the condition that information scrutiny has been upgraded. A self-contained
  wording would be "Upgrading information scrutiny can lead more people to see
  through misinformation more often."
- Each list item must be a complete standalone sentence. Avoid pronouns or
  references that depend on a parent item, such as "this", "that", "it", "they",
  "he", "she", or "the above".
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
