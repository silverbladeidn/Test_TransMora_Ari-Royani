const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const db = require('../config/db'); // asumsikan ini koneksi mysql
const query = util.promisify(db.query).bind(db);
const util = require('util');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header tidak valid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Ambil user dari DB
        const results = await query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = results[0];

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        if (user.status === 'blokir') {
            return res.status(403).json({ error: 'Akun Anda telah diblokir' });
        }

        // Simpan user ke request
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token telah kedaluwarsa' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token tidak valid' });
        } else {
            console.error('Unexpected error in verifyToken:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
        }
    }
};

exports.requireRole = (allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Akses ditolak' });
    }
    next();
};
