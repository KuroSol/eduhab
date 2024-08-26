import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';  // Corrected import
import { useUser } from './UserContext';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function Login() {
    const { login, isLoggedIn } = useUser();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/profile');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(username, password);
            setIsLoading(false);
        } catch (error) {
            setError("Login failed: " + error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <label>Username:<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
                <label>Password:<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
                <button type="submit" disabled={isLoading}>Login</button>
                <div><Link to="/password-reset">Forgot Password?</Link></div>
                {error && <p className="error">{error}</p>}
                {isLoading && <p>Loading...</p>}
            </form>
            <button onClick={() => navigate('/register')}>Register</button>  
        </div>
    );
}

export default Login;
