export type TranslationDirection = 'si-en' | 'en-si';

export interface WordAnalysis {
  word: string;
  meaning: string;
  contextCheck: string; // The "before and after" check explanation
}

export interface TranslationResult {
  translatedText: string; // Renamed from englishTranslation to be generic
  confidence: number;
  guesses: string[]; // Alternative interpretations
  clarification: string; // General clarification of the sentence structure
  detailedAnalysis: WordAnalysis[]; // Breakdown of specific terms
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | TranslationResult;
  timestamp: number;
}