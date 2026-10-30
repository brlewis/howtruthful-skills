# HowTruthful Skills

Agent skills for turning a complex, debatable issue into an argument map you
can actually scrutinize. Hand your AI agent a transcript, an article, a YouTube
video, or just a topic, and it produces a map for
[HowTruthful](https://www.howtruthful.com/), where every statement gets its own
page with its own Pro and Con arguments. You then refine the map and decide for
yourself which statements are true.

HowTruthful lets one navigate an argument map via hypertext, in a simpler and
more information-dense format than the usual lines and circles. You may want to
go there and construct arguments manually first, so that later you know how to
quickly edit AI-generated ones.

The skills:

- **howtruthful-ingestion** converts source material into HowTruthful markdown
  and, if asked, opens it in HowTruthful's import page.
- **howtruthful-improvement** adds well-cited statements an existing map is
  missing, and audits whether its citations really support their statements.
- **howtruthful-merge** merges one map into another, so overlapping and
  contradictory claims from different sources compound instead of duplicating.
- **howtruthful-background** holds the shared rules the others depend on. You
  don't invoke it directly.

These skills won a prize in FLF's
[Epistemic Case Study Competition](https://flf.org/epistack-competition/). The
[`flf-epistack-2026`](https://github.com/brlewis/howtruthful-skills/tree/flf-epistack-2026)
tag preserves the repo as it was submitted, including the contest writeup and
example maps.

## Installation

1. [Install deno](https://docs.deno.com/runtime/getting_started/installation/).
   The skills' scripts run on it, and it installs the skills themselves.
2. Create the `dx` alias for running npm packages:

   ```
   deno x --install-alias
   ```

3. From your project directory, install the skills:

   ```
   dx skills add brlewis/howtruthful-skills
   ```

   Add `-g` to make them available in every project instead.

You will also need python3, which the ingestion skill uses to open
HowTruthful's import page in your browser. To use YouTube videos as source
material, also [install yt-dlp](https://github.com/yt-dlp/yt-dlp#installation).

## Ingestion

Suppose you have a `whatever.md` file that's any freeform text. For example:

```
Joe: The sky is blue because it looks blue.

Carl: The sky is gray because it's cloudy.
```

With most command-line AI agents, you should be able to do something like this:

```
Use the howtruthful-ingestion skill to convert whatever.md into howtruthful.md.
Then import.
```

Your agent writes the map to `howtruthful.md`, then opens HowTruthful's import
page prefilled with it. Scroll down and click Import.

You can also ask the agent to create a new debate from a short topic
description:

```
Use the howtruthful-ingestion skill to discuss why AI should and shouldn't be
used to assess what's true, then put the result into ht4-test.md. Then import.
```

The source material can also be a YouTube video. The skill fetches and cites the
video's own transcript, with timestamped citation links pulled from the
transcript itself rather than guessed:

```
Use the howtruthful-ingestion skill to convert
https://www.youtube.com/watch?v=VIDEO_ID into video-debate.md. Then import.
```

You are not done! Your AI agent has fleshed out an initial map of the argument.
You should explore and refine this map.

- Click into a statement to view its Pro and Con arguments
- If the statement could be worded more clearly, click it to edit its wording.
- If Pro or Con arguments would make more sense in a different order, drag to
  reorder.
- To add more Pro arguments, click the Pro header to show a box in which to type
  a new one. (Same for Con).
- Click into each pro and con statement to repeat the above. But don't edit
  wording to make them not be repetitive. Each statement needs to be worded in a
  context-independent way so that it can be scrutinized individually.
  Consequently, a list of pro and con arguments might, for example, repeat full
  names where normally one would use pronouns.
- Whenever you see "💡 **Tip**" at the bottom of the page, read the tip. In
  order to achieve a clean, modern look, HowTruthful subtly hides a lot of its
  features. You might not discover them without reading these tips.

### Attribution

Notice that the example above drops "Joe" and "Carl" entirely: the generated
statements are unattributed. This is deliberate, for the same reason HowTruthful
asks you to scrutinize each statement in isolation (see "More argument map
refinement" below): once a reader knows _who_ said something, they tend to judge
the claim by the speaker's politics, personality, or track record instead of on
its own merits. Stripping attribution by default is that same
anti-motivated-reasoning principle applied to statements before they even reach
the map.

Attribution isn't discarded from the tool, only from the default. Ask for it
("with attribution" in the initial request, or "add attribution" later) and the
skill adds it back as its own child statement, e.g. "Joe said the sky looks
blue," underneath the claim it supports. Framed this way, attribution becomes an
ordinary, independently-assessable argument (a citation or an appeal to
authority) that a reader can weigh, downgrade, or ignore, rather than context
that silently colors the parent statement for every reader who sees it.

## Improvement

Ingestion only structures what's already in your source. To bring in outside
information, ask for improvement explicitly:

```
Use the howtruthful-improvement skill to improve howtruthful.md.
```

The agent looks for gaps, such as vague quantifiers, missing methodological
objections, or well-known claims the source left out, and adds a cited statement
for each. You can also ask it to audit the citations already in the file. It
reports any citation that doesn't support its statement and waits for you to
choose a fix.

## Merge

When two sources cover the same debate, map each one, then merge them:

```
Use the howtruthful-merge skill to merge y.md into x.md.
```

Statements that mean the same thing become the same page, contradictory ones are
folded in with their arguments flipped, and everything else is grafted in. The
agent reports which merges involved judgment calls, so you know where to look.

## Assessment

You may have noticed when following the above steps that every statement has a
truthfulness rating of 3 - debatable. This is because the AI agent and you have
been laying out everybody's reasoning regardless of whether you agree with it.
Ideally, you've produced an argument map such that everybody agrees that it's
the right collection of statements. They only disagree on which statements are
true.

Now it's time to form your own opinion about which statements are true.

- Click down through pros and cons until you reach a statement that has no pros
  and cons of its own. Pause for a minute and try to really scrutinize it in
  isolation, not in the context of whatever it's arguing for or against. If it's
  self-evidently true, click the green 5 disc just below the statement. If it's
  self-evidently false, click the red 1 disc. If you can't decide, consider
  adding pro/con arguments underneath it until you can decide. Or just leave it
  debatable.
- Click the back button to return to a statement that does have pros and cons.
  Based on your assessed truthfulness of its pros and cons, see if you can
  decide the truthfulness of that statement. If you can't decide, consider
  adding pro/con arguments underneath it until you can decide. Or just leave it
  debatable.
- Keep backing out until you decide the truthfulness of your top-level
  statement(s).

Congratulations! You've formed a clearly-reasoned opinion!

## More argument map refinement

If you've made it this far, you're good at reading instructions. You probably
absorbed the directions about scrutinizing each statement in isolation, not in
the context of whatever it's arguing for or against. This is to combat a human
tendency called "motivated reasoning." This is important, and HowTruthful is
intended to be used primarily this way. HowTruthful doesn't usually show you
arguments in outline form.

However, when you're editing the argument map, sometimes an argument might be on
the wrong level, and you want to drag it to a different level. This can only be
done when you look at an outline. Here's the secret: The notation at the end of
a statement, e.g. (6+, 3-) is clickable. It expands the pros and cons for that
statement inline, and you can then drag statements in or out. Drag to a specific
place to move them. Drag to the "Pro" or "Con" header to "copy" them. "Copy" is
in scare quotes because it's actually a link to the same statement, not a copy.

Whenever statements are identical (word for word, letter for letter, punctuation
mark for punctuation mark), they lead to the same page, with the same
truthfulness rating, and the same pro and con arguments. This encourages
consistency of thought, and also lets you build up your own encyclopedia of
thoughts. Enjoy!
