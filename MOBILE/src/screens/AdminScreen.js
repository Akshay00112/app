import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, FlatList, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const AdminScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            if (response.data.success) {
                setUsers(response.data.users || []);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user?.email === 'admin@gmail.com';

    if (!isAdmin) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: Colors.error, fontSize: FontSizes.lg }}>Access Denied</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.xl }}>
                    <Text style={{ color: Colors.primaryLight }}>← Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{(item.name || 'U')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name || 'Unknown'}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>🛡 Admin</Text>
                    <View style={{ width: 50 }} />
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{users.length}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                </View>

                {/* Users list */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderUser}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', paddingTop: Spacing.huge }}>
                                <Text style={{ color: Colors.textSecondary, fontSize: FontSizes.lg }}>No users found</Text>
                            </View>
                        }
                    />
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    gradient: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingTop: 50, paddingBottom: Spacing.md,
    },
    backText: { color: Colors.textSecondary, fontSize: FontSizes.md },
    headerTitle: { color: Colors.textWhite, fontSize: FontSizes.xl, fontWeight: '700' },
    statsRow: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
    statCard: { backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
    statValue: { color: Colors.textWhite, fontSize: FontSizes.title, fontWeight: '800' },
    statLabel: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: Spacing.xs },
    listContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
    userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(99,102,241,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
    avatarText: { color: Colors.primaryLight, fontSize: FontSizes.lg, fontWeight: '700' },
    userInfo: { flex: 1 },
    userName: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
    userEmail: { color: Colors.textMuted, fontSize: FontSizes.sm, marginTop: 2 },
});

export default AdminScreen;
