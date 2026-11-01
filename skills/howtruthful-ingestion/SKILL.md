---
name: "howtruthful-ingestion"
description: "Use when making a HowTruthful argument map (recursive markdown) from debate text, a transcript, an article, a YouTube video, or just a topic, and optionally opening it in HowTruthful's import page."
---

# HowTruthful Ingestion

Convert source material into HowTruthful-compatible recursive markdown: an
argument map. The source can be freeform debate text, a transcript, an
article, a YouTube URL, or just a topic. For a topic alone, lay out the
arguments people actually make on each side, and treat that as the
freeform text below.

Before anything else, read the howtruthful-background skill, which defines the
statement graph, Pro/Con semantics, statement placement and wording rules,
and markdown format this skill relies on. If it isn't installed, stop and tell the user to install it
with `dx skills add brlewis/howtruthful-skills`.

Script paths below (`scripts/...`) are relative to this skill's own directory,
the one containing this SKILL.md, not to the current working directory.

## YouTube Sources

If the source material is a YouTube URL rather than text, first run:

```bash
scripts/fetch_youtube_transcript.ts <url>
```

This prints one line per caption fragment: a ready-to-use citation URL, a tab,
then the text spoken at that timestamp. Treat this output as the freeform
text input to the Conversion Workflow below, with one addition: every
statement built from a line in this output gets a citation child whose entire
content is that line's URL, copied verbatim.

The script's own successful fetch of the transcript is the trigger for
the howtruthful-background skill's bare-URL rating exception — rate each of
these citation children 5 rather than the default 3, since the video was
already confirmed reachable in the course of producing this output.

Never construct a `&t=` value by hand, adjust one to "round it out," or
estimate a timestamp from context (e.g. "this was said a few minutes in").
Copying the URL from the fragment containing the claim's key wording is the
only correct way to produce a citation timestamp — a hand-computed one is a
guess wearing a citation's clothes, and the discrepancy is invisible to a
reader until they click it and land in the wrong place.

If a claim's key wording spans more than one output line, cite the line
where the claim's core assertion starts, not where it completes — a
reader clicking the link should hear the assertion in full, from its own
start, even at the cost of a few seconds of irrelevant lead-in. Landing
partway through the assertion and missing part of it is worse than a
moment of run-up.

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
1. Merge statements with identical meaning per the howtruthful-background
   skill's identical-meaning rule.
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
   per the howtruthful-background skill's Examples rule, one per item, each
   independently citable — not a single statement naming all of them under
   one shared citation. This
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
- Place every child by the howtruthful-background skill's `+3`/`-3` test,
  word every claim by its no-reporting-frames rule, and cite sources per
  its bare-URL and "<Source> found/says <finding>" rules.

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
  Split an overlong one per the howtruthful-background skill's guidance
  rather than trimming content.

Revise the markdown until these checks pass.

## Import if asked

Once the markdown has been written, only if the user also asked it to be
imported, use the following command, substituting the markdown file written for
`file.md`.

```bash
scripts/howtruthful_import.ts < file.md
```

The script prints the import URL to stdout. Open that URL in the user's
browser, by whatever means your environment offers: a browser tool you
control, or by adding `--open` to the command above, which also opens the
URL in the user's default browser. The first run downloads an npm package,
and opening a browser launches a desktop program, so if your shell is
sandboxed, run the command outside the sandbox. If the browser can't be
opened, give the user the URL in a non-wrapped code block, along with the
path to the markdown file.

Never click Import, or otherwise submit the import page, yourself — leave
that to the user. They may already have private opinions in HowTruthful
that an import could touch, and only they can judge that.

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
