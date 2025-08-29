import { evaluateBlogPost } from "./evaluateBlogPost.js";
import { generateBlogPost } from "./generateBlogPost.js";
import { optimizeBlogPost } from "./optimizeBlogPost.js";

const TARGET_SCORE = 7;
const MAX_ITERATIONS = 3;

export async function main(topic: string) {
  console.log("BLOG POST TOPIC:", topic)

  try {
    let content = await generateBlogPost(topic);
    let evaluation = await evaluateBlogPost(content);
    let iteration = 1;
    console.log(`ITERATION ${iteration}:`, evaluation);

    while (evaluation.overallScore < TARGET_SCORE && iteration <= MAX_ITERATIONS) {
      content = await optimizeBlogPost(content, evaluation);
      evaluation = await evaluateBlogPost(content);
      iteration += 1;
      console.log(`ITERATION ${iteration}:`, evaluation);
    }

    console.log("\nFINAL RESULT:\n\n", content);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

// await main("Trends in AI");
