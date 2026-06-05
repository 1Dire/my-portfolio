import { useEffect, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useLaptopScreenTexture } from "@/hooks/useLaptopScreenTexture";

export function Room({ controls, onLaptopClick }) {
  const { scene } = useGLTF("/models/room.glb");
  const materialsRef = useRef({});

  // 노트북 화면용 터미널 CanvasTexture
  const laptopScreenTexture = useLaptopScreenTexture();

  // 언마운트 시 커서 복구 (pointer로 남는 것 방지)
  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  const {
    gameRoughness, gameMetalness,
    laptopRoughness, laptopMetalness,
    deskObjRoughness, deskObjMetalness,
    screenColor, screenRoughness, screenOpacity,
    bezelColor, bezelRoughness,
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
      달력001: new THREE.MeshBasicMaterial({ map: wallObjTxt }),
      게임기몸통_Baked: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      노트북_Baked: new THREE.MeshStandardMaterial({ map: tableObjTxt, side: THREE.DoubleSide }),
      책상소품_Baked: new THREE.MeshStandardMaterial({ map: tableObjTxt }),
      게임기화면: new THREE.MeshStandardMaterial({ transparent: true }),
      게임기화면근처: new THREE.MeshStandardMaterial(),
      // 노트북 화면 = 터미널 텍스처 (스스로 빛나는 디스플레이)
      노트북화면: new THREE.MeshBasicMaterial({
        map: laptopScreenTexture,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    };

    materialsRef.current = mats;

    // 노트북 클릭 대상 메시 이름
    const CLICKABLE = ["노트북화면", "노트북_Baked"];

    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mat = mats[child.name];
      if (mat) {
        child.material = mat;
      } else {
        console.warn("No material for:", child.name);
      }
      // 노트북 외의 메시는 레이캐스팅 제외 → 마우스 호버 시 렉 방지
      if (!CLICKABLE.includes(child.name)) {
        child.raycast = () => null;
      }
    });

    return () => {
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [scene, floorTxt, tableTxt, tableObjTxt, wallTxt, wallObjTxt, laptopScreenTexture]);

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

    m.게임기화면.color.set(screenColor);
    m.게임기화면.roughness = screenRoughness;
    m.게임기화면.opacity = screenOpacity;

    m.게임기화면근처.color.set(bezelColor);
    m.게임기화면근처.roughness = bezelRoughness;
  }, [
    gameRoughness, gameMetalness,
    laptopRoughness, laptopMetalness,
    deskObjRoughness, deskObjMetalness,
    screenColor, screenRoughness, screenOpacity,
    bezelColor, bezelRoughness,
  ]);

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation();
        if (e.object.name === "노트북화면" || e.object.name === "노트북_Baked") {
          onLaptopClick?.();
        }
      }}
      onPointerOver={(e) => {
        if (e.object.name === "노트북화면" || e.object.name === "노트북_Baked") {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        if (e.object.name === "노트북화면" || e.object.name === "노트북_Baked") {
          document.body.style.cursor = "default";
        }
      }}
    />
  );
}

useGLTF.preload("/models/room.glb");