# Skill evals

Regression tests for the skills. Running one command shows whether a change to
a SKILL.md made Claude's output worse.

**These results cover Claude only.** A pass says nothing about Codex, Gemini, or
any other agent.

## Running

| Task | Cases | Runs per case | When |
|---|---|---|---|
| `deno task eval` | 6 fast | 3 per version | everyday edits |
| `deno task eval:full` | 8 (fast + slow) | 3 per version | before merging a SKILL.md trim |
| `deno task eval:noise` | 6 fast | 3 per version | after changing the model, a rubric, or a case |
| `deno task test` | none | none | after changing the harness; free |

The eval tasks need `claude` signed in, and the `flf-epistack-2026` tag, which
the cases read their inputs from. They spend real money, up to the cap in
`evals/run.ts`.

Options: `--case <glob>`, `--runs <n>`, `--budget <usd>`, `--base <ref>`, and
`--skills <dir>` to test a scratch copy of `skills/` instead of the working tree.

Each run writes to `evals/results/<timestamp>/`, which git ignores. Paste
`summary.md` into any PR that changes a SKILL.md. The exit code is 0 for no
regression, 1 for a regression, and 2 for an incomplete run.

## How a comparison works

`evals/run.ts` stages two throwaway worktrees of `main` and replaces `skills/` in
one with the working tree's. Both get the working tree's suite, so `skills/` is
the only difference. They run side by side, so a difference points to the skill
change rather than to model drift. Saved results are history, not the comparison
point.

`claude plugin eval` has no script grader and no comparison, so `run.ts` adds
both. After each version finishes it reads each run's `output.md`, runs
`evals/check.ts` on it, and compares the versions with `evals/compare.ts`.

## What counts as worse

- Any new script-check failure in a case is a regression.
- A rubric score is a regression only if that rule drops by more than the gap in
  `evals/noise.json`, which is the largest gap seen between two runs of
  unchanged `main`. Scores are compared per rule, never as one average.
- A run that never loaded the skill reports as `not-triggered`, apart from the
  rule scores.
- A missing `output.md` is a failed run.
- A run stopped by the cost cap, or one that errored, reports as incomplete, not
  as a low score.

## Measuring noise

Each `deno task eval:noise` adds one measurement, and `noise.json` keeps each
rule's largest gap, because a single measurement can understate it. After
changing the model, a rubric, or a case, delete `noise.json` and run the task at
least twice.

## Layout

- `cases/<name>/`: `prompt.md` and `case.json`. `run.ts` turns these into the
  layout `claude plugin eval` reads, so run the suite through `run.ts`.
- `rubric/<rule>.md`: one model-graded rule per file, shared by the cases that
  list it. A case's `judgeContext` is added to each rubric it uses.
- `fixtures/`: text written for this suite. Inputs marked `tag:` are read from
  the `flf-epistack-2026` tag at run time, so third-party text stays out of
  MIT-licensed `main`.

Case inputs are new text of the same shape as the skills' examples, because a
model can pass the examples themselves by copying. `sky` is the exception: it's
a smoke test only, since the SKILL.md contains its answer.

Prompts are natural requests that don't name the skill. Each case can use only
`Read`, `Write`, `Glob`, `Grep`, and `Skill`, so runs can't reach the network or
call the import script.

The improvement skill has no cases yet, because its citation audit needs offline
fixtures. Leave its text alone until it does.
