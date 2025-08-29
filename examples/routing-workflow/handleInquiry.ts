import { categorizeInquiry } from "./categorizeInquiry.js";
import type { CustomerData } from "./common.js";
import { handleAccountInquiry } from "./handleAccountInquiry.js";
import { handleBillingInquiry } from "./handleBillingInquiry.js";
import { handleTechnicalInquiry } from "./handleTechnicalInquiry.js";

export async function handleInquiry(customerData: CustomerData, inquiry: string): Promise <string> {
  const categorization = await categorizeInquiry(inquiry);
  console.log("[ROUTING]", { inquiry, categorization });

  switch (categorization.category) {
    case "BILLING":
      return await handleBillingInquiry(customerData, inquiry);

    case "TECHNICAL":
      return await handleTechnicalInquiry(customerData, inquiry);

    case "ACCOUNT":
      return await handleAccountInquiry(customerData, inquiry);

    default:
      return "I'm sorry, but I am unable to help with that request.  Please contact our support team directly.";
  }
}
