import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

// Initialize Gemini API Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateImpactReport = async (projects: Project[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment variable to generate AI reports.";
  }

  const projectSummaries = projects.map(p => 
    `- ${p.title} (${p.status}): Raised PKR ${p.raised} of PKR ${p.budget}. Location: ${p.location}.`
  ).join('\n');

  const prompt = `
    You are a professional grant writer for the Akhundian Foundation Pakistan.
    Write a concise, inspiring 2-paragraph executive summary for our annual impact report based on the following project data.
    Focus on the positive outcome and future goals.
    
    Data:
    ${projectSummaries}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Error generating impact report:", error);
    return "Failed to generate report due to an API error.";
  }
};

export const generateThankYouMessage = async (donorName: string, amount: number, cause: string): Promise<string> => {
  if (!apiKey) return "Thank you for your donation!";

  const prompt = `
    Write a short, warm, and professional thank you note (max 50 words) for a donor named ${donorName} 
    who donated PKR ${amount} to the cause: "${cause}". 
    On behalf of Akhundian Foundation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Thank you for your generous support.";
  } catch (error) {
    return "Thank you so much for your support.";
  }
};