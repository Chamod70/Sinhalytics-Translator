import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationResult, TranslationDirection } from "../types";

export const translateWithAnalysis = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Check Vercel Environment Variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // මෙතනින් { apiVersion: 'v1' } හෝ 'v1beta' අයින් කරලා බලමු. 
  // SDK එක ඉබේම ගැලපෙන එක තෝරා ගනීවි.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  const prompt = `
    You are a professional translator. Translate the following ${sourceLang} text to ${targetLang}: "${text}"
    
    Provide the result ONLY as a JSON object:
    {
      "translatedText": "string",
      "confidence": number,
      "guesses": ["string"],
      "clarification": "string",
      "detailedAnalysis": [{"word": "string", "meaning": "string", "contextCheck": "string"}]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();
    
    // JSON එක විතරක් තෝරා ගැනීමට Regex එකක් පාවිච්චි කරමු (Safety first)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response");
    
    const parsed = JSON.parse(jsonMatch[0]);
    
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
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'si-LK'; 
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
