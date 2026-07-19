I've read the full winner tree, `epistack2026.md`, `AGENTS.md`, `README.md`, and
all three skills (`howtruthful-ingestion`, `howtruthful-improvement`,
`howtruthful-merge`), plus both LessWrong posts. Cross-referencing the tree in
[examples/epistack-howtruthful-winner.md](examples/epistack-howtruthful-winner.md)
against what the organizers actually said they want, here's what I find.

## Undersold strengths

**The merge skill's duplicate/contradiction handling is nearly invisible.** The
announcement explicitly asks for "identifying duplicate claims across sources"
(ingestion) and "capturing similar but not identical claims" (structure).
[`howtruthful-merge/SKILL.md`](.agents/skills/howtruthful-merge/SKILL.md) is a
genuinely sophisticated answer — it distinguishes _identical_ / _contradictory_
/ _candidate-equivalent_ / _contrary_ / _no-match_, with a formal test for
contrary-vs-contradictory (does a third possibility exist?) before ever flipping
a sign. In the tree this shows up as one thin, uncited bullet:
[examples/epistack-howtruthful-winner.md#L58](examples/epistack-howtruthful-winner.md#L58)
("adversarial scrutiny leads to incremental sources that can be merged...").
That's a $50k-tier capability reduced to a throwaway line.

**Attribution-stripping is absent entirely.** [README.md](README.md)'s
"Attribution" section — strip speaker identity by default so a claim isn't
judged by "the speaker's politics, personality, or track record," with
attribution addable back as its own scrutinizable child — is a direct,
well-motivated answer to the followup post's worry about "adversarial
information environments" and political contamination of evidence. It's not
mentioned anywhere in the winner tree.

**The bare-URL reliability-rating mechanic is uncited.**
[AGENTS.md#L106-138](AGENTS.md#L106) defines a specific, mechanical
confidence-calibration scheme (5 if fetched successfully, 1 on clean 404, 3 if
ambiguously blocked, 2 if "responds but doesn't inspire confidence") that's
explicitly separate from whether the citation supports its claim. This is a real
answer to "calibrating confidence accounting for out-of-model error" from the
followup post, and it's simply not in the tree — only the content-fidelity half
(`howtruthful-improvement`'s citation audit) gets a bullet, at
[examples/epistack-howtruthful-winner.md#L14](examples/epistack-howtruthful-winner.md#L14).

**No self-demonstration is cited anywhere.** Nearly every meta-claim about the
submission — "handled the three case studies fine"
([#L38](examples/epistack-howtruthful-winner.md#L38)), "produces an artefact
another team could pick up and extend"
([#L44](examples/epistack-howtruthful-winner.md#L44)), "surfaces sub-problems...
organizers had missed" ([#L75](examples/epistack-howtruthful-winner.md#L75)) — is
a bare assertion with no citation into this repo's own artifacts. That's a
missed opportunity, not just a stylistic gap: this very repo just went through a
live example of exactly what "faithful to evidence" and "failure modes named and
bounded" mean in practice — a citation-timestamp rule was found to point at the
wrong moment in a video, the rule was flipped, every timestamp re-derived from
fresh transcripts, and one citation was dropped outright because on inspection
it didn't actually support its claim. That's the tool catching and fixing its
own error under scrutiny — the single most concrete evidence available for
"resists being gamed" and "outputs withstand... interrogation" — and it isn't
cited.

**The root's weakest-rated branch may be its best argument.** "Shifts how
contest organizers think about the problem itself"
([#L74](examples/epistack-howtruthful-winner.md#L74)) is rated +3 — the lowest
top-level score in the tree — with all three children also flat +3 and zero
citations. But `epistack2026.md`'s hypertext-vs-circles-and-arrows argument
(calling out Scott Alexander by name for missing it) is genuinely the most novel
claim in the whole submission — exactly the "truly inspiring... changes how we
think about the problem" register the $50k tier is described in. Rating it the
weakest branch undersells it relative to how it's actually framed elsewhere in
the submission's own prose.

**Adoption skepticism isn't preempted, even though the organizers handed a
lenient bar.** The followup post concedes "base rates aren't great" for adoption
but accepts targeted use by "discerning audiences" as a fallback success
condition. Nothing in the tree stakes a claim to that fallback — a free,
low-cost node to add.

## Weaknesses needing shoring up

**No source-quality filtering, unrebutted.**
[examples/epistack-howtruthful-winner.md#L15](examples/epistack-howtruthful-winner.md#L15)
— "will ingest evidence from any source and present it in similar or identical
wording to the original" — sits directly under "faithful to evidence" with no
child addressing it at all. Given the organizers' explicit worry about
adversarial information environments, an unanswered "garbage in, garbage out"
concession under your headline evidentiary-integrity claim is a real exposed
flank.

**Three separate "doesn't compute X" cons, and the rebuttal that exists is
stranded elsewhere.** Lines [#L18](examples/epistack-howtruthful-winner.md#L18),
[#L23](examples/epistack-howtruthful-winner.md#L23), and
[#L34](examples/epistack-howtruthful-winner.md#L34) all hit the same gap (nothing
is computed, only made spottable) under "surfaces what matters" — each
unrebutted at that location. Yet a real rebuttal already exists three branches
away, at [#L52-54](examples/epistack-howtruthful-winner.md#L52) ("human scrutiny
is the end purpose... wrong to call the end purpose a bottleneck"). AGENTS.md's
own reuse mechanism (identical statement text = identical node) makes it trivial
to graft that same rebuttal in as a child at all three locations — this is a
structural fix, not new content.

**The Bayesian-incompatibility con has a ready-made rebuttal sitting in the same
submission, unused.** [#L48](examples/epistack-howtruthful-winner.md#L48) says the
discrete 5-point scale is "likely incompatible" with tools that model truth as
Bayesian probabilities. But the bundled COVID case study is _itself_ a live
demonstration of naive Bayesian point-estimates going badly wrong — Rootclaim's
model and five independent analysts' Bayesian re-estimates span 23 orders of
magnitude on the same evidence (see
[debate-covid-judges.md#L49](debate-covid-judges.md#L49)). A discrete,
human-judged scale sidesteps exactly that false-precision failure mode. This is
a two-for-one fix sitting unused two files away.

**The "surfaces" self-own.** [#L35](examples/epistack-howtruthful-winner.md#L35) —
"'surface' means point out explicitly, not merely make easy to spot" — is a
sharp semantic objection to the parent's own wording, left standing. Given the
whole submission is built on catching exactly this kind of overclaiming word
choice in _other people's_ arguments, leaving it unaddressed in your own is the
kind of thing an adversarial judge notices first. Cheapest fix: revise
"surfaces" to "makes it easy to spot" throughout, or add a rebuttal
distinguishing the two senses.

**The youtube-only citation limitation gets no mitigation.**
[#L41](examples/epistack-howtruthful-winner.md#L41) sits under "not narrowly
overfit" with no discussion of whether the same transcript-timestamp approach
could extend to podcasts, PDFs with page numbers, etc. — leaving a real question
about generalization unanswered right where "generalizes" is the organizers' own
stated criterion.
