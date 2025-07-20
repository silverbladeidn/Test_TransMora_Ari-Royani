const db = require('../config/db');

exports.getAllProduct = (req, res) => {
    db.query('SELECT * FROM produk', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Tambah user
exports.createProduct = async (req, res) => {
    const { nama, harga, jumlah_barang } = req.body;

    if (!nama || !harga || !jumlah_barang) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        db.query('INSERT INTO produk (nama, harga, jumlah_barang) VALUES (?, ?, ?)', [nama, harga, jumlah_barang], (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, nama, harga, jumlah_barang });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal Tambah Barang' });
    }
};

// Ubah product
exports.updateProduct = async (req, res) => {
    const { nama, harga, jumlah_barang } = req.body;
    const productId = req.params.id;

    try {
        db.query('SELECT * FROM produk WHERE id = ?', [productId], async (err, produk) => {
            if (err) return res.status(500).json({ error: err });
            if (produk.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });

            const oldProduct = produk[0];

            // Gunakan data lama jika tidak dikirim
            const newNama = nama !== undefined ? nama : oldProduct.nama;
            const newHarga = harga !== undefined ? harga : oldProduct.harga;
            const newJumlah = jumlah_barang !== undefined ? jumlah_barang : oldProduct.jumlah_barang;

            db.query('UPDATE produk SET nama = ?, harga = ?, jumlah_barang = ? WHERE id = ?', [newNama, newHarga, newJumlah, productId], (err, result) => {
                if (err) return res.status(500).json({ error: err });
                res.json({
                    id: parseInt(productId),
                    nama_user: newNama,
                    harga: newHarga,
                    jumlah_barang: newJumlah,
                    pesan: '✅ Produk berhasil diubah'
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal ubah Produk!!' });
    }
};

// Hapus user
exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        // Cek apakah product ada
        db.query('SELECT nama FROM produk WHERE id = ?', [productId], (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.length === 0) {
                return res.status(404).json({ error: 'Product tidak ditemukan' });
            }

            const namaProduk = result[0].nama;

            // Hapus product
            db.query('DELETE FROM produk WHERE id = ?', [productId], (err, deleteResult) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                    pesan: `✅ User "${namaProduk}" berhasil dihapus`
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal hapus user' });
    }
};

