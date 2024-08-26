import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import PasswordResetRequest from './PasswordResetRequest'; // Make sure this is the component where users request password reset
import PasswordResetForm from './PasswordResetForm'; // Make sure this is the component where users set their new password
import { UserProvider } from './UserContext';
import Profile from './Profile';
import NoteForm from './notes/NoteForm';
import NotesList from './notes/NotesList';
import UploadBook from './books/UploadBook'; // Adjusted import path
import Header from './Header';
import NoteEditor from './notes/NoteEditor';
import './App.css';
import 'tailwindcss/tailwind.css';
import './index.css'
import PrivacyPolicy from './PrivacyPolicy';
import BooksList from './books/BooksList'; // Import the BooksList component
import EnrolledBooks from './books/EnrolledBooks'; // Make sure this matches the actual file name and location
import PDFViewer from './books/PDFViewer'; 
import HTMLViewer from './books/HTMLViewer';
import EPUBViewer from './books/EPUBViewer';
import BookCanvas from './books/BookCanvas'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <UserProvider>
            <Router>
                <div>
                    <Header />
                    <Routes>
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/notes" element={<NotesList />} />
                        <Route path="/notes/new" element={<NoteForm />} />
                        <Route path="/notes/edit/:noteId" element={<NoteEditor />} />
                        <Route path="/password-reset" element={<PasswordResetRequest />} />
                        {/* Ensure that the path here matches the link you're sending in your password reset emails */}
                        <Route path="/reset-password/:uid/:token" element={<PasswordResetForm />} />
                        <Route path="/books" element={<BooksList />} /> {/* New route for BooksList */}
                        <Route path="/enrolled-books" element={<EnrolledBooks />} /> {/* Corrected route for EnrolledBooks */}
                        <Route path="/books/view/pdf" element={<PDFViewer />} />
                        <Route path="/books/view/html" element={<HTMLViewer />} />
                        <Route path="/books/canvas" element={<BookCanvas />} /> 
                        <Route path="/books/view/epub" element={<EPUBViewer />} />
                        <Route path="/books/upload" element={<UploadBook />} /> {/* Updated route path */}
                        <Route path="/" element={<Navigate replace to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;
