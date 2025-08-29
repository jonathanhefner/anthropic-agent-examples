import Anthropic from "@anthropic-ai/sdk";
import { generateToolInput } from "./common.js";

interface SubmitBlogPostToolInput {
  content: string;
  title: string;
}

const submitBlogPostTool: Anthropic.Tool = {
  name: "submit_blog_post",
  description: "Submit a generated blog post, including a compelling title",
  input_schema: {
    type: "object",
    properties: {
      content: {
        type: "string",
        description: "The complete blog post content (400-600 words)",
      },
      title: {
        type: "string",
        description: "A compelling title for the blog post",
      },
    },
    required: ["content", "title"]
  }
};

export async function generateBlogPost(topic: string): Promise<string> {
  const prompt =
`Generate a blog post about <topic>${topic}</topic>.  The post should be 400-600 words, informative, and engaging for a general audience. Include a compelling title.`;

  const result = await generateToolInput(prompt, submitBlogPostTool) as SubmitBlogPostToolInput;
  return `# ${result.title}\n\n${result.content}`;
}
