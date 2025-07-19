import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CSS/Login.css';

function Login() {
    const navigate = useNavigate();

    return (
        <div className="Login">
            <div className="form-buttons">
                <h1>Silahkan Login....</h1>
                <div className="form-logins">
                    <h2>Email</h2>
                    <input type="text" placeholder="Email" />
                    <h2>Password</h2>
                    <input type="password" placeholder="Password" />
                </div>
                <div className="button-row">
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/')}>Kembali</button>
                </div>
            </div>
        </div>
    );
}

export default Login;
