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
