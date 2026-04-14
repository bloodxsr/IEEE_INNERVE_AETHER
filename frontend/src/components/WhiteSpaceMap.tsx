"use client";

import { useEffect, useRef } from "react";

export type MapPoint = {
  id: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  type: "user" | "patent";
  label: string;
};

export const WhiteSpaceMap = ({ nodes }: { nodes: MapPoint[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw Grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for(let i=0; i<=10; i++) {
        const linePos = (rect.width / 10) * i;
        ctx.beginPath(); ctx.moveTo(linePos, 0); ctx.lineTo(linePos, rect.height); ctx.stroke();
        const yPos = (rect.height / 10) * i;
        ctx.beginPath(); ctx.moveTo(0, yPos); ctx.lineTo(rect.width, yPos); ctx.stroke();
    }

    // Draw Nodes
    nodes.forEach(node => {
        const px = (node.x / 100) * rect.width;
        const py = (node.y / 100) * rect.height;

        ctx.beginPath();
        ctx.arc(px, py, node.type === "user" ? 8 : 4, 0, Math.PI * 2);
        ctx.fillStyle = node.type === "user" ? "#00ff66" : "#ff3333";
        ctx.fill();

        ctx.fillStyle = "#888";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(node.label, px, py - 12);
        
        if (node.type === "user") {
            // Draw a subtle pulse radius
            ctx.beginPath();
            ctx.arc(px, py, 40, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0, 255, 102, 0.2)";
            ctx.stroke();
        }
    });

  }, [nodes]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
};
