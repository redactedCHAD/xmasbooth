/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Style } from '../types';

interface VideoPromptModalProps {
  onClose: () => void;
  onSubmit: (prompt: string, apiKey: string) => void;
  apiKey: string | null;
  onSetApiKey: (key: string) => void;
  theme: Style['theme'];
}

const VideoPromptModal: React.FC<VideoPromptModalProps> = ({ onClose, onSubmit, apiKey, onSetApiKey, theme }) => {
  const [prompt, setPrompt] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const btn = theme.button;

  const isApiKeyNeeded = !apiKey;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyToUse = apiKey || keyInput.trim();
    if (keyToUse && prompt.trim()) {
      if (isApiKeyNeeded) {
        onSetApiKey(keyToUse);
      }
      onSubmit(prompt.trim(), keyToUse);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 animate-fade-in" onClick={onClose}>
      <div className={`p-8 w-full max-w-lg relative border-2 ${theme.bg === '#e0f2fe' ? 'bg-white' : 'bg-gray-900'} ${theme.accentBorderClass} ${theme.boxGlowClass}`} onClick={e => e.stopPropagation()}>
        <h3 className={`text-2xl mb-4 text-center ${theme.glowAccentClass}`}>{`Bring Your Photo to Life!`}</h3>
        
        {isApiKeyNeeded && (
          <div className="text-center mb-6">
            <p className="mb-2">
              To generate a video, please provide your Google AI API key.
            </p>
            <p className="text-sm">
              <a 
                href="https://ai.google.dev/gemini-api/docs/api-key" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`underline hover:${theme.accentTextColor} transition-colors`}
              >
                Get your API key here.
              </a> It will be saved for this session.
            </p>
          </div>
        )}

        <p className="text-center mb-6">Describe how you want this image to move. (e.g., "The person winks and the Christmas lights flash")</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {isApiKeyNeeded && (
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your API key here"
              required
              className={`w-full border-2 p-3 focus:outline-none focus:ring-2 ${theme.containerBgClass} ${theme.borderClass} ${theme.mainTextColor} focus:${theme.accentBorderClass}`}
            />
          )}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Make it move..."
            autoFocus={!isApiKeyNeeded}
            required
            className={`w-full border-2 p-3 focus:outline-none focus:ring-2 ${theme.containerBgClass} ${theme.borderClass} ${theme.mainTextColor} focus:${theme.accentBorderClass}`}
          />
          <div className="flex justify-center space-x-4 pt-2">
             <button type="button" onClick={onClose} className="bg-gray-600 text-white py-2 px-8 border-2 border-gray-400 hover:bg-gray-700 text-lg transition-colors">
              CANCEL
            </button>
            <button type="submit" className={`py-2 px-8 border-2 text-lg transition-colors ${btn.secondaryBg} ${btn.secondaryText} ${btn.secondaryBorder} ${btn.secondaryHoverBg} ${btn.secondaryActiveBg}`}>
              GENERATE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoPromptModal;