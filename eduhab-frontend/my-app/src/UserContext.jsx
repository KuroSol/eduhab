import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const getCsrfToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split('; csrftoken=');
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("No token found, user likely not logged in.");
            setIsLoggedIn(false);
            setUser(null);
            return;
        }

        const response = await fetch('https://eduhab.com/api/accounts/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsLoggedIn(true);
        } else {
            console.error('Failed to fetch user data:', await response.text());
            localStorage.removeItem('token');
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (username, password) => {
        const csrfToken = getCsrfToken();
        const response = await fetch('https://eduhab.com/api/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token);
            await fetchUser();
        } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            throw new Error(errorData.detail || 'Failed to login');
        }
    };

    const register = async (username, email, password, role) => {
        const csrfToken = getCsrfToken();
        const response = await fetch('https://eduhab.com/api/accounts/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password, user_types: [role] })
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('token', token);
            await fetchUser();
        } else {
            const errorData = await response.json();
            console.error('Registration failed:', errorData);
            throw new Error(errorData.detail || 'Failed to register');
        }
    };

    const logout = async () => {
        const csrfToken = getCsrfToken();
        const response = await fetch('https://eduhab.com/api/accounts/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include'
        });

        if (response.ok) {
            localStorage.removeItem('token');
            setUser(null);
            setIsLoggedIn(false);
        } else {
            const errorText = await response.text();
            console.error('Logout failed:', errorText);
            throw new Error(`Logout failed with status: ${response.status}`);
        }
    };

    return (
        <UserContext.Provider value={{ user, isLoggedIn, login, logout, register }}>
            {children}
        </UserContext.Provider>
    );
};
