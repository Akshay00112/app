import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '../styles/theme';

const BooksScreen = ({ navigation }) => {
    const { pdfHistory, deleteFromHistory, fetchHistory } = useAuth();
    const [onlineBooks, setOnlineBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('online'); // 'online' or 'uploaded'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOnlineBooks();
        fetchHistory();
    }, []);

    const loadOnlineBooks = async () => {
        try {
            const response = await api.get('/api/online-books');
            if (response.data.success) {
                setOnlineBooks(response.data.books || []);
            }
        } catch (error) {
            console.error('Failed to load online books:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = activeTab === 'online'
        ? onlineBooks.filter(
            (b) =>
                b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.author?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : pdfHistory.filter((h) =>
            h.pdf_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleBookPress = (book) => {
        if (activeTab === 'online') {
            navigation.navigate('Reader', {
                pdf: {
                    ...book,
                    isOnlineBook: true,
                },
            });
        } else {
            navigation.navigate('Reader', { pdf: book });
        }
    };

    const handleDelete = async (id) => {
        await deleteFromHistory(id);
    };

    const renderOnlineBook = ({ item }) => (
        <TouchableOpacity
            style={styles.bookCard}
            onPress={() => handleBookPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.bookIconContainer}>
                <Text style={styles.bookIcon}>📖</Text>
            </View>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author || 'Unknown Author'}</Text>
                {item.source && (
                    <Text style={styles.bookSource}>{item.source}</Text>
                )}
            </View>
            <Text style={styles.readArrow}>→</Text>
        </TouchableOpacity>
    );

    const renderUploadedBook = ({ item }) => (
        <TouchableOpacity
            style={styles.bookCard}
            onPress={() => handleBookPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.bookIconContainer}>
                <Text style={styles.bookIcon}>📄</Text>
            </View>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.pdf_name}</Text>
                <Text style={styles.bookAuthor}>
                    {item.total_sentences ? `${item.total_sentences} sentences` : ''}
                    {item.total_pages ? ` · ${item.total_pages} pages` : ''}
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
                activeOpacity={0.7}
            >
                <Text style={styles.deleteText}>🗑</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
            <LinearGradient colors={[Colors.bgDark, '#0f172a']} style={styles.gradient}>
                <Header
                    title="Library"
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'online' && styles.tabActive]}
                        onPress={() => setActiveTab('online')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'online' && styles.tabTextActive]}>
                            🌐 Online Books
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'uploaded' && styles.tabActive]}
                        onPress={() => setActiveTab('uploaded')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'uploaded' && styles.tabTextActive]}>
                            📂 My Uploads
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search books..."
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>

                {/* Book List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredBooks}
                        renderItem={activeTab === 'online' ? renderOnlineBook : renderUploadedBook}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📭</Text>
                                <Text style={styles.emptyText}>
                                    {activeTab === 'online'
                                        ? 'No online books available'
                                        : 'No uploaded PDFs yet'}
                                </Text>
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

    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tabActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: Colors.primary,
    },
    tabText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
    tabTextActive: { color: Colors.primaryLight },
    searchContainer: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    searchInput: {
        backgroundColor: Colors.bgInput,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.textWhite,
        fontSize: FontSizes.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    listContainer: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.huge,
    },
    bookCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bgCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.card,
    },
    bookIconContainer: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    bookIcon: { fontSize: 24 },
    bookInfo: { flex: 1 },
    bookTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    bookAuthor: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    bookSource: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
    },
    readArrow: { color: Colors.textSecondary, fontSize: FontSizes.xl },
    deleteButton: {
        padding: Spacing.sm,
    },
    deleteText: { fontSize: 18 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: Spacing.massive,
    },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.lg,
        textAlign: 'center',
    },
});

export default BooksScreen;
