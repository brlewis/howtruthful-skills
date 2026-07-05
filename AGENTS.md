# Make a complex debate human-digestible

This repo contains skills to jump-start humans' use of
[HowTruthful](https://www.howtruthful.com/) to understand, scrutinize, and
assess the truthfulness of complex, debatable issues.

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

### Context-independent statements

Because each statement gets its own web page that can be linked to from
anywhere, it should be worded in a context-independent way. For example, suppose
the main statement is "John Doe stole the diamond." Statements one might make in
opposition to the main statement could be "The diamond was found missing from
the Smith Museum at noon on June 18, 2005" and "He didn't arrive until 2", the
second statement needs to be reworded in a context-independent way: "John Doe
didn't arrive at the Smith Museum until 2pm on June 18, 2005". Thus the second
statement can have its own web page where it can be scrutinized in isolation.

## Graph statements first, assess truthfulness later.

HowTruthful lets humans rate statements' truthfulness on a simple 5-point scale,
where 1 is false and 5 is true. Initially, every statement is presumed 3,
debatable. This is consistent with how courts decide complex cases. First sort
out what everyone is saying, then assess what's true after both sides' reasoning
is all laid out.

## The import format

HowTruthful can import markdown files that represent a graph of statements.
Top-level statements are prepended with their truthfulness rating. Pro children
are prepended with a plus sign and thier truthfulness rating. Con children are
prepended with a minus sign and their truthfulness rating. Here's an example:

```
- 3 The sky is blue.
  - +3 The sky looks blue.
  - -3 The sky is gray.
    - +3 The sky is cloudy.
```

## Sandboxed environments

Some agent workflows (e.g., importing into HowTruthful) require opening a browser window on the host machine. In environments running with terminal sandboxing (such as Antigravity), the browser-open command (e.g. `python3 -m webbrowser URL`) must be run outside the terminal sandbox (using "unsandboxed" execution privileges). Note: `xdg-open` and bare `firefox URL` silently fail when Firefox is already running on Linux; `python3 -m webbrowser` works reliably across platforms and browsers. If browser launching fails, the agent must print the URL to the user in a non-wrapped code block.

