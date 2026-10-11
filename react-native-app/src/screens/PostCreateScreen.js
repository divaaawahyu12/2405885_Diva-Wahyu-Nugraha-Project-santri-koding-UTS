import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Api from '../api';

export default function PostCreateScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' atau 'expense'
  const [category, setCategory] = useState('Makan & Minum');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Makan & Minum',
    'Gaji & Penghasilan',
    'Transportasi',
    'Belanja',
    'Tagihan & Utilitas',
    'Hiburan',
    'Lainnya'
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Dibutuhkan', 'Aplikasi butuh akses galeri untuk mengunggah struk/bukti.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validasi Gagal', 'Keterangan transaksi dan nominal uang wajib diisi!');
      return;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Validasi Gagal', 'Nominal harus berupa angka valid lebih dari 0!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('amount', amount);
    formData.append('type', type);
    formData.append('category', category);
    formData.append('note', note);

    if (image) {
      const uri = image.uri;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('image', {
        uri: uri,
        name: `receipt_${Date.now()}.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      });
    }

    try {
      const response = await Api.post('/transactions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Sukses', 'Transaksi berhasil dicatat ke Dipdut Money!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.log('Error save transaction:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Pilihan Jenis Transaksi */}
      <Text style={styles.label}>Jenis Transaksi:</Text>
      <View style={styles.typeSelectorRow}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonExpenseActive]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeButtonText, type === 'expense' && styles.typeTextActive]}>
            💸 Pengeluaran
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonIncomeActive]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeButtonText, type === 'income' && styles.typeTextActive]}>
            💰 Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nama Transaksi / Judul:</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: Makan Siang, Gajian, Bensin"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Nominal (Rp):</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: 50000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Kategori:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Catatan Tambahan (Opsional):</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tuliskan keterangan detail jika ada..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Bukti Struk / Nota Transfer (Opsional):</Text>
      <TouchableOpacity style={styles.btnPicker} onPress={pickImage}>
        <Text style={styles.btnPickerText}>📷 Upload Foto Struk / Nota</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setImage(null)} style={styles.btnCancelImage}>
            <Text style={styles.btnCancelImageText}>Hapus Foto</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btnSubmit, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.btnSubmitText}>SIMPAN TRANSAKSI</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  typeButtonExpenseActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  typeButtonIncomeActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  typeButtonText: {
    fontWeight: 'bold',
    color: '#64748b',
    fontSize: 14,
  },
  typeTextActive: {
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  btnPicker: {
    backgroundColor: '#64748b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPickerText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  btnCancelImage: {
    marginTop: 6,
    padding: 4,
  },
  btnCancelImageText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnSubmit: {
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  btnSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
