from flask import Blueprint, request, jsonify, send_from_directory
from urllib.parse import quote
import PyPDF2
import io
import re
import os
import time
import speech_recognition as sr

# ---------- BLUEPRINT ----------
practice_bp = Blueprint('practice', __name__)

# ---------- PRONUNCIATION EVALUATION ----------
from difflib import SequenceMatcher


# ---------- PDF SENTENCE EXTRACTION ----------
def extract_sentences_from_pdf(pdf_file):
    """Extract sentences from PDF file object"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        all_sentences = []

        print(f"[PDF] Processing PDF with {len(pdf_reader.pages)} pages")

        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()

            if text:
                sentences = re.split(r'[.!?]+', text)

                for sentence in sentences:
                    sentence = sentence.strip()
                    if sentence and len(sentence) > 10:
                        all_sentences.append({
                            'text': sentence,
                            'page': page_num + 1,
                            'line': len(all_sentences) + 1,
                            'original_text': sentence
                        })

        print(f"[OK] Extracted {len(all_sentences)} sentences")
        return all_sentences

    except Exception as e:
        print(f"[ERROR] PDF extraction error: {e}")
        raise e


# ---------- PDF UPLOAD ----------
@practice_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf_practice():
    print("[API] PDF upload endpoint called")

    try:
        if 'pdf' not in request.files:
            return jsonify({'error': 'No PDF file provided'}), 400

        pdf_file = request.files['pdf']
        print(f"[PDF] Received file: {pdf_file.filename}")

        if pdf_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400

        from werkzeug.utils import secure_filename

        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                  'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        filename = secure_filename(pdf_file.filename)
        file_path = os.path.join(upload_dir, filename)

        pdf_file.seek(0)
        pdf_file.save(file_path)

        # Use the central PDFProcessor for consistent line-by-line extraction
        from models.pdf_processor import PDFProcessor
        processor = PDFProcessor()
        sentences = processor.extract_text_with_positions(file_path)

        if not sentences:
            return jsonify({
                'success': False,
                'error': 'No readable text found in PDF'
            }), 400

        pdf_url = f'/api/practice/files/{quote(filename)}'

        return jsonify({
            'success': True,
            'filename': pdf_file.filename,
            'sentences': sentences,
            'total_sentences': len(sentences),
            'pdf_url': pdf_url,
            'message': f'PDF processed successfully! Found {len(sentences)} sentences.'
        })

    except Exception as e:
        print(f"[ERROR] PDF processing error: {str(e)}")
        return jsonify({'error': f'PDF processing failed: {str(e)}'}), 500


# ---------- TTS AUDIO GENERATION ----------
@practice_bp.route('/tts', methods=['POST'])
def get_tts_audio():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    try:
        from services.speech_service import SpeechService
        speech_service = SpeechService()
        
        audio_bytes = speech_service.generate_tts_audio(text)
        
        if not audio_bytes:
            return jsonify({'error': 'Failed to generate audio'}), 500
            
        return io.BytesIO(audio_bytes).read(), 200, {'Content-Type': 'audio/wav'}
        
    except Exception as e:
        print(f"[ERROR] TTS error: {e}")
        return jsonify({'error': str(e)}), 500


# ---------- TTS SPEAK SENTENCE (Direct Play) ----------
@practice_bp.route('/speak-sentence', methods=['POST'])
def speak_sentence():
    data = request.json
    sentence = data.get('sentence')
    rate = data.get('rate', 150)

    if not sentence:
        return jsonify({'error': 'No sentence provided'}), 400

    try:
        from services.speech_service import SpeechService
        speech_service = SpeechService()

        if rate:
            speech_service.engine.setProperty('rate', rate)

        speech_service.speak(sentence)

        return jsonify({
            'success': True,
            'message': 'Sentence spoken successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------- PRACTICE SENTENCE ----------
@practice_bp.route('/practice-sentence', methods=['POST'])
def practice_sentence():
    data = request.json
    sentence_text = data.get('sentence')

    if not sentence_text:
        return jsonify({'error': 'No sentence provided'}), 400

    try:
        from services.speech_service import SpeechService
        speech_service = SpeechService()

        result = speech_service.practice_sentence(sentence_text)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'spoken': None,
            'score': 0.0,
            'is_correct': False,
            'mode': 'error'
        }), 500


# ---------- SERVE UPLOADED FILES ----------
@practice_bp.route('/files/<path:filename>')
def serve_pdf(filename):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(base_dir, 'static', 'uploads')

    print(f"[DEBUG] Serving PDF: {filename}")

    return send_from_directory(upload_dir, filename)


# ---------- NEW: PRONUNCIATION EVALUATION ----------
@practice_bp.route("/evaluate-pronunciation", methods=["POST"])
def evaluate_pronunciation():
    """
    Evaluate spoken word pronunciation with detailed feedback
    """
    tmp_path = None
    try:
        print(f"[EVAL] Request files: {request.files}")
        print(f"[EVAL] Request form: {request.form}")
        
        audio_file = request.files.get("audio")
        expected_text = request.form.get("word")

        if not audio_file:
            print("[EVAL] Error: No audio file in request")
            return jsonify({
                "success": False,
                "message": "audio file is required"
            }), 400
            
        if not expected_text:
            print("[EVAL] Error: No word/text in request")
            return jsonify({
                "success": False,
                "message": "word is required"
            }), 400

        print(f"[EVAL] Expected text: '{expected_text}'")
        print(f"[EVAL] Audio filename: {audio_file.filename}")
        print(f"[EVAL] Audio content_type: {audio_file.content_type}")

        audio_bytes = audio_file.read()
        print(f"[EVAL] Audio bytes received: {len(audio_bytes)}")
        
        if len(audio_bytes) < 100:
            return jsonify({
                "success": False,
                "message": "Audio too short"
            }), 400

        from services.speech_service import SpeechService
        speech_service = SpeechService()
        
        # Try to load audio from bytes
        audio_data = None
        
        # Approach 1: Try pydub conversion first (handles m4a, mp3, etc.)
        try:
            print(f"[EVAL] Attempting pydub conversion...")
            from pydub import AudioSegment
            from io import BytesIO
            
            # Try to detect format
            audio_segment = None
            formats = ["m4a", "mp3", "wav", "ogg", "flac"]
            
            for fmt in formats:
                try:
                    print(f"[EVAL] Trying pydub with format: {fmt}")
                    audio_segment = AudioSegment.from_file(BytesIO(audio_bytes), format=fmt)
                    print(f"[EVAL] Detected and loaded format SUCCESS: {fmt}")
                    break
                except Exception as fmt_err:
                    print(f"[EVAL] Format {fmt} failed: {str(fmt_err)[:100]}")
                    continue
            
            if audio_segment:
                # Convert to WAV
                wav_io = BytesIO()
                audio_segment.export(wav_io, format="wav")
                wav_io.seek(0)
                
                # Load with speech_recognition
                with sr.AudioFile(wav_io) as source:
                    audio_data = speech_service.recognizer.record(source)
                print(f"[EVAL] Success: Audio converted and loaded")
            else:
                print(f"[EVAL] Could not detect audio format with pydub")
                
        except ImportError:
            print(f"[EVAL] Pydub not available, trying temp file approach")
        except Exception as e:
            print(f"[EVAL] Pydub approach failed: {e}")
        
        # Approach 2: Save to temp file and load
        if not audio_data:
            try:
                print(f"[EVAL] Attempting temp file approach...")
                import tempfile
                
                with tempfile.NamedTemporaryFile(suffix='.m4a', delete=False) as tmp:
                    tmp.write(audio_bytes)
                    tmp_path = tmp.name
                
                print(f"[EVAL] Saved to: {tmp_path}")
                
                # Try loading with pydub first
                try:
                    from pydub import AudioSegment
                    from io import BytesIO
                    
                    audio_segment = AudioSegment.from_file(tmp_path)
                    wav_io = BytesIO()
                    audio_segment.export(wav_io, format="wav")
                    wav_io.seek(0)
                    
                    with sr.AudioFile(wav_io) as source:
                        audio_data = speech_service.recognizer.record(source)
                    print(f"[EVAL] Success: Temp file converted with pydub")
                    
                except Exception as pydub_err:
                    print(f"[EVAL] Temp file pydub failed: {pydub_err}")
                    
                    # Try direct wav loading
                    try:
                        with sr.AudioFile(tmp_path) as source:
                            audio_data = speech_service.recognizer.record(source)
                        print(f"[EVAL] Success: Temp file loaded directly")
                    except Exception as wav_err:
                        print(f"[EVAL] Temp file direct load failed: {wav_err}")
                
            except Exception as e:
                print(f"[EVAL] Temp file approach failed: {e}")
        
        # If we still don't have audio, fail
        if not audio_data:
            print(f"[EVAL] Could not load audio by any method")
            return jsonify({
                "success": False,
                "message": "Unable to process audio. Please try recording again.",
                "error": "Audio format processing failed"
            }), 400
        
        # Transcribe
        print(f"[EVAL] Transcribing...")
        spoken_text = speech_service.transcribe(audio_data)
        print(f"[EVAL] Spoken text: {spoken_text}")
        
        if not spoken_text:
            return jsonify({
                "success": True,
                "is_correct": False,
                "score": 0.0,
                "feedback": "Could not understand audio",
                "spoken_text": "",
                "word_feedback": []
            })

        # Calculate similarity
        print(f"[EVAL] Calculating similarity...")
        similarity = speech_service.calculate_similarity(expected_text, spoken_text)
        word_feedback = speech_service._get_word_level_feedback(expected_text, spoken_text)
        
        print(f"[EVAL] Similarity: {similarity}")
        
        is_correct = similarity >= 0.6
        
        # Generate feedback with word-level details
        base_feedback = f"✨ Great job! Score: {int(similarity*100)}%" if is_correct else f"Let's try again! Score: {int(similarity*100)}%"
        word_detail = speech_service.generate_word_feedback_message(word_feedback)
        full_feedback = f"{base_feedback} | {word_detail}" if word_detail else base_feedback
        
        # If incorrect or skipped, generate audio response to speak the correct word
        audio_response = None
        if not is_correct:
            try:
                print(f"[EVAL] Generating audio response for: {expected_text}")
                audio_bytes = speech_service.generate_tts_audio(expected_text)
                if audio_bytes:
                    import base64
                    audio_response = base64.b64encode(audio_bytes).decode('utf-8')
                    print(f"[EVAL] Audio response generated: {len(audio_bytes)} bytes")
            except Exception as e:
                print(f"[EVAL] Failed to generate audio response: {e}")
        
        response_data = {
            "success": True,
            "is_correct": is_correct,
            "score": round(similarity, 2),
            "feedback": full_feedback,
            "word_feedback": word_feedback,
            "spoken_text": spoken_text
        }
        
        # Add audio response if available
        if audio_response:
            response_data["audio_response"] = audio_response
        
        return jsonify(response_data)

    except Exception as e:
        print(f"[ERROR] Evaluation failed: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except:
                pass
