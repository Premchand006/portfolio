import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import EarthShaders from './EarthShaders';
import { loading } from '../config';
import './EarthShaders.css';

const EarthShadersCanvas = ({ glitching = false, scrollProgress = 0, onReady, paused = false }) => {
    const [isReady, setIsReady] = useState(false);

    /* Track the site theme live: dark shows the night-lights hemisphere,
       light lerps the shader to the sunlit day texture (uBlend handles the
       crossfade in EarthShaders) under a daytime-sky backdrop. */
    const [isDark, setIsDark] = useState(() =>
        typeof document === 'undefined' ||
        document.documentElement.getAttribute('data-theme') !== 'light'
    );
    useEffect(() => {
        const root = document.documentElement;
        const sync = () => setIsDark(root.getAttribute('data-theme') !== 'light');
        const mo = new MutationObserver(sync);
        mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        return () => mo.disconnect();
    }, []);

    return (
        <div className="earth-shaders">
            {!isReady && (
                <div className="earth-loader">
                    <div className="earth-loader__text">{loading.earthText}</div>
                    <div className="earth-loader__bar">
                        <div className="earth-loader__bar-fill"></div>
                    </div>
                </div>
            )}

            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ background: 'transparent' }}
                onCreated={() => { setIsReady(true); onReady?.(); }}
                gl={{ antialias: true, alpha: true }}
                /* Stop the GPU render loop while it's hidden behind the
                   timeline overlay — keeps that page smooth. */
                frameloop={paused ? 'never' : 'always'}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[5, 3, 5]} intensity={1.5} />
                    <EarthShaders isDarkMode={isDark} glitching={glitching} scrollProgress={scrollProgress} />
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        enableRotate={true}
                        rotateSpeed={0.5}
                        autoRotate={false}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default EarthShadersCanvas;
