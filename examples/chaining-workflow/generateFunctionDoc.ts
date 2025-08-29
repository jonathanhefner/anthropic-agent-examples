import { anthropic, isText } from "./common.js";

export async function generateFunctionDoc(description: string, functionCode: string): Promise<string> {
  const prompt =
`Here is the description of a TypeScript function:

<description>
${description}
</description>

Here is the function code:

<code>
${functionCode}
</code>

Generate a JSDoc comment for the function.  Generate the comment **ONLY**, nothing else.`;

  const prefill = "/**\n *";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: prefill },
    ],
  });

  return prefill + response.content.filter(isText).map((body) => body.text).join("");
}
