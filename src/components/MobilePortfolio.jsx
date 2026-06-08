import { useState } from "react";
import { projects } from "@/data/projects";
import { FiGithub, FiInfo, FiX } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const GITHUB_URL     = "https://github.com/1Dire";
const REPO_URL       = "https://github.com/1Dire/my-portfolio";
const X_URL          = "https://x.com/1Dire_dev";
const MUSIC_URL      = "https://pixabay.com/music/beats-lofi-chill-background-music-508269/";
const GAME_MUSIC_URL = "https://pixabay.com/music/video-games-the-console-of-my-dreams-301289/";

const TAPE_COLORS = [
  "rgba(255, 220, 120, 0.55)",
  "rgba(180, 220, 255, 0.55)",
  "rgba(200, 240, 180, 0.55)",
  "rgba(255, 190, 190, 0.55)",
  "rgba(220, 190, 255, 0.55)",
];
const CARD_BG    = ["#fffef5", "#fff9f0", "#f5fff5", "#f5f8ff", "#fff5fb"];
const STICKER_ROT = [-4, 3, -2, 5, -3, 2, -5, 4];

const TECH_STYLES = {
  "Three.js":   { bg: "#1a1a2e", fg: "#ffffff", bd: "#000000" },
  "GLSL":       { bg: "#ff6b9d", fg: "#5a1230", bd: "#d94d7e" },
  "R3F":        { bg: "#61dafb", fg: "#0a3d4d", bd: "#3bb8da" },
  "React":      { bg: "#61dafb", fg: "#0a3d4d", bd: "#3bb8da" },
  "Vite":       { bg: "#bd34fe", fg: "#ffffff", bd: "#9a1ed8" },
  "Blender":    { bg: "#ea7600", fg: "#3d1e00", bd: "#c25e00" },
  "Spring Boot":{ bg: "#6db33f", fg: "#1c3a0d", bd: "#558a30" },
  "PostgreSQL": { bg: "#336791", fg: "#ffffff", bd: "#244d6e" },
  "Linux":      { bg: "#fcc624", fg: "#3d2f00", bd: "#d9a500" },
  "HTML":       { bg: "#e34f26", fg: "#ffffff", bd: "#b83a18" },
  "CSS":        { bg: "#2965f1", fg: "#ffffff", bd: "#1c4bc2" },
  "HTML/CSS":   { bg: "#e34f26", fg: "#ffffff", bd: "#b83a18" },
  "JavaScript": { bg: "#f7df1e", fg: "#3d3500", bd: "#d4bc00" },
  "DevOps":     { bg: "#326ce5", fg: "#ffffff", bd: "#2253b8" },
  "Vercel":     { bg: "#111111", fg: "#ffffff", bd: "#000000" },
  "IoT":        { bg: "#00979d", fg: "#ffffff", bd: "#00777c" },
  "UI/UX":      { bg: "#ff61f6", fg: "#4d0049", bd: "#d943d0" },
  "Design":     { bg: "#ff61f6", fg: "#4d0049", bd: "#d943d0" },
  "Publishing": { bg: "#9b59b6", fg: "#ffffff", bd: "#7d3f96" },
  "Cannon.js":  { bg: "#4caf93", fg: "#0a3329", bd: "#2e8a70" },
};
const DEFAULT_TECH = { bg: "#d4c4a0", fg: "#3d2f15", bd: "#b09a6e" };

export function MobilePortfolio() {
  const [activeTab, setActiveTab]     = useState("toy");
  const [showCredits, setShowCredits] = useState(false);

  const filtered = projects.filter((p) => p.category === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "rgba(58, 68, 52, 1)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .mp-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .mp-card:active { transform: scale(0.97) !important; }
        .mp-memo-link:active { background: rgba(0,0,0,0.06) !important; }
        .mp-tab { font-family: 'Patrick Hand', cursive; font-size: 19px; cursor: pointer; border: none; background: transparent; padding: 6px 22px; border-radius: 20px; transition: background 0.2s, color 0.2s; }
        .mp-tab.active { background: rgba(210,185,120,0.28); color: rgba(245,230,185,0.95); }
        .mp-tab.inactive { color: rgba(200,175,110,0.4); }
        .mp-icon-btn { transition: background 0.2s; }
        .mp-icon-btn:active { background: rgba(255,255,255,0.1) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,180,120,0.25); border-radius: 2px; }
      `}</style>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 24px 16px", flexShrink: 0, animation: "fadeIn 0.4s ease" }}>
        <div>
          <p style={{ fontFamily: "'Patrick Hand', cursive", color: "rgba(210,190,130,0.55)", fontSize: 16, margin: "0 0 4px", letterSpacing: 3 }}>
            — portfolio
          </p>
          <h1 style={{ fontFamily: "'Patrick Hand', cursive", color: "rgba(248,238,205,0.95)", fontSize: 28, margin: 0 }}>
            Project Notes
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href={X_URL} target="_blank" rel="noopener noreferrer" className="mp-icon-btn"
            style={{ color: "rgba(220,200,145,0.65)", background: "transparent", border: "1px solid rgba(200,175,110,0.3)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaXTwitter size={16} />
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="mp-icon-btn"
            style={{ color: "rgba(220,200,145,0.65)", background: "transparent", border: "1px solid rgba(200,175,110,0.3)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiGithub size={18} />
          </a>
          <button className="mp-icon-btn" onClick={() => setShowCredits(true)}
            style={{ color: "rgba(220,200,145,0.65)", background: "transparent", border: "1px solid rgba(200,175,110,0.3)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <FiInfo size={18} />
          </button>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 24px 14px", borderBottom: "1px solid rgba(200,175,110,0.15)", flexShrink: 0 }}>
        <button className={`mp-tab ${activeTab === "toy" ? "active" : "inactive"}`} onClick={() => setActiveTab("toy")}>Toy Projects</button>
        <button className={`mp-tab ${activeTab === "work" ? "active" : "inactive"}`} onClick={() => setActiveTab("work")}>Work</button>
      </div>

      {/* cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px 32px" }}>
        <div key={activeTab} style={{ display: "flex", flexDirection: "column", gap: 32, animation: "slideUp 0.35s ease" }}>
          {filtered.map((project, i) => {
            const rot       = [-2.2, 1.5, -1.0, 2.0, -1.5, 0.8][i % 6];
            const tapeColor = TAPE_COLORS[i % TAPE_COLORS.length];
            const cardBg    = CARD_BG[i % CARD_BG.length];
            const tapeLeft  = 20 + (i % 3) * 15;

            return (
              <div key={project.id} className="mp-card" style={{ background: cardBg, borderRadius: 2, overflow: "visible", boxShadow: "3px 6px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(0,0,0,0.04)", transform: `rotate(${rot}deg)`, marginTop: 10, position: "relative" }}>
                {/* tape */}
                <div style={{ position: "absolute", top: -6, left: `${tapeLeft}%`, width: 52, height: 18, background: tapeColor, borderRadius: 2, zIndex: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transform: `rotate(${-rot * 0.5}deg)` }} />

                {/* image + stickers */}
                <div style={{ position: "relative", overflow: "visible", borderRadius: "2px 2px 0 0" }}>
                  <div style={{ overflow: "hidden", borderRadius: "2px 2px 0 0" }}>
                    <img src={project.image} alt={project.title} style={{ width: "100%", height: 140, objectFit: "cover", display: "block", filter: "sepia(8%) contrast(0.93) brightness(0.97)" }} loading="lazy" />
                  </div>
                  <div style={{ position: "absolute", bottom: -10, right: 8, display: "flex", flexDirection: "row-reverse", flexWrap: "wrap-reverse", gap: 6, maxWidth: "75%", justifyContent: "flex-start", zIndex: 3 }}>
                    {project.tech.map((t, ti) => {
                      const s = TECH_STYLES[t] || DEFAULT_TECH;
                      return (
                        <span key={t} style={{ fontFamily: "'Patrick Hand', cursive", fontWeight: 600, background: s.bg, color: s.fg, fontSize: 14, lineHeight: 1, padding: "4px 10px 5px", borderRadius: 12, border: "2px solid #fffef5", boxShadow: `0 0 0 1px ${s.bd}, 1px 2px 4px rgba(0,0,0,0.3)`, transform: `rotate(${STICKER_ROT[ti % STICKER_ROT.length]}deg)`, display: "inline-block", whiteSpace: "nowrap" }}>
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* content */}
                <div style={{ padding: "20px 16px 16px", background: "repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(100,140,200,0.1) 23px, rgba(100,140,200,0.1) 24px)" }}>
                  <h3 style={{ fontFamily: "'Patrick Hand', cursive", color: "rgba(40,26,6,0.88)", fontSize: 19, margin: "0 0 8px", lineHeight: 1.3 }}>
                    {project.title}
                  </h3>
                  {project.description && (
                    <p style={{ fontFamily: "'Patrick Hand', cursive", color: "rgba(65,45,15,0.62)", fontSize: 16, lineHeight: 1.5, margin: "0 0 12px" }}>
                      {project.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 7 }}>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="mp-memo-link"
                        style={{ fontFamily: "'Patrick Hand', cursive", color: "rgba(60,42,10,0.72)", fontSize: 18, padding: "4px 15px", border: "1px solid rgba(120,90,30,0.28)", borderRadius: 2, textDecoration: "none", background: "transparent" }}>
                        Live →
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noreferrer" className="mp-memo-link"
                        style={{ fontFamily: "'Patrick Hand', cursive", color: "rgba(60,42,10,0.72)", fontSize: 18, padding: "4px 15px", border: "1px solid rgba(120,90,30,0.28)", borderRadius: 2, textDecoration: "none", background: "transparent" }}>
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

      {/* footer */}
      <div style={{ textAlign: "center", padding: "14px", fontFamily: "'Patrick Hand', cursive", color: "rgba(200,175,110,0.3)", fontSize: 15, flexShrink: 0, borderTop: "1px solid rgba(200,175,110,0.1)" }}>
        experience the 3D version on desktop ✦
      </div>

      {/* credits modal */}
      {showCredits && (
        <div onClick={() => setShowCredits(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#3a4434", border: "1px solid rgba(210,185,120,0.3)", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 360, position: "relative", fontFamily: "'Patrick Hand', cursive" }}>
            <button onClick={() => setShowCredits(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(210,190,130,0.6)", cursor: "pointer" }}>
              <FiX size={20} />
            </button>
            <h2 style={{ color: "rgba(248,238,205,0.95)", fontSize: 24, marginBottom: 4 }}>dire's room</h2>
            <p style={{ color: "rgba(210,190,130,0.5)", fontSize: 15, marginBottom: 20 }}>made by sang-woo lee</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 15, color: "rgba(210,190,130,0.7)" }}>
              <p>✏ 3D modeling & design — sang-woo lee</p>
              <p>{"</>"} development — sang-woo lee</p>
              <p>♪ room music — <a href={MUSIC_URL} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(210,190,130,0.9)" }}>Lofi Chill (Pixabay)</a></p>
              <p>♪ game music — <a href={GAME_MUSIC_URL} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(210,190,130,0.9)" }}>The Console of My Dreams (Pixabay)</a></p>
              <p>⚙ built with React Three Fiber</p>
              <p>{"</>"} source — <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(210,190,130,0.9)" }}>github repo</a></p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(210,185,120,0.15)" }}>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(210,190,130,0.7)", fontSize: 15, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                <FiGithub size={15} /> github.com/1Dire
              </a>
              <a href={X_URL} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(210,190,130,0.7)", fontSize: 15, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                <FaXTwitter size={14} /> @1Dire_dev
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}