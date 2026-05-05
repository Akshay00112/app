/**
 * Voice Service for Children's Text-to-Speech (React Native)
 * Uses expo-speech for TTS with child-friendly voice options
 */
import * as Speech from 'expo-speech';

class VoiceService {
    constructor() {
        this.isPlaying = false;
    }

    speak(text, options = {}) {
        // Stop any ongoing speech
        if (this.isPlaying) {
            Speech.stop();
        }

        this.isPlaying = true;

        Speech.speak(text, {
            language: 'en-US',
            pitch: options.pitch || 1.2,
            rate: options.rate || 0.9,
            volume: options.volume || 0.8,
            onStart: () => {
                this.isPlaying = true;
                if (options.onStart) options.onStart();
            },
            onDone: () => {
                this.isPlaying = false;
                if (options.onEnd) options.onEnd();
            },
            onError: (error) => {
                this.isPlaying = false;
                console.error('Speech synthesis error:', error);
                if (options.onError) options.onError(error);
            },
        });
    }

    stop() {
        Speech.stop();
        this.isPlaying = false;
    }

    // Pre-defined encouraging messages
    speakEncouragement(type = 'retry') {
        const messages = {
            perfect: "Yeahhhhh! Awesome! You got it!",
            excellent: "Yeahhhhh! Awesome! You got it!",
            great: "Yeahhhhh! Awesome! You got it!",
            close: "Almost there! Try once more!",
            retry: "You've got this! Try again!",
            milestone: "You're a superstar!",
            complete: "Awesome! You're done!",
        };

        const message = messages[type] || messages.retry;
        this.speak(message, {
            pitch: 1.3,
            rate: 0.85,
            volume: 0.9,
        });
    }
}

export default new VoiceService();
