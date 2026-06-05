import { useControls, folder } from "leva";

export function useSceneControls() {
  return useControls({
    카메라: folder({
      camX: { value: -0.4, min: -5, max: 5, step: 0.01, label: "X" },
      camY: { value: 1.34, min: -5, max: 5, step: 0.01, label: "Y" },
      camZ: { value: -0.12, min: -5, max: 5, step: 0.01, label: "Z" },
      targetX: { value: -0.800, min: -5, max: 5, step: 0.01, label: "Target X" },
      targetY: { value: 1.090, min: -5, max: 5, step: 0.01, label: "Target Y" },
      targetZ: { value: -1.200, min: -5, max: 5, step: 0.01, label: "Target Z" },
      minAzimuth: { value: -Math.PI / 30, min: -Math.PI, max: 0, step: 0.01, label: "좌우 최소각" },
      maxAzimuth: { value: Math.PI / 30, min: 0, max: Math.PI, step: 0.01, label: "좌우 최대각" },
      minPolar: { value: Math.PI / 2 - Math.PI / 24, min: 0, max: Math.PI, step: 0.01, label: "상하 최소각" },
      maxPolar: { value: Math.PI / 2 + Math.PI / 24, min: 0, max: Math.PI, step: 0.01, label: "상하 최대각" },
    }),
    줌인: folder({
      zoomX: { value: -0.797, min: -5, max: 5, step: 0.001, label: "X" },
      zoomY: { value: 0.8, min: -5, max: 5, step: 0.001, label: "Y" },
      zoomZ: { value: -0.7, min: -5, max: 5, step: 0.001, label: "Z" },
      zoomTargetX: { value: -0.797, min: -5, max: 5, step: 0.001, label: "Target X" },
      zoomTargetY: { value: 0.703, min: -5, max: 5, step: 0.001, label: "Target Y" },
      zoomTargetZ: { value: -0.965, min: -5, max: 5, step: 0.001, label: "Target Z" },
    }),
    Environment: folder({
      envIntensity: { value: 3.8, min: 0, max: 10, step: 0.1, label: "강도" },
    }),
    게임기몸통: folder({
      gameRoughness: { value: 0.9, min: 0, max: 1, step: 0.05, label: "Roughness" },
      gameMetalness: { value: 0.0, min: 0, max: 1, step: 0.05, label: "Metalness" },
    }),
    노트북: folder({
      laptopRoughness: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Roughness" },
      laptopMetalness: { value: 0.0, min: 0, max: 1, step: 0.05, label: "Metalness" },
    }),
    책상소품: folder({
      deskObjRoughness: { value: 0.7, min: 0, max: 1, step: 0.05, label: "Roughness" },
      deskObjMetalness: { value: 0.0, min: 0, max: 1, step: 0.05, label: "Metalness" },
    }),
    게임기화면: folder({
      screenColor: { value: "#8bac0f", label: "색상" },
      screenRoughness: { value: 0.1, min: 0, max: 1, step: 0.05, label: "Roughness" },
      screenOpacity: { value: 0.85, min: 0, max: 1, step: 0.05, label: "투명도" },
    }),
    게임기화면근처: folder({
      bezelColor: { value: "#1a1a1a", label: "색상" },
      bezelRoughness: { value: 0.9, min: 0, max: 1, step: 0.05, label: "Roughness" },
    }),
    노트북화면: folder({
      laptopScreenColor: { value: "#000000", label: "색상" },
      laptopScreenRoughness: { value: 0.05, min: 0, max: 1, step: 0.05, label: "Roughness" },
      laptopScreenOpacity: { value: 0.85, min: 0, max: 1, step: 0.05, label: "투명도" },
    }),
  });
}