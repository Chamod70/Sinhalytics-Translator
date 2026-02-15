import React, { useState } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ResultArea from './components/ResultArea';
import { translateWithAnalysis, playTextToSpeech } from './services/geminiService';
import { TranslationResult, TranslationDirection } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('si-en');

  const handleToggleDirection = () => {
    setDirection(prev => prev === 'si-en' ? 'en-si' : 'si-en');
    setResult(null); // Clear previous results on switch
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setResult(null);

    try {
      const data = await translateWithAnalysis(inputText, direction);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayAudio = async (text: string) => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    await playTextToSpeech(text);
    // Rough estimate for audio length since we decode raw, 
    // but in a real app we'd attach a listener to the source 'ended' event.
    // The service handles playback, we just toggle state for UI feedback.
    setTimeout(() => setIsAudioPlaying(false), 2000); 
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             {error}
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
          
          {/* Left Column: Input */}
          <section className="h-full">
            <InputArea 
              value={inputText} 
              onChange={setInputText} 
              onTranslate={handleTranslate}
              isTranslating={isTranslating}
              direction={direction}
              onToggleDirection={handleToggleDirection}
            />
          </section>

          {/* Right Column: Result */}
          <section className="h-full">
            <ResultArea 
              result={result}
              onPlayAudio={handlePlayAudio}
              isAudioPlaying={isAudioPlaying}
              direction={direction}
            />
          </section>

        </div>
      </main>
    </div>
  );
};

export default App;