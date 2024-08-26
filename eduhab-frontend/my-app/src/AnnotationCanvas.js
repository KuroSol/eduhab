import React, { useEffect, useRef } from 'react';
import { Canvas, PencilBrush } from 'fabric';

const AnnotationCanvas = ({ width, height, annotations, setAnnotations, mode }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = new Canvas(canvasRef.current, {
                isDrawingMode: (mode === 'annotate')
            });
            canvas.setWidth(width);
            canvas.setHeight(height);

            // Set up the pencil tool
            const pencil = new PencilBrush(canvas);
            pencil.color = 'black';  // Default color for pencil
            pencil.width = 3;        // Default size for pencil

            // Set up the eraser tool
            const eraser = new PencilBrush(canvas);
            eraser.color = 'white';  // Color matching the canvas background for erasing
            eraser.width = 10;       // Typically larger to cover more area

            // Event handler for when a path (drawing or erasing) is created
            const addAnnotation = (event) => {
                const path = event.path;
                setAnnotations(prevAnnotations => [...prevAnnotations, path]);
            };

            canvas.on('path:created', addAnnotation);

            // Switching tools based on the current mode
            if (mode === 'pencil') {
                canvas.freeDrawingBrush = pencil;
            } else if (mode === 'eraser') {
                canvas.freeDrawingBrush = eraser;
            }

            return () => {
                canvas.off('path:created', addAnnotation);
                canvas.dispose();
            };
        }
    }, [width, height, setAnnotations, mode]);

    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: mode === 'annotate' ? 'all' : 'none', zIndex: 10 }} />;
};

export default AnnotationCanvas;
