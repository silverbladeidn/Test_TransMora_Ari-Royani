import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './CSS/Register.css';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama_user: '',
        email: '',
        password: '',
        roles: 'user',
        status: 'aktif'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:4000/register', formData);
            setSuccess(response.data.pesan || 'Registrasi berhasil!');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Terjadi kesalahan saat registrasi');
        }
    };

    return (
        <div className="Register">
            <div className="form-buttons">
                <h1>Silahkan Daftar....</h1>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit} className="form-register">
                    <h2>Nama</h2>
                    <input
                        type="text"
                        name="nama_user"
                        placeholder="Namamu"
                        value={formData.nama_user}
                        onChange={handleChange}
                        required
                    />
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
                    <h2>Roles</h2>
                    <select
                        name="roles"
                        value={formData.roles}
                        onChange={handleChange}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                    </select>

                    <div className="button-row">
                        <button type="submit">Register</button>
                        <button type="button" onClick={() => navigate('/')}>Kembali</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
