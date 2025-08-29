import { generateCompanyReport } from "./generateReport.js";

export async function main(company: string) {
  try {
    console.log(await generateCompanyReport(company));
  } catch (error) {
    console.error("[ERROR]", error);
  }
}

// await main("Anthropic");
