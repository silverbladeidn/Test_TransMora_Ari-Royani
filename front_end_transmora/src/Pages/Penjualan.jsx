import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../Component/Table';
import './CSS/Produk.css';
import Navbar from '../Component/Navbar';

function Penjualan() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Produk ID', key: 'produk_id' },
        { label: 'Nama Produk', key: 'nama_produk' },
        { label: 'Jumlah', key: 'jumlah' },
        { label: 'Tanggal', key: 'tanggal' },
        { label: 'Keterangan', key: 'keterangan' }
    ];

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await axios.get('http://localhost:4000/sales');
                setSales(res.data);
            } catch (err) {
                setError('Gagal mengambil data sales');
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    return (
        <div className="App">
            <Navbar />
            <div className="Home">
                <div className="container mt-5">
                    <h2 className="text-info mb-4">Daftar Penjualan</h2>

                    {loading ? (
                        <p className="text-warning">Loading data...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <Table columns={columns} data={sales} />
                    )}
                </div>
            </div>
        </div>
    );
}
export default Penjualan;
