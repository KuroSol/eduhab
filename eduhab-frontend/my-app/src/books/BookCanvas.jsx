// src/books/BookCanvas.js
import React, { useEffect, useRef, useState } from 'react';
import './BookCanvas.css'; // Import CSS for additional styling

const BookCanvas = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [pathData, setPathData] = useState('');
  const [htmlContent, setHtmlContent] = useState(''); // Define state for HTML content

  useEffect(() => {
    // Fetch the HTML content from the backend
    fetch('https://eduhab.com/media/interactivebooks/html/d2f90da9-0ef6-4b8f-8e87-2af541dfbcb8-check-d9729044-3d1a-4b98-a6b4-aeff56537ede/d2f90da9-0ef6-4b8f-8e87-2af541dfbcb8-check-d9729044-3d1a-4b98-a6b4-aeff56537ede.html')
      .then(response => response.text())
      .then(data => {
        setHtmlContent(data);
      })
      .catch(error => {
        console.error('Error fetching HTML content:', error);
      });
  }, []);

  const startDrawing = (e) => {
    if (!drawing) return;
    const point = getRelativePoint(e);
    setPathData(`M ${point.x} ${point.y}`);
  };

  const draw = (e) => {
    if (!drawing) return;
    const point = getRelativePoint(e);
    setPathData((prev) => `${prev} L ${point.x} ${point.y}`);
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const getRelativePoint = (e) => {
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM().inverse();
    return point.matrixTransform(ctm);
  };

  const toggleDrawingMode = () => {
    setDrawing((prev) => !prev);
  };

  return (
    <div style={{ position: 'relative', textAlign: 'center', marginBottom: '40px' }}>
      <h1>Interactive Book Canvas</h1>
      <button onClick={toggleDrawingMode} className="drawing-button">
        {drawing ? 'Disable Drawing' : 'Enable Drawing'}
      </button>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          margin: '0 auto',
          width: '800px',
          height: '600px', // Set a fixed height for the content area
          overflow: 'auto', // Enable scrolling if content overflows
          backgroundColor: '#f0f0f0',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} style={{ position: 'relative', zIndex: 1 }} />
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        >
          <path d={pathData} stroke="black" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export default BookCanvas;
