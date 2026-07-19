import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

// ⚡ Crucial: Force initialization layer parameter check explicitly
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code content is empty" }, { status: 400 });
    }

    const prompt = `
      You are an elite automated code analysis engine. Analyze the following code snippet.
      Provided context/language preference: ${language || 'Auto-detect'}.
      
      Perform three tasks:
      1. Identify structural or logical anomalies/bugs.
      2. Check for security vulnerabilities.
      3. Rewrite the code to be production-grade, highly optimized, and clean.
      
      Code to analyze:
      \`\`\`
      ${code}
      \`\`\`
    `;

    console.log(`[AetherCode Pipeline]: Initiating structural check for language: ${language}`);

    // Execute content generation using the base GA production identifier
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  fix: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            },
            security: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            },
            optimizedCode: { type: Type.STRING },
            performanceScore: { type: Type.STRING },
            timeComplexity: { type: Type.STRING }
          },
          required: ["detectedLanguage", "issues", "security", "optimizedCode", "performanceScore", "timeComplexity"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty buffer returned from remote gateway configuration.");
    }

    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("API Gateway Exception Logged:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code diagnostics metrics", details: error.message },
      { status: 500 }
    );
  }
}