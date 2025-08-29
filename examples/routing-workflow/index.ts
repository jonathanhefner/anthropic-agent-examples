import { CUSTOMER_PLAN_PRICES, type CustomerData } from "./common.js";
import { handleInquiry } from "./handleInquiry.js";

export async function main(customerData: CustomerData, inquiry: string): Promise <string> {
  try {
    return await handleInquiry(customerData, inquiry)
  } catch (error) {
    console.error("[ERROR]", error);
    return "I apologize, but I encountered an error.  Please try again or contact our support team directly.";
  }
}

export const EXAMPLE_CUSTOMER: CustomerData = {
  customerId: "12345",
  name: "John Smith",
  plan: "PREMIUM",
  monthlyRate: CUSTOMER_PLAN_PRICES["PREMIUM"],
  joinDate: "2025-05-15",
  lastPaymentDate: "2025-08-01"
};

// console.log("---");
// console.log(await main(EXAMPLE_CUSTOMER, "I want to cancel my subscription and get a refund. I paid 3 days ago."));
// console.log("---");
// console.log(await main(EXAMPLE_CUSTOMER, "My videos keep buffering on my smart TV but work fine on my phone."));
// console.log("---");
// console.log(await main(EXAMPLE_CUSTOMER, "I forgot my password and can't access my account."));
