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

Use your favorite AI command-line tool to produce such a file:

```
# Claude Code
claude -p "$(cat prompt.md)" < whatever.md > howtruthful.md

# Codex
codex exec "$(cat prompt.md)" < whatever.md -o howtruthful.md
```

### Using the agent skill

This repository also includes an agent skill at
`.agents/skills/howtruthful-ingestion/SKILL.md`. If your agent supports local
skills, make that skill available to the agent and ask it to convert a source
file into HowTruthful markdown. For example:

```
Use the howtruthful-ingestion skill to convert whatever.md into howtruthful.md.
```

The skill is intended to use the repository context in `AGENTS.md`, including
the meaning of context-independent statements, the initial truthfulness rating
of `3`, and the HowTruthful import format.

Then [import](https://www.howtruthful.com/private/import) the howtruthful
markdown.
