import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { useParams, useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css'; // Ensure the Quill styles are imported if not already

// Function to fetch CSRF token from cookies
function getCsrfToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

function NoteEditor() {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState({ title: '', content: '' });

    useEffect(() => {
        async function fetchNote() {
            const token = localStorage.getItem('token');  // Make sure your token retrieval logic is correct
            const response = await fetch(`https://eduhab.com/api/notes/${noteId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNote({
                    title: data.title,
                    content: data.content
                });
            } else {
                console.error('Failed to fetch note');
                // Handle failure here, e.g., redirect or show an error message
            }
        }
        fetchNote();
    }, [noteId]);

    const saveNote = async () => {
        const token = localStorage.getItem('token');
        const csrfToken = getCsrfToken();
        const response = await fetch(`https://eduhab.com/api/notes/${noteId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken // Include CSRF token
            },
            body: JSON.stringify(note)
        });
        if (response.ok) {
            navigate('/notes'); // Redirect back to the notes list after saving
        } else {
            const errorData = await response.json();
            console.error('Failed to update note:', errorData);
            // Optionally display an error message to the user
        }
    };

    return (
        <div>
            <input 
                type="text" 
                value={note.title || ''} // Provide a fallback for controlled component
                onChange={(e) => setNote(prevNote => ({ ...prevNote, title: e.target.value }))}
                placeholder="Title"
            />
            <ReactQuill 
                theme="snow"
                value={note.content || ''} // Provide a fallback for controlled component
                onChange={(content) => setNote(prevNote => ({ ...prevNote, content }))}
            />
            <button onClick={saveNote}>Save Note</button>
        </div>
    );
}

export default NoteEditor;
