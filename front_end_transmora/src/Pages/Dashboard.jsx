import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CSS/Dashboard.css';
import Navbar from '../Component/Navbar';
import { useLanguage } from '../context/LanguageContext';

function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const { language } = useLanguage();

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 500);
                    return 100;
                }
                return prev + 1;
            });
        }, 25);
        return () => clearInterval(interval);
    }, []);

    // Konten berdasarkan bahasa yang dipilih
    const text = {
        en: {
            loading: "Please wait, we are loading...",
            welcome: "Welcome to ArLectro",
            description: "ArLectro is a platform that sells a wide range of computer hardware, software, accessories, and electronic products. The platform provides comprehensive solutions for purchasing many of the products we sell.",
            getStarted: "Get Started!"
        },
        id: {
            loading: "Mohon tunggu, sedang memuat...",
            welcome: "Selamat Datang di ArLectro",
            description: "ArLectro adalah platform yang menjual beragam perangkat keras, perangkat lunak, aksesori, dan produk elektronik komputer. Platform ini menyediakan solusi komprehensif untuk pembelian berbagai produk yang kami jual.",
            getStarted: "Ayo Mulai!"
        }
    };

    // Pastikan ada bahasa yang valid dan lakukan fallback jika bahasa invalid
    const currentLanguage = language || 'en';
    const currentText = text[currentLanguage];

    return (
        <div className="App">
            <Navbar />
            <div className="Home">
                {loading ? (
                    <div className="loading-container">
                        <h1>{currentText?.loading || 'Loading...'}</h1>
                        <div className="spinner"></div>
                        <p className="loading-text">{progress}%</p>
                    </div>
                ) : (
                    <div className="content">
                        <h1>{currentText?.welcome}</h1>
                        <p>
                            {currentText?.description}
                        </p>
                        <button onClick={() => navigate('/produk')}>
                            {currentText?.getStarted}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;