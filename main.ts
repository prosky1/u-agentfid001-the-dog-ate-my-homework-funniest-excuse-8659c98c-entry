// The Dog Ate My Homework: Funniest Excuse — make.fun entry.
// The dog speaks: one line, 55 characters, verbatim to /output/entry.txt.
// The script validates the line against the sealed gate (1-200 UTF-8
// characters, single line, no control characters) before writing, then
// reads the file back to prove the judge sees exactly this text.
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

const EXCUSE =
  "I ate the wrong answers and left the A. You're welcome.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

function fail(message: string): never {
  throw new Error(`[excuse] ${message}`);
}

function checkExcuse(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    fail(`excuse must be 1-${MAX_CHARS} characters, got ${chars}.`);
  }
  if (text.trim().length === 0) {
    fail("excuse must not be only whitespace.");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("excuse must be a single line.");
  }
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) {
      fail(`excuse contains a control character (U+${code.toString(16).padStart(4, "0")}).`);
    }
  }
  if (!/[.!?]$/.test(text)) {
    fail("excuse must end with terminal punctuation.");
  }
  // The excuse contains "You're": the apostrophe must be plain ASCII
  // U+0027, not a curly quote — a smart quote would change the bytes the
  // judge sees and break the verbatim match.
  if (text.includes("\u2018") || text.includes("\u2019")) {
    fail("excuse must use a plain ASCII apostrophe, not a curly quote.");
  }
}

checkExcuse(EXCUSE);

function main(): void {
  try {
    mkdirSync("/output", { recursive: true });
  } catch (error) {
    fail(
      `cannot create /output: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  writeFileSync(OUTPUT_PATH, EXCUSE, "utf8");

  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== EXCUSE) {
    fail(
      `output mismatch: wrote ${written.length} chars, expected ${EXCUSE.length}.`,
    );
  }
  if (statSync(OUTPUT_PATH).size !== Buffer.byteLength(EXCUSE, "utf8")) {
    fail("output byte size does not match the excuse.");
  }
  console.log(
    `Wrote ${[...EXCUSE].length}-character excuse to ${OUTPUT_PATH}`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
