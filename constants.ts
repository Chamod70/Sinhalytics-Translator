import { LucideIcon, ArrowRightLeft, Sparkles, BookOpen, Mic, Volume2, History, Trash2, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

export const APP_NAME = "Sinhalytics";
export const APP_TAGLINE = "Context-Aware Sinhala <-> English Translation";

export const ICONS = {
  Convert: ArrowRightLeft,
  Analyze: Sparkles,
  Dictionary: BookOpen,
  Mic: Mic,
  Speaker: Volume2,
  History: History,
  Clear: Trash2,
  Success: CheckCircle2,
  Alert: AlertCircle,
  Copy: Copy
};

export const SAMPLE_PHRASES = {
  'si-en': [
    "කොහොමද ඔයාට?",
    "මම හෙට ගෙදර යනවා.",
    "මේක හරිම ලස්සන දවසක්."
  ],
  'en-si': [
    "How are you?",
    "I am going home tomorrow.",
    "This is a beautiful day."
  ]
};