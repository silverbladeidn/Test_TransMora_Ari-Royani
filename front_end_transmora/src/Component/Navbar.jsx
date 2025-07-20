// components/Navbar.jsx
import './CSS/Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="futuristic-navbar">
            <div className="logo" onClick={() => navigate('/halouser')}>⚡ ArLectro</div>
            <ul className="nav-links">
                <li onClick={() => navigate('/halouser')}>Home</li>
                <li onClick={() => navigate('/produk')}>Produk</li>
                <li onClick={() => navigate('/pemasukan')}>Pemasukan</li>
                <li onClick={() => navigate('/penjualan')}>Penjualan</li>
            </ul>
        </nav>
    );
}

export default Navbar;
