"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  { client: "Stripe UI", type: "Frontend Engineering", year: "2025", bg: "#0d0d0d", image: "/works/1.png" },
  { client: "Linear App", type: "Design System", year: "2024", bg: "#0a0a0a", image: "/works/2.png" },
  { client: "Vercel", type: "WebGL Animation", year: "2024", bg: "#111111", image: "/works/3.png" },
  { client: "Acme Corp", type: "Fullstack Architecture", year: "2023", bg: "#0e0e0e", image: "/works/4.png" },
  { client: "Hyperplex", type: "Creative Direction", year: "2023", bg: "#0c0c0c", image: "/works/5.png" },
  { client: "Nexus", type: "Web App Development", year: "2022", bg: "#101010", image: "/works/6.png" },
];

const SERVICES = [
  {
    num: "(01)",
    title: "Creative Development",
    items: [
      "Frontend Architecture",
      "WebGL & 3D Experiences",
      "Interactive Animations",
      "Performance Tuning",
    ],
  },
  {
    num: "(02)",
    title: "UI/UX Engineering",
    items: [
      "Design System Integration",
      "Micro-Interactions",
      "Responsive Layouts",
      "Accessibility (a11y)",
      "Design-to-Code Translation",
    ],
  },
  {
    num: "(03)",
    title: "Backend Systems",
    items: [
      "API Design & Integration",
      "Database Architecture",
      "Serverless Deployment",
      "Robust Authentication",
      "Data Pipeline Engineering",
    ],
  },
  {
    num: "(04)",
    title: "Technical Consulting",
    items: [
      "Code Audits & Refactoring",
      "Architecture Reviews",
      "Continuous Integration Setup",
      "Team Mentorship",
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
  const externalLinks = ["GitHub ↗", "LinkedIn ↗", "hello@portfol.io"];

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
          :/
        </a>
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
          }}
        >
          {open ? "Close" : "Menu"}
        </button>
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
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    let offscreenCanvas = document.createElement('canvas');
    let offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!offscreenCtx) return;
    
    type Particle = {
      x: number, y: number,
      baseX: number, baseY: number,
      vx: number, vy: number,
      alpha: number,
      isNoise?: boolean
    };
    let particles: Particle[] = [];
    const step = 7; 
    let animationFrameId: number;

    const initCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement!.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      
      offscreenCtx!.fillStyle = "black";
      offscreenCtx!.fillRect(0,0, canvas.width, canvas.height);
      offscreenCtx!.fillStyle = "white";
      
      const fontSize = Math.min(canvas.width / 4, 320); 
      offscreenCtx!.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
      offscreenCtx!.textAlign = "center";
      offscreenCtx!.textBaseline = "middle";
      // Stretch text horizontally (slightly reduced)
      offscreenCtx!.scale(1.15, 1);
      offscreenCtx!.fillText("artefakt", (canvas.width/2)/1.15, canvas.height/2);
      offscreenCtx!.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      
      const imgData = offscreenCtx!.getImageData(0,0, canvas.width, canvas.height).data;
      
      particles = [];
      for(let y=0; y<canvas.height; y+=step) {
        for(let x=0; x<canvas.width; x+=step) {
          const idx = (y * canvas.width + x) * 4;
          if(imgData[idx] > 128) {
            // Give each point a random constant opacity for texturing
            const alpha = 0.3 + Math.random() * 0.7;
            particles.push({
              x: x/dpr, y: y/dpr,
              baseX: x/dpr, baseY: y/dpr,
              vx: 0, vy: 0,
              alpha: alpha
            });
          }
        }
      }
      for(let i=0; i<300; i++) {
         const bx = Math.random() * rect.width;
         const by = Math.random() * rect.height;
         particles.push({
           x: bx, y: by,
           baseX: bx, baseY: by,
           vx: 0, vy: 0,
           alpha: 0.1 + Math.random() * 0.4,
           isNoise: true
         });
      }
    };

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: any) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = 0;
    const animateCanvas = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animateCanvas);
      if (timestamp - lastTime < 50) return; // ~20fps
      lastTime = timestamp;

      ctx.fillStyle = "rgba(0,0,0,1)"; // solid black background
      ctx.fillRect(0,0, canvas.width, canvas.height);
      
      ctx.font = "bold 9px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const charSet = "RT34#%*@KI+=-.,$01";

      for(let i=0; i<particles.length; i++) {
        const p = particles[i];

        // PHYSICS
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = 120;
        
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          p.vx += (dx / dist) * force * 15; // repel strongly
          p.vy += (dy / dist) * force * 15;
        }

        // Spring back
        p.vx += (p.baseX - p.x) * 0.15;
        p.vy += (p.baseY - p.y) * 0.15;

        // Damping
        p.vx *= 0.8;
        p.vy *= 0.8;

        p.x += p.vx;
        p.y += p.vy;

        // RENDER
        if (p.isNoise && Math.random() > 0.1) continue; // flicker noise

        const char = charSet[Math.floor(Math.random() * charSet.length)];
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fillText(char, p.x, p.y);
      }
    };

    window.addEventListener('resize', initCanvas);
    initCanvas();
    animationFrameId = requestAnimationFrame(animateCanvas);
    
    return () => {
      window.removeEventListener('resize', initCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        padding: 0,
      }}
    >
      <div 
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1,
          backgroundSize: "8px 8px",
          backgroundImage: "linear-gradient(to right, rgba(26,26,26,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,26,26,0.3) 1px, transparent 1px)"
        }} 
      />
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }} />
      
      <div style={{
        position: "relative", zIndex: 10, width: "100%", display: "flex",
        justifyContent: "space-between", padding: "0 48px 48px 48px",
        fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase"
      }}>
         <div className="hero-line-1" style={{ maxWidth: "400px" }}>INDEPENDENT DEVELOPER</div>
         <div className="hero-line-2" style={{ textAlign: "right", maxWidth: "400px" }}>ARTEFAKT IS A FREELANCE STUDIO FUSING HIGH-END COMMERCIAL WORK AND CREATIVE ENGINEERING</div>
      </div>
    </section>
  );
}

// ── Selected Works ───────────────────────────
function WorksSection() {
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const uiRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      
      const sec = containerRef.current;
      const child = stickyRef.current;
      const canvas = canvasRef.current;
      if (!sec || !child || !canvas) return;
      
      const rect = sec.getBoundingClientRect();
      
      // Emulate position: sticky inside CSS transformed scroll wrapper
      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        child.style.transform = `translateY(${-rect.top}px)`;
      } else if (rect.top > 0) {
        child.style.transform = "translateY(0px)";
      } else if (rect.bottom < window.innerHeight) {
        child.style.transform = `translateY(${rect.height - window.innerHeight}px)`;
      }

      let rawProgress = -rect.top / window.innerHeight;
      
      // Clamp
      if (rawProgress < 0) rawProgress = 0;
      if (rawProgress > WORKS.length - 1) rawProgress = WORKS.length - 1;

      // Update Slides statically via ref for flawless flicker-free DOM compositing
      for (let i = 0; i < WORKS.length; i++) {
         const slideEl = slidesRef.current[i];
         const uiEl = uiRefs.current[i];
         
         const p = rawProgress - i;
         if (p <= -1 || p >= 1) {
            if (slideEl) slideEl.style.visibility = "hidden";
            if (uiEl) uiEl.style.visibility = "hidden";
         } else {
            if (slideEl) slideEl.style.visibility = "visible";
            if (uiEl) uiEl.style.visibility = "visible";
            
            // Background Image Wipe OUT
            if (slideEl) {
               if (p > 0 && p < 1) {
                  const val1 = Math.min(100, (1 - p)*200);
                  const val2 = Math.max(0, (1 - p)*200 - 100);
                  slideEl.style.clipPath = `polygon(0 0, ${val1}% 0, ${val2}% 100%, 0 100%)`;
               } else if (p <= 0) {
                  slideEl.style.clipPath = `none`;
               }
            }

            // Foreground Text Crossfade (Avoids getting sliced into gibberish text)
            if (uiEl) {
               const uiOpacity = Math.max(0, 1 - Math.abs(p) * 2.5); // Fades completely to 0 just before 0.5 threshold
               uiEl.style.opacity = uiOpacity.toString();
               uiEl.style.transform = `translateY(${p * 40}px)`; // Elegant parallax float out
            }
         }
      }

      const pFraction = rawProgress % 1; 

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== window.innerWidth * dpr) {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      }
      
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      if (pFraction === 0) return;
      
      const baseBlockSize = Math.max(12, window.innerWidth / 100); 
      const cols = Math.ceil(window.innerWidth / baseBlockSize);
      const rows = Math.ceil(window.innerHeight / baseBlockSize);
      
      const pseudoRandom = (r: number, c: number) => {
        const x = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
        return x - Math.floor(x);
      };

      const threshold = (1 - pFraction) * 2.0;
      const bandThickness = 0.06; // Percentage distance

      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
            const noise = (pseudoRandom(r, c) * 2 - 1) * 0.15; // Percentage noise
            const val = (c / cols) + (r / rows) + noise;
            
            const dist = Math.abs(val - threshold);
            
            if (pFraction > 0.01 && pFraction < 0.99 && dist < bandThickness) {
               const bx = c * baseBlockSize;
               const by = r * baseBlockSize;
               ctx.fillStyle = "#0c0c0c"; 
               ctx.fillRect(bx, by, baseBlockSize+1, baseBlockSize+1);
               
               // ASCII Embedded 0 and 1
               ctx.fillStyle = "#666666";
               ctx.font = `600 ${baseBlockSize * 0.75}px "Space Mono", monospace`;
               ctx.textAlign = "center";
               ctx.textBaseline = "middle";
               const char = pseudoRandom(r+1, c+1) > 0.5 ? "1" : "0";
               ctx.fillText(char, bx + baseBlockSize/2, by + baseBlockSize/2);
            }
         }
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="works" ref={containerRef} style={{ position: "relative", width: "100%", height: `${WORKS.length * 100}vh`, background: "#000" }}>
      <div ref={stickyRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", overflow: "hidden", willChange: "transform" }}>
        
        {/* Layer 1: Background Images (These get sliced diagonally) */}
        {WORKS.map((work, i) => (
          <div
            key={`img-${i}`}
            ref={el => { slidesRef.current[i] = el; }}
            style={{
               position: "absolute",
               inset: 0,
               zIndex: WORKS.length - i, 
               visibility: i === 0 ? "visible" : "hidden"
            }}
          >
            <div style={{ width: "100%", height: "100%", background: `url(${work.image}) center/cover no-repeat` }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />
          </div>
        ))}

        {/* Layer 2: Transition Canvas */}
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: WORKS.length + 1 }} />

        {/* Layer 3: Foreground UI Texts (These crossfade behind/above the canvas) */}
        {WORKS.map((work, i) => (
          <div
            key={`ui-${i}`}
            ref={el => { uiRefs.current[i] = el; }}
            style={{
               position: "absolute",
               inset: 0,
               display: "flex", 
               flexDirection: "column", 
               justifyContent: "space-between", 
               padding: "clamp(24px, 5vw, 80px)", 
               color: "#fff", 
               pointerEvents: "none",
               zIndex: WORKS.length + 5,
               visibility: i === 0 ? "visible" : "hidden"
            }}
          >
            <div />{/* Top Spacer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "80px" }}>
               <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 6, height: 6, background: "white" }} />
                  SELECTED WORKS
               </div>
               
               <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "14px", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                 {String(i + 1).padStart(2, '0')}
               </div>

               <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em" }}>
                 / {String(WORKS.length).padStart(2, '0')}
               </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
               <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(48px, 8vw, 120px)", lineHeight: 0.9, textTransform: "uppercase", margin: 0 }}>
                 {work.client}
               </h2>
               <div style={{ display: "flex", gap: "clamp(16px, 4vw, 64px)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", textAlign: "left" }}>
                 <div>
                   <div style={{ color: "var(--muted)", marginBottom: "8px" }}>CLIENT</div>
                   <div style={{ textTransform: "uppercase" }}>{work.client}</div>
                 </div>
                 <div>
                   <div style={{ color: "var(--muted)", marginBottom: "8px" }}>TYPE</div>
                   <div style={{ textTransform: "uppercase" }}>{work.type}</div>
                 </div>
                 <div>
                   <div style={{ color: "var(--muted)", marginBottom: "8px" }}>DATE</div>
                   <div>{work.year}</div>
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Identity ─────────────────────────────────
function IdentitySection() {
  const { ref, visible } = useIntersection(0.15);
  const { ref: textRef, visible: textVisible } = useIntersection(0.15);
  const { ref: contentRef, visible: contentVisible } = useIntersection(0.1);
  const imgElRef = useRef<HTMLDivElement>(null);

  const words = ["Design,", "or", "Code?", "A", "hybrid", "creative", "developer"];
  const italicWords = ["hybrid"];

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
            02&nbsp;&nbsp;/&nbsp;&nbsp;Our identity
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
                Creative Engineering
              </h3>
              <p
                style={{
                  fontSize: "clamp(14px, 1.2vw, 16px)",
                  lineHeight: 1.8,
                  color: "var(--muted)",
                  fontWeight: 300,
                }}
              >
                I sit at the intersection of technical precision and digital
                storytelling. My hybrid approach means I command both the
                language of design and the logic of code — building experiences
                that are as intelligent as they are beautiful.
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
                From concept to deployment, I engineer the web — one
                deliberate commit at a time.
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
            03&nbsp;&nbsp;/&nbsp;&nbsp;From vision to screen
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
            I design. I build. I deploy.
            <br />
            Digital products crafted with precision.
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
            Independent Freelancer
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
            Available worldwide
            <br />
            Remote &amp; Relocatable
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
            href="#"
            className="link-hover"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            Legals
          </a>
          <a
            href="mailto:hello@portfol.io"
            className="link-hover"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            hello@portfol.io
          </a>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.05em",
            }}
          >
            Designed &amp; Built with code
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
        :/ Back to top
      </button>
    </>
  );
}
