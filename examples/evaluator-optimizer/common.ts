import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateToolInput(prompt: string, tool: Anthropic.Tool): Promise<any> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
    messages: [{ role: "user", content: prompt }],
  });

  const result = response.content.find((block) => block.type === "tool_use")?.input;
  if (!result) throw new Error(`Failed to call tool ${tool.name}`);
  return result;
}
