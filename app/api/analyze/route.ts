import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Google AI SDK instance securely
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    console.log(`[AetherCode Pipeline]: Initiating query payload connection to Google SDK for language: ${language}`);

    // Execute content generation targeting the latest resilient multimodal model engine
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
      throw new Error("Empty character buffer sequence returned from server gateway.");
    }

    console.log("[AetherCode Pipeline]: Content deconstruction compiled successfully from remote cluster.");
    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("API Gateway Exception Logged:", error);
    
    // Check if the failure pattern matches a pure network handshake timeout
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          error: "Google API Gateway Connection Timeout", 
          details: "The network request timed out while contacting Google servers. Please verify internet stability or try a different connection/network hotspot."
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to evaluate code metrics profile", details: error.message },
      { status: 500 }
    );
  }
}