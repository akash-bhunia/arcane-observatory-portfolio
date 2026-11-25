"use client";

import React, { useEffect, useState } from "react";
import { BtnList } from "@/data/data";
import NavButton from "./NavButton";

function mergeNavWithBase(dbItems) {
  if (!Array.isArray(dbItems) || dbItems.length === 0) {
    return BtnList;
  }

  const merged = BtnList.map((baseItem) => {
    const matched = dbItems.find(
      (d) =>
        d?.label?.toLowerCase() === baseItem.label.toLowerCase() ||
        d?.link === baseItem.link,
    );
    return matched ? { ...baseItem, ...matched } : baseItem;
  });

  const extraItems = dbItems.filter(
    (d) =>
      !BtnList.some(
        (baseItem) =>
          d?.label?.toLowerCase() === baseItem.label.toLowerCase() ||
          d?.link === baseItem.link,
      ),
  );

  return [...merged, ...extraItems];
}

export default function Navigation() {
  const [isPaused, setIsPaused] = useState(false);
  const [isHiddenTab, setIsHiddenTab] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [radius, setRadius] = useState(230);
  const [isMobile, setIsMobile] = useState(false);
  const [navItems, setNavItems] = useState(BtnList);

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setNavItems(mergeNavWithBase(json?.data?.navItems));
      })
      .catch(() => {
        if (active) setNavItems(BtnList);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setIsMobile(true);
        setRadius(125);
      } else if (width < 1024) {
        setIsMobile(false);
        setRadius(185);
      } else {
        setIsMobile(false);
        setRadius(230);
      }
    };

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const handleVisibilityChange = () => setIsHiddenTab(document.hidden);

    updateLayout();
    window.addEventListener("resize", updateLayout);
    mq.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", updateLayout);
      mq.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const shouldPause = isPaused || isHiddenTab || prefersReducedMotion;

  return (
    <>
      <style jsx global>{`
        @keyframes ringOrbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes counterOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
      `}</style>

      {!isMobile ? (
        <nav
          aria-label="Orbital Navigation"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            width: `${radius * 2 + 64}px`,
            height: `${radius * 2 + 64}px`,
            borderRadius: "9999px",
            zIndex: 25,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            animation: prefersReducedMotion
              ? "none"
              : "ringOrbit 30s linear infinite",
            animationPlayState: shouldPause ? "paused" : "running",
          }}
        >
          {/* Main orbit track ring */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              borderRadius: "9999px",
              transform: "translate(-50%, -50%)",
              border: "1px dashed rgba(103, 232, 249, 0.25)",
              pointerEvents: "none",
            }}
          />

          {/* Subtle inner accent ring */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${Math.max(90, radius * 2 - 48)}px`,
              height: `${Math.max(90, radius * 2 - 48)}px`,
              borderRadius: "9999px",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(253, 224, 71, 0.12)",
              boxShadow: "inset 0 0 24px rgba(192, 132, 252, 0.06)",
              pointerEvents: "none",
            }}
          />

          {navItems.map((btn, index) => {
            const angle = (index / navItems.length) * 2 * Math.PI - Math.PI / 2;
            const x = Math.round(radius * Math.cos(angle));
            const y = Math.round(radius * Math.sin(angle));

            return (
              <div
                key={btn.id || `${btn.label}-${index}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ pointerEvents: "auto" }}
              >
                <NavButton
                  x={x}
                  y={y}
                  label={btn.label}
                  link={btn.link}
                  icon={btn.icon}
                  newTab={Boolean(btn.newTab)}
                  paused={shouldPause}
                  isMobile={false}
                />
              </div>
            );
          })}
        </nav>
      ) : (
        <nav
          aria-label="Mobile Navigation"
          style={{
            position: "fixed",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 25,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "9999px",
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(103, 232, 249, 0.26)",
            boxShadow: "0 10px 25px rgba(2, 6, 23, 0.55)",
            backdropFilter: "blur(10px)",
          }}
        >
          {navItems.map((btn, index) => (
            <NavButton
              key={btn.id || `${btn.label}-${index}`}
              label={btn.label}
              link={btn.link}
              icon={btn.icon}
              newTab={Boolean(btn.newTab)}
              paused={false}
              isMobile={true}
            />
          ))}
        </nav>
      )}
    </>
  );
}
