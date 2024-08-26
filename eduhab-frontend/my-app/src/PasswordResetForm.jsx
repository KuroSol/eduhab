// PasswordResetForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // This hook allows us to retrieve params from the URL

function PasswordResetForm() {
    const { uid, token } = useParams(); // Extracting uid and token from the URL
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            const url = `https://eduhab.com/api/accounts/password_reset/confirm/${uid}/${token}/`;
            const response = await axios.post(url, { password });
            if (response.status === 200) {
                setMessage("Your password has been reset successfully.");
            } else {
                setMessage("Error resetting password. Please try again.");
            }
        } catch (error) {
            setMessage("Error resetting password. Please try again. Make sure your link is correct.");
        }
    };

    return (
        <form onSubmit={handlePasswordReset}>
            <label>
                New Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit">Reset Password</button>
            {message && <p>{message}</p>}
        </form>
    );
}

export default PasswordResetForm;
