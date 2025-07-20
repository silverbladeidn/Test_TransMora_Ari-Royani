const db = require('../config/db');

/**
 * Mendapatkan semua data penjualan
 */
exports.getAllSales = (req, res) => {
  const query = `
    SELECT 
      pb.id, 
      pb.produk_id, 
      pr.nama AS nama_produk, 
      pb.jumlah, 
      DATE_FORMAT(pb.tanggal, '%Y-%m-%d') AS tanggal, 
      pb.keterangan
    FROM penjualan_barang pb
    JOIN produk pr ON pb.produk_id = pr.id
    ORDER BY pb.id ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

/**
 * Membuat data penjualan baru
 */
exports.createSales = (req, res) => {
  const { produk_id, jumlah, keterangan } = req.body;
  const tanggal = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD

  // 1. Cek apakah produk ada dan stok mencukupi
  db.query('SELECT * FROM produk WHERE id = ?', [produk_id], (err, produkResult) => {
    if (err) return res.status(500).json({ error: err });
    if (produkResult.length === 0) {
      return res.status(400).json({ error: 'Produk tidak ditemukan.' });
    }

    const produk = produkResult[0];
    const stokSaatIni = produk.jumlah_barang || 0;

    // Cek stok mencukupi
    if (stokSaatIni < jumlah) {
      return res.status(400).json({
        error: 'Stok tidak mencukupi.',
        stokSaatIni: stokSaatIni,
        jumlahDiminta: jumlah
      });
    }

    // 2. Simpan data penjualan
    db.query(
      'INSERT INTO penjualan_barang (produk_id, jumlah, keterangan, tanggal) VALUES (?, ?, ?, ?)',
      [produk_id, jumlah, keterangan, tanggal],
      (errInsert, insertResult) => {
        if (errInsert) return res.status(500).json({ error: errInsert });

        // 3. Kurangi stok produk
        db.query(
          'UPDATE produk SET jumlah_barang = COALESCE(jumlah_barang, 0) - ? WHERE id = ?',
          [jumlah, produk_id],
          (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: errUpdate });

            // 4. Kirim response sukses
            res.status(201).json({
              pesan: '✅ Penjualan barang berhasil disimpan & stok diperbarui.',
              penjualan: {
                id: insertResult.insertId,
                produk_id,
                nama_produk: produk.nama,
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
};

/**
 * Mengubah data penjualan
 */
exports.updateSales = (req, res) => {
  const { produk_id, jumlah, keterangan } = req.body;
  const salesId = req.params.id;

  // 1. Ambil data penjualan lama
  db.query('SELECT * FROM penjualan_barang WHERE id = ?', [salesId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: 'Data penjualan tidak ditemukan' });

    const oldSale = result[0];

    // Gunakan data lama jika tidak dikirim
    const newProdukId = produk_id !== undefined ? produk_id : oldSale.produk_id;
    const newJumlah = jumlah !== undefined ? jumlah : oldSale.jumlah;
    const newKeterangan = keterangan !== undefined ? keterangan : oldSale.keterangan;

    if (oldSale.produk_id === newProdukId) {
      // 2A. Jika produk sama, hitung selisih jumlah
      const selisih = newJumlah - oldSale.jumlah;

      // Update data penjualan
      db.query(
        'UPDATE penjualan_barang SET jumlah = ?, keterangan = ? WHERE id = ?',
        [newJumlah, newKeterangan, salesId],
        (errUpdate) => {
          if (errUpdate) return res.status(500).json({ error: errUpdate });

          // Update stok produk berdasarkan selisih (jika ada perubahan)
          if (selisih !== 0) {
            db.query(
              'UPDATE produk SET jumlah_barang = COALESCE(jumlah_barang, 0) - ? WHERE id = ?',
              [selisih, newProdukId],
              (errStok) => {
                if (errStok) return res.status(500).json({ error: errStok });

                // Ambil nama produk untuk response
                getProductName(newProdukId, (errNama, nama_produk) => {
                  if (errNama) return res.status(500).json({ error: errNama });

                  sendSuccessResponse(res, salesId, newProdukId, nama_produk, newJumlah, newKeterangan);
                });
              }
            );
          } else {
            // Tidak ada perubahan jumlah, langsung kirim response
            getProductName(newProdukId, (errNama, nama_produk) => {
              if (errNama) return res.status(500).json({ error: errNama });

              sendSuccessResponse(res, salesId, newProdukId, nama_produk, newJumlah, newKeterangan);
            });
          }
        }
      );
    } else {
      // 2B. Jika produk berbeda, kembalikan stok produk lama dan kurangi stok produk baru
      db.query(
        'UPDATE produk SET jumlah_barang = COALESCE(jumlah_barang, 0) + ? WHERE id = ?',
        [oldSale.jumlah, oldSale.produk_id],
        (errOld) => {
          if (errOld) return res.status(500).json({ error: errOld });

          // Kurangi stok produk baru
          db.query(
            'UPDATE produk SET jumlah_barang = COALESCE(jumlah_barang, 0) - ? WHERE id = ?',
            [newJumlah, newProdukId],
            (errNew) => {
              if (errNew) return res.status(500).json({ error: errNew });

              // Update data penjualan
              db.query(
                'UPDATE penjualan_barang SET produk_id = ?, jumlah = ?, keterangan = ? WHERE id = ?',
                [newProdukId, newJumlah, newKeterangan, salesId],
                (errUpdate) => {
                  if (errUpdate) return res.status(500).json({ error: errUpdate });

                  // Ambil nama produk
                  getProductName(newProdukId, (errNama, nama_produk) => {
                    if (errNama) return res.status(500).json({ error: errNama });

                    sendSuccessResponse(res, salesId, newProdukId, nama_produk, newJumlah, newKeterangan);
                  });
                }
              );
            }
          );
        }
      );
    }
  });
};

/**
 * Menghapus data penjualan
 */
exports.deleteSales = (req, res) => {
  const id = req.params.id;

  // 1. Cek apakah penjualan ada
  db.query('SELECT * FROM penjualan_barang WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ pesan: 'Data penjualan tidak ditemukan' });

    const { produk_id, jumlah } = result[0];

    // 2. Kembalikan stok produk
    db.query(
      'UPDATE produk SET jumlah_barang = COALESCE(jumlah_barang, 0) + ? WHERE id = ?',
      [jumlah, produk_id],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2 });

        // 3. Hapus data penjualan
        db.query('DELETE FROM penjualan_barang WHERE id = ?', [id], (err3) => {
          if (err3) return res.status(500).json({ error: err3 });
          res.json({ pesan: '✅ Penjualan berhasil dihapus & stok diperbarui.' });
        });
      }
    );
  });
};

// Helper function untuk mendapatkan nama produk
function getProductName(produkId, callback) {
  db.query('SELECT nama FROM produk WHERE id = ?', [produkId], (err, produkData) => {
    if (err) return callback(err);
    const nama_produk = produkData[0]?.nama || '';
    callback(null, nama_produk);
  });
}

// Helper function untuk mengirim response sukses
function sendSuccessResponse(res, id, produk_id, nama_produk, jumlah, keterangan) {
  res.status(200).json({
    pesan: '✅ Penjualan berhasil diubah & stok diperbarui.',
    id: parseInt(id),
    produk_id,
    nama_produk,
    jumlah,
    keterangan
  });
}
