import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [profile, setProfile] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProfile() {
            const response = await fetch('https://eduhab.com/api/accounts/profile/', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            } else {
                console.error('Failed to fetch profile');
                navigate('/login');
            }
        }
        fetchProfile();
    }, []);

    const handleGoToNotes = () => {
        navigate('/notes');
    };

    const handleUploadBook = () => {
        navigate('/books/upload'); // This will redirect to the Upload Book form
    };

    const handleViewEnrolledBooks = () => {
        navigate('/enrolled-books'); // This should match the route you set for EnrolledBooks in your Router
    };

    const goToBooks = () => {
        navigate('/books'); // Redirect to the BooksList page
    };

    // Debugging user types and check for "Author"
    const isAuthor = profile.user_types?.some(type => type.name === 'author');

    return (
        <div className="container">
            <div className="profile-header">
                <h1>This is Your Page, {profile.username}</h1>
            </div>
            <div className="profile-content">
                <p><strong>ID:</strong> {profile.id}</p>
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>User type:</strong> {profile.user_types?.map(type => type.name).join(', ')}</p>
                <p><strong>Registration Date:</strong> {profile.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'Invalid Date'}</p>
                <button className="button" onClick={handleGoToNotes}>View Notes</button>
                {isAuthor && <button className="button" onClick={handleUploadBook}>Add Your Books</button>}
                <button className="button" onClick={goToBooks}>Explore Books</button> {/* Button to redirect to BooksList */}
                <button className="button" onClick={handleViewEnrolledBooks}>View Enrolled Books</button> {/* New button to view enrolled books */}
                <button className="button">Edit Profile</button>
            </div>
        </div>
    );
}

export default Profile;
