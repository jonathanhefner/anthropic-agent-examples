import type Anthropic from "@anthropic-ai/sdk";
import { CUSTOMER_PLAN_PRICES, CUSTOMER_PLANS, generateInquiryResponse, type CustomerData } from "./common.js";

export async function handleAccountInquiry(customerData: CustomerData, inquiry: string): Promise <string> {
  const systemPrompt =
`You are an account management specialist for StreamFlix.

Help with account access, profile management, and general account questions.

Customer data:

<customer>
${JSON.stringify(customerData)}
</customer>`;

  return await generateInquiryResponse(systemPrompt, inquiry);
}

interface CalculateRefundToolInput {
  amount: number;
  daysUsed: number;
  totalDaysInPeriod: number;
}

const calculateRefundTool: Anthropic.Tool = {
  name: "calculate_refund",
  description: "Calculate prorated refund based on usage",
  input_schema: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "Original payment amount"
      },
      daysUsed: {
        type: "number",
        description: "Days of service used"
      },
      totalDaysInPeriod: {
        type: "number",
        description: "Total days in billing period",
      },
    },
    required: ["amount", "daysUsed", "totalDaysInPeriod"],
  },
};

function calculateRefund({ amount, daysUsed, totalDaysInPeriod }: CalculateRefundToolInput): number {
  const unusedDays = totalDaysInPeriod - daysUsed;
  return (amount * unusedDays) / totalDaysInPeriod;
}

interface CalculateUpgradeCostToolInput {
  currentPlan: CustomerData['plan'];
  newPlan: CustomerData['plan'];
  daysRemaining: number;
}

const calculateUpgradeCostTool: Anthropic.Tool = {
  name: "calculate_plan_upgrade_cost",
  description: "Calculate cost for upgrading plan mid-cycle",
  input_schema: {
    type: "object",
    properties: {
      currentPlan: {
        type: "string",
        enum: CUSTOMER_PLANS,
        description: "Current plan name",
      },
      newPlan: {
        type: "string",
        enum: CUSTOMER_PLANS,
        description: "New plan name",
      },
      daysRemaining: {
        type: "number",
        description: "Days remaining in current billing cycle",
      },
    },
    required: ["currentPlan", "newPlan", "daysRemaining"],
  },
};

function calculatePlanUpgradeCost({ currentPlan, newPlan, daysRemaining }: CalculateUpgradeCostToolInput): number {
  const currentPrice = CUSTOMER_PLAN_PRICES[currentPlan];
  const newPrice = CUSTOMER_PLAN_PRICES[newPlan];
  return ((newPrice - currentPrice) / 30) * daysRemaining;
}

export async function handleBillingInquiry(customerData: CustomerData, inquiry: string): Promise<string> {
  const systemPrompt =
`You are a billing specialist for StreamFlow.  Be helpful and professional.  Use the available tools when needed for accurate calculations.

Customer data:

<customer>
${JSON.stringify(customerData)}
</customer>`;

  const tools = [calculateRefundTool, calculateUpgradeCostTool];

  return await generateInquiryResponse(systemPrompt, inquiry, tools, (toolName, input) => {
    switch (toolName) {
      case "calculateRefund":
        return calculateRefund(input).toFixed(2);

      case "calculatePlanUpgradeCost":
        return calculatePlanUpgradeCost(input).toFixed(2);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  });
}
