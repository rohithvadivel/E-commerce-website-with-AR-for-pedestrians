import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Camera, Smartphone, Move, ZoomIn, ZoomOut, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const ModelViewer = ({ modelSrc, posterSrc, productTitle, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeMode, setActiveMode] = useState('rotate'); // 'rotate', 'move', 'zoom'
    const modelRef = useRef(null);

    // Camera control state
    const [orbitAngle, setOrbitAngle] = useState(0);
    const [tiltAngle, setTiltAngle] = useState(75);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Apply camera changes
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.cameraOrbit = `${orbitAngle}deg ${tiltAngle}deg ${zoomLevel}%`;
            modelRef.current.cameraTarget = `${panX}m ${panY}m 0m`;
        }
    }, [orbitAngle, tiltAngle, zoomLevel, panX, panY]);

    // Control functions
    const rotateLeft = () => setOrbitAngle(prev => prev - 30);
    const rotateRight = () => setOrbitAngle(prev => prev + 30);
    const tiltUp = () => setTiltAngle(prev => Math.max(30, prev - 15));
    const tiltDown = () => setTiltAngle(prev => Math.min(120, prev + 15));
    const zoomIn = () => setZoomLevel(prev => Math.max(50, prev - 15));
    const zoomOut = () => setZoomLevel(prev => Math.min(200, prev + 15));
    const moveUp = () => setPanY(prev => prev + 0.1);
    const moveDown = () => setPanY(prev => prev - 0.1);
    const moveLeft = () => setPanX(prev => prev - 0.1);
    const moveRight = () => setPanX(prev => prev + 0.1);
    const resetView = () => {
        setOrbitAngle(0);
        setTiltAngle(75);
        setZoomLevel(100);
        setPanX(0);
        setPanY(0);
        if (modelRef.current) {
            modelRef.current.cameraOrbit = 'auto auto auto';
            modelRef.current.cameraTarget = 'auto auto auto';
        }
    };

    const ControlButton = ({ onClick, children, active = false, size = 'normal' }) => (
        <button
            onClick={onClick}
            style={{
                backgroundColor: active ? '#4f46e5' : 'rgba(255,255,255,0.15)',
                color: 'white',
                border: 'none',
                borderRadius: size === 'small' ? '8px' : '12px',
                width: size === 'small' ? 40 : 48,
                height: size === 'small' ? 40 : 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: active ? '0 4px 15px rgba(79, 70, 229, 0.4)' : 'none'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = active ? '#4338ca' : 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = active ? '#4f46e5' : 'rgba(255,255,255,0.15)'}
        >
            {children}
        </button>
    );

    const ModeButton = ({ mode, icon: Icon, label }) => (
        <button
            onClick={() => setActiveMode(mode)}
            style={{
                backgroundColor: activeMode === mode ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: activeMode === mode ? '2px solid #4f46e5' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.85rem',
                fontWeight: '500'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

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
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    {productTitle || '3D Preview'}
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* 3D Viewer */}
            <div style={{ flex: 1, position: 'relative' }}>
                <model-viewer
                    ref={modelRef}
                    src={modelSrc}
                    poster={posterSrc}
                    alt={productTitle}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ar-placement="floor"
                    ar-scale="fixed"
                    camera-controls
                    touch-action="none"
                    interaction-prompt="none"
                    shadow-intensity="1.5"
                    shadow-softness="0.8"
                    environment-image="neutral"
                    exposure="1"
                    loading="eager"
                    reveal="auto"
                    onLoad={() => setIsLoading(false)}
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1a1a2e'
                    }}
                >
                    {/* Custom AR Button */}
                    <button
                        slot="ar-button"
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '30px',
                            padding: '14px 28px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 30px rgba(79, 70, 229, 0.5)',
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        <Camera size={20} />
                        📍 Place in Your Room
                    </button>

                    {/* Loading indicator */}
                    <div slot="progress-bar" style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            height: '100%',
                            backgroundColor: '#4f46e5',
                            width: '0%',
                            transition: 'width 0.3s'
                        }} />
                    </div>

                    {/* Poster for loading state */}
                    <div slot="poster" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: '#1a1a2e'
                    }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>
                            <div style={{
                                width: 50,
                                height: 50,
                                border: '3px solid rgba(255,255,255,0.1)',
                                borderTop: '3px solid #4f46e5',
                                borderRadius: '50%',
                                margin: '0 auto 16px',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <p>Loading 3D Model...</p>
                        </div>
                    </div>
                </model-viewer>

                {/* Right Side Control Panel */}
                <div style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '16px',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Rotate Controls */}
                    {activeMode === 'rotate' && (
                        <>
                            <ControlButton onClick={tiltUp}>
                                <ArrowUp size={20} />
                            </ControlButton>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <ControlButton onClick={rotateLeft}>
                                    <RotateCcw size={20} />
                                </ControlButton>
                                <ControlButton onClick={rotateRight}>
                                    <RotateCw size={20} />
                                </ControlButton>
                            </div>
                            <ControlButton onClick={tiltDown}>
                                <ArrowDown size={20} />
                            </ControlButton>
                        </>
                    )}

                    {/* Move Controls */}
                    {activeMode === 'move' && (
                        <>
                            <ControlButton onClick={moveUp}>
                                <ArrowUp size={20} />
                            </ControlButton>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <ControlButton onClick={moveLeft}>
                                    <ArrowLeft size={20} />
                                </ControlButton>
                                <ControlButton onClick={moveRight}>
                                    <ArrowRight size={20} />
                                </ControlButton>
                            </div>
                            <ControlButton onClick={moveDown}>
                                <ArrowDown size={20} />
                            </ControlButton>
                        </>
                    )}

                    {/* Zoom Controls */}
                    {activeMode === 'zoom' && (
                        <>
                            <ControlButton onClick={zoomIn}>
                                <ZoomIn size={20} />
                            </ControlButton>
                            <ControlButton onClick={zoomOut}>
                                <ZoomOut size={20} />
                            </ControlButton>
                        </>
                    )}

                    {/* Reset Button */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', marginTop: '4px' }}>
                        <ControlButton onClick={resetView}>
                            <RefreshCw size={18} />
                        </ControlButton>
                    </div>
                </div>

                {/* Mobile hint */}
                {isMobile && (
                    <div style={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(79, 70, 229, 0.9)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Move size={14} />
                        Use buttons on right to control
                    </div>
                )}

                {/* Desktop hint */}
                {!isMobile && (
                    <div style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: 'rgba(251, 191, 36, 0.9)',
                        color: '#1a1a2e',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Smartphone size={18} />
                        <span><strong>AR:</strong> Open on mobile for room placement</span>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar - Mode Switcher */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Mode Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                }}>
                    <ModeButton mode="rotate" icon={RotateCw} label="Rotate" />
                    <ModeButton mode="move" icon={Move} label="Move" />
                    <ModeButton mode="zoom" icon={ZoomIn} label="Zoom" />
                </div>

                {/* Instructions */}
                <div style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem'
                }}>
                    Select a mode and use the control buttons on the right → or drag on the model
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.05); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ModelViewer;
