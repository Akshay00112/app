// Shared design tokens for the mobile app
export const Colors = {
    // Primary palette
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',

    // Accent colors
    accent: '#a855f7',
    accentLight: '#c084fc',
    pink: '#ec4899',
    pinkLight: '#f472b6',
    amber: '#fbbf24',
    emerald: '#10b981',
    blue: '#3b82f6',
    blueLight: '#60a5fa',

    // Background
    bgDark: '#020617',
    bgCard: 'rgba(30, 41, 59, 0.6)',
    bgCardHover: 'rgba(30, 41, 59, 0.9)',
    bgInput: 'rgba(255, 255, 255, 0.05)',
    bgOverlay: 'rgba(0, 0, 0, 0.5)',

    // Border
    border: '#334155',
    borderLight: 'rgba(255, 255, 255, 0.2)',
    borderBlue: '#60a5fa',
    borderPurple: '#8b5cf6',
    borderPink: '#ec4899',

    // Text
    textPrimary: '#e5e7eb',
    textSecondary: '#a0aec0',
    textMuted: '#64748b',
    textWhite: '#ffffff',

    // Status
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Word feedback
    wordCorrect: '#10b981',
    wordMispronounced: '#ef4444',
    wordMissed: '#f59e0b',
    wordExtra: '#8b5cf6',
    wordArticleError: '#f97316',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    massive: 60,
};

export const FontSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    title: 36,
    hero: 48,
};

export const BorderRadius = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 20,
    round: 999,
};

export const Shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    button: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    glow: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 8,
    },
};
