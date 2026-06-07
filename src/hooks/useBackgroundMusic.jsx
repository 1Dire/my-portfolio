import { useEffect, useRef, useState, useCallback } from "react";

/**
 * 방 배경음악 훅 (Web Audio API).
 * 신호 경로: <audio> → MediaElementSource → lowpass 필터 → gain(볼륨) → 출력
 *
 * - 자동재생 정책 때문에 첫 사용자 제스처 후 start() 호출 필요
 * - 음소거 토글 + 부드러운 페이드
 * - setMode("day" | "night"): 로우패스 필터로 음색 전환
 *     day   = 필터 열림(선명)
 *     night = 필터 닫힘(먹먹/아늑)
 *
 * ⚠ CORS: 오디오는 같은 출처(public/audio/)에 둬야 필터가 걸림. 외부 URL 스트리밍은 막힘.
 *
 * 사용:
 *   const bgm = useBackgroundMusic("/audio/room-bgm.mp3", { volume: 0.3 });
 *   <button onClick={bgm.start}>Enter</button>
 *   <button onClick={bgm.toggleMute}>{bgm.muted ? "🔇" : "🔊"}</button>
 *   bgm.setMode("night"); // 야간 전환
 */
export function useBackgroundMusic(src, { volume = 0.3, loop = true } = {}) {
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const filterRef = useRef(null);
  const gainRef = useRef(null);
  const baseVol = useRef(volume);    // 기준 볼륨 (주간)
  const targetVol = useRef(volume);  // 현재 목표 볼륨 (모드 반영)
  const mutedRef = useRef(false);    // 클로저 회피용

  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // 주간/야간 필터 주파수 (Hz). 높을수록 선명, 낮을수록 먹먹.
  const DAY_FREQ = 20000;  // 사실상 필터 없음 (선명)
  const NIGHT_FREQ = 900;  // 고음 크게 깎음 (아늑/먹먹)
  const NIGHT_VOL_RATIO = 0.6; // 야간엔 기준 볼륨의 60%

  // <audio> 엘리먼트 1회 생성
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
    };
  }, [src, loop]);

  // 오디오 그래프 구성 (최초 start 시 1회)
  const buildGraph = useCallback(() => {
    if (ctxRef.current) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const source = ctx.createMediaElementSource(audioRef.current);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = DAY_FREQ;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    ctxRef.current = ctx;
    filterRef.current = filter;
    gainRef.current = gain;
  }, []);

  // 첫 제스처에서 재생 시작
  const start = useCallback(() => {
    if (started) return;
    buildGraph();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") ctx.resume();
    audioRef.current.play().then(() => {
      setStarted(true);
      const now = ctx.currentTime;
      // 부드러운 페이드 인
      gainRef.current.gain.cancelScheduledValues(now);
      gainRef.current.gain.setValueAtTime(0, now);
      gainRef.current.gain.linearRampToValueAtTime(muted ? 0 : targetVol.current, now + 1.5);
    }).catch(() => {});
  }, [started, muted, buildGraph]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      const ctx = ctxRef.current, gain = gainRef.current;
      if (ctx && gain) {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(next ? 0 : targetVol.current, now + 0.4);
      }
      return next;
    });
  }, []);

  // 주간/야간 음색 + 볼륨 전환
  const setMode = useCallback((mode) => {
    const ctx = ctxRef.current, filter = filterRef.current, gain = gainRef.current;
    if (!ctx || !filter) return;
    const now = ctx.currentTime;

    // 필터: 야간이면 먹먹하게
    const freq = mode === "night" ? NIGHT_FREQ : DAY_FREQ;
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.setValueAtTime(filter.frequency.value, now);
    filter.frequency.setTargetAtTime(freq, now, 0.8);

    // 볼륨: 야간이면 살짝 작게
    targetVol.current = mode === "night"
      ? baseVol.current * NIGHT_VOL_RATIO
      : baseVol.current;
    if (gain && !mutedRef.current) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.setTargetAtTime(targetVol.current, now, 0.8);
    }
  }, []);

  return { start, toggleMute, setMode, muted, started };
}