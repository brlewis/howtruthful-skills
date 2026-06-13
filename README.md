# Solve Debate

This is a response to
[FLF's Epistemic Case Study Competition](https://flf.org/epistack-competition/).

This is a repository of tooling and techniques to help people navigate complex
debatable statements. External to this repository,
[HowTruthful](https://www.howtruthful.com/) lets one navigate through an
argument map via hypertext, in a simpler and more information-dense format than
the usual lines and circles.

Within this repository, tooling supports the techniques below.

## Ingestion

Suppose you have a `whatever.md` file that's any freeform text. For example:

```
Joe: The sky is blue because it looks blue.

Carl: The sky is gray because it's cloudy.
```

You will use your favorite AI agent to transform this free-form text into a
structured markdown recursive list. The top level of the list will contain
ideally one (sometimes necessarily more than one) top-level idea that's being
debated. Evidence for a statement is nested underneath, prepended with `+3`, and
evidence against is nested underneath, prepended with `-3`. Each evidential
statement should be worded in a way that stands on its own, not with pronouns
that refer to the statement above it. The above example might be transformed
into the markdown below:

```
- The sky is blue.
  - +3 The sky looks blue.
  - -3 The sky is gray.
    - +3 The sky is cloudy.
```

With codex:

```
codex exec "$(cat prompt.md)" < whatever.md -o howtruthful.md
```

Then [import](https://www.howtruthful.com/private/import) the howtruthful
markdown.
