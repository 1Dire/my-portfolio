import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarParticles({
  visible = true,
  count = 80, size = 0.3, speed = 1.0, opacity = 1.0,
  rangeX = 1.2, rangeY = 0.6, rangeZ = 0.9,
  centerX = -0.8, centerY = 1.1, centerZ = -1.1,
}) {
  const pointsRef = useRef();

  const geometry = useMemo(() => {
    const positions  = new Float32Array(count * 3);
    const phases     = new Float32Array(count);
    const speeds     = new Float32Array(count);
    const amplitudes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = centerX + (Math.random() - 0.5) * rangeX;
      positions[i * 3 + 1] = centerY + (Math.random() - 0.5) * rangeY;
      positions[i * 3 + 2] = centerZ + (Math.random() - 0.5) * rangeZ;
      phases[i]     = Math.random() * Math.PI * 2;
      speeds[i]     = 0.3 + Math.random() * 0.7;
      amplitudes[i] = 0.3 + Math.random() * 0.7;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position",   new THREE.BufferAttribute(positions,  3));
    geo.setAttribute("aPhase",     new THREE.BufferAttribute(phases,     1));
    geo.setAttribute("aSpeed",     new THREE.BufferAttribute(speeds,     1));
    geo.setAttribute("aAmplitude", new THREE.BufferAttribute(amplitudes, 1));
    return geo;
  }, [count, centerX, centerY, centerZ, rangeX, rangeY, rangeZ]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:    { value: 0 },
      uVisible: { value: 1.0 },
      uSize:    { value: size },
      uSpeed:   { value: speed },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aSpeed;
      attribute float aAmplitude;
      uniform float uTime;
      uniform float uVisible;
      uniform float uSize;
      uniform float uSpeed;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        pos.y += sin(uTime * aSpeed * 0.5 * uSpeed + aPhase) * 0.02;
        pos.x += cos(uTime * aSpeed * 0.3 * uSpeed + aPhase) * 0.015;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float twinkle = sin(uTime * aSpeed * uSpeed + aPhase) * 0.5 + 0.5;
        vAlpha = mix(1.0 - aAmplitude, 1.0, twinkle) * uVisible * uOpacity;
        // 거리 보정 최소화 + 최대 크기 제한으로 원근 왜곡 억제
        float baseSize = uSize * 0.5 + twinkle * 0.3;
        float distFactor = clamp(30.0 / -mvPosition.z, 0.5, 1.5);
        gl_PointSize = baseSize * distFactor;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float dist = length(uv);
        if (dist > 0.5) discard;
        float glow = pow(1.0 - smoothstep(0.0, 0.5, dist), 1.5);
        vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 1.0, 0.95), glow);
        gl_FragColor = vec4(color, glow * vAlpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    material.uniforms.uTime.value    = clock.getElapsedTime();
    material.uniforms.uSize.value    = size;
    material.uniforms.uSpeed.value   = speed;
    material.uniforms.uOpacity.value = opacity;
    const target = visible ? 1.0 : 0.0;
    const cur    = material.uniforms.uVisible.value;
    if (Math.abs(cur - target) > 0.001)
      material.uniforms.uVisible.value += (target - cur) * 0.05;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}