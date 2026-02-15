import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslationResult, TranslationDirection } from "../types";

export const translateWithAnalysis = async (text: string, direction: TranslationDirection): Promise<TranslationResult> => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key missing. Check Vercel Settings.");
  }

  // මෙතනදී අපි v1beta භාවිතා කරනවා. Flash මොඩලය හොඳින්ම වැඩ කරන්නේ මෙතනයි.
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash-latest" }, 
    { apiVersion: "v1beta" }
  );

  const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
  const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

  const prompt = `
    You are a high-end linguistic translator.
    Translate the following ${sourceLang} text to ${targetLang}: "${text}"
    
    Provide the response ONLY as a JSON object with these keys:
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
    
    // AI එක අමතර වචන එව්වත් JSON එක විතරක් කඩා ගන්න Regex එකක් භාවිතා කරමු
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format from AI");
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      translatedText: parsed.translatedText || "",
      confidence: parsed.confidence || 0,
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      clarification: parsed.clarification || "",
      detailedAnalysis: Array.isArray(parsed.detailedAnalysis) ? parsed.detailedAnalysis : []
    };
  } catch (error) {
    console.error("Gemini Error:", error);
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
