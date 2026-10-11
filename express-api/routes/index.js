const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');
const upload = require('../middlewares/upload');
const { validateTransaction } = require('../utils/validators/transaction');
const { handleValidationErrors } = require('../utils/validators/index');

// Endpoints Dipdut Money
router.get('/transactions', transactionController.getAllTransactions);
router.post(
  '/transactions',
  upload.single('image'),
  validateTransaction,
  handleValidationErrors,
  transactionController.createTransaction
);
router.get('/transactions/:id', transactionController.getTransactionById);
router.put(
  '/transactions/:id',
  upload.single('image'),
  validateTransaction,
  handleValidationErrors,
  transactionController.updateTransaction
);
router.delete('/transactions/:id', transactionController.deleteTransaction);

module.exports = router;
