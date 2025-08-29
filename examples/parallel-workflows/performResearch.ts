import Anthropic from "@anthropic-ai/sdk";
import { anthropic, isText } from "./common.js";

type WebSearchToolResultErrorBlock =
  Anthropic.Messages.WebSearchToolResultBlock & { content: Anthropic.WebSearchToolResultError };

function isWebSearchError(block: Anthropic.ContentBlock): block is WebSearchToolResultErrorBlock {
  return block.type === "web_search_tool_result" && "error_code" in block.content;
}

async function getResponse(messages: Anthropic.MessageParam[]): Promise<Anthropic.Message> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: "You are a research assistant.  Before answering, search the web for current information.",
    tools: [{ "type": "web_search_20250305", "name": "web_search" }],
    messages: messages,
  });

  if (response.stop_reason === "pause_turn") {
    return await getResponse([...messages, { role: "assistant", content: response.content }]);
  } else {
    return response;
  }
}

export async function performResearch(prompt: string): Promise<string> {
  const response = await getResponse([{ role: "user", content: prompt }]);
  const error = response.content.find(isWebSearchError);

  if (error) {
    throw new Error(`Search failed (error code: ${error.content.error_code})`);
  } else {
    return response.content.filter(isText).map((block) => block.text).join("");
  }
}
