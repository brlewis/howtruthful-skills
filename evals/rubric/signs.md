---
type: llm
focus: {source: file, path: output.md}
---

In this format, `+3` means Pro and `-3` means Con, each relative to the immediate parent only. Pass only if every child's sign matches what someone arguing for (`+3`) or against (`-3`) that exact parent statement would say, judged as if the parent's page were the only page, ignoring the top-level claim. These all count as correct `+3` children: an attribution child saying who said its parent, a bare-URL citation of its parent, and an example of its parent. Fail on any child that is signed wrongly or that argues about a sibling or a different statement than its parent.
