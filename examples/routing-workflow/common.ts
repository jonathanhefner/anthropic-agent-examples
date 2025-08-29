import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type ToolCallback =
  | ((toolName: string, input: any) => string)
  | ((toolName: string, input: any) => Promise<string>);

export function isText(block: Anthropic.ContentBlock): block is Anthropic.Messages.TextBlock {
  return block.type === "text";
}

export function isToolUse(block: Anthropic.ContentBlock): block is Anthropic.Messages.ToolUseBlock {
  return block.type === "tool_use";
}

async function useTool(
  toolUse: Anthropic.Messages.ToolUseBlock,
  callback: ToolCallback,
): Promise<Anthropic.Messages.ToolResultBlockParam> {
  console.log("[TOOL_USE]", toolUse.name, toolUse.input);

  try {
    return {
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: await callback(toolUse.name, toolUse.input),
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


export const CUSTOMER_PLANS = ["BASIC", "PREMIUM", "FAMILY"] as const;

export type CustomerPlan = typeof CUSTOMER_PLANS[number];

export const CUSTOMER_PLAN_PRICES: Record<CustomerPlan, number> = {
  "BASIC": 9.99,
  "PREMIUM": 15.99,
  "FAMILY": 19.99,
};

export interface CustomerData {
  customerId: string;
  name: string;
  plan: CustomerPlan;
  monthlyRate: number;
  joinDate: string;
  lastPaymentDate: string;
}


export async function generateInquiryResponse(
  systemPrompt: string,
  inquiry: string,
): Promise<string>;
export async function generateInquiryResponse(
  systemPrompt: string,
  inquiry: string,
  tools: Anthropic.Tool[],
  toolCallback: ToolCallback,
): Promise<string>;
export async function generateInquiryResponse(
  systemPrompt: string,
  inquiry: string,
  tools?: Anthropic.Tool[],
  toolCallback?: ToolCallback,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: inquiry }
  ];

  const maxIterations = 10;

  while (messages.length / 2 < maxIterations) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      tools: tools ?? [],
      messages: messages,
    });

    const toolUseBlocks = response.content.filter(isToolUse);

    if (toolUseBlocks.length === 0) {
      return response.content.filter(isText).map((block) => block.text).join("");
    } else {
      if (!toolCallback) throw new Error("Missing tool callback");

      const toolResultBlocks = toolUseBlocks.map((toolUse) => useTool(toolUse, toolCallback));

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: await Promise.all(toolResultBlocks) });
    }
  }

  throw new Error("Unable to generate inquiry response within the allotted number of steps.")
}
