import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const DashboardScreen = ({ navigation }) => {
    const { logout, user, pdfHistory } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const cards = [
        {
            icon: '🌐',
            title: 'Online Library',
            description: 'Explore our collection of curated books and stories to practice reading',
            screen: 'Books',
            borderColor: Colors.borderBlue,
            shadowColor: '#3b82f6',
        },
        {
            icon: '📂',
            title: 'Upload PDF',
            description: 'Select from your previously uploaded documents and practice reading',
            screen: 'Reader',
            borderColor: Colors.borderPurple,
            shadowColor: '#8b5cf6',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient
                colors={[Colors.bgDark, '#0f172a', '#1e1b4b']}
                style={styles.gradient}
            >
                {/* Top Bar & Header Title */}
                <View style={styles.topBarContainer}>
                    <View style={styles.topBarRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>
                        <View style={styles.userSection}>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.headerBelowLogout}>
                        <Text style={styles.headerTitle}>📚 Reading Assistant</Text>
                    </View>
                </View>

                {/* Main Content - Now Scrollable */}
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerSection}>
                        <Text style={styles.headerSubtitle}>Welcome back! What would you like to do?</Text>
                    </View>
    
                    {/* Continue Reading Section */}
                    {pdfHistory && pdfHistory.length > 0 && (
                        <View style={styles.recentSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Continue Reading</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.recentList}>
                                {pdfHistory.slice(0, 2).map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id || index}
                                        style={styles.recentCard}
                                        onPress={() => navigation.navigate('Reader', { pdf: item })}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                            style={styles.recentCardGradient}
                                        >
                                            <View style={styles.recentIcon}>
                                                <Text style={{ fontSize: 20 }}>{item.isOnlineBook ? '🌐' : '📄'}</Text>
                                            </View>
                                            <View style={styles.recentInfo}>
                                                <Text style={styles.recentTitle} numberOfLines={1}>
                                                    {item.pdf_name || item.title || 'Untitled'}
                                                </Text>
                                                <View style={styles.progressBarBg}>
                                                    <View 
                                                        style={[
                                                            styles.progressBarFill, 
                                                            { width: `${Math.round(((item.current_sentence || 0) / (item.total_sentences || 1)) * 100)}%` }
                                                        ]} 
                                                    />
                                                </View>
                                                <Text style={styles.recentMeta}>
                                                    {Math.round(((item.current_sentence || 0) / (item.total_sentences || 1)) * 100)}% complete
                                                </Text>
                                            </View>
                                            <Text style={styles.recentArrow}>→</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
    
                    {/* Feature Cards */}
                    <View style={styles.cardsContainer}>
                        {cards.map((card, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.cardWrapper}
                                onPress={() => navigation.navigate(card.screen)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
                                    style={styles.card}
                                >
                                    <View style={styles.cardIconContainer}>
                                        <Text style={styles.cardIcon}>{card.icon}</Text>
                                    </View>
                                    <View style={styles.cardTextContent}>
                                        <Text style={styles.cardTitle}>{card.title}</Text>
                                        <Text style={styles.cardDescription}>{card.description}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
    
                    {/* Progress Card */}
                    <TouchableOpacity
                        style={styles.progressCardWrapper}
                        onPress={() => navigation.navigate('Progress')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.primary + '20', Colors.accent + '10']}
                            style={styles.progressCard}
                        >
                            <View style={styles.progressIconContainer}>
                                <Text style={styles.progressIcon}>📊</Text>
                            </View>
                            <View style={styles.progressTextContainer}>
                                <Text style={styles.progressTitle}>Track Progress</Text>
                                <Text style={styles.progressDescription}>
                                    View detailed statistics and monitor your improvement journey
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    topBarContainer: {
        paddingTop: 50,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.xl,
    },
    topBarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerBelowLogout: {
        alignItems: 'flex-end',
        marginTop: Spacing.sm,
    },
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    userSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    userName: { color: Colors.textPrimary, fontWeight: '500', fontSize: FontSizes.md },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.sm,
    },
    logoutText: { color: Colors.textWhite, fontSize: FontSizes.sm },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.huge,
    },
    headerSection: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.sm },
    headerTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: Colors.textWhite,
        letterSpacing: 0.5,
    },
    headerSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center' },
    cardsContainer: { gap: Spacing.lg, marginBottom: Spacing.xl },
    cardWrapper: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...Shadows.card,
    },
    card: {
        flexDirection: 'row',
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.lg,
    },
    cardIconContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardIcon: { fontSize: 32 },
    cardTextContent: { flex: 1 },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    progressCardWrapper: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(129, 140, 248, 0.2)', // Indigo border
        ...Shadows.glow,
    },
    progressCard: {
        padding: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xl,
    },
    progressIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressIcon: { fontSize: 24 },
    progressTextContainer: { flex: 1 },
    progressTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    progressDescription: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
    recentSection: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    viewAllText: {
        fontSize: FontSizes.sm,
        color: Colors.primaryLight,
        fontWeight: '600',
    },
    recentList: {
        gap: Spacing.md,
    },
    recentCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    recentCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    recentIcon: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginBottom: 4,
        width: '80%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    recentMeta: {
        color: Colors.textMuted,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    recentArrow: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: FontSizes.lg,
        marginLeft: Spacing.sm,
    },

});

export default DashboardScreen;
