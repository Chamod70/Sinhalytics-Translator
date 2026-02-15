import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationResult, TranslationDirection } from "../types";

export const translateWithAnalysis = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  // Vite වලදී Env variables ගන්නා නිවැරදි ක්‍රමය
  const apiKey = (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please check Vercel Environment Variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 'gemini-1.5-flash' වෙනුවට 'gemini-1.5-flash-latest' භාවිතා කිරීම වඩාත් ස්ථාවරයි
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  const prompt = `
    You are a linguistic expert. Translate the following ${sourceLang} text to ${targetLang}: "${text}"
    
    Provide the response ONLY as a valid JSON object with these keys:
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
    
    // JSON එක පමණක් ලබා ගැනීමට Regex භාවිතා කරමු (Safety net)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not find JSON in response");
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      translatedText: parsed.translatedText || "",
      confidence: parsed.confidence || 0,
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      clarification: parsed.clarification || "",
      detailedAnalysis: Array.isArray(parsed.detailedAnalysis) ? parsed.detailedAnalysis : []
    };
  } catch (error) {
    console.error("Translation error details:", error);
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
