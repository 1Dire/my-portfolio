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
import { FiSun, FiMoon, FiVolume2, FiVolumeX } from "react-icons/fi";
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

const ctrlBtnStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid rgba(200, 175, 110, 0.35)",
  background: "rgba(58, 68, 52, 0.75)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  color: "rgba(245, 230, 185, 0.92)",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Experience = () => {
  const controls = useSceneControls();
  const isMobile = useIsMobile();
  const [showGallery, setShowGallery] = useState(false);
  const [playingGame, setPlayingGame] = useState(false);

  // 주간/야간 모드 ("day" | "night"). 현재 시각으로 초기 결정 (19시~6시 = 야간)
  const [dayNight, setDayNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6 ? "night" : "day";
  });

  // 게임보이 (texture는 Room에, api는 패드+Room 공용)
  const { texture: gbTexture, api: gbApi } = useGameboy();

  // 방 배경음악 (시작 버튼 클릭 시 시작)
  const bgm = useBackgroundMusic("/audio/room-bgm.mp3", { volume: 0.3 });

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

      {/* 야간 모드 화면 틴트 (어둡고 푸른 오버레이) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(20,30,70,0) 0%, rgba(15,22,55,0.45) 100%)",
          opacity: dayNight === "night" ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      />

      {/* 우측 상단 컨트롤 */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 120,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* 주간/야간 토글 */}
        <button
          onClick={() => setDayNight((m) => (m === "day" ? "night" : "day"))}
          aria-label={dayNight === "day" ? "야간 모드로" : "주간 모드로"}
          style={ctrlBtnStyle}
        >
          {dayNight === "day" ? <FiSun size={20} /> : <FiMoon size={19} />}
        </button>

        {/* 음소거 (음악 시작된 경우만) */}
        {bgm.started && (
          <button
            onClick={bgm.toggleMute}
            aria-label={bgm.muted ? "음악 켜기" : "음악 끄기"}
            style={ctrlBtnStyle}
          >
            {bgm.muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Experience; 