"use client";

import { useState } from "react";
import { WhiteSpaceMap, type MapPoint } from "../../components/WhiteSpaceMap";
import { IntegrityReport, type IntegrityState } from "../../components/IntegrityReport";

type PriorArt = {
  id: string;
  title: string;
  score: number;
  snippet: string;
  link: string;
};

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};


export default function AetherDashboard() {
  const [abstract, setAbstract] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Results State
  const [noveltyScore, setNoveltyScore] = useState<number | null>(null);
  const [legalSummary, setLegalSummary] = useState<string | null>(null);
  const [matches, setMatches] = useState<PriorArt[]>([]);
  const [integrityData, setIntegrityData] = useState<IntegrityState | null>(null);

  const analyzeAbstract = async () => {
    if (!abstract.trim()) return;
    setLoading(true);
    setNoveltyScore(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstract })
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert("Aether Core Error: " + data.error);
        setLoading(false);
        return;
      }

      setNoveltyScore(data.noveltyScore);
      setMatches(data.closestMatches || []);
      setLegalSummary(data.legalSummary);
      setIntegrityData(data.dataIntegritySignature);
      
    } catch (e) {
      alert("Pipeline failure. Connection dropped.");
    }
    setLoading(false);
  };

  // Generate some cluster mapping nodes purely for frontend visualization based on Novelty (avoiding mock raw data)
  const generateMapNodes = (): MapPoint[] => {
     if (noveltyScore === null) return [];
     const nodes: MapPoint[] = [];
     // The user's idea node
     nodes.push({ id: "user-node", x: 50, y: 50, type: "user", label: "Your Concept" });
     
     // Place the matches radially based on their similarity score
     matches.forEach((m, idx) => {
         const distanceRadius = (1 - (m.score || 0)) * 60; // closer score = smaller radius
         const angle = (idx / matches.length) * Math.PI * 2;
         nodes.push({
            id: m.id,
            x: 50 + Math.cos(angle) * distanceRadius,
            y: 50 + Math.sin(angle) * distanceRadius,
            type: "patent",
            label: `v-${Math.floor((m.score||0)*100)}%`
         });
     });
     
     return nodes;
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#000", color: "var(--text)", overflow: "hidden" }}>
        
      {/* Background Texture Overlay */}
      <div style={{ ...GRAIN_STYLE, position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      
      {/* Heavy Console Grid Backdrop */}
      <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
      }} />

      <div style={{ position: "relative", zIndex: 10, padding: "clamp(24px, 5vw, 64px)", maxWidth: "1600px", margin: "0 auto", fontFamily: "var(--font-mono)" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "24px", marginBottom: "64px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff", lineHeight: 1 }}>Neural Prior Art</h1>
              <div style={{ color: "#00ff66", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{width: 6, height: 6, background: "#00ff66", borderRadius: "50%", boxShadow: "0 0 8px #00ff66"}}></div>
                  ArmorClaw Gateway Active
              </div>
            </div>
            <a href="/" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", textDecoration: "none", border: "1px solid #333", padding: "8px 16px", background: "black" }}>Return to Root</a>
          </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
        {/* Left Column: Input */}
        <div>
          <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", color: "#666" }}>
            Submit Project Abstract
          </label>
          <textarea 
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            style={{ width: "100%", height: "200px", background: "#0a0a0a", border: "1px solid #333", padding: "16px", color: "white", fontFamily: "var(--font-mono)", fontSize: "14px", resize: "vertical" }}
            placeholder="Describe your technological concept for neural cross-referencing against global intellectual property databases..."
          />
          <button 
            onClick={analyzeAbstract}
            disabled={loading}
            style={{ marginTop: "24px", background: loading ? "#333" : "white", color: loading ? "#888" : "black", border: "none", padding: "16px 32px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", cursor: loading ? "wait" : "pointer", fontWeight: 600, width: "100%" }}
          >
            {loading ? "INITIALIZING RAG PIPELINE & EMBEDDINGS..." : "EXECUTE NOVELTY SEARCH"}
          </button>
          
          {integrityData && (
             <div style={{ marginTop: "48px" }}>
                 <IntegrityReport state={integrityData} />
             </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div>
          {noveltyScore !== null ? (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              
              <div style={{ padding: "32px", background: "#111", borderLeft: noveltyScore > 60 ? "4px solid #00ff66" : "4px solid #ff3333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div>
                    <h2 style={{ margin: 0, fontSize: "48px", color: "white" }}>{noveltyScore}<span style={{fontSize: "24px", color: "#666"}}>/100</span></h2>
                    <div style={{ fontSize: "11px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", marginTop: "8px" }}>Novelty Score</div>
                 </div>
                 <div style={{ textAlign: "right" }}>
                    <div style={{ color: noveltyScore > 60 ? "#00ff66" : "#ff3333", fontWeight: 600, textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>
                       {noveltyScore > 60 ? "HIGH CLEARANCE TERRITORY" : "DENSE CROWDED SECTOR"}
                    </div>
                 </div>
              </div>

              <div style={{ marginTop: "32px", height: "300px", border: "1px solid #222", background: "#0a0a0a", position: "relative" }}>
                 <WhiteSpaceMap nodes={generateMapNodes()} />
                 <div style={{ position: "absolute", top: 12, left: 12, fontSize: "10px", color: "#666", textTransform: "uppercase" }}>[2D White Space Map Projection]</div>
              </div>

              <div style={{ marginTop: "32px" }}>
                 <h3 style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", borderBottom: "1px solid #222", paddingBottom: "8px" }}>RAG Legal Summary Override</h3>
                 <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#ccc", whiteSpace: "pre-wrap" }}>
                    {legalSummary}
                 </div>
              </div>

            </div>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #222" }}>
               <span style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "1px" }}>[ Awaiting Execution ]</span>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
