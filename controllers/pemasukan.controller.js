const db = require('../config/db');

/**
 * Mendapatkan semua atau satu data pemasukan
 */
exports.getAllStoring = (req, res) => {
    const { search, dateminim, datemaxim } = req.query;
    let query = `
        SELECT 
            pb.id, 
            pb.produk_id, 
            pr.nama AS nama_produk, 
            pb.jumlah, 
            DATE_FORMAT(pb.tanggal, '%Y-%m-%d') AS tanggal, 
            pb.keterangan
        FROM pemasukan_barang pb
        JOIN produk pr ON pb.produk_id = pr.id
        WHERE 1=1
    `;

    let params = [];

    if (search) {
        query += ' AND pr.nama LIKE ?';
        params.push(`%${search}%`);
    }

    if (dateminim) {
        query += ' AND pb.tanggal >= ?';
        params.push(dateminim);
    }

    if (datemaxim) {
        query += ' AND pb.tanggal <= ?';
        params.push(datemaxim);
    }

    query += ' ORDER BY pb.id ASC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                error: 'Gagal mengambil data pemasukan',
                details: err.message
            });
        }
        res.json(results);
    });
};

/**
 * Menambah data pemasukan
 */
exports.createStoring = async (req, res) => {
    const { produk_id, jumlah, keterangan } = req.body;
    const tanggal = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD

    // Validate input
    if (!produk_id || !jumlah) {
        return res.status(400).json({ error: 'Produk ID dan jumlah harus diisi' });
    }

    if (jumlah <= 0) {
        return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
    }

    try {
        // Check if product exists
        db.query('SELECT * FROM produk WHERE id = ?', [produk_id], (err, produkResult) => {
            if (err) return res.status(500).json({ error: err.message });
            if (produkResult.length === 0) {
                return res.status(400).json({ error: 'Produk tidak ditemukan.' });
            }

            const nama_produk = produkResult[0]?.nama || '';

            // Insert into pemasukan_barang
            db.query(
                'INSERT INTO pemasukan_barang (produk_id, jumlah, keterangan, tanggal) VALUES (?, ?, ?, ?)',
                [produk_id, jumlah, keterangan, tanggal],
                (errInsert, insertResult) => {
                    if (errInsert) return res.status(500).json({ error: errInsert.message });

                    // Update product stock
                    db.query(
                        'UPDATE produk SET jumlah_barang = COALESCE(jumlah_barang, 0) + ? WHERE id = ?',
                        [jumlah, produk_id],
                        (errUpdate) => {
                            if (errUpdate) return res.status(500).json({ error: errUpdate.message });

                            res.status(201).json({
                                pesan: '✅ Pemasukan barang berhasil disimpan & stok diperbarui.',
                                pemasukan: {
                                    id: insertResult.insertId,
                                    produk_id,
                                    nama_produk,
                                    jumlah,
                                    keterangan,
                                    tanggal,
                                }
                            });
                        }
                    );
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal Tambah Storing: ' + err.message });
    }
};

/**
 * Mengubah data pemasukan
 */
exports.updateStoring = async (req, res) => {
    const { produk_id, jumlah, keterangan } = req.body;
    const storingId = req.params.id;

    // Validate input if provided
    if (jumlah !== undefined && jumlah <= 0) {
        return res.status(400).json({ error: 'Jumlah harus lebih dari 0' });
    }

    try {
        db.query('SELECT * FROM pemasukan_barang WHERE id = ?', [storingId], async (err, storing) => {
            if (err) return res.status(500).json({ error: err.message });
            if (storing.length === 0) return res.status(404).json({ error: 'Pemasukan tidak ditemukan' });

            const oldStoring = storing[0];

            // Use old data if not provided
            const newProdukId = produk_id !== undefined ? produk_id : oldStoring.produk_id;
            const newJumlah = jumlah !== undefined ? jumlah : oldStoring.jumlah;
            const newKeterangan = keterangan !== undefined ? keterangan : oldStoring.keterangan;

            // Check if product exists if product_id is changed
            if (produk_id !== undefined && produk_id !== oldStoring.produk_id) {
                db.query('SELECT * FROM produk WHERE id = ?', [produk_id], (errProduk, produkResult) => {
                    if (errProduk) return res.status(500).json({ error: errProduk.message });
                    if (produkResult.length === 0) {
                        return res.status(400).json({ error: 'Produk tidak ditemukan.' });
                    }
                });
            }

            // Calculate difference for stock update
            const selisihJumlah = newJumlah - oldStoring.jumlah;

            // Check if the update would result in negative stock
            if (selisihJumlah < 0) {
                db.query('SELECT jumlah_barang FROM produk WHERE id = ?', [newProdukId], (errStock, stockResult) => {
                    if (errStock) return res.status(500).json({ error: errStock.message });

                    const currentStock = stockResult[0]?.jumlah_barang || 0;
                    if (currentStock + selisihJumlah < 0) {
                        return res.status(400).json({
                            error: 'Stok tidak mencukupi. Stok saat ini: ' + currentStock
                        });
                    }

                    // Continue with update if stock is sufficient
                    updateStoringAndStock();
                });
            } else {
                // No need to check stock if we're adding or not changing quantity
                updateStoringAndStock();
            }

            function updateStoringAndStock() {
                // Update pemasukan_barang
                db.query(
                    'UPDATE pemasukan_barang SET produk_id = ?, jumlah = ?, keterangan = ? WHERE id = ?',
                    [newProdukId, newJumlah, newKeterangan, storingId],
                    (errUpdate, result) => {
                        if (errUpdate) return res.status(500).json({ error: errUpdate.message });

                        // Update stock in produk table
                        db.query(
                            'UPDATE produk SET jumlah_barang = jumlah_barang + ? WHERE id = ?',
                            [selisihJumlah, newProdukId],
                            (errStock) => {
                                if (errStock) return res.status(500).json({ error: errStock.message });

                                // Get product name
                                db.query(
                                    'SELECT nama FROM produk WHERE id = ?',
                                    [newProdukId],
                                    (errName, produkResult) => {
                                        if (errName) return res.status(500).json({ error: errName.message });

                                        const nama_produk = produkResult[0]?.nama || '';
                                        res.status(200).json({
                                            pesan: '✅ Pemasukan barang berhasil diubah & stok diperbarui.',
                                            id: parseInt(storingId),
                                            produk_id: newProdukId,
                                            nama_produk,
                                            jumlah: newJumlah,
                                            keterangan: newKeterangan,
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Gagal Ubah Storing: ' + error.message });
    }
};

/**
 * Menghapus data pemasukan
 */
exports.deleteStoring = async (req, res) => {
    const id = req.params.id;

    try {
        // Check if entry exists
        db.query('SELECT * FROM pemasukan_barang WHERE id = ?', [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ pesan: 'Data pemasukan tidak ditemukan' });

            const { produk_id, jumlah } = result[0];

            // Check if there's enough stock to remove
            db.query('SELECT jumlah_barang FROM produk WHERE id = ?', [produk_id], (errStock, stockResult) => {
                if (errStock) return res.status(500).json({ error: errStock.message });

                const currentStock = stockResult[0]?.jumlah_barang || 0;

                if (currentStock < jumlah) {
                    return res.status(400).json({
                        error: `Tidak dapat menghapus. Stok saat ini (${currentStock}) kurang dari jumlah yang akan dihapus (${jumlah}).`
                    });
                }

                // Reduce stock in produk table
                db.query(
                    'UPDATE produk SET jumlah_barang = jumlah_barang - ? WHERE id = ?',
                    [jumlah, produk_id],
                    (errUpdate) => {
                        if (errUpdate) return res.status(500).json({ error: errUpdate.message });

                        // Delete entry
                        db.query('DELETE FROM pemasukan_barang WHERE id = ?', [id], (errDelete) => {
                            if (errDelete) return res.status(500).json({ error: errDelete.message });
                            res.json({ pesan: '✅ Pemasukan berhasil dihapus & stok diperbarui.' });
                        });
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Gagal Hapus Storing: ' + error.message });
    }
};
