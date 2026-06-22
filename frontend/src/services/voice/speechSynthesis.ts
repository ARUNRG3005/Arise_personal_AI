// Native Speech Synthesis Service using browser's Web Speech API

export interface SpeechSynthesisCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function cleanMarkdownForSpeech(text: string): string {
  let cleanText = text;

  // 1. Remove code blocks (block of code starting with ```)
  cleanText = cleanText.replace(/```[\s\S]*?```/g, ' [code content omitted] ');

  // 2. Remove inline code
  cleanText = cleanText.replace(/`([^`]+)`/g, '$1');

  // 3. Remove tables or table dividers
  const lines = cleanText.split('\n');
  const filteredLines = lines.filter(line => {
    // If it's a table alignment row like |---|---|
    if (/^[|\s:-]+$/.test(line)) return false;
    return true;
  }).map(line => {
    // Remove table pipes but keep content
    return line.replace(/\|/g, ' ').trim();
  });
  cleanText = filteredLines.join('\n');

  // 4. Remove links: [text](url) -> text
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 5. Remove bold/italic markup
  cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleanText = cleanText.replace(/\*([^*]+)\*/g, '$1');
  cleanText = cleanText.replace(/__([^_]+)__/g, '$1');
  cleanText = cleanText.replace(/_([^_]+)_/g, '$1');

  // 6. Remove headings hashes
  cleanText = cleanText.replace(/^#+\s+(.+)$/gm, '$1');

  // 7. Remove list markers at start of lines (e.g. "- ", "* ", "1. ", "• ")
  cleanText = cleanText.replace(/^[\s•*-]+\s+/gm, '');
  cleanText = cleanText.replace(/^\d+\.\s+/gm, '');

  // 8. Clean up extra spaces and newlines
  cleanText = cleanText.replace(/\n+/g, ' ');
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  return cleanText;
}

export class SpeechSynthesisService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive: boolean = false;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const preferred = voices.find(v => v.name === 'Google UK English Male')
      || voices.find(v => v.lang.toLowerCase().startsWith('en') && v.name.toLowerCase().includes('male'))
      || voices.find(v => v.lang.toLowerCase().startsWith('en'))
      || voices[0];

    return preferred;
  }

  public speak(text: string, callbacks?: SpeechSynthesisCallbacks) {
    if (!this.isSupported()) {
      callbacks?.onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    // Cancel any active speech before starting new speech
    this.cancel();

    const cleanedText = cleanMarkdownForSpeech(text);
    if (!cleanedText) {
      callbacks?.onEnd?.();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      this.activeUtterance = utterance;
      this.isSpeakingActive = true;

      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Voice settings (JARVIS edition)
      utterance.rate = 0.92;
      utterance.pitch = 0.85;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingActive = false;
        this.activeUtterance = null;
        callbacks?.onEnd?.();
      };

      utterance.onerror = (event) => {
        // "interrupted" is a normal event when we call cancel() manually, don't bubble it as error
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event);
          callbacks?.onError?.(event.error || 'Speech synthesis error');
        }
        this.isSpeakingActive = false;
        this.activeUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error('Failed to speak response:', err);
      callbacks?.onError?.(err.message || 'Speech synthesis failed');
      this.isSpeakingActive = false;
      this.activeUtterance = null;
    }
  }

  public cancel() {
    if (!this.isSupported()) return;

    try {
      window.speechSynthesis.cancel();
      this.isSpeakingActive = false;
      this.activeUtterance = null;
    } catch (err) {
      console.error('Failed to cancel speech synthesis:', err);
    }
  }

  public isSpeaking(): boolean {
    return this.isSupported() && (window.speechSynthesis.speaking || this.isSpeakingActive);
  }
}

export const speechSynthesis = new SpeechSynthesisService();
// Pre-load voices for browsers that support it
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
