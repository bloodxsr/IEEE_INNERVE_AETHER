"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface WorkSlide {
  client: string;
  type: string;
  year: string;
  bg: string;
  image: string;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const WORKS: WorkSlide[] = [
  { client: "ArmorClaw Secure Ingestion", type: "PII Scrubbing + Hashing", year: "ONLINE", bg: "#0d0d0d", image: "" },
  { client: "Prior-Art Retrieval Mesh", type: "Pinecone + SerpApi", year: "ONLINE", bg: "#0a0a0a", image: "" },
  { client: "10-Module Intelligence Pipeline", type: "TypeScript Orchestrator", year: "ONLINE", bg: "#111111", image: "" },
  { client: "Patent Draft Generator", type: "Claims + Description", year: "ONLINE", bg: "#0e0e0e", image: "" },
  { client: "Team Builder Engine", type: "Skill Match + Ranking", year: "ONLINE", bg: "#0c0c0c", image: "" },
  { client: "Timestamp Evidence Ledger", type: "Certificate + Block Hash", year: "ONLINE", bg: "#101010", image: "" },
];

const SERVICES = [
  {
    num: "(01)",
    title: "Idea-to-IP Intelligence",
    items: [
      "Patent Readiness Scoring",
      "Novelty + Legal Risk Analysis",
      "Pivot & Architecture Guidance",
      "Plagiarism Similarity Detection",
    ],
  },
  {
    num: "(02)",
    title: "Research Execution Pipeline",
    items: [
      "Live Prior-Art Retrieval",
      "Landscape Clustering",
      "White-Space Opportunity Mapping",
      "Startup Asset Generation",
      "Prototype Recommendations",
    ],
  },
  {
    num: "(03)",
    title: "Backend Systems",
    items: [
      "TypeScript Intelligence Modules",
      "Next.js API Endpoint Layer",
      "Supabase Identity + Collaborators",
      "Dynamic Route Guarding",
      "Telemetry Health Monitoring",
    ],
  },
  {
    num: "(04)",
    title: "Compliance & Traceability",
    items: [
      "ArmorClaw PII Redaction",
      "Secure Metadata Signatures",
      "Timestamp Certificates",
      "Zero Synthetic Data Workflow",
    ],
  },
];

/* ─────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────── */
function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─────────────────────────────────────────────
   NOISE TEXTURE (SVG data-uri)
───────────────────────────────────────────── */
const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

// ── Navigation ──────────────────────────────
function Navigation() {
  const [open, setOpen] = useState(false);
  const [linksVisible, setLinksVisible] = useState(false);

  const openMenu = useCallback(() => {
    setOpen(true);
    setTimeout(() => setLinksVisible(true), 320);
  }, []);

  const closeMenu = useCallback(() => {
    setLinksVisible(false);
    setTimeout(() => setOpen(false), 420);
  }, []);

  const navLinks = ["Works", "About"];
  const externalLinks = ["GitHub ↗", "LinkedIn ↗", "INFO@AETHER.AI"];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 48px",
          background: "transparent",
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "18px",
            color: "var(--text)",
            textDecoration: "none",
            letterSpacing: "0.05em",
            fontWeight: 400,
          }}
        >
          aether
        </a>
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link
            href="/status"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#aaa",
              textDecoration: "none",
              borderBottom: "1px dashed #333",
              paddingBottom: "2px",
              pointerEvents: "auto"
            }}
          >
            System Telemetry
          </Link>
          <Link
            href="/onboarding"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#aaa",
              textDecoration: "none",
              pointerEvents: "auto"
            }}
          >
            Register Identity
          </Link>
          <button
            onClick={open ? closeMenu : openMenu}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "var(--text)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              pointerEvents: "auto"
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Full-screen overlay */}
      <div
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "#000",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.76, 0, 0.24, 1)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "32px",
          }}
        >
          {navLinks.map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={closeMenu}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 8vw, 96px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--text)",
                textDecoration: "none",
                opacity: linksVisible ? 1 : 0,
                transform: linksVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 500ms ease ${i * 80}ms, transform 500ms ease ${i * 80}ms`,
                lineHeight: 1,
              }}
            >
              {link}
            </a>
          ))}

          <div
            style={{
              width: "80px",
              height: "1px",
              background: "var(--border)",
              opacity: linksVisible ? 1 : 0,
              transition: `opacity 500ms ease ${navLinks.length * 80}ms`,
            }}
          />

          {externalLinks.map((link, i) => (
            <a
              key={link}
              href={link.includes("@") ? `mailto:${link}` : "#"}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                letterSpacing: "0.1em",
                color: "var(--muted)",
                textDecoration: "none",
                opacity: linksVisible ? 1 : 0,
                transform: linksVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 400ms ease ${(navLinks.length + 1 + i) * 80}ms, transform 400ms ease ${(navLinks.length + 1 + i) * 80}ms`,
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Hero ─────────────────────────────────────
function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    const setSize = () => {
       w = window.innerWidth;
       h = window.innerHeight;
       canvas.width = w * dpr;
       canvas.height = h * dpr;
       ctx.scale(dpr, dpr);
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Particle map array
    let particles: { x: number, y: number, bx: number, by: number, vx: number, vy: number, mapped: boolean }[] = [];
    const gridSize = 8; // Tighter grid density to heavily increase the ASCII effect
    const asciiChars = "RTEAFKMOV34#%+@~*:;"; // Foreground matrix
    
    const initParticles = () => {
       particles = [];
       const offC = document.createElement("canvas");
       offC.width = w; offC.height = h;
       const offCtx = offC.getContext("2d");
       if (!offCtx) return;
       offCtx.fillStyle = "white";
       offCtx.fillRect(0,0,w,h);
       offCtx.fillStyle = "black";
       
       const fontSize = Math.min(w / 4.0, 350); // Scale up root font
       offCtx.font = `italic 900 ${fontSize}px "Inter", sans-serif`; // Restored italic slant
       offCtx.textAlign = "center";
       offCtx.textBaseline = "middle";
       
       offCtx.fillText("aether", w/2, h/2);
       
       const idata = offCtx.getImageData(0,0,w,h).data;
       
       for (let y = 0; y < h; y += gridSize) {
         for (let x = 0; x < w; x += gridSize) {
             const i = (y * w + x) * 4;
             // If pixel is black (text area)
             const isText = idata[i] < 128;
             if (isText || Math.random() > 0.96) { // Reduced background spawn density and spread
                 particles.push({
                     x: x + Math.random() * 50 - 25,
                     y: y + Math.random() * 50 - 25,
                     bx: x,
                     by: y,
                     vx: 0,
                     vy: 0,
                     mapped: isText
                 });
             }
         }
       }
    };
    initParticles();
    window.addEventListener("resize", initParticles);

    // Mouse Tracking
    let mx = -1000;
    let my = -1000;
    let isHover = false;
    
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; isHover = true; };
    const out = () => { isHover = false; };
    
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseout", out);

    let rafId: number;
    const render = () => {
       rafId = requestAnimationFrame(render);
       
       // Pure black background
       ctx.fillStyle = "#000000";
       ctx.fillRect(0, 0, w, h);

       // Restore faint grid styling for console aesthetic
       ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
       ctx.lineWidth = 1;
       ctx.beginPath();
       for(let x=0; x<w; x+=gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
       for(let y=0; y<h; y+=gridSize) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
       ctx.stroke();
       
       ctx.fillStyle = "#ffffff";
       ctx.font = `900 ${gridSize * 1.3}px "Space Mono", monospace`; // Dialed to 1.3x for heavy but readable matrix look
       ctx.textAlign = "center";
       ctx.textBaseline = "middle";
       
       const activeMx = isHover ? mx : -1000;
       const activeMy = isHover ? my : -1000;

       for (let i = 0; i < particles.length; i++) {
           const p = particles[i];
           
           // Background teleportation (disappear & reappear)
           if (!p.mapped && Math.random() > 0.96) {
               p.bx = Math.floor((Math.random() * w) / gridSize) * gridSize;
               p.by = Math.floor((Math.random() * h) / gridSize) * gridSize;
               p.x = p.bx;
               p.y = p.by;
           }
           
           // Repel behavior
           const dx = activeMx - p.x;
           const dy = activeMy - p.y;
           const dist = Math.sqrt(dx*dx + dy*dy);
           const radius = 150;
           
           if (dist < radius) {
               const force = (radius - dist) / radius;
               const angle = Math.atan2(dy, dx);
               p.vx -= Math.cos(angle) * force * 2.5;
               p.vy -= Math.sin(angle) * force * 2.5;
           }
           
           // Return to base
           p.vx += (p.bx - p.x) * 0.08;
           p.vy += (p.by - p.y) * 0.08;
           
           // Damping
           p.vx *= 0.82;
           p.vy *= 0.82;
           
           p.x += p.vx;
           p.y += p.vy;
           
           // Depth Alpha effect
           const distFromBase = Math.sqrt(Math.pow(p.x - p.bx, 2) + Math.pow(p.y - p.by, 2));
           const alpha = Math.max(0.1, 1 - (distFromBase / 100));
           ctx.globalAlpha = p.mapped ? 1.0 : alpha * 0.15;
            
           // Map text gets intense random ASCII, background gets standard binary 01
           const charToDraw = p.mapped ? asciiChars[Math.floor(Math.random() * asciiChars.length)] : (Math.random() > 0.5 ? "1" : "0");
           ctx.fillText(charToDraw, p.x, p.y);
       }
       ctx.globalAlpha = 1.0;
    };
    render();

    return () => {
       window.removeEventListener("resize", setSize);
       window.removeEventListener("resize", initParticles);
       window.removeEventListener("mousemove", move);
       window.removeEventListener("mouseout", out);
       cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", background: "#000", overflow: "hidden" }}>
       <canvas ref={canvasRef} style={{ display: "block", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
       
       <div style={{ position: "absolute", bottom: "40px", width: "100%", padding: "0 clamp(24px, 4vw, 40px)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", pointerEvents: "none", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", color: "#ddd", textTransform: "uppercase", lineHeight: 1.6 }}>
          <div>
           IDENTITY-FIRST ACCESS.<br/>SECURE INGESTION ENABLED.
          </div>
          <div style={{ maxWidth: "500px", textAlign: "left" }}>
           AETHER TRANSFORMS RESEARCH IDEAS INTO EXECUTION-GRADE OUTPUTS:<br/>READINESS, LANDSCAPE, DRAFTING, TEAM MATCHING, AND STARTUP ASSETS.
          </div>
       </div>
    </section>
  );
}

// ── Selected Works ───────────────────────────
function WorksSection() {
  return (
    <section id="works" style={{ width: "100%", background: "#000", padding: "120px clamp(24px, 5vw, 80px)", display: "flex", flexDirection: "column", gap: "64px", zIndex: 10, position: "relative" }}>
      {/* Top Header */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "8px", color: "white", marginBottom: "32px" }}>
         <div style={{ width: 6, height: 6, background: "#00ff66" }} />
         SYSTEM ARCHITECTURE
      </div>

      {WORKS.map((work, i) => (
        <div key={`work-${i}`} style={{ display: "flex", flexDirection: "column", border: "1px solid #222", background: "#080808", padding: "clamp(32px, 5vw, 64px)", transition: "border-color 0.3s ease" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#444"} onMouseLeave={e => e.currentTarget.style.borderColor = "#222"}>
           
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: "64px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#111", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#888" }}>
                {String(i + 1).padStart(2, '0')}
              </div>
           </div>

           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", color: "white", flexWrap: "wrap", gap: "32px" }}>
               <h2 style={{ fontFamily: "var(--font-mono)", fontWeight: 400, fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.2, textTransform: "uppercase", margin: 0, letterSpacing: "-0.02em" }}>
                 {work.client}
               </h2>
               <div style={{ display: "flex", gap: "clamp(24px, 4vw, 64px)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", textAlign: "left" }}>
                 <div>
                   <div style={{ color: "var(--muted)", marginBottom: "8px" }}>NODE</div>
                   <div style={{ textTransform: "uppercase", color: "#ccc" }}>{work.client}</div>
                 </div>
                 <div>
                   <div style={{ color: "var(--muted)", marginBottom: "8px" }}>PROTOCOL</div>
                   <div style={{ textTransform: "uppercase", color: "#ccc" }}>{work.type}</div>
                 </div>
                 <div>
                   <div style={{ color: "var(--muted)", marginBottom: "8px" }}>STATUS</div>
                   <div style={{ color: "#00ff66" }}>{work.year}</div>
                 </div>
               </div>
            </div>
        </div>
      ))}
    </section>
  );
}

// ── Identity ─────────────────────────────────
function IdentitySection() {
  const { ref, visible } = useIntersection(0.15);
  const { ref: textRef, visible: textVisible } = useIntersection(0.15);
  const { ref: contentRef, visible: contentVisible } = useIntersection(0.1);
  const imgElRef = useRef<HTMLDivElement>(null);

  const words = ["Research", "to", "IP,", "without", "the", "guesswork."];
  const italicWords = ["without"];

  useEffect(() => {
    const handleScroll = () => {
      if (!imgElRef.current) return;
      const rect = imgElRef.current.parentElement!.getBoundingClientRect();
      const scrollProgress = (window.innerHeight / 2 - rect.top) * 0.2;
      imgElRef.current.style.transform = `translateY(${scrollProgress}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="about"
      style={{ padding: "clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)" }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <hr />

        <div style={{ paddingTop: "clamp(60px, 8vw, 120px)" }}>
          <span
            ref={ref as React.RefObject<HTMLElement>}
            className={`section-label${visible ? " visible" : ""}`}
            style={{ display: "block", marginBottom: "64px" }}
          >
            02&nbsp;&nbsp;/&nbsp;&nbsp;Platform identity
          </span>

          {/* Large editorial type */}
          <div
            ref={textRef as React.RefObject<HTMLDivElement>}
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "clamp(48px, 6vw, 96px)",
            }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                className={`word-reveal${textVisible ? " visible" : ""}`}
                style={{
                  display: "inline-block",
                  marginRight: "0.3em",
                  fontStyle: italicWords.includes(word) ? "italic" : "normal",
                  fontSize: italicWords.includes(word) ? "1.05em" : undefined,
                  transitionDelay: textVisible ? `${i * 80}ms` : "0ms",
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Right content */}
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(32px, 4vw, 80px)",
              alignItems: "start",
            }}
          >
            {/* Text block */}
            <div
              className={`reveal${contentVisible ? " visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                  marginBottom: "24px",
                }}
              >
                What Aether Does
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 1.2vw, 16px)",
                  lineHeight: 1.8,
                  color: "var(--muted)",
                  fontWeight: 300,
                }}
              >
                Aether is an end-to-end research intelligence platform built for
                labs, founders, and product teams. It runs secure ingestion,
                retrieves live prior art, scores patent readiness, and generates
                clear execution outputs in one backend flow.
              </p>
              <p
                style={{
                  fontSize: "clamp(14px, 1.2vw, 16px)",
                  lineHeight: 1.8,
                  color: "var(--muted)",
                  fontWeight: 300,
                  marginTop: "20px",
                }}
              >
                Register identity, submit an idea or paper, and run the full
                pipeline: novelty analysis, legal risk signals, collaborator
                matching, draft generation, and timestamp certification.
              </p>
            </div>

            {/* Parallax image */}
            <div
              style={{
                overflow: "hidden",
                aspectRatio: "4/5",
                position: "relative",
              }}
            >
              <div
                ref={imgElRef}
                style={{
                  width: "100%",
                  height: "115%",
                  background: "#0d0d0d",
                  willChange: "transform",
                  ...GRAIN_STYLE,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Expertise ────────────────────────────────
function ExpertiseSection() {
  const { ref, visible } = useIntersection(0.1);
  const { ref: colRef, visible: colVisible } = useIntersection(0.1);

  return (
    <section
      style={{ padding: "clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)" }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <hr />

        <div style={{ paddingTop: "clamp(60px, 8vw, 120px)" }}>
          <span
            ref={ref as React.RefObject<HTMLElement>}
            className={`section-label${visible ? " visible" : ""}`}
            style={{ display: "block", marginBottom: "64px" }}
          >
            03&nbsp;&nbsp;/&nbsp;&nbsp;From signal to execution
          </span>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              textTransform: "uppercase" as const,
              marginBottom: "clamp(64px, 8vw, 120px)",
            }}
          >
            Ingest. Analyze. Draft. Launch.
            <br />
            One TypeScript backend, ten intelligence modules.
          </h2>

          <div
            ref={colRef as React.RefObject<HTMLDivElement>}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "clamp(24px, 3vw, 48px)",
            }}
          >
            {SERVICES.map((svc, i) => (
              <div
                key={i}
                className={`col-reveal${colVisible ? " visible" : ""}`}
                style={{
                  transitionDelay: colVisible ? `${i * 150}ms` : "0ms",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "32px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  {svc.num}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(16px, 1.5vw, 20px)",
                    color: "var(--text)",
                    marginBottom: "20px",
                    lineHeight: 1.2,
                  }}
                >
                  {svc.title}
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: "8px",
                  }}
                >
                  {svc.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.6,
                        color: "var(--muted)",
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        padding:
          "clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px) clamp(40px, 5vw, 80px)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <hr />

        <div
          style={{
            paddingTop: "clamp(40px, 5vw, 64px)",
            display: "flex",
            flexWrap: "wrap" as const,
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "32px",
            marginBottom: "clamp(48px, 6vw, 80px)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(14px, 1.5vw, 18px)",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              color: "var(--text)",
            }}
          >
            Aether Intelligence Platform
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.9,
              color: "var(--muted)",
              letterSpacing: "0.05em",
              textAlign: "right" as const,
            }}
          >
            Built for research teams
            <br />
            Secure by design, telemetry visible
          </p>
        </div>

        <hr />

        <div
          style={{
            paddingTop: "clamp(24px, 3vw, 40px)",
            display: "flex",
            flexWrap: "wrap" as const,
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <a
            href="/status"
            className="link-hover"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            System Telemetry
          </a>
          <a
            href="mailto:ops@aether.ai"
            className="link-hover"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            ops@aether.ai
          </a>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.05em",
            }}
          >
            Built on Next.js APIs, Gemini, Pinecone, and Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function Page() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    
    let scrollTarget = 0;
    let scrollCurrent = 0;
    const scrollEase = 0.08;
    let animationFrameId: number;

    const setBodyHeight = () => {
      document.body.style.height = `${wrapper.getBoundingClientRect().height}px`;
    };
    
    const ro = new ResizeObserver(setBodyHeight);
    ro.observe(wrapper);

    const smoothScroll = () => {
      scrollTarget = window.scrollY;
      scrollCurrent += (scrollTarget - scrollCurrent) * scrollEase;
      const roundedScroll = Math.round(scrollCurrent * 100) / 100;
      wrapper.style.transform = `translate3d(0, -${roundedScroll}px, 0)`;
      animationFrameId = requestAnimationFrame(smoothScroll);
    };
    animationFrameId = requestAnimationFrame(smoothScroll);
    
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animationFrameId);
      document.body.style.height = "";
    };
  }, []);

  return (
    <>
      <Navigation />
      <div ref={wrapperRef} style={{ width: "100%", position: "fixed", top: 0, left: 0, willChange: "transform" }}>
        <main>
          <HeroSection />
          <hr
            style={{
              maxWidth: "calc(100% - clamp(48px, 10vw, 160px))",
              margin: "0 auto",
            }}
          />
          <WorksSection />
          <IdentitySection />
          <ExpertiseSection />
        </main>
        <Footer />
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.1em",
          color: "var(--muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 50,
          transition: "color 300ms ease",
        }}
        onMouseEnter={(e) =>
          ((e.target as HTMLButtonElement).style.color = "var(--text)")
        }
        onMouseLeave={(e) =>
          ((e.target as HTMLButtonElement).style.color = "var(--muted)")
        }
      >
        Back to top
      </button>
    </>
  );
}
