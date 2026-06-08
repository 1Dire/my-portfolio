import { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLaptopScreenTexture } from "@/hooks/useLaptopScreenTexture";
import { useCalendarTexture } from "@/hooks/useCalendarTexture";

const CROSSFADE_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const CROSSFADE_FRAG = `
  uniform sampler2D mapDay;
  uniform sampler2D mapNight;
  uniform float mixRatio;
  varying vec2 vUv;
  void main() {
    vec4 day   = texture2D(mapDay,   vUv);
    vec4 night = texture2D(mapNight, vUv);
    gl_FragColor = mix(day, night, mixRatio);
    #include <colorspace_fragment>
  }
`;

function makeCrossfadeMat(sharedUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: sharedUniforms,
    vertexShader:   CROSSFADE_VERT,
    fragmentShader: CROSSFADE_FRAG,
  });
}

export function Room({ controls, onLaptopClick, onGameboyClick, onToggleDayNight, playingGame, gbTexture, gbApi, dayNight = "day", introPlaying = false }) {
  const { scene } = useGLTF("/models/room.glb");
  const { gl }    = useThree();

  const materialsRef    = useRef({});
  const calendarMeshRef = useRef(null);
  const uniformsListRef = useRef([]);

  const laptopMeshes  = useRef([]);
  const hovered       = useRef(false);
  const gameboyMeshes = useRef([]);
  const gbHovered     = useRef(false);

  const laptopScreenTexture = useLaptopScreenTexture();
  const calendarTexture     = useCalendarTexture();

  const mixRatioRef  = useRef(dayNight === "night" ? 1.0 : 0.0);
  const mixTargetRef = useRef(dayNight === "night" ? 1.0 : 0.0);

  useEffect(() => {
    mixTargetRef.current = dayNight === "night" ? 1.0 : 0.0;
  }, [dayNight]);

  useEffect(() => () => { document.body.style.cursor = "default"; }, []);

  const playingRef     = useRef(playingGame);
  useEffect(() => { playingRef.current = playingGame; }, [playingGame]);

  const introPlayingRef = useRef(introPlaying);
  useEffect(() => { introPlayingRef.current = introPlaying; }, [introPlaying]);

  const lastMoveRef = useRef(0);

  const {
    // 베젤
    bezelColor, bezelRoughness, bezelMetalness = 0.0,
    // 달력
    calendarOffsetX = 0, calendarOffsetY = 0, calendarOffsetZ = 0,
    calendarNightColor = "#4a4a5a",
    // 전구
    lampColor = "#ffe4b0",
    lampEmissiveIntensity = 3.0,
    lampOpacityNight = 0.5,
    lampOpacityDay = 0.25,
    // 노트북 화면 빛번짐
    laptopGlowIntensityDay = 0.3,
    laptopGlowIntensityNight = 1.2,
    // 게임보이 화면 빛번짐
    gbGlowIntensityDay = 0.2,
    gbGlowIntensityNight = 0.8,
    // 크로스페이드 속도
    crossfadeSpeed = 0.001,
  } = controls;

  const [floorDay, tableDay, tableObjDay, wallDay, wallObjDay] = useTexture([
    "/textures/room/day/floor.webp",
    "/textures/room/day/table.webp",
    "/textures/room/day/table_object.webp",
    "/textures/room/day/wallpaper.webp",
    "/textures/room/day/wall_object.webp",
  ]);
  const [floorNight, tableNight, tableObjNight, wallNight, wallObjNight] = useTexture([
    "/textures/room/night/floor.webp",
    "/textures/room/night/table.webp",
    "/textures/room/night/table_object.webp",
    "/textures/room/night/wallpaper.webp",
    "/textures/room/night/wall_object.webp",
  ]);

  // 텍스처 설정 + GPU 선업로드 (최초 1회)
  useEffect(() => {
    [floorDay, tableDay, tableObjDay, wallDay, wallObjDay,
     floorNight, tableNight, tableObjNight, wallNight, wallObjNight].forEach((t) => {
      t.flipY       = false;
      t.colorSpace  = THREE.SRGBColorSpace;
      t.minFilter   = THREE.LinearFilter;
      t.needsUpdate = true;
      gl.initTexture(t);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 머티리얼 생성 (최초 1회)
  useEffect(() => {
    const r = mixRatioRef.current;
    const u = (day, night) => ({ mapDay: { value: day }, mapNight: { value: night }, mixRatio: { value: r } });

    const uFloor    = u(floorDay,    floorNight);
    const uWall     = u(wallDay,     wallNight);
    const uWallObj  = u(wallObjDay,  wallObjNight);
    const uTable    = u(tableDay,    tableNight);
    const uTableObj = u(tableObjDay, tableObjNight);

    uniformsListRef.current = [uFloor, uWall, uWallObj, uTable, uTableObj];

    const mats = {
      바닥_Baked:       makeCrossfadeMat(uFloor),
      벽지_Baked:       makeCrossfadeMat(uWall),
      TodoList_Baked:   makeCrossfadeMat(uWallObj),
      책상_Baked:       makeCrossfadeMat(uTable),
      스탠드_Baked:     makeCrossfadeMat(uTableObj),
      컵_Baked:         makeCrossfadeMat(uTableObj),
      게임기몸통_Baked:  makeCrossfadeMat(uTableObj),
      노트북_Baked:     makeCrossfadeMat(uTableObj),
      책상소품_Baked:   makeCrossfadeMat(uTableObj),
      전구:             new THREE.MeshPhysicalMaterial({
                          color: "#ffffff",
                          emissive: new THREE.Color("#000000"),
                          emissiveIntensity: 0,
                          transmission: 0.95,
                          thickness: 0.05,
                          roughness: 0.0,
                          metalness: 0.0,
                          ior: 1.5,
                          transparent: true,
                          opacity: 0.25,
                          toneMapped: false,
                        }),
      배경:             new THREE.MeshBasicMaterial({ color: "#c8dff0" }), // 창문 배경
      달력앞면:         new THREE.MeshBasicMaterial({ map: calendarTexture, toneMapped: false }),
      게임기화면:       new THREE.MeshBasicMaterial({ map: gbTexture, toneMapped: false }),
      게임기화면근처:   new THREE.MeshStandardMaterial({ envMapIntensity: 0.3 }),
      노트북화면:       new THREE.MeshBasicMaterial({ map: laptopScreenTexture, toneMapped: false, side: THREE.DoubleSide }),
    };

    materialsRef.current = mats;

    const GAMEBOY   = ["게임기화면", "게임기몸통_Baked", "게임기화면근처"];
    const CLICKABLE = ["노트북히트박스", "게임보이히트박스", "게임기화면근처", "스탠드_Baked", "전구"];
    const collected   = [];
    const gbCollected = [];

    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mat = mats[child.name];
      if (mat) child.material = mat;
      if (child.name === "노트북히트박스" || child.name === "게임보이히트박스")
        child.material = new THREE.MeshBasicMaterial({ visible: false });
      if (!CLICKABLE.includes(child.name)) child.raycast = () => null;
      if (child.name === "달력앞면") calendarMeshRef.current = child;
      if (child.name === "노트북화면" || child.name === "노트북_Baked")
        collected.push({ mesh: child, baseScale: child.scale.clone() });
      if (GAMEBOY.includes(child.name))
        gbCollected.push({ mesh: child, baseScale: child.scale.clone() });
    });

    laptopMeshes.current  = collected;
    gameboyMeshes.current = gbCollected;

    return () => {
      Object.entries(mats).forEach(([key, m]) => {
        if (key === "노트북화면" || key === "달력앞면") m.map = null;
        m.dispose();
      });
    };
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  // gbTexture 교체
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.게임기화면) return;
    m.게임기화면.map = gbTexture;
    m.게임기화면.needsUpdate = true;
  }, [gbTexture]);

  // 훅 텍스처 연결
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.노트북화면 || !laptopScreenTexture) return;
    m.노트북화면.map = laptopScreenTexture;
    m.노트북화면.needsUpdate = true;
  }, [laptopScreenTexture]);

  useEffect(() => {
    const m = materialsRef.current;
    if (!m.달력앞면 || !calendarTexture) return;
    m.달력앞면.map = calendarTexture;
    m.달력앞면.needsUpdate = true;
  }, [calendarTexture]);

  // 달력 야간 색상
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.달력앞면) return;
    m.달력앞면.color.set(dayNight === "night" ? calendarNightColor : "#ffffff");
  }, [dayNight, calendarNightColor]);

  // 창문 배경 낮/밤 색상
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.배경) return;
    m.배경.color.set(dayNight === "night" ? "#0a0f1a" : "#c8dff0");
  }, [dayNight]);

  // 달력 position 오프셋
  useEffect(() => {
    const mesh = calendarMeshRef.current;
    if (!mesh) return;
    if (!mesh.userData.basePosition) mesh.userData.basePosition = mesh.position.clone();
    const base = mesh.userData.basePosition;
    mesh.position.set(base.x + calendarOffsetX, base.y + calendarOffsetY, base.z + calendarOffsetZ);
  }, [calendarOffsetX, calendarOffsetY, calendarOffsetZ]);

  // 베젤 재질
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.게임기화면근처) return;
    m.게임기화면근처.color.set(bezelColor);
    m.게임기화면근처.roughness = bezelRoughness;
    m.게임기화면근처.metalness = bezelMetalness;
  }, [bezelColor, bezelRoughness, bezelMetalness]);

  // 전구 발광 (야간에만)
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.전구) return;
    const isNight = dayNight === "night";
    m.전구.emissive.set(isNight ? lampColor : "#000000");
    m.전구.emissiveIntensity = isNight ? lampEmissiveIntensity : 0;
    m.전구.opacity = isNight ? lampOpacityNight : lampOpacityDay;
    m.전구.needsUpdate = true;
  }, [dayNight, lampColor, lampEmissiveIntensity, lampOpacityNight, lampOpacityDay]);

  useFrame((_, delta) => {
    // 크로스페이드 lerp
    const cur    = mixRatioRef.current;
    const target = mixTargetRef.current;
    if (Math.abs(cur - target) > 0.001) {
      const next = cur + (target - cur) * (1 - Math.pow(crossfadeSpeed, delta));
      mixRatioRef.current = next;
      uniformsListRef.current.forEach((u) => { u.mixRatio.value = next; });
    }

    // 호버 스케일
    const lerp    = 1 - Math.pow(0.005, delta);
    const focused = playingRef.current;
    const animate = (list, isHovered) => {
      if (!list.length) return;
      const st = (isHovered && !focused) ? 1.05 : 1.0;
      for (const { mesh, baseScale } of list) {
        const c = mesh.scale.x / baseScale.x;
        if (Math.abs(c - st) < 0.0001) {
          if (c !== st) mesh.scale.set(baseScale.x * st, baseScale.y * st, baseScale.z * st);
          continue;
        }
        const n = c + (st - c) * lerp;
        mesh.scale.set(baseScale.x * n, baseScale.y * n, baseScale.z * n);
      }
    };
    animate(laptopMeshes.current,  hovered.current);
    animate(gameboyMeshes.current, gbHovered.current);
  });

  const isLaptop  = (n) => n === "노트북히트박스";
  const isGameboy = (n) => n === "게임보이히트박스" || n === "게임기화면근처";

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        if (introPlayingRef.current) return; // 인트로 중 클릭 비활성
        e.stopPropagation();
        const n = e.object.name;
        if (isLaptop(n)) {
          onLaptopClick?.();
        } else if (isGameboy(n)) {
          if (playingRef.current) gbApi.press();
          else onGameboyClick?.();
        } else if (n === "스탠드_Baked" || n === "전구") {
          onToggleDayNight?.();
        }
      }}
      onPointerMove={(e) => {
        const now = performance.now();
        if (now - lastMoveRef.current < 50) return;
        lastMoveRef.current = now;
        if (e.object.name === "게임기화면" && playingRef.current && e.uv)
          gbApi.hoverAt({ x: e.uv.x, y: e.uv.y });
      }}
      onPointerOver={(e) => {
        if (introPlayingRef.current) return; // 인트로 중 호버 비활성
        const n = e.object.name;
        if (isLaptop(n))       { e.stopPropagation(); document.body.style.cursor = "pointer"; hovered.current = true; }
        else if (isGameboy(n)) { e.stopPropagation(); document.body.style.cursor = "pointer"; gbHovered.current = true; }
        else if (n === "스탠드_Baked" || n === "전구") { e.stopPropagation(); document.body.style.cursor = "pointer"; }
      }}
      onPointerOut={(e) => {
        const n = e.object.name;
        if (isLaptop(n))       { document.body.style.cursor = "default"; hovered.current = false; }
        else if (isGameboy(n)) { document.body.style.cursor = "default"; gbHovered.current = false; }
        else if (n === "스탠드_Baked" || n === "전구") { document.body.style.cursor = "default"; }
      }}
    />
  );
}

useGLTF.preload("/models/room.glb");