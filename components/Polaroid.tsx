/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface PolaroidProps {
  imageUrl: string;
  videoUrl?: string | null;
  isRegenerating?: boolean;
  onClick: () => void;
}

const captions = [
  "Happy Holidays",
  "Seasons Greetings",
  "Christmas Memories",
  "Holiday Cheer",
  "Winter Wonderland",
  "Meet the Clauses",
  "Family Festivities",
  "Tidings of Joy"
];

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomCaption = () => {
  const year = 1980 + Math.floor(Math.random() * 10);
  const captionText = getRandomItem(captions);
  return `${captionText} '${String(year).slice(2)}`;
};

const Polaroid: React.FC<PolaroidProps> = ({ imageUrl, videoUrl, isRegenerating, onClick }) => {
  const [caption] = useState(generateRandomCaption);

  return (
    <button 
      onClick={onClick}
      className="relative bg-gray-100 p-4 pb-16 shadow-lg transform -rotate-3 hover:rotate-0 hover:scale-105 transition-transform duration-300 ease-in-out text-left"
      aria-label="View larger image"
    >
      <div className="bg-black w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center overflow-hidden">
        {videoUrl ? (
          <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={imageUrl} alt="Generated 80s glamour shot" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-gray-800 text-2xl tracking-wider" style={{fontFamily: `'Comic Sans MS', cursive, sans-serif`}}>
          {caption}
        </p>
      </div>
      {isRegenerating && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 p-4">
            <p className="text-yellow-300 text-2xl animate-pulse">REMIXING...</p>
        </div>
      )}
    </button>
  );
};

export default Polaroid;