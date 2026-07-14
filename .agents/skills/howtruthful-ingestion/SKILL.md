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
1. Discard speaker/source attribution (e.g., 'Joe:', 'Carl:') by default, in
   order to reduce politicized, personal, or motivated reasoning. Only add
   attribution back in, as a child leaf of the statement it attaches to, if the
   user specifically asks for it: 'with attribution' in the initial request, or
   'add attribution' in a subsequent request. See Example below.
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
- When nesting a child under a `-3` parent, imagine you've navigated to that
  parent's own page (see AGENTS.md's page model) — nothing there shows the
  top-level claim or your overall stance on it. Test the child only against
  what's on that page. A rebuttal that restores confidence in the top-level
  claim is still `-3` relative to the `-3` concern it rebuts.
- Judge support or opposition against the exact wording of the parent. If a
  child supports only a narrower, qualified, or reworded version of the parent,
  do not mark it as `+3` for the broader parent. Either revise the parent to
  match the qualified claim, make the child a `-3` objection to the broader
  claim, or introduce a narrower intermediate claim that the child supports.
  - Disambiguation: if the parent is genuinely ambiguous (has more than one
    plausible meaning) and the child is stating one specific meaning, always
    use the intermediate-claim option, not the other two. Revising the parent
    would silently discard its other readings; marking the child `-3` makes no
    sense when it isn't opposing anything. The child's own wording, unchanged,
    becomes the intermediate claim itself (no separate node needed above it),
    nested directly under the ambiguous parent.
  - Whenever a parent's wording is replaced or narrowed by an intermediate
    claim, re-run this test on each of that parent's *existing* children
    too, not just the new one — do not leave them in place by default. A
    child that supported the old, broader wording may no longer support the
    new, narrower one, and belongs back under the broader parent instead.
- Do not nest a child merely because it is nearby, topically related, shares
  vocabulary, or supports a sibling.
- A child's content is normally a context-independent statement. The one
  exception is a source-citation child (see attribution in Conversion
  Workflow above): its entire content may instead be a bare URL, e.g.
  `https://example.com/post/123`, with no surrounding prose. HowTruthful
  renders a child that starts with `http` or `https` as a clickable link, so
  do not wrap it in a sentence like "According to https://...".
- State each claim directly, in the wording someone asserting it would use —
  even when it is false or contested. Do not wrap it in a reporting frame
  like "X argues that," "a popular belief holds that," or "critics claim
  that." The `+3`/`-3` sign and the claim's position in the tree already mark
  it as contested; a reporting frame turns the claim into a different, often
  trivially true, statement about the belief's existence rather than the
  belief itself. If who holds the claim matters, add it as a separate
  attribution child (see attribution in Conversion Workflow above) instead of
  folding it into the claim's own wording.
  - An attribution child is still a statement and must independently pass
    the context-independence check below — restate the claim (e.g., "Otto
    Rössler argued that a micro black hole produced by the LHC would grow
    and consume the Earth"), don't refer back to it as "this claim" or "this
    argument."

## Review Pass

Before returning final output, silently check each child item:

- Is the item context-independent? (Can it be read and understood in isolation
  without any reference to its parent or siblings? Does it avoid pronouns or
  logical connectives like 'Even if', 'Although', or 'Therefore' that link it to
  parent statements?) Skip this check for a bare-URL source-citation child.
- Does it argue for or against the immediate parent, rather than a sibling or a
  different conclusion?
- Does the prefix match the direction of support or opposition? Would a
  reader who only ever sees the parent's own page — never the top-level
  claim, never your overall stance on the topic — place this item in Pro or
  Con on that page?
- Are there any unsplit causal, consequential, or reasoning clauses (e.g.
  phrases containing 'because', 'so', 'therefore', 'since', 'implying', 'meaning
  that')?
- Has any meaningful causal phrase, metaphor, or implied intermediate claim been
  flattened away?
- Has anything been invented beyond what is present in or strongly implied by
  the input?

Revise the markdown until these checks pass.

## Import if asked

Once the markdown has been written, only if the user also asked it to be
imported, use the following command, substituting the markdown file written for
`file.md`.

```bash
.agents/skills/howtruthful-ingestion/scripts/howtruthful_import.ts < file.md
```

The script outputs the import URL to stdout. The agent must then open this URL
in the user's browser by running `python3 -m webbrowser URL`. If browser
launching fails, the agent must print the URL to the user in a non-wrapped code
block.

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

When attribution is requested (see Conversion Workflow above), the output would be as follows:

```markdown
- 3 The sky is blue.
  - +3 The sky looks blue.
    - +3 Joe said the sky looks blue.
  - -3 The sky is gray.
    - +3 The sky is cloudy.
      - +3 Carl said the sky is cloudy.
```

Added attribution could also be raw URLs.

```markdown
- 3 HowTruthful is a tool for exploring arguments and reasoning.
  - +3 Bruce Lewis said HowTruthful is a tool for exploring arguments and reasoning.
    - +3 https://mastodon.social/@brlewis/115293039892074161
```
