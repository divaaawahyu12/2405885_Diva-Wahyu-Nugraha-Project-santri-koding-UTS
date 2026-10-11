const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// 1. Get All Transactions + Summary (Total Income, Expense, Balance)
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar transaksi keuangan',
      summary: {
        balance,
        totalIncome,
        totalExpense
      },
      data: transactions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi keuangan',
      error: error.message
    });
  }
};

// 2. Create Transaction
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, note } = req.body;
    const image = req.file ? req.file.filename : null;

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        note: note || '',
        image
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dicatat',
      data: transaction
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../public/uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan transaksi',
      error: error.message
    });
  }
};

// 3. Get Transaction By ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaksi dengan ID ${id} tidak ditemukan`,
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: `Detail transaksi ID ${id}`,
      data: transaction
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail transaksi',
      error: error.message
    });
  }
};

// 4. Update Transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category, note } = req.body;

    const existing = await prisma.transaction.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existing) {
      if (req.file) {
        const tempPath = path.join(__dirname, '../public/uploads', req.file.filename);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }

      return res.status(404).json({
        success: false,
        message: `Transaksi dengan ID ${id} tidak ditemukan`,
        data: null
      });
    }

    let updatedImageData = existing.image;

    if (req.file) {
      updatedImageData = req.file.filename;

      if (existing.image) {
        const oldImagePath = path.join(__dirname, '../public/uploads', existing.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updated = await prisma.transaction.update({
      where: {
        id: Number(id)
      },
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        note: note || '',
        image: updatedImageData
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Transaksi berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui transaksi',
      error: error.message
    });
  }
};

// 5. Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Transaksi dengan ID ${id} tidak ditemukan`,
        data: null
      });
    }

    if (existing.image) {
      const filePath = path.join(__dirname, '../public/uploads', existing.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.transaction.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Transaksi dan bukti struk berhasil dihapus',
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus transaksi',
      error: error.message
    });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
