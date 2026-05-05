import React from 'react';
import { View, Text, StyleSheet, Tooltip } from 'react-native';
import { Colors, FontSizes, Spacing, BorderRadius } from '../styles/theme';

const WordSuccessBadge = ({ word, status, correct_word, spoken }) => {
    const getWordColor = () => {
        switch (status) {
            case 'correct': return Colors.wordCorrect;
            case 'mispronounced': return Colors.wordMispronounced;
            case 'missed': return Colors.wordMissed;
            case 'extra': return '#FFA500'; // Orange for extra words
            case 'article-error': return Colors.wordArticleError;
            default: return Colors.textPrimary;
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'correct': return '✓';
            case 'mispronounced': return '✗';
            case 'missed': return '⊘';
            case 'extra': return '➕';
            default: return '!';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'mispronounced':
                return `You said "${spoken}" → Say "${correct_word}"`;
            case 'missed':
                return `You missed this word. Say "${correct_word}"`;
            case 'article-error':
                return `Say "${correct_word}" instead`;
            case 'extra':
                return `Additional word not in the sentence - Remove this`;
            default:
                return '';
        }
    };

    const statusText = getStatusText();

    return (
        <View style={styles.container}>
            <View style={[styles.badge, { borderBottomColor: getWordColor() }]}>
                <Text style={[styles.text, { color: getWordColor() }]}>{word}</Text>
                {status !== 'correct' && (
                    <Text style={[styles.status, { color: getWordColor() }]}>{getStatusIcon()}</Text>
                )}
            </View>
            {statusText && (
                <Text style={[styles.hint, { color: getWordColor() }]}>{statusText}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderBottomWidth: 3,
        borderRadius: BorderRadius.sm,
    },
    text: {
        fontSize: FontSizes.xl,
        fontWeight: '600',
    },
    status: {
        fontSize: FontSizes.xs,
        textAlign: 'center',
        marginTop: 2,
    },
    hint: {
        fontSize: FontSizes.sm,
        marginTop: Spacing.xs,
        fontStyle: 'italic',
        maxWidth: 200,
    },
});

export default WordSuccessBadge;
