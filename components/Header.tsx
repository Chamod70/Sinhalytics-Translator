import React from 'react';
import { ICONS, APP_NAME, APP_TAGLINE } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <ICONS.Convert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{APP_NAME}</h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">{APP_TAGLINE}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {/* Placeholder for future nav items or user profile */}
             <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
                Gemini 2.5 Powered
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
