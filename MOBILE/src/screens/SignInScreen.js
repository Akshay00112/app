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
import { useAuth } from '../context/AuthContext';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const SignInScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Navigation is handled by AppNavigator (auth state change)
            // Admin redirect happens in the main stack
        } else {
            setError(result.error);
        }

        setLoading(false);
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
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>

                        {/* Logo */}
                        <View style={styles.logoSection}>
                            <Text style={styles.logoIcon}>📚</Text>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to continue your reading journey</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.card}>
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>⚠️ {error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email</Text>
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
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputIcon}>🔒</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Enter your password"
                                        placeholderTextColor={Colors.textMuted}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                    >
                                        <Text style={styles.eyeIcon}>
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('ForgotPassword')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

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
                                            <Text style={styles.submitText}> Signing in...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.submitText}>Sign In</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.switchRow}>
                                <Text style={styles.switchText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                    <Text style={styles.switchLink}>Sign Up</Text>
                                </TouchableOpacity>
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
    eyeButton: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    eyeIcon: {
        fontSize: 18,
    },
    forgotPasswordText: {
        color: Colors.primaryLight,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    switchText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
    switchLink: {
        color: Colors.primaryLight,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
});

export default SignInScreen;
