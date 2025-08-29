import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, isText, isToolUse, useTool } from "./common.js";
import * as counTextUnitsTool from "./countTextUnitsTool.js";
import * as textEditorTool from "./textEditorTool.js";

const MAX_ITERATIONS = 20;

export async function main(prompt: string) {
  const tools = [textEditorTool, counTextUnitsTool];

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

  while (messages.length / 2 < MAX_ITERATIONS) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      tools: tools.map((tool) => tool.definition),
      messages: messages,
    });

    const toolUseBlocks = response.content.filter(isToolUse);

    if (toolUseBlocks.length > 0) {
      const toolResultBlocks = toolUseBlocks.map((toolUse) => {
        const { execute } = tools.find(({ definition }) => definition.name === toolUse.name)!;
        return useTool(toolUse, execute);
      });

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: await Promise.all(toolResultBlocks) });
    } else {
      const finalResult = response.content.filter(isText).map((block) => block.text).join("");
      console.log(finalResult);
      return;
    }
  }

  console.error(`Exceeded max iterations (${MAX_ITERATIONS})`);
}

// await main(`First, generate a haiku.  Then, count the numbers of lines in it.`)
