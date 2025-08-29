import Anthropic from "@anthropic-ai/sdk";
import { generateToolInput } from "./common.js";

interface SubmitEvaluationToolInput {
  clarity: number;
  engagement: number;
  structure: number;
  seoFriendliness: number;
  feedback: string;
}

const submitEvaluationTool: Anthropic.Tool = {
  name: "submit_blog_post_evaluation",
  description: "Submit an evaluation for blog post content, including scores across multiple criteria and detailed feedback",
  input_schema: {
    type: "object",
    properties: {
      clarity: {
        type: "number",
        description: "Clarity score from 1-10 (how clear and understandable the content is)",
        minimum: 1,
        maximum: 10,
      },
      engagement: {
        type: "number",
        description: "Engagement score from 1-10 (how interesting and compelling the content is)",
        minimum: 1,
        maximum: 10,
      },
      structure: {
        type: "number",
        description: "Structure score from 1-10 (how well-organized and logical the flow is)",
        minimum: 1,
        maximum: 10,
      },
      seoFriendliness: {
        type: "number",
        description: "SEO-friendliness score from 1-10 (use of keywords, headings, readability)",
        minimum: 1,
        maximum: 10,
      },
      feedback: {
        type: "string",
        description: "Detailed feedback explaining the scores and suggesting specific improvements",
      },
    },
    required: ["clarity", "engagement", "structure", "seoFriendliness", "feedback"],
  },
};

export interface BlogPostEvaluation extends SubmitEvaluationToolInput {
  overallScore: number;
}

export async function evaluateBlogPost(content: string): Promise<BlogPostEvaluation> {
  const prompt =
`Please evaluate this blog post content across the following criteria:

<criteria>
1. Clarity (1-10): How clear and understandable is the content?
2. Engagement (1-10): How interesting and compelling is the content?
3. Structure (1-10): How well-organized and logical is the flow?
4. SEO-friendliness (1-10): Does it use keywords effectively, have good headings, and maintain readability?
</criteria>

Blog post content:

<content>
${content}
</content>

Provide scores and detailed feedback for improvements.`;

  const result = await generateToolInput(prompt, submitEvaluationTool) as SubmitEvaluationToolInput;

  const { clarity, engagement, structure, seoFriendliness } = result;
  const overallScore = Math.round((clarity + engagement + structure + seoFriendliness) / 4);

  return { ...result, overallScore };
}
