export class VoiceControl {
  private recognition: any;

  constructor(private callback: (cmd: string) => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error("Browser does not support SpeechRecognition");

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;   // Keep listening
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript) {
        console.log("Voice command recognized:", transcript);
        this.callback(transcript);
      }
    };

    this.recognition.onerror = (err: any) => {
      console.error("Voice recognition error:", err);
      // Optionally restart recognition automatically
      try {
        this.start();
      } catch (e) {
        console.error("Failed to restart voice recognition:", e);
      }
    };

    this.recognition.onend = () => {
      // Re-start if it wasn't manually stopped
      if (this.recognition) {
        try {
          this.start();
        } catch (e) {
          console.error("Failed to resume voice recognition:", e);
        }
      }
    };
  }

  start() {
    this.recognition.start();
  }

  stop() {
    const rec = this.recognition;
    this.recognition = null; // Prevent auto-restart
    if (rec) rec.stop();
  }
}
