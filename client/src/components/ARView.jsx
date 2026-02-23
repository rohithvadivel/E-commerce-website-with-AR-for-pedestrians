import { useState, useRef, useEffect } from 'react';
import { X, Move, Camera, RefreshCw } from 'lucide-react';

const ARView = ({ imageSrc, onClose }) => {
    const [status, setStatus] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [facingMode, setFacingMode] = useState("user");
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const artRef = useRef(null);

    const startCamera = async () => {
        setStatus('loading');
        setErrorMsg('');

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Check if camera API is available (requires HTTPS on mobile)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            // Check if we're on HTTP (not HTTPS) and not localhost
            const isSecure = window.location.protocol === 'https:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (!isSecure) {
                setErrorMsg('Camera requires HTTPS. Using preview mode instead.');
            } else {
                setErrorMsg('Camera not supported on this device.');
            }
            setStatus('no-camera');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadeddata = () => {
                    setStatus('ready');
                };
            }
        } catch (err) {
            console.error("Camera error:", err);
            setErrorMsg(err.message || 'Failed to access camera');
            setStatus('no-camera');
        }
    };

    useEffect(() => {
        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [facingMode]);

    // Mouse/Touch drag handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, dragStart]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    const handleClose = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            backgroundColor: '#000',
            overflow: 'hidden'
        }}>
            {/* Close Button */}
            <button
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100000,
                    cursor: 'pointer',
                    border: 'none'
                }}
            >
                <X size={24} />
            </button>

            {/* Camera Toggle */}
            <button
                onClick={toggleCamera}
                style={{
                    position: 'fixed',
                    top: 20,
                    left: 20,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100000,
                    cursor: 'pointer',
                    border: 'none'
                }}
            >
                <RefreshCw size={20} />
            </button>

            {/* Loading */}
            {status === 'loading' && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    textAlign: 'center',
                    zIndex: 100000
                }}>
                    <Camera size={48} />
                    <p style={{ marginTop: 16 }}>Starting camera...</p>
                </div>
            )}

            {/* No Camera - Fallback Mode with Static Room Background */}
            {status === 'no-camera' && (
                <>
                    {/* Static Room Background */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 1
                    }} />

                    {/* Info Banner */}
                    <div style={{
                        position: 'fixed',
                        top: 80,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: 12,
                        fontSize: 14,
                        textAlign: 'center',
                        zIndex: 100000,
                        maxWidth: '90%'
                    }}>
                        📷 Camera unavailable over HTTP<br />
                        <span style={{ opacity: 0.7, fontSize: 12 }}>Preview mode - drag the art to position</span>
                    </div>
                </>
            )}

            {/* Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    zIndex: 1
                }}
            />

            {/* Draggable Art - Custom implementation */}
            {(status === 'ready' || status === 'no-camera') && (
                <div
                    ref={artRef}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        width: 280,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        zIndex: 50000,
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                        userSelect: 'none',
                        touchAction: 'none'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: -40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none'
                    }}>
                        <Move size={14} /> Drag to position
                    </div>
                    <img
                        src={imageSrc}
                        alt="Art"
                        style={{
                            width: '100%',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            border: '4px solid white',
                            borderRadius: 4,
                            pointerEvents: 'none'
                        }}
                        draggable={false}
                    />
                </div>
            )}

            {/* Instructions */}
            {(status === 'ready' || status === 'no-camera') && (
                <div style={{
                    position: 'fixed',
                    bottom: 40,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 50000,
                    pointerEvents: 'none'
                }}>
                    <span style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: 30,
                        fontSize: 16
                    }}>
                        Point at your wall & drag the art
                    </span>
                </div>
            )}
        </div>
    );
};

export default ARView;
