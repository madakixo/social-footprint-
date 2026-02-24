import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContent(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Using gemini-3-flash-preview for general text tasks
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Error generating content.';
  }
}
