# DIPDUT MONEY 💰 - Aplikasi Pencatatan Keuangan Fullstack

Aplikasi Mobile Pencatatan Keuangan Pribadi (Income & Expense Tracker) berbasis **Fullstack JavaScript** yang dibangun menggunakan **Express.js**, **Prisma ORM**, **MySQL**, dan **React Native (Expo)** dengan fitur CRUD lengkap dan upload bukti transaksi.

> **Project UTS Pemrograman Mobile**  
> **Nama:** Diva Wahyu Nugraha  
> **NIM:** 2405885  
> **Repository:** [GitHub Repository](https://github.com/divaaawahyu12/2405885_Diva-Wahyu-Nugraha-Project-santri-koding-UTS)

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terpasang:
1. **Node.js** (Versi 18 LTS ke atas) - [Unduh Node.js](https://nodejs.org/)
2. **Database MySQL** (XAMPP / Laragon / MySQL Workbench)
3. **Git** - [Unduh Git](https://git-scm.com/)
4. Salah satu dari perangkat pengujian frontend berikut:
   - **Aplikasi Expo Go** di Smartphone Android / iOS (Sangat Direkomendasikan, terhubung ke WiFi yang sama dengan laptop)
   - **Android Studio Emulator**

---

## 🚀 Panduan Menjalankan Project (Step-by-Step)

### 1. Clone Repository

Buka terminal (Git Bash, Command Prompt, atau PowerShell) lalu unduh project ini:

```bash
git clone https://github.com/divaaawahyu12/2405885_Diva-Wahyu-Nugraha-Project-santri-koding-UTS.git
cd 2405885_Diva-Wahyu-Nugraha-Project-santri-koding-UTS
```

---

### 2. Setup & Jalankan Backend (`express-api`)

#### A. Masuk ke Folder Backend & Install Dependencies
```bash
cd express-api
npm install
```

#### B. Siapkan Database MySQL & Environment
1. Buka **XAMPP / Laragon** dan jalankan service **Apache & MySQL**.
2. Buat database baru bernama: `db_santrikoding_crud` (melalui phpMyAdmin di `http://localhost/phpmyadmin`).
3. Buat file `.env` di dalam folder `express-api` (jika belum ada) dengan isi:
```env
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/db_santrikoding_crud?schema=public"
```
*(Sesuaikan username dan password MySQL jika Anda menggunakan password).*

#### C. Migrasi Database (Prisma ORM)
Jalankan perintah berikut untuk membuat tabel `transactions` otomatis ke MySQL:
```bash
npx prisma db push
```

#### D. Jalankan Server API
```bash
npm run dev
```
> Server Backend akan aktif di: `http://localhost:3000`  
> Biarkan terminal ini tetap terbuka dan berjalan.

---

### 3. Setup & Jalankan Mobile App (`react-native-app`)

Buka **jendela terminal baru**, lalu ikuti langkah berikut:

#### A. Masuk ke Folder Frontend & Install Dependencies
```bash
cd react-native-app
npm install
```

#### B. Konfigurasi Alamat IP Backend (Penting)
Buka file `src/api/index.js` di editor:
```javascript
// Sesuaikan BASE_URL dengan perangkat pengujian Anda:
// 1. Jika menggunakan Android Studio Emulator:
export const BASE_URL = 'http://10.0.2.2:3000';

// 2. Jika menggunakan HP Fisik (Expo Go):
// Ganti dengan IP Address WiFi laptop Anda (contoh: http://192.168.1.15:3000)
// export const BASE_URL = 'http://192.168.x.x:3000';
```

#### C. Jalankan Aplikasi Expo
```bash
npx expo start
```

#### D. Membuka Aplikasi:
- **Di Android Studio Emulator:**
  - Tekan tombol **`a`** di terminal saat Metro Bundler aktif.
- **Di Smartphone Fisik (Expo Go):**
  - Buka aplikasi **Expo Go** di HP Anda.
  - Scan **QR Code** yang tampil di terminal.

---

## 🌟 Fitur Utama Aplikasi

1. **Ringkasan Saldo Otomatis (Dashboard)**:
   - Menghitung Total Saldo (*Current Balance*), Total Pemasukan (*Income*), dan Total Pengeluaran (*Expense*).
2. **Pencatatan Keuangan Dinamis (Create)**:
   - Pilihan jenis transaksi: Pemasukan atau Pengeluaran.
   - Pilihan kategori: *Makan & Minum, Gaji, Transportasi, Belanja, Tagihan, Hiburan, dll*.
   - Upload & simpan foto bukti struk / bukti transfer via Galeri (`expo-image-picker` & `multer`).
3. **Pembaruan Data (Update)**:
   - Edit rincian transaksi beserta opsi penggantian foto bukti struk.
4. **Hapus Data & File Fisik (Delete)**:
   - Konfirmasi dialog hapus transaksi sekaligus membersihkan file gambar fisik dari server.
5. **Pull-to-Refresh**:
   - Memperbarui data real-time dengan gestur tarik ke bawah.

---

## 📁 Struktur Direktori

```text
├── express-api/                  # Backend RESTful API
│   ├── config/prisma.js          # Inisialisasi Prisma Client
│   ├── controllers/              # Logika CRUD & Kalkulasi Saldo
│   ├── middlewares/upload.js     # Penanganan Upload Struk (Multer)
│   ├── prisma/schema.prisma      # Skema Database Prisma (MySQL)
│   ├── public/uploads/           # Direktori Penyimpanan Foto Struk
│   ├── routes/index.js           # Endpoints Routing API
│   └── index.js                  # Entry Point Server Express
│
└── react-native-app/             # Frontend Mobile App (React Native Expo)
    ├── src/
    │   ├── api/index.js          # Konfigurasi Axios Client
    │   ├── routes/index.js       # Stack Navigation
    │   └── screens/
    │       ├── HomeScreen.js         # Layar Daftar Transaksi & Ringkasan Saldo
    │       ├── PostCreateScreen.js   # Form Tambah Pemasukan / Pengeluaran
    │       └── PostEditScreen.js     # Form Edit Transaksi
    ├── App.js                    # Entry Point Aplikasi
    └── app.json                  # Konfigurasi Expo
```

---

## 👨‍💻 Pengembang
- **Nama:** Diva Wahyu Nugraha
- **NIM:** 2405885
- **Mata Kuliah:** Pemrograman Mobile (Mopro)
