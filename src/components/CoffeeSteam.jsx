import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 커피잔 위로 올라가는 김(steam) 셰이더 - 소프트 김.
 * 대부분의 파라미터를 props로 받아 leva 디버그에서 실시간 제어 가능.
 */
export function CoffeeSteam({
  position = [0, 0, 0],
  scale = [0.11, 0.22, 1],
  speed = 0.18,
  opacity = 0.85,
  color = "#fffaf2",
  sway = 0.08,        // 좌우 일렁임 폭
  contrastLow = 0.35, // 노이즈 대비 하한 (낮을수록 김 많아짐)
  contrastHigh = 0.85,// 노이즈 대비 상한
  noiseScale = 3.0,   // 노이즈 촘촘함
}) {
  const matRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
      uSway: { value: sway },
      uContrastLow: { value: contrastLow },
      uContrastHigh: { value: contrastHigh },
      uNoiseScale: { value: noiseScale },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // props 바뀌면 uniform 갱신 (leva 실시간 반영)
  useFrame((_, delta) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value += delta;
    m.uniforms.uSpeed.value = speed;
    m.uniforms.uOpacity.value = opacity;
    m.uniforms.uColor.value.set(color);
    m.uniforms.uSway.value = sway;
    m.uniforms.uContrastLow.value = contrastLow;
    m.uniforms.uContrastHigh.value = contrastHigh;
    m.uniforms.uNoiseScale.value = noiseScale;
  });

  return (
    <mesh position={position} scale={scale} renderOrder={10}>
      <planeGeometry args={[1, 1, 16, 16]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSway;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float s = sin(uv.y * 6.0 + uTime * 1.5) * uSway * uv.y;
    pos.x += s;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOpacity;
  uniform vec3  uColor;
  uniform float uContrastLow;
  uniform float uContrastHigh;
  uniform float uNoiseScale;
  varying vec2 vUv;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 np = vec2(uv.x * uNoiseScale, uv.y * 4.0 - uTime * uSpeed * 6.0);
    float n = fbm(np) * 0.5 + 0.5;
    n = smoothstep(uContrastLow, uContrastHigh, n);

    float edgeX = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x);
    float fadeY = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.5, uv.y);

    float alpha = n * edgeX * fadeY * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;