import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient
                colors={[Colors.bgDark, '#0f172a', '#1e1b4b']}
                style={styles.gradient}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <Text style={styles.heroEmoji}>📚</Text>
                        <Text style={styles.heroTitle}>Reading Assistant</Text>
                        <Text style={styles.heroSubtitle}>
                            AI-powered reading companion for children with dyslexia
                        </Text>
                        <Text style={styles.heroDescription}>
                            Practice pronunciation, track progress, and improve reading skills with
                            real-time AI feedback
                        </Text>
                    </View>

                    {/* CTA Buttons */}
                    <View style={styles.ctaContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('SignUp')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.accent]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.primaryButtonText}>Get Started Free</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('SignIn')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Features</Text>
                        <View style={styles.featureGrid}>
                            {[
                                { icon: '🎤', title: 'Voice Practice', desc: 'Practice pronunciation with real-time AI feedback' },
                                { icon: '📊', title: 'Track Progress', desc: 'Monitor reading improvement over time' },
                                { icon: '📖', title: 'Online Library', desc: 'Access curated books perfect for practice' },
                                { icon: '📱', title: 'PDF Upload', desc: 'Upload your own documents to practice reading' },
                            ].map((feature, index) => (
                                <View key={index} style={styles.featureCard}>
                                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footerLinks}>
                        {[
                            { label: 'About', screen: 'About' },
                            { label: 'Support', screen: 'Support' },
                            { label: 'Contact', screen: 'Contact' },
                            { label: 'Pricing', screen: 'Pricing' },
                        ].map((link, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate(link.screen)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.footerLink}>{link.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgDark,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: Spacing.xxxl,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: Spacing.huge,
    },
    heroEmoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    heroTitle: {
        fontSize: FontSizes.hero,
        fontWeight: '800',
        color: Colors.textWhite,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    heroSubtitle: {
        fontSize: FontSizes.xl,
        color: Colors.primaryLight,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        fontWeight: '600',
    },
    heroDescription: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: Spacing.lg,
    },
    ctaContainer: {
        gap: Spacing.lg,
        marginBottom: Spacing.massive,
        paddingHorizontal: Spacing.lg,
    },
    primaryButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.button,
    },
    buttonGradient: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxxl,
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
    },
    primaryButtonText: {
        color: Colors.textWhite,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxxl,
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    secondaryButtonText: {
        color: Colors.textWhite,
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    featuresSection: {
        marginBottom: Spacing.huge,
    },
    sectionTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.textWhite,
        textAlign: 'center',
        marginBottom: Spacing.xxl,
    },
    featureGrid: {
        gap: Spacing.lg,
    },
    featureCard: {
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        ...Shadows.card,
    },
    featureIcon: {
        fontSize: 40,
        marginBottom: Spacing.md,
    },
    featureTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    featureDesc: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: Spacing.xl,
        paddingTop: Spacing.xxl,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    footerLink: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
});

export default LandingScreen;
