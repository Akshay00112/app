import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const ContactScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!name || !email || !message) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }
        Alert.alert('Message Sent!', 'Thank you for reaching out. We\'ll get back to you soon!');
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a', '#1e1b4b']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text style={styles.emoji}>💬</Text>
                        <Text style={styles.title}>Contact Us</Text>
                        <Text style={styles.description}>Have a question or feedback? We'd love to hear from you!</Text>
                        <View style={styles.card}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Name</Text>
                                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.textMuted} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Your email" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Message</Text>
                                <TextInput style={[styles.input, styles.textArea]} value={message} onChangeText={setMessage} placeholder="Your message" placeholderTextColor={Colors.textMuted} multiline numberOfLines={4} textAlignVertical="top" />
                            </View>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
                                <LinearGradient colors={[Colors.primary, Colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                                    <Text style={styles.submitText}>Send Message</Text>
                                </LinearGradient>
                            </TouchableOpacity>
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
    header: { paddingHorizontal: Spacing.xl, paddingTop: 50, paddingBottom: Spacing.md },
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    content: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge, alignItems: 'center' },
    emoji: { fontSize: 56, marginBottom: Spacing.lg, marginTop: Spacing.xl },
    title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textWhite, marginBottom: Spacing.lg },
    description: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl, lineHeight: 24 },
    card: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border },
    formGroup: { marginBottom: Spacing.lg },
    label: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.sm },
    input: { backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, padding: Spacing.md, color: Colors.textWhite, fontSize: FontSizes.md, borderWidth: 1, borderColor: Colors.border },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitButton: { borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.md },
    submitGradient: { paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: BorderRadius.md },
    submitText: { color: Colors.textWhite, fontSize: FontSizes.lg, fontWeight: '700' },
});

export default ContactScreen;
