import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TranslationResult, TranslationDirection } from "../types";

// Helper to decode Base64 audio
const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioContext.decodeAudioData(bytes.buffer);
};

export const translateWithAnalysis = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  // Vite වලදී පාවිච්චි කරන්නේ මෙහෙමයි
  const apiKey = (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  const prompt = `Translate this ${sourceLang} text to ${targetLang}: "${text}"`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            translatedText: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER },
            guesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            clarification: { type: SchemaType.STRING },
            detailedAnalysis: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  word: { type: SchemaType.STRING },
                  meaning: { type: SchemaType.STRING },
                  contextCheck: { type: SchemaType.STRING }
                }
              }
            }
          }
        }
      }
    });

    const response = result.response;
    const jsonText = response.text();
    const parsed = JSON.parse(jsonText);
    
    return {
      translatedText: parsed.translatedText || "",
      confidence: parsed.confidence || 0,
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      clarification: parsed.clarification || "",
      detailedAnalysis: Array.isArray(parsed.detailedAnalysis) ? parsed.detailedAnalysis : []
    };
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const playTextToSpeech = async (text: string): Promise<void> => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY;
  if (!apiKey) return;
  
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
