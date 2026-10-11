const { body } = require('express-validator');

const validateTransaction = [
  body('title')
    .notEmpty()
    .withMessage('Judul transaksi tidak boleh kosong!')
    .isLength({ min: 2 })
    .withMessage('Judul transaksi minimal 2 karakter!'),
  body('amount')
    .notEmpty()
    .withMessage('Nominal uang tidak boleh kosong!')
    .isNumeric()
    .withMessage('Nominal uang harus berupa angka!'),
  body('type')
    .notEmpty()
    .withMessage('Tipe transaksi harus dipilih!')
    .isIn(['income', 'expense'])
    .withMessage('Tipe transaksi hanya boleh "income" (pemasukan) atau "expense" (pengeluaran)!'),
  body('category')
    .notEmpty()
    .withMessage('Kategori transaksi wajib diisi!')
];

module.exports = {
  validateTransaction
};
