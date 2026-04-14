"use client";

export type IntegrityState = {
   zeroSyntheticData: boolean;
   source: string;
   pineconeNodesVerified: number;
   ipHash: string;
};

export const IntegrityReport = ({ state }: { state: IntegrityState }) => {
   
   if (!state.zeroSyntheticData) {
       return (
           <div style={{ background: "#ff000022", padding: "16px", border: "1px solid #ff0000" }}>
               <h4 style={{ color: "#ff3333", margin: "0 0 8px 0" }}>INTEGRITY VIOLATION DETECTED</h4>
               <p style={{ color: "white", fontSize: "12px", margin: 0 }}>Synthetic mock data was detected in the active pipeline. Terminating display.</p>
           </div>
       );
   }

   return (
       <div style={{ padding: "16px", background: "#0a0a0a", borderLeft: "4px solid #00ff66", border: "1px solid #222" }}>
           <h4 style={{ color: "#00ff66", margin: "0 0 12px 0", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>Data Integrity Verified</h4>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "10px", color: "#888", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
               <div>
                   <strong style={{ color: "#aaa" }}>SOURCE:</strong> {state.source}
               </div>
               <div>
                   <strong style={{ color: "#aaa" }}>MOCKS DETECTED:</strong> 0% (Live Only)
               </div>
               <div>
                   <strong style={{ color: "#aaa" }}>NODES GENERATED:</strong> {state.pineconeNodesVerified} LIVE
               </div>
               <div>
                   <strong style={{ color: "#aaa" }}>ARMORCLAW TRACE:</strong> {state.ipHash.substring(0, 16)}...
               </div>
           </div>
       </div>
   );
};
