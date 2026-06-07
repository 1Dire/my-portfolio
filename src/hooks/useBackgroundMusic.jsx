import { useEffect, useRef, useState, useCallback } from "react";

/**
 * 방/게임 배경음악 훅 (Web Audio API, 2트랙 크로스페이드).
 *
 * 트랙: room(방 배경) ↔ game(게임보이 줌인 시)
 * 신호: 각 <audio> → 각 trackGain → 공용 lowpass 필터 → master gain → 출력
 *
 * - 첫 제스처에서 start() 호출 (자동재생 정책)
 * - setMode("day"|"night"): 로우패스 필터로 음색 전환 (공용)
 * - setTrack("room"|"game"): 두 곡 크로스페이드
 * - toggleMute: 전체 음소거
 *
 * ⚠ CORS: 오디오는 같은 출처(public/audio/)에 둘 것.
 */
export function useBackgroundMusic({
  roomSrc,
  gameSrc,
  volume = 0.3,
} = {}) {
  const ctxRef = useRef(null);
  const filterRef = useRef(null);
  const masterRef = useRef(null);

  // 트랙별 audio + gain
  const tracks = useRef({
    room: { audio: null, gain: null },
    game: { audio: null, gain: null },
  });

  const baseVol = useRef(volume);
  const mutedRef = useRef(false);
  const modeRef = useRef("day");
  const activeTrackRef = useRef("room");

  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  const DAY_FREQ = 20000;
  const NIGHT_FREQ = 900;
  const NIGHT_VOL_RATIO = 0.6;

  // <audio> 2개 생성
  useEffect(() => {
    const mk = (src) => {
      const a = new Audio(src);
      a.loop = true;
      a.crossOrigin = "anonymous";
      a.preload = "auto";
      return a;
    };
    tracks.current.room.audio = mk(roomSrc);
    tracks.current.game.audio = mk(gameSrc);
    return () => {
      Object.values(tracks.current).forEach((t) => {
        if (t.audio) { t.audio.pause(); t.audio.src = ""; }
      });
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
    };
  }, [roomSrc, gameSrc]);

  // 오디오 그래프 (최초 start 시 1회)
  const buildGraph = useCallback(() => {
    if (ctxRef.current) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = DAY_FREQ;
    filter.Q.value = 0.7;

    const master = ctx.createGain();
    master.gain.value = 0;

    // 각 트랙: source → trackGain → filter
    for (const key of ["room", "game"]) {
      const t = tracks.current[key];
      const src = ctx.createMediaElementSource(t.audio);
      const g = ctx.createGain();
      g.gain.value = key === "room" ? 1 : 0; // 시작은 room만
      src.connect(g);
      g.connect(filter);
      t.gain = g;
    }
    filter.connect(master);
    master.connect(ctx.destination);

    ctxRef.current = ctx;
    filterRef.current = filter;
    masterRef.current = master;
  }, []);

  // master 볼륨 (모드 + 음소거 반영)
  const applyMaster = useCallback((duration = 0.8) => {
    const ctx = ctxRef.current, master = masterRef.current, filter = filterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const night = modeRef.current === "night";
    const isGame = activeTrackRef.current === "game";

    // 필터 (음색): 야간이면 먹먹하게. 단, 게임 중엔 몰입 위해 선명하게 풀어줌
    const freq = night && !isGame ? NIGHT_FREQ : DAY_FREQ;
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.setValueAtTime(filter.frequency.value, now);
    filter.frequency.setTargetAtTime(freq, now, duration);

    // 볼륨 (야간이면 살짝 작게 — 게임 중에도 유지)
    const vol = mutedRef.current ? 0 : baseVol.current * (night ? NIGHT_VOL_RATIO : 1);
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.setTargetAtTime(vol, now, duration);
  }, []);

  // 첫 제스처에서 시작
  const start = useCallback(() => {
    if (started) return;
    buildGraph();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") ctx.resume();
    // 두 트랙 모두 재생 시작 (게인으로 믹싱)
    Object.values(tracks.current).forEach((t) => t.audio.play().catch(() => {}));
    setStarted(true);
    applyMaster(1.5);
  }, [started, buildGraph, applyMaster]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      applyMaster(0.4);
      return next;
    });
  }, [applyMaster]);

  // 주간/야간 음색 전환
  const setMode = useCallback((mode) => {
    modeRef.current = mode;
    applyMaster(0.8);
  }, [applyMaster]);

  // 트랙 크로스페이드 (room ↔ game)
  const setTrack = useCallback((track) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    activeTrackRef.current = track;
    const now = ctx.currentTime;
    for (const key of ["room", "game"]) {
      const g = tracks.current[key].gain;
      if (!g) continue;
      const to = key === track ? 1 : 0;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.setTargetAtTime(to, now, 0.5); // 0.5초 크로스페이드
    }
    // 트랙 바뀌면 필터도 갱신 (게임=선명 / 방=모드 따름)
    applyMaster(0.5);
  }, [applyMaster]);

  return { start, toggleMute, setMode, setTrack, muted, started };
}