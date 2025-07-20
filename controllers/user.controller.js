const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Tambah user
exports.createUser = async (req, res) => {
    const { nama_user, email, password, roles, status } = req.body;

    if (!nama_user || !email || !password || !roles || !status) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (nama_user, email, password, roles, status) VALUES (?, ?, ?, ?, ?)',
            [nama_user, email, hashedPassword, roles, status],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Email sudah terdaftar' });
                    }
                    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
                }
                res.status(201).json({
                    id: result.insertId,
                    nama_user,
                    email,
                    roles,
                    status,
                    pesan: '✅ User berhasil ditambahkan'
                });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengenkripsi password' });
    }
};

// Ubah user
exports.updateUser = async (req, res) => {
    const { nama_user, email, password, roles, status } = req.body;
    const userId = req.params.id;

    try {
        // Ambil data lama user
        db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, users) => {
            if (err) return res.status(500).json({ error: err });
            if (users.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });

            const oldUser = users[0];

            // Gunakan data lama jika tidak dikirim
            const newNama = nama_user !== undefined ? nama_user : oldUser.nama_user;
            const newEmail = email !== undefined ? email : oldUser.email;
            const newRoles = roles !== undefined ? roles : oldUser.roles;
            const newStatus = status !== undefined ? status : oldUser.status;

            let query, params;

            if (password && password.trim() !== '') {
                const hashedPassword = await bcrypt.hash(password, 10);
                query = 'UPDATE users SET nama_user = ?, email = ?, password = ?, roles = ?, status = ? WHERE id = ?';
                params = [newNama, newEmail, hashedPassword, newRoles, newStatus, userId];
            } else {
                query = 'UPDATE users SET nama_user = ?, email = ?, roles = ?, status = ? WHERE id = ?';
                params = [newNama, newEmail, newRoles, newStatus, userId];
            }

            db.query(query, params, (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Email sudah terdaftar' });
                    }
                    return res.status(500).json({ error: err });
                }

                res.json({
                    id: parseInt(userId),
                    nama_user: newNama,
                    email: newEmail,
                    roles: newRoles,
                    status: newStatus,
                    pesan: '✅ User berhasil diubah'
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal ubah User!!' });
    }
};

// Hapus user
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Cek apakah user ada
        db.query('SELECT nama_user FROM users WHERE id = ?', [userId], (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.length === 0) {
                return res.status(404).json({ error: 'User tidak ditemukan' });
            }

            const namaUser = result[0].nama_user;

            // Hapus user
            db.query('DELETE FROM users WHERE id = ?', [userId], (err, deleteResult) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                    pesan: `✅ User "${namaUser}" berhasil dihapus`
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Gagal hapus user' });
    }
};

// Ubah status user
exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    const userId = req.params.id;

    // Validasi status
    if (!status || !['aktif', 'blokir'].includes(status)) {
        return res.status(400).json({ error: 'Status harus aktif atau blokir' });
    }
    try {
        db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId],
            (err, result) => {
                if (err) return res.status(500).json({ error: err });

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'User tidak ditemukan' });
                }

                res.json({
                    pesan: `✅ Status user berhasil diubah menjadi ${status}`
                });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Gagal ubah status' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    try {
        // Cek apakah user ada
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Terjadi kesalahan server' });
            }

            if (result.length === 0) {
                return res.status(401).json({ error: 'Email tidak ditemukan' });
            }

            const user = result[0];

            if (user.status === 'blokir') {
                return res.status(403).json({ error: 'Akun Anda telah diblokir. Silakan hubungi admin.' });
            }

            // Cek password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Password salah' });
            }

            // Buat token (opsional, kalau pakai auth berbasis token)
            // Menjadi:
            console.log('=== DEBUG JWT ===');
            console.log('JWT_SECRET:', process.env.JWT_SECRET);
            console.log('JWT_SECRET type:', typeof process.env.JWT_SECRET);
            console.log('User ID:', user.id);
            console.log('================');

            // Cek apakah JWT_SECRET ada
            const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-yang-sangat-aman-minimal-32-karakter';
            console.log('Using JWT_SECRET:', JWT_SECRET);

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

            // Kirim response
            res.json({
                pesan: `✅ Selamat datang, ${user.nama_user}`,
                token,
                user: {
                    id: user.id,
                    nama: user.nama_user,
                    email: user.email,
                    status: user.status
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal untuk login' });
    }
};
