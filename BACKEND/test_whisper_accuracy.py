"""
Manual Whisper Accuracy Testing Script
Tests the Whisper model's transcription accuracy
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from services.speech_service import SpeechService
from config import Config
import time

def print_header(title):
    """Print formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_whisper_transcription():
    """Test Whisper transcription with manual recording"""
    
    print_header("WHISPER ACCURACY TEST")
    
    # Initialize service
    print("\n[INIT] Initializing SpeechService with Whisper model...")
    service = SpeechService()
    
    if service.whisper_model is None:
        print("[ERROR] Whisper model failed to load!")
        return
    
    print("[OK] Whisper model loaded successfully")
    
    # Test sentences
    test_sentences = [
        "The quick brown fox jumps over the lazy dog",
        "Pronunciation practice helps improve your speaking skills",
        "Hello, how are you today?",
        "Machine learning is revolutionizing technology",
        "Read this sentence carefully and speak clearly"
    ]
    
    results = []
    
    while True:
        print_header("SELECT TEST OPTION")
        print("\n1. Record and test a custom sentence")
        print("2. Test one of the preset sentences")
        print("3. View results summary")
        print("4. Exit")
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            test_custom_sentence(service, results)
        elif choice == "2":
            test_preset_sentence(service, test_sentences, results)
        elif choice == "3":
            show_results_summary(results)
        elif choice == "4":
            print("\n[EXIT] Thank you for testing!")
            break
        else:
            print("[ERROR] Invalid choice. Please try again.")

def test_custom_sentence(service, results):
    """Test transcription with a custom sentence"""
    print_header("CUSTOM SENTENCE TEST")
    
    expected_text = input("\nEnter the sentence you want to test: ").strip()
    
    if not expected_text:
        print("[ERROR] Please enter a valid sentence")
        return
    
    print(f"\n[EXPECTED] '{expected_text}'")
    print("\n[RECORDING] Speak now (you have 10 seconds)...")
    print("(Make sure your microphone is working)\n")
    
    try:
        # Listen for audio
        audio = service.listen_once(calibrate_seconds=1.0)
        print("[OK] Audio captured")
        
        # Transcribe using Whisper
        print("[TRANSCRIBING] Processing audio with Whisper...\n")
        transcribed_text = service.transcribe(audio)
        
        if not transcribed_text:
            print("[ERROR] Could not transcribe audio. Please try again.")
            return
        
        print(f"[TRANSCRIBED] '{transcribed_text}'")
        
        # Calculate similarity
        similarity = service.calculate_similarity(expected_text, transcribed_text)
        accuracy_percent = round(similarity * 100, 2)
        is_correct = similarity >= Config.SIMILARITY_THRESHOLD
        
        # Display results
        print_header("RESULTS")
        print(f"\nExpected:     '{expected_text}'")
        print(f"Transcribed:  '{transcribed_text}'")
        print(f"Similarity:   {accuracy_percent}%")
        print(f"Status:       {'✓ CORRECT' if is_correct else '✗ INCORRECT'}")
        
        # Get word-level feedback
        feedback = service._get_word_level_feedback(expected_text, transcribed_text)
        if feedback:
            print(f"\nWord-level analysis:")
            for item in feedback:
                status = item.get('status')
                word = item.get('word')
                spoken = item.get('spoken', 'N/A')
                print(f"  - {word:15} → {spoken:15} [{status}]")
        
        # Store result
        result = {
            'expected': expected_text,
            'transcribed': transcribed_text,
            'accuracy': accuracy_percent,
            'correct': is_correct,
            'timestamp': time.strftime("%H:%M:%S")
        }
        results.append(result)
        
    except Exception as e:
        print(f"[ERROR] {e}")

def test_preset_sentence(service, test_sentences, results):
    """Test transcription with a preset sentence"""
    print_header("PRESET SENTENCE TEST")
    
    print("\nAvailable test sentences:")
    for i, sentence in enumerate(test_sentences, 1):
        print(f"{i}. {sentence}")
    
    try:
        choice = int(input("\nSelect a sentence (1-5): ").strip()) - 1
        if 0 <= choice < len(test_sentences):
            expected_text = test_sentences[choice]
        else:
            print("[ERROR] Invalid selection")
            return
    except ValueError:
        print("[ERROR] Invalid input")
        return
    
    print(f"\n[EXPECTED] '{expected_text}'")
    print("\n[RECORDING] Speak now (you have 10 seconds)...")
    print("(Make sure your microphone is working)\n")
    
    try:
        # Listen for audio
        audio = service.listen_once(calibrate_seconds=1.0)
        print("[OK] Audio captured")
        
        # Transcribe using Whisper
        print("[TRANSCRIBING] Processing audio with Whisper...\n")
        transcribed_text = service.transcribe(audio)
        
        if not transcribed_text:
            print("[ERROR] Could not transcribe audio. Please try again.")
            return
        
        print(f"[TRANSCRIBED] '{transcribed_text}'")
        
        # Calculate similarity
        similarity = service.calculate_similarity(expected_text, transcribed_text)
        accuracy_percent = round(similarity * 100, 2)
        is_correct = similarity >= Config.SIMILARITY_THRESHOLD
        
        # Display results
        print_header("RESULTS")
        print(f"\nExpected:     '{expected_text}'")
        print(f"Transcribed:  '{transcribed_text}'")
        print(f"Similarity:   {accuracy_percent}%")
        print(f"Threshold:    {Config.SIMILARITY_THRESHOLD * 100}%")
        print(f"Status:       {'✓ CORRECT' if is_correct else '✗ INCORRECT'}")
        
        # Get word-level feedback
        feedback = service._get_word_level_feedback(expected_text, transcribed_text)
        if feedback:
            print(f"\nWord-level analysis:")
            for item in feedback:
                status = item.get('status')
                word = item.get('word')
                spoken = item.get('spoken', 'N/A')
                print(f"  - {word:15} → {spoken:15} [{status}]")
        
        # Store result
        result = {
            'expected': expected_text,
            'transcribed': transcribed_text,
            'accuracy': accuracy_percent,
            'correct': is_correct,
            'timestamp': time.strftime("%H:%M:%S")
        }
        results.append(result)
        
    except Exception as e:
        print(f"[ERROR] {e}")

def show_results_summary(results):
    """Display summary of all test results"""
    if not results:
        print("\n[INFO] No test results yet")
        return
    
    print_header("TEST RESULTS SUMMARY")
    
    total_tests = len(results)
    correct_tests = sum(1 for r in results if r['correct'])
    avg_accuracy = sum(r['accuracy'] for r in results) / total_tests if total_tests > 0 else 0
    
    print(f"\nTotal Tests:      {total_tests}")
    print(f"Correct:          {correct_tests} ({round(correct_tests/total_tests*100, 1)}%)")
    print(f"Average Accuracy: {round(avg_accuracy, 2)}%")
    
    print("\nDetailed Results:")
    print("-" * 80)
    print(f"{'#':<3} {'Expected':<30} {'Transcribed':<30} {'Accuracy':<10} {'Status':<8}")
    print("-" * 80)
    
    for i, result in enumerate(results, 1):
        expected = result['expected'][:28]
        transcribed = result['transcribed'][:28]
        accuracy = f"{result['accuracy']}%"
        status = "✓" if result['correct'] else "✗"
        print(f"{i:<3} {expected:<30} {transcribed:<30} {accuracy:<10} {status:<8}")
    
    print("-" * 80)

if __name__ == "__main__":
    try:
        test_whisper_transcription()
    except KeyboardInterrupt:
        print("\n\n[EXIT] Test interrupted by user")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
