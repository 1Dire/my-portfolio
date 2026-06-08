import { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLaptopScreenTexture } from "@/hooks/useLaptopScreenTexture";
import { useCalendarTexture } from "@/hooks/useCalendarTexture";

/**
 * onBeforeCompile로 night 텍스처 mix를 기존 머티리얼에 주입.
 * MeshBasicMaterial → map 색상에 mix
 * MeshStandardMaterial → diffuseColor에 mix
 * HDR/조명 영향 그대로 유지.
 */
function injectCrossfade(mat, nightTex, isStandard = false) {
  mat.userData.shader = null;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.mapNight = { value: nightTex };
    shader.uniforms.mixRatio = { value: 0.0 };

    // fragment shader 상단에 uniform 선언 추가
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `uniform sampler2D mapNight;
uniform float mixRatio;
void main() {`
    );

    if (isStandard) {
      // MeshStandardMaterial: diffuseColor 계산 직후 mix
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
{
  vec4 nightSample = texture2D(mapNight, vMapUv);
  diffuseColor = mix(diffuseColor, nightSample, mixRatio);
}`
      );
    } else {
      // MeshBasicMaterial: gl_FragColor 직전에 mix
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
{
  vec4 nightSample = texture2D(mapNight, vMapUv);
  diffuseColor = mix(diffuseColor, nightSample, mixRatio);
}`
      );
    }

    mat.userData.shader = shader;
  };

  // needsUpdate 없이 uniform만 바꾸면 됨
  mat.getMixRatio = () => mat.userData.shader?.uniforms.mixRatio.value ?? 0;
  mat.setMixRatio = (v) => {
    if (mat.userData.shader) mat.userData.shader.uniforms.mixRatio.value = v;
  };
  mat.setNightTex = (tex) => {
    if (mat.userData.shader) mat.userData.shader.uniforms.mapNight.value = tex;
  };

  return mat;
}

export function Room({ controls, onLaptopClick, onGameboyClick, playingGame, gbTexture, gbApi, dayNight = "day" }) {
  const { scene } = useGLTF("/models/room.glb");
  const { gl, camera } = useThree(); // shader 강제 컴파일용
  const materialsRef = useRef({});
  const calendarMeshRef = useRef(null);
  const crossfadeMatsRef = useRef([]); // injectCrossfade된 머티리얼 목록

  const laptopMeshes = useRef([]);
  const hovered = useRef(false);
  const gameboyMeshes = useRef([]);
  const gbHovered = useRef(false);

  const laptopScreenTexture = useLaptopScreenTexture();
  const calendarTexture = useCalendarTexture();

  // 크로스페이드 ratio (0=day, 1=night)
  const mixRatioRef  = useRef(dayNight === "night" ? 1.0 : 0.0);
  const mixTargetRef = useRef(dayNight === "night" ? 1.0 : 0.0);

  useEffect(() => {
    mixTargetRef.current = dayNight === "night" ? 1.0 : 0.0;
  }, [dayNight]);

  useEffect(() => {
    return () => { document.body.style.cursor = "default"; };
  }, []);

  const playingRef = useRef(playingGame);
  useEffect(() => { playingRef.current = playingGame; }, [playingGame]);

  const lastMoveRef = useRef(0);

  const {
    gameRoughness, gameMetalness,
    laptopRoughness, laptopMetalness,
    deskObjRoughness, deskObjMetalness,
    screenColor, screenRoughness, screenOpacity,
    bezelColor, bezelRoughness,
    calendarOffsetX = 0, calendarOffsetY = 0, calendarOffsetZ = 0,
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

  useEffect(() => {
    [floorDay, tableDay, tableObjDay, wallDay, wallObjDay,
     floorNight, tableNight, tableObjNight, wallNight, wallObjNight].forEach((t) => {
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.needsUpdate = true;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const initRatio = mixRatioRef.current;

    // onBeforeCompile 주입 헬퍼
    const mkBasic = (dayTex, nightTex) => {
      const mat = new THREE.MeshBasicMaterial({ map: dayTex });
      injectCrossfade(mat, nightTex, false);
      return mat;
    };
    const mkStandard = (dayTex, nightTex) => {
      const mat = new THREE.MeshStandardMaterial({ map: dayTex });
      injectCrossfade(mat, nightTex, true);
      return mat;
    };

    const mats = {
      바닥_Baked:      mkBasic(floorDay,    floorNight),
      벽지_Baked:      mkBasic(wallDay,     wallNight),
      TodoList_Baked:  mkBasic(wallObjDay,  wallObjNight),
      책상_Baked:      mkBasic(tableDay,    tableNight),
      스탠드_Baked:    mkStandard(tableObjDay, tableObjNight),
      컵_Baked:        mkStandard(tableObjDay, tableObjNight),
      게임기몸통_Baked: mkStandard(tableObjDay, tableObjNight),
      노트북_Baked:    mkStandard(tableObjDay, tableObjNight),
      책상소품_Baked:  mkStandard(tableObjDay, tableObjNight),
      // 크로스페이드 불필요한 고정 머티리얼
      달력앞면:        new THREE.MeshBasicMaterial({ map: calendarTexture, toneMapped: false }),
      게임기화면:      new THREE.MeshBasicMaterial({ map: gbTexture, toneMapped: false }),
      게임기화면근처:  new THREE.MeshStandardMaterial(),
      노트북화면:      new THREE.MeshBasicMaterial({ map: laptopScreenTexture, toneMapped: false, side: THREE.DoubleSide }),
    };

    // 크로스페이드 대상 목록
    crossfadeMatsRef.current = [
      mats.바닥_Baked, mats.벽지_Baked, mats.TodoList_Baked, mats.책상_Baked,
      mats.스탠드_Baked, mats.컵_Baked, mats.게임기몸통_Baked, mats.노트북_Baked, mats.책상소품_Baked,
    ];

    // 초기 ratio 반영 (shader 컴파일 전이라 userData에 저장, useFrame에서 반영됨)
    mixRatioRef.current = initRatio;

    materialsRef.current = mats;

    const GAMEBOY   = ["게임기화면", "게임기몸통_Baked", "게임기화면근처"];
    const CLICKABLE = ["노트북히트박스", "게임보이히트박스", "게임기화면근처"];
    const collected = [];
    const gbCollected = [];

    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mat = mats[child.name];
      if (mat) child.material = mat;

      // 히트박스: invisible
      if (child.name === "노트북히트박스" || child.name === "게임보이히트박스") {
        child.material = new THREE.MeshBasicMaterial({ visible: false });
      }

      if (!CLICKABLE.includes(child.name)) child.raycast = () => null;
      if (child.name === "달력앞면") calendarMeshRef.current = child;
      if (child.name === "노트북화면" || child.name === "노트북_Baked")
        collected.push({ mesh: child, baseScale: child.scale.clone() });
      if (GAMEBOY.includes(child.name))
        gbCollected.push({ mesh: child, baseScale: child.scale.clone() });
    });

    laptopMeshes.current = collected;
    gameboyMeshes.current = gbCollected;

    // shader 미리 컴파일 → 첫 전환 시 깜빡임 방지
    gl.compile(scene, camera);

    return () => {
      Object.entries(mats).forEach(([key, m]) => {
        if (key === "노트북화면" || key === "달력앞면") m.map = null;
        m.dispose();
      });
    };
  }, [scene, gl, camera]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // 달력 position 오프셋
  useEffect(() => {
    const mesh = calendarMeshRef.current;
    if (!mesh) return;
    if (!mesh.userData.basePosition) mesh.userData.basePosition = mesh.position.clone();
    const base = mesh.userData.basePosition;
    mesh.position.set(base.x + calendarOffsetX, base.y + calendarOffsetY, base.z + calendarOffsetZ);
  }, [calendarOffsetX, calendarOffsetY, calendarOffsetZ]);

  // leva 값 변경
  useEffect(() => {
    const m = materialsRef.current;
    if (!m.게임기몸통_Baked) return;
    m.게임기몸통_Baked.roughness = gameRoughness;
    m.게임기몸통_Baked.metalness = gameMetalness;
    m.노트북_Baked.roughness = laptopRoughness;
    m.노트북_Baked.metalness = laptopMetalness;
    m.책상소품_Baked.roughness = deskObjRoughness;
    m.책상소품_Baked.metalness = deskObjMetalness;
    m.게임기화면근처.color.set(bezelColor);
    m.게임기화면근처.roughness = bezelRoughness;
  }, [gameRoughness, gameMetalness, laptopRoughness, laptopMetalness,
      deskObjRoughness, deskObjMetalness, bezelColor, bezelRoughness]);

  useFrame((_, delta) => {
    // ── 크로스페이드 lerp (~1초) ──
    const cur = mixRatioRef.current;
    const target = mixTargetRef.current;
    if (Math.abs(cur - target) > 0.001) {
      const next = cur + (target - cur) * (1 - Math.pow(0.001, delta));
      mixRatioRef.current = next;
      crossfadeMatsRef.current.forEach((mat) => mat.setMixRatio?.(next));
    }

    // ── 호버 스케일 ──
    const lerp = 1 - Math.pow(0.005, delta);
    const focused = playingRef.current;
    const animate = (list, isHovered) => {
      if (!list.length) return;
      const scaleTarget = (isHovered && !focused) ? 1.05 : 1.0;
      for (const { mesh, baseScale } of list) {
        const c = mesh.scale.x / baseScale.x;
        if (Math.abs(c - scaleTarget) < 0.0001) {
          if (c !== scaleTarget) mesh.scale.set(baseScale.x * scaleTarget, baseScale.y * scaleTarget, baseScale.z * scaleTarget);
          continue;
        }
        const n = c + (scaleTarget - c) * lerp;
        mesh.scale.set(baseScale.x * n, baseScale.y * n, baseScale.z * n);
      }
    };
    animate(laptopMeshes.current, hovered.current);
    animate(gameboyMeshes.current, gbHovered.current);
  });

  const isLaptop  = (n) => n === "노트북히트박스";
  const isGameboy = (n) => n === "게임보이히트박스" || n === "게임기화면근처";

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation();
        const n = e.object.name;
        if (isLaptop(n)) {
          onLaptopClick?.();
        } else if (isGameboy(n)) {
          if (playingRef.current) {
            gbApi.press();
          } else {
            onGameboyClick?.();
          }
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
        const n = e.object.name;
        if (isLaptop(n)) { e.stopPropagation(); document.body.style.cursor = "pointer"; hovered.current = true; }
        else if (isGameboy(n)) { e.stopPropagation(); document.body.style.cursor = "pointer"; gbHovered.current = true; }
      }}
      onPointerOut={(e) => {
        const n = e.object.name;
        if (isLaptop(n)) { document.body.style.cursor = "default"; hovered.current = false; }
        else if (isGameboy(n)) { document.body.style.cursor = "default"; gbHovered.current = false; }
      }}
    />
  );
}

useGLTF.preload("/models/room.glb");