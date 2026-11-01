---
name: "howtruthful-background"
description: "Use before any other howtruthful-* skill, or when asked about HowTruthful's statement graph, Pro/Con semantics, statement wording rules, or markdown import format."
---

# HowTruthful Background

The other howtruthful-* skills (ingestion, improvement, merge) jump-start
humans' use of [HowTruthful](https://www.howtruthful.com/) to understand,
scrutinize, and assess the truthfulness of complex, debatable issues. This
skill holds the shared model they all rely on: how HowTruthful's statement
graph works, what belongs in Pro vs. Con, and the markdown import format.

## A graph of statements

HowTruthful relies on issues being broken up into individual,
context-independent statements. Each statement gets its own web page, where it
is called the "main statement". On this page are two sections linking to other
statements. The Pro section links to statements one might make when arguing that
the main statement is true. The Con section links to statements one might make
when arguing that the main statement is false. Humans click on a Pro or Con
statement to go to its own page, where it is the main statement and other
statements argue for or against it. Because HowTruthful is intended to be able
to express any reasoning, circular reasoning is allowed.

Unlike a formal debate organized around one central resolution, where every
argument is ultimately for or against that one resolution, HowTruthful has no
privileged top-level page. Every statement, no matter how deep in a chain of
reasoning, is itself a main statement on its own page, with its own
independent Pro and Con sections. A statement's Pro or Con status is only
ever relative to whichever statement's page it appears on — never to some
other statement higher up the chain, and never to whether it makes a reader
more or less confident about the topic as a whole.

When deciding whether a statement belongs in the Pro or Con section of
another, imagine you have navigated to that other statement's own page and
forgotten everything else in the chain, including the original top-level
claim. Ask only: on this page, with this statement as the main statement,
does the candidate argue that it's true or that it's false? If your
reasoning ever appeals to "this supports the overall conclusion" instead of
"this argues for or against what's on this specific page," that's a sign
you're answering the wrong question.

### Context-independent statements

Because each statement gets its own web page that can be linked to from
anywhere, it should be worded in a context-independent way. For example, suppose
the main statement is "John Doe stole the diamond." Statements one might make in
opposition to the main statement could be "The diamond was found missing from
the Smith Museum at noon on June 18, 2005" and "He didn't arrive until 2", the
second statement needs to be reworded in a context-independent way: "John Doe
didn't arrive at the Smith Museum until 2pm on June 18, 2005". Thus the second
statement can have its own web page where it can be scrutinized in isolation.

### Statements one might make when arguing

Evidence and counterevidence are the most obvious types of statement one might make when arguing. They affect the truthfulness of the main statement according to how true they are.

The Con section may contain counterevidence, or any other statement one might make when arguing against the main statement, such as one saying it is ambiguous. The Pro section may contain evidence, disambiguation, examples, or citations.

Disambiguation is when someone argues for an ambiguous statement by stating a possible meaning. For example, "A COVID lockdown would be a bad idea" might have a Pro statement of "A COVID lockdown's likely costs would outweigh its likely benefits." The ambiguous statement keeps its "3 - debatable" assessment regardless of the truthfulness of the disambiguation.

Examples are when statements themselves are examples of the main statement. "There are differing opinions about the color of the sky" might have as a Pro statement "The sky is green." Such statements lend truth to the main statement by their existence, regardless of how truthful they are.

When a general claim is really several examples bundled into one sentence (e.g. "X, Y, and Z have all shown this"), split each example into its own child statement with its own citation, rather than one statement citing several sources for several different examples at once. A citation only earns the trust a bare URL asks for if a reader can check it against one claim at a time — a statement backed by multiple citations for multiple bundled examples forces a reader to work out which source supports which example before they can check any of them.

Citations lend truth to the main statement only in combination with statements about the reliability of the source.

## Placing a child: the `+3`/`-3` test

In the import format below, a `+3` child is in its parent's Pro section and
a `-3` child is in its Con section.

- Each child must directly argue for or against its immediate parent.
- For `+3`, ask: would someone arguing for the parent say the child?
- For `-3`, ask: would someone arguing against the parent say the child?
- When nesting a child under a `-3` parent, apply the page model above:
  nothing on that parent's page shows the top-level claim or your overall
  stance on it. A rebuttal that restores confidence in the top-level claim
  is still `-3` relative to the `-3` concern it rebuts.
- Nest a child only for what it argues, never because it is nearby,
  topically related, shares vocabulary, or supports a sibling.
- Judge support or opposition against the exact wording of the parent. If a
  child supports only a narrower, qualified, or reworded version of the
  parent, do not mark it as `+3` for the broader parent. Either revise the
  parent to match the qualified claim, make the child a `-3` objection to
  the broader claim, or introduce a narrower intermediate claim that the
  child supports.
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

## Wording a claim: no reporting frames

State each claim directly, in the wording someone asserting it would use —
even when it is false or contested. Do not wrap it in a reporting frame
like "X argues that," "a popular belief holds that," or "critics claim
that." The `+3`/`-3` sign and the claim's position in the tree already mark
it as contested; a reporting frame turns the claim into a different, often
trivially true, statement about the belief's existence rather than the
belief itself.

If who holds the claim matters, add an **attribution child**: a `+3` child
of the claim saying who said it, e.g. "Joe said the sky looks blue," and
optionally its own bare-URL citation child (see below).

- An attribution child is still a statement and must be context-independent
  on its own — restate the claim (e.g., "Otto Rössler argued that a micro
  black hole produced by the LHC would grow and consume the Earth"), don't
  refer back to it as "this claim" or "this argument."
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

## Graph statements first, assess truthfulness later.

HowTruthful lets humans rate statements' truthfulness on a simple 5-point scale,
where 1 is false and 5 is true. Initially, every statement is presumed 3,
debatable. This is consistent with how courts decide complex cases. First sort
out what everyone is saying, then assess what's true after both sides' reasoning
is all laid out.

## The import format

HowTruthful can import markdown files that represent a graph of statements.
Top-level statements are prepended with their truthfulness rating. Pro children
are prepended with a plus sign and their truthfulness rating. Con children are
prepended with a minus sign and their truthfulness rating. Here's an example:

```
- 3 The sky is blue.
  - +3 The sky looks blue.
  - -3 The sky is gray.
    - +3 The sky is cloudy.
```

Children of a node of the graph are only included the first time that
node appears in markdown. Distinct nodes never have the exact same
statement. This allows cycles in the graph without requiring cycles in
the markdown.

Because exact text is what makes two nodes the same page, two statements
with identical meaning should be one statement: keep the most clearly
worded one, or the shorter one if they are worded equally well.

A statement's text is limited to 255 characters. A statement that runs
long usually has a claim and a reason bundled into one sentence — split
it the same way as any other causal statement: the conclusion becomes
the parent (or stays where the combined statement was), and the
supporting reason becomes a child.

## Citing a source with a bare URL

When a child statement is itself a source citation (e.g. an attribution leaf
under a statement), prefer a bare URL as that child's entire content, e.g.
`https://example.com/post/123`, rather than wrapping it in prose like
"According to https://example.com/post/123, ...". HowTruthful renders a child
that starts with `http` or `https` as a clickable link to that URL. Wrapping
it in a sentence loses that rendering and gains nothing: the parent statement
already says who said what, so the URL child's only job is to let a reader
verify the source in one click.

When a citation backs a specific interpretive, summarized, or quantitative
claim about what a source found (e.g. "over 90% odds," "found no
correlation"), rather than a bare fact unlikely to be mischaracterized,
insert an intermediate statement between the claim and the citation:
"<Source> found/says <finding>," the same pattern as an attribution child.
This gives a reader a node to dispute whether the source actually supports
that specific characterization, independent of whether the underlying
claim is true — a mismatch between what's claimed and what a source
actually says is otherwise invisible in the tree. Add the intermediate only
where it gives a reader something real to scrutinize, not for every
citation: a tree still needs actual leaf nodes.

## Rating a bare-URL citation

"Graph statements first, assess truthfulness later" (above) means an agent
should never assign truthfulness ratings to ordinary statements — that
judgment is a human's to make, and defaulting every statement to 3 is what
keeps the map neutral. A bare-URL citation child is a narrow, mechanical
exception: an agent that actually attempted to fetch the URL has direct,
first-hand evidence of one specific, non-debatable fact — whether the link
resolves — and rating that fact isn't the same kind of judgment call the
"assess truthfulness later" rule is protecting.

If the agent did not attempt to fetch the citation, leave it at the default
3. If it did attempt the fetch, rate the citation according to the outcome:

- Successfully fetched (the content behind the link actually loaded) → 5,
  true.
- A clean 404, or other definitive confirmation the resource doesn't exist
  at that address → 1, false.
- An access barrier that could well be temporary or specific to the
  fetching tool — a 403, a paywall, a login redirect, a timeout, a
  rate limit — leave at 3, debatable. This doesn't mean the link is bad;
  it means the agent couldn't tell either way, and 3 says exactly that.
- 2, dubious, is for a citation that responds but not in a way that
  inspires confidence it's the real resource — a redirect to an
  unrelated page, a "soft 404" that returns success but has no real
  content, a domain that's been repurposed. Use judgment; this is the one
  rating in this rule that isn't mechanical.

This rates the link itself, not the claim it's attached to, and not
whether its content actually supports that claim — a citation can be a
verified, reachable, perfectly real page (5) that still doesn't say what
the statement above it claims. That's a separate question, covered by the
howtruthful-improvement skill's citation audit.

