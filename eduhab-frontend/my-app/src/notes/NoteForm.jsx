import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NoteForm.css';

// Function to fetch CSRF token from cookies
function getCsrfToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

function NoteForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEditorChange = (contentValue) => {
        setContent(contentValue);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const note = { title, content };
        const csrfToken = getCsrfToken();  // Ensure this function call is included

        try {
            const response = await fetch('https://eduhab.com/api/notes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken  // Using CSRF token here
                },
                credentials: 'include',
                body: JSON.stringify(note)
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            setTitle('');
            setContent('');
            navigate('/notes'); // Navigate back to notes list after submission
        } catch (error) {
            setError('Error creating note');
            console.error(error);
        }
    };

    return (
        <div className="container profile-content">
            <form onSubmit={handleSubmit}>
                <label>
                    Title:
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                </label>
                <label>
                    Content:
                    <ReactQuill theme="snow" value={content} onChange={handleEditorChange} />
                </label>
                <button className="button" type="submit">Submit Note</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}

export default NoteForm;
