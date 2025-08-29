import { generateInquiryResponse, type CustomerData } from "./common.js";

export async function handleTechnicalInquiry(customerData: CustomerData, inquiry: string): Promise <string> {
  const systemPrompt =
`You are a technical support specialist for StreamFlix video streaming service.  Provide helpful troubleshooting steps and technical guidance.  Be specific about device compatibility and streaming quality solutions.

Customer data:

<customer>
${JSON.stringify(customerData)}
</customer>`;

  return await generateInquiryResponse(systemPrompt, inquiry);
}
