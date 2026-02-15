import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationResult, TranslationDirection } from "../types";

export const translateWithAnalysis = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your Vercel Environment Variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // v1 endpoint එක භාවිතා කිරීම වඩාත් ස්ථාවරයි
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  // Prompt එක ඇතුළතම JSON Schema එක ලබා දෙමු
  const prompt = `
    You are an expert linguistic translator.
    Translate the following ${sourceLang} text to ${targetLang}: "${text}"
    
    Return the response strictly in JSON format with these keys:
    {
      "translatedText": "string",
      "confidence": number,
      "guesses": ["string"],
      "clarification": "string",
      "detailedAnalysis": [{"word": "string", "meaning": "string", "contextCheck": "string"}]
    }
    
    Important: Return ONLY the JSON object. No markdown, no backticks.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();
    
    // වැරදීමකින් හරි ```json ... ``` ලෙස ආවොත් ඒවා සුද්ද කරමු
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
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
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'si-LK'; 
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("TTS Error:", error);
  }
};
