import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function isToolUse(block: Anthropic.ContentBlock): block is Anthropic.Messages.ToolUseBlock {
  return block.type === "tool_use";
}

export function isText(block: Anthropic.ContentBlock): block is Anthropic.Messages.TextBlock {
  return block.type === "text";
}
