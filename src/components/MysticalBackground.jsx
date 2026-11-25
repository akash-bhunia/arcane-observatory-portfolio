"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const particles = [
  { top: "14%", left: "15%", size: 5, delay: "0s", duration: "6.8s" },
  { top: "22%", left: "81%", size: 4, delay: "1.2s", duration: "7.6s" },
  { top: "50%", left: "11%", size: 6, delay: "2.1s", duration: "7.2s" },
  { top: "62%", left: "86%", size: 4, delay: "0.7s", duration: "8.1s" },
  { top: "32%", left: "91%", size: 4, delay: "2.8s", duration: "7.5s" },
  { top: "76%", left: "22%", size: 5, delay: "1.5s", duration: "6.9s" },
  { top: "80%", left: "75%", size: 4, delay: "2.4s", duration: "8.3s" },
  { top: "18%", left: "48%", size: 3, delay: "1.9s", duration: "8.6s" },
  { top: "40%", left: "20%", size: 3, delay: "0.9s", duration: "7.9s" },
  { top: "68%", left: "58%", size: 4, delay: "2.6s", duration: "8.4s" },
  { top: "28%", left: "34%", size: 3, delay: "1.1s", duration: "9.2s" },
  { top: "58%", left: "36%", size: 3, delay: "2.2s", duration: "8.8s" },
];

const twinkleStars = [
  { top: "10%", left: "28%", size: 2, delay: "0.2s", duration: "3.6s" },
  { top: "12%", left: "66%", size: 2.5, delay: "1.4s", duration: "4.2s" },
  { top: "27%", left: "8%", size: 2, delay: "2.1s", duration: "3.9s" },
  { top: "38%", left: "74%", size: 2, delay: "0.8s", duration: "4.5s" },
  { top: "45%", left: "92%", size: 2.5, delay: "1.9s", duration: "3.8s" },
  { top: "67%", left: "14%", size: 2, delay: "2.7s", duration: "4.4s" },
  { top: "84%", left: "44%", size: 2, delay: "0.5s", duration: "4.1s" },
  { top: "88%", left: "86%", size: 2.5, delay: "1.6s", duration: "3.7s" },
];

const constellationNodes = [
  { x: 140, y: 150 },
  { x: 260, y: 210 },
  { x: 190, y: 340 },
  { x: 1180, y: 170 },
  { x: 1290, y: 270 },
  { x: 1220, y: 410 },
  { x: 240, y: 660 },
  { x: 1230, y: 650 },
];

const constellationLinks = [
  [0, 1],
  [1, 2],
  [3, 4],
  [4, 5],
  [2, 6],
  [5, 7],
];

function getPolygonPoints(cx, cy, r, sides, rotationDeg = 0) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = ((i * 360) / sides + rotationDeg) * (Math.PI / 180);
    const x = (cx + r * Math.cos(angle)).toFixed(2);
    const y = (cy + r * Math.sin(angle)).toFixed(2);
    return `${x},${y}`;
  }).join(" ");
}

export default function MysticalBackground() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const lastRenderedRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let rafId = null;
    let isHidden = document.hidden;

    const handleMouseMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRef.current = { x: nx * 16, y: ny * 12 };
    };

    const animate = () => {
      if (isHidden) {
        rafId = null;
        return;
      }

      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * 0.08;

      const nextX = Number(currentRef.current.x.toFixed(2));
      const nextY = Number(currentRef.current.y.toFixed(2));

      if (
        Math.abs(nextX - lastRenderedRef.current.x) >= 0.04 ||
        Math.abs(nextY - lastRenderedRef.current.y) >= 0.04
      ) {
        lastRenderedRef.current = { x: nextX, y: nextY };
        setOffset({ x: nextX, y: nextY });
      }

      rafId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
      if (!isHidden && rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("pointermove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!isHidden) {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const tickAngles = useMemo(
    () => Array.from({ length: 36 }, (_, i) => i * 10),
    [],
  );
  const innerTickAngles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i * 30),
    [],
  );
  const nodeAngles = useMemo(() => [0, 60, 120, 180, 240, 300], []);
  const dodecagonPoints = useMemo(
    () => getPolygonPoints(500, 500, 235, 12, 15),
    [],
  );
  const outerHexPoints = useMemo(
    () => getPolygonPoints(500, 500, 355, 6, 0),
    [],
  );
  const innerHexPoints = useMemo(
    () => getPolygonPoints(500, 500, 295, 6, 30),
    [],
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#07171e",
        backgroundImage: `
          radial-gradient(circle at 50% 48%, rgba(45, 212, 191, 0.17), rgba(12, 34, 48, 0.82) 55%, rgba(5, 13, 20, 0.97) 100%),
          radial-gradient(ellipse at 15% 18%, rgba(56, 189, 248, 0.16), transparent 52%),
          radial-gradient(ellipse at 85% 82%, rgba(168, 85, 247, 0.14), transparent 54%)
        `,
      }}
    >
      <style jsx>{`
        @keyframes spinClockwise {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinCounter {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes sweepBeam {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.92;
          }
        }

        @keyframes floatParticle {
          0%,
          100% {
            transform: translate(0px, 0px) scale(0.85);
            opacity: 0.35;
          }
          50% {
            transform: translate(12px, -14px) scale(1.25);
            opacity: 1;
          }
        }

        @keyframes starTwinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.25);
          }
        }

        .astrolabe-stage {
          width: min(94vw, 94vh);
          height: min(94vw, 94vh);
        }

        @media (max-width: 640px) {
          .astrolabe-stage {
            width: min(108vw, 72vh);
            height: min(108vw, 72vh);
          }
        }

        .anim-clockwise {
          animation: spinClockwise 54s linear infinite;
        }

        .anim-counter {
          animation: spinCounter 82s linear infinite;
        }

        .anim-sweep {
          animation: sweepBeam 24s linear infinite;
        }

        .anim-pulse {
          animation: pulseGlow 6.5s ease-in-out infinite;
        }

        .anim-float {
          animation-name: floatParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .anim-twinkle {
          animation-name: starTwinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-clockwise,
          .anim-counter,
          .anim-sweep,
          .anim-pulse,
          .anim-float,
          .anim-twinkle {
            animation: none !important;
          }
        }
      `}</style>

      {/* Subtle observatory corner ticks */}
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.28,
        }}
      >
        <path
          d="M24,52 L24,24 L52,24"
          fill="none"
          stroke="#99f6e4"
          strokeWidth="1.2"
        />
        <path
          d="M1388,24 L1416,24 L1416,52"
          fill="none"
          stroke="#99f6e4"
          strokeWidth="1.2"
        />
        <path
          d="M24,748 L24,776 L52,776"
          fill="none"
          stroke="#99f6e4"
          strokeWidth="1.2"
        />
        <path
          d="M1388,776 L1416,776 L1416,748"
          fill="none"
          stroke="#99f6e4"
          strokeWidth="1.2"
        />
      </svg>

      {/* Subtle twinkling background stars */}
      {twinkleStars.map((star, idx) => (
        <span
          key={idx}
          className="anim-twinkle"
          style={{
            position: "absolute",
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: "9999px",
            backgroundColor: "#f0f9ff",
            boxShadow: "0 0 8px rgba(186, 230, 253, 0.85)",
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Deep layer: Constellation web */}
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: "-3%",
          width: "106%",
          height: "106%",
          transform: `translate(${offset.x * 0.35}px, ${offset.y * 0.35}px)`,
        }}
      >
        {constellationLinks.map(([a, b], i) => (
          <line
            key={i}
            x1={constellationNodes[a].x}
            y1={constellationNodes[a].y}
            x2={constellationNodes[b].x}
            y2={constellationNodes[b].y}
            stroke="#99f6e4"
            strokeWidth="0.9"
            strokeDasharray="3 5"
            opacity="0.22"
          />
        ))}
        {constellationNodes.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#5eead4" opacity="0.14" />
            <circle cx={pt.x} cy={pt.y} r="2" fill="#e0f2fe" opacity="0.65" />
          </g>
        ))}
      </svg>

      {/* Center ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "min(70vw, 70vh)",
          height: "min(70vw, 70vh)",
          borderRadius: "9999px",
          transform: `translate(calc(-50% + ${offset.x * 0.6}px), calc(-50% + ${offset.y * 0.6}px))`,
          background:
            "radial-gradient(circle, rgba(94, 234, 212, 0.14) 0%, rgba(56, 189, 248, 0.06) 52%, transparent 75%)",
          filter: "blur(20px)",
        }}
      />

      {/* Sweeping arcane radar/light cone */}
      <div
        className="anim-sweep astrolabe-stage"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          borderRadius: "9999px",
          background:
            "conic-gradient(from 0deg, rgba(94, 234, 212, 0.14) 0deg, rgba(56, 189, 248, 0.04) 48deg, transparent 105deg, transparent 360deg)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 22%, black 24%, black 98%, transparent 100%)",
          maskImage:
            "radial-gradient(circle, transparent 22%, black 24%, black 98%, transparent 100%)",
          filter: "blur(2px)",
        }}
      />

      {/* Mid-front layer: Multi-ring Arcane Astrolabe & Sacred Polygons */}
      <div
        className="astrolabe-stage"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        }}
      >
        <svg viewBox="0 0 1000 1000" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="arcaneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.48" />
              <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d8b4fe" stopOpacity="0.45" />
            </linearGradient>

            <linearGradient id="accentGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Outer compass ring */}
          <circle
            cx="500"
            cy="500"
            r="468"
            fill="none"
            stroke="url(#arcaneGrad)"
            strokeWidth="1"
            opacity="0.55"
          />

          {/* 36 degree ticks around outer ring */}
          {tickAngles.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const isMajor = deg % 90 === 0;
            const isMid = deg % 30 === 0;
            const innerR = isMajor ? 442 : isMid ? 450 : 458;
            const outerR = 468;

            return (
              <line
                key={deg}
                x1={500 + innerR * Math.cos(rad)}
                y1={500 + innerR * Math.sin(rad)}
                x2={500 + outerR * Math.cos(rad)}
                y2={500 + outerR * Math.sin(rad)}
                stroke={isMajor ? "#fde68a" : "#99f6e4"}
                strokeWidth={isMajor ? "1.8" : isMid ? "1.2" : "0.8"}
                opacity={isMajor ? "0.7" : isMid ? "0.45" : "0.28"}
              />
            );
          })}

          {/* Counter-rotating hexagrams + 12-sided dodecagon */}
          <g
            className="anim-counter"
            style={{ transformOrigin: "500px 500px" }}
          >
            <polygon
              points={outerHexPoints}
              fill="none"
              stroke="url(#arcaneGrad)"
              strokeWidth="1.1"
              opacity="0.55"
            />
            <polygon
              points={innerHexPoints}
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="0.9"
              strokeDasharray="5 7"
              opacity="0.48"
            />
            <polygon
              points={dodecagonPoints}
              fill="none"
              stroke="url(#arcaneGrad)"
              strokeWidth="0.85"
              strokeDasharray="2 6"
              opacity="0.4"
            />
          </g>

          {/* Clockwise rotating orbital tracks, inner ticks & glowing nodes */}
          <g
            className="anim-clockwise"
            style={{ transformOrigin: "500px 500px" }}
          >
            <circle
              cx="500"
              cy="500"
              r="325"
              fill="none"
              stroke="url(#arcaneGrad)"
              strokeWidth="1.2"
              strokeDasharray="10 10"
              className="anim-pulse"
            />
            <circle
              cx="500"
              cy="500"
              r="402"
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="1"
              opacity="0.45"
            />

            {innerTickAngles.map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <circle
                  key={deg}
                  cx={500 + 402 * Math.cos(rad)}
                  cy={500 + 402 * Math.sin(rad)}
                  r="2"
                  fill="#99f6e4"
                  opacity="0.6"
                />
              );
            })}

            {nodeAngles.map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const nx = 500 + 325 * Math.cos(rad);
              const ny = 500 + 325 * Math.sin(rad);

              return (
                <g key={deg}>
                  <circle cx={nx} cy={ny} r="7" fill="#5eead4" opacity="0.22" />
                  <circle cx={nx} cy={ny} r="3" fill="#fef9c3" opacity="0.9" />
                </g>
              );
            })}
          </g>

          {/* Subtle center astrolabe dial ring */}
          <circle
            cx="500"
            cy="500"
            r="72"
            fill="none"
            stroke="url(#accentGrad)"
            strokeWidth="0.8"
            strokeDasharray="3 6"
            opacity="0.28"
          />

          {/* Crosshair & diagonal astrolabe axes */}
          <line
            x1="500"
            y1="75"
            x2="500"
            y2="925"
            stroke="url(#arcaneGrad)"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            opacity="0.3"
          />
          <line
            x1="75"
            y1="500"
            x2="925"
            y2="500"
            stroke="url(#arcaneGrad)"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            opacity="0.3"
          />
          <line
            x1="195"
            y1="195"
            x2="805"
            y2="805"
            stroke="url(#accentGrad)"
            strokeWidth="0.7"
            strokeDasharray="2 10"
            opacity="0.22"
          />
          <line
            x1="805"
            y1="195"
            x2="195"
            y2="805"
            stroke="url(#accentGrad)"
            strokeWidth="0.7"
            strokeDasharray="2 10"
            opacity="0.22"
          />
        </svg>
      </div>

      {/* Floating ambient motes */}
      {particles.map((dot, idx) => (
        <span
          key={idx}
          className="anim-float"
          style={{
            position: "absolute",
            top: dot.top,
            left: dot.left,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            borderRadius: "9999px",
            backgroundColor: "#e0f2fe",
            boxShadow:
              "0 0 12px rgba(125, 211, 252, 0.85), 0 0 22px rgba(94, 234, 212, 0.5)",
            animationDuration: dot.duration,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
