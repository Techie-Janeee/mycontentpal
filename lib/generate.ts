import OpenAI from "openai";
import { GenerateInput } from "@/types";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export function buildPrompt(input: GenerateInput) {
  const platform = input.platform;
  const niche = input.niche;

  let systemPrompt = [
    "You are MyContentPal, an expert content strategist for creators and small business owners.",
    "",
    "You output ONLY valid JSON — no markdown, no code fences, no extra text before or after.",
    "",
    "Your job is to help users improve their content, grow their audience, and create better social media content.",
    "",
    "You only answer questions related to:",
    "- Content creation",
    "- Content strategy",
    "- Social media growth",
    "- Content ideas",
    "- Hooks",
    "- Positioning",
    "- Audience engagement",
    "- Creator branding",
    "- Instagram and TikTok content",
    "",
    "QUALITY RULES FOR STRING VALUES INSIDE THE JSON:",
    "- Use plain English only — no markdown, no asterisks, no bold, no bullet symbols, no em-dashes",
    "- Write naturally as if advising a friend — direct, helpful, and encouraging",
    "- Be specific and personalized to the user's niche and platform — never generic",
    "- Keep each string concise (1-3 sentences max) — no fluff, no filler",
    "- Avoid jargon, complicated words, robotic AI language, and guaranteed growth claims",
    "- Never invent fake creator data or statistics",
    "",
    "If the user gives incomplete or vague information, include a clarifying question as the first item instead of generating low-quality output.",
    "",
    "Focus on practical advice users can apply immediately.",
  ].join("\n");

  let userPrompt = [
    `I need a "${input.action}" for my ${platform} account.`,
    `My niche is: ${niche}.`,
  ];

  if (input.description) {
    userPrompt.push(`Here is the context the user shared about their page. Use this as the primary source for tailoring your response:\n---\n${input.description}\n---`);
  }

  userPrompt.push("");
  userPrompt.push("CRITICAL REQUIREMENTS:");
  userPrompt.push("- Base EVERY part of your response on the niche, platform, and description above.");
  userPrompt.push("- Do NOT give generic advice that could apply to any account.");
  userPrompt.push("- Reference real ${platform} content formats and trends where relevant.");
  userPrompt.push("- Every item must feel tailored to THIS specific user.");
  userPrompt.push("- Output the JSON only, no greetings, no explanations outside the JSON.");

  let expectedFormat = "";

  switch (input.action) {
    case "content-audit":
      expectedFormat = [
        `{`,
        `  "positioning": "2-3 sentence summary of my current positioning based on what I described",`,
        `  "improvements": [`,
        `    "Specific, actionable improvement point #1 based on my niche/description",`,
        `    "Specific, actionable improvement point #2",`,
        `    "Specific, actionable improvement point #3"`,
        `  ]`,
        `}`,
      ].join("\n");
      userPrompt.push("- improvements array must have exactly 3 items, each tailored to my niche/platform.");
      break;
    case "idea-generation":
      expectedFormat = [
        `{`,
        `  "ideas": [`,
        `    { "hook": "The exact hook sentence", "caption": "Full caption concept (2-3 sentences)", "format": "Reel/Carousel/Static/Trend" },`,
        `    ...`,
        `  ]`,
        `}`,
      ].join("\n");
      userPrompt.push("- ideas array must contain exactly 5 items.");
      userPrompt.push("- Each hook must be a real, postable hook tailored to my niche, not generic.");
      userPrompt.push("- Each caption must be 2-3 sentences of actual content, not placeholders.");
      userPrompt.push("- Format must specify the actual ${platform} content type (e.g. Reel, Carousel, Trend, Story).");
      break;
    case "strategy-recommendation":
      expectedFormat = [
        `{`,
        `  "actions": [`,
        `    { "priority": 1, "action": "Specific action I can take this week", "reason": "Why this matters for my niche/platform" },`,
        `    ...`,
        `  ]`,
        `}`,
      ].join("\n");
      userPrompt.push("- actions array must contain exactly 3 items, prioritised 1 (most important) to 3.");
      userPrompt.push("- Each action must be something I can literally do this week, not vague strategy.");
      userPrompt.push("- The reason must explain why this specifically helps a ${niche} creator on ${platform}.");
      break;
    case "competitor-insights":
      expectedFormat = [
        `{`,
        `  "patterns": [`,
        `    { "pattern": "Pattern observed in top creators", "example": "A real example of how creators do this", "takeaway": "How I can apply this to my content" },`,
        `    ...`,
        `  ]`,
        `}`,
      ].join("\n");
      userPrompt.push("- patterns array must contain 3-5 items.");
      userPrompt.push("- Each pattern must be specific to the ${niche} niche on ${platform}.");
      userPrompt.push("- Each takeaway must be actionable for a beginner creator, not abstract.");
      break;
  }

  userPrompt.push(`\nRespond ONLY with valid JSON matching this structure:\n${expectedFormat}`);

  return { systemPrompt, userPrompt: userPrompt.join("\n") };
}

export async function generateContent(input: GenerateInput) {
  const { systemPrompt, userPrompt } = buildPrompt(input);

  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;

  if (!content) {
    throw new Error("No content generated");
  }

  try {
    const cleaned = content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response", content);
    throw new Error("Failed to parse AI response into structured JSON.");
  }
}
