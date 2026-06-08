import { useThree, useFrame, addEffect } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CameraController({
  position,
  target,
  introActive = false,
  introStart = [0.0, 2.1, 1.8],
  introDuration = 2.0,
  onIntroComplete,
  zoomPosition,
  zoomTarget,
  gbZoomPosition,
  gbZoomTarget,
  gbRoll = 0,
  gameboyActive = false,
  minAzimuth,
  maxAzimuth,
  minPolar,
  maxPolar,
  onZoomComplete,
  onGameboyZoomComplete,
  isMobile = false,
}) {
  const { camera } = useThree();
  const mouse       = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const isFocused   = useRef(false);
  const isAnimating = useRef(false);
  const gbFocused   = useRef(false);
  const initialized = useRef(false);

  // 항상 최신 leva 값을 ref로 유지 → 클로저 캡처 문제 해결
  const positionRef      = useRef(position);
  const targetRef        = useRef(target);
  const zoomPositionRef  = useRef(zoomPosition);
  const zoomTargetRef    = useRef(zoomTarget);
  const gbZoomPositionRef = useRef(gbZoomPosition);
  const gbZoomTargetRef  = useRef(gbZoomTarget);
  const gbRollRef        = useRef(gbRoll);

  useEffect(() => { positionRef.current      = position;      }, [position]);
  useEffect(() => { targetRef.current        = target;        }, [target]);
  useEffect(() => { zoomPositionRef.current  = zoomPosition;  }, [zoomPosition]);
  useEffect(() => { zoomTargetRef.current    = zoomTarget;    }, [zoomTarget]);
  useEffect(() => { gbZoomPositionRef.current = gbZoomPosition; }, [gbZoomPosition]);
  useEffect(() => { gbZoomTargetRef.current  = gbZoomTarget;  }, [gbZoomTarget]);
  useEffect(() => { gbRollRef.current        = gbRoll;        }, [gbRoll]);

  // GSAP ticker → R3F 루프에 동기화
  useEffect(() => {
    gsap.ticker.remove(gsap.updateRoot);
    const unsub = addEffect((time) => gsap.updateRoot(time / 1000));
    return () => {
      unsub();
      gsap.ticker.add(gsap.updateRoot);
    };
  }, []);

  // 카메라 초기 위치 (최초 1회) - 인트로 시 멀리서 시작
  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(...position);
      initialized.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 인트로 애니메이션: introActive=true가 되면 멀리서 현재 위치로 날아옴
  useEffect(() => {
    if (!introActive) return;
    const p = positionRef.current;
    const t = targetRef.current;

    camera.position.set(introStart[0], introStart[1], introStart[2]);
    camera.lookAt(...t);
    isAnimating.current = true;

    gsap.to(camera.position, {
      x: p[0], y: p[1], z: p[2],
      duration: introDuration,
      ease: "power3.inOut",
      onUpdate: () => camera.lookAt(...targetRef.current),
      onComplete: () => { isAnimating.current = false; onIntroComplete?.(); },
    });
  }, [introActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // 입력 처리
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e) => {
        mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }

    const handleOrientation = (e) => {
      if (e.gamma == null || e.beta == null) return;
      mouse.current.x = Math.max(-1, Math.min(1, e.gamma / 30));
      mouse.current.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    window.addEventListener("deviceorientation", handleOrientation);

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

  // 전역 줌 함수 (최초 1회 등록, ref로 최신값 참조)
  useEffect(() => {
    window.zoomToLaptop = () => {
      if (isAnimating.current) return;
      isFocused.current = true;
      isAnimating.current = true;
      gsap.ticker.tick();

      const zp = zoomPositionRef.current;
      const zt = zoomTargetRef.current;

      gsap.to(camera.position, {
        x: zp[0], y: zp[1], z: zp[2],
        duration: 1.2,
        ease: "power2.inOut",
        onStart:    () => camera.lookAt(...zt),
        onUpdate:   () => camera.lookAt(...zoomTargetRef.current),
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

      const p = positionRef.current;
      const t = targetRef.current;

      gsap.to(camera.position, {
        x: p[0], y: p[1], z: p[2],
        duration: 1.2,
        ease: "power2.inOut",
        onStart:    () => camera.lookAt(...t),
        onUpdate:   () => camera.lookAt(...targetRef.current),
        onComplete: () => {
          isAnimating.current = false;
          isFocused.current = false;
        },
      });
    };

    window.zoomToGameboy = () => {
      if (isAnimating.current || !gbZoomPositionRef.current) return;
      isFocused.current = true;
      isAnimating.current = true;
      gsap.ticker.tick();

      const gp = gbZoomPositionRef.current;
      const gt = gbZoomTargetRef.current;

      const applyLook = () => {
        camera.lookAt(...gbZoomTargetRef.current);
        if (gbRollRef.current) camera.rotateZ((gbRollRef.current * Math.PI) / 180);
      };

      gsap.to(camera.position, {
        x: gp[0], y: gp[1], z: gp[2],
        duration: 1.2,
        ease: "power2.inOut",
        onStart:    applyLook,
        onUpdate:   applyLook,
        onComplete: () => {
          isAnimating.current = false;
          gbFocused.current = true;
          onGameboyZoomComplete?.();
        },
      });
    };

    window.zoomOutGameboy = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      gsap.ticker.tick();

      camera.up.set(0, 1, 0);
      gbFocused.current = false;

      const p = positionRef.current;

      gsap.to(camera.position, {
        x: p[0], y: p[1], z: p[2],
        duration: 1.2,
        ease: "power2.inOut",
        onStart:    () => camera.lookAt(...targetRef.current),
        onUpdate:   () => camera.lookAt(...targetRef.current),
        onComplete: () => {
          isAnimating.current = false;
          isFocused.current = false;
        },
      });
    };

    return () => {
      delete window.zoomToLaptop;
      delete window.zoomOut;
      delete window.zoomToGameboy;
      delete window.zoomOutGameboy;
    };
  }, [camera, onZoomComplete, onGameboyZoomComplete]); // ref로 관리하므로 dep 최소화

  useFrame((_, delta) => {
    if (isAnimating.current) return;

    if (gbFocused.current || gameboyActive) {
      const gp = gbZoomPositionRef.current;
      const gt = gbZoomTargetRef.current;
      camera.position.set(gp[0], gp[1], gp[2]);
      camera.up.set(0, 1, 0);
      camera.lookAt(...gt);
      if (gbRollRef.current) camera.rotateZ((gbRollRef.current * Math.PI) / 180);
      return;
    }

    if (isFocused.current) return;

    const lerpFactor = 1 - Math.pow(0.01, delta);
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * lerpFactor;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * lerpFactor;

    const amp = isMobile ? 0.035 : 0.05;
    const p   = positionRef.current;
    camera.position.x = p[0] + smoothMouse.current.x * amp;
    camera.position.y = p[1] - smoothMouse.current.y * amp;
    camera.position.z = p[2];

    camera.lookAt(...targetRef.current);
  });

  return null;
}