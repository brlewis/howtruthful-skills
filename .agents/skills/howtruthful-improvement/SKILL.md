---
name: "howtruthful-improvement"
description: "Use when explicitly asked to improve, strengthen, audit, or add citations/objections to an existing HowTruthful markdown file — either adding well-cited statements not present in its original source, or checking that existing bare-URL citations actually support the statement they're attached to."
---

# HowTruthful Improvement

Strengthen an existing HowTruthful markdown file in two ways: add
well-supported statements that weren't in the material it was ingested
from, and audit its existing bare-URL citations to check they actually
support the statement each is attached to. Only run this skill when
explicitly asked to improve, strengthen, or audit a file — never
automatically after ingestion. See AGENTS.md for the markdown format,
`+3`/`-3` semantics, and bare-URL citation convention.

Unlike ingestion, which only structures what's already in the source and
never invents facts, adding statements is this skill's job of bringing in
new information from outside the source — every statement it adds must be
backed by a citation. Auditing is the opposite direction: checking that
citations already in the file earn the trust a bare URL implicitly asks a
reader for.

## Adding Statements

1. Read the existing file and look for gaps:
   - A vague quantifier ("moderate," "regularly," "excessive," "safe
     levels") that a specific researched threshold could replace. Nest the
     quantified claim as an intermediate claim under the vague one, per the
     disambiguation rule in the howtruthful-ingestion skill's SKILL.md —
     don't just reword the vague parent. That rule also requires re-checking
     the vague parent's *existing* children against the new, narrower
     wording: a child that supported the broader parent may not support the
     narrower one, and belongs back under the broader parent instead of
     riding along by default.
   - A claim resting on a recognizable evidence type (cohort study, RCT,
     biomarker/surrogate endpoint, self-report, industry-funded study,
     single case study, expert citation with no reliability statement) that
     lacks the standard methodological objection for that type.
   - A predictor of variation the debate implies but doesn't state (e.g.
     "what predicts whether this differs by person?").
   - A popular, notable, or historically significant claim related to the
     debate that isn't captured yet — including one you know or suspect is
     false. HowTruthful lays out what people are actually saying before
     assessing truth, so a well-known false claim is a gap just as much as a
     missing true one.
2. Research each gap and write one context-independent, unambiguous
   statement per gap, worded per the claim-wording rule in the
   howtruthful-ingestion skill's SKILL.md: state the claim directly, as
   someone asserting it would, even when it's false — never wrap it in a
   reporting frame like "X argues that" or "a popular belief holds that."
   The `+3`/`-3` sign already marks it as contested; put attribution, if it
   matters, in its own child instead. Never add a hedge or a vague qualifier.
3. Nest each new statement as a `+3` or `-3` child of the specific existing
   node it actually supports or objects to — not at the root, and not on a
   node it doesn't bear on.
4. Give every new statement a bare-URL citation child. A statement this
   skill adds without a citation is a defect, not an oversight to fix later.
   If the citation backs a specific interpretive or quantitative claim about
   what the source found (a study's percentage, a paper's conclusion), use
   the intermediate-statement pattern in the howtruthful-ingestion skill's
   SKILL.md ("<Source> found/says <finding>") instead of citing directly —
   this skill's whole job is bringing in outside claims, so misreading what
   a source actually says is a real risk, and the intermediate is what makes
   that risk visible and disputable rather than silently baked in.
5. Keep every added statement, and any parent it's nested under, at rating
   3 — this skill adds structure, not truthfulness judgments.
6. Write only markdown to the file itself; report what changed and why in
   your response to the user, not in the file.

## Auditing Citations

For every bare-URL citation already in the file, check that its source
actually supports the exact statement it's a child of — not just the same
general topic, but every specific clause, named example, or qualifier the
statement contains.

1. Fetch each cited source and read it for the specific claim its parent
   statement makes, checking named details individually rather than
   skimming for topical overlap. A source backing "cannot rule out
   confounding, such as X or Y" needs X and Y to actually appear in it, not
   just confounding in general — a plausible-sounding example bundled into
   an otherwise-supported sentence is easy to miss without checking each
   piece separately.
2. Watch especially for these mismatch patterns, since they read as
   support at a glance:
   - The source supports the statement's general claim but not a specific
     named example or qualifier riding along inside it.
   - The source addresses the same question but argues the *opposite* of
     what the statement claims — e.g. it ran a test specifically to check
     for a concern and reports that concern didn't materialize, which is
     evidence against the concern, not a concession that it "cannot be
     ruled out."
   - The source discusses a different specific case (a different
     mechanism, population, or object) than the one named in the
     statement, even though both fall under the same broad topic.
3. When a citation only partly supports its statement, or supports a
   different statement than the one it's attached to, report the mismatch
   to the user with the specific source text that reveals the gap, and
   propose a fix matched to which mismatch pattern it is:
   - For a statement bundling multiple examples where the citation only
     covers some of them, the fix is splitting per AGENTS.md's Examples
     rule — one sibling statement per example, each with its own citation
     — not adding a second citation to the same combined statement. Two
     citations under one statement still leaves a reader to work out which
     one backs which example; splitting is what actually removes the
     tedium, not just papers over the mismatch.
   - For a source arguing the opposite of the statement, or covering a
     different specific case than the one named, the fix is narrowing the
     statement to what the citation actually supports or replacing the
     citation with one that covers the full claim as worded.
   This skill only applies the fix once the user confirms which one they
   want — auditing checks content that's already in the tree, and unlike
   adding a brand-new statement, changing existing wording isn't this
   skill's call to make alone.

## Review Pass

Before returning, check each added statement: does it stand alone without
needing its parent for context, does it directly bear on the specific node
it's nested under, does it have a citation, and is it still rated 3? If a
parent's wording was narrowed, also recheck its pre-existing children against
the new wording, not just the statement you added. Is the new statement
(excluding any bare-URL citation) 255 characters or fewer — if not, split it
per AGENTS.md's guidance rather than trimming content.

For every citation audited, was every named clause or example in its
statement — not just the general topic — actually checked against the
source's text? Was every mismatch reported with the specific source
passage that reveals it, and left unfixed until the user chose an option,
rather than silently rewritten?
