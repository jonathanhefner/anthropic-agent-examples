import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export function isText(block: Anthropic.ContentBlock): block is Anthropic.Messages.TextBlock {
  return block.type === "text";
}
