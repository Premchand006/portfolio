import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { assets } from '../config';

/* ────────────────────────────────────────────────────────────
   VERTEX SHADER — passes UV + world normal for atmosphere hack
   ──────────────────────────────────────────────────────────── */
const earthVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
uniform float uGlitch;
uniform float uTime;

// Simplex-inspired cheap hash
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vUv    = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // When glitching, jitter vertex positions slightly
    if (uGlitch > 0.0) {
        float band = floor(uv.y * 18.0);
        float jitter = hash(vec2(band, floor(uTime * 24.0)));
        float magnitude = uGlitch * 0.06;
        if (jitter > 0.72) {
            pos.x += (hash(vec2(band * 2.0, uTime)) - 0.5) * magnitude;
        }
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

/* ────────────────────────────────────────────────────────────
   FRAGMENT SHADER — day/night blend + glitch pass
   ──────────────────────────────────────────────────────────── */
const earthFragmentShader = `
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform float     uBlend;
uniform float     uGlitch;   // 0→1 glitch intensity
uniform float     uTime;

varying vec2  vUv;
varying vec3  vNormal;

// --- noise utils ---
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
    );
}

void main() {
    vec2 uv = vUv;

    // -- Glitch UV distortion --
    if (uGlitch > 0.0) {
        float t      = uTime;
        float scanY  = floor(uv.y * 22.0) / 22.0;
        float rng    = hash(vec2(scanY, floor(t * 18.0)));

        // Horizontal scan-band shift
        if (rng > 0.68) {
            float shift = (rng - 0.68) * uGlitch * 0.12;
            uv.x = fract(uv.x + shift * sign(rng - 0.84));
        }

        // Block tear
        float block  = hash(vec2(floor(uv.x * 8.0), floor(t * 10.0)));
        if (block > 0.88) {
            uv.y = fract(uv.y + (block - 0.88) * uGlitch * 0.18);
        }
    }

    // -- Chromatic aberration (RGB split) --
    float aberr = uGlitch * 0.012;
    vec4 colR = texture2D(uDayTexture, uv + vec2( aberr, 0.0));
    vec4 colG = texture2D(uDayTexture, uv);
    vec4 colB = texture2D(uDayTexture, uv - vec2( aberr, 0.0));

    vec3 dayColor = vec3(colR.r, colG.g, colB.b);

    vec3 nightColR = texture2D(uNightTexture, uv + vec2( aberr * 0.5, 0.0)).rgb;
    vec3 nightColB = texture2D(uNightTexture, uv - vec2( aberr * 0.5, 0.0)).rgb;
    vec3 nightColor = vec3(nightColR.r, texture2D(uNightTexture, uv).g, nightColB.b);

    vec3 color = mix(dayColor, nightColor, uBlend);

    // -- Glitch overlay: scanline flicker + color invert bands --
    if (uGlitch > 0.0) {
        float scan = sin(uv.y * 280.0 + uTime * 60.0) * 0.5 + 0.5;
        color = mix(color, color * (0.75 + scan * 0.5), uGlitch * 0.35);

        // Invert a random band
        float invBand = hash(vec2(floor(uv.y * 14.0), floor(uTime * 8.0)));
        if (invBand > 0.9 && uGlitch > 0.6) {
            color = 1.0 - color;
        }

        // Red bleed tint
        color.r = mix(color.r, min(color.r * 1.6, 1.0), uGlitch * 0.4);

        // Overall desaturation at peak glitch
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, vec3(lum), uGlitch * 0.25);
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;

/* ────────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────────── */
const EarthShaders = ({ isDarkMode = true, glitching = false, scrollProgress = 0 }) => {
    const earthRef = useRef();
    const atmosphereRef = useRef();

    const [dayTexture, nightTexture] = useTexture([
        assets.earthMap,
        assets.earthLights,
    ]);

    if (dayTexture) {
        dayTexture.colorSpace = THREE.SRGBColorSpace;
        dayTexture.anisotropy = 8;
    }
    if (nightTexture) {
        nightTexture.colorSpace = THREE.SRGBColorSpace;
        nightTexture.anisotropy = 8;
    }

    const shaderMaterial = useRef(
        new THREE.ShaderMaterial({
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
            uniforms: {
                uDayTexture: { value: null },
                uNightTexture: { value: null },
                uBlend: { value: 1.0 },
                uGlitch: { value: 0.0 },
                uTime: { value: 0.0 },
            },
        })
    ).current;

    useEffect(() => {
        if (dayTexture) shaderMaterial.uniforms.uDayTexture.value = dayTexture;
        if (nightTexture) shaderMaterial.uniforms.uNightTexture.value = nightTexture;
    }, [dayTexture, nightTexture, shaderMaterial]);

    useFrame((state, delta) => {
        // Rotate Earth
        if (earthRef.current) earthRef.current.rotation.y += 0.001;
        if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.001;

        // Time uniform (for shader noise animation)
        shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

        // Blend day/night
        const blendTarget = isDarkMode ? 1.0 : 0.0;
        const current = shaderMaterial.uniforms.uBlend.value;
        if (Math.abs(blendTarget - current) > 0.001) {
            shaderMaterial.uniforms.uBlend.value = THREE.MathUtils.lerp(current, blendTarget, delta * 0.5);
        }

        // Animate glitch intensity — ramp up fast, ramp down slower
        const glitchTarget = glitching ? 1.0 : 0.0;
        const glitchCurrent = shaderMaterial.uniforms.uGlitch.value;
        const glitchSpeed = glitching ? delta * 8.0 : delta * 3.0;
        if (Math.abs(glitchTarget - glitchCurrent) > 0.001) {
            shaderMaterial.uniforms.uGlitch.value = THREE.MathUtils.lerp(glitchCurrent, glitchTarget, glitchSpeed);
        }

        // Add occasional spike when at full glitch for that jittery feel
        if (glitching && Math.random() < 0.05) {
            shaderMaterial.uniforms.uGlitch.value = Math.min(shaderMaterial.uniforms.uGlitch.value + 0.15, 1.0);
        }

        // Scroll-jack: scale globe down + tilt forward as user scrolls past hero
        const targetScale = Math.max(0.25, 1 - scrollProgress * 0.7);
        if (earthRef.current) {
            earthRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.06);
            earthRef.current.rotation.x = THREE.MathUtils.lerp(
                earthRef.current.rotation.x,
                scrollProgress * 0.8,
                0.05
            );
        }
        if (atmosphereRef.current) {
            atmosphereRef.current.scale.lerp({ x: targetScale * 1.02, y: targetScale * 1.02, z: targetScale * 1.02 }, 0.06);
            atmosphereRef.current.rotation.x = earthRef.current?.rotation.x ?? 0;
        }
    });

    return (
        <group>
            {/* Earth */}
            <mesh ref={earthRef} position={[0, 0, 0]} material={shaderMaterial}>
                <sphereGeometry args={[2, 64, 64]} />
            </mesh>

            {/* Atmosphere glow */}
            <mesh ref={atmosphereRef} position={[0, 0, 0]} scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color={glitching ? '#ff2222' : (isDarkMode ? '#2244aa' : '#88bbff')}
                    transparent
                    opacity={glitching ? 0.22 : 0.12}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
};

export default EarthShaders;
