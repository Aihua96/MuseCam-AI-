import React, { useState } from 'react';
import { Recorder } from './components/Recorder';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { AspectRatio, RecorderState } from './types';

export default function App() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.NineSixteen);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.Idle);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleStartRecording = () => {
    setDownloadUrl(null);
    setRecorderState(RecorderState.Recording);
  };

  const handleStopRecording = () => {
    setRecorderState(RecorderState.Idle);
  };

  const handleRecordingFinish = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="mb-6 z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-500 tracking-tight">
          MuseCam
        </h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">
          Your AI-Guided Video Journal
        </p>
      </header>

      {/* Main Control Area */}
      <main className="z-10 flex flex-col items-center gap-6 w-full max-w-4xl">
        
        {/* Aspect Ratio Selector - Only visible when not recording */}
        <div className={`transition-opacity duration-300 ${recorderState === RecorderState.Recording ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <AspectRatioSelector 
            selected={aspectRatio} 
            onChange={setAspectRatio} 
            disabled={recorderState === RecorderState.Recording}
          />
        </div>

        {/* Recorder Viewport */}
        <div className="relative">
          <Recorder
            aspectRatio={aspectRatio}
            state={recorderState}
            onRecordingFinish={handleRecordingFinish}
            onStateChange={setRecorderState}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-2">
          {recorderState === RecorderState.Idle ? (
            <button
              onClick={handleStartRecording}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-300/50 transition-all transform hover:scale-110 active:scale-95"
            >
              <div className="w-6 h-6 bg-white rounded-full group-hover:rounded-sm transition-all duration-300" />
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg transition-all transform hover:scale-110 active:scale-95"
            >
              <div className="w-6 h-6 bg-white rounded-sm" />
            </button>
          )}
        </div>

        {/* Download Link */}
        {downloadUrl && recorderState === RecorderState.Idle && (
          <div className="animate-fade-in mt-4 flex flex-col items-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
            <span className="text-sm font-semibold text-slate-600">Session Recorded!</span>
            <a
              href={downloadUrl}
              download={`musecam-${new Date().toISOString()}.mp4`}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Video
            </a>
          </div>
        )}

      </main>

      {/* Footer / Status */}
      <footer className="mt-8 text-center z-10">
        <p className="text-xs text-slate-400">
          Powered by Gemini 2.5 Flash • AI does not store your audio
        </p>
      </footer>

      {/* Animations CSS injection for Tailwind arbitrary values replacement */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
