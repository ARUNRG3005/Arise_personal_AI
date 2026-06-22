const WAKE_WORD = 'hey arise';

export class WakeWordDetector {
  private recognition: any = null;
  private onWake: () => void;
  private active = false;

  constructor(onWake: () => void) {
    this.onWake = onWake;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    
    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-IN';
    
    this.recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript.toLowerCase().trim())
        .join(' ');
      if (transcript.includes(WAKE_WORD)) {
        this.onWake();
      }
    };
    
    this.recognition.onend = () => {
      if (this.active) {
        try {
          this.recognition?.start();
        } catch (err) {
          // Ignore if already started
        }
      }
    };
  }

  start() {
    this.active = true;
    try {
      this.recognition?.start();
    } catch (err) {
      // Ignore if already started
    }
  }

  stop() {
    this.active = false;
    try {
      this.recognition?.stop();
    } catch (err) {
      // Ignore
    }
  }
}
