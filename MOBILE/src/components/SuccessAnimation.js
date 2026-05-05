import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const SuccessAnimation = ({ show, type = 'sentence', message = 'Perfect!', onComplete }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (show) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                hide();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onComplete) onComplete();
        });
    };

    if (!show) return null;

    return (
        <Modal transparent animationType="none" visible={show}>
            <View style={styles.overlay}>
                {type === 'sentence' && (
                    <ConfettiCannon
                        count={200}
                        origin={{ x: -10, y: 0 }}
                        fadeOut
                        autoStart
                    />
                )}
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Text style={styles.emoji}>{type === 'sentence' ? '🌟' : '🎯'}</Text>
                    <Text style={styles.message}>{message}</Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: Colors.bgDark,
        padding: Spacing.huge,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
        ...Shadows.glow,
        width: '80%',
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    message: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: Colors.textWhite,
        textAlign: 'center',
    },
});

export default SuccessAnimation;
