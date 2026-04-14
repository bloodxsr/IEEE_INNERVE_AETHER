"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};

export default function Onboarding() {
    const [nextPath, setNextPath] = useState("/aether");

  const [formData, setFormData] = useState({
    fullName: "",
    domain: "Computer Science",
    skillInput: "",
    skills: [] as string[]
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [profileExists, setProfileExists] = useState(false);
    const [isEditingExisting, setIsEditingExisting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const target = new URLSearchParams(window.location.search).get("next");
        if (target && target.startsWith("/")) {
            setNextPath(target);
        }

        const isRegistered = localStorage.getItem("aether_identity_registered") === "true";
        if (!isRegistered) return;

        const storedName = localStorage.getItem("aether_identity_name") || "";
        const storedDomain = localStorage.getItem("aether_identity_domain") || "Computer Science";
        const storedSkillsRaw = localStorage.getItem("aether_identity_skills");
        let storedSkills: string[] = [];

        if (storedSkillsRaw) {
            try {
                const parsed = JSON.parse(storedSkillsRaw);
                if (Array.isArray(parsed)) {
                    storedSkills = parsed.filter((skill) => typeof skill === "string");
                }
            } catch {
                storedSkills = [];
            }
        }

        if (storedName || localStorage.getItem("aether_identity_id")) {
            setProfileExists(true);
            setFormData({
                fullName: storedName,
                domain: storedDomain,
                skillInput: "",
                skills: storedSkills
            });

            document.cookie = "aether_identity_registered=true; Path=/; Max-Age=31536000; SameSite=Lax";
        }
    }, []);

  const addSkill = (e: any) => {
    e.preventDefault();
    if (!formData.skillInput.trim()) return;
    setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.skillInput.trim().toUpperCase()],
        skillInput: ""
    }));
  };

  const removeSkill = (sk: string) => {
    setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== sk)
    }));
  };

  const submitProfile = async () => {
     if (!formData.fullName.trim()) return;
     setStatus("loading");
     setErrorMessage(null);
     try {
         const existingProfileId = typeof window !== "undefined" ? localStorage.getItem("aether_identity_id") : null;
         const res = await fetch("/api/profile", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
                 profile_id: existingProfileId || undefined,
                 full_name: formData.fullName,
                 academic_domain: formData.domain,
                 skills: formData.skills
             })
         });

         const payload = await res.json();

         if (!res.ok || payload?.error) throw new Error(payload?.error || "Database fault.");

         const insertedProfile = Array.isArray(payload?.profile) ? payload.profile[0] : payload?.profile;

         if (typeof window !== "undefined") {
             localStorage.setItem("aether_identity_registered", "true");
             localStorage.setItem("aether_identity_domain", insertedProfile?.academic_domain || formData.domain);
             localStorage.setItem("aether_identity_name", insertedProfile?.full_name || formData.fullName);
             localStorage.setItem("aether_identity_skills", JSON.stringify(formData.skills));
             if (insertedProfile?.id) {
                 localStorage.setItem("aether_identity_id", insertedProfile.id);
             }

             document.cookie = "aether_identity_registered=true; Path=/; Max-Age=31536000; SameSite=Lax";
         }
         setProfileExists(true);
         setIsEditingExisting(false);
         setStatus("success");
     } catch(e: any) {
         setStatus("error");
         setErrorMessage(e?.message || "Unable to save profile.");
     }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#000", color: "var(--text)", overflow: "hidden", fontFamily: "var(--font-mono)" }}>
      {/* Texture Overlay */}
      <div style={{ ...GRAIN_STYLE, position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
      }} />

      <div style={{ position: "relative", zIndex: 10, padding: "clamp(24px, 5vw, 64px)", maxWidth: "800px", margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "24px", marginBottom: "48px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff", lineHeight: 1 }}>Synergy Onboarding</h1>
              <div style={{ color: "#888", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "12px" }}>
                  Register Identity Node
              </div>
            </div>
            <Link href="/" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", textDecoration: "none", border: "1px solid #333", padding: "8px 16px", background: "black" }}>Abort</Link>
          </header>

                    {profileExists && !isEditingExisting ? (
             <div style={{ padding: "48px", background: "#0a0a0a", border: "1px solid #00ff66", textAlign: "center" }}>
                                 <h2 style={{ color: "#00ff66", margin: "0 0 16px 0", textTransform: "uppercase" }}>
                                        {status === "success" ? "Identity Updated" : "Identity Already Registered"}
                                 </h2>
                                 <p style={{ color: "#888", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px" }}>
                                     Profile is saved. You can continue without creating it again.
                                 </p>
                                 <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                                     <Link href={nextPath} style={{ background: "#fff", color: "#000", textDecoration: "none", padding: "12px 24px", fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>
                                         Continue to Engine
                                     </Link>
                                     <button
                                         onClick={() => setIsEditingExisting(true)}
                                         style={{ background: "transparent", color: "#aaa", border: "1px solid #333", padding: "12px 24px", fontWeight: "bold", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", cursor: "pointer" }}
                                     >
                                         Edit Profile
                                     </button>
                                 </div>
             </div>
          ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>Primary Alias / Full Name</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", padding: "16px", color: "white", fontFamily: "inherit" }} placeholder="Enter legal identifier..." />
              </div>
              
              <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>Academic / Functional Domain</label>
                  <select value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", padding: "16px", color: "white", fontFamily: "inherit", textTransform: "uppercase" }}>
                      <option>Computer Science</option>
                      <option>Electrical Eng (ECE)</option>
                      <option>Bio-Technology</option>
                      <option>Mechanical Eng</option>
                      <option>Corporate Law</option>
                      <option>Industrial Design</option>
                  </select>
              </div>

              <div>
                  <label style={{ display: "block", fontSize: "11px", textTransform: "uppercase", color: "#666", marginBottom: "8px" }}>Specialized Tooling Vectors (Press Enter to Add)</label>
                  <form onSubmit={addSkill} style={{ display: "flex", gap: "12px" }}>
                      <input type="text" value={formData.skillInput} onChange={e => setFormData({...formData, skillInput: e.target.value})} style={{ flex: 1, background: "#0a0a0a", border: "1px solid #333", padding: "12px 16px", color: "white", fontFamily: "inherit" }} placeholder="e.g. TENSORFLOW, AUTOCAD, REACT..." />
                      <button type="submit" style={{ background: "#333", color: "white", border: "none", padding: "0 24px", fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", fontSize: "11px" }}>+ Add</button>
                  </form>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
                      {formData.skills.map((sk) => (
                          <div key={sk} onClick={() => removeSkill(sk)} style={{ background: "#1a1a1a", border: "1px solid #333", padding: "6px 12px", fontSize: "10px", color: "#aaa", cursor: "pointer", textTransform: "uppercase" }}>
                              {sk} ✕
                          </div>
                      ))}
                  </div>
              </div>

              <button onClick={submitProfile} disabled={status === "loading" || !formData.fullName.trim()} style={{ background: "white", color: "black", border: "none", padding: "16px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer", marginTop: "16px" }}>
                  {status === "loading" ? "SAVING..." : profileExists ? "UPDATE PROFILE" : "INITIALIZE STUDENT PROFILE"}
              </button>

              {errorMessage && (
                <div style={{ color: "#ff7070", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{errorMessage}</div>
              )}
          </div>
          )}
      </div>
    </div>
  );
}
