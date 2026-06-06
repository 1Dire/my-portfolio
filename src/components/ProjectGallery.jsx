import { useEffect, useState } from "react";
import { projects } from "@/data/projects";
import { useIsMobile } from "@/hooks/useIsMobile";

const TAPE_COLORS = [
  "rgba(255, 220, 120, 0.55)",
  "rgba(180, 220, 255, 0.55)",
  "rgba(200, 240, 180, 0.55)",
  "rgba(255, 190, 190, 0.55)",
  "rgba(220, 190, 255, 0.55)",
];

const CARD_BG = [
  "#fffef5",
  "#fff9f0",
  "#f5fff5",
  "#f5f8ff",
  "#fff5fb",
];

// 기술별 스티커 색상 (배경 / 글자 / 테두리)
const TECH_STYLES = {
  "Three.js":            { bg: "#1a1a2e", fg: "#ffffff", bd: "#000000" },
  "GLSL":                { bg: "#ff6b9d", fg: "#5a1230", bd: "#d94d7e" },
  "R3F":                 { bg: "#61dafb", fg: "#0a3d4d", bd: "#3bb8da" },
  "React":               { bg: "#61dafb", fg: "#0a3d4d", bd: "#3bb8da" },
  "Vite":                { bg: "#bd34fe", fg: "#ffffff", bd: "#9a1ed8" },
  "Blender":             { bg: "#ea7600", fg: "#3d1e00", bd: "#c25e00" },
  "Cannon.js":           { bg: "#4caf93", fg: "#0a3329", bd: "#2e8a70" },
  "Spring Boot":         { bg: "#6db33f", fg: "#1c3a0d", bd: "#558a30" },
  "PostgreSQL":          { bg: "#336791", fg: "#ffffff", bd: "#244d6e" },
  "Linux":               { bg: "#fcc624", fg: "#3d2f00", bd: "#d9a500" },
  "HTML":                { bg: "#e34f26", fg: "#ffffff", bd: "#b83a18" },
  "CSS":                 { bg: "#2965f1", fg: "#ffffff", bd: "#1c4bc2" },
  "HTML/CSS":            { bg: "#e34f26", fg: "#ffffff", bd: "#b83a18" },
  "JavaScript":          { bg: "#f7df1e", fg: "#3d3500", bd: "#d4bc00" },
  "DevOps":              { bg: "#326ce5", fg: "#ffffff", bd: "#2253b8" },
  "Vercel":              { bg: "#111111", fg: "#ffffff", bd: "#000000" },
  "IoT":                 { bg: "#00979d", fg: "#ffffff", bd: "#00777c" },
  "UI/UX":               { bg: "#ff61f6", fg: "#4d0049", bd: "#d943d0" },
  "Design":              { bg: "#ff61f6", fg: "#4d0049", bd: "#d943d0" },
  "Publishing":          { bg: "#9b59b6", fg: "#ffffff", bd: "#7d3f96" },
};

// 정의 안 된 기술 기본 스타일
const DEFAULT_TECH = { bg: "#d4c4a0", fg: "#3d2f15", bd: "#b09a6e" };

// 스티커마다 살짝 다른 기울기
const STICKER_ROT = [-4, 3, -2, 5, -3, 2, -5, 4];



export function ProjectGallery({ onClose }) {
  const [activeTab, setActiveTab] = useState("toy");
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filtered = projects.filter((p) => p.category === activeTab);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(58, 68, 52, 0.9)",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      animation: "fadeIn 0.35s ease",
      backdropFilter: "blur(8px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .project-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          will-change: transform;
          outline: 1px solid transparent;
        }
        .project-card > div:first-of-type,
        .project-card img {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .project-card:hover {
          transform: translateY(-8px) rotate(0deg) scale(1.02) !important;
          box-shadow: 6px 16px 32px rgba(0,0,0,0.35) !important;
          z-index: 10;
        }
        .memo-link:hover {
          background: rgba(0,0,0,0.06) !important;
        }
        .close-btn:hover {
          background: rgba(255,255,255,0.12) !important;
        }
        .tab-btn {
          font-family: 'Patrick Hand', cursive;
          font-size: 19px;
          cursor: pointer;
          border: none;
          background: transparent;
          padding: 6px 22px;
          border-radius: 20px;
          transition: background 0.2s, color 0.2s;
          letter-spacing: 0.3px;
        }
        .tab-btn.active {
          background: rgba(210, 185, 120, 0.28);
          color: rgba(245, 230, 185, 0.95);
        }
        .tab-btn.inactive {
          color: rgba(200, 175, 110, 0.4);
        }
        .tab-btn.inactive:hover {
          color: rgba(220, 200, 140, 0.65);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,180,120,0.25); border-radius: 2px; }
      `}</style>

      {/* 헤더 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: isMobile ? "20px 20px 14px" : "28px 48px 18px",
        flexShrink: 0,
      }}>
        <div>
          <p style={{
            fontFamily: "'Patrick Hand', cursive",
            color: "rgba(210, 190, 130, 0.55)",
            fontSize: 17,
            margin: "0 0 4px",
            letterSpacing: 3,
          }}>
            — portfolio
          </p>
          <h1 style={{
            fontFamily: "'Patrick Hand', cursive",
            color: "rgba(248, 238, 205, 0.95)",
            fontSize: isMobile ? 26 : 32,
            fontWeight: 600,
            margin: 0,
          }}>
            Project Notes
          </h1>
        </div>
        <button
          className="close-btn"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid rgba(200, 175, 110, 0.3)",
            borderRadius: "50%",
            color: "rgba(220, 200, 145, 0.65)",
            width: 40,
            height: 40,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Patrick Hand', cursive",
            fontSize: 19,
            transition: "background 0.2s",
          }}
        >
          ✕
        </button>
      </div>

      {/* 탭 */}
      <div style={{
        display: "flex",
        gap: 4,
        padding: isMobile ? "0 20px 14px" : "0 48px 16px",
        borderBottom: "1px solid rgba(200, 175, 110, 0.15)",
        flexShrink: 0,
      }}>
        <button className={`tab-btn ${activeTab === "toy" ? "active" : "inactive"}`} onClick={() => setActiveTab("toy")}>
          Toy Projects
        </button>
        <button className={`tab-btn ${activeTab === "work" ? "active" : "inactive"}`} onClick={() => setActiveTab("work")}>
          Work
        </button>
      </div>

      {/* 갤러리 */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "24px 20px 24px" : "40px 48px 32px" }}>
        <div
          key={activeTab}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(250px, 1fr))",
            gap: isMobile ? 16 : 36,
            animation: "slideUp 0.35s ease",
          }}
        >
          {filtered.map((project, i) => {
            const rotations = [-2.2, 1.5, -1.0, 2.0, -1.5, 0.8, -1.8, 1.2];
            const rot = rotations[i % rotations.length];
            const tapeColor = TAPE_COLORS[i % TAPE_COLORS.length];
            const cardBg = CARD_BG[i % CARD_BG.length];
            const tapeLeft = 20 + (i % 3) * 15;

            return (
              <div
                key={project.id}
                className="project-card"
                style={{
                  background: cardBg,
                  borderRadius: 2,
                  overflow: "visible",
                  boxShadow: "3px 6px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(0,0,0,0.04)",
                  transform: `rotate(${rot}deg)`,
                  marginTop: 16,
                }}
              >

                {/* 테이프 */}
                <div style={{
                  position: "absolute",
                  top: -6,
                  left: `${tapeLeft}%`,
                  width: 52,
                  height: 18,
                  background: tapeColor,
                  borderRadius: 2,
                  zIndex: 1,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transform: `rotate(${-rot * 0.5}deg)`,
                }} />

                {/* 이미지 + 스티커 */}
                <div style={{ position: "relative", overflow: "visible", borderRadius: "2px 2px 0 0" }}>
                  <div style={{
                    overflow: "hidden",
                    borderRadius: "2px 2px 0 0",
                    transform: "translateZ(0)",
                    WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                  }}>
                    <img
                      src={project.image}
                      alt={project.title}
                      style={{
                        width: "100%",
                        height: 155,
                        objectFit: "cover",
                        display: "block",
                        filter: "sepia(8%) contrast(0.93) brightness(0.97)",
                      }}
                    />
                  </div>

                  {/* 다꾸 스티커 - 이미지 위에 흩뿌림 */}
                  <div style={{
                    position: "absolute",
                    bottom: -10,
                    right: 8,
                    display: "flex",
                    flexDirection: "row-reverse",
                    flexWrap: "wrap-reverse",
                    gap: 6,
                    maxWidth: "75%",
                    justifyContent: "flex-start",
                    zIndex: 3,
                  }}>
                    {project.tech.map((t, ti) => {
                      const s = TECH_STYLES[t] || DEFAULT_TECH;
                      const stickerRot = STICKER_ROT[ti % STICKER_ROT.length];
                      return (
                        <span
                          key={t}
                          style={{
                            fontFamily: "'Patrick Hand', cursive",
                            fontWeight: 600,
                            background: s.bg,
                            color: s.fg,
                            fontSize: 15,
                            lineHeight: 1,
                            padding: "4px 11px 5px",
                            borderRadius: 12,
                            border: `2px solid #fffef5`,
                            boxShadow: `0 0 0 1px ${s.bd}, 1px 2px 4px rgba(0,0,0,0.3)`,
                            transform: `rotate(${stickerRot}deg)`,
                            display: "inline-block",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* 줄선 배경 콘텐츠 영역 */}
                <div style={{
                  padding: "20px 16px 16px",
                  background: `repeating-linear-gradient(
                    to bottom,
                    transparent,
                    transparent 23px,
                    rgba(100, 140, 200, 0.1) 23px,
                    rgba(100, 140, 200, 0.1) 24px
                  )`,
                }}>
                  <h3 style={{
                    fontFamily: "'Patrick Hand', cursive",
                    color: "rgba(40, 26, 6, 0.88)",
                    fontSize: 19,
                    fontWeight: 600,
                    margin: "0 0 8px",
                    lineHeight: 1.3,
                  }}>
                    {project.title}
                  </h3>

                  {project.description && (
                    <p style={{
                      fontFamily: "'Patrick Hand', cursive",
                      color: "rgba(65, 45, 15, 0.62)",
                      fontSize: 17,
                      lineHeight: 1.5,
                      margin: "0 0 12px",
                    }}>
                      {project.description}
                    </p>
                  )}

                  {/* 링크 버튼 */}
                  <div style={{ display: "flex", gap: 7 }}>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="memo-link"
                        style={{
                          fontFamily: "'Patrick Hand', cursive",
                          color: "rgba(60, 42, 10, 0.72)",
                          fontSize: 19,
                          padding: "4px 15px",
                          border: "1px solid rgba(120, 90, 30, 0.28)",
                          borderRadius: 2,
                          textDecoration: "none",
                          background: "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        Live →
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="memo-link"
                        style={{
                          fontFamily: "'Patrick Hand', cursive",
                          color: "rgba(60, 42, 10, 0.72)",
                          fontSize: 19,
                          padding: "4px 15px",
                          border: "1px solid rgba(120, 90, 30, 0.28)",
                          borderRadius: 2,
                          textDecoration: "none",
                          background: "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        GitHub →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 힌트 */}
      <div style={{
        textAlign: "center",
        padding: "14px",
        fontFamily: "'Patrick Hand', cursive",
        color: "rgba(200, 175, 110, 0.3)",
        fontSize: 16,
        flexShrink: 0,
      }}>
        esc to close
      </div>
    </div>
  );
}