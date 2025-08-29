import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { insert, replace, viewLines } from "./textEditorTool.js";

describe("replace", () => {
  it("replaces a unique match", () => {
    assert.strictEqual(
      replace("hello world", "world", "there"),
      "hello there"
    );
  });

  it("throws when no match is found", () => {
    assert.throws(
      () => replace("hello world", "hey", "hi"),
      /No match found/
    );
  });

  it("throws when multiple matches are found", () => {
    assert.throws(
      () => replace("well well well", "well", "good"),
      /Found 3 matches/
    );
  });
});

describe("insert", () => {
  it("inserts between lines using 1-based indexing", () => {
    assert.strictEqual(
      insert("one\ntwo\nthree", 2, "<INSERTED>"),
      "one\ntwo\n<INSERTED>three"
    );

    assert.strictEqual(
      insert("one\ntwo\nthree\n", 3, "<INSERTED>"),
      "one\ntwo\nthree\n<INSERTED>"
    );
  });

  it("inserts at the start when line number is 0", () => {
    assert.strictEqual(
      insert("one\ntwo\nthree", 0, "zero\n"),
      "zero\none\ntwo\nthree"
    );

    assert.strictEqual(
      insert("", 0, "zero\n"),
      "zero\n"
    );
  });

  it("throws when line number is greater than the number of lines", () => {
    assert.throws(
      () => insert("one\ntwo\nthree\n", 4, "nope"),
      /Invalid line number/
    );

    assert.throws(
      () => insert("one\ntwo\nthree\n", 5, "nope"),
      /Invalid line number/
    );
  });
});

describe("viewLines", () => {
  it("numbers lines", () => {
    assert.strictEqual(
      viewLines("one\ntwo\nthree"),
      "1: one\n2: two\n3: three"
    );

    assert.strictEqual(
      viewLines("one\ntwo\nthree\n"),
      "1: one\n2: two\n3: three\n4: "
    );
  });

  it("handles empty lines", () => {
    assert.strictEqual(
      viewLines("one\n\nthree\n\n"),
      "1: one\n2: \n3: three\n4: \n5: "
    );
  });

  it("handles empty text", () => {
    assert.strictEqual(viewLines(""), "1: ");
  });

  it("limits lines to the given range", () => {
    assert.strictEqual(
      viewLines("one\ntwo\nthree\nfour\nfive\n", [2, 4]),
      "2: two\n3: three\n4: four"
    );
  });

  it("treats a negative range end as the end of the file", () => {
    assert.strictEqual(
      viewLines("one\ntwo\nthree\nfour\nfive", [3, -1]),
      "3: three\n4: four\n5: five"
    );

    assert.strictEqual(
      viewLines("one\ntwo\nthree\nfour\nfive\n", [3, -1]),
      "3: three\n4: four\n5: five\n6: "
    );
  });
});
