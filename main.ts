// The Dog Ate My Homework: Funniest Excuse — make.fun entry.
// One line, in the dog's own voice, explaining why the homework got eaten.
// main.ts writes the excuse verbatim to /output/entry.txt and refuses to
// write anything that would fail the sealed gate (1-200 UTF-8 characters,
// not only whitespace, a single line).
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

const EXCUSE =
  "I ate it because the essay said homework builds character, and I was only trying to help you grow.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

function fail(message: string): never {
  throw new Error(`[excuse] ${message}`);
}

// Mirror the sealed scorer's gate before touching the output file.
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
  // No control characters: the judge reads raw text, and an invisible
  // control byte would count toward the 200-character gate.
  for (const ch of text) {
    if (ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f) {
      fail(`excuse contains a control character (U+${ch.charCodeAt(0).toString(16).padStart(4, "0")}).`);
    }
  }
  // A one-line excuse should read as a complete sentence.
  if (!/[.!?]$/.test(text)) {
    fail("excuse must end with terminal punctuation.");
  }
}

checkExcuse(EXCUSE);

// Fail loudly with exit code 1 instead of a bare stack trace if the
// sandbox hands us an unwritable /output.
function main(): void {
  try {
    mkdirSync("/output", { recursive: true });
  } catch (error) {
    fail(
      `cannot create /output: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  writeFileSync(OUTPUT_PATH, EXCUSE, "utf8");

  // Read back and confirm the judge will see exactly this line, byte for byte.
  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== EXCUSE) {
    fail(
      `output mismatch: wrote ${written.length} chars, expected ${EXCUSE.length}.`,
    );
  }
  // Byte size must match too: a stray BOM or newline would pass a string
  // comparison only if it were also in EXCUSE, so this catches encoding drift.
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
