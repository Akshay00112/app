import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const AboutScreen = ({ navigation }) => (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
        <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.emoji}>📚</Text>
                <Text style={styles.title}>About Reading Assistant</Text>
                <Text style={styles.description}>
                    Reading Assistant is an AI-powered tool designed to help children with dyslexia
                    improve their reading skills through interactive pronunciation practice and
                    real-time feedback.
                </Text>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Our Mission</Text>
                    <Text style={styles.cardText}>
                        We believe every child deserves the opportunity to read confidently. Our app
                        uses advanced speech recognition and AI to provide personalized feedback that
                        helps children practice at their own pace.
                    </Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Features</Text>
                    {['AI-powered pronunciation feedback', 'Online book library', 'PDF upload support', 'Progress tracking & milestones', 'Child-friendly voice feedback'].map((f, i) => (
                        <Text key={i} style={styles.featureItem}>✦ {f}</Text>
                    ))}
                </View>
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
    title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textWhite, marginBottom: Spacing.lg, textAlign: 'center' },
    description: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xxl },
    card: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
    cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
    cardText: { fontSize: FontSizes.md, color: Colors.textSecondary, lineHeight: 22 },
    featureItem: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 22 },
});

export default AboutScreen;
