import React, { useState, useEffect } from 'react';
import { TranslationResult, TranslationDirection } from '../types';
import { ICONS } from '../constants';

interface ResultAreaProps {
  result: TranslationResult | null;
  onPlayAudio: (text: string) => void;
  isAudioPlaying: boolean;
  direction: TranslationDirection;
}

const ResultArea: React.FC<ResultAreaProps> = ({ result, onPlayAudio, isAudioPlaying, direction }) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Reset copied state when result changes
  useEffect(() => {
    setCopiedText(false);
    setCopiedReport(false);
  }, [result]);

  const handleCopyText = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleCopyFullReport = () => {
    if (!result) return;

    const sourceLang = direction === 'si-en' ? 'Sinhala' : 'English';
    const targetLang = direction === 'si-en' ? 'English' : 'Sinhala';

    let report = `--- SINHALYTICS TRANSLATION REPORT ---\n`;
    report += `Direction: ${sourceLang} to ${targetLang}\n`;
    report += `Translation: ${result.translatedText}\n`;
    report += `Confidence: ${result.confidence}%\n\n`;

    if (result.guesses && result.guesses.length > 0) {
      report += `Alternative Guesses:\n- ${result.guesses.join('\n- ')}\n\n`;
    }

    report += `Clarification:\n${result.clarification}\n\n`;

    if (result.detailedAnalysis && result.detailedAnalysis.length > 0) {
      report += `Detailed Analysis (Context Checks):\n`;
      result.detailedAnalysis.forEach((item, index) => {
        report += `${index + 1}. ${item.word}\n`;
        report += `   Meaning: ${item.meaning}\n`;
        report += `   Context Check: ${item.contextCheck}\n`;
      });
    }

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const targetLabel = direction === 'si-en' ? "English" : "Sinhala";

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
        <ICONS.Analyze className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-center font-medium">Ready to translate</p>
        <p className="text-sm text-center mt-1 text-gray-400">
           Enter text to see translation, context checks, and linguistic guesses.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto pr-1">
      {/* Primary Translation Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
        <div className="bg-primary-50 px-4 py-3 border-b border-primary-100 flex justify-between items-center">
          <span className="text-sm font-semibold text-primary-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {targetLabel} Translation
          </span>
          <div className="flex items-center gap-2">
             <span className="text-xs font-mono text-primary-600 bg-white px-2 py-0.5 rounded border border-primary-100">
               {result.confidence}% Confidence
             </span>
             
             <button 
               onClick={handleCopyText}
               className="text-primary-600 hover:text-primary-800 p-1.5 hover:bg-primary-100 rounded transition-colors"
               title="Copy Translation Text"
             >
               {copiedText ? (
                 <ICONS.Success className="w-4 h-4 text-green-600" />
               ) : (
                 <ICONS.Copy className="w-4 h-4" />
               )}
             </button>

             <button 
               onClick={() => onPlayAudio(result.translatedText)}
               disabled={isAudioPlaying}
               className="text-primary-600 hover:text-primary-800 p-1.5 hover:bg-primary-100 rounded transition-colors"
               title="Listen"
             >
               <ICONS.Speaker className={`w-4 h-4 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
             </button>
          </div>
        </div>
        <div className="p-6">
          <p className={`text-2xl text-gray-800 font-medium leading-relaxed ${direction === 'en-si' ? 'font-sinhala' : 'font-sans'}`}>
            {result.translatedText}
          </p>
        </div>
        
        {result.guesses && result.guesses.length > 0 && (
          <div className="px-6 pb-4 pt-0">
             <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Alternative Guesses:</p>
             <div className="flex flex-wrap gap-2">
               {result.guesses.map((guess, i) => (
                 <span key={i} className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200 ${direction === 'en-si' ? 'font-sinhala' : 'font-sans'}`}>
                   {guess}
                 </span>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Analysis & Context Check */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-grow">
        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
          <span className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
            <ICONS.Dictionary className="w-4 h-4" />
            Context & "Before/After" Check
          </span>
          <button 
            onClick={handleCopyFullReport}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors shadow-sm"
            title="Copy everything including analysis"
          >
            {copiedReport ? (
              <>
                <ICONS.Success className="w-3.5 h-3.5" />
                <span>Report Copied!</span>
              </>
            ) : (
              <>
                <ICONS.Copy className="w-3.5 h-3.5" />
                <span>Copy Full Report</span>
              </>
            )}
          </button>
        </div>
        
        <div className="p-4 space-y-4">
            {/* Clarification Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ICONS.Alert className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                           {result.clarification}
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Word Analysis */}
            <div className="space-y-3">
                {result.detailedAnalysis && result.detailedAnalysis?.length > 0 ? (
                    result.detailedAnalysis.map((item, idx) => (
                        <div key={idx} className="group border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-base font-bold text-gray-900 ${direction === 'si-en' ? 'font-sinhala' : 'font-sans'}`}>{item.word}</h4>
                                <span className="text-xs text-gray-400 font-mono">Word #{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Meaning: <span className="text-gray-800">{item.meaning}</span></p>
                            
                            <div className="mt-2 bg-indigo-50/50 p-2 rounded text-xs text-indigo-900 border border-indigo-100/50">
                                <strong className="block text-indigo-700 mb-0.5">Analysis (Before/After):</strong>
                                {item.contextCheck}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 italic text-center py-4">
                        No specific word analysis returned for this phrase.
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultArea;