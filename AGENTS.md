# HowTruthful skills

This repo publishes agent skills under `skills/`. Before editing any of
them, read `skills/howtruthful-background/SKILL.md`: it defines the
statement graph, Pro/Con semantics, and import format that every other skill
relies on.

`.agents/skills` and `.claude/skills` are symlinks to `skills/`, so agents
working in this repo load the skills as you edit them.

Any PR that changes a SKILL.md must include an eval comparison summary. At
minimum, run `deno task eval:quick --case <name>` for the changed skill's
cases. Don't run `deno task eval`, `eval:full`, or `eval:noise` unless the user
asks: they can use up the user's plan limit. See `evals/README.md`.
