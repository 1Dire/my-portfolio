import { useState, useEffect } from "react";

/**
 * 모바일/터치 기기 감지 훅.
 * 화면 너비(<= breakpoint) 또는 터치 지원 여부로 판단.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth <= breakpoint ||
      window.matchMedia("(pointer: coarse)").matches
    );
  });

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth <= breakpoint ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}