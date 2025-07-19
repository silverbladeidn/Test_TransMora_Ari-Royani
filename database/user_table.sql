-- Query untuk membuat tabel users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_user VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roles ENUM('admin', 'user', 'manager') DEFAULT 'user',
    status ENUM('aktif', 'blokir') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Query untuk insert data contoh
INSERT INTO users (nama_user, email, password, roles, status) VALUES
('Admin Utama', 'admin@example.com', '$2b$10$hashedpassword1', 'admin', 'aktif'),
('John Doe', 'john@example.com', '$2b$10$hashedpassword2', 'user', 'aktif'),
('Jane Smith', 'jane@example.com', '$2b$10$hashedpassword3', 'manager', 'aktif'),
('Bob Wilson', 'bob@example.com', '$2b$10$hashedpassword4', 'user', 'blokir'),
('Alice Brown', 'alice@example.com', '$2b$10$hashedpassword5', 'user', 'aktif'),
('Charlie Davis', 'charlie@example.com', '$2b$10$hashedpassword6', 'manager', 'blokir');

-- Query untuk menampilkan data sesuai dengan tabel yang diminta
SELECT 
    id AS 'ID',
    nama_user AS 'Nama User',
    roles AS 'Roles',
    CASE 
        WHEN status = 'blokir' THEN 'Blokir'
        ELSE ''
    END AS 'Status'
FROM users
ORDER BY id;

-- Query untuk menampilkan semua data user
SELECT 
    id,
    nama_user,
    email,
    roles,
    status,
    created_at,
    updated_at
FROM users
ORDER BY id;

-- Query untuk menampilkan hanya user yang aktif
SELECT 
    id,
    nama_user,
    roles,
    status
FROM users 
WHERE status = 'aktif'
ORDER BY id;

-- Query untuk menampilkan hanya user yang diblokir
SELECT 
    id,
    nama_user,
    roles,
    status
FROM users 
WHERE status = 'blokir'
ORDER BY id;

-- Query untuk mengubah status user menjadi blokir
UPDATE users 
SET status = 'blokir' 
WHERE id = ?;

-- Query untuk mengubah status user menjadi aktif
UPDATE users 
SET status = 'aktif' 
WHERE id = ?;

-- Query untuk menghapus user
DELETE FROM users WHERE id = ?;

-- Query untuk mencari user berdasarkan nama
SELECT 
    id,
    nama_user,
    roles,
    status
FROM users 
WHERE nama_user LIKE '%?%'
ORDER BY id;