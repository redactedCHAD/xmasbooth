/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import Polaroid from './Polaroid';
import ChatInput from './ChatInput';
import { Style } from '../types';

interface ResultViewProps {
  style: Style;
  imageUrl: string;
  videoUrl: string | null;
  onReset: () => void;
  onEdit: (prompt: string) => void;
  onBringToLife: () => void;
  isRegenerating: boolean;
  editError: string | null;
  videoError: string | null;
}

const ResultView: React.FC<ResultViewProps> = ({ style, imageUrl, videoUrl, onReset, onEdit, onBringToLife, isRegenerating, editError, videoError }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const theme = style.theme;
  const btn = theme.button;
  
  const handleDownload = () => {
    const link = document.createElement('a');
    if (videoUrl) {
      link.href = videoUrl;
      link.download = `${style.id}-video.mp4`;
    } else {
      link.href = imageUrl;
      link.download = `${style.id}-photo.png`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (platform: 'x' | 'facebook') => {
    const shareText = style.shareText;
    const appUrl = window.location.href;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(appUrl);
    let shareUrl = '';

    if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
    }
  };

  const hasVideo = !!videoUrl;

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <Polaroid 
        imageUrl={imageUrl} 
        videoUrl={videoUrl} 
        isRegenerating={isRegenerating}
        onClick={() => setIsPreviewOpen(true)}
      />

      {!hasVideo && (
        <div className="w-full max-w-lg mt-8">
          <ChatInput onPromptSubmit={onEdit} disabled={isRegenerating} theme={theme} />
          {editError && (
            <p className={`${theme.accentTextColor} text-center mt-2`}>{editError}</p>
          )}
        </div>
      )}

      {videoError && <p className={`${theme.accentTextColor} text-center mt-4`}>{videoError}</p>}

      <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onReset}
          disabled={isRegenerating}
          className={`py-3 px-8 border-2 text-xl transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${btn.primaryBg} ${btn.primaryText} ${btn.primaryBorder} ${btn.primaryHoverBg} ${btn.primaryActiveBg}`}
        >
          START OVER
        </button>
        <button
          onClick={handleDownload}
          disabled={isRegenerating}
          className={`py-3 px-8 border-2 text-xl transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${btn.secondaryBg} ${btn.secondaryText} ${btn.secondaryBorder} ${btn.secondaryHoverBg} ${btn.secondaryActiveBg}`}
        >
          {hasVideo ? 'DOWNLOAD VIDEO' : 'DOWNLOAD'}
        </button>
        {!hasVideo && (
            <button
                onClick={onBringToLife}
                disabled={isRegenerating}
                className={`py-3 px-8 border-2 text-xl transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${btn.tertiaryBg} ${btn.tertiaryText} ${btn.tertiaryBorder} ${btn.tertiaryHoverBg} ${btn.tertiaryActiveBg}`}
            >
                BRING TO LIFE
            </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="mb-2">Share your creation!</p>
        <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleShare('x')}
              className="bg-gray-800 text-white py-2 px-4 border-2 border-gray-600 hover:bg-gray-700 active:bg-gray-900 text-lg transform hover:scale-105 transition-transform flex items-center"
              aria-label="Share on X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633z"/>
              </svg>
              X
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 text-white py-2 px-4 border-2 border-blue-400 hover:bg-blue-500 active:bg-blue-700 text-lg transform hover:scale-105 transition-transform flex items-center"
              aria-label="Share on Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
              </svg>
              Facebook
            </button>
        </div>
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="relative p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full h-10 w-10 flex items-center justify-center text-2xl font-bold border-2 border-white z-10 hover:bg-red-600 transition-colors"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close preview"
            >
              &times;
            </button>
            {hasVideo ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="max-w-[90vw] max-h-[90vh] object-contain" 
              />
            ) : (
              <img 
                src={imageUrl} 
                alt="Full size 80s glamour shot" 
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;