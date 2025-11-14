/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Content, Part, GenerateVideosParameters, Modality } from "@google/genai";

const parseGeminiResponse = (response: GenerateContentResponse): { imageUrl: string, modelResponseContent: Content } => {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("Invalid response from API. No content parts found.");
  }

  let imageData: string | null = null;
  let outputMimeType = "image/png";
  let responseText = "";
  
  for (const part of parts) {
    if (part.text) {
      responseText += part.text;
    } else if (part.inlineData?.data) {
      imageData = part.inlineData.data;
      if (part.inlineData.mimeType && part.inlineData.mimeType !== "application/octet-stream") {
        outputMimeType = part.inlineData.mimeType;
      }
    }
  }

  if (!imageData) {
    const errorMessage = responseText.trim()
      ? `Image generation failed. The model responded with: "${responseText.trim()}"`
      : "Image generation failed. The API did not return any image data.";
    throw new Error(errorMessage);
  }
  
  const modelResponseContent: Content = response.candidates?.[0]?.content as Content;
  if (!modelResponseContent) {
      throw new Error("Invalid response from API, could not construct model content for history.");
  }
  
  return {
    imageUrl: `data:${outputMimeType};base64,${imageData}`,
    modelResponseContent: modelResponseContent
  };
};

export const startImageChatSession = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
): Promise<{ imageUrl: string, history: Content[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set for image generation.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image'; 

  const userContent: Content = {
    role: 'user',
    parts: [
      { text: prompt },
      { inlineData: { data: base64Image, mimeType } }
    ]
  };
  
  const config = { responseModalities: [Modality.IMAGE, Modality.TEXT] };

  const response = await ai.models.generateContent({
    model,
    contents: [userContent],
    config,
  });

  const { imageUrl, modelResponseContent } = parseGeminiResponse(response);

  return {
    imageUrl,
    history: [userContent, modelResponseContent]
  };
};

export const continueImageChatSession = async (
  history: Content[],
  prompt: string
): Promise<{ imageUrl: string, newHistory: Content[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set for image editing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';

  const userContent: Content = {
    role: 'user',
    parts: [{ text: prompt }]
  };

  const newHistory = [...history, userContent];
  
  const config = { responseModalities: [Modality.IMAGE, Modality.TEXT] };

  const response = await ai.models.generateContent({
    model,
    contents: newHistory,
    config,
  });

  const { imageUrl, modelResponseContent } = parseGeminiResponse(response);
  
  return {
    imageUrl,
    newHistory: [...newHistory, modelResponseContent]
  };
};

const dataUrlToBase64 = (dataUrl: string): { base64: string, mimeType: string } => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64 = parts[1];
    return { base64, mimeType };
}

const delay = async (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const generateVideoFromImage = async (
    imageUrl: string,
    prompt: string,
    apiKey: string
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key is required for video generation.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = 'veo-3.0-fast-generate-001';
    const { base64: imageBytes, mimeType } = dataUrlToBase64(imageUrl);

    const config: GenerateVideosParameters = {
        model,
        prompt,
        config: { numberOfVideos: 1 },
        image: { imageBytes, mimeType }
    };

    let operation = await ai.models.generateVideos(config);

    while (!operation.done) {
        await delay(5000); // Poll every 5 seconds
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const video = operation.response?.generatedVideos?.[0];
    if (!video?.video?.uri) {
        throw new Error("Video generation failed or returned no video URI.");
    }
    
    const res = await fetch(`${video.video.uri}&key=${apiKey}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch video file: ${res.statusText}`);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
};