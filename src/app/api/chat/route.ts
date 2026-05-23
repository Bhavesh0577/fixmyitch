import { convertToModelMessages, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || process.env.PPLX_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
});

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Missing chat messages', { status: 400 });
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: perplexity.chat('sonar-pro'),
    messages: modelMessages,
    system: [
      "You are an AI assistant for 'Fix My Itch by Mandira'.",
      "Return concise, well-structured markdown only.",
      "Always format the answer with exactly these sections in this order:",
      "1. ## Similar products",
      "2. ## Uniqueness score",
      "3. ## Overall score",
      "4. ## Market-ready suggestions",
      "Use short bullet points under each section.",
      "If you mention scores, write them as 'X / 10'.",
      "Avoid long paragraphs, hype, and filler text.",
    ].join(' '),
  });

  return result.toUIMessageStreamResponse();
}
