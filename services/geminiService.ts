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
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  const prompt = `
    You are an expert linguistic translator specializing in ${sourceLang} to ${targetLang} translation.
    
    Your task is to:
    1. Translate the provided ${sourceLang} text to natural-sounding ${targetLang}.
    2. Analyze the context carefully. specifically checking "before and after" words for each key segment to determine the correct meaning (e.g., distinguishing between homonyms or context-dependent verbs).
    3. Provide "guesses" or alternative interpretations if the input is ambiguous or fragmentary.
    4. Clarify grammatical nuances or cultural context.

    Input Text: "${text}"

    Return the response strictly in JSON format matching this schema:
    {
      "translatedText": "The main translation",
      "confidence": 95,
      "guesses": ["Alternative 1", "Alternative 2"],
      "clarification": "A summary explaining the sentence structure and tone.",
      "detailedAnalysis": [
        {
          "word": "Source Word/Phrase",
          "meaning": "Target Definition",
          "contextCheck": "Explanation of how words appearing before or after this word influenced the translation."
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            guesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            clarification: { type: Type.STRING },
            detailedAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  contextCheck: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(jsonText);
    
    // Ensure arrays exist to prevent UI crashes if AI omits fields
    const result: TranslationResult = {
      translatedText: parsed.translatedText || "",
      confidence: parsed.confidence || 0,
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      clarification: parsed.clarification || "",
      detailedAnalysis: Array.isArray(parsed.detailedAnalysis) ? parsed.detailedAnalysis : []
    };

    return result;

  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const playTextToSpeech = async (text: string): Promise<void> => {
  if (!process.env.API_KEY) return;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const audioBuffer = await decodeAudioData(base64Audio, audioContext);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
