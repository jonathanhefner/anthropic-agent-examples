import { anthropic, isText } from "./common.js";

export async function generateFunctionCode(description: string, functionSignature: string): Promise<string> {
  const prompt =
`Here is the description of a TypeScript function:

<description>
${description}
</description>

Generate code for the function.  Generate the code **ONLY**, nothing else.`;

  const prefill = `${functionSignature} {`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: prefill },
    ],
  });

  return prefill + response.content.filter(isText).map((block) => block.text).join("");
}
