/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Style } from '../types';

interface ChatInputProps {
    onPromptSubmit: (prompt: string) => void;
    disabled: boolean;
    theme: Style['theme'];
}

const ChatInput: React.FC<ChatInputProps> = ({ onPromptSubmit, disabled, theme }) => {
    const [prompt, setPrompt] = useState('');
    const btn = theme.button;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !disabled) {
            onPromptSubmit(prompt.trim());
            setPrompt('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex space-x-2">
            <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what to change..."
                disabled={disabled}
                className={`flex-grow border-2 p-3 focus:outline-none focus:ring-2 disabled:opacity-50 ${theme.containerBgClass} ${theme.borderClass} text-white focus:ring-red-500 ${theme.boxGlowClass}`}
            />
            <button type="submit" disabled={disabled} className={`py-3 px-6 border-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${btn.secondaryBg} ${btn.secondaryText} ${btn.secondaryBorder} ${btn.secondaryHoverBg} ${btn.secondaryActiveBg}`}>
                REMIX
            </button>
        </form>
    );
}

export default ChatInput;