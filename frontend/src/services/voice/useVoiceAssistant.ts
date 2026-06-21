import { useState, useCallback, useEffect, useRef } from 'react';
import { speechRecognition } from './speechRecognition';
import { speechSynthesis } from './speechSynthesis';
import { toast } from 'react-hot-toast';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseVoiceAssistantProps {
  onSend: (text: string) => void;
  onTranscriptChange?: (text: string) => void;
}

export function useVoiceAssistant({ onSend, onTranscriptChange }: UseVoiceAssistantProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const lastTranscriptRef = useRef('');

  // Update transcript ref so event handlers can read current value
  useEffect(() => {
    lastTranscriptRef.current = transcript;
  }, [transcript]);

  const startListening = useCallback(() => {
    if (!speechRecognition.isSupported()) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setTranscript('');
    onTranscriptChange?.('');

    speechRecognition.start({
      onStart: () => {
        setState('listening');
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        onTranscriptChange?.(text);
      },
      onError: (err) => {
        console.error('Speech recognition error callback:', err);
        if (err === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (err === 'network') {
          const isBrave = !!(navigator as any).brave;
          if (isBrave) {
            toast.error('Voice input failed. Brave browser disables Web Speech API by default. Please go to brave://settings/shields and enable Web Speech API, or use Google Chrome.', { duration: 6000 });
          } else {
            toast.error('Voice input requires an active internet connection, or Google speech servers are blocked/offline in your browser.', { duration: 5000 });
          }
        } else if (err === 'no-speech') {
          toast.error('No speech was detected. Please speak closer to the microphone.');
        } else if (err === 'aborted') {
          // Aborted is normal when user cancels or types, no need to toast
        } else {
          toast.error(`Voice error: ${err}`);
        }
        setState('idle');
      },
      onEnd: () => {
        // If we still have transcript when recognition ended naturally, submit it!
        const finalVal = lastTranscriptRef.current.trim();
        if (finalVal) {
          setState('processing');
          onSend(finalVal);
        } else {
          setState('idle');
        }
      }
    });
  }, [onSend, onTranscriptChange]);

  const stopListening = useCallback(() => {
    speechRecognition.stop();
  }, []);

  const interrupt = useCallback(() => {
    speechSynthesis.cancel();
    speechRecognition.abort();
    setState('idle');
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!speechSynthesis.isSupported()) {
      return;
    }

    setState('speaking');
    speechSynthesis.speak(text, {
      onStart: () => {
        setState('speaking');
      },
      onEnd: () => {
        setState('idle');
      },
      onError: (err) => {
        console.error('Speech synthesis error callback:', err);
        setState('idle');
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      speechRecognition.abort();
    };
  }, []);

  return {
    state,
    setState, // Expose setState so ChatPage can manage state changes (e.g. going from typing to processing)
    transcript,
    startListening,
    stopListening,
    interrupt,
    speakResponse,
    isSupported: speechRecognition.isSupported() && speechSynthesis.isSupported()
  };
}
