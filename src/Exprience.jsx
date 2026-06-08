import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
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
import { StarParticles } from "@/components/StarParticles";

const isDebug =
  typeof window !== "undefined" &&
  window.location.hash.toLowerCase().includes("debug");

// GPU 사전 컴파일
const Prewarmer = () => {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

// day/night HDR 둘 다 항상 마운트 → 첫 전환 시 로딩 없음
// Three.js는 마지막에 추가된 Environment가 적용되므로
// isNight=false → day만 강도 있음, isNight=true → night만 강도 있음
const DualEnvironment = ({ isNight, dayIntensity, nightIntensity }) => (
  <>
    <Environment
      files="/hdrs/day.exr"
      environmentIntensity={isNight ? 0 : dayIntensity}
      background={false}
    />
    <Environment
      files="/hdrs/night.exr"
      environmentIntensity={isNight ? nightIntensity : 0}
      background={false}
    />
  </>
);

const Experience = () => {
  const controls = useSceneControls();
  const isMobile = useIsMobile();
  const [showGallery, setShowGallery] = useState(false);
  const [playingGame, setPlayingGame] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(false);

  const [dayNight, setDayNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6 ? "night" : "day";
  });

  const { texture: gbTexture, api: gbApi } = useGameboy();

  const bgm = useBackgroundMusic({
    roomSrc: "/audio/room-bgm.mp3",
    gameSrc: "/audio/game-bgm.mp3",
    volume: 0.3,
  });

  const handleStart = useCallback((withMusic) => {
    if (withMusic) bgm.start();
    setTimeout(() => bgm.setMode(dayNight), 100);
    setIntroActive(true);
    setIntroPlaying(true);
  }, [bgm, dayNight]);

  useEffect(() => {
    bgm.setMode(dayNight);
  }, [dayNight, bgm]);

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

  const handleIntroComplete = useCallback(() => { setIntroPlaying(false); }, []);
  const handleLaptopClick = useCallback(() => { window.zoomToLaptop?.(); }, []);
  const handleClose = useCallback(() => { setShowGallery(false); window.zoomOut?.(); }, []);
  const handleZoomComplete = useCallback(() => { setShowGallery(true); }, []);
  const handleGameboyClick = useCallback(() => { window.zoomToGameboy?.(); }, []);
  const handleGameboyZoomComplete = useCallback(() => { setPlayingGame(true); }, []);
  const handleGameClose = useCallback(() => { setPlayingGame(false); window.zoomOutGameboy?.(); }, []);

  useEffect(() => {
    if (!playingGame) return;
    const onKey = (e) => { if (e.key === "Escape") handleGameClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playingGame, handleGameClose]);

  const fov = isMobile ? 85 : 75;

  const {
    steamX, steamY, steamZ, steamW, steamH, steamOpacity,
    steamColor, steamSpeed, steamSway,
    steamContrastLow, steamContrastHigh, steamNoiseScale,
  } = controls;

  const {
    lampOn, lampColor, lampIntensity, lampDistance, lampDecay,
    lampOffsetX, lampOffsetY, lampOffsetZ,
    laptopGlowIntensityDay, laptopGlowIntensityNight,
    gbGlowIntensityDay, gbGlowIntensityNight,
    starCount, starSize, starSpeed, starOpacity,
    starRangeX, starRangeY, starRangeZ,
    starCenterX, starCenterY, starCenterZ,
  } = controls;

  const { introStartX, introStartY, introStartZ, introDuration } = controls;
  const introStart = useMemo(() => [introStartX, introStartY, introStartZ], [introStartX, introStartY, introStartZ]);

  const isNight = dayNight === "night";

  return (
    <div id="experience" style={{ width: "100vw", height: "100vh" }}>
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
          introActive={introActive}
          introStart={introStart}
          introDuration={introDuration}
          onIntroComplete={handleIntroComplete}
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
          {/* day/night HDR 둘 다 항상 마운트 → 전환 시 로딩 없이 즉시 전환 */}
          <DualEnvironment
            isNight={isNight}
            dayIntensity={envIntensity}
            nightIntensity={envIntensity * 0.55}
          />
          {/* 스탠드 조명 - 스탠드_Baked 위치 기준 */}
          {/* 스탠드 pointLight - 전구 메시 위치 기준, 야간에만 */}
          {lampOn && isNight && (
            <pointLight
              position={[
                -0.529 + lampOffsetX,
                1.281 + lampOffsetY,
                -1.301 + lampOffsetZ,
              ]}
              color={lampColor}
              intensity={lampIntensity}
              distance={lampDistance}
              decay={lampDecay}
            />
          )}
          {/* 노트북 화면 빛번짐 */}
          <pointLight
            position={[-0.797, 0.95, -0.86]}
            color="#a8c8ff"
            intensity={isNight ? laptopGlowIntensityNight : laptopGlowIntensityDay}
            distance={0.8}
            decay={2}
          />
          {/* 게임보이 화면 빛번짐 */}
          <pointLight
            position={[-0.315, 0.85, -0.85]}
            color="#8bac0f"
            intensity={isNight ? gbGlowIntensityNight : gbGlowIntensityDay}
            distance={0.5}
            decay={2}
          />
          <Room
            controls={controls}
            onLaptopClick={handleLaptopClick}
            onGameboyClick={handleGameboyClick}
            onToggleDayNight={() => setDayNight((m) => (m === "day" ? "night" : "day"))}
            playingGame={playingGame}
            gbTexture={gbTexture}
            gbApi={gbApi}
            dayNight={dayNight}
            introPlaying={introPlaying}
          />
          <StarParticles
            visible={isNight}
            count={starCount}
            size={starSize}
            speed={starSpeed}
            opacity={starOpacity}
            rangeX={starRangeX}
            rangeY={starRangeY}
            rangeZ={starRangeZ}
            centerX={starCenterX}
            centerY={starCenterY}
            centerZ={starCenterZ}
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
      <NightOverlay active={isNight} />

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