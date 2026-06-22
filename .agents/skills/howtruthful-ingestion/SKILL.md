---
name: "howtruthful-ingestion"
description: "Use when converting freeform debate text into HowTruthful-compatible recursive markdown."
---

# HowTruthful Ingestion

Convert freeform debate text into HowTruthful-compatible recursive markdown. Use
this skill when the user asks to transform source material into an argument map
or HowTruthful markdown.

## Conversion Workflow

1. Convert the freeform text into a collection of context-independent
   statements. Statements must stand alone logically and syntactically. Do not
   use concessive or conditional clauses that reference the parent's context
   (e.g., 'Even if X', 'Although Y', 'Because of this').
1. Preserve meaningful metaphors, quoted phrases, and terms of art when they
   carry argumentative meaning.
1. If any of these statements have identical meaning, keep the most clearly
   worded one. If they are worded equally well, keep the shorter one.
1. Look for statements that have strictly opposite meaning from each other, i.e.
   if one is true then the other must be false, and vice versa, and an argument
   for one is an argument against the other. Keep the most clearly worded or
   shorter one.
1. Split causal, consequential, and logic-derived statements (e.g. containing
   'because', 'so', 'therefore', 'since', 'implying', 'meaning that', 'which
   leads to') into a conclusion/claim (parent) and a premise/evidence (child),
   regardless of their order of appearance in the sentence. For example:
   - For "X because Y": X is the parent, Y is the child.
   - For "Y, so X" or "Since Y, X": X is the parent, Y is the child.
1. Identify the statements that are top-level, i.e. they aren't being used to
   argue for or against other statements in the debate. In the case of circular
   reasoning, choose a statement that makes sense as a debate title or entry
   point.
1. Identify which statements argue for or against other statements.
1. Output only markdown: no title, commentary, code fence, or explanation.

## Structure Rules

- Use a recursive unordered markdown list.
- Prefix each top-level claim with `3`.
- Prefix supporting child evidence with `+3`.
- Prefix opposing child evidence with `-3`.
- Each child must directly argue for or against its immediate parent.
- Judge child placement by argumentative relevance, not by whether the child is
  true, decisive, or strong evidence.
- A weak, dubious, or false claim may still be included if the input presents or
  implies it as an argument and, if true, it would count for or against the
  parent.
- For `+3`, ask: if the child were true, would it be a reason to believe the
  parent?
- For `-3`, ask: if the child were true, would it be a reason to disbelieve the
  parent?
- Judge support or opposition against the exact wording of the parent. If a
  child supports only a narrower, qualified, or reworded version of the parent,
  do not mark it as `+3` for the broader parent. Either revise the parent to
  match the qualified claim, make the child a `-3` objection to the broader
  claim, or introduce a narrower intermediate claim that the child supports.
- Do not nest a child merely because it is nearby, topically related, shares
  vocabulary, or supports a sibling.

## Review Pass

Before returning final output, silently check each child item:

- Is the item context-independent? (Can it be read and understood in isolation without any reference to its parent or siblings? Does it avoid pronouns or logical connectives like 'Even if', 'Although', or 'Therefore' that link it to parent statements?)
- Does it argue for or against the immediate parent, rather than a sibling or a
  different conclusion?
- Does the prefix match the direction of support or opposition?
- Are there any unsplit causal, consequential, or reasoning clauses (e.g. phrases containing 'because', 'so', 'therefore', 'since', 'implying', 'meaning that')?
- Has any meaningful causal phrase, metaphor, or implied intermediate claim been
  flattened away?
- Has anything been invented beyond what is present in or strongly implied by
  the input?

Revise the markdown until these checks pass.

## Example

Input:

```text
Joe: The sky is blue because it looks blue.

Carl: The sky is gray because it's cloudy.
```

Output:

```markdown
- 3 The sky is blue.
  - +3 The sky looks blue.
  - -3 The sky is gray.
    - +3 The sky is cloudy.
```
