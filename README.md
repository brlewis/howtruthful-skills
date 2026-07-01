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
markdown.

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
intended to be used primarily this way. You don't usually look at arguments in
outline form.

However, when you're editing the argument map, sometimes an argument might be on
the wrong level, and you want to drag it to a different level. This can only be
done when you look at an outline. Here's the secret: The notation at the end of
a statement, e.g. (6+, 3-) is clickable. It expands the pros and cons for that
statement inline, and you can then drag statements in or out. Drag to a specific
place to move them. Drag to the "Pro" or "Con" header to "copy" them. "Copy" is
in scare quotes because it's actually a link to the same statement, not a copy.
