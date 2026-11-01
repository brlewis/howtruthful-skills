#!/usr/bin/env -S deno run --allow-read --allow-run
// Reads HowTruthful markdown on stdin and prints the import-page URL that
// carries it. With --open, also opens that URL in the user's default browser.
import { compress } from "npm:lzma1@0.3.0";

const shouldOpen = Deno.args.includes("--open");

// Read all chunks from standard input (stdin) until EOF
const chunks = [];
for await (const chunk of Deno.stdin.readable) {
  chunks.push(chunk);
}
// Combine chunks into a single byte array
const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
const rawBytes = new Uint8Array(totalLength);
let offset = 0;
for (const chunk of chunks) {
  rawBytes.set(chunk, offset);
  offset += chunk.length;
}
const compressedBytes = compress(rawBytes, 5);
const base64UrlString = compressedBytes.toBase64({ alphabet: "base64url" });
const targetUrl = `https://www.howtruthful.com/private/import#0/${base64UrlString}`;

console.log(targetUrl);

async function openInBrowser(url: string): Promise<boolean> {
  const candidates: [string, string[]][] = Deno.build.os === "darwin"
    ? [["open", [url]]]
    : Deno.build.os === "windows"
    ? [["cmd", ["/c", "start", "", url]]]
    : [["xdg-open", [url]], ["gio", ["open", url]]];
  for (const [cmd, args] of candidates) {
    try {
      const { success } = await new Deno.Command(cmd, {
        args,
        stdout: "null",
        stderr: "null",
      }).output();
      if (success) return true;
    } catch {
      // Opener not installed or not permitted; try the next one.
    }
  }
  return false;
}

if (shouldOpen && !(await openInBrowser(targetUrl))) {
  console.error("Could not open a browser; open the URL above manually.");
  Deno.exit(2);
}
