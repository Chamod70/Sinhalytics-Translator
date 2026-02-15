import React from 'react';
import { ICONS, SAMPLE_PHRASES } from '../constants';
import { TranslationDirection } from '../types';

interface InputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  direction: TranslationDirection;
  onToggleDirection: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  value, 
  onChange, 
  onTranslate, 
  isTranslating,
  direction,
  onToggleDirection
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      onTranslate();
    }
  };

  const isSinhalaInput = direction === 'si-en';
  const sourceLabel = isSinhalaInput ? "Sinhala" : "English";
  const targetLabel = isSinhalaInput ? "English" : "Sinhala";
  const samples = SAMPLE_PHRASES[direction];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            {sourceLabel} (Input)
          </span>
          
          <button 
            onClick={onToggleDirection}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-all hover:rotate-180"
            title={`Switch to ${targetLabel} -> ${sourceLabel}`}
          >
            <ICONS.Convert className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => onChange('')}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Clear text"
        >
          <ICONS.Clear className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-grow p-4 relative">
        <textarea
          className={`w-full h-full resize-none outline-none text-lg text-gray-800 placeholder-gray-300 bg-transparent ${isSinhalaInput ? 'font-sinhala' : 'font-sans'}`}
          placeholder={isSinhalaInput ? "Type or paste Sinhala text here... (e.g. කොහොමද)" : "Type or paste English text here..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        
        {value.length === 0 && (
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {samples.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => onChange(phrase)}
                className={`text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors ${isSinhalaInput ? 'font-sinhala' : 'font-sans'}`}
              >
                {phrase}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={onTranslate}
          disabled={!value.trim() || isTranslating}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all shadow-md transform active:scale-[0.99]
            ${!value.trim() || isTranslating 
              ? 'bg-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'
            }`}
        >
          {isTranslating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Context...</span>
            </>
          ) : (
            <>
              <ICONS.Convert className="w-5 h-5" />
              <span>Translate & Analyze</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;