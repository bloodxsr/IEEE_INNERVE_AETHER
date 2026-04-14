"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NORMAL_STEPS = ["CREATE", "RESEARCH", "RELEASE"] as const;

const HOME_DURATION_MS = 1450;
const NORMAL_DURATION_MS = 900;
const STEP_INTERVAL_MS = 220;

const isHomePath = (pathname: string) => pathname === "/";

export default function RoutePreloader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [homeVariant, setHomeVariant] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const mountedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  };

  const runPreloader = (nextPathname: string, isInitialLoad: boolean) => {
    clearTimers();

    const home = isHomePath(nextPathname);
    const duration = home ? HOME_DURATION_MS : NORMAL_DURATION_MS;

    setVisible(true);
    setHomeVariant(home);
    setActiveStep(0);

    if (!home) {
      NORMAL_STEPS.forEach((_, index) => {
        const timer = window.setTimeout(() => {
          setActiveStep(index);
        }, index * STEP_INTERVAL_MS);
        timersRef.current.push(timer);
      });
    }

    const hideTimer = window.setTimeout(
      () => setVisible(false),
      isInitialLoad ? duration + 200 : duration
    );
    timersRef.current.push(hideTimer);
  };

  useEffect(() => {
    if (!pathname) return;
    runPreloader(pathname, !mountedRef.current);
    mountedRef.current = true;

    return () => {
      clearTimers();
    };
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="route-preloader-overlay"
      role="status"
      aria-live="polite"
      aria-label={homeVariant ? "Loading Aether home" : "Loading page"}
    >
      <div className="route-preloader-grid" aria-hidden />

      {homeVariant ? (
        <div className="route-preloader-content">
          <p className="route-preloader-tag">AETHER BOOT SEQUENCE</p>
          <h1 className="route-preloader-homeword">AETHER</h1>
          <p className="route-preloader-sub">Secure intelligence environment initializing.</p>
        </div>
      ) : (
        <div className="route-preloader-content">
          <p className="route-preloader-tag">PIPELINE TRANSITION</p>
          <div className="route-preloader-steps" aria-label="Create, Research, Release">
            {NORMAL_STEPS.map((step, index) => (
              <span
                key={step}
                className={`route-preloader-step ${index <= activeStep ? "active" : ""}`}
              >
                {step}
              </span>
            ))}
          </div>
          <p className="route-preloader-sub">Loading module context.</p>
        </div>
      )}
    </div>
  );
}