"""
Backend Whisper Accuracy Test - Direct Terminal Output
Real-time detection logging in backend terminal
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from services.speech_service import SpeechService
import time

def test_accuracy():
    """Test Whisper accuracy with real-time backend logging"""
    
    print("\n" + "="*70)
    print("  WHISPER BACKEND ACCURACY TEST")
    print("="*70)
    
    # Initialize service
    print("\n[INIT] Initializing SpeechService with Whisper tiny model...")
    service = SpeechService()
    
    if service.whisper_model is None:
        print("[ERROR] Whisper model failed to load!")
        return
    
    print("[✓] Whisper model loaded successfully\n")
    
    while True:
        print("\n" + "-"*70)
        print("OPTIONS:")
        print("  1. Type a sentence, then read it aloud to test detection")
        print("  2. Exit")
        print("-"*70)
        
        choice = input("\nEnter choice (1-2): ").strip()
        
        if choice == "1":
            # Get sentence from user
            sentence = input("\nType the sentence you want to read: ").strip()
            
            if not sentence:
                print("[ERROR] Please enter a valid sentence")
                continue
            
            print(f"\n[INPUT SENTENCE] '{sentence}'")
            print("\n" + "="*70)
            print("  RECORDING IN PROGRESS")
            print("="*70)
            print("\n⏹️  SPEAK NOW (10 seconds) - Read the sentence clearly...")
            print("(Make sure your microphone is working)\n")
            
            try:
                # Listen to microphone
                audio = service.listen_once(calibrate_seconds=1.0)
                print("\n[✓] Audio captured successfully")
                
                # Show transcription process
                print("\n" + "="*70)
                print("  BACKEND PROCESSING")
                print("="*70)
                
                # Transcribe with backend logging
                transcribed = service.transcribe(audio)
                
                if not transcribed:
                    print("\n[ERROR] Could not transcribe audio")
                    continue
                
                # Calculate similarity
                similarity = service.calculate_similarity(sentence, transcribed)
                accuracy = round(similarity * 100, 2)
                
                # Display results
                print("\n" + "="*70)
                print("  DETECTION RESULTS")
                print("="*70)
                print(f"\n📝 INPUT SENTENCE:    '{sentence}'")
                print(f"🎤 DETECTED:         '{transcribed}'")
                print(f"📊 ACCURACY:         {accuracy}%")
                
                if accuracy >= 65:
                    print(f"✅ STATUS:           PASS (Threshold: 65%)")
                else:
                    print(f"❌ STATUS:           FAIL (Threshold: 65%)")
                
                # Word-level analysis
                print("\n" + "-"*70)
                print("  WORD-LEVEL ANALYSIS")
                print("-"*70)
                
                feedback = service._get_word_level_feedback(sentence, transcribed)
                if feedback:
                    print("\nWord Breakdown:")
                    for item in feedback:
                        status = item.get('status')
                        word = item.get('word', '')
                        spoken = item.get('spoken', 'N/A')
                        
                        if status == 'correct':
                            symbol = "✓"
                        elif status == 'mispronounced':
                            symbol = "⚠️"
                        elif status == 'missed':
                            symbol = "✗"
                        else:
                            symbol = "?"
                        
                        print(f"  {symbol} {word:20} → {spoken:20} [{status}]")
                else:
                    print("\n[No word feedback available]")
                
                print("\n" + "="*70 + "\n")
                
            except Exception as e:
                print(f"\n[ERROR] {e}")
                import traceback
                traceback.print_exc()
        
        elif choice == "2":
            print("\n[EXIT] Goodbye!\n")
            break
        
        else:
            print("[ERROR] Invalid choice")

if __name__ == "__main__":
    try:
        test_accuracy()
    except KeyboardInterrupt:
        print("\n\n[EXIT] Test interrupted")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
