import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function NotesList() {
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {
        fetchNotes('https://eduhab.com/api/notes/');
    }, []);

    async function fetchNotes(url) {
        const token = localStorage.getItem('token');
 
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            setNotes(data.results);
            setNextPage(data.next);
            setPrevPage(data.previous);
        } else {
            console.error('Failed to fetch notes');
        }
    }

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripHtml(note.content).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddNote = () => {
        navigate('/notes/new');
    };

    return (
        <div className="container">
            <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            <button className="button" onClick={handleAddNote}>Add New Note</button>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Content Preview</th>
                        <th>Date Created</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredNotes.map(note => (
                        <tr key={note.id} onClick={() => navigate(`/notes/edit/${note.id}`)}>
                            <td>{note.title}</td>
                            <td>{stripHtml(note.content).slice(0, 100)}...</td>
                            <td>{new Date(note.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {prevPage && <button onClick={() => fetchNotes(prevPage)}>Previous</button>}
                {nextPage && <button onClick={() => fetchNotes(nextPage)}>Next</button>}
            </div>
        </div>
    );
}

export default NotesList;
