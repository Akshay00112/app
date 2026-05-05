import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            if (response.data.success) {
                setSuccess('Password reset instructions have been sent to your email');
                setEmail('');
                setTimeout(() => {
                    navigation.goBack();
                }, 2000);
            } else {
                setError(response.data.error || 'Failed to process request');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient
                colors={[Colors.bgDark, '#0f172a', '#1e1b4b']}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>

                        <View style={styles.logoSection}>
                            <Text style={styles.logoIcon}>🔑</Text>
                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>
                                Enter your email to receive reset instructions
                            </Text>
                        </View>

                        <View style={styles.card}>
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>⚠️ {error}</Text>
                                </View>
                            ) : null}

                            {success ? (
                                <View style={styles.successContainer}>
                                    <Text style={styles.successText}>✅ {success}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputIcon}>📧</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="Enter your email"
                                        placeholderTextColor={Colors.textMuted}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={loading ? ['#555', '#666'] : [Colors.primary, Colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitGradient}
                                >
                                    {loading ? (
                                        <View style={styles.loadingRow}>
                                            <ActivityIndicator size="small" color={Colors.textWhite} />
                                            <Text style={styles.submitText}> Sending...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.submitText}>Send Reset Link</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    💡 Check your email for a password reset link. If you don't see it, check your spam folder.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.huge,
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: Spacing.md,
    },
    backText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    logoIcon: { fontSize: 48, marginBottom: Spacing.md },
    title: {
        fontSize: FontSizes.xxxl,
        fontWeight: '800',
        color: Colors.textWhite,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    errorText: { color: Colors.error, fontSize: FontSizes.sm },
    successContainer: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    successText: { color: '#22c55e', fontSize: FontSizes.sm },
    formGroup: { marginBottom: Spacing.xl },
    label: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgInput,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: { fontSize: 16, marginRight: Spacing.sm },
    input: {
        flex: 1,
        color: Colors.textWhite,
        fontSize: FontSizes.md,
        paddingVertical: Spacing.md,
    },
    submitButton: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        marginTop: Spacing.lg,
    },
    submitButtonDisabled: { opacity: 0.7 },
    submitGradient: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
    submitText: {
        color: Colors.textWhite,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoBox: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    infoText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        lineHeight: 20,
    },
});

export default ForgotPasswordScreen;
