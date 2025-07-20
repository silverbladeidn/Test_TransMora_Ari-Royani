// components/Navbar.jsx
import './CSS/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Navbar() {
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();

    // Text content based on selected language
    const navText = {
        en: {
            home: "Home",
            product: "Products",
            income: "Income",
            sales: "Sales",
            switchLanguage: "ID"
        },
        id: {
            home: "Beranda",
            product: "Produk",
            income: "Pemasukan",
            sales: "Penjualan",
            switchLanguage: "EN"
        }
    };

    const currentText = navText[language];

    return (
        <nav className="futuristic-navbar">
            <div className="logo" onClick={() => navigate('/halouser')}>⚡ ArLectro</div>
            <ul className="nav-links">
                <li onClick={() => navigate('/halouser')}>{currentText.home}</li>
                <li onClick={() => navigate('/produk')}>{currentText.product}</li>
                <li onClick={() => navigate('/pemasukan')}>{currentText.income}</li>
                <li onClick={() => navigate('/penjualan')}>{currentText.sales}</li>
                <li className="language-toggle" onClick={toggleLanguage}>
                    {currentText.switchLanguage}
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
