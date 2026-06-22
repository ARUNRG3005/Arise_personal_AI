import { useCallback, useEffect, useRef } from 'react';
import { speechRecognition } from './speechRecognition';
import { speechSynthesis } from './speechSynthesis';
import { WakeWordDetector } from './wakeWord';
import { toast } from 'react-hot-toast';
import { useVoiceStore, type VoiceState } from '../../stores/voiceStore';
export type { VoiceState };

interface UseVoiceAssistantProps {
  onSend: (text: string) => void;
  onTranscriptChange?: (text: string) => void;
}

export function useVoiceAssistant({ onSend, onTranscriptChange }: UseVoiceAssistantProps) {
  const { state, setState, transcript, setTranscript } = useVoiceStore();
  const lastTranscriptRef = useRef('');
  const stateRef = useRef<VoiceState>('idle');
  const detectorRef = useRef<WakeWordDetector | null>(null);

  // Keep stateRef updated synchronously for event callbacks
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
          toast.error('Microphone permission denied.');
        } else if (err === 'no-speech') {
          toast.error('No speech detected.');
        } else if (err !== 'aborted') {
          toast.error(`Voice error: ${err}`);
        }
        
        // Return to wake loop if active
        if (stateRef.current !== 'idle') {
          startWakeWord();
        } else {
          setState('idle');
        }
      },
      onEnd: () => {
        const finalVal = lastTranscriptRef.current.trim();
        if (finalVal) {
          setState('processing');
          onSend(finalVal);
        } else {
          // No command said, return to wake word if active
          if (stateRef.current !== 'idle') {
            startWakeWord();
          } else {
            setState('idle');
          }
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
    detectorRef.current?.stop();
    setState('idle');
  }, []);

  const startWakeWord = useCallback(() => {
    if (!speechRecognition.isSupported()) return;
    speechRecognition.abort();
    setState('wake');
    detectorRef.current?.start();
  }, []);

  const stopWakeWord = useCallback(() => {
    detectorRef.current?.stop();
    speechRecognition.abort();
    speechSynthesis.cancel();
    setState('idle');
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!speechSynthesis.isSupported()) {
      if (stateRef.current !== 'idle') {
        startWakeWord();
      } else {
        setState('idle');
      }
      return;
    }

    setState('speaking');
    speechSynthesis.speak(text, {
      onStart: () => {
        setState('speaking');
      },
      onEnd: () => {
        if (stateRef.current !== 'idle') {
          startWakeWord();
        } else {
          setState('idle');
        }
      },
      onError: (err) => {
        console.error('Speech synthesis error callback:', err);
        if (stateRef.current !== 'idle') {
          startWakeWord();
        } else {
          setState('idle');
        }
      }
    });
  }, [startWakeWord]);

  // Create wake word detector on mount
  useEffect(() => {
    detectorRef.current = new WakeWordDetector(() => {
      console.log('[ARISE] Wake word "Hey ARISE" detected. Recording command...');
      detectorRef.current?.stop();
      startListening();
    });

    return () => {
      detectorRef.current?.stop();
      speechRecognition.abort();
      speechSynthesis.cancel();
    };
  }, [startListening]);

  return {
    state,
    setState,
    transcript,
    startListening,
    stopListening,
    interrupt,
    speakResponse,
    isWakeWordActive: state === 'wake',
    startWakeWord,
    stopWakeWord,
    isSupported: speechRecognition.isSupported() && speechSynthesis.isSupported()
  };
}
