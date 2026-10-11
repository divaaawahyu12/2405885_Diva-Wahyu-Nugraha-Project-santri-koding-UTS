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
