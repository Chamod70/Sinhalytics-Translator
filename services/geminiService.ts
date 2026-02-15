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
  // සටහන: Vercel හි Environment Variable එක "VITE_API_KEY" ලෙස තිබිය යුතුයි (Frontend එකකදී නම්)
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  // නිවැරදි Class නම: GoogleGenerativeAI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash', // දැනට පවතින ස්ථාවර මොඩලය
  });

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  const prompt = `
    You are an expert linguistic translator specializing in ${sourceLang} to ${targetLang} translation.
    
    Your task is to:
    1. Translate the provided ${sourceLang} text to natural-sounding ${targetLang}.
    2. Analyze the context carefully.
    3. Provide "guesses" or alternative interpretations.
    4. Clarify grammatical nuances.

    Input Text: "${text}"

    Return the response strictly in JSON format matching the schema.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT, // Type වෙනුවට SchemaType භාවිතා කරන්න
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
    if (!jsonText) throw new Error("Empty response from AI");
    
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
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
  if (!apiKey) return;
  
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // සටහන: දැනට TTS සඳහා සහය දක්වන්නේ නිශ්චිත මොඩල පමණි. 
    // මෙය ක්‍රියා නොකරන්නේ නම් සාමාන්‍ය generateContent භාවිතා කරන්න.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent({
      contents: [{ parts: [{ text: `Read this text clearly: ${text}` }] }],
    });

    // TTS සඳහා දැනට ඇති පහසුකම් අනුව Browser එකේ SpeechSynthesis පාවිච්චි කිරීම වඩාත් සුදුසුයි
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);

  } catch (error) {
    console.error("TTS Error:", error);
  }
};
