import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadBook() {
    const [file, setFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [title, setTitle] = useState('');
    const [isbn, setIsbn] = useState('');
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [language, setLanguage] = useState('');
    const [price, setPrice] = useState('');
    const navigate = useNavigate();

    const getCsrfToken = () => {
        const cookieValue = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue;
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleImageChange = (event) => {
        setCoverImage(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("No PDF file selected!");
            return;
        }

        const formData = new FormData();
        formData.append('pdf_file', file);
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }
        formData.append('title', title);
        formData.append('isbn', isbn);
        formData.append('category', category);
        formData.append('author', author);
        formData.append('publisher', publisher);
        formData.append('language', language);
        formData.append('price', price);

        try {
            const response = await fetch('https://eduhab.com/api/interactivebooks/interactivebooks/', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    'X-CSRFToken': getCsrfToken()
                },
            });

            if (response.ok) {
                alert("Book uploaded and conversion initiated!");
                navigate('/profile');
            } else {
                const errorText = await response.text();
                console.error('Failed to upload book:', errorText);
                alert('Failed to upload book: ' + errorText);
            }
        } catch (error) {
            console.error('Error during book upload:', error);
            alert('Error during book upload: ' + error.message);
        }
    };

    return (
        <div className="upload-container">
            <h1>Upload Your Book</h1>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input type="text" placeholder="ISBN" value={isbn} onChange={e => setIsbn(e.target.value)} />
            <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
            <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} />
            <input type="text" placeholder="Publisher" value={publisher} onChange={e => setPublisher(e.target.value)} />
            <input type="text" placeholder="Language" value={language} onChange={e => setLanguage(e.target.value)} />
            <input type="text" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
            <label htmlFor="pdfFile">Select Book File (PDF):</label>
            <input type="file" id="pdfFile" onChange={handleFileChange} />
            <label htmlFor="coverImage">Select Book Cover Image:</label>
            <input type="file" id="coverImage" onChange={handleImageChange} />
            <button onClick={handleUpload}>Upload Book</button>
        </div>
    );
}

export default UploadBook;
