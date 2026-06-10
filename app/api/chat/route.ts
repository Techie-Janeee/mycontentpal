import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ratelimit, chatDailyRatelimit } from "@/lib/ratelimit";
import { validateBodySize } from "@/lib/csrf";
import { audit } from "@/lib/audit";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sizeCheck = validateBodySize(req);
  if (sizeCheck !== true) { audit("body-too-large", { route: "chat" }); return sizeCheck; }

  const userId = session.user.id!;
  const { success: allowed } = await ratelimit.limit(userId);
  if (!allowed) {
    audit("rate-limit.exceeded", { route: "chat", userId });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { success: dailyAllowed } = await chatDailyRatelimit.limit(userId);
  if (!dailyAllowed) {
    audit("chat.daily-limit.exceeded", { userId });
    return NextResponse.json({ error: "Daily chat limit reached. You can send up to 25 messages per day." }, { status: 429 });
  }

  try {
    const { message, history, results, niche, platform } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const insightsContext = results
      ? `The user just generated these insights:\n${(() => {
          if (Array.isArray(results)) {
            return results.map((r: any) => {
              const label = r.title || r.hook || r.pattern || r.action || "";
              const desc = r.label || r.caption || r.reason || r.takeaway || "";
              return `- ${label}${desc ? `: ${desc}` : ""}`;
            }).join("\n");
          }
          const parts: string[] = [];
          if (results.positioning) parts.push(`Positioning: ${results.positioning}`);
          if (results.improvements?.length) parts.push(`Improvements: ${results.improvements.join(", ")}`);
          if (results.ideas?.length) {
            results.ideas.forEach((idea: any, i: number) => {
              parts.push(`Idea ${i + 1}: ${idea.hook}, ${idea.caption} (${idea.format})`);
            });
          }
          if (results.actions?.length) {
            results.actions.forEach((a: any) => {
              parts.push(`Priority ${a.priority}: ${a.action}, ${a.reason}`);
            });
          }
          if (results.patterns?.length) {
            results.patterns.forEach((p: any) => {
              parts.push(`Pattern: ${p.pattern}, Example: ${p.example}, Takeaway: ${p.takeaway}`);
            });
          }
          return parts.join("\n");
        })()}`
      : "No insights generated yet.";

    const systemPrompt = [
      "You are MyContentPal, an expert content strategist for creators and small business owners.",
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
      "WRITING RULES:",
      "- Use plain English only — no markdown, no asterisks, no bold, no bullet symbols, no em-dashes",
      "- Break your response into short paragraphs separated by a blank line",
      "- Each paragraph should be 1-3 sentences max — no long blocks of text",
      "- Write naturally as if advising a friend — direct, helpful, and encouraging",
      "- Be specific to the user's niche and platform — never generic",
      "- Avoid jargon, complicated words, robotic AI language, and guaranteed growth claims",
      "- Never invent fake creator data or statistics",
      "",
      "If the user gives incomplete information, ask up to 2 short clarifying questions before answering.",
      "",
      "Focus on practical advice users can apply immediately.",
      "",
      `Context: User's niche is ${niche || "Not specified"}, platform is ${platform || "Not specified"}.`,
      `Here are the user's generated insights for reference:\n${insightsContext}`,
    ].join("\n");

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content || "Sorry, I couldn't process that.";

    return NextResponse.json({ reply });
  } catch (error) {
    audit("chat.error", { userId });
    console.error("[CHAT ERROR]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
