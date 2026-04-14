"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NodeTelemetry = {
   node: string;
   status: "ONLINE" | "OFFLINE";
   latency: number | null;
   error?: string;
};

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};

export default function StatusBoard() {
  const [data, setData] = useState<NodeTelemetry[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
      setLoading(true);
      try {
          const res = await fetch("/api/status");
          const json = await res.json();
          setData(json.telemetry);
      } catch(e) {
          console.error("Critical Failure fetching telemetry");
      }
      setLoading(false);
  };

  useEffect(() => {
      fetchTelemetry();
      // Auto ping every 30 seconds
      const interval = setInterval(fetchTelemetry, 30000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#000", color: "var(--text)", overflow: "hidden", fontFamily: "var(--font-mono)" }}>
      {/* Texture Overlay */}
      <div style={{ ...GRAIN_STYLE, position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(to right, rgba(0,255,102,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,102,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px"
      }} />

      <div style={{ position: "relative", zIndex: 10, padding: "clamp(24px, 5vw, 64px)", maxWidth: "1000px", margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(0,255,102,0.2)", paddingBottom: "24px", marginBottom: "48px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff", lineHeight: 1 }}>SYSTEM TELEMETRY</h1>
              <div style={{ color: "#00ff66", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className={loading ? "pulse" : ""} style={{width: 6, height: 6, background: "#00ff66", borderRadius: "50%", boxShadow: "0 0 8px #00ff66", transition: "all 0.3s ease"}} />
                  {loading ? "Sweeping Node Matrices..." : "All Clear"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
                <button onClick={fetchTelemetry} style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#00ff66", border: "1px solid rgba(0,255,102,0.3)", background: "rgba(0,255,102,0.05)", padding: "8px 16px", cursor: "pointer" }}>Force Ping</button>
                <Link href="/" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", textDecoration: "none", border: "1px solid #333", padding: "8px 16px", background: "black" }}>Return to Root</Link>
            </div>
          </header>

          <style dangerouslySetInnerHTML={{__html: `
              @keyframes pulseFade { 0% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.2; transform: scale(0.8); } }
              .pulse { animation: pulseFade 1s infinite; }
          `}} />

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {!data ? (
                 <div style={{ padding: "64px", border: "1px dashed #333", textAlign: "center", color: "#666", textTransform: "uppercase", fontSize: "12px", letterSpacing: "2px" }}>
                     Awaiting Terminal Handshake...
                 </div>
              ) : (
                 data.map((matrix, idx) => (
                    <div key={idx} style={{ padding: "24px", background: "#080808", borderLeft: matrix.status === "ONLINE" ? "2px solid #00ff66" : "2px solid #ff3333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                           <div style={{ color: "#fff", textTransform: "uppercase", fontWeight: "bold", fontSize: "16px", letterSpacing: "1px", marginBottom: "8px" }}>{matrix.node}</div>
                           
                           <div style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "2px" }}>
                              Node Status Check
                           </div>
                        </div>

                        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "32px" }}>
                           {matrix.latency !== null && (
                              <div style={{ fontSize: "11px", color: "#aaa", letterSpacing: "1px" }}>
                                {matrix.latency} <span style={{ color: "#555" }}>MS</span>
                              </div>
                           )}

                           <div style={{ background: matrix.status === "ONLINE" ? "rgba(0,255,102,0.1)" : "rgba(255,51,51,0.1)", padding: "8px 16px", border: matrix.status === "ONLINE" ? "1px solid #00ff66" : "1px solid #ff3333", color: matrix.status === "ONLINE" ? "#00ff66" : "#ff3333", fontSize: "11px", letterSpacing: "2px" }}>
                               {matrix.status}
                           </div>
                        </div>
                    </div>
                 ))
              )}
          </div>
      </div>
    </div>
  );
}
