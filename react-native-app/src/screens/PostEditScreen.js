import React, { useState, useEffect } from 'react';
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
import Api, { BASE_URL } from '../api';

export default function PostEditScreen({ route, navigation }) {
  const { id } = route.params;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Makan & Minum');
  const [note, setNote] = useState('');
  const [existingImage, setExistingImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const categories = [
    'Makan & Minum',
    'Gaji & Penghasilan',
    'Transportasi',
    'Belanja',
    'Tagihan & Utilitas',
    'Hiburan',
    'Lainnya'
  ];

  useEffect(() => {
    const getDetail = async () => {
      try {
        const response = await Api.get(`/transactions/${id}`);
        if (response.data.success) {
          const data = response.data.data;
          setTitle(data.title);
          setAmount(String(data.amount));
          setType(data.type);
          setCategory(data.category);
          setNote(data.note || '');
          setExistingImage(data.image);
        }
      } catch (error) {
        console.log('Error fetch transaction detail:', error);
        Alert.alert('Error', 'Gagal memuat detail transaksi');
        navigation.goBack();
      } finally {
        setLoadingFetch(false);
      }
    };

    getDetail();
  }, [id]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Dibutuhkan', 'Aplikasi butuh izin galeri untuk memilih foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewImage(result.assets[0]);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validasi Gagal', 'Keterangan transaksi dan nominal uang wajib diisi!');
      return;
    }

    setLoadingSubmit(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('amount', amount);
    formData.append('type', type);
    formData.append('category', category);
    formData.append('note', note);

    if (newImage) {
      const uri = newImage.uri;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('image', {
        uri: uri,
        name: `receipt_update_${Date.now()}.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      });
    }

    try {
      const response = await Api.put(`/transactions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('Sukses', 'Transaksi berhasil diperbarui!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.log('Error update transaction:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui transaksi.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={{ marginTop: 10, color: '#64748b' }}>Memuat data...</Text>
      </View>
    );
  }

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
        placeholder="Edit nama transaksi"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Nominal (Rp):</Text>
      <TextInput
        style={styles.input}
        placeholder="Nominal"
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

      <Text style={styles.label}>Catatan Tambahan:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Edit catatan..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Bukti Struk / Nota Foto:</Text>
      <TouchableOpacity style={styles.btnPicker} onPress={pickImage}>
        <Text style={styles.btnPickerText}>📷 Ganti Foto Bukti (Opsional)</Text>
      </TouchableOpacity>

      {newImage ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewSubtitle}>Foto Baru Dipilih:</Text>
          <Image source={{ uri: newImage.uri }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setNewImage(null)} style={styles.btnCancelImage}>
            <Text style={styles.btnCancelImageText}>Batal Ganti Foto</Text>
          </TouchableOpacity>
        </View>
      ) : existingImage ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewSubtitle}>Foto Bukti Tersimpan:</Text>
          <Image
            source={{ uri: `${BASE_URL}/uploads/${existingImage}` }}
            style={styles.previewImage}
          />
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.btnSubmit, loadingSubmit && { opacity: 0.7 }]}
        onPress={handleUpdate}
        disabled={loadingSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.btnSubmitText}>UPDATE TRANSAKSI</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
  previewSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
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
