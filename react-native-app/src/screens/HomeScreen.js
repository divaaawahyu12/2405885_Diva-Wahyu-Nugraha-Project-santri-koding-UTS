import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Api, { BASE_URL } from '../api';

export default function HomeScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await Api.get('/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.log('Error fetch transactions:', error);
      Alert.alert('Info Server', 'Gagal memuat data transaksi. Pastikan backend Express & database MySQL sudah aktif.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Hapus Transaksi',
      'Yakin ingin menghapus catatan transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await Api.delete(`/transactions/${id}`);
              if (res.data.success) {
                Alert.alert('Sukses', 'Transaksi berhasil dihapus');
                fetchTransactions();
              }
            } catch (err) {
              console.log('Error delete:', err);
              Alert.alert('Error', 'Gagal menghapus transaksi');
            }
          },
        },
      ]
    );
  };

  const formatRupiah = (number) => {
    return 'Rp ' + Number(number || 0).toLocaleString('id-ID');
  };

  const renderItem = ({ item }) => {
    const isIncome = item.type === 'income';
    const imageUrl = item.image ? `${BASE_URL}/uploads/${item.image}` : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCategory}>📁 {item.category || 'Umum'}</Text>
          </View>
          <Text style={[styles.amountText, isIncome ? styles.incomeText : styles.expenseText]}>
            {isIncome ? '+ ' : '- '}
            {formatRupiah(item.amount)}
          </Text>
        </View>

        {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}

        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.receiptImage} resizeMode="cover" />
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnEdit]}
            onPress={() => navigation.navigate('PostEditScreen', { id: item.id })}
          >
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnDelete]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.btnText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Financial Overview Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Saldo Saat Ini</Text>
        <Text style={styles.balanceValue}>{formatRupiah(summary.balance)}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.badgeIncome}>↓ Pemasukan</Text>
            <Text style={styles.summarySubValue}>{formatRupiah(summary.totalIncome)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.badgeExpense}>↑ Pengeluaran</Text>
            <Text style={styles.summarySubValue}>{formatRupiah(summary.totalExpense)}</Text>
          </View>
        </View>
      </View>

      {/* Button Catat Transaksi */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => navigation.navigate('PostCreateScreen')}
        >
          <Text style={styles.btnAddText}>+ Catat Pemasukan / Pengeluaran</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={{ marginTop: 10, color: '#64748b' }}>Memuat catatan keuangan...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f766e']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>💸</Text>
              <Text style={styles.emptyText}>Belum ada riwayat transaksi.</Text>
              <Text style={styles.emptySubText}>Mulai catat pengeluaran dan pemasukanmu sekarang!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  summaryCard: {
    backgroundColor: '#0f766e',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  summaryLabel: {
    color: '#ccfbf1',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    padding: 12,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeIncome: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeExpense: {
    color: '#fecaca',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summarySubValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  btnAdd: {
    backgroundColor: '#047857',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnAddText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  noteText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
  },
  receiptImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#f1f5f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnEdit: {
    backgroundColor: '#f59e0b',
  },
  btnDelete: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
});
