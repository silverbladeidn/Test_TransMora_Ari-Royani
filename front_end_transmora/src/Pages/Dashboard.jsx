import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CSS/Dashboard.css';
import Navbar from '../Component/Navbar';

function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

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

    return (
        <div className="App"> {/* Container utama */}
            <Navbar /> {/* Navbar di luar */}
            <div className="Home"> {/* Content area */}
                {loading ? (
                    <div className="loading-container">
                        <h1>Please wait, we are loading...</h1>
                        <div className="spinner"></div>
                        <p className="loading-text">{progress}%</p>
                    </div>
                ) : (
                    <div className="content">
                        <h1>Welcome to ArLectro</h1>
                        <p>
                            ArLectro is a platform that provides a comprehensive solution for managing and analyzing data from various sources.
                            It offers a user-friendly interface for data collection, storage, and analysis, making it an ideal tool for businesses and organizations.
                        </p>
                        <button onClick={() => navigate('/login')}>Get Started</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
