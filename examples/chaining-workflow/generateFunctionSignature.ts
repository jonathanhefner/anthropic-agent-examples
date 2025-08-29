import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, isToolUse } from "./common.js";

interface FunctionSignature {
  name: string;
  parameters: string;
  returnType: string;
  isAsync: boolean;
}

const defineFunctionSignatureTool: Anthropic.Tool = {
  name: "define_function_signature",
  description: `Defines a TypeScript function signature.`,
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the function.  MUST be a valid TypeScript identifier.",
      },
      parameters: {
        type: "string",
        description:
`The parameters of the function as a single string.

Examples:

* \`latitude: number, longitude: number\`
* \`haystack: string[], needle: string\`
* \`person: { firstName: string, lastName: string }\`

MUST be valid TypeScript syntax.`,
      },
      returnType: {
        type: "string",
        description:
`The return type of the function.  MUST be a valid TypeScript type.

Examples:

* \`string\`
* \`number[]\`
* \`Promise<boolean>\``,
      },
      isAsync: {
        type: "boolean",
        description: "Whether the function is `async` or not.",
      },
    },
    required: ["name", "parameters", "returnType", "isAsync"],
  },
};

export async function generateFunctionSignature(description: string): Promise<string> {
  const prompt =
`Here is the description of a TypeScript function:

<description>
${description}
</description>

Define the function's signature.`;

  const response = await anthropic.messages.create({
    model: "claude-4-sonnet-20250514",
    max_tokens: 1024,
    tools: [defineFunctionSignatureTool],
    tool_choice: { type: "tool", name: defineFunctionSignatureTool.name },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = response.content.find(isToolUse);

  if (toolUse) {
    const { name, parameters, returnType, isAsync } = toolUse.input as FunctionSignature;
    return `${isAsync ? "async " : ""}function ${name}(${parameters}): ${returnType}`;
  } else {
    throw new Error("Failed to generate function signature");
  }
}
