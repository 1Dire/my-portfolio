import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Stats } from "@react-three/drei";
import { Leva } from "leva";
import { useSceneControls } from "@/hooks/useSceneControls";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CameraController } from "@/components/CameraController";
import { Room } from "@/components/Room";
import { CoffeeSteam } from "@/components/CoffeeSteam";
import { GameboyPad } from "@/components/GameboyPad";
import { useGameboy } from "@/hooks/useGameboy";
import { ProjectGallery } from "@/components/ProjectGallery";
import { LoadingScreen } from "@/components/LoadingScreen";

// URL 해시에 #debug 가 있으면 디버그 모드 (leva 패널 + Stats 표시)
const isDebug =
  typeof window !== "undefined" &&
  window.location.hash.toLowerCase().includes("debug");

// GPU 사전 컴파일 - 첫 클릭 딜레이 방지
const Prewarmer = () => {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const Experience = () => {
  const controls = useSceneControls();
  const isMobile = useIsMobile();
  const [showGallery, setShowGallery] = useState(false);
  const [playingGame, setPlayingGame] = useState(false);

  // 게임보이 (texture는 Room에, api는 패드+Room 공용)
  const { texture: gbTexture, api: gbApi } = useGameboy();

  // 게임 플레이 상태 → 루프 시작/정지 (부하 제어)
  useEffect(() => {
    gbApi.setActive(playingGame);
  }, [playingGame, gbApi]);

  const {
    envIntensity,
    camX, camY, camZ,
    targetX, targetY, targetZ,
    zoomX, zoomY, zoomZ,
    zoomTargetX, zoomTargetY, zoomTargetZ,
    gbZoomX, gbZoomY, gbZoomZ,
    gbZoomTargetX, gbZoomTargetY, gbZoomTargetZ,
    gbRoll,
    minAzimuth, maxAzimuth,
    minPolar, maxPolar,
  } = controls;

  const position = useMemo(() => [camX, camY, camZ], [camX, camY, camZ]);
  const target = useMemo(() => [targetX, targetY, targetZ], [targetX, targetY, targetZ]);
  const zoomPosition = useMemo(() => [zoomX, zoomY, zoomZ], [zoomX, zoomY, zoomZ]);
  const zoomTarget = useMemo(() => [zoomTargetX, zoomTargetY, zoomTargetZ], [zoomTargetX, zoomTargetY, zoomTargetZ]);
  const gbZoomPosition = useMemo(() => [gbZoomX, gbZoomY, gbZoomZ], [gbZoomX, gbZoomY, gbZoomZ]);
  const gbZoomTarget = useMemo(() => [gbZoomTargetX, gbZoomTargetY, gbZoomTargetZ], [gbZoomTargetX, gbZoomTargetY, gbZoomTargetZ]);

  const handleLaptopClick = useCallback(() => {
    window.zoomToLaptop?.();
  }, []);

  const handleClose = useCallback(() => {
    setShowGallery(false);
    window.zoomOut?.();
  }, []);

  const handleZoomComplete = useCallback(() => {
    setShowGallery(true);
  }, []);

  // 게임보이 클릭 → 줌인
  const handleGameboyClick = useCallback(() => {
    window.zoomToGameboy?.();
  }, []);

  // 줌인 완료 → 게임 플레이 활성화
  const handleGameboyZoomComplete = useCallback(() => {
    setPlayingGame(true);
  }, []);

  // 게임 종료 (ESC) → 줌아웃
  const handleGameClose = useCallback(() => {
    setPlayingGame(false);
    window.zoomOutGameboy?.();
  }, []);

  // 게임 중 ESC로 나가기
  useEffect(() => {
    if (!playingGame) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleGameClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playingGame, handleGameClose]);

  // 모바일은 FOV를 살짝 넓혀 세로 화면에서 방이 더 보이게
  const fov = isMobile ? 85 : 75;

  // 커피 김 값 (useSceneControls의 "커피 김" 폴더)
  const {
    steamX, steamY, steamZ, steamW, steamH, steamOpacity,
    steamColor, steamSpeed, steamSway,
    steamContrastLow, steamContrastHigh, steamNoiseScale,
  } = controls;

  return (
    <div id="experience" style={{ width: "100vw", height: "100vh" }}>
      {/* leva 패널: #debug 일 때만 표시 */}
      <Leva hidden={!isDebug} />

      <LoadingScreen />

      <Canvas
        camera={{ position: [-0.555, 1.342, -0.222], fov }}
        gl={{ antialias: !isMobile, alpha: false, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        flat
        frameloop="always"
      >
        {isDebug && <Stats />}
        <Prewarmer />
        <CameraController
          position={position}
          target={target}
          zoomPosition={zoomPosition}
          zoomTarget={zoomTarget}
          gbZoomPosition={gbZoomPosition}
          gbZoomTarget={gbZoomTarget}
          gbRoll={gbRoll}
          gameboyActive={playingGame}
          minAzimuth={minAzimuth}
          maxAzimuth={maxAzimuth}
          minPolar={minPolar}
          maxPolar={maxPolar}
          onZoomComplete={handleZoomComplete}
          onGameboyZoomComplete={handleGameboyZoomComplete}
          isMobile={isMobile}
        />
        <Suspense fallback={null}>
          <Environment
            files="/hdrs/snooker-room_0_5K_f0dbfbbe-d41d-42e2-b226-8709ec529dca.exr"
            environmentIntensity={envIntensity}
            background={false}
          />
          <Room
            controls={controls}
            onLaptopClick={handleLaptopClick}
            onGameboyClick={handleGameboyClick}
            playingGame={playingGame}
            gbTexture={gbTexture}
            gbApi={gbApi}
          />
          <CoffeeSteam
            position={[steamX, steamY, steamZ]}
            scale={[steamW, steamH, 1]}
            opacity={steamOpacity}
            color={steamColor}
            speed={steamSpeed}
            sway={steamSway}
            contrastLow={steamContrastLow}
            contrastHigh={steamContrastHigh}
            noiseScale={steamNoiseScale}
          />
        </Suspense>
      </Canvas>

      {showGallery && <ProjectGallery onClose={handleClose} />}

      <GameboyPad visible={playingGame} api={gbApi} onExit={handleGameClose} />
    </div>
  );
};

export default Experience;