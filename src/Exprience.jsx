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
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { NightOverlay, RoomControls, BottomLinks, CreditsModal } from "@/components/UIOverlay";
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
  const [showCredits, setShowCredits] = useState(false);

  // 주간/야간 모드 ("day" | "night"). 현재 시각으로 초기 결정 (19시~6시 = 야간)
  const [dayNight, setDayNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6 ? "night" : "day";
  });

  // 게임보이 (texture는 Room에, api는 패드+Room 공용)
  const { texture: gbTexture, api: gbApi } = useGameboy();

  // 방/게임 배경음악 (시작 버튼 클릭 시 시작)
  const bgm = useBackgroundMusic({
    roomSrc: "/audio/room-bgm.mp3",
    gameSrc: "/audio/game-bgm.mp3",
    volume: 0.3,
  });

  // 시작: 음악 여부 + 현재 모드 적용
  const handleStart = useCallback((withMusic) => {
    if (withMusic) bgm.start();
    // 시작 시점의 모드로 음악 음색 맞춤
    setTimeout(() => bgm.setMode(dayNight), 100);
  }, [bgm, dayNight]);

  // 모드 바뀌면 음악 음색도 전환
  useEffect(() => {
    bgm.setMode(dayNight);
  }, [dayNight, bgm]);

  // 게임 플레이 상태 → 루프 시작/정지 (부하 제어) + 음악 트랙 교체
  useEffect(() => {
    gbApi.setActive(playingGame);
    bgm.setTrack(playingGame ? "game" : "room");
  }, [playingGame, gbApi, bgm]);

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

      <LoadingScreen onEnter={handleStart} />

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
            files={dayNight === "night" ? "/hdrs/night.exr" : "/hdrs/day.exr"}
            environmentIntensity={dayNight === "night" ? envIntensity * 0.55 : envIntensity}
            background={false}
          />
          <Room
            controls={controls}
            onLaptopClick={handleLaptopClick}
            onGameboyClick={handleGameboyClick}
            playingGame={playingGame}
            gbTexture={gbTexture}
            gbApi={gbApi}
            dayNight={dayNight}
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

      <NightOverlay active={dayNight === "night"} />

      {/* 갤러리/게임 중엔 우측 컨트롤 숨김 (모달과 겹침 방지) */}
      {!showGallery && !playingGame && (
        <>
          <RoomControls
            dayNight={dayNight}
            onToggleDayNight={() => setDayNight((m) => (m === "day" ? "night" : "day"))}
            bgm={bgm}
          />
          <BottomLinks onOpenCredits={() => setShowCredits(true)} />
        </>
      )}

      <CreditsModal open={showCredits} onClose={() => setShowCredits(false)} />
    </div>
  );
};

export default Experience;