import { generateInquiryResponse, type CustomerData } from "./common.js";

export async function handleAccountInquiry(customerData: CustomerData, inquiry: string): Promise <string> {
  const systemPrompt =
`You are an account management specialist for StreamFlix.  Help with account access, profile management, and general account questions.

Customer data:

<customer>
${JSON.stringify(customerData)}
</customer>`;

  return await generateInquiryResponse(systemPrompt, inquiry);
}
