import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../App.css';

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        // Simulasi loading progress 0% → 100%
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 500); // delay sedikit agar smooth
                    return 100;
                }
                return prev + 1;
            });
        }, 25); // 25ms × 100 = 2500ms (2.5 detik)
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="Home">
            {loading ? (
                <div className="loading-container">
                    <h1>Please wait, we are loading...</h1>
                    <div className="spinner"></div>
                    <p className="loading-text">{progress}%</p>
                </div>
            ) : (
                <div className="auth-buttons">
                    <h1>Welcome to ArLectro</h1>
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/register')}>Register</button>
                </div>
            )}
        </div>
    );
}

export default Home;
