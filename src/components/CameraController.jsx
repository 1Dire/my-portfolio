import { useThree, useFrame, addEffect } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CameraController({
  position,
  target,
  zoomPosition,
  zoomTarget,
  minAzimuth,
  maxAzimuth,
  minPolar,
  maxPolar,
  onZoomComplete,
  isMobile = false,
}) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const isFocused = useRef(false);
  const isAnimating = useRef(false);
  const initialized = useRef(false);

  // GSAP ticker → R3F 루프에 동기화 (버벅임 방지)
  useEffect(() => {
    gsap.ticker.remove(gsap.updateRoot);
    const unsub = addEffect((time) => gsap.updateRoot(time / 1000));
    return () => {
      unsub();
      gsap.ticker.add(gsap.updateRoot);
    };
  }, []);

  // 카메라 초기 위치 - 최초 1회만
  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(...position);
      initialized.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== 입력 처리: 데스크탑은 마우스, 모바일은 자이로/터치 =====
  useEffect(() => {
    if (!isMobile) {
      // 데스크탑: 마우스 이동
      const handleMouseMove = (e) => {
        mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }

    // 모바일: 자이로(기기 기울임) → 실패 시 터치 드래그
    const handleOrientation = (e) => {
      // gamma: 좌우 기울임(-90~90), beta: 앞뒤 기울임(-180~180)
      if (e.gamma == null || e.beta == null) return;
      mouse.current.x = Math.max(-1, Math.min(1, e.gamma / 30));
      mouse.current.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    window.addEventListener("deviceorientation", handleOrientation);

    // 터치 드래그 폴백
    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      mouse.current.x = (t.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (t.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isMobile]);

  // 전역 줌 함수
  useEffect(() => {
    window.zoomToLaptop = () => {
      if (isAnimating.current) return;
      isFocused.current = true;
      isAnimating.current = true;

      gsap.ticker.tick(); // 첫 클릭 딜레이 방지

      gsap.to(camera.position, {
        x: zoomPosition[0],
        y: zoomPosition[1],
        z: zoomPosition[2],
        duration: 1.2,
        ease: "power2.inOut",
        onStart: () => {
          camera.lookAt(...zoomTarget);
        },
        onUpdate: () => {
          camera.lookAt(...zoomTarget);
        },
        onComplete: () => {
          isAnimating.current = false;
          onZoomComplete?.();
        },
      });
    };

    window.zoomOut = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      gsap.ticker.tick();

      gsap.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1.2,
        ease: "power2.inOut",
        onStart: () => {
          camera.lookAt(...target);
        },
        onUpdate: () => {
          camera.lookAt(...target);
        },
        onComplete: () => {
          isAnimating.current = false;
          isFocused.current = false;
        },
      });
    };

    return () => {
      delete window.zoomToLaptop;
      delete window.zoomOut;
    };
  }, [camera, position, target, zoomPosition, zoomTarget, onZoomComplete]);

  useFrame((_, delta) => {
    if (isFocused.current || isAnimating.current) return;

    const lerpFactor = 1 - Math.pow(0.01, delta);
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * lerpFactor;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * lerpFactor;

    // 모바일은 패럴랙스 폭을 약간 줄임 (자이로가 민감해서)
    const amp = isMobile ? 0.035 : 0.05;
    camera.position.x = position[0] + smoothMouse.current.x * amp;
    camera.position.y = position[1] - smoothMouse.current.y * amp;
    camera.position.z = position[2];

    camera.lookAt(...target);
  });

  return null;
}