import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioRecorder, requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import VoiceService from '../services/VoiceService';
import api from '../services/api';
import Config from '../config';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

// Modular Components
import Header from '../components/Header';
import Status from '../components/Status';
import WordSuccessBadge from '../components/WordSuccessBadge';
import SuccessAnimation from '../components/SuccessAnimation';

const MAX_LINE_CHARS = 38; // ~one mobile screen line

// Split a sentence into mobile-width lines at word boundaries
const splitIntoMobileLines = (text) => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
        if (current.length + word.length + 1 > MAX_LINE_CHARS && current.length > 0) {
            lines.push(current.trim());
            current = word;
        } else {
            current += (current ? ' ' : '') + word;
        }
    }
    if (current.trim()) lines.push(current.trim());
    return lines.length > 0 ? lines : [text.trim()];
};

const ReaderScreen = ({ navigation, route }) => {
    const { fetchHistory, addToHistory, pdfHistory } = useAuth();

    // State
    const [allSentences, setAllSentences] = useState([]);
    const [mobileLines, setMobileLines] = useState([]); // flattened mobile-sized lines
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Upload a PDF to begin');
    const [feedback, setFeedback] = useState('');
    const [wordFeedback, setWordFeedback] = useState([]);
    const [currentView, setCurrentView] = useState('upload'); // 'upload' or 'reading'
    const [sessionStats, setSessionStats] = useState({
        totalSentences: 0,
        completedSentences: 0,
        correctAttempts: 0,
        totalAttempts: 0,
    });
    const [lastAttemptSuccessful, setLastAttemptSuccessful] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Use a ref to store the current book/PDF history ID
    // This ensures we always have the correct ID for progress saving
    const currentHistoryId = useRef(route.params?.pdf?.id || null);

    const recorder = useAudioRecorder({
        extension: '.m4a',
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        android: {
            extension: '.m4a',
            outputFormat: 'mpeg4',
            audioEncoder: 'aac',
            sampleRate: 16000,
        },
        ios: {
            extension: '.m4a',
            outputFormat: 'aac ',
            audioQuality: 127,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
        },
    });
    const player = useAudioPlayer();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Load PDF from history (if coming from Books/Progress)
    React.useEffect(() => {
        if (route.params?.pdf) {
            loadPdfFromHistory(route.params.pdf);
        }
        
        // Cleanup on unmount (hooks handle most of this now)
        return () => {
            // Player and Recorder from hooks will clean up automatically
        };
    }, [route.params?.pdf]);

    const loadPdfFromHistory = async (pdf) => {
        setIsProcessing(true);
        setStatus('Loading content...');
        try {
            let sentences = [];
            let totalSentences = 0;
            let totalPages = 0;

            if (pdf.isOnlineBook) {
                setStatus(`Processing "${pdf.title || pdf.pdf_name}"...`);
                const response = await api.post('/api/online-books/process', { text_url: pdf.text_url });
                if (response.data.success) {
                    sentences = response.data.sentences || [];
                    totalSentences = response.data.total_sentences || 0;
                    totalPages = 1;
                    
                    setAllSentences(sentences);
                    // Split all sentences into mobile-sized lines
                    const lines = sentences.flatMap(s => splitIntoMobileLines(s.text));
                    setMobileLines(lines);
                    setCurrentView('reading');
                    setStatus(`"${pdf.title || pdf.pdf_name}" loaded!`);
                    
                    // Update history ID ref
                    const historyId = pdf.id || null;
                    currentHistoryId.current = historyId;
                    
                    if (!historyId) {
                        const newHistoryId = await addToHistory({ ...pdf, pdf_name: pdf.title || pdf.pdf_name, isOnlineBook: true });
                        // Update local pdf object and ref with the new ID for progress saving
                        pdf.id = newHistoryId;
                        currentHistoryId.current = newHistoryId;
                    }
                    await fetchHistory();
                } else {
                    setStatus(`Failed to load: ${response.data.error}`);
                    setIsProcessing(false);
                    return;
                }
            } else {
                const response = await api.post('/api/pdf/load-pdf', {
                    filename: pdf.pdf_path || pdf.filename || pdf.pdf_name,
                });
                if (response.data.success) {
                    sentences = response.data.sentences;
                    totalSentences = response.data.total_sentences || 0;
                    totalPages = response.data.pages || 1;
                    
                    setAllSentences(sentences);
                    // Split all sentences into mobile-sized lines
                    const lines = sentences.flatMap(s => splitIntoMobileLines(s.text));
                    setMobileLines(lines);
                    
                    // Set history ID ref
                    currentHistoryId.current = pdf.id || pdf._id || null;
                    
                    setCurrentView('reading');
                    setStatus('Document loaded successfully!');
                    await fetchHistory();
                } else {
                    setStatus(`Failed to load: ${response.data.error || 'Check if file exists'}`);
                    setIsProcessing(false);
                    return;
                }
            }

            // Restore progress if available
            const savedIndex = pdf.current_sentence || 0;
            setCurrentLineIndex(savedIndex);
            
            setSessionStats({
                totalSentences: totalSentences,
                completedSentences: pdf.completed_sentences || 0,
                correctAttempts: pdf.correct_attempts || 0,
                totalAttempts: pdf.total_attempts || 0,
            });

        } catch (error) {
            console.error('Load error:', error);
            setStatus('Failed to load content');
        } finally {
            setIsProcessing(false);
        }
    };

    // WAV_OPTIONS removed as it's now integrated into the recorder hook initialization

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
            if (result.canceled) return;
            const file = result.assets[0];
            setIsProcessing(true);
            setStatus('Processing PDF...');
            const formData = new FormData();
            formData.append('pdf', { uri: file.uri, name: file.name, type: 'application/pdf' });
            const response = await api.post('/api/pdf/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: Config.UPLOAD_TIMEOUT,
            });
            if (response.data.success) {
                const sentences = response.data.sentences;
                setAllSentences(sentences);
                // Split all sentences into mobile-sized lines
                const lines = sentences.flatMap(s => splitIntoMobileLines(s.text));
                setMobileLines(lines);
                setCurrentView('reading');
                setStatus('Document loaded successfully!');
                setSessionStats({ totalSentences: response.data.total_sentences || 0, completedSentences: 0, correctAttempts: 0, totalAttempts: 0 });
                
                const historyId = await addToHistory({
                    pdf_name: response.data.original_filename,
                    pdf_path: response.data.filename,
                    total_pages: response.data.pages || 1,
                    total_sentences: response.data.total_sentences || 0,
                    file_size: file.size || 0,
                });
                
                // Set history ID ref
                currentHistoryId.current = historyId;
                
                await fetchHistory();
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus('Upload failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await requestRecordingPermissionsAsync();
            if (!permission.granted) return;
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, playThroughEarpieceAndroid: false });
            
            await recorder.prepareToRecordAsync();
            recorder.record();
            
            setIsRecording(true);
            setStatus('🎤 Recording... Speak now!');
            Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])).start();
        } catch (err) { console.error(err); }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
        try {
            await recorder.stop();
            const uri = recorder.uri;
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true, playThroughEarpieceAndroid: false });
            if (uri) await practiceCurrentSentence(uri);
        } catch (err) { console.error(err); }
    };

    const practiceCurrentSentence = async (audioUri) => {
        setIsProcessing(true);
        setShowConfetti(false);
        setStatus('Evaluating pronunciation...');
        try {
            // Use the current mobile line for evaluation
            const textToPractice = mobileLines[currentLineIndex] || '';
            console.log(`[EVAL] Practicing line ${currentLineIndex}: "${textToPractice}"`);
            console.log(`[EVAL] Audio URI: ${audioUri}`);
            
            if (!textToPractice) {
                setStatus('No text to practice');
                setIsProcessing(false);
                return;
            }
            
            const formData = new FormData();
            formData.append('audio', { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' });
            formData.append('word', textToPractice);
            const response = await api.post('/api/practice/evaluate-pronunciation', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                setWordFeedback(response.data.word_feedback || []);
                setFeedback(response.data.feedback);
                setSessionStats((prev) => ({
                    ...prev,
                    totalAttempts: prev.totalAttempts + 1,
                    correctAttempts: response.data.is_correct ? prev.correctAttempts + 1 : prev.correctAttempts,
                }));

                const hasErrors = response.data.word_feedback?.some((w) => ['mispronounced', 'missed', 'article-error'].includes(w.status));

                if (response.data.is_correct && !hasErrors) {
                    setShowConfetti(true);
                    setStatus('🎉 Perfect! All words correct!');
                    setLastAttemptSuccessful(true);
                    VoiceService.speakEncouragement('perfect');
                    
                    // Auto-advance to next sentence after a short delay
                    setTimeout(() => {
                        autoAdvanceToNext();
                    }, 2500);
                } else {
                    setStatus("So close! Try again! 💪");
                    VoiceService.speakEncouragement('close');
                    
                    // Play the correct pronunciation if audio response is available
                    if (response.data.audio_response) {
                        setTimeout(() => playCorrectPronunciation(response.data.audio_response), 1000);
                    }
                }
            }
        } catch (error) { console.error(error); setStatus('Error with evaluation'); }
        finally { setIsProcessing(false); }
    };

    const playCorrectPronunciation = async (base64Audio) => {
        try {
            // Create data URI from base64 audio
            const audioUri = `data:audio/wav;base64,${base64Audio}`;
            
            // Play sound using the player hook
            player.replace(audioUri);
            player.play();
            
            console.log('Playing correct pronunciation audio');
        } catch (error) {
            console.error('Error playing audio response:', error);
        }
    };

    const onRetry = () => {
        setShowConfetti(false);
        if (lastAttemptSuccessful) {
            goToNextLine();
            setLastAttemptSuccessful(false);
        } else {
            setStatus('Ready to try again!');
        }
        setWordFeedback([]);
        setFeedback('');
    };

    const goToNextLine = () => {
        if (currentLineIndex < mobileLines.length - 1) {
            const newIndex = currentLineIndex + 1;
            setCurrentLineIndex(newIndex);
            const newStats = {
                ...sessionStats,
                completedSentences: sessionStats.completedSentences + 1
            };
            setSessionStats(newStats);
            saveProgress(newIndex, newStats);
            setStatus('Ready for next line');
            setWordFeedback([]);
            setFeedback('');
        } else {
            setStatus('🎉 Book Completed!');
        }
    };

    const goToPrevLine = () => {
        if (currentLineIndex > 0) {
            const newIndex = currentLineIndex - 1;
            setCurrentLineIndex(newIndex);
            setStatus('Went back to previous line');
            setWordFeedback([]);
            setFeedback('');
            setShowConfetti(false);
            setLastAttemptSuccessful(false);
        }
    };

    const saveProgress = async (currentPage, stats) => {
        try {
            // Use the history ID from our ref
            const historyId = currentHistoryId.current;
            console.log(`[DEBUG] saveProgress - historyId: ${historyId}, page: ${currentPage}`);

            if (historyId) {
                console.log(`Saving progress for book ID: ${historyId}, line: ${currentPage}`);
                await api.put(`/api/history/${historyId}/progress`, {
                    current_sentence: currentPage,
                    completed_sentences: stats.completedSentences,
                    total_attempts: stats.totalAttempts,
                    correct_attempts: stats.correctAttempts
                });
            } else {
                console.warn('No historyId available to save progress');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const autoAdvanceToNext = () => {
        setShowConfetti(false);
        setLastAttemptSuccessful(false);
        setWordFeedback([]);
        setFeedback('');
        
        if (currentLineIndex < mobileLines.length - 1) {
            const newIndex = currentLineIndex + 1;
            setCurrentLineIndex(newIndex);
            
            setSessionStats(prevStats => {
                const newStats = {
                    ...prevStats,
                    completedSentences: prevStats.completedSentences + 1
                };
                saveProgress(newIndex, newStats);
                return newStats;
            });
            
            setStatus('Ready for next line');
        } else {
            setStatus('🎉 Book Completed!');
        }
    };

    const restartSession = async () => {
        try {
            // Save final session stats and refresh history
            await fetchHistory();
        } catch (error) {
            console.error('Error saving session:', error);
        }
        
        setCurrentView('upload');
        setAllSentences([]);
        setMobileLines([]);
        setCurrentLineIndex(0);
        setWordFeedback([]);
        setFeedback('');
        setLastAttemptSuccessful(false);
        setStatus('Upload a PDF to begin');
    };

    const currentLineText = mobileLines[currentLineIndex] || '';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>

                <SuccessAnimation
                    show={showConfetti}
                    onComplete={() => setShowConfetti(false)}
                    message="Fantastic Reading!"
                />

                <Header
                    title={currentView === 'upload' ? 'Upload' : `Line ${currentLineIndex + 1}/${mobileLines.length}`}
                    showBack={true}
                    onBack={currentView === 'upload' ? () => navigation.goBack() : restartSession}
                />

                {currentView === 'upload' ? (
                    <View style={styles.uploadContent}>
                        <TouchableOpacity style={styles.uploadCard} onPress={handleFileUpload} disabled={isProcessing} activeOpacity={0.8}>
                            {isProcessing ? (
                                <View style={styles.uploadCardInner}>
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                    <Text style={styles.uploadCardText}>{status}</Text>
                                </View>
                            ) : (
                                <View style={styles.uploadCardInner}>
                                    <Text style={styles.uploadIcon}>📄</Text>
                                    <Text style={styles.uploadCardTitle}>Tap to Upload PDF</Text>
                                    <Text style={styles.uploadCardText}>Improve your reading with AI feedback</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.readingContent} showsVerticalScrollIndicator={false}>
                        <Status status={status} feedback={feedback} />

                        <View style={styles.sentenceCard}>
                            <Text style={styles.sentenceLabel}>Read this line:</Text>
                            <View style={styles.focusContainer}>
                                {wordFeedback.length > 0 ? (
                                    <View style={styles.wordRow}>
                                        {wordFeedback.map((word, index) => (
                                            <WordSuccessBadge 
                                                key={index} 
                                                word={word.word} 
                                                status={word.status}
                                                correct_word={word.correct_word}
                                                spoken={word.spoken}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <Text style={[styles.sentenceText, styles.activeSentenceGlow]}>
                                            {currentLineText}
                                        </Text>
                                    </ScrollView>
                                )}
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={styles.listenButton} 
                                onPress={() => VoiceService.speak(currentLineText)} 
                                activeOpacity={0.8}
                            >
                                <Text style={styles.listenButtonText}>🔊 Listen</Text>
                            </TouchableOpacity>

                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <TouchableOpacity style={[styles.recordButton, isRecording && styles.recordButtonActive]} onPress={isRecording ? stopRecording : startRecording} disabled={isProcessing} activeOpacity={0.8}>
                                    <LinearGradient colors={isRecording ? ['#ef4444', '#dc2626'] : [Colors.primary, Colors.accent]} style={styles.recordButtonGradient}>
                                        {isProcessing ? <ActivityIndicator size="large" color={Colors.textWhite} /> : (
                                            <><Text style={styles.recordIcon}>{isRecording ? '⏹' : '🎤'}</Text>
                                                <Text style={styles.recordText}>{isRecording ? 'Stop' : 'Start Reading'}</Text></>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Navigation: Back / Retry / Next */}
                            <View style={styles.navRow}>
                                <TouchableOpacity 
                                    style={[styles.navButton, currentLineIndex === 0 && styles.navButtonDisabled]} 
                                    onPress={goToPrevLine} 
                                    disabled={currentLineIndex === 0}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.navButtonText}>⬅ Back</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                                    <Text style={styles.retryButtonText}>🔄 Retry</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.navButton, currentLineIndex >= mobileLines.length - 1 && styles.navButtonDisabled]} 
                                    onPress={goToNextLine} 
                                    disabled={currentLineIndex >= mobileLines.length - 1}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.navButtonText}>Next ➡</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.statsCard}>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}><Text style={styles.statValue}>{sessionStats.correctAttempts}</Text><Text style={styles.statLabel}>Success</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>{sessionStats.totalAttempts}</Text><Text style={styles.statLabel}>Attempts</Text></View>
                                <View style={styles.statItem}><Text style={styles.statValue}>{Math.round((sessionStats.correctAttempts / (sessionStats.totalAttempts || 1)) * 100)}%</Text><Text style={styles.statLabel}>Accuracy</Text></View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    uploadContent: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl },
    uploadCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xxxl, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dotted', ...Shadows.card },
    uploadCardInner: { alignItems: 'center' },
    uploadIcon: { fontSize: 64, marginBottom: Spacing.lg },
    uploadCardTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textWhite, marginBottom: Spacing.sm },
    uploadCardText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center' },
    readingContent: { paddingBottom: Spacing.huge },
    sentenceCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xxl, marginHorizontal: Spacing.xl, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
    sentenceLabel: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginBottom: Spacing.lg, fontWeight: '700', textTransform: 'uppercase' },
    focusContainer: { marginBottom: Spacing.md },
    upcomingLinesContainer: { marginTop: Spacing.sm },
    sentenceText: { color: Colors.textWhite, fontSize: FontSizes.xl, lineHeight: 32 },
    activeSentenceGlow: {
        textShadowColor: 'rgba(255, 255, 255, 0.7)',
        textShadowRadius: 15,
        textShadowOffset: { width: 0, height: 0 },
        fontWeight: 'bold',
    },
    blurredSentence: {
        color: 'transparent',
        textShadowColor: 'rgba(255, 255, 255, 0.25)',
        textShadowRadius: 10,
        textShadowOffset: { width: 0, height: 0 },
        marginTop: Spacing.sm,
    },
    wordRow: { flexDirection: 'row', flexWrap: 'wrap' },
    actionButtons: { paddingHorizontal: Spacing.xl, gap: Spacing.lg, marginBottom: Spacing.xxl },
    listenButton: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    listenButtonText: { color: Colors.blueLight, fontSize: FontSizes.md, fontWeight: '600' },
    recordButton: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.glow },
    recordButtonGradient: { paddingVertical: Spacing.xl, alignItems: 'center' },
    recordIcon: { fontSize: 40, marginBottom: Spacing.xs },
    recordText: { color: Colors.textWhite, fontSize: FontSizes.lg, fontWeight: '700' },
    retryButton: { flex: 1, backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' },
    retryButtonText: { color: Colors.accentLight, fontSize: FontSizes.sm, fontWeight: '600' },
    navRow: { flexDirection: 'row', gap: Spacing.md },
    navButton: { flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    navButtonDisabled: { opacity: 0.3 },
    navButtonText: { color: Colors.blueLight, fontSize: FontSizes.sm, fontWeight: '600' },
    statsCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.lg, marginHorizontal: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { color: Colors.textWhite, fontSize: FontSizes.xl, fontWeight: '800' },
    statLabel: { color: Colors.textSecondary, fontSize: 10, textTransform: 'uppercase' },
});

export default ReaderScreen;
