import { generateFunctionCode } from "./generateFunctionCode.js";
import { generateFunctionDoc } from "./generateFunctionDoc.js";
import { generateFunctionSignature } from "./generateFunctionSignature.js";

export async function main(description: string) {
  const functionSignature = await generateFunctionSignature(description);
  const functionCode = await generateFunctionCode(description, functionSignature);
  const functionDoc = await generateFunctionDoc(description, functionCode);

  console.log(`${functionDoc}\n${functionCode}\n`);
}

// await main("A function that adds two numbers, `a` and `b`.");
