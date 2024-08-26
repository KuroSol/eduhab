import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './HTMLViewer.css';

function HTMLViewer() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const bookId = queryParams.get('bookId');
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([]);
    const [content, setContent] = useState('');
    const [activeTool, setActiveTool] = useState(null);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isToolbarOpen, setIsToolbarOpen] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const svgRef = useRef(null);
    const contentContainerRef = useRef(null);
    const toolbarRef = useRef(null);
    const isDrawing = useRef(false);
    const pathData = useRef([]);
    const [toolbarPosition, setToolbarPosition] = useState({ top: '20px', left: '0px' });
    const apiUrl = process.env.REACT_APP_API_URL;

    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    useEffect(() => {
        const apiURL = `${apiUrl}/api/interactivebooks/interactivebooks/${bookId}/list-html-pages/`;
        if (bookId) {
            fetch(apiURL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const filteredPages = data.pages.filter(page => page.includes('_page_'));
                setPages(filteredPages);
                setCurrentPage(0);
                if (filteredPages.length > 0) {
                    fetchPage(filteredPages[0]);
                }
            })
            .catch(error => console.error('Error fetching pages:', error));
        }
    }, [bookId, apiUrl]);

    const fetchPage = (pageUrl) => {
        fetch(pageUrl)
            .then(response => response.text())
            .then(data => setContent(data))
            .catch(error => console.error('Error fetching HTML content:', error));
    };

    const handlePageChange = (direction) => {
        setCurrentPage(prevPage => {
            let newPage = prevPage;
            if (direction === 'next' && prevPage < pages.length - 1) {
                newPage = prevPage + 1;
            } else if (direction === 'prev' && prevPage > 0) {
                newPage = prevPage - 1;
            }
            fetchPage(pages[newPage]);
            return newPage;
        });
    };

    const startDrawing = (event) => {
        if (activeTool !== 'pen') return;
        isDrawing.current = true;
        const point = getSVGPoint(event);
        pathData.current.push(`M${point.x},${point.y}`);
        updatePaths();
    };

    const draw = (event) => {
        if (!isDrawing.current) return;
        const point = getSVGPoint(event);
        const currentPath = pathData.current[pathData.current.length - 1];
        pathData.current[pathData.current.length - 1] = currentPath + ` L${point.x},${point.y}`;
        updatePaths();
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
    };

    const handleEraserClick = (index) => {
        if (activeTool === 'eraser') {
            pathData.current.splice(index, 1);
            updatePaths();
        }
    };

    const updatePaths = () => {
        if (!showAnnotations) return;
        const svg = svgRef.current;
        svg.innerHTML = '';
        pathData.current.forEach((d, index) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', d);
            path.setAttribute('stroke', 'blue');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('class', 'drawable-path');
            if (activeTool === 'eraser') {
                path.style.cursor = 'pointer';
                path.addEventListener('click', () => handleEraserClick(index));
            }
            svg.appendChild(path);
        });
    };

    const getSVGPoint = (event) => {
        const svg = svgRef.current;
        const point = svg.createSVGPoint();
        const { clientX, clientY } = event.touches ? event.touches[0] : event;
        point.x = clientX;
        point.y = clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
    };

    const applyHighlight = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            document.designMode = "on";
            document.execCommand("BackColor", false, "yellow");
            document.designMode = "off";
            selection.removeAllRanges();
        }
    };

    const removeHighlight = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            document.designMode = "on";
            document.execCommand("removeFormat", false, null);
            document.designMode = "off";
            selection.removeAllRanges();
        }
    };

    const handleModeChange = (mode) => {
        setActiveTool(prevTool => (prevTool === mode ? null : mode));
        updatePaths();
    };

    const toggleFullscreen = () => {
        const htmlViewerContainer = document.getElementById('htmlViewerContainer');
        const contentContainer = contentContainerRef.current;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (htmlViewerContainer.requestFullscreen) {
                htmlViewerContainer.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else if (htmlViewerContainer.webkitRequestFullscreen) { /* Safari */
                htmlViewerContainer.webkitRequestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            }
            setIsFullscreen(true);
            contentContainer.classList.add('fullscreen');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            }
            setIsFullscreen(false);
            contentContainer.classList.remove('fullscreen');
        }
    };

    const handleMobileFullscreen = () => {
        const contentContainer = contentContainerRef.current;
        contentContainer.classList.add('fullscreen');
        setIsFullscreen(true);
    };

    // Check if the device is mobile
    useEffect(() => {
        if (/Mobi|Android/i.test(navigator.userAgent) || isiOS) {
            handleMobileFullscreen();
        } else {
            toggleFullscreen();
        }
    }, []);

    const confirmExitBook = () => {
        if (window.confirm("Do you want to exit the book?")) {
            navigate('/enrolled-books');
        }
    };

    const toggleToolbar = () => {
        setIsToolbarOpen(prevState => !prevState);
    };

    const startDragging = (e) => {
        if (isToolbarOpen) {
            const toolbar = toolbarRef.current;
            toolbar.dragStartY = e.clientY || e.touches[0].clientY;
            toolbar.dragStartTop = toolbar.offsetTop;
            document.addEventListener('mousemove', dragToolbar);
            document.addEventListener('mouseup', stopDragging);
            document.addEventListener('touchmove', dragToolbar);
            document.addEventListener('touchend', stopDragging);
        }
    };

    const dragToolbar = (e) => {
        const toolbar = toolbarRef.current;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const newTop = toolbar.dragStartTop + (clientY - toolbar.dragStartY);
        toolbar.style.top = `${newTop}px`;
    };

    const stopDragging = () => {
        const toolbar = toolbarRef.current;
        setToolbarPosition({ top: toolbar.style.top, left: toolbar.style.left });
        document.removeEventListener('mousemove', dragToolbar);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('touchmove', dragToolbar);
        document.removeEventListener('touchend', stopDragging);
    };

    const zoomIn = () => {
        setZoomLevel(prevZoomLevel => Math.min(prevZoomLevel + 0.1, 2)); // Limit zoom in to 2x
    };

    const zoomOut = () => {
        setZoomLevel(prevZoomLevel => Math.max(prevZoomLevel - 0.1, 0.5)); // Limit zoom out to 0.5x
    };

    useEffect(() => {
        if (showAnnotations) {
            updatePaths();
        } else {
            if (svgRef.current) {
                svgRef.current.innerHTML = '';
            }
        }
    }, [showAnnotations, activeTool]);

    useEffect(() => {
        const contentContainer = contentContainerRef.current;
        if (activeTool === 'pen') {
            contentContainer.style.touchAction = 'none'; // Disable scrolling
        } else {
            contentContainer.style.touchAction = 'auto'; // Enable scrolling
        }
    }, [activeTool]);

    useEffect(() => {
        const adjustContentForMobile = () => {
            const container = document.querySelector('.content-container');
            if (window.innerWidth < 768) {
                container.style.padding = '10px'; // Add padding for better readability on small devices
                container.style.height = 'calc(100vh - 60px)'; // Adjust height
            } else {
                container.style.padding = '20px';
                container.style.height = 'calc(100vh - 100px)'; // Adjust height based on toolbar height
            }
        };

        window.addEventListener('resize', adjustContentForMobile);
        adjustContentForMobile(); // Call on initial render

        return () => window.removeEventListener('resize', adjustContentForMobile);
    }, []);

    return (
        <div id="htmlViewerContainer">
            <div
                className={`toolbar ${isToolbarOpen ? 'open' : 'closed'}`}
                ref={toolbarRef}
                style={{ ...toolbarPosition, left: isToolbarOpen ? '0px' : 'calc(-100% + 40px)' }} // Adjusted left position
                onMouseDown={startDragging}
                onTouchStart={startDragging}
            >
                <div className="toolbar-toggle" onClick={toggleToolbar}>
                    {isToolbarOpen ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-up"></i>}
                </div>
                {isToolbarOpen && (
                    <div className="button-container">
                        <button
                            className={activeTool === 'highlight' ? 'active' : ''}
                            onClick={() => handleModeChange('highlight')}
                        >
                            <i className="fas fa-highlighter"></i>
                        </button>
                        <button
                            className={activeTool === 'removeHighlight' ? 'active' : ''}
                            onClick={() => handleModeChange('removeHighlight')}
                        >
                            <i className="fas fa-paint-brush"></i>
                        </button>
                        <button onClick={() => setShowAnnotations(!showAnnotations)}>
                            <i className={showAnnotations ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                        </button>
                        <button
                            className={activeTool === 'pen' ? 'active' : ''}
                            onClick={() => handleModeChange('pen')}
                        >
                            <i className="fas fa-pen"></i>
                        </button>
                        <button
                            className={activeTool === 'eraser' ? 'active' : ''}
                            onClick={() => handleModeChange('eraser')}
                        >
                            <i className="fas fa-eraser"></i>
                        </button>
                        <button onClick={zoomIn}>
                            <i className="fas fa-search-plus"></i>
                        </button>
                        <button onClick={zoomIn}>
                        <i className="fas fa-search-plus"></i>
                    </button>
                    <button onClick={zoomOut}>
                        <i className="fas fa-search-minus"></i>
                    </button>
                    <button onClick={toggleFullscreen}>
                        <i className={isFullscreen ? 'fas fa-compress' : 'fas fa-expand'}></i>
                    </button>
                    <button onClick={confirmExitBook}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            )}
        </div>
        <div className="pagination-container">
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 0}>
                <i className="fas fa-chevron-left"></i>
            </button>
            <span>Page {currentPage + 1} of {pages.length}</span>
            <button onClick={() => handlePageChange('next')} disabled={currentPage === pages.length - 1}>
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
        <div
            className={`content-container ${activeTool === 'highlight' || activeTool === 'removeHighlight' ? 'highlight-active remove-highlight-active' : ''}`}
            ref={contentContainerRef}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            onMouseUp={() => {
                if (activeTool === 'highlight') applyHighlight();
                if (activeTool === 'removeHighlight') removeHighlight();
            }}
            onTouchEnd={() => {
                if (activeTool === 'highlight') applyHighlight();
                if (activeTool === 'removeHighlight') removeHighlight();
            }}
            onContextMenu={(e) => e.preventDefault()} // Prevent right-click context menu
            onDragStart={(e) => e.preventDefault()} // Prevent dragging
        >
            <div id="pf1" style={{ position: 'relative' }}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
                {showAnnotations && (
                    <svg
                        ref={svgRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: activeTool === 'pen' || activeTool === 'eraser' ? 'auto' : 'none'
                        }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                )}
            </div>
        </div>
    </div>
  );
}

export default HTMLViewer;

                    
