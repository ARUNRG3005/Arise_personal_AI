import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(ios && !standalone);

    // Android / Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  if (!show && !isIOS) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50
                    j-card border-j-cyan/40 shadow-j-md animate-j-fade-up">
      {/* Corner accents */}
      <div className="j-font-mono text-[8px] tracking-[0.2em] text-j-text-muted mb-2">
        SYSTEM INSTALL
      </div>
      <p className="text-j-text text-sm mb-3">
        Install ARISE on your device for the full JARVIS experience — offline access,
        faster load, home screen icon.
      </p>

      {isIOS ? (
        <div className="text-j-text-sub text-xs j-font-mono">
          Tap <span className="text-j-cyan">Share</span> → 
          <span className="text-j-cyan"> Add to Home Screen</span>
        </div>
      ) : (
        <div className="flex gap-2 mt-3">
          <button onClick={handleInstall} className="j-btn flex-1 text-xs py-2">
            INSTALL
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-j-text-muted text-xs hover:text-j-text transition-colors"
          >
            LATER
          </button>
        </div>
      )}
    </div>
  );
}

export default PwaInstallPrompt;
