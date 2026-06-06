import { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLaptopScreenTexture } from "@/hooks/useLaptopScreenTexture";
import { useCalendarTexture } from "@/hooks/useCalendarTexture";

export function Room({ controls, onLaptopClick, onGameboyClick, playingGame, gbTexture, gbApi }) {
  const { scene } = useGLTF("/models/room.glb");
  const materialsRef = useRef({});

  // 노트북 호버 확대 효과용
  const laptopMeshes = useRef([]);   // {mesh, baseScale} 배열
  const hovered = useRef(false);
  const gameboyMeshes = useRef([]);  // 게임보이 메시들
  const gbHovered = useRef(false);

  // 노트북 화면용 CanvasTexture
  const laptopScreenTexture = useLaptopScreenTexture();

  // 달력용 오늘 날짜 CanvasTexture
  const calendarTexture = useCalendarTexture();

  // 언마운트 시 커서 복구 (pointer로 남는 것 방지)
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  // 게임 플레이 상태를 ref로 (이벤트 핸들러에서 최신값 참조)
  const playingRef = useRef(playingGame);
  useEffect(() => {
    playingRef.current = playingGame;
  }, [playingGame]);

  // 호버 시 부드럽게 확대/축소 (노트북 + 게임보이). 줌인 중엔 비활성.
  useFrame((_, delta) => {
    const lerp = 1 - Math.pow(0.005, delta);
    const focused = playingRef.current; // 게임보이 줌인 상태
    const animate = (list, isHovered) => {
      if (!list.length) return;
      const target = (isHovered && !focused) ? 1.05 : 1.0;
      for (const { mesh, baseScale } of list) {
        const cur = mesh.scale.x / baseScale.x;
        const next = cur + (target - cur) * lerp;
        mesh.scale.set(baseScale.x * next, baseScale.y * next, baseScale.z * next);
      }
    };
    animate(laptopMeshes.current, hovered.current);
    animate(gameboyMeshes.current, gbHovered.current);
  });

  const {
    gameRoughness,
    gameMetalness,
    laptopRoughness,
    laptopMetalness,
    deskObjRoughness,
    deskObjMetalness,
    screenColor,
    screenRoughness,
    screenOpacity,
    bezelColor,
    bezelRoughness,
  } = controls;

  const textures = useTexture([
    "/textures/room/day/Floor_Bake1_CyclesBake_COMBINED.webp",
    "/textures/room/day/Table_Bake1_CyclesBake_COMBINED.webp",
    "/textures/room/day/Table object_Bake1_PBR_Diffuse.webp",
    "/textures/room/day/Wallpaper_Bake1_CyclesBake_COMBINED.webp",
    "/textures/room/day/Wall object_Bake1_PBR_Diffuse.webp",
  ]);

  const [floorTxt, tableTxt, tableObjTxt, wallTxt, wallObjTxt] = textures;

  // 텍스처 설정 최초 1회
  useEffect(() => {
    textures.forEach((t) => {
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.needsUpdate = true;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 머티리얼 최초 1회 생성 + 씬에 적용
  useEffect(() => {
    const mats = {
      바닥_Baked: new THREE.MeshBasicMaterial({ map: floorTxt }),
      벽지_Baked: new THREE.MeshBasicMaterial({ map: wallTxt }),
      TodoList_Baked: new THREE.MeshBasicMaterial({ map: wallObjTxt }),
      책상_Baked: new THREE.MeshBasicMaterial({ map: tableTxt }),
      // 달력 몸체 = 베이크 텍스처
      달력: new THREE.MeshBasicMaterial({ map: wallObjTxt }),
      // 달력 앞면 = 오늘 날짜 텍스처
      달력앞면: new THREE.MeshBasicMaterial({ map: calendarTexture, toneMapped: false }),
      램프: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      컵: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      게임기몸통_Baked: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      노트북_Baked: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      책상소품_Baked: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      게임기화면: new THREE.MeshBasicMaterial({
        map: gbTexture,
        toneMapped: false,
      }),
      게임기화면근처: new THREE.MeshStandardMaterial(),
      // 노트북 화면 = CanvasTexture (스스로 빛나는 디스플레이)
      노트북화면: new THREE.MeshBasicMaterial({
        map: laptopScreenTexture,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    };

    materialsRef.current = mats;

    // 클릭 대상 메시 (노트북 + 게임보이 전체)
    const GAMEBOY = ["게임기화면", "게임기몸통_Baked", "게임기화면근처"];
    const CLICKABLE = ["노트북화면", "노트북_Baked", ...GAMEBOY];

    const collected = [];
    const gbCollected = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mat = mats[child.name];
      if (mat) {
        child.material = mat;
      } else {
        console.warn("No material for:", child.name);
      }
      // 클릭 대상 외 메시는 레이캐스팅 제외 → 호버 렉 방지
      if (!CLICKABLE.includes(child.name)) {
        child.raycast = () => null;
      }
      // 노트북 호버 확대용 수집
      if (child.name === "노트북화면" || child.name === "노트북_Baked") {
        collected.push({ mesh: child, baseScale: child.scale.clone() });
      }
      // 게임보이 호버 확대용 수집
      if (GAMEBOY.includes(child.name)) {
        gbCollected.push({ mesh: child, baseScale: child.scale.clone() });
      }
    });
    laptopMeshes.current = collected;
    gameboyMeshes.current = gbCollected;

    return () => {
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [
    scene,
    floorTxt,
    tableTxt,
    tableObjTxt,
    wallTxt,
    wallObjTxt,
    laptopScreenTexture,
    calendarTexture,
    gbTexture,
  ]);

  // leva 값 변경 시 머티리얼 속성만 업데이트 (새 객체 생성 X)
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
  }, [
    gameRoughness,
    gameMetalness,
    laptopRoughness,
    laptopMetalness,
    deskObjRoughness,
    deskObjMetalness,
    bezelColor,
    bezelRoughness,
  ]);

  const isLaptop = (n) => n === "노트북화면" || n === "노트북_Baked";
  const isGameboy = (n) =>
    n === "게임기화면" || n === "게임기몸통_Baked" || n === "게임기화면근처";

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
            // 줌인 상태: 화면을 클릭하면 위치로 선택(메뉴) / 그 외엔 액션
            if (n === "게임기화면" && e.uv) gbApi.selectAt({ x: e.uv.x, y: e.uv.y });
            else gbApi.press();
          } else {
            onGameboyClick?.(); // 줌인
          }
        }
      }}
      onPointerMove={(e) => {
        // 게임보이 메뉴 위에서 마우스 움직이면 항목 포커스
        if (e.object.name === "게임기화면" && playingRef.current && e.uv) {
          gbApi.hoverAt({ x: e.uv.x, y: e.uv.y });
        }
      }}
      onPointerOver={(e) => {
        const n = e.object.name;
        if (isLaptop(n)) {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          hovered.current = true;
        } else if (isGameboy(n)) {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          gbHovered.current = true;
        }
      }}
      onPointerOut={(e) => {
        const n = e.object.name;
        if (isLaptop(n)) {
          document.body.style.cursor = "default";
          hovered.current = false;
        } else if (isGameboy(n)) {
          document.body.style.cursor = "default";
          gbHovered.current = false;
        }
      }}
    />
  );
}

useGLTF.preload("/models/room.glb");