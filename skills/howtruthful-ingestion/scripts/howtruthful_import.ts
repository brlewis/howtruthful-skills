#!/usr/bin/env -S deno run --allow-read
import { compress } from "npm:lzma1";

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
