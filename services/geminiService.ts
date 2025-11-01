import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { STRATEGIES } from '../constants';
import type { StrategyKey, SingleResponse, VariationsResponse, ComparisonResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a persistent error to the user.
  // For this context, throwing an error is sufficient.
  console.error("API_KEY environment variable not set. Please ensure it is configured.");
}

const getAIClient = () => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Cannot make API calls.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

const model = 'gemini-2.5-flash';

const callApi = async <T,>(prompt: string, responseSchema: any): Promise<T> => {
  try {
    const ai = getAIClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get a valid response from the AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred during the AI call.");
  }
};


export const generateSingleResponse = async (message: string, context: string, strategyKey: StrategyKey): Promise<SingleResponse> => {
  const strategyDesc = STRATEGIES[strategyKey];
  const prompt = `INCOMING MESSAGE:\n"${message}"\n\nCONTEXT & GOAL:\n"${context}"\n\nSTRATEGY: ${strategyKey}\n${strategyDesc}\n\nGenerate a JSON response with 'reply' (string) and 'analysis' (string) fields. The analysis should explain how the strategy was applied.`;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      reply: { type: Type.STRING },
      analysis: { type: Type.STRING }
    },
    required: ["reply", "analysis"]
  };

  return callApi<SingleResponse>(prompt, schema);
};

export const generateMultipleVariations = async (message: string, context: string, strategyKey: StrategyKey): Promise<VariationsResponse> => {
  const strategyDesc = STRATEGIES[strategyKey];
  const prompt = `INCOMING MESSAGE:\n"${message}"\n\nCONTEXT & GOAL:\n"${context}"\n\nSTRATEGY: ${strategyKey}\n${strategyDesc}\n\nGenerate a JSON response with a 'variations' field. 'variations' should be an array of 3 objects, each with 'title' (e.g., "Variation 1: More Formal") and 'reply' (string) fields.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      variations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reply: { type: Type.STRING }
          },
          required: ["title", "reply"]
        }
      }
    },
    required: ["variations"]
  };

  return callApi<VariationsResponse>(prompt, schema);
};

export const generateComparison = async (message: string, context: string): Promise<ComparisonResponse> => {
    const strategiesText = Object.entries(STRATEGIES).map(([k,v]) => `${k}: ${v}`).join('\n');
    const prompt = `INCOMING MESSAGE:\n"${message}"\n\nCONTEXT & GOAL:\n"${context}"\n\nSTRATEGIES:\n${strategiesText}\n\nGenerate a JSON response with a 'comparison' field. 'comparison' should be an array of 3 objects, each representing a *different*, *relevant* strategy for the context. Each object must have 'strategyName' (string), 'reply' (string), and 'analysis' (string, explaining pros/cons of using that strategy). Also include a 'bestStrategy' (string) field with the name of the recommended strategy from the three.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            comparison: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        strategyName: { type: Type.STRING },
                        reply: { type: Type.STRING },
                        analysis: { type: Type.STRING }
                    },
                    required: ["strategyName", "reply", "analysis"]
                }
            },
            bestStrategy: { type: Type.STRING }
        },
        required: ["comparison", "bestStrategy"]
    };
    
    return callApi<ComparisonResponse>(prompt, schema);
};
