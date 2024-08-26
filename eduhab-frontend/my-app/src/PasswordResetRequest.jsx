// PasswordResetRequest.js
import axios from 'axios';
import React, { useState } from 'react';

function PasswordResetRequest() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleResetRequest = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://eduhab.com/api/accounts/password_reset/request/', { email });
            if (response.status === 200) {
                setMessage("Password reset email sent successfully. Please check your inbox.");
            } else {
                setMessage("Failed to send password reset email. Please try again.");
            }
        } catch (error) {
            setMessage("Failed to send password reset email. Please try again.");
        }
    };

    return (
        <div>
            <form onSubmit={handleResetRequest}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <button type="submit">Send Password Reset Link</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}

export default PasswordResetRequest;
