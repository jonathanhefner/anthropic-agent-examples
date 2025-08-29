import { anthropic, isText } from "./common.js";
import { performResearch } from "./performResearch.js";

function getSectionPrompts(company: string) {
  company = `<company>${company}</company>`;

  return [
    {
      section: "Company Overview",
      prompt:
`Provide a comprehensive company overview for ${company}.  Include:

- Founding date and founders
- Company mission and vision
- Headquarters location
- Number of employees (approximate)
- Primary products/services

Keep it concise but informative (2-3 paragraphs).`,
    },
    {
      section: "Business Model",
      prompt:
`Analyze the business model of ${company}.  Focus on:

- Primary revenue streams
- Target customer segments
- Value proposition
- Distribution channels
- Key partnerships

Provide specific examples where possible (2-3 paragraphs).`,
    },
    {
      section: "Recent News",
      prompt:
`Summarize recent news and developments for ${company}.  Include:

- Major announcements in the past 6 months
- Product launches or updates
- Strategic partnerships or acquisitions
- Any significant changes in leadership

Focus on the most impactful developments (2-3 paragraphs).`,
    },
    {
      section: "Competitive Analysis",
      prompt:
`Analyze the competitive landscape for ${company}.  Cover:

- Top 3-5 direct competitors
- Market positioning and differentiators
- Competitive advantages
- Market share considerations
- Industry trends affecting competition

Be specific about how they compare (2-3 paragraphs).`,
    },
    {
      section: "Financial Health",
      prompt:
`Assess the financial health and performance of ${company}. Include:

- Revenue trends (if public)
- Profitability status
- Recent funding rounds (if private)
- Valuation information
- Financial outlook and challenges

Use available data and be clear about limitations (2-3 paragraphs).`,
    }
  ];
}


export async function generateCompanyReport(company: string): Promise<string> {
  const sectionPromises = getSectionPrompts(company).map(async ({ section, prompt }) => {
    const tag = section.toLowerCase().replaceAll(" ", "_");
    return `${section}:\n<${tag}>\n${await performResearch(prompt)}\n</${tag}>\n`;
  });

  const information = (await Promise.allSettled(sectionPromises)).map((settled) => {
    return settled.status === "fulfilled" ? settled.value : "";
  }).join("\n");

  const prompt =
`Here is some information about <company>${company}</company>, the company:

<company_information>
${information}
</company_information>

First, synthesize key insights from the above information.

Then, write an executive summary about <company>${company}</company> (4-6 sentences).`

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content.filter(isText).map((block) => block.text).join("");
}
