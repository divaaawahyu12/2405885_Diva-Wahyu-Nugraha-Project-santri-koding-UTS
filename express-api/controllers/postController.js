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
