require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PORT, JWT_SECRET } = require('./config/config');
const userRoutes = require('./route/user.route');
const productRoutes = require('./route/produk.route');
const storingRoutes = require('./route/pemasukan.route');
const salesRoutes = require('./route/penjualan.route');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('ENV JWT_SECRET:', process.env.JWT_SECRET);

app.use('/user', userRoutes);
app.use('/produk', productRoutes);
app.use('/storing', storingRoutes);
app.use('/sales', salesRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend aktif di http://localhost:${PORT}`);
});
