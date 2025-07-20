import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './CSS/Login.css';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/login', formData);

            // Store token and user data in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect based on user role
            navigate('/halouser');

        } catch (err) {
            setError(err.response?.data?.error || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Login">
            <div className="form-buttons">
                <h1>Silahkan Login....</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin} className="form-logins">
                    <h2>Email</h2>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <h2>Password</h2>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <div className="button-row">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <button type="button" onClick={() => navigate('/')}>Kembali</button>
                    </div>
                </form>
                <div className="register-link">
                    Belum punya akun? <span onClick={() => navigate('/register')}>Daftar disini</span>
                </div>
            </div>
        </div>
    );
}

export default Login;
