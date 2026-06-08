import { useControls, folder } from "leva";

const C = true; // collapsed 기본값

export function useSceneControls() {
  return useControls({
    카메라: folder({
      camX:       { value: -0.4,   min: -5, max: 5, step: 0.01, label: "X" },
      camY:       { value:  1.34,  min: -5, max: 5, step: 0.01, label: "Y" },
      camZ:       { value: -0.12,  min: -5, max: 5, step: 0.01, label: "Z" },
      targetX:    { value: -0.800, min: -5, max: 5, step: 0.01, label: "Target X" },
      targetY:    { value:  1.090, min: -5, max: 5, step: 0.01, label: "Target Y" },
      targetZ:    { value: -1.200, min: -5, max: 5, step: 0.01, label: "Target Z" },
      minAzimuth: { value: -Math.PI / 30, min: -Math.PI, max: 0,       step: 0.01, label: "좌우 최소각" },
      maxAzimuth: { value:  Math.PI / 30, min:  0,       max: Math.PI, step: 0.01, label: "좌우 최대각" },
      minPolar:   { value: Math.PI / 2 - Math.PI / 24, min: 0, max: Math.PI, step: 0.01, label: "상하 최소각" },
      maxPolar:   { value: Math.PI / 2 + Math.PI / 24, min: 0, max: Math.PI, step: 0.01, label: "상하 최대각" },
    }, { collapsed: C }),
    줌인: folder({
      zoomX:       { value: -0.797, min: -5, max: 5, step: 0.001, label: "X" },
      zoomY:       { value:  1.0,   min: -5, max: 5, step: 0.001, label: "Y" },
      zoomZ:       { value: -0.7,   min: -5, max: 5, step: 0.001, label: "Z" },
      zoomTargetX: { value: -0.797, min: -5, max: 5, step: 0.001, label: "Target X" },
      zoomTargetY: { value:  0.8,   min: -5, max: 5, step: 0.001, label: "Target Y" },
      zoomTargetZ: { value: -0.965, min: -5, max: 5, step: 0.001, label: "Target Z" },
    }, { collapsed: C }),
    "게임보이 줌": folder({
      gbZoomX:       { value: -0.339, min: -5, max: 5, step: 0.001, label: "X" },
      gbZoomY:       { value:  0.85,  min: -5, max: 5, step: 0.001, label: "Y" },
      gbZoomZ:       { value: -1.043, min: -5, max: 5, step: 0.001, label: "Z" },
      gbZoomTargetX: { value: -0.339, min: -5, max: 5, step: 0.001, label: "Target X" },
      gbZoomTargetY: { value:  0.741, min: -5, max: 5, step: 0.001, label: "Target Y" },
      gbZoomTargetZ: { value: -1.043, min: -5, max: 5, step: 0.001, label: "Target Z" },
      gbRoll:        { value: 20, min: -180, max: 180, step: 1, label: "화면 회전(도)" },
    }, { collapsed: C }),
    Environment: folder({
      envIntensity: { value: 3.8, min: 0, max: 10, step: 0.1, label: "강도" },
    }, { collapsed: C }),
    인트로: folder({
      introStartX:   { value:  0.41, min: -5, max: 5,   step: 0.01, label: "시작 X" },
      introStartY:   { value:  1.73, min: -5, max: 5,   step: 0.01, label: "시작 Y" },
      introStartZ:   { value:  0.25, min: -5, max: 5,   step: 0.01, label: "시작 Z" },
      introDuration: { value:  2.5, min: 0.5, max: 5,  step: 0.1,  label: "지속시간(초)" },
    }, { collapsed: C }),
    전환: folder({
      crossfadeSpeed: { value: 0.001, min: 0.0001, max: 0.01, step: 0.0001, label: "크로스페이드 속도" },
    }, { collapsed: C }),
    "커피 김": folder({
      steamX:            { value: -1.25,  min: -2,   max: 2,   step: 0.01,  label: "위치 X" },
      steamY:            { value:  0.98,  min:  0,   max: 2,   step: 0.01,  label: "위치 Y" },
      steamZ:            { value: -0.946, min: -2,   max: 2,   step: 0.01,  label: "위치 Z" },
      steamW:            { value:  0.12,  min:  0.01, max: 0.4, step: 0.005, label: "폭" },
      steamH:            { value:  0.24,  min:  0.05, max: 0.6, step: 0.01,  label: "높이" },
      steamOpacity:      { value:  0.85,  min:  0,   max: 1,   step: 0.05,  label: "농도" },
      steamColor:        { value: "#fffaf2", label: "색상" },
      steamSpeed:        { value:  0.18,  min:  0,   max: 1,   step: 0.01,  label: "속도" },
      steamSway:         { value:  0.08,  min:  0,   max: 0.3, step: 0.005, label: "흔들림" },
      steamContrastLow:  { value:  0.35,  min:  0,   max: 1,   step: 0.01,  label: "대비 하한" },
      steamContrastHigh: { value:  0.85,  min:  0,   max: 1,   step: 0.01,  label: "대비 상한" },
      steamNoiseScale:   { value:  3.0,   min:  0.5, max: 8,   step: 0.1,   label: "노이즈 촘촘함" },
    }, { collapsed: C }),
    스탠드조명: folder({
      lampOn:               { value: false,     label: "ON/OFF" },
      lampColor:            { value: "#ffe4b0", label: "색상" },
      lampIntensity:        { value: 10.0, min: 0, max: 50,  step: 0.5,  label: "강도" },
      lampDistance:         { value:  3.0, min: 0, max: 10,  step: 0.1,  label: "거리" },
      lampDecay:            { value:  1.0, min: 0, max:  5,  step: 0.1,  label: "감쇠" },
      lampOffsetX:          { value:  0.0,  min: -2, max: 2, step: 0.01, label: "오프셋 X" },
      lampOffsetY:          { value:  0.15, min: -2, max: 2, step: 0.01, label: "오프셋 Y" },
      lampOffsetZ:          { value:  0.0,  min: -2, max: 2, step: 0.01, label: "오프셋 Z" },
      lampEmissiveIntensity:{ value:  3.0, min: 0, max: 20,  step: 0.1,  label: "전구 발광 강도" },
      lampOpacityDay:       { value:  0.25, min: 0, max: 1,  step: 0.05, label: "전구 낮 투명도" },
      lampOpacityNight:     { value:  0.5,  min: 0, max: 1,  step: 0.05, label: "전구 밤 투명도" },
    }, { collapsed: C }),
    달력: folder({
      calendarOffsetX:    { value: 0.0, min: -0.5, max: 0.5, step: 0.001, label: "오프셋 X" },
      calendarOffsetY:    { value: 0.0, min: -0.5, max: 0.5, step: 0.001, label: "오프셋 Y" },
      calendarOffsetZ:    { value: 0.0, min: -0.5, max: 0.5, step: 0.001, label: "오프셋 Z" },
      calendarNightColor: { value: "#4a4a5a", label: "야간 색상" },
    }, { collapsed: C }),
    "노트북 화면 빛번짐": folder({
      laptopGlowIntensityDay:   { value: 0.3, min: 0, max: 5, step: 0.1, label: "낮 강도" },
      laptopGlowIntensityNight: { value: 1.2, min: 0, max: 5, step: 0.1, label: "밤 강도" },
    }, { collapsed: C }),
    "게임보이 화면 빛번짐": folder({
      gbGlowIntensityDay:   { value: 0.2, min: 0, max: 5, step: 0.1, label: "낮 강도" },
      gbGlowIntensityNight: { value: 0.8, min: 0, max: 5, step: 0.1, label: "밤 강도" },
    }, { collapsed: C }),
    별빛파티클: folder({
      starCount:   { value: 300,  min: 0,    max: 500, step: 1,    label: "개수" },
      starSize:    { value: 3.0,  min: 0.01, max: 10,  step: 0.01, label: "크기" },
      starSpeed:   { value: 1.0,  min: 0.1,  max: 3,   step: 0.1,  label: "속도" },
      starOpacity: { value: 1.0,  min: 0,    max: 1,   step: 0.05, label: "밝기" },
      starRangeX:  { value: 3.0,  min: 0.1,  max: 6,   step: 0.1,  label: "범위 X" },
      starRangeY:  { value: 1.4,  min: 0.1,  max: 4,   step: 0.1,  label: "범위 Y" },
      starRangeZ:  { value: 1.4,  min: 0.1,  max: 4,   step: 0.1,  label: "범위 Z" },
      starCenterX: { value: -0.8, min: -3,   max: 3,   step: 0.1,  label: "중심 X" },
      starCenterY: { value:  1.1, min:  0,   max: 3,   step: 0.1,  label: "중심 Y" },
      starCenterZ: { value: -1.1, min: -3,   max: 0,   step: 0.1,  label: "중심 Z" },
    }, { collapsed: C }),
    게임기화면근처: folder({
      bezelColor:     { value: "#1a1a1a", label: "색상" },
      bezelRoughness: { value: 0.9, min: 0, max: 1, step: 0.05, label: "Roughness" },
      bezelMetalness: { value: 0.0, min: 0, max: 1, step: 0.05, label: "Metalness" },
    }, { collapsed: C }),
  });
}