import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure this path matches the location of your App.js or App.jsx file
import './index.css'; // Optional, if you have global styles defined

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
