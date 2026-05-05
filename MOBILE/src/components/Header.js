import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const Header = ({ title, showBack = false, onBack }) => {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            {showBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            ) : (
                <View style={{ width: 60 }} />
            )}

            <Text style={styles.title}>{title}</Text>

            <View style={styles.userIcon}>
                <Text style={styles.userInitial}>
                    {user ? (user.name || 'U')[0].toUpperCase() : 'U'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingTop: 50,
        paddingBottom: Spacing.md,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 60,
    },
    backText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
    title: {
        color: Colors.textWhite,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        textAlign: 'center',
        flex: 1,
    },
    userIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    userInitial: {
        color: Colors.primaryLight,
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
});

export default Header;
