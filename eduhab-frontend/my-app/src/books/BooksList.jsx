import React, { useState, useEffect } from 'react';
import './BookList.css';
import { useUser } from '../UserContext'; // Make sure the path is correct

function BooksList() {
    const [books, setBooks] = useState([]);
    const [enrolledBooks, setEnrolledBooks] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, isLoggedIn } = useUser();

    useEffect(() => {
        if (!isLoggedIn) {
            setError('Please log in to view books.');
            setLoading(false);
        } else {
            fetchBooks();
        }
    }, [isLoggedIn]);

    const fetchBooks = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication token is missing.");
            return;
        }
        const response = await fetch('https://eduhab.com/api/interactivebooks/interactivebooks/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            setBooks(data.results);
            setLoading(false);
        } else {
            setError(`Failed to fetch books: ${response.statusText}`);
            setLoading(false);
        }
    };

    const handleEnroll = async (bookId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication issue. Please log in again.");
            return;
        }
    
        const csrfToken = getCsrfToken();
        const response = await fetch('https://eduhab.com/api/interactivebooks/enrollments/enroll/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`, // Use the consistent source for token
                'X-CSRFToken': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({ book: bookId })
        });
    
        if (response.ok) {
            setEnrolledBooks(new Set([...enrolledBooks, bookId]));
            alert("You have successfully enrolled in the book!");
        } else {
            const errorData = await response.json();
            console.log('Error Data:', errorData); // Log the entire response to see what's included
            // Change here: Check if the error message is about already enrolled and handle it.
            if(response.status === 409) {
                alert("You are already enrolled in this book."); // Showing an alert directly
            } else {
                setError(`Failed to enroll in the book: ${errorData.detail || 'No detail provided'}`);
                alert(`Failed to enroll in the book: ${errorData.detail || 'No detail provided'}`); // Optionally show an alert as well
            }
        }
    };

    // Function to get CSRF token from cookies
    function getCsrfToken() {
        const value = `; ${document.cookie}`;
        const parts = value.split('; csrftoken=');
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    if (loading) return <div>Loading books...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container">
            <h2 className="text-center">Explore Books</h2>
            <div className="books-grid">
                {books.length > 0 ? books.map(book => (
                    <div key={book.id} className="book-item">
                        <img src={book.cover_image} alt={book.title} className="book-cover" />
                        <h3>{book.title}</h3>
                        <p>Author: {book.author}</p>
                        <button onClick={() => handleEnroll(book.id)}>
                            {enrolledBooks.has(book.id) ? 'Enrolled' : 'Enroll in Book'}
                        </button>
                    </div>
                )) : <p>No books found.</p>}
            </div>
        </div>
    );
}

export default BooksList;
