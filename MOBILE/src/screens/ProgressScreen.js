import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const ProgressScreen = ({ navigation }) => {
    const { pdfHistory, fetchHistory } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchHistory();
            } catch (error) {
                console.error('Error loading history:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchHistory]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchHistory();
        } catch (error) {
            console.error('Error refreshing history:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const totalBooks = pdfHistory.length;
    const totalSentences = pdfHistory.reduce((sum, h) => sum + (h.total_sentences || 0), 0);
    const totalPages = pdfHistory.reduce((sum, h) => sum + (h.total_pages || 0), 0);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>
                <Header
                    title="Progress"
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                        />
                    }
                >
                    {/* Stats Overview */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { borderColor: Colors.borderBlue }]}>
                            <Text style={styles.statEmoji}>📚</Text>
                            <Text style={styles.statValue}>{totalBooks}</Text>
                            <Text style={styles.statLabel}>Books Read</Text>
                        </View>
                        <View style={[styles.statCard, { borderColor: Colors.borderPurple }]}>
                            <Text style={styles.statEmoji}>📝</Text>
                            <Text style={styles.statValue}>{totalSentences}</Text>
                            <Text style={styles.statLabel}>Sentences</Text>
                        </View>
                        <View style={[styles.statCard, { borderColor: Colors.borderPink }]}>
                            <Text style={styles.statEmoji}>📄</Text>
                            <Text style={styles.statValue}>{totalPages}</Text>
                            <Text style={styles.statLabel}>Pages</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                        <Text style={styles.sectionTitle}>Reading Journey</Text>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${Math.min(totalBooks * 10, 100)}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {totalBooks > 0
                                ? `Great job! You've read ${totalBooks} book${totalBooks !== 1 ? 's' : ''}!`
                                : 'Start reading to track your progress!'}
                        </Text>
                    </View>

                    {/* Reading History */}
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>Reading History</Text>
                        {pdfHistory.length === 0 ? (
                            <View style={styles.emptyHistory}>
                                <Text style={styles.emptyIcon}>📭</Text>
                                <Text style={styles.emptyText}>No reading history yet</Text>
                                <TouchableOpacity
                                    style={styles.startButton}
                                    onPress={() => navigation.navigate('Books')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.startButtonText}>Start Reading →</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            pdfHistory.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id || index}
                                    style={styles.historyItem}
                                    onPress={() => navigation.navigate('Reader', { pdf: item })}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.historyIcon}>
                                        <Text style={{ fontSize: 20 }}>
                                            {item.isOnlineBook ? '🌐' : '📄'}
                                        </Text>
                                    </View>
                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyTitle} numberOfLines={1}>
                                            {item.pdf_name || item.title || 'Untitled'}
                                        </Text>
                                        <Text style={styles.historyMeta}>
                                            {item.total_sentences ? `${item.total_sentences} sentences` : ''}
                                            {item.total_pages ? ` · ${item.total_pages} pages` : ''}
                                            {item.total_sentences > 0 && (
                                                <Text style={{ color: Colors.primaryLight }}>
                                                    {' · '}{Math.round(((item.current_sentence || 0) / item.total_sentences) * 100)}%
                                                </Text>
                                            )}
                                        </Text>
                                        {item.completed_sentences > 0 && (
                                            <Text style={styles.historyProgress}>
                                                ✓ {item.completed_sentences} completed
                                                {item.correct_attempts > 0 ? ` · ${item.correct_attempts} correct` : ''}
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.historyArrow}>→</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* Milestones */}
                    <View style={styles.milestonesSection}>
                        <Text style={styles.sectionTitle}>🏅 Milestones</Text>
                        {[
                            { count: 1, label: 'First Book', emoji: '🌟', achieved: totalBooks >= 1 },
                            { count: 5, label: '5 Books', emoji: '🎯', achieved: totalBooks >= 5 },
                            { count: 10, label: '10 Books', emoji: '🏆', achieved: totalBooks >= 10 },
                            { count: 25, label: 'Bookworm!', emoji: '🦋', achieved: totalBooks >= 25 },
                        ].map((milestone, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.milestoneItem,
                                    milestone.achieved && styles.milestoneAchieved,
                                ]}
                            >
                                <Text style={styles.milestoneEmoji}>
                                    {milestone.achieved ? milestone.emoji : '🔒'}
                                </Text>
                                <View style={styles.milestoneInfo}>
                                    <Text
                                        style={[
                                            styles.milestoneLabel,
                                            milestone.achieved && styles.milestoneLabelAchieved,
                                        ]}
                                    >
                                        {milestone.label}
                                    </Text>
                                    <Text style={styles.milestoneCount}>
                                        {milestone.count} book{milestone.count !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                                {milestone.achieved && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },

    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.huge,
    },
    // Stats
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        ...Shadows.card,
    },
    statEmoji: { fontSize: 28, marginBottom: Spacing.sm },
    statValue: {
        color: Colors.textWhite,
        fontSize: FontSizes.xxl,
        fontWeight: '800',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
        textTransform: 'uppercase',
    },
    // Progress bar
    progressSection: {
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginBottom: Spacing.lg,
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 6,
    },
    progressText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textAlign: 'center',
    },
    // History
    historySection: { marginBottom: Spacing.xxl },
    emptyHistory: { alignItems: 'center', paddingVertical: Spacing.xxxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
    emptyText: { color: Colors.textSecondary, fontSize: FontSizes.md, marginBottom: Spacing.lg },
    startButton: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxl,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    startButtonText: { color: Colors.primaryLight, fontSize: FontSizes.md, fontWeight: '600' },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    historyInfo: { flex: 1 },
    historyTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
    historyMeta: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
    },
    historyProgress: {
        color: Colors.primary,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
        fontWeight: '500',
    },
    historyArrow: { color: Colors.textSecondary, fontSize: FontSizes.lg },
    // Milestones
    milestonesSection: { marginBottom: Spacing.xxl },
    milestoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        opacity: 0.5,
    },
    milestoneAchieved: {
        opacity: 1,
        borderColor: Colors.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    milestoneEmoji: { fontSize: 28, marginRight: Spacing.lg },
    milestoneInfo: { flex: 1 },
    milestoneLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    milestoneLabelAchieved: { color: Colors.textPrimary },
    milestoneCount: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
    },
    checkmark: {
        color: Colors.success,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
});

export default ProgressScreen;
