import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EnrolledBooks.css';

function EnrolledBooks() {
    const [enrolledBooks, setEnrolledBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEnrolledBooks() {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication error. Please log in again.");
                setLoading(false);
                return;
            }

            const response = await fetch('https://eduhab.com/api/interactivebooks/enrollments/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Received data:", data);
                setEnrolledBooks(data.results);
                setLoading(false);
            } else {
                console.error('Failed to fetch enrolled books:', response.statusText);
                setError(`Failed to fetch enrolled books: ${response.statusText}`);
                setLoading(false);
            }
        }

        fetchEnrolledBooks();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container">
            <h2>Your Enrolled Books</h2>
            <div className="books-grid">
                {enrolledBooks.length > 0 ? enrolledBooks.map((enrollment, index) => {
                    console.log(`Enrollment ${index}:`, enrollment); // Log each enrollment to check structure
                    return (
                        <div key={enrollment.book.id} className="book-item">
                            <img src={enrollment.book_details.cover_image} alt={enrollment.book_details.title} className="book-cover" />
                            <h3>{enrollment.book_details.title}</h3>
                            <p>Author: {enrollment.book_details.author}</p>
                            <Link to={`/books/view/pdf?pdfUrl=${encodeURIComponent(enrollment.book_details.pdf_file)}`} className="button">
                                View PDF
                            </Link>
                            <Link to={`/books/view/html?bookId=${enrollment.book}`} className="button">View HTML</Link>

                            <Link to="/books/view/epub" className="button">View EPUB</Link>
                        </div>
                    );
                }) : <p>You have no enrolled books.</p>}
            </div>
        </div>
    );
}

export default EnrolledBooks;
