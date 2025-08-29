import type Anthropic from "@anthropic-ai/sdk";
import type { BlogPostEvaluation } from "./evaluateBlogPost.js";
import { generateToolInput } from "./common.js";

interface SubmitContentToolInput {
  optimizedContent: string;
  changesMade: string;
}

const submitContentTool: Anthropic.Tool = {
  name: "submit_optimized_blog_post_content",
  description: "Submit optimized blog post content based on evaluation feedback",
  input_schema: {
    type: "object",
    properties: {
      optimizedContent: {
        type: "string",
        description: "The improved version of the blog post content",
      },
      changesMade: {
        type: "string",
        description: "Summary of the specific changes made during optimization",
      },
    },
    required: ["optimizedContent", "changesMade"],
  },
};

export async function optimizeBlogPost(content: string, evaluation: BlogPostEvaluation): Promise<string> {
  const prompt =
`Please optimize this blog post based on the evaluation feedback.  Focus on addressing the areas that scored lowest.

Blog post content:

<content>
${content}
</content>

Evaluation scores:

<scores>
- Clarity: ${evaluation.clarity}/10
- Engagement: ${evaluation.engagement}/10
- Structure: ${evaluation.structure}/10
- SEO-friendliness: ${evaluation.seoFriendliness}/10
</scores>

Specific feedback:

<feedback>
${evaluation.feedback}
</feedback>

Please improve the content while maintaining its core message and keeping it between 400-600 words.`;

  const result = await generateToolInput(prompt, submitContentTool) as SubmitContentToolInput;
  return result.optimizedContent;
}
