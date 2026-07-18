---
name: "howtruthful-ingestion"
description: "Use when converting freeform debate text into HowTruthful-compatible recursive markdown."
---

# HowTruthful Ingestion

Convert freeform debate text into HowTruthful-compatible recursive markdown. Use
this skill when the user asks to transform source material into an argument map
or HowTruthful markdown.

## YouTube Sources

If the source material is a YouTube URL rather than text, first run:

```bash
.agents/skills/howtruthful-ingestion/scripts/fetch_youtube_transcript.ts <url>
```

This prints one line per caption fragment: a ready-to-use citation URL, a tab,
then the text spoken at that timestamp. Treat this output as the freeform
text input to the Conversion Workflow below, with one addition: every
statement built from a line in this output gets a citation child whose entire
content is that line's URL, copied verbatim.

Never construct a `&t=` value by hand, adjust one to "round it out," or
estimate a timestamp from context (e.g. "this was said a few minutes in").
Copying the URL from the fragment containing the claim's key wording is the
only correct way to produce a citation timestamp — a hand-computed one is a
guess wearing a citation's clothes, and the discrepancy is invisible to a
reader until they click it and land in the wrong place.

If a claim's key wording spans more than one output line, cite the line
where the claim's core assertion is completed, not where it starts — a
reader clicking the link should immediately hear the statement being made,
not have to wait through a run-up.

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
1. Split a statement that bundles multiple examples into one sentence (e.g.
   "X, Y, and Z have all shown this") into separate sibling example children
   per AGENTS.md's Examples rule, one per item, each independently citable —
   not a single statement naming all of them under one shared citation. This
   applies even when a single citation happens to cover every example; the
   point is letting each example be checked and rated on its own, not just
   avoiding a citation mismatch.
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
  - When a citation backs a specific interpretive, summarized, or
    quantitative claim about what a source found (e.g. "over 90% odds,"
    "found no correlation"), rather than a bare fact unlikely to be
    mischaracterized, insert an intermediate statement between the claim
    and the citation: "<Source> found/says <finding>," the same pattern as
    attribution. This gives a reader a node to dispute whether the source
    actually supports that specific characterization, independent of
    whether the underlying claim is true — a mismatch between what's
    claimed and what a source actually says is otherwise invisible in the
    tree. Don't reach for this by reflex: a tree still needs actual leaf
    nodes, so only add the intermediate where it gives a reader something
    real to scrutinize, not for every citation.
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
  - This applies just as much to a formal, first-person source — a written
    decision, report, or expert opinion saying "I found that..." or "I
    concluded..." — as it does to a casual dialogue. The formal register
    makes the reporting frame read like substance rather than attribution to
    strip, but the same collapse happens: a reader ends up rating whether
    the person said it, not whether the underlying claim is true, and a
    claim that would otherwise stand on its own gets an unearned pass from
    the source's credentials. The exception is a claim that's genuinely
    about the person's own reasoning process rather than a claim about the
    world they happen to be reporting — "the judge weighted the location
    evidence most heavily in reaching their decision" is irreducibly about
    that judge and doesn't need de-attributing.

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
- Is a reporting frame ("X found that," "X argues that," "X concluded that")
  baked into a claim's own wording instead of demoted to a separate
  attribution child? This is easy to miss when the source material is a
  formal first-person document (a decision, report, or expert opinion)
  rather than a casual dialogue, since the frame reads like part of the
  substance rather than attribution to strip.
- Are there any unsplit causal, consequential, or reasoning clauses (e.g.
  phrases containing 'because', 'so', 'therefore', 'since', 'implying', 'meaning
  that')?
- Does any statement still bundle multiple examples that should be separate,
  independently citable siblings instead?
- Has any meaningful causal phrase, metaphor, or implied intermediate claim been
  flattened away?
- Has anything been invented beyond what is present in or strongly implied by
  the input?
- Is every statement (excluding bare-URL citations) 255 characters or fewer?
  Split an overlong one per AGENTS.md's guidance rather than trimming content.

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

A formal, first-person source gets the same treatment as Joe and Carl above:
extract the direct, object-level claim, and demote the "I found/concluded"
framing to an attribution child rather than letting it become the node's own
wording.

Input:

```text
Judge's decision: I found that the lab-leak side's evidence contained
several internal inconsistencies.
```

Output:

```markdown
- 3 The lab-leak side's evidence contained several internal inconsistencies.
  - +3 The judge said the lab-leak side's evidence contained several internal inconsistencies.
```
