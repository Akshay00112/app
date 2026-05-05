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

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setLoading(true);

        const result = await register(name, email, password);

        if (!result.success) {
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
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backText}>← Back</Text>
                        </TouchableOpacity>

                        <View style={styles.logoSection}>
                            <Text style={styles.logoIcon}>📚</Text>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Start your reading journey today</Text>
                        </View>

                        <View style={styles.card}>
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>⚠️ {error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputIcon}>👤</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Enter your name"
                                        placeholderTextColor={Colors.textMuted}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

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
                                        placeholder="Create a password"
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

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputIcon}>🔒</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Confirm your password"
                                        placeholderTextColor={Colors.textMuted}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeButton}
                                    >
                                        <Text style={styles.eyeIcon}>
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
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
                                            <Text style={styles.submitText}> Creating account...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.submitText}>Sign Up</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.switchRow}>
                                <Text style={styles.switchText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                    <Text style={styles.switchLink}>Sign In</Text>
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
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    logoSection: { alignItems: 'center', marginBottom: Spacing.xxxl },
    logoIcon: { fontSize: 48, marginBottom: Spacing.md },
    title: {
        fontSize: FontSizes.xxxl,
        fontWeight: '800',
        color: Colors.textWhite,
        marginBottom: Spacing.sm,
    },
    subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary },
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
    formGroup: { marginBottom: Spacing.lg },
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
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
    eyeButton: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    eyeIcon: {
        fontSize: 18,
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

export default SignUpScreen;
