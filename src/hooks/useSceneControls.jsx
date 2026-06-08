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
    "게임보이 줌": folder({
      gbZoomX: { value: -0.339, min: -5, max: 5, step: 0.001, label: "X" },
      gbZoomY: { value: 0.85, min: -5, max: 5, step: 0.001, label: "Y" },
      gbZoomZ: { value: -1.043, min: -5, max: 5, step: 0.001, label: "Z" },
      gbZoomTargetX: { value: -0.339, min: -5, max: 5, step: 0.001, label: "Target X" },
      gbZoomTargetY: { value: 0.741, min: -5, max: 5, step: 0.001, label: "Target Y" },
      gbZoomTargetZ: { value: -1.043, min: -5, max: 5, step: 0.001, label: "Target Z" },
      gbRoll: { value: 20, min: -180, max: 180, step: 1, label: "화면 회전(도)" },
    }),
    Environment: folder({
      envIntensity: { value: 3.8, min: 0, max: 10, step: 0.1, label: "강도" },
    }),
    "커피 김": folder({
      steamX: { value: -1.25, min: -2, max: 2, step: 0.01, label: "위치 X" },
      steamY: { value: 0.98, min: 0, max: 2, step: 0.01, label: "위치 Y" },
      steamZ: { value: -0.946, min: -2, max: 2, step: 0.01, label: "위치 Z" },
      steamW: { value: 0.12, min: 0.01, max: 0.4, step: 0.005, label: "폭" },
      steamH: { value: 0.24, min: 0.05, max: 0.6, step: 0.01, label: "높이" },
      steamOpacity: { value: 0.85, min: 0, max: 1, step: 0.05, label: "농도" },
      steamColor: { value: "#fffaf2", label: "색상" },
      steamSpeed: { value: 0.18, min: 0, max: 1, step: 0.01, label: "속도" },
      steamSway: { value: 0.08, min: 0, max: 0.3, step: 0.005, label: "흔들림" },
      steamContrastLow: { value: 0.35, min: 0, max: 1, step: 0.01, label: "대비 하한" },
      steamContrastHigh: { value: 0.85, min: 0, max: 1, step: 0.01, label: "대비 상한" },
      steamNoiseScale: { value: 3.0, min: 0.5, max: 8, step: 0.1, label: "노이즈 촘촘함" },
    }),
    달력: folder({
      calendarOffsetX: { value: 0.0, min: -0.5, max: 0.5, step: 0.001, label: "오프셋 X" },
      calendarOffsetY: { value: 0.0, min: -0.5, max: 0.5, step: 0.001, label: "오프셋 Y" },
      calendarOffsetZ: { value: 0.0, min: -0.5, max: 0.5, step: 0.001, label: "오프셋 Z" },
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