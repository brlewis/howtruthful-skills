---
name: "howtruthful-improvement"
description: "Use when explicitly asked to improve, strengthen, or add citations/objections to an existing HowTruthful markdown file, adding well-cited statements not present in its original source."
---

# HowTruthful Improvement

Add well-supported statements to an existing HowTruthful markdown file that
weren't in the material it was ingested from. Only run this skill when
explicitly asked to improve or strengthen a file — never automatically
after ingestion. See AGENTS.md for the markdown format, `+3`/`-3`
semantics, and bare-URL citation convention.

Unlike ingestion, which only structures what's already in the source and
never invents facts, this skill's entire job is adding new information from
outside the source. Every statement it adds must be backed by a citation.

## Workflow

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
5. Keep every added statement, and any parent it's nested under, at rating
   3 — this skill adds structure, not truthfulness judgments.
6. Write only markdown to the file itself; report what changed and why in
   your response to the user, not in the file.

## Review Pass

Before returning, check each added statement: does it stand alone without
needing its parent for context, does it directly bear on the specific node
it's nested under, does it have a citation, and is it still rated 3? If a
parent's wording was narrowed, also recheck its pre-existing children against
the new wording, not just the statement you added.
