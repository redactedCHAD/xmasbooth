/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "UNTANGLING THE CHRISTMAS LIGHTS...",
  "SPIKING THE EGGNOG...",
  "HANGING THE MISTLETOE...",
  "FINDING THE PERFECT UGLY SWEATER...",
  "ROASTING CHESTNUTS...",
  "WRAPPING THE PRESENTS...",
  "WAITING FOR SANTA...",
  "GETTING YOUR TACKY PORTRAIT READY...",
];

const LoadingView: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full text-center p-8 border-2 border-yellow-300 bg-black bg-opacity-50">
      <div className="text-2xl text-yellow-300">
        {loadingMessages[messageIndex % loadingMessages.length]}
        <span className="animate-ping">_</span>
      </div>
    </div>
  );
};

export default LoadingView;