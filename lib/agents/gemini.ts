/**
 * Gemini Client
 * =============
 * Wrapper for Google Gemini API using LangChain.
 * Uses gemini-2.5-flash for lower cost and better performance.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let geminiInstance: ChatGoogleGenerativeAI | null = null;

export function getGemini(): ChatGoogleGenerativeAI {
  if (!geminiInstance) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is required");
    }
    
    geminiInstance = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey,
      temperature: 0.7,
      maxOutputTokens: 8192,
    });
  }
  return geminiInstance;
}

/**
 * Generate text using Gemini
 */
export async function generateText(prompt: string): Promise<string> {
  const model = getGemini();
  const response = await model.invoke(prompt);
  return typeof response.content === "string" 
    ? response.content 
    : JSON.stringify(response.content);
}

/**
 * Generate JSON using Gemini with parsing
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getGemini();
  const fullPrompt = `${prompt}\n\nRespond with ONLY valid JSON, no markdown code blocks.`;
  
  const response = await model.invoke(fullPrompt);
  const text = typeof response.content === "string" 
    ? response.content 
    : JSON.stringify(response.content);
  
  // Clean up markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  }
  
  return JSON.parse(cleaned) as T;
}

/**
 * Lazy model proxy for modules that import `geminiModel` directly.
 */
export const geminiModel = {
  invoke: (prompt: string) => getGemini().invoke(prompt),
};
