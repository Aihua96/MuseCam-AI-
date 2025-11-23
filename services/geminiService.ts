import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface GeminiConnectionParams {
  onTranscript: (text: string) => void;
  onClose: () => void;
  onError: (error: Error) => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isConnected = false;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(stream: MediaStream, { onTranscript, onClose, onError }: GeminiConnectionParams) {
    if (this.isConnected) return;

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            this.isConnected = true;
            this.startAudioStream(stream);
          },
          onmessage: (message: LiveServerMessage) => {
            // We are interested in the model's output transcription to use as a "silent prompt"
            if (message.serverContent?.outputTranscription?.text) {
              onTranscript(message.serverContent.outputTranscription.text);
            }
          },
          onclose: () => {
            console.log('Gemini Live session closed');
            this.isConnected = false;
            onClose();
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live error', e);
            onError(new Error("Connection error"));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO], // Must be AUDIO for Live API
          inputAudioTranscription: { model: "google_speech_v2" }, // Transcribe user input
          outputAudioTranscription: { model: "google_speech_v2" }, // Transcribe model output (this is what we display)
          systemInstruction: `
            You are a creative, thoughtful, and silent video podcast director. 
            Your goal is to listen to the user recording a video diary or vlog.
            Do NOT greet them. Do NOT say "Okay" or "I understand".
            
            When the user pauses, stops talking, or seems to be looking for a topic, generate a SHORT, inspiring question to guide them.
            Examples: "What did that moment feel like?", "Why does this matter to you?", "Tell me more about the details."
            
            Keep your responses short (under 15 words).
            The user cannot hear you, they can only see your text on the screen.
            Be supportive and curious.
          `,
        }
      };

      this.sessionPromise = this.ai.live.connect(config);

    } catch (error) {
      onError(error as Error);
    }
  }

  private startAudioStream(stream: MediaStream) {
    if (!this.inputAudioContext || !this.sessionPromise) return;

    this.source = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    
    // Manual base64 encoding to avoid external lib dependency for simplicity
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64Data = btoa(binary);

    return {
      data: base64Data,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  disconnect() {
    if (this.sessionPromise) {
      this.sessionPromise.then(session => session.close());
    }
    this.source?.disconnect();
    this.processor?.disconnect();
    this.inputAudioContext?.close();
    
    this.sessionPromise = null;
    this.source = null;
    this.processor = null;
    this.inputAudioContext = null;
    this.isConnected = false;
  }
}