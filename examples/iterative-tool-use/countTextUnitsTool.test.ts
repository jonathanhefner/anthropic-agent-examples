import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countUnits, type TextUnit } from "./countTextUnitsTool.js";

describe("countUnit", () => {
  function assertCount(text: string, unit: TextUnit, expected: number) {
    assert.strictEqual(countUnits(text, unit), expected, `Incorrect count of ${unit} for ${JSON.stringify(text)}`);
  }

  it("counts CHARACTERS", () => {
    assertCount("strawberry", "CHARACTERS", 10);

    assertCount("", "CHARACTERS", 0);
  });

  it("counts LINES", () => {
    assertCount("10 PRINT \"HELLO, WORLD!\"\n20 GOTO 10\nRUN\n", "LINES", 3);

    assertCount("one", "LINES", 1);
    assertCount("\n", "LINES", 1);
    assertCount("one\ntwo\n", "LINES", 2);
    assertCount("one\ntwo\n\n", "LINES", 3);
    assertCount("one\ntwo\nthree", "LINES", 3);
    assertCount("", "LINES", 0);
  });

  it("counts WORDS", () => {
    assertCount("The quick brown fox jumps over the lazy dog.", "WORDS", 9);

    assertCount("one", "WORDS", 1);
    assertCount("one ", "WORDS", 1);
    assertCount("one\n", "WORDS", 1);
    assertCount(".", "WORDS", 0);
    assertCount(" ", "WORDS", 0);
    assertCount("\n", "WORDS", 0);
    assertCount("", "WORDS", 0);
  });

  it("counts SENTENCES", () => {
    assertCount("If you want to go fast, go alone.  If you want to go far, go together.", "SENTENCES", 2);

    assertCount("Hello World", "SENTENCES", 1);
    assertCount("Hello World.", "SENTENCES", 1);
    assertCount("Hello. World.", "SENTENCES", 2);
    assertCount("Hello.\n\nWorld.\n", "SENTENCES", 2);
    assertCount("", "SENTENCES", 0);
  });
});


