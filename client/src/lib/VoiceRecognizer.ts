export class VoiceRecognizer {
  private recognition: any;

  constructor(private callback: (cmd: string) => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error("Browser does not support SpeechRecognition");

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript) this.callback(transcript);
    };

    this.recognition.onerror = (err: any) => {
      console.error("Voice recognition error:", err);
      // Safe auto-restart after short delay to avoid crash loops
      setTimeout(() => this.start(), 500);
    };

    this.recognition.onend = () => {
      // Ensure continuous listening
      setTimeout(() => this.start(), 200);
    };
  }

  start() {
    try {
      this.recognition.start();
      console.log("Voice recognition started");
    } catch (e) {
      // Already started or error
    }
  }

  stop() {
    try {
      this.recognition.stop();
      console.log("Voice recognition stopped");
    } catch (e) {
      // Already stopped or error
    }
  }
}
