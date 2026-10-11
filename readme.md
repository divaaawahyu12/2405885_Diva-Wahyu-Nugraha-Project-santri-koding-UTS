# Fullstack CRUD: Express.js, Prisma ORM, MySQL & React Native

Panduan komprehensif dan referensi kode lengkap untuk membangun aplikasi Fullstack CRUD (Create, Read, Update, Delete) dengan fitur upload gambar. Mengikuti standar materi kurikulum Santri Koding **"FullStack JavaScript Developer dengan Express dan React Native"**.

---

## DAFTAR ISI
1. [Arsitektur & Spesifikasi Project](#1-arsitektur--spesifikasi-project)
2. [Struktur Direktori](#2-struktur-direktori)
3. [Backend: Express.js, Prisma & MySQL (`express-api`)](#3-backend-expressjs-prisma--mysql-express-api)
   - [Setup & Inisialisasi](#31-setup--inisialisasi-backend)
   - [Konfigurasi Environment & Prisma Schema](#32-konfigurasi-environment--prisma-schema)
   - [Migration & Prisma Client Instance](#33-migration--prisma-client-instance)
   - [Middleware Upload Gambar (Multer)](#34-middleware-upload-gambar-multer)
   - [Middleware Validasi (Express Validator)](#35-middleware-validasi-express-validator)
   - [Controller CRUD Post](#36-controller-crud-post)
   - [Routing API & Entry Point Server](#37-routing-api--entry-point-server)
   - [Pengujian API (Endpoint Reference)](#38-pengujian-api-endpoint-reference)
4. [Frontend: React Native Expo (`react-native-app`)](#4-frontend-react-native-expo-react-native-app)
   - [Setup & Inisialisasi Expo Project](#41-setup--inisialisasi-expo-project)
   - [Konfigurasi API Client (Axios)](#42-konfigurasi-api-client-axios)
   - [Konfigurasi Routing (React Navigation)](#43-konfigurasi-routing-react-navigation)
   - [Screen: Home / Post List](#44-screen-home--post-list)
   - [Screen: Create Post](#45-screen-create-post)
   - [Screen: Edit Post](#46-screen-edit-post)
   - [Entry Point Aplikasi (`App.js`)](#47-entry-point-aplikasi-appjs)
5. [Menjalankan Project](#5-menjalankan-project)

---

## 1. Arsitektur & Spesifikasi Project

- **Backend (`express-api`)**:
  - Runtime: Node.js (v18+)
  - Framework: Express.js
  - ORM: Prisma ORM
  - Database: MySQL
  - Upload Handler: Multer (Static file serving)
  - Validation: Express Validator
- **Frontend (`react-native-app`)**:
  - Framework: React Native (Expo SDK)
  - Navigation: React Navigation (Native Stack)
  - HTTP Client: Axios
  - Image Picker: `expo-image-picker`

---

## 2. Struktur Direktori

```text
santri-koding-fullstack/
├── express-api/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   └── postController.js
│   ├── middlewares/
│   │   └── upload.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   │   └── uploads/
│   ├── routes/
│   │   └── index.js
│   └── utils/
│       └── validators/
│           ├── index.js
│           └── post.js
│
└── react-native-app/
    ├── App.js
    ├── app.json
    ├── package.json
    └── src/
        ├── api/
        │   └── index.js
        ├── routes/
        │   └── index.js
        └── screens/
            ├── HomeScreen.js
            ├── PostCreateScreen.js
            └── PostEditScreen.js
```

---

## 3. Backend: Express.js, Prisma & MySQL (`express-api`)

### 3.1 Setup & Inisialisasi Backend

Buka terminal dan jalankan instruksi berikut:

```bash
mkdir express-api
cd express-api
npm init -y

# Instalasi dependencies utama
npm install express cors body-parser dotenv multer express-validator @prisma/client

# Instalasi devDependencies
npm install -D nodemon prisma

# Inisialisasi Prisma
npx prisma init
```

Perbarui file `package.json` untuk menambahkan script runner:

```json
{
  "name": "express-api",
  "version": "1.0.0",
  "description": "Backend CRUD Santri Koding",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "@prisma/client": "^5.19.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.1.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "prisma": "^5.19.0"
  }
}
```

Buat direktori penyimpanan upload file publik:
```bash
mkdir -p public/uploads
```

---

### 3.2 Konfigurasi Environment & Prisma Schema

#### File: `.env`
Sesuaikan kredensial MySQL lokal Anda:
```env
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/db_santrikoding_crud?schema=public"
```

#### File: `prisma/schema.prisma`
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int      @id @default(autoincrement())
  image     String?  @db.VarChar(255)
  title     String   @db.VarChar(255)
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

---

### 3.3 Migration & Prisma Client Instance

Jalankan migrasi database ke MySQL:
```bash
npx prisma migrate dev --name init_posts_table
```

#### File: `config/prisma.js`
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

---

### 3.4 Middleware Upload Gambar (Multer)

#### File: `middlewares/upload.js`
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya JPEG, JPG, PNG, dan WEBP.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Maksimum 5MB
  }
});

module.exports = upload;
```

---

### 3.5 Middleware Validasi (Express Validator)

#### File: `utils/validators/post.js`
```javascript
const { body } = require('express-validator');

const validatePost = [
  body('title')
    .notEmpty()
    .withMessage('Judul post tidak boleh kosong!')
    .isLength({ min: 3 })
    .withMessage('Judul post minimal 3 karakter!'),
  body('content')
    .notEmpty()
    .withMessage('Konten post tidak boleh kosong!')
    .isLength({ min: 5 })
    .withMessage('Konten post minimal 5 karakter!')
];

module.exports = {
  validatePost
};
```

#### File: `utils/validators/index.js`
```javascript
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validasi form gagal!',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  handleValidationErrors
};
```

---

### 3.6 Controller CRUD Post

#### File: `controllers/postController.js`
```javascript
const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// 1. Get All Posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua data posts',
      data: posts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil data',
      error: error.message
    });
  }
};

// 2. Create Post
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Data post berhasil ditambahkan',
      data: post
    });
  } catch (error) {
    // Hapus file yang baru diupload jika database insert gagal
    if (req.file) {
      const filePath = path.join(__dirname, '../public/uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data post',
      error: error.message
    });
  }
};

// 3. Get Post By ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Data post dengan ID ${id} tidak ditemukan`,
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: `Detail data post dengan ID ${id}`,
      data: post
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data post',
      error: error.message
    });
  }
};

// 4. Update Post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existingPost) {
      if (req.file) {
        const tempPath = path.join(__dirname, '../public/uploads', req.file.filename);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }

      return res.status(404).json({
        success: false,
        message: `Data post dengan ID ${id} tidak ditemukan`,
        data: null
      });
    }

    let updatedImageData = existingPost.image;

    // Jika upload gambar baru, hapus gambar lama
    if (req.file) {
      updatedImageData = req.file.filename;

      if (existingPost.image) {
        const oldImagePath = path.join(__dirname, '../public/uploads', existingPost.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: Number(id)
      },
      data: {
        title,
        content,
        image: updatedImageData
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Data post berhasil diperbarui',
      data: updatedPost
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data post',
      error: error.message
    });
  }
};

// 5. Delete Post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: `Data post dengan ID ${id} tidak ditemukan`,
        data: null
      });
    }

    // Hapus file fisik gambar jika ada
    if (existingPost.image) {
      const filePath = path.join(__dirname, '../public/uploads', existingPost.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.post.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Data post dan file gambar berhasil dihapus',
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data post',
      error: error.message
    });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost
};
```

---

### 3.7 Routing API & Entry Point Server

#### File: `routes/index.js`
```javascript
const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const upload = require('../middlewares/upload');
const { validatePost } = require('../utils/validators/post');
const { handleValidationErrors } = require('../utils/validators/index');

router.get('/posts', postController.getAllPosts);
router.post('/posts', upload.single('image'), validatePost, handleValidationErrors, postController.createPost);
router.get('/posts/:id', postController.getPostById);
router.put('/posts/:id', upload.single('image'), validatePost, handleValidationErrors, postController.updatePost);
router.delete('/posts/:id', postController.deletePost);

module.exports = router;
```

#### File: `index.js`
```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Folder untuk Akses File Gambar Terunggah
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
const apiRoutes = require('./routes/index');
app.use('/api', apiRoutes);

// Root Endpoint Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Online',
    message: 'Backend Santri Koding API Running Successfully'
  });
});

app.listen(PORT, () => {
  console.log(`Server Express berjalan pada http://localhost:${PORT}`);
});
```

---

### 3.8 Pengujian API (Endpoint Reference)

| Method | Endpoint | Form Type | Deskripsi |
|---|---|---|---|
| `GET` | `/api/posts` | None | Mengambil semua daftar post |
| `POST` | `/api/posts` | `multipart/form-data` | Membuat post (`title`, `content`, `image`) |
| `GET` | `/api/posts/:id` | None | Mengambil detail post berdasarkan ID |
| `PUT` | `/api/posts/:id` | `multipart/form-data` | Memperbarui post (`title`, `content`, `image` opsional) |
| `DELETE`| `/api/posts/:id` | None | Menghapus post beserta file gambar fisiknya |

---

## 4. Frontend: React Native Expo (`react-native-app`)

### 4.1 Setup & Inisialisasi Expo Project

Jalankan perintah berikut di folder root:

```bash
# Inisialisasi project Expo
npx create-expo-app react-native-app --template blank
cd react-native-app

# Instalasi dependencies React Navigation & UI Support
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# Instalasi Axios & Image Picker
npm install axios expo-image-picker
```

---

### 4.2 Konfigurasi API Client (Axios)

> **PENTING UNTUK ANDROID / EMULATOR / REAL DEVICE:**
> - Android Emulator: Gunakan `http://10.0.2.2:3000`
> - iOS Simulator: Gunakan `http://localhost:3000`
> - Real Device (Expo Go HP): Gunakan IP lokal WiFi laptop (contoh: `http://192.168.1.10:3000`)

#### File: `src/api/index.js`
```javascript
import axios from 'axios';

// Ganti IP berikut sesuai dengan IP jaringan lokal Anda
export const BASE_URL = 'http://10.0.2.2:3000';

const Api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

export default Api;
```

---

### 4.3 Konfigurasi Routing (React Navigation)

#### File: `src/routes/index.js`
```javascript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PostCreateScreen from '../screens/PostCreateScreen';
import PostEditScreen from '../screens/PostEditScreen';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0284c7',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Santri Koding Posts' }}
      />
      <Stack.Screen
        name="PostCreateScreen"
        component={PostCreateScreen}
        options={{ title: 'Tambah Post Baru' }}
      />
      <Stack.Screen
        name="PostEditScreen"
        component={PostEditScreen}
        options={{ title: 'Edit Data Post' }}
      />
    </Stack.Navigator>
  );
}
```

---

### 4.4 Screen: Home / Post List

#### File: `src/screens/HomeScreen.js`
```javascript
import React, { useState, useEffect, useCallback } from 'react';
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await Api.get('/posts');
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.log('Error fetch data:', error);
      Alert.alert('Error', 'Gagal memuat data dari server!');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleDeletePost = (id) => {
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus data post ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await Api.delete(`/posts/${id}`);
              if (res.data.success) {
                Alert.alert('Sukses', 'Data post berhasil dihapus!');
                fetchPosts();
              }
            } catch (err) {
              console.log('Error delete:', err);
              Alert.alert('Error', 'Gagal menghapus data post');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.image
      ? `${BASE_URL}/uploads/${item.image}`
      : 'https://via.placeholder.com/150';

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.content}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnEdit]}
              onPress={() => navigation.navigate('PostEditScreen', { id: item.id })}
            >
              <Text style={styles.btnText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnDelete]}
              onPress={() => handleDeletePost(item.id)}
            >
              <Text style={styles.btnText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerArea}>
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => navigation.navigate('PostCreateScreen')}
        >
          <Text style={styles.btnAddText}>+ TAMBAH POST BARU</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={{ marginTop: 10, color: '#64748b' }}>Memuat data post...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Belum ada data post.</Text>
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
    backgroundColor: '#f1f5f9',
  },
  headerArea: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  btnAdd: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAddText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e2e8f0',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnEdit: {
    backgroundColor: '#eab308',
  },
  btnDelete: {
    backgroundColor: '#
