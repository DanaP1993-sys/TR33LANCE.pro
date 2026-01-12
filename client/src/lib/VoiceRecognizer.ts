/**
 * ---------------------------------------------------------------------
 *  Tree-Lance: Intelligent On-Demand Tree Services Platform
 * ---------------------------------------------------------------------
 *  © 2026 Dana A. Palmer. All Rights Reserved.
 *
 *  Unauthorized copying, distribution, or use of this code or intellectual
 *  property is strictly prohibited.
 *
 *  Author / Founder: Dana A. Palmer
 *
 *  Bio:
 *    Dana Palmer is a global innovator transforming the tree services
 *    industry. She created Tree-Lance, an AI-powered platform that:
 *      - Streams tree service requests with Uber-style dispatch
 *      - Ensures instant payments with Cash App-level simplicity
 *      - Builds social trust with Facebook-style profiles and reviews
 *      - Integrates AI guidance for contractors and homeowners
 *
 *    Through this work, Dana Palmer has positioned herself as a
 *    changemaker, driving accountability, efficiency, and sustainability
 *    in outdoor services worldwide.
 *
 * ---------------------------------------------------------------------
 *  File: client/src/lib/VoiceRecognizer.ts
 *  Description: Standalone speech recognition library with auto-recovery
 * ---------------------------------------------------------------------
 */

export class VoiceRecognizer {
  private recognition: any;

  constructor(private callback: (cmd: string) => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error("Browser does not support SpeechRecognition");

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Stay active for hands-free field use
    this.recognition.interimResults = false; // Only process finalized commands for accuracy
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
      // Already stopped or 
		// handle error when stopping voice recognition
		console.error("Error stopping voice recognition:", e);
      fix

     // Ensure continuous listening
      setTimeout(() => this.start(), 200);
       }
  }
}
console.log("VoiceRecognizer class loaded");
console.log("VoiceRecognizer class loaded");
console.log("VoiceRecognizer class loaded");
console.log("VoiceRecognizer class loaded");
run
console.log("VoiceRecognizer class loaded");