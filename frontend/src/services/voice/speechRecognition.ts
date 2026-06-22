// Native Speech Recognition Service using browser's Web Speech API

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private callbacks: SpeechRecognitionCallbacks = {};

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // Stop after a pause in speech
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-IN';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // If we have a final transcript, or interim text, send it up
      const transcript = finalTranscript || interimTranscript;
      const isFinal = event.results[event.results.length - 1]?.isFinal || false;
      this.callbacks.onResult?.(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd?.();
    };
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start(callbacks: SpeechRecognitionCallbacks) {
    if (!this.isSupported()) {
      callbacks.onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    this.callbacks = callbacks;
    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      callbacks.onError?.(err.message || 'Failed to start recognition');
    }
  }

  public stop() {
    if (!this.isSupported() || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (err) {
      console.error('Failed to stop speech recognition:', err);
    }
  }

  public abort() {
    if (!this.isSupported() || !this.isListening) {
      return;
    }

    try {
      this.recognition.abort();
    } catch (err) {
      console.error('Failed to abort speech recognition:', err);
    }
  }
}

export const speechRecognition = new SpeechRecognitionService();
