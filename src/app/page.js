"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";
import FirefliesBackground from "@/components/FirefliesBackground";
import MysticalBackground from "@/components/MysticalBackground";

const RenderModel = dynamic(() => import("@/components/RenderModel"), {
  ssr: false,
});

const Wizard = dynamic(() => import("@/components/models/Wizard"), {
  ssr: false,
});

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function Home() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        router.push("/edit");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden"
      style={{
        backgroundColor: "#050814",
        color: "#f8fafc",
      }}
    >
      <MysticalBackground />
      <FirefliesBackground />

      {/* Subtle Observatory Vignette & Horizon Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, transparent 45%, rgba(2, 6, 23, 0.68) 100%), radial-gradient(ellipse at 50% 100%, rgba(103, 232, 249, 0.08), rgba(192, 132, 252, 0.06) 45%, transparent 72%)",
        }}
      />

      <style jsx>{`
        @keyframes runeAuraPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.26);
            opacity: 0.85;
          }
        }

        @keyframes runeSlowSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes homeBadgeFloat {
          0%,
          100% {
            opacity: 0.78;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Subtle Observatory Tag (Positioned Safely Away from Top-Left Controls & Top-Right Edit Rune) */}
      {!isMobile && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-30 flex items-center gap-2 rounded-full px-3.5 py-1.5"
          style={{
            top: "38px",
            left: "160px",
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#bae6fd",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.72), rgba(9, 13, 28, 0.86))",
            border: "1px solid rgba(103, 232, 249, 0.24)",
            boxShadow: "0 8px 24px rgba(2, 6, 23, 0.55)",
            backdropFilter: "blur(10px)",
            animation: "homeBadgeFloat 4s ease-in-out infinite",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              backgroundColor: "#fde047",
              boxShadow: "0 0 8px rgba(253, 224, 71, 0.8)",
            }}
          />
          <span>Arcane Observatory</span>
        </div>
      )}

      {/* Round Rune Icon Only -> Edit label appears below on hover */}
      <Link
        href="/edit"
        aria-label="Open Portfolio Editor (Alt + E)"
        title="Edit Portfolio (Alt + E)"
        className="group z-40 flex flex-col items-center transition-transform duration-300 hover:-translate-y-0.5"
        style={{
          position: "fixed",
          top: isMobile ? "28px" : "40px",
          right: isMobile ? "24px" : "40px",
          left: "auto",
          transform: "none",
          textDecoration: "none",
        }}
      >
        <span
          className="relative flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
          style={{
            width: "40px",
            height: "40px",
            color: "#e0f2fe",
            background:
              "radial-gradient(circle at 30% 30%, rgba(103, 232, 249, 0.25), rgba(15, 23, 42, 0.85) 65%, rgba(24, 16, 48, 0.94) 100%)",
            border: "1px solid rgba(103, 232, 249, 0.45)",
            boxShadow:
              "0 0 20px rgba(103, 232, 249, 0.25), 0 0 34px rgba(192, 132, 252, 0.16), inset 0 0 12px rgba(216, 180, 254, 0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(103, 232, 249, 0.4)",
              animation: "runeAuraPulse 3s ease-in-out infinite",
            }}
          />

          <span
            aria-hidden="true"
            className="relative flex items-center justify-center text-[15px] font-bold transition-transform duration-300 group-hover:rotate-45"
            style={{
              color: "#f0f9ff",
              textShadow: "0 0 10px rgba(103, 232, 249, 0.75)",
              animation: "runeSlowSpin 18s linear infinite",
            }}
          >
            ✦
          </span>
        </span>

        <span
          className="pointer-events-none mt-1.5 -translate-y-1 opacity-0 transition-all duration-250 group-hover:translate-y-0 group-hover:opacity-100"
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#e0f2fe",
            textShadow:
              "0 0 12px rgba(103, 232, 249, 0.7), 0 2px 8px rgba(2, 6, 23, 0.95)",
            whiteSpace: "nowrap",
          }}
        >
          Edit
        </span>
      </Link>

      <Navigation />

      <div className="w-full h-screen relative z-10">
        <ModelErrorBoundary>
          <RenderModel>
            <Wizard />
          </RenderModel>
        </ModelErrorBoundary>
      </div>
    </main>
  );
}
