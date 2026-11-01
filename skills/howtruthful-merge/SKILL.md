---
name: "howtruthful-merge"
description: "Use when asked to merge one HowTruthful markdown file's statements into another, so overlapping, paraphrased, or contrary/contradictory claims from independently-authored sources compound into one tree instead of duplicating."
---

# HowTruthful Merge

Merge `y.md` into `x.md`: statements in `y.md` that mean the same thing as a
statement already in `x.md` become that same statement (exact text match is
what makes two nodes the same page); statements that contradict one already
in `x.md` — in the strict sense below, not just disagree with it — get
folded in with their support flipped; everything else is grafted in as new,
untouched material.

Before anything else, read the howtruthful-background skill, which defines
the statement graph, Pro/Con semantics, statement placement and wording
rules, and markdown format this skill relies on. If it isn't installed,
stop and tell the user to install it with
`dx skills add brlewis/howtruthful-skills`.

This skill relies on the background skill's page model, `+3`/`-3` test,
and identical-meaning rule.

Only run this skill when explicitly asked to merge one file into another.

## Contrary vs. contradictory

This skill leans on a distinction that's easy to blur: two statements A and
B are **contradictory** only if exactly one of them must be true — no third
possibility exists where both are false. Two statements are merely
**contrary** if they can't both be true, but could both be false, because
some third option is still on the table.

"COVID came from a zoonotic spillover at the wet market" and "COVID came
from a lab leak" are contrary, not contradictory: they can't both be true,
but a third origin theory could make both false. Evidence against the
lab-leak claim isn't automatically evidence for the spillover claim — it
could instead be evidence for that third theory — so a correct tree keeps
the lab-leak claim as its own intact page, attached as a plain `-3` child of
the spillover statement, rather than dissolving it and redistributing its
arguments. That's exactly how this skill treats any contrary match (see
Contrary below): the statement stays intact.

Genuine contradictories are rarer, because they require actively ruling out
a third possibility, not just checking that both can't be true. "The coin
landed heads" and "the coin landed tails" are contradictory only once
"landed on its edge" and "didn't land" are excluded. Reserve the
contradictory classification for cases this confident — when in doubt,
classify as contrary instead. Contrary is the safe default: it requires no
comparable proof that a third possibility is excluded, only that the
statement counts as evidence against the match.

## Workflow

1. Read `x.md` and `y.md` in full. In a single pass over both, produce a
   candidate shortlist for every `y.md` statement at once: a handful of
   `x.md` statements each one is most likely related to. Do this as one
   holistic judgment covering the whole file pair, not a separate step per
   `y.md` statement and not a separate comparison per pair — either of those
   costs the same as comparing every statement in `y.md` against every
   statement in `x.md` one at a time, just spread across many small steps
   instead of paid for once. A single batched pass keeps that cost bounded
   regardless of how either file is sized, and — unlike swapping in a
   fixed non-LLM similarity metric to bound the cost instead — stays exactly
   as good at the judgment as whatever model is running it.

   If `x.md` and `y.md` are together too large for one such pass to hold
   comfortably, split `y.md`'s statements into chunks and repeat this step
   once per chunk — never once per statement. A cheap, non-semantic
   pre-filter (e.g. shared keywords) may narrow which `x.md` statements are
   even offered as candidates within a chunk, but only to keep chunks small;
   the actual similarity judgment still happens in this single per-chunk
   pass, not in the pre-filter. A pre-filter that misses a true candidate
   just falls through to No match below, which is already the safe default
   when a statement's status is uncertain — so an imperfect pre-filter costs
   accuracy only at the margin, never causes a wrong classification.
2. Walk `y.md`'s tree top-down, one root statement at a time. For each
   statement not yet placed:
   1. Take this statement's shortlist from step 1, plus — if its `y.md`
      parent was itself merged into an `x.md` node in a prior step — that
      node's existing children specifically, since they're especially
      likely candidates that step 1 couldn't have known about in advance.
   2. Classify the statement against its shortlist as exactly one of:
      - **Identical**: same meaning as an `x.md` statement, per the
        identical-meaning rule in the howtruthful-background skill.
      - **Contradictory**: exactly one of this statement and an `x.md`
        statement can be true — see Contrary vs. contradictory above. Use
        this only when confident no third possibility exists.
      - **Candidate-equivalent**: plausibly the same meaning as an `x.md`
        statement, but not confidently identical (a hedge, a narrower or
        broader scope, or genuine ambiguity about whether it's the same
        claim).
      - **Contrary**: counts as evidence against an `x.md` statement —
        including a contradictory candidate you're not fully confident in,
        since contrary is the safe fallback for any not-confidently-exhaustive
        case.
      - **No match**.
   3. For a candidate-equivalent only, apply one more test before accepting
      it: if this statement were true, is it actually a reason to believe
      the matched `x.md` statement — not merely a similar-sounding
      restatement of it, and not merely topically related. This is stricter
      than the background skill's `+3` test on purpose: someone arguing for
      a statement might well restate it, so that test alone would let a
      restatement through. A candidate-equivalent that fails this test
      is not evidence for the matched statement; reclassify it as no match.
      Contrary needs no equivalent check: the classification itself already
      requires that the statement counts as evidence against its match, so
      there's no version of "contrary on similarity alone" to guard against
      the way there is on the Pro side.
   4. Attach according to the classification:
      - **Identical**: reword this `y.md` statement to exactly match the
        `x.md` statement's text, so they become the same node. Its own
        existing children keep their original `+3`/`-3` signs — a
        same-meaning reword doesn't change what they support or oppose —
        and are then merged into that `x.md` node's existing children,
        recursively repeating this whole workflow with that node's children
        as the new local shortlist source.
      - **Contradictory**: fold this statement's immediate children into
        the matched `x.md` statement with their signs flipped, but only the
        children that pass the background skill's `+3`/`-3` test against
        the `x.md` statement once flipped: a `-3` child becomes a `+3`
        child of the `x.md` statement if someone arguing for the `x.md`
        statement would say it, and a `+3` child becomes a `-3` child if
        someone arguing against the `x.md` statement would say it.
        Counterevidence passes, since by the contradictory relation an
        argument that this statement is false is an argument that the
        `x.md` statement is true. A child that only casts doubt on this
        statement, such as one saying it is ambiguous, does not pass: the
        `x.md` statement, its contradiction, is ambiguous in the same way.
        If every child moves, create no node for this statement. Otherwise,
        attach it as a `-3` child of the `x.md` statement, with the children
        that didn't move still under it, signs unchanged.
        Only the immediate children flip sign this way; each flipped
        child's own descendants keep their original signs unchanged, since
        those are still correctly signed relative to their own immediate
        parent, not to the `x.md` statement two levels up.
      - **Candidate-equivalent (passing the relevance test)**: attach this
        statement, with its existing subtree unchanged beneath it, as a new
        `+3` child of the matched `x.md` statement.
      - **Contrary**: attach this statement, with its existing subtree
        unchanged beneath it, as a new `-3` child of the matched `x.md`
        statement. Nothing about it is reworded or flipped — it stays
        exactly as legible on its own as it was in `y.md`.
      - **No match**: leave it where `y.md`'s own structure already puts
        it — attached under whichever `y.md` parent it had, wherever that
        parent ended up landing.
   5. Recurse into this statement's children next, using whatever it just
      became attached to (a merged `x.md` node, a flipped-in position, a new
      Pro/Con leaf, or its unmatched `y.md` parent) as their attachment
      point.
3. Write the merged result to `x.md`. Every statement originally in `y.md`
   must end up somewhere in the output — none silently dropped.
4. Report a tally to the user, not the file: how many statements were merged
   as identical, folded in as contradictory, attached as candidate-Pro, and
   attached as Contrary-Con, plus how many were left as no-match/new
   material. List the candidate-equivalent and contradictory attachments
   specifically, since those carry the most inferential weight and are the
   ones most worth a quick human look; plain Contrary attachments need no
   such flag, since nothing about them was inferred beyond "this argues
   against that."

## Review Pass

Before returning, check:

- Does every reworded "identical" statement's new text exactly match the
  `x.md` node it merged into, character for character?
- For every "contradictory" fold-in, is a third possibility genuinely ruled
  out — not just "these two can't both be true"? If there's any doubt,
  reclassify as contrary instead, which needs no such guarantee.
- For every contradictory fold-in that did proceed, did only the immediate
  children flip sign — not their descendants too? Did each flipped child
  pass the `+3`/`-3` test against the `x.md` statement, with the rest left
  under the contradictory statement?
- Does every statement attached as a candidate-equivalent Pro actually pass
  the "if true, is this a reason to believe the parent" test, rather than
  being attached on similarity alone?
- Is every statement from `y.md` accounted for somewhere in the merged
  output?
- Do any reworded statements still respect the 255-character limit (per
  the howtruthful-background skill)?
