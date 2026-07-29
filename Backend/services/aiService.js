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

Your response must:
- Be a single paragraph.
- Be between 50 and 100 words.
- Clearly explain the bug, expected behavior, actual behavior, and its impact.
- Use professional, natural language.
- Do not use markdown, headings, bullet points, labels, or quotes.
- Return only the summary.`,
			},
			{
				role: "user",
				content: `Bug Report:\n${bugData}`,
			},
		],
		max_tokens: 150,
	});
}
