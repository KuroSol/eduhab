import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './Header.css';

function Header() {
    const { user, isLoggedIn, logout } = useUser();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const profilePic = user?.profilePic || '/no-profile-pic.png'; // Default image if none provided
    const handleLogout = async () => {
        await logout(); // Wait for logout to complete
        navigate('/login', { replace: true }); // Ensure you navigate after logout
        setSidebarOpen(false); // Optionally close the sidebar if open
    };

    if (!isLoggedIn) {
        return (
            <div className="header">
                <div className="logo" onClick={() => navigate('/')}>
                    <img src="/logo1.png" alt="EduHab - Educational Habit" />
                </div>
            </div>
        );
    }

    return (
        <div className="header">
            <div className="menu-icon" onClick={toggleSidebar}>
                <span>☰</span>
            </div>
            <div className="logo" onClick={() => navigate('/')}>
                <img src="/logo2.png" alt="EduHab - Educational Habit" />
            </div>
            <div className="user-info" onClick={() => navigate('/profile')}>
                <img src={profilePic} alt="User" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                <span>{user?.username || 'Guest'}</span>
            </div>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <ul>
                    <li onClick={() => navigate('/profile')}>Profile</li>
                    <li onClick={handleLogout}>Logout</li>
                </ul>
            </div>
        </div>
    );
}

export default Header;
