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

const Snowfall: React.FC = () => {
  const snowflakeCount = 100;
  const snowflakes = Array.from({ length: snowflakeCount }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 5 + 5}s`, // 5 to 10 seconds
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
      transform: `scale(${Math.random() * 0.5 + 0.5})`,
    };
    return <div key={i} className="snowflake" style={style}></div>;
  });

  return <div className="snowfall-container">{snowflakes}</div>;
};

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
      spinnerClass: '',
      backgroundEffect: 'snowfall',
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
  },
  {
    id: 'nightmare',
    name: 'Nightmare Holiday',
    tagline: 'Your Spooky Christmas Card!',
    prompt: "Stylize this person in the artistic style reminiscent of 'The Nightmare Before Christmas.' Emphasize characters with exaggeratedly tall and slender figures, particularly noticeable in the male skeleton characters, and more human-like but still stylized proportions for female characters like Sally, featuring her iconic patchwork dress and stitched skin. The facial features should be distinct, with large, expressive eyes (for Sally) or hollow, black sockets (for skeleton characters). The color palette should lean towards cooler, muted tones with deep blues, purples, and greys, punctuated by more vibrant, almost glowing elements like the moon and Sally's colorful dress. The overall aesthetic should have a slightly melancholic yet charming quality, with visible brushstrokes or shading that gives it a hand-drawn, illustrative feel, set against a subtly textured, desolate landscape. Generate only the image without any text.",
    shareText: "I made a spooky-cool Nightmare Before Christmas version of myself! 🎃🎄 #NightmareChristmas #Gemini #AI",
    theme: {
      bg: '#0c0a1a',
      mainTextColor: 'text-purple-300',
      accentTextColor: 'text-orange-400',
      containerBgClass: 'bg-black bg-opacity-50',
      glowTextClass: 'text-glow-purple',
      glowAccentClass: 'text-glow-orange',
      borderClass: 'border-purple-400',
      accentBorderClass: 'border-orange-500',
      boxGlowClass: 'box-glow-purple',
      button: {
        primaryBg: 'bg-purple-600', primaryText: 'text-white', primaryBorder: 'border-purple-400', primaryHoverBg: 'hover:bg-purple-500', primaryActiveBg: 'active:bg-purple-700',
        secondaryBg: 'bg-orange-600', secondaryText: 'text-white', secondaryBorder: 'border-orange-400', secondaryHoverBg: 'hover:bg-orange-500', secondaryActiveBg: 'active:bg-orange-700',
        tertiaryBg: 'bg-teal-500', tertiaryText: 'text-white', tertiaryBorder: 'border-teal-300', tertiaryHoverBg: 'hover:bg-teal-400', tertiaryActiveBg: 'active:bg-teal-600',
      },
      spinnerClass: 'spinner-nightmare'
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist Line Art',
    tagline: 'Your Modern, Clean Portrait',
    prompt: "Stylize a photo into a minimalist, line art illustration with a clean and contemporary aesthetic. Emphasize simple, fluid black outlines to define figures and objects, with minimal internal details. Incorporate a very limited color palette, using subtle, desaturated background tones (like cream or light beige) and only sparse, soft pastel or muted color fills for specific elements (e.g., hair, a hat, a piece of fruit, a cup). The overall impression should be uncluttered, with a focus on conveying the essence of the subject through elegant, simple forms, reminiscent of modern digital line drawings or web illustrations. Generate only the image without any text.",
    shareText: "I created this cool minimalist line art version of myself! ✨ #MinimalistArt #LineArt #Gemini #AI",
    theme: {
      bg: '#f5f2ed',
      mainTextColor: 'text-gray-800',
      accentTextColor: 'text-amber-800',
      containerBgClass: 'bg-white bg-opacity-70',
      glowTextClass: 'text-glow-black',
      glowAccentClass: 'text-glow-brown',
      borderClass: 'border-gray-800',
      accentBorderClass: 'border-amber-700',
      boxGlowClass: 'box-glow-black',
      button: {
        primaryBg: 'bg-gray-800', primaryText: 'text-white', primaryBorder: 'border-gray-900', primaryHoverBg: 'hover:bg-gray-700', primaryActiveBg: 'active:bg-gray-900',
        secondaryBg: 'bg-amber-700', secondaryText: 'text-white', secondaryBorder: 'border-amber-800', secondaryHoverBg: 'hover:bg-amber-600', secondaryActiveBg: 'active:bg-amber-800',
        tertiaryBg: 'bg-gray-300', tertiaryText: 'text-gray-800', tertiaryBorder: 'border-gray-400', tertiaryHoverBg: 'hover:bg-gray-200', tertiaryActiveBg: 'active:bg-gray-400',
      },
      spinnerClass: 'spinner-minimalist',
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
                className={`p-6 border-2 transition-all duration-300 transform hover:scale-105 h-full text-left ${style.theme.borderClass} ${style.theme.containerBgClass} ${style.theme.boxGlowClass}`}
              >
                <h3 className={`text-2xl mb-2 ${style.theme.glowTextClass} ${style.theme.mainTextColor}`}>{style.name}</h3>
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
      className={`min-h-screen p-4 sm:p-8 flex flex-col items-center transition-colors duration-500 relative ${selectedStyle ? currentTheme?.mainTextColor : 'text-green-400'}`}
      style={{
        backgroundColor: currentTheme?.bg ?? '#14281d'
      }}
    >
      {(appState === AppState.PROCESSING || appState === AppState.RESULT) && selectedStyle?.theme.backgroundEffect === 'snowfall' && <Snowfall />}
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
          From:{' '}
          <a
            href="https://contentkoala.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline ${currentTheme ? 'hover:' + currentTheme.accentTextColor : 'hover:text-red-400'} transition-colors`}
          >
            ContentKoala@
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;