import { z } from "zod";
import { resumeSchema } from "@/lib/resume-schema";

const requestSchema = z.object({
  resume: resumeSchema,
  targetRole: z.string().trim().max(160).default(""),
  jobDescription: z.string().trim().max(15_000).default(""),
});

const aiResultSchema = z.object({
  summary: z.string(),
  experience: z.array(z.object({ id: z.string(), bullets: z.array(z.string()) })),
  projects: z.array(z.object({ id: z.string(), bullets: z.array(z.string()) })),
  review: z.object({
    headline: z.string(),
    changes: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
});

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "experience", "projects", "review"],
  properties: {
    summary: { type: "string" },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "bullets"],
        properties: { id: { type: "string" }, bullets: { type: "array", items: { type: "string" } } },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "bullets"],
        properties: { id: { type: "string" }, bullets: { type: "array", items: { type: "string" } } },
      },
    },
    review: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "changes", "warnings"],
      properties: {
        headline: { type: "string" },
        changes: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    if (!apiKey) {
      return Response.json({
        error: "AI Improve is ready, but GROQ_API_KEY is not configured. Add it to .env.local and restart the local server.",
        code: "missing_api_key",
      }, { status: 503 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_completion_tokens: 8_000,
        messages: [
          {
            role: "system",
            content: "You are a senior resume editor. Improve clarity, action verbs, ATS keyword alignment, and concision. Never invent employers, roles, dates, technologies, degrees, metrics, or outcomes. Keep every supplied id exactly unchanged. Rewrite only the summary and bullet text. Return every experience and project item in the same order. If a useful metric is missing, flag it as a warning instead of making one up.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Return an improved resume draft as strict JSON.",
              targetRole: body.targetRole || "Use the current professional title",
              jobDescription: body.jobDescription || "No job description supplied; optimize for the current profile.",
              resume: body.resume,
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "resume_improvement", strict: true, schema: responseSchema },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json({ error: "Groq could not improve the resume right now.", detail: detail.slice(0, 800) }, { status: response.status });
    }

    const completion = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("The model returned an empty response.");
    const improved = aiResultSchema.parse(JSON.parse(content));

    const sourceExperienceIds = new Set(body.resume.experience.map((item) => item.id));
    const sourceProjectIds = new Set(body.resume.projects.map((item) => item.id));
    const validExperience = new Map(improved.experience.filter((item) => sourceExperienceIds.has(item.id)).map((item) => [item.id, item.bullets]));
    const validProjects = new Map(improved.projects.filter((item) => sourceProjectIds.has(item.id)).map((item) => [item.id, item.bullets]));

    const resume = resumeSchema.parse({
      ...body.resume,
      summary: improved.summary,
      experience: body.resume.experience.map((item) => ({ ...item, bullets: validExperience.get(item.id) || item.bullets })),
      projects: body.resume.projects.map((item) => ({ ...item, bullets: validProjects.get(item.id) || item.bullets })),
    });

    return Response.json({ resume, review: improved.review, model });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "The resume JSON is not valid.", issues: error.issues }, { status: 400 });
    }
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected AI error." }, { status: 500 });
  }
}
