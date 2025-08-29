import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function isText(block: Anthropic.ContentBlock): block is Anthropic.Messages.TextBlock {
  return block.type === "text";
}

export function isToolUse(block: Anthropic.ContentBlock): block is Anthropic.Messages.ToolUseBlock {
  return block.type === "tool_use";
}

export async function useTool(
  toolUse: Anthropic.Messages.ToolUseBlock,
  execute: (input: any) => Promise<string>,
): Promise<Anthropic.Messages.ToolResultBlockParam> {
  console.log("[TOOL_USE]", toolUse.name, toolUse.input);

  try {
    return {
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: await execute(toolUse.input),
    };
  } catch (error) {
    console.log("[TOOL_ERROR]", error);

    return {
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: `Error: ${error}`,
      is_error: true,
    };
  }
}
