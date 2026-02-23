import { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const ARViewWithControls = ({ modelSrc, productTitle, onClose }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState('');

    // Model transform state
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);

    // Start camera on mount
    useEffect(() => {
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setCameraError('Camera not supported');
                    return;
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setCameraReady(true);
                }
            } catch (err) {
                console.log('Camera error:', err);
                setCameraError('Camera access denied');
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Control functions
    const moveUp = () => setPosY(p => p - 25);
    const moveDown = () => setPosY(p => p + 25);
    const moveLeft = () => setPosX(p => p - 25);
    const moveRight = () => setPosX(p => p + 25);
    const rotateL = () => setRotation(r => r - 15);
    const rotateR = () => setRotation(r => r + 15);
    const bigger = () => setScale(s => Math.min(2.5, s + 0.15));
    const smaller = () => setScale(s => Math.max(0.3, s - 0.15));
    const resetAll = () => { setPosX(0); setPosY(0); setRotation(0); setScale(1); };

    const handleClose = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    // Button Component
    const Btn = ({ onClick, children }) => (
        <button onClick={onClick} style={{
            background: 'rgba(255,255,255,0.3)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        }}>
            {children}
        </button>
    );

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            overflow: 'hidden'
        }}>
            {/* Camera Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: cameraReady ? 1 : 0
                }}
            />

            {/* Close Button */}
            <button onClick={handleClose} style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                cursor: 'pointer'
            }}>
                <X size={22} />
            </button>

            {/* Status message */}
            {cameraError && (
                <div style={{
                    position: 'absolute',
                    top: 70,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(251,191,36,0.9)',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 13,
                    zIndex: 10000
                }}>
                    {cameraError} - Preview mode
                </div>
            )}

            {/* 3D Model */}
            <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: 260,
                height: 260,
                transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) rotate(${rotation}deg) scale(${scale})`,
                zIndex: 5000
            }}>
                <model-viewer
                    src={modelSrc}
                    alt={productTitle || '3D Model'}
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent'
                    }}
                />
            </div>

            {/* Left Controls - Move */}
            <div style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                padding: 10,
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                zIndex: 10000
            }}>
                <div style={{ color: '#fff', fontSize: 11, textAlign: 'center' }}>Move</div>
                <Btn onClick={moveUp}><ArrowUp size={18} /></Btn>
                <div style={{ display: 'flex', gap: 6 }}>
                    <Btn onClick={moveLeft}><ArrowLeft size={18} /></Btn>
                    <Btn onClick={moveRight}><ArrowRight size={18} /></Btn>
                </div>
                <Btn onClick={moveDown}><ArrowDown size={18} /></Btn>
            </div>

            {/* Right Controls - Rotate & Size */}
            <div style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                padding: 10,
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                zIndex: 10000
            }}>
                <div style={{ color: '#fff', fontSize: 11, textAlign: 'center' }}>Rotate</div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <Btn onClick={rotateL}><RotateCcw size={18} /></Btn>
                    <Btn onClick={rotateR}><RotateCw size={18} /></Btn>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 6, paddingTop: 8 }}>
                    <div style={{ color: '#fff', fontSize: 11, textAlign: 'center', marginBottom: 6 }}>Size</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Btn onClick={smaller}><ZoomOut size={18} /></Btn>
                        <Btn onClick={bigger}><ZoomIn size={18} /></Btn>
                    </div>
                </div>
            </div>

            {/* Bottom Reset */}
            <button onClick={resetAll} style={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 25,
                padding: '12px 24px',
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 10000,
                cursor: 'pointer'
            }}>
                <RefreshCw size={18} />
                Reset
            </button>

            {/* Instruction */}
            {!cameraError && (
                <div style={{
                    position: 'absolute',
                    top: 70,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 13,
                    zIndex: 10000
                }}>
                    Use buttons to position the model
                </div>
            )}
        </div>
    );
};

export default ARViewWithControls;
