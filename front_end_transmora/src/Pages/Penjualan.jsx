import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Table from '../Component/Table';
import './CSS/Produk.css';
import Navbar from '../Component/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import { useLanguage } from '../context/LanguageContext';

function Penjualan() {
    const { language } = useLanguage();
    const [sales, setSales] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateMin, setDateMin] = useState('');
    const [dateMax, setDateMax] = useState('');

    const translations = {
        en: {
            tableColumns: {
                id: "ID",
                id2: "Product ID",
                nama: "Product Name",
                stok: "Stock",
                tanggal: "Date",
                desc: "Description",
            },
            title: "Sales List",
            searchPlaceholder: "Search name or ID",
            found: "Found",
            clearall: "Clear All",
            total: "Total",
            from: "from",
            from2: "From",
            to: "To",
            object: "sales",
            loading: "Loading sales data...",
            errorTitle: "Error!",
            errorMessage: "Failed to fetch sales data",
            tryAgain: "Try Again",
            notFoundTitle: "Not Found",
            notFoundMessage: "No sales matches your search",
            clearSearch: "Clear Search",
            noDataTitle: "No Data",
            noDataMessage: "No sales available in database",
        },
        id: {
            tableColumns: {
                id: "ID",
                id2: "ID Produk",
                nama: "Nama Produk",
                stok: "Jumlah",
                tanggal: "Tanggal",
                desc: "Keterangan",
            },
            title: "Daftar Penjualan",
            searchPlaceholder: "Cari nama, ID produk atau keterangan",
            found: "Ditemukan",
            clearall: "Hapus Semua",
            total: "Total",
            from: "dari",
            from2: "Dari",
            to: "Sampai",
            object: "penjualan",
            loading: "Memuat data penjualan...",
            errorTitle: "Error!",
            errorMessage: "Gagal mengambil data penjualan",
            tryAgain: "Coba Lagi",
            notFoundTitle: "Tidak Ditemukan",
            notFoundMessage: "Tidak ada penjualan yang cocok dengan pencarian",
            clearSearch: "Hapus Pencarian",
            noDataTitle: "Tidak Ada Data",
            noDataMessage: "Belum ada penjualan barang yang tersedia di database",
        }
    };

    // Pastikan language tersedia dan valid, fallback ke 'en' jika tidak
    const currentLanguage = language && translations[language] ? language : 'en';
    const t = translations[currentLanguage];

    const columns = [
        { label: t.tableColumns.id, key: 'id' },
        { label: t.tableColumns.id2, key: 'produk_id' },
        { label: t.tableColumns.nama, key: 'nama_produk' },
        { label: t.tableColumns.stok, key: 'jumlah' },
        { label: t.tableColumns.tanggal, key: 'tanggal' },
        { label: t.tableColumns.desc, key: 'keterangan' }
    ];

    // Fetch all data from backend with optional filters
    const fetchAllSales = async (search = '', dateminim = '', datemaxim = '') => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (search.trim()) params.append('search', search.trim());
            if (dateminim) params.append('dateminim', dateminim);
            if (datemaxim) params.append('datemaxim', datemaxim);

            const queryString = params.toString();
            const url = `http://localhost:4000/sales${queryString ? `?${queryString}` : ''}`;

            console.log('Fetching URL:', url);
            const res = await axios.get(url);
            console.log('Fetched storing:', res.data);

            // Pastikan res.data adalah array
            const data = Array.isArray(res.data) ? res.data : [];
            setAllSales(data);
            setSales(data);
            setError('');
        } catch (err) {
            console.error('Error fetching storing:', err);
            if (err.code === 'ERR_NETWORK') {
                setError(t.errorMessage + ': Tidak dapat terhubung ke server. Pastikan backend berjalan di localhost yang sesuai');
            } else if (err.response?.status === 404) {
                setError(t.errorMessage + ': Endpoint /storing tidak ditemukan');
            } else {
                setError(t.errorMessage + ': ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Apply all filters (search + date range)
    const applyFilters = useCallback(() => {
        fetchAllSales(searchTerm, dateMin, dateMax);
    }, [searchTerm, dateMin, dateMax]);

    // Debounced filter application
    const debouncedApplyFilters = useMemo(
        () => debounce(applyFilters, 500),
        [applyFilters]
    );

    // Apply filters when search term or dates change
    useEffect(() => {
        debouncedApplyFilters();

        // Cleanup debounced function
        return () => {
            debouncedApplyFilters.cancel();
        };
    }, [debouncedApplyFilters]);

    // Initial data fetch
    useEffect(() => {
        fetchAllSales();
    }, []);

    const handleRefresh = () => {
        setSearchTerm('');
        setDateMin('');
        setDateMax('');
        fetchAllSales();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleClearDateMin = () => {
        setDateMin('');
    };

    const handleClearDateMax = () => {
        setDateMax('');
    };

    const handleClearAllFilters = () => {
        setSearchTerm('');
        setDateMin('');
        setDateMax('');
    };

    return (
        <div className="App">
            <Navbar />
            <div className="Home">
                <div className="container mt-5" style={{ paddingTop: '0.21px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-info mb-0 text-start" style={{ paddingRight: '21px' }}>{t.title}</h2>
                        <div className="d-flex align-items-center">
                            <div className="me-3" style={{ width: '250px' }}>
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

                            {/* Date Range Filters */}
                            <div className="d-flex align-items-center me-3">
                                <label className="me-2 text-nowrap">{t.from2} :</label>
                                <div className="input-group" style={{ width: '160px' }}>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={dateMin}
                                        onChange={(e) => setDateMin(e.target.value)}
                                    />
                                    {dateMin && (
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            type="button"
                                            onClick={handleClearDateMin}
                                            title="Clear date"
                                        >
                                            <FontAwesomeIcon icon={faTimes} size="xs" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex align-items-center me-3">
                                <label className="me-2 text-nowrap">{t.to} :</label>
                                <div className="input-group" style={{ width: '160px' }}>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={dateMax}
                                        onChange={(e) => setDateMax(e.target.value)}
                                    />
                                    {dateMax && (
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            type="button"
                                            onClick={handleClearDateMax}
                                            title="Clear date"
                                        >
                                            <FontAwesomeIcon icon={faTimes} size="xs" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {(searchTerm || dateMin || dateMax) && (
                                <button
                                    className="btn btn-outline-warning btn-sm me-3"
                                    onClick={handleClearAllFilters}
                                    title="Clear all filters"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                                    {t.clearall}
                                </button>
                            )}

                            {/* Status Badges */}
                            <div className="d-flex flex-column align-items-end">
                                {(searchTerm || dateMin || dateMax) && (
                                    <span className="badge bg-info mb-1">
                                        {t.found}: {sales.length} {t.from} {allSales.length}
                                    </span>
                                )}
                                <span className="badge bg-success">
                                    {t.total}: {allSales.length} {t.object}
                                </span>
                            </div>
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
                    ) : sales.length === 0 && searchTerm ? (
                        /* Tidak ada hasil pencarian */
                        <div className="alert alert-warning" role="alert">
                            <h5 className="alert-heading">
                                <i className="fas fa-search"></i> {t.notFoundTitle}
                            </h5>
                            <p>{t.notFoundMessage}  "<strong>{searchTerm}</strong>"</p>
                            <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={handleClearSearch}
                            >
                                <i className="fas fa-times"></i> {t.clearSearch}
                            </button>
                        </div>
                    ) : sales.length === 0 ? (
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
                            <Table columns={columns} data={sales} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Penjualan;