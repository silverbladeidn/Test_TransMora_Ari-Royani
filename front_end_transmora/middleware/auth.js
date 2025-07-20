const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const db = require('../config/db'); // asumsikan ini koneksi mysql

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan!' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Ambil user dari DB
        db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
            if (err) return res.status(500).json({ error: 'DB error' });

            const user = result[0];

            if (!user) {
                return res.status(404).json({ error: 'User tidak ditemukan' });
            }

            if (user.status === 'blokir') {
                return res.status(403).json({ error: 'Akun Anda telah diblokir' });
            }

            // Simpan user ke request
            req.user = user;
            next();
        });
    } catch (err) {
        console.error('JWT Error:', err.message);
        return res.status(401).json({ error: 'Token tidak valid' });
    }
};
