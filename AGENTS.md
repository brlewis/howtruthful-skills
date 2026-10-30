# HowTruthful skills

This repo publishes agent skills under `skills/`. Before editing any of
them, read `skills/howtruthful-background/SKILL.md`: it defines the
statement graph, Pro/Con semantics, and import format that every other skill
relies on.

`.agents/skills` and `.claude/skills` are symlinks to `skills/`, so agents
working in this repo load the skills as you edit them.
