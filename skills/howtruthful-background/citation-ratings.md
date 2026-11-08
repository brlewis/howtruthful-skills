# Rating a bare-URL citation

A bare-URL citation child is the one statement whose rating an agent judges
for itself, as a narrow, mechanical exception to the howtruthful-background
skill's "the ratings are the human's" rule: an agent that actually attempted
to fetch the URL has direct, first-hand evidence of one specific, non-
debatable fact — whether the link resolves — and rating that fact isn't the
same kind of judgment call the "assess truthfulness later" rule is
protecting.

If the agent did not attempt to fetch the citation, leave it at the default
3. If it did attempt the fetch, rate the citation according to the outcome:

- Successfully fetched (the content behind the link actually loaded) → 5,
  true. A 5 means you saw the resource's real content. A fetch tool that
  passes the page through a model and returns a summary can return a
  plausible summary of an error page, paywall, or login redirect, so when
  all you have is a summary, confirm with a raw fetch (e.g. `curl -sL`)
  before rating 5, and otherwise rate by whichever outcome below the raw
  fetch shows.
- A clean 404, or other definitive confirmation the resource doesn't exist
  at that address → 1, false.
- An access barrier that could well be temporary or specific to the
  fetching tool — a 403, a paywall, a login redirect, a timeout, a
  rate limit — leave at 3, debatable. This doesn't mean the link is bad;
  it means the agent couldn't tell either way, and 3 says exactly that.
- 2, dubious, is for a citation that responds but not in a way that
  inspires confidence it's the real resource — a redirect to an
  unrelated page, a "soft 404" that returns success but has no real
  content, a domain that's been repurposed. Use judgment; this is the one
  rating in this rule that isn't mechanical.

This rates the link itself, not the claim it's attached to, and not
whether its content actually supports that claim — a citation can be a
verified, reachable, perfectly real page (5) that still doesn't say what
the statement above it claims. That's a separate question, covered by the
howtruthful-improvement skill's citation audit.
