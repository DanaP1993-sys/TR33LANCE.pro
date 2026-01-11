export class VoiceControl {
  private static recognition: any = null;

  static startListening(callback: (command: string) => void) {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      callback(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    this.recognition.start();
  }

  static stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}
