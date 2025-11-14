/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { Style } from '../types';

interface ImageInputProps {
  onImageReady: (imageData: { data: string; mimeType: string }) => void;
  theme: Style['theme'];
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageReady, theme }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const btn = theme.button;

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    const enableStream = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported by this browser.");
        }
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Camera access was denied. Please check browser permissions and ensure you're on a secure (https) connection.");
      } finally {
        setIsCameraInitializing(false);
      }
    };

    enableStream();

    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      videoEl.srcObject = stream;
      videoEl.onloadedmetadata = () => {
        videoEl.play().catch(e => {
            console.error("Video play failed", e);
            setCameraError("Could not start camera preview.");
        });
      };
    }
  }, [stream]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
            const base64 = result.split(',')[1];
            onImageReady({ data: base64, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && stream) {
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        setCameraError("Cannot capture photo. Camera is not sending a video feed.");
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the canvas horizontally to match the mirrored preview
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        onImageReady({ data: base64, mimeType: 'image/jpeg' });
        
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  return (
    <div className={`w-full flex flex-col items-center p-4 border-2 ${theme.accentBorderClass} ${theme.containerBgClass} ${theme.boxGlowClass} animate-fade-in`}>
      <div className={`w-full max-w-xl aspect-square bg-black border ${theme.borderClass} flex items-center justify-center mb-4 relative`}>
        <video 
            ref={videoRef}
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]"
        ></video>
        {(isCameraInitializing || cameraError) && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center bg-black">
                {isCameraInitializing ? (
                    <p className={`${theme.mainTextColor} animate-pulse`}>Initializing Camera...</p>
                ) : (
                    <p className={`${theme.accentTextColor}`}>{cameraError}</p>
                )}
            </div>
        )}
        {stream && !cameraError && !isCameraInitializing && (
             <button
                onClick={handleCapture}
                disabled={!stream || !!cameraError || isCameraInitializing}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 p-1 group transition-transform duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme.accentBorderClass} ${theme.button.secondaryBg}/30`}
                aria-label="Capture photo"
            >
                <div className={`w-full h-full rounded-full ${theme.button.secondaryBg} group-hover:opacity-80 transition-opacity`} />
            </button>
        )}
      </div>
     
      <div className="mt-2 text-center w-full max-w-xl">
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`py-3 px-6 border-2 text-xl w-full ${btn.primaryBg} ${btn.primaryText} ${btn.primaryBorder} ${btn.primaryHoverBg} ${btn.primaryActiveBg}`}
        >
          UPLOAD PHOTO
        </button>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  );
};

export default ImageInput;