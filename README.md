# Solve Debate

This is a response to
[FLF's Epistemic Case Study Competition](https://flf.org/epistack-competition/).

This is a repository of tooling and techniques to help people navigate complex
debatable statements. External to this repository,
[HowTruthful](https://www.howtruthful.com/) lets one navigate through an
argument map via hypertext, in a simpler and more information-dense format than
the usual lines and circles. You may want to go there and construct arguments
manually before using this repo so that later you know how to quickly and easily
edit AI-generated arguments.

Within this repository, tooling supports the techniques below.

## Ingestion

Suppose you have a `whatever.md` file that's any freeform text. For example:

```
Joe: The sky is blue because it looks blue.

Carl: The sky is gray because it's cloudy.
```

This repository includes an agent skill at
`.agents/skills/howtruthful-ingestion/SKILL.md`. With most command-line AI
agents, you should be able to do something like this:

```
Use the howtruthful-ingestion skill to convert whatever.md into howtruthful.md.
```

You can also ask the agent to create a new debate from a short topic description
and write it directly to a markdown file:

```
Use the howtruthful-ingestion skill to discuss why AI should and shouldn't be
used to assess what's true, then put the result into ht4-test.md.
```

Then [import](https://www.howtruthful.com/private/import) the howtruthful
markdown. Reword, rearrange, and rate the statements as you see fit.
