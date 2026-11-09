import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ZUGZWANG_FEN, parseFen, squareToPosition } from './chessPosition';
import { buildAllGeometries, ACCESSORIES } from './chessPieceGeometry';
import './ChessBoard3D.css';

/* One placed piece: lathe body + (for the knight) an extruded head +
   any accessory primitives (rook merlons, queen crown, king cross, bishop ball). */
function Piece({ type, position, geometries, material }) {
    const bodyGeo = type === 'knight' ? geometries.knightBody : geometries[type];
    return (
        <group position={position}>
            <mesh geometry={bodyGeo} material={material} />
            {type === 'knight' && (
                <mesh geometry={geometries.knightHead} material={material} position={[0, 0.28, 0]} />
            )}
            {ACCESSORIES[type].map((a, i) => (
                <mesh key={i} material={material} position={a.pos}>
                    {a.shape === 'box'
                        ? <boxGeometry args={a.args} />
                        : <sphereGeometry args={a.args} />}
                </mesh>
            ))}
        </group>
    );
}

function Pieces() {
    const geometries = useMemo(() => buildAllGeometries(), []);
    /* Gold-black brass set: "white" pieces become polished brass-gold,
       "black" pieces become dark oxidised bronze — matching board.png.
       Higher metalness + a faint emissive keeps the gold reading as metal
       (and never going fully black) under the scene's directional lights. */
    const goldMat = useMemo(
        () => new THREE.MeshStandardMaterial({
            color: '#E6B845', metalness: 0.75, roughness: 0.3,
            emissive: '#3a2807', emissiveIntensity: 0.35,
        }),
        []
    );
    const darkMat = useMemo(
        () => new THREE.MeshStandardMaterial({
            color: '#1a1610', metalness: 0.65, roughness: 0.42,
            emissive: '#0a0805', emissiveIntensity: 0.2,
        }),
        []
    );
    const placements = useMemo(() => parseFen(ZUGZWANG_FEN), []);

    return placements.map((p, i) => {
        const { x, z } = squareToPosition(p.file, p.rank);
        return (
            <Piece
                key={i}
                type={p.type}
                position={[x, 0, z]}
                geometries={geometries}
                material={p.color === 'white' ? goldMat : darkMat}
            />
        );
    });
}

function Board() {
    /* Gold (brass) light squares, true-black dark squares, antique-brass
       frame — the gold-black template from board.png. */
    const lightMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#C9A22E', metalness: 0.7, roughness: 0.36,
        emissive: '#241901', emissiveIntensity: 0.28,
    }), []);
    const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0c0c0c', metalness: 0.4, roughness: 0.5,
    }), []);
    const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#9c6f17', metalness: 0.8, roughness: 0.34,
        emissive: '#241803', emissiveIntensity: 0.3,
    }), []);

    const tiles = [];
    for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
            const { x, z } = squareToPosition(file, rank);
            const isLight = (file + rank) % 2 === 1; // a1 (0,0) dark, h1 (7,0) light
            tiles.push(
                <mesh key={`${file}-${rank}`} position={[x, -0.075, z]} material={isLight ? lightMat : darkMat}>
                    <boxGeometry args={[1, 0.15, 1]} />
                </mesh>
            );
        }
    }

    return (
        <group>
            {tiles}
            {/* Beveled frame slab slightly larger than the 8×8 grid. */}
            <mesh position={[0, -0.18, 0]} material={frameMat}>
                <boxGeometry args={[8.7, 0.22, 8.7]} />
            </mesh>
        </group>
    );
}

/* Board + pieces in a group that slowly spins, plus desktop drag controls.
   Auto-spin pauses while the user is dragging and resumes when idle. */
function Scene({ reduced, coarse }) {
    const spinRef = useRef(null);
    const draggingRef = useRef(false);

    useFrame((_, delta) => {
        if (reduced || draggingRef.current || !spinRef.current) return;
        spinRef.current.rotation.y += delta * 0.35;
    });

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.5} color="#fff4d6" />
            <directionalLight position={[-6, 5, -4]} intensity={0.7} color="#ffe9bf" />
            {/* Warm front fill so the brass faces stay lit as the board spins. */}
            <directionalLight position={[0, 4, 9]} intensity={0.55} color="#ffdfa0" />
            <group ref={spinRef}>
                <Board />
                <Pieces />
            </group>
            {!coarse && (
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableDamping
                    dampingFactor={0.08}
                    autoRotate={false}
                    minPolarAngle={0.6}
                    maxPolarAngle={1.35}
                    onStart={() => { draggingRef.current = true; }}
                    onEnd={() => { draggingRef.current = false; }}
                />
            )}
        </>
    );
}

/* Decorative — aria-hidden. Pauses all rendering when scrolled off-screen. */
export default function ChessBoard3D() {
    const wrapRef = useRef(null);
    const [active, setActive] = useState(false);

    const reduced = useMemo(
        () => false,
        []
    );
    const coarse = useMemo(
        () => typeof window !== 'undefined'
            && window.matchMedia('(pointer: coarse)').matches,
        []
    );

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return undefined;
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => setActive(e.isIntersecting)),
            { threshold: 0.05 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const pointerStart = useRef(null);

    const goToChess = () =>
        window.open('https://www.chess.com', '_blank', 'noopener,noreferrer');

    /* Distinguish a click (navigate) from a drag (rotate the board via
       OrbitControls): only navigate when the pointer barely moved. */
    const handlePointerDown = (e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
    };
    const handlePointerUp = (e) => {
        const start = pointerStart.current;
        pointerStart.current = null;
        if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) {
            goToChess();
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToChess();
        }
    };

    return (
        <div
            ref={wrapRef}
            className="edu-chess"
            role="link"
            tabIndex={0}
            aria-label="Play me on Chess.com (opens in a new tab)"
            title="Play me on Chess.com ↗"
            data-magnetic
            data-no-shine
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
        >
            <Canvas
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                /* Pulled back along the same viewing angle so the board's full
                   diagonal stays inside the frame through every rotation — no
                   corners clipped by the canvas edge. */
                camera={{ position: [0, 15, 18.5], fov: 35 }}
                frameloop={active ? 'always' : 'never'}
                style={{ background: 'transparent', overflow: 'visible' }}
            >
                <Suspense fallback={null}>
                    <Scene reduced={reduced} coarse={coarse} />
                </Suspense>
            </Canvas>
        </div>
    );
}
