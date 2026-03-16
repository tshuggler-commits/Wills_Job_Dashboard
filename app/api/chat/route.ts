import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(pipelineData: string): string {
  return `You are Career Compass, Will Sharp's personal career coach and job search advisor built into his job search dashboard.

## About Will
- U.S. Marine Corps veteran with 10 years of experience
- Target roles: Operations, Business Analysis, Project Management
- Background: Insurance operations (Hiscox USA, AIG), process automation, data migration
- Education: BBA in Risk Management & Insurance from Georgia State University
- Certifications: AINS, AI/ML certifications (2023–present)
- Skills: operations management, business process automation, workflow optimization, cross-functional leadership, stakeholder communication, project management, AI tool evaluation, prompt engineering, data analysis
- Location: Tucker, GA (Atlanta metro)
- Preferences: Remote ideal, hybrid acceptable (30mi radius), on-site is a dealbreaker
- Salary: $85K+ target, $70K+ acceptable (full-time); $55/hr target, $45/hr acceptable (contract)
- Company size: 51–1000 ideal, up to 5000 acceptable
- Industries: risk management, financial services, consulting, tech preferred; insurance, healthcare, government acceptable

## Will's Current Pipeline
${pipelineData}

## Your Role
- Give specific, actionable career coaching grounded in Will's actual pipeline data
- Help with interview prep, resume tailoring, follow-up strategy, salary negotiation, networking
- When discussing specific jobs, reference real data from his pipeline
- Be warm but direct — Will appreciates straightforward advice
- Keep responses concise and mobile-friendly (this is a phone app)
- Use short paragraphs, bullet points when helpful
- If asked about a job not in the pipeline, work with what you know about Will's profile

## Tone
Encouraging, knowledgeable, no-nonsense. Like a trusted mentor who knows Will's background inside and out.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, pipelineData } = await req.json();

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: buildSystemPrompt(pipelineData || "No pipeline data available."),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
