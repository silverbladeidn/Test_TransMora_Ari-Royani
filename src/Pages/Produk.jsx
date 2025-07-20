import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Table from '../Component/Table';
import './CSS/Produk.css';
import Navbar from '../Component/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../context/LanguageContext';

function Produk() {
    const { language } = useLanguage();
    const [produk, setProduk] = useState([]);
    const [allProduk, setAllProduk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const translations = {
        en: {
            tableColumns: {
                id: "ID",
                nama: "Product Name",
                harga: "Price",
                stok: "Stock"
            },
            title: "Product List",
            searchPlaceholder: "Search name, price, stock or ID",
            found: "Found",
            total: "Total",
            from: "from",
            object: "products",
            loading: "Loading product data...",
            errorTitle: "Error!",
            errorMessage: "Failed to fetch product data",
            tryAgain: "Try Again",
            notFoundTitle: "Not Found",
            notFoundMessage: "No product matches your search",
            clearSearch: "Clear Search",
            noDataTitle: "No Data",
            noDataMessage: "No product available in database",
        },
        id: {
            tableColumns: {
                id: "ID",
                nama: "Nama Produk",
                harga: "Harga",
                stok: "Stok"
            },
            title: "Daftar Produk",
            searchPlaceholder: "Cari nama, harga, stok atau ID",
            found: "Ditemukan",
            total: "Total",
            from: "dari",
            object: "produk",
            loading: "Memuat data produk...",
            errorTitle: "Error!",
            errorMessage: "Gagal mengambil data produk",
            tryAgain: "Coba Lagi",
            notFoundTitle: "Tidak Ditemukan",
            notFoundMessage: "Tidak ada produk yang cocok dengan pencarian",
            clearSearch: "Hapus Pencarian",
            noDataTitle: "Tidak Ada Data",
            noDataMessage: "Belum ada produk yang tersedia di database",
        }
    };

    const t = translations[language || 'en'];

    const columns = [
        { label: t.tableColumns.id, key: 'id' },
        { label: t.tableColumns.nama, key: 'nama' },
        { label: t.tableColumns.harga, key: 'harga' },
        { label: t.tableColumns.stok, key: 'jumlah_barang' },
    ];

    const fetchAllProduk = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:4000/produk');
            setAllProduk(res.data);
            setProduk(res.data);
            setError('');
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost:4000');
            } else if (err.response?.status === 404) {
                setError('Endpoint /produk tidak ditemukan');
            } else {
                setError(`${t.errorMessage}: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredProduk = useMemo(() => {
        if (!searchTerm.trim()) return allProduk;

        const searchLower = searchTerm.toLowerCase();
        return allProduk.filter(item =>
            (item.nama && item.nama.toLowerCase().includes(searchLower)) ||
            (item.id && item.id.toString().includes(searchLower)) ||
            (item.harga && item.harga.toString().includes(searchLower)) ||
            (item.jumlah_barang && item.jumlah_barang.toString().includes(searchLower))
        );
    }, [allProduk, searchTerm]);

    useEffect(() => {
        fetchAllProduk();
    }, []);

    useEffect(() => {
        setProduk(filteredProduk);
    }, [filteredProduk]);

    const handleRefresh = () => {
        setSearchTerm('');
        fetchAllProduk();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="App">
            <Navbar />
            <div className="Home">
                <div className="container mt-5" style={{ paddingTop: '0.21px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-info mb-0">{t.title}</h2>
                        <div className="d-flex align-items-center">
                            <div className="me-3" style={{ width: '300px' }}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t.searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={handleClearSearch}
                                            title={t.clearSearch}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Status Badges */}
                            {searchTerm && (
                                <span className="badge bg-info me-2">
                                    {t.found}: {produk.length} {t.from} {allProduk.length}
                                </span>
                            )}
                            <span className="badge bg-success">
                                {t.total}: {allProduk.length} {t.object}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-warning mt-2">{t.loading}</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            <h5 className="alert-heading">
                                <i className="fas fa-exclamation-triangle"></i> {t.errorTitle}
                            </h5>
                            <p>{error}</p>
                            <hr />
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleRefresh}
                            >
                                <i className="fas fa-redo"></i> {t.tryAgain}
                            </button>
                        </div>
                    ) : produk.length === 0 && searchTerm ? (
                        /* Tidak ada hasil pencarian */
                        <div className="alert alert-warning" role="alert">
                            <h5 className="alert-heading">
                                <i className="fas fa-search"></i> {t.notFoundTitle}
                            </h5>
                            <p>{t.notFoundMessage} "<strong>{searchTerm}</strong>"</p>
                            <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={handleClearSearch}
                            >
                                <i className="fas fa-times"></i> {t.clearSearch}
                            </button>
                        </div>
                    ) : produk.length === 0 ? (
                        /* Tidak ada Data */
                        <div className="alert alert-info" role="alert">
                            <h5 className="alert-heading">
                                <i className="fas fa-info-circle"></i> {t.noDataTitle}
                            </h5>
                            <p>{t.noDataMessage}</p>
                        </div>
                    ) : (
                        /* Tabel data */
                        <div>
                            <Table columns={columns} data={produk} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Produk;
