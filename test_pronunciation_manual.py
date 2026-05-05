#!/usr/bin/env python3
"""
Manual Pronunciation Testing Script
Test the speech recognition and pronunciation evaluation system
"""

import requests
import speech_recognition as sr
import io
from pydub import AudioSegment
import time
import sys

# API Configuration
API_URL = "http://localhost:5000"
EVALUATE_ENDPOINT = f"{API_URL}/api/practice/evaluate-pronunciation"

def record_audio(duration=5):
    """Record audio from microphone for specified duration"""
    print(f"\n🎤 Recording for {duration} seconds...")
    print("   Start speaking NOW!")
    
    recognizer = sr.Recognizer()
    recognizer.dynamic_energy_threshold = True
    
    try:
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.listen(source, timeout=duration + 2, phrase_time_limit=duration)
        
        # Save to BytesIO in WAV format
        wav_data = io.BytesIO(audio.get_wav_data())
        print("   ✅ Recording complete!")
        
        return wav_data
    
    except sr.WaitTimeoutError:
        print("   ❌ No sound detected! Please try again.")
        return None
    except Exception as e:
        print(f"   ❌ Recording error: {e}")
        return None

def evaluate_pronunciation(word, audio_data):
    """Send audio to server for evaluation"""
    print(f"\n📊 Evaluating pronunciation of '{word}'...")
    
    try:
        # Prepare files for multipart form data
        files = {
            'audio': ('audio.wav', audio_data, 'audio/wav')
        }
        data = {
            'word': word
        }
        
        # Send request
        response = requests.post(EVALUATE_ENDPOINT, files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                return result
            else:
                print(f"   ❌ Evaluation failed: {result.get('error', 'Unknown error')}")
                return None
        else:
            print(f"   ❌ Server error ({response.status_code}): {response.text}")
            return None
    
    except Exception as e:
        print(f"   ❌ Request error: {e}")
        return None

def display_results(result, word):
    """Display detailed results of pronunciation evaluation"""
    if not result:
        return
    
    is_correct = result.get('is_correct', False)
    score = result.get('score', 0)
    feedback = result.get('feedback', '')
    word_feedback = result.get('word_feedback', [])
    spoken_text = result.get('spoken_text', '')
    
    # Main result
    print("\n" + "="*60)
    if is_correct:
        print("✅ CORRECT! Great job!")
    else:
        print("❌ INCORRECT - Try again")
    print("="*60)
    
    # Score
    print(f"📈 Score: {int(score * 100)}%")
    
    # Spoken text
    print(f"🎤 You said: '{spoken_text}'")
    print(f"📖 Expected: '{word}'")
    
    # Feedback
    print(f"\n💬 Feedback: {feedback}")
    
    # Word-level feedback
    if word_feedback:
        print("\n📝 Word-by-word analysis:")
        for item in word_feedback:
            word_text = item.get('word', 'N/A')
            status = item.get('status', 'unknown')
            
            if status == 'correct':
                print(f"   ✅ {word_text}")
            elif status == 'mispronounced':
                spoken = item.get('spoken', '?')
                similarity = item.get('similarity', 0)
                print(f"   ❌ {word_text} (you said: '{spoken}', {int(similarity*100)}% match)")
            elif status == 'missed':
                print(f"   ⏭️  {word_text} (missed)")
            elif status == 'extra':
                print(f"   ➕ {word_text} (extra word, not in original)")
            elif status == 'article-error':
                spoken = item.get('spoken', '?')
                print(f"   ⚠️  {word_text} (article error - you said: '{spoken}')")
    
    print("\n" + "="*60)

def test_word(word):
    """Test a single word"""
    print(f"\n\n🔤 Testing word: '{word}'")
    print("-" * 60)
    
    # Record audio
    audio_data = record_audio(duration=5)
    if not audio_data:
        return False
    
    # Reset to beginning of BytesIO
    audio_data.seek(0)
    
    # Evaluate
    result = evaluate_pronunciation(word, audio_data)
    
    # Display results
    display_results(result, word)
    
    return result.get('is_correct', False) if result else False

def main():
    """Main testing function"""
    print("\n" + "="*60)
    print("🧪 DYSLEXIA APP - PRONUNCIATION TESTING")
    print("="*60)
    print("\nThis tool lets you manually test pronunciation recognition.")
    print("The system will record your speech and evaluate it.\n")
    
    # Check if server is running
    try:
        response = requests.get(f"{API_URL}/api/health", timeout=2)
    except:
        print("❌ ERROR: Backend server is not running!")
        print(f"   Please start the server at {API_URL} first")
        print("\n   Command to start server:")
        print("   cd BACKEND && python app.py")
        return
    
    print("✅ Server is running!\n")
    
    # Test words
    test_words = [
        "hello",
        "beautiful",
        "pronunciation",
        "dyslexia",
        "orange"
    ]
    
    print("Available test words:")
    for i, word in enumerate(test_words, 1):
        print(f"   {i}. {word}")
    print(f"   0. Custom word")
    print("   Q. Quit")
    
    correct_count = 0
    total_count = 0
    
    while True:
        try:
            choice = input("\n👉 Select word (0-5 or Q to quit): ").strip().lower()
            
            if choice == 'q':
                print("\n\n📊 Test Summary:")
                if total_count > 0:
                    accuracy = (correct_count / total_count) * 100
                    print(f"   Correct: {correct_count}/{total_count} ({accuracy:.1f}%)")
                print("\nThanks for testing! 👋")
                break
            
            if choice == '0':
                word = input("👉 Enter word to test: ").strip()
                if not word:
                    print("❌ Please enter a word")
                    continue
            else:
                try:
                    idx = int(choice)
                    if 1 <= idx <= len(test_words):
                        word = test_words[idx - 1]
                    else:
                        print(f"❌ Please select 0-{len(test_words)} or Q")
                        continue
                except ValueError:
                    print(f"❌ Invalid input. Please select 0-{len(test_words)} or Q")
                    continue
            
            # Test the word
            is_correct = test_word(word)
            total_count += 1
            if is_correct:
                correct_count += 1
            
            # Ask if they want to continue
            repeat = input("\n👉 Test another word? (Y/N): ").strip().lower()
            if repeat != 'y':
                print("\n\n📊 Test Summary:")
                if total_count > 0:
                    accuracy = (correct_count / total_count) * 100
                    print(f"   Correct: {correct_count}/{total_count} ({accuracy:.1f}%)")
                print("\nThanks for testing! 👋")
                break
        
        except KeyboardInterrupt:
            print("\n\n\n⏹️  Testing interrupted")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            continue

if __name__ == "__main__":
    main()
