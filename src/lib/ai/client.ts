import OpenAI from "openai";
import { AiLogStatus, AiPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type JsonAiInput<T> = {
  purpose: AiPurpose;
  prompt: string;
  companyId?: string;
  jobId?: string;
  responseId?: string;
  fallback: T;
};

function parseJson(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(withoutFence);
}

async function createAiLog(input: {
  purpose: AiPurpose;
  status: AiLogStatus;
  model: string;
  prompt: string;
  companyId?: string;
  jobId?: string;
  responseId?: string;
  requestJson?: unknown;
  responseJson?: unknown;
  error?: string;
  latencyMs?: number;
}) {
  await prisma.aiLog.create({
    data: {
      purpose: input.purpose,
      status: input.status,
      model: input.model,
      prompt: input.prompt,
      companyId: input.companyId,
      jobId: input.jobId,
      responseId: input.responseId,
      requestJson: input.requestJson === undefined ? undefined : (input.requestJson as object),
      responseJson: input.responseJson === undefined ? undefined : (input.responseJson as object),
      error: input.error,
      latencyMs: input.latencyMs
    }
  });
}

export async function callJsonAi<T>(input: JsonAiInput<T>): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = "gpt-4o-mini";
  const startedAt = Date.now();

  if (!apiKey) {
    await createAiLog({
      ...input,
      status: AiLogStatus.SUCCESS,
      model: "local-fallback",
      responseJson: input.fallback,
      latencyMs: Date.now() - startedAt
    });
    return input.fallback;
  }

  const client = new OpenAI({ apiKey });
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Tu réponds uniquement en JSON valide. Aucun markdown."
          },
          {
            role: "user",
            content: input.prompt
          }
        ]
      });

      const content = response.choices[0]?.message.content ?? "{}";
      const parsed = parseJson(content) as T;

      await createAiLog({
        ...input,
        status: AiLogStatus.SUCCESS,
        model,
        requestJson: { attempt },
        responseJson: parsed,
        latencyMs: Date.now() - startedAt
      });
      return parsed;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  await createAiLog({
    ...input,
    status: AiLogStatus.ERROR,
    model,
    responseJson: input.fallback,
    error: lastError instanceof Error ? lastError.message : "Erreur OpenAI inconnue",
    latencyMs: Date.now() - startedAt
  });

  return input.fallback;
}
