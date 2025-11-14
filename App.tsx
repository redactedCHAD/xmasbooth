/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { AppState, Style } from './types';
import { startImageChatSession, continueImageChatSession, generateVideoFromImage } from './services/geminiService';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
import LoadingView from './components/LoadingView';
import ResultView from './components/ResultView';
import VideoPromptModal from './components/VideoPromptModal';
import Spinner from './components/Spinner';
import { Content } from '@google/genai';

const styles: Style[] = [
  {
    id: '80s',
    name: "80's Christmas Photo",
    tagline: 'Your Tacky Holiday Portrait!',
    prompt: "Place this person in a classic 80s Christmas family photo. The scene should be a formal, vertical holiday portrait of a family sitting closely together. Include a father figure in a plain red sweater, centered. The background is a busy interior with a large mantelpiece, a painting, and dark wood. The lighting should be warm and yellowed, evoking an 80s sitcom aesthetic. Generate only the image without any text.",
    shareText: "Check out this totally tacky 80's Christmas photo I made! 🎄 #80sChristmasPhoto #Gemini #AI",
    theme: {
      bg: '#14281d',
      mainTextColor: 'text-green-400',
      accentTextColor: 'text-red-500',
      containerBgClass: 'bg-black bg-opacity-40',
      glowTextClass: 'text-glow-green',
      glowAccentClass: 'text-glow-red',
      borderClass: 'border-green-400',
      accentBorderClass: 'border-red-500',
      boxGlowClass: 'box-glow-green',
      button: {
        primaryBg: 'bg-green-500', primaryText: 'text-black', primaryBorder: 'border-green-300', primaryHoverBg: 'hover:bg-green-400', primaryActiveBg: 'active:bg-green-600',
        secondaryBg: 'bg-red-500', secondaryText: 'text-white', secondaryBorder: 'border-red-400', secondaryHoverBg: 'hover:bg-red-600', secondaryActiveBg: 'active:bg-red-700',
        tertiaryBg: 'bg-yellow-400', tertiaryText: 'text-black', tertiaryBorder: 'border-yellow-200', tertiaryHoverBg: 'hover:bg-yellow-300', tertiaryActiveBg: 'active:bg-yellow-500',
      },
      spinnerClass: ''
    }
  },
  {
    id: 'whoville',
    name: 'Whoville Holiday Card',
    tagline: 'Get Your Grinch On!',
    prompt: "Transform this person into a 2D cartoon character and place them in a colorful, whimsical animated illustration in the style of Dr. Seuss, specifically evoking Whoville. The scene should feature a group of six cartoon characters with long, slender limbs and exaggerated features, dressed in winter clothing. They are standing in a snowy landscape with curvy, bulbous Whoville-style buildings in the background, a large, decorated Christmas tree, and a pink archway sign that reads 'Welcome to Whoville.' The overall mood is joyful and festive, with a hand-drawn, storybook quality. Generate only the image without any text.",
    shareText: "I made a Whoville version of myself for the holidays! Check it out! ❄️ #Whoville #Grinchmas #Gemini #AI",
    theme: {
      bg: '#e0f2fe',
      mainTextColor: 'text-sky-800',
      accentTextColor: 'text-pink-500',
      containerBgClass: 'bg-white bg-opacity-60',
      glowTextClass: 'text-glow-blue',
      glowAccentClass: 'text-glow-pink',
      borderClass: 'border-sky-500',
      accentBorderClass: 'border-pink-500',
      boxGlowClass: 'box-glow-blue',
      button: {
        primaryBg: 'bg-sky-500', primaryText: 'text-white', primaryBorder: 'border-sky-300', primaryHoverBg: 'hover:bg-sky-400', primaryActiveBg: 'active:bg-sky-600',
        secondaryBg: 'bg-pink-500', secondaryText: 'text-white', secondaryBorder: 'border-pink-400', secondaryHoverBg: 'hover:bg-pink-600', secondaryActiveBg: 'active:bg-pink-700',
        tertiaryBg: 'bg-lime-400', tertiaryText: 'text-black', tertiaryBorder: 'border-lime-300', tertiaryHoverBg: 'hover:bg-lime-300', tertiaryActiveBg: 'active:bg-lime-500',
      },
      spinnerClass: 'spinner-whoville'
    }
  }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Content[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleImageReady = useCallback(async ({ data, mimeType }: { data: string; mimeType: string }) => {
    if (!selectedStyle) return;
    setAppState(AppState.PROCESSING);
    setErrorMessage(null);
    setOutputImageUrl(null);
    setConversationHistory([]);
    try {
      const { imageUrl, history } = await startImageChatSession(data, mimeType, selectedStyle.prompt);
      setOutputImageUrl(imageUrl);
      setConversationHistory(history);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`GENERATION FAILED: ${message}`);
      setAppState(AppState.ERROR);
    }
  }, [selectedStyle]);

  const handleEditImage = useCallback(async (prompt: string) => {
    if (!conversationHistory.length) return;
    setIsRegenerating(true);
    setEditErrorMessage(null);
    try {
      const { imageUrl, newHistory } = await continueImageChatSession(conversationHistory, prompt);
      setOutputImageUrl(imageUrl);
      setConversationHistory(newHistory);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setEditErrorMessage(`REMIX FAILED: ${message}`);
    } finally {
      setIsRegenerating(false);
    }
  }, [conversationHistory]);

  const handleGenerateVideo = useCallback(async (prompt: string, keyForGeneration: string) => {
    if (!outputImageUrl) return;
    setShowVideoModal(false);
    setIsGeneratingVideo(true);
    setVideoError(null);
    try {
        const generatedVideoUrl = await generateVideoFromImage(outputImageUrl, prompt, keyForGeneration);
        setVideoUrl(generatedVideoUrl);
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        setVideoError(`VIDEO FAILED: ${message}`);
    } finally {
        setIsGeneratingVideo(false);
    }
  }, [outputImageUrl]);


  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setSelectedStyle(null);
    setOutputImageUrl(null);
    setErrorMessage(null);
    setEditErrorMessage(null);
    setConversationHistory([]);
    setShowVideoModal(false);
    setIsGeneratingVideo(false);
    setVideoUrl(null);
    setVideoError(null);
  }, []);
  
  const currentTheme = selectedStyle?.theme;

  const renderContent = () => {
    if (!selectedStyle) {
      return (
        <div className="w-full text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl text-white mb-8 text-glow-red">CHOOSE YOUR HOLIDAY STYLE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {styles.map(style => (
              <button 
                key={style.id} 
                onClick={() => setSelectedStyle(style)} 
                className="p-6 border-2 border-green-400 bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 transform hover:scale-105 box-glow-green"
              >
                <h3 className={`text-2xl mb-2 ${style.theme.glowTextClass}`}>{style.name}</h3>
                <p className={`${style.theme.accentTextColor}`}>{style.tagline}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    switch (appState) {
      case AppState.PROCESSING:
        return <LoadingView />;
      case AppState.RESULT:
        return outputImageUrl && selectedStyle ? (
          <ResultView
            style={selectedStyle}
            imageUrl={outputImageUrl}
            videoUrl={videoUrl}
            onReset={handleReset}
            onEdit={handleEditImage}
            onBringToLife={() => setShowVideoModal(true)}
            isRegenerating={isRegenerating}
            editError={editErrorMessage}
            videoError={videoError}
          />
        ) : null;
      case AppState.ERROR:
        return (
          <div className={`text-center ${currentTheme?.accentTextColor} ${currentTheme?.containerBgClass} p-6 border ${currentTheme?.accentBorderClass}`}>
            <h2 className="text-2xl mb-4">SYSTEM ERROR</h2>
            <p className="text-lg">{errorMessage}</p>
            <button
              onClick={handleReset}
              className={`mt-6 text-lg py-2 px-6 border-2 
                ${currentTheme?.button.secondaryBg} ${currentTheme?.button.secondaryText} ${currentTheme?.button.secondaryBorder} 
                ${currentTheme?.button.secondaryHoverBg} ${currentTheme?.button.secondaryActiveBg}`}
            >
              TRY AGAIN
            </button>
          </div>
        );
      case AppState.IDLE:
      default:
        return <ImageInput onImageReady={handleImageReady} theme={currentTheme!} />;
    }
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-8 flex flex-col items-center transition-colors duration-500 ${selectedStyle ? currentTheme?.mainTextColor : 'text-green-400'}`}
      style={{
        backgroundColor: currentTheme?.bg ?? '#14281d'
      }}
    >
      {isGeneratingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <Spinner spinnerClass={currentTheme?.spinnerClass}/>
          <p className="text-yellow-300 text-2xl mt-6">BRINGING YOUR PHOTO TO LIFE...</p>
          <p className={`${currentTheme?.mainTextColor} text-lg mt-2`}>(This can take up to a minute)</p>
        </div>
      )}
      {showVideoModal && currentTheme && (
        <VideoPromptModal 
          onClose={() => setShowVideoModal(false)}
          onSubmit={handleGenerateVideo}
          apiKey={apiKey}
          onSetApiKey={setApiKey}
          theme={currentTheme}
        />
      )}
      <Header style={selectedStyle} />
      <main className="w-full max-w-2xl flex-grow flex flex-col justify-center items-center mt-8">
        {renderContent()}
      </main>
      <footer className={`text-center text-sm mt-8 ${selectedStyle ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <p>
          Made by{' '}
          <a
            href="https://x.com/YaakovLyubetsky"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline ${currentTheme ? 'hover:' + currentTheme.accentTextColor : 'hover:text-red-400'} transition-colors`}
          >
            yaakov@
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;