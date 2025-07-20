// Produk.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../Component/Table';
import './CSS/Produk.css';
import Navbar from '../Component/Navbar';

function Produk() {
    const [produk, setProduk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Nama Produk', key: 'nama' },
        { label: 'Harga', key: 'harga' },
        { label: 'Stok', key: 'jumlah_barang' },
    ];

    useEffect(() => {
        const fetchProduk = async () => {
            try {
                const res = await axios.get('http://localhost:4000/produk');
                setProduk(res.data);
            } catch (err) {
                setError('Gagal mengambil data produk');
            } finally {
                setLoading(false);
            }
        };

        fetchProduk();
    }, []);

    return (
        <div className="App">
            <Navbar />
            <div className="Home">
                <div className="container mt-5">
                    <h2 className="text-info mb-4">Daftar Produk</h2>

                    {loading ? (
                        <p className="text-warning">Loading data...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <Table columns={columns} data={produk} />
                    )}
                </div>
            </div>
        </div>
    );
}
export default Produk;
