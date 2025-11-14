/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum AppState {
  IDLE,
  PROCESSING,
  RESULT,
  ERROR,
}

export interface Style {
  id: string;
  name: string;
  tagline: string;
  prompt: string;
  shareText: string;
  theme: {
    bg: string;
    mainTextColor: string;
    accentTextColor: string;
    containerBgClass: string;
    glowTextClass: string;
    glowAccentClass: string;
    borderClass: string;
    accentBorderClass: string;
    boxGlowClass: string;
    button: {
      primaryBg: string;
      primaryText: string;
      primaryBorder: string;
      primaryHoverBg: string;
      primaryActiveBg: string;
      secondaryBg: string;
      secondaryText: string;
      secondaryBorder: string;
      secondaryHoverBg: string;
      secondaryActiveBg: string;
      tertiaryBg: string;
      tertiaryText: string;
      tertiaryBorder: string;
      tertiaryHoverBg: string;
      tertiaryActiveBg: string;
    };
    spinnerClass: string;
  };
}
