import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const SupportScreen = ({ navigation }) => (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
        <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.emoji}>🛟</Text>
                <Text style={styles.title}>Support</Text>
                <Text style={styles.description}>
                    Need help? We're here for you! Browse our FAQ below or get in touch with our support team.
                </Text>
                {[
                    { q: 'How do I upload a PDF?', a: 'Go to Dashboard → Upload PDF, then tap to select a file from your device.' },
                    { q: 'How does pronunciation practice work?', a: 'The app listens to you read, then compares your speech with the expected text using AI.' },
                    { q: 'Can I use offline books?', a: 'Yes! Upload your own PDF documents to practice reading offline.' },
                    { q: 'How is my progress tracked?', a: 'Every time you practice, your reading stats are recorded and visible on the Progress page.' },
                ].map((item, i) => (
                    <View key={i} style={styles.faqCard}>
                        <Text style={styles.question}>❓ {item.q}</Text>
                        <Text style={styles.answer}>{item.a}</Text>
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => Linking.openURL('mailto:support@readingassistant.com')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.contactButtonText}>📧 Email Support</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    header: { paddingHorizontal: Spacing.xl, paddingTop: 50, paddingBottom: Spacing.md },
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    content: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge, alignItems: 'center' },
    emoji: { fontSize: 56, marginBottom: Spacing.lg, marginTop: Spacing.xl },
    title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textWhite, marginBottom: Spacing.lg },
    description: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl, lineHeight: 24 },
    faqCard: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
    question: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
    answer: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },
    contactButton: { backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxxl, marginTop: Spacing.lg, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
    contactButtonText: { color: Colors.primaryLight, fontSize: FontSizes.md, fontWeight: '600' },
});

export default SupportScreen;
