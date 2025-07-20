// components/Navbar.jsx
import './CSS/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';
function Navbar() {
    const navigate = useNavigate();
    const { language, toggleLanguage } = useLanguage();

    // Text content based on selected language
    const navText = {
        en: {
            home: "Home",
            product: "Products",
            income: "Storaging",
            sales: "Sales",
            logout: "Logout",
            switchLanguage: "ID"
        },
        id: {
            home: "Beranda",
            product: "Produk",
            income: "Pemasukan",
            sales: "Penjualan",
            logout: "Keluar",
            switchLanguage: "EN"
        }
    };

    const currentText = navText[language];

    return (
        <nav className="futuristic-navbar">
            <div className="logo" onClick={() => navigate('/halouser')}>
                <FontAwesomeIcon icon={faLaptop} className="me-2" /> ArLectro</div>
            <ul className="nav-links">
                <li onClick={() => navigate('/halouser')}>{currentText.home}</li>
                <li onClick={() => navigate('/produk')}>{currentText.product}</li>
                <li onClick={() => navigate('/pemasukan')}>{currentText.income}</li>
                <li onClick={() => navigate('/penjualan')}>{currentText.sales}</li>
                <li onClick={() => navigate('/')}>{currentText.logout}</li>
                <li className="language-toggle" onClick={toggleLanguage}>
                    {currentText.switchLanguage}
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
