// Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './App.css'

function Register() {
    const { register } = useUser();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Declare state for confirmPassword
    const [role, setRole] = useState('student');  // Default to 'student' role
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            // Ensure that 'register' function can accept 'role' as a parameter
            await register(username, email, password, role);
            navigate('/login');  // Navigate to login page upon successful registration
            setIsLoading(false);
        } catch (error) {
            setError("Registration failed: " + error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <label>Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <label>Confirm Password:
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </label>
                <div>
                    Role:
                    <label>
                        <input
                            type="radio"
                            value="teacher"
                            checked={role === 'teacher'}
                            onChange={() => setRole('teacher')}
                        /> Teacher
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="student"
                            checked={role === 'student'}
                            onChange={() => setRole('student')}
                        /> Student
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="author"
                            checked={role === 'author'}
                            onChange={() => setRole('author')}
                        /> Author
                    </label>
                </div>
                <button type="submit" disabled={isLoading}>Register</button>
                <button type="button" onClick={() => navigate('/login')}>Back to Login</button>  
                {error && <p>{error}</p>}
                {isLoading && <p>Loading...</p>}
            </form>
        </div>
    );
}

export default Register;
