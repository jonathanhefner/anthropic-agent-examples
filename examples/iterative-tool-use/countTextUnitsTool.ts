import type Anthropic from "@anthropic-ai/sdk";

const UNIT_PATTERNS = {
  "CHARACTERS": /./,
  "LINES": /\n|.$/,
  "WORDS": /\w+/,
  "SENTENCES": /[a-z](?:\.\s|\W*$)/,
};

export type TextUnit = keyof typeof UNIT_PATTERNS;

interface CountTextUnitsToolInput {
  text: string;
  unit: TextUnit;
}


export const definition: Anthropic.Tool = {
  name: "count_text_units",

  description:
`Counts units of text in a larger string of text.

Examples:

<example>
  <description>Count characters in a word</description>
  <input>{ text: "strawberry", unit: "CHARACTERS" }</input>
  <output>10</output>
</example>

<example>
  <description>Count lines in a block of text</description>
  <input>{ text: "10 PRINT \"HELLO, WORLD!\"\n20 GOTO 10\nRUN\n", unit: "LINES" }</input>
  <output>3</output>
</example>

<example>
  <description>Count words in a sentence</description>
  <input>{ text: "The quick brown fox jumps over the lazy dog.", unit: "WORDS" }</input>
  <output>9</output>
</example>

<example>
  <description>Count sentences in a string</description>
  <input>{ text: "If you want to go fast, go alone.  If you want to go far, go together.", unit: "SENTENCES" }</input>
  <output>2</output>
</example>`,

  input_schema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text in which the units occur.",
      },
      unit: {
        type: "string",
        enum: Object.keys(UNIT_PATTERNS),
        description: `The type of units to count (${Object.keys(UNIT_PATTERNS).join(", ")}).`,
      }
    },
    required: ["text", "unit"],
  },
}

export async function execute(input: CountTextUnitsToolInput): Promise<string> {
  return countUnits(input.text, input.unit).toString();
}

export function countUnits(text: string, unit: TextUnit): number {
  if (unit === "CHARACTERS") return text.length; // performance optimization

  let count = 0;
  const regexp = new RegExp(UNIT_PATTERNS[unit].source, "g");
  let lastIndex = 0;

  while (regexp.exec(text)) {
    count += 1;
    // Handle zero-length matches:
    regexp.lastIndex = lastIndex = Math.max(regexp.lastIndex, lastIndex + 1);
  }

  return count;
}
