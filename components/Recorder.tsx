import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AspectRatio, PromptData, RecorderState } from '../types';
import { PromptOverlay } from './PromptOverlay';
import { GeminiLiveService } from '../services/geminiService';

interface Props {
  aspectRatio: AspectRatio;
  state: RecorderState;
  onRecordingFinish: (blob: Blob) => void;
  onStateChange: (state: RecorderState) => void;
}

export const Recorder: React.FC<Props> = ({ aspectRatio, state, onRecordingFinish, onStateChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  
  const [prompt, setPrompt] = useState<PromptData | null>(null);
  const [geminiService] = useState(() => new GeminiLiveService());

  // Calculate dimensions based on aspect ratio
  // Base height is fixed to ensure it fits on screen, width adjusts
  const getMaxDimensions = () => {
    const maxHeight = window.innerHeight * 0.75;
    const maxWidth = window.innerWidth * 0.9;
    
    let width = 0;
    let height = maxHeight;

    const [wRatio, hRatio] = aspectRatio.split(':').map(Number);
    const ratio = wRatio / hRatio;

    width = height * ratio;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / ratio;
    }

    return { width, height };
  };

  const { width: canvasWidth, height: canvasHeight } = getMaxDimensions();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 },
          facingMode: "user"
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Local playback muted to prevent echo
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const drawFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    // Source dimensions
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const vRatio = vW / vH;

    // Destination dimensions (Canvas)
    const [tW, tH] = aspectRatio.split(':').map(Number);
    const targetRatio = tW / tH;

    let sWidth, sHeight, sx, sy;

    // Calculate crop
    if (vRatio > targetRatio) {
      // Source is wider than target: Crop width
      sHeight = vH;
      sWidth = vH * targetRatio;
      sx = (vW - sWidth) / 2;
      sy = 0;
    } else {
      // Source is taller than target: Crop height
      sWidth = vW;
      sHeight = vW / targetRatio;
      sx = 0;
      sy = (vH - sHeight) / 2;
    }

    // Draw to canvas (Flip horizontally for mirror effect)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [aspectRatio]);

  // Setup Camera on Mount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      geminiService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start Drawing Loop
  useEffect(() => {
    const handle = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(handle);
  }, [drawFrame]);

  // Handle Recording Logic
  useEffect(() => {
    if (state === RecorderState.Recording) {
      startRecording();
    } else if (state === RecorderState.Idle && mediaRecorderRef.current?.state === 'recording') {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const startRecording = async () => {
    if (!canvasRef.current || !streamRef.current) return;

    // 1. Setup Canvas Stream (Video)
    const canvasStream = canvasRef.current.captureStream(30);
    
    // 2. Setup Audio Stream (From Microphone)
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    // 3. Initialize Recorder
    const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 2500000 });
    
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      onRecordingFinish(blob);
      setPrompt(null); // Clear prompt
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    // 4. Connect to Gemini Live for prompts
    setPrompt({ text: "I'm listening...", id: 'init' });
    
    // We only send the audio track to Gemini
    const audioStreamOnly = new MediaStream([audioTrack.clone()]);
    
    geminiService.connect(audioStreamOnly, {
      onTranscript: (text) => {
        // Accumulate text or replace? For prompts, usually short questions are separate.
        // The API might send chunks. We'll debounce or just show latest if it looks like a sentence.
        setPrompt({ text, id: Date.now().toString() });
      },
      onClose: () => {
        // Clean up
      },
      onError: (err) => {
        console.error("Gemini Error", err);
        setPrompt({ text: "Connection issues...", id: 'error' });
      }
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    geminiService.disconnect();
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white/30 backdrop-blur transition-all duration-500">
      {/* Hidden Source Video */}
      <video ref={videoRef} className="hidden" playsInline muted />
      
      {/* Visual Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="block bg-black rounded-2xl object-cover"
        style={{ width: canvasWidth, height: canvasHeight }}
      />

      {/* Overlays */}
      <PromptOverlay prompt={prompt} />

      {/* Recording Indicator */}
      {state === RecorderState.Recording && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500/80 backdrop-blur px-3 py-1 rounded-full animate-pulse z-30">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-white text-xs font-bold uppercase tracking-wider">REC</span>
        </div>
      )}
    </div>
  );
};
