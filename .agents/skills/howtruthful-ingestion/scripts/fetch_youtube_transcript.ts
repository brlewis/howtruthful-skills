#!/usr/bin/env -S deno run --allow-run=yt-dlp --allow-read --allow-write --allow-env=HOME
// Fetches a YouTube video's transcript and prints one cue per line as
// `<ready-to-cite URL>\t<text spoken at that timestamp>`.
//
// The URL on each line is a complete, correct citation for the text next to
// it — copy it verbatim into the markdown. Never construct a `&t=` value by
// hand or estimate one from context; a timestamp not copied from this
// output is a guess, not a citation.

function videoId(url: string): string {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!m) {
    console.error(`Could not find an 11-character video ID in: ${url}`);
    Deno.exit(1);
  }
  return m[1];
}

function toSeconds(timestamp: string): number {
  const [h, m, s] = timestamp.split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

function stripTags(line: string): string {
  return line.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// yt-dlp's auto-generated captions scroll a two-line window: each cue is
// either the previous line plus new words being revealed karaoke-style, or a
// shorter, settled redisplay of just the tail end of what's already been
// shown (the earlier line scrolling off). Collapse that into one fragment
// per cue, keeping only the newly-revealed words and the timestamp they
// first appeared at.
function dedupeCues(
  cues: { start: number; text: string }[],
): { start: number; text: string }[] {
  const fragments: { start: number; text: string }[] = [];
  let previous = "";
  for (const cue of cues) {
    if (!cue.text || cue.text === previous) continue;
    if (cue.text.startsWith(previous)) {
      const fragment = cue.text.slice(previous.length).trim();
      if (fragment) fragments.push({ start: cue.start, text: fragment });
    } else if (!previous.endsWith(cue.text)) {
      // Not an extension of, nor a trimmed redisplay of, the previous cue —
      // genuinely new content (e.g. a caption-window reset).
      fragments.push({ start: cue.start, text: cue.text });
    }
    previous = cue.text;
  }
  return fragments;
}

function parseVtt(vtt: string): { start: number; text: string }[] {
  const cues: { start: number; text: string }[] = [];
  const blocks = vtt.split(/\r?\n\r?\n/);
  const timing = /^(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->/;
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    const match = lines[0]?.match(timing);
    if (!match) continue;
    const text = stripTags(lines.slice(1).join(" "));
    cues.push({ start: toSeconds(match[1]), text });
  }
  return cues;
}

const url = Deno.args[0];
if (!url) {
  console.error("Usage: fetch_youtube_transcript.ts <youtube-url>");
  Deno.exit(1);
}
const id = videoId(url);

// Some yt-dlp installs (e.g. the snap package) run sandboxed and can only
// write under $HOME, not the system temp directory — so the scratch dir
// goes under $HOME rather than Deno.makeTempDir()'s default location.
const tmpDir = await Deno.makeTempDir({ dir: Deno.env.get("HOME") });
try {
  const command = new Deno.Command("yt-dlp", {
    args: [
      "--write-subs",
      "--write-auto-subs",
      "--sub-langs",
      "en.*",
      "--skip-download",
      "--convert-subs",
      "vtt",
      "-o",
      `${tmpDir}/%(id)s.%(ext)s`,
      url,
    ],
    stdout: "null",
    stderr: "piped",
  });
  const { success, stderr } = await command.output();
  if (!success) {
    console.error(new TextDecoder().decode(stderr));
    Deno.exit(1);
  }

  // yt-dlp may write more than one caption track (e.g. both `en.vtt` and
  // `en-orig.vtt`); prefer the plain `en` track when present, since
  // `-orig` tracks are sometimes an unnormalized machine transcription.
  let vttPath: string | undefined;
  const preferred = `${id}.en.vtt`;
  for await (const entry of Deno.readDir(tmpDir)) {
    if (!entry.isFile || !entry.name.endsWith(".vtt")) continue;
    if (entry.name === preferred) {
      vttPath = `${tmpDir}/${entry.name}`;
      break;
    }
    if (!vttPath) vttPath = `${tmpDir}/${entry.name}`;
  }
  if (!vttPath) {
    console.error("yt-dlp did not produce a .vtt caption file for this video.");
    Deno.exit(1);
  }

  const cues = parseVtt(await Deno.readTextFile(vttPath));
  for (const fragment of dedupeCues(cues)) {
    const citationUrl =
      `https://www.youtube.com/watch?v=${id}&t=${Math.floor(fragment.start)}s`;
    console.log(`${citationUrl}\t${fragment.text}`);
  }
} finally {
  await Deno.remove(tmpDir, { recursive: true });
}
