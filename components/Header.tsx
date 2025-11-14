/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Style } from '../types';

interface HeaderProps {
  style: Style | null;
}

const Header: React.FC<HeaderProps> = ({ style }) => {
  const title = style?.name ?? "Holiday Photo Booth";
  const tagline = style?.tagline;
  const theme = style?.theme;

  return (
    <header className={`w-full max-w-2xl text-center border-2 p-4 bg-black bg-opacity-20 transition-all duration-500 ${theme ? `${theme.borderClass} ${theme.boxGlowClass}` : 'border-green-400 box-glow-green'}`}>
      <h1 className={`text-4xl sm:text-5xl transition-all duration-500 ${theme ? theme.glowTextClass : 'text-glow-green'}`}>{title}</h1>
      {tagline && (
         <h2 className={`text-lg sm:text-xl mt-1 transition-all duration-500 ${theme ? `${theme.accentTextColor} ${theme.glowAccentClass}`: ''}`}>{tagline}</h2>
      )}
    </header>
  );
};

export default Header;