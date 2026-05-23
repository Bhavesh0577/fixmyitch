import { convertToModelMessages, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createClient } from '@/utils/supabase/server';

const perplexity = createOpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || process.env.PPLX_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Sign in to analyze and publish startup ideas.', { status: 401 });
  }

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
      'The product is an idea marketplace where people submit real itches, compare demand, and discover what to build next.',
      'Search broadly across startup communities, app stores, product directories, reviews, forums, and public web sources when useful.',
      'Be practical, specific, and skeptical. Prefer grounded pain-point evidence over generic startup advice.',
      "Return concise, well-structured markdown only.",
      "Always format the answer with exactly these sections in this order:",
      "1. ## Similar products",
      "2. ## Uniqueness score",
      "3. ## Overall score",
      "4. ## Demand signal",
      "5. ## Build difficulty",
      "6. ## Best early audience",
      "7. ## MVP wedge",
      "8. ## Monetization",
      "9. ## Risks",
      "10. ## Market-ready suggestions",
      "Use short bullet points under each section.",
      "If you mention scores, write them as 'X / 10'.",
      'Name at least 3 similar products or substitutes if they exist.',
      'Include one source link when a claim depends on a specific existing product or public signal.',
      "Avoid long paragraphs, hype, and filler text.",
    ].join(' '),
  });

  return result.toUIMessageStreamResponse();
}
