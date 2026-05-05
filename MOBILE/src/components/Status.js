import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const Status = ({ status, feedback }) => {
    if (!status && !feedback) return null;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.statusText}>{status}</Text>
                {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    card: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    statusText: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        textAlign: 'center',
        fontWeight: '500',
    },
    feedbackText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});

export default Status;
