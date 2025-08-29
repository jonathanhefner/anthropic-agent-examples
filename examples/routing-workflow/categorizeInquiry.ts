import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, isToolUse } from "./common.js";

const INQUIRY_CATEGORIES = ["BILLING", "TECHNICAL", "ACCOUNT", "OTHER"] as const;

const submitCategoryTool: Anthropic.Tool = {
  name: "submit_inquiry_category",
  description: "Submit the category of customer inquiry, along with reasoning and confidence score",
  input_schema: {
    type: "object",
    properties: {
      reasoning: {
        type: "string",
        description: "Brief explanation of why the category was chosen",
      },
      category: {
        type: "string",
        enum: INQUIRY_CATEGORIES,
        description: "The category that best fits the customer's inquiry",
      },
      confidence: {
        type: "number",
        description: "Confidence level (0-1) in the categorization"
      },
    },
    required: ["reasoning", "category", "confidence"],
  },
};

export interface InquiryCategorization {
  category: typeof INQUIRY_CATEGORIES[number];
  reasoning: string;
  confidence: number;
}

export async function categorizeInquiry(inquiry: string): Promise<InquiryCategorization> {
  const prompt =
`Analyze the customer inquiry and assign an appropriate category based on the category description.

Customer inquiry:

<inquiry>
${inquiry}
</inquiry>

Possible categories:

<categories>
  <category>
    <name>BILLING</name>
    <description>Issues with charges, refunds, payment problems</description>
  </category>

  <category>
    <name>TECHNICAL</name>
    <description>Streaming issues, app problems, device compatibility</description>
  </category>

  <category>
    <name>ACCOUNT</name>
    <description>Password resets, profile management, login issues</description>
  </category>

  <category>
    <name>OTHER</name>
    <description>General questions or unclear requests</description>
  </category>
</categories>`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [submitCategoryTool],
    tool_choice: { type: "tool", name: submitCategoryTool.name },
    messages: [{ role: "user", content: prompt }]
  });

  const toolInput = response.content.find(isToolUse)?.input;
  if (!toolInput) throw new Error("Failed to categorize inquiry");
  return toolInput as InquiryCategorization;
}
