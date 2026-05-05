import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const PricingScreen = ({ navigation }) => {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: ['Upload PDFs', 'Basic pronunciation feedback', 'Progress tracking', '5 online books'],
            highlight: false,
            emoji: '🆓',
        },
        {
            name: 'Pro',
            price: '$9.99',
            period: '/month',
            features: ['Unlimited PDFs', 'Advanced AI feedback', 'Full book library', 'Detailed analytics', 'Priority support'],
            highlight: true,
            emoji: '⭐',
        },
        {
            name: 'Family',
            price: '$14.99',
            period: '/month',
            features: ['Up to 5 users', 'All Pro features', 'Parent dashboard', 'Teacher reports', 'Custom word lists'],
            highlight: false,
            emoji: '👨‍👩‍👧‍👦',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Choose Your Plan</Text>
                    <Text style={styles.subtitle}>Start free and upgrade anytime</Text>
                    {plans.map((plan, index) => (
                        <View key={index} style={[styles.planCard, plan.highlight && styles.planHighlighted]}>
                            {plan.highlight && <View style={styles.popularBadge}><Text style={styles.popularText}>POPULAR</Text></View>}
                            <Text style={styles.planEmoji}>{plan.emoji}</Text>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.planPrice}>{plan.price}</Text>
                                <Text style={styles.planPeriod}>{plan.period}</Text>
                            </View>
                            {plan.features.map((feature, fi) => (
                                <Text key={fi} style={styles.featureText}>✓ {feature}</Text>
                            ))}
                            <TouchableOpacity style={[styles.planButton, plan.highlight && styles.planButtonHighlighted]} activeOpacity={0.8}>
                                <Text style={[styles.planButtonText, plan.highlight && styles.planButtonTextHighlighted]}>
                                    {plan.price === '$0' ? 'Get Started' : 'Subscribe'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    header: { paddingHorizontal: Spacing.xl, paddingTop: 50, paddingBottom: Spacing.md },
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    content: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge, alignItems: 'center' },
    title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textWhite, marginBottom: Spacing.sm, marginTop: Spacing.lg },
    subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xxl },
    planCard: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, alignItems: 'center', ...Shadows.card },
    planHighlighted: { borderColor: Colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
    popularBadge: { position: 'absolute', top: -10, backgroundColor: Colors.primary, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
    popularText: { color: Colors.textWhite, fontSize: FontSizes.xs, fontWeight: '800' },
    planEmoji: { fontSize: 40, marginBottom: Spacing.md },
    planName: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textWhite, marginBottom: Spacing.sm },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.lg },
    planPrice: { fontSize: FontSizes.title, fontWeight: '800', color: Colors.textWhite },
    planPeriod: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: Spacing.xs },
    featureText: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, alignSelf: 'flex-start' },
    planButton: { marginTop: Spacing.lg, width: '100%', paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.border },
    planButtonHighlighted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    planButtonText: { color: Colors.textSecondary, fontSize: FontSizes.md, fontWeight: '700' },
    planButtonTextHighlighted: { color: Colors.textWhite },
});

export default PricingScreen;
