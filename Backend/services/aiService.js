import env from "../config/env.js";
import Groq from "groq-sdk";
import { findBugById } from "../repositories/bugRepository.js";
import { badRequest } from "../utils/appError.js";

const groq = new Groq({
  apiKey: env.groqApiKey,
});

export async function getAiSummary(bugId) {
  const bugData = await findBugById(bugId);
  if (!bugData) {
    throw badRequest("Bug not found");
  }
  const chatCompletion = await getGroqChatCompletion(bugData);
  return chatCompletion.choices[0]?.message?.content;
}

async function getGroqChatCompletion(bugData) {
  return groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a senior software engineer who summarizes bug reports.

Return the response in exactly this format:

Bug:
<1-2 sentence description>

Expected Behavior:
<what should happen>

Actual Behavior:
<what is happening instead>

Impact:
<how this affects users or the application>

Requirements:
- Each section should be concise.
- Keep the total response under 100 words.
- Do not use markdown or bullet points.
- Return only the formatted summary.`,
      },
      {
        role: "user",
        content: `Bug Report:\n${bugData}`,
      },
    ],
    max_tokens: 150,
  });
}
