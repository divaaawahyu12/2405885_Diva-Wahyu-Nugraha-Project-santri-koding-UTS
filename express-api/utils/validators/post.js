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
