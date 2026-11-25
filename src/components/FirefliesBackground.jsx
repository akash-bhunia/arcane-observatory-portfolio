"use client";

import React, { useEffect, useRef, useState } from "react";

const createFirefly = (id) => ({
  id,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  animationDuration: `${Math.random() * 5 + 5.5}s`,
  tx: `${(Math.random() - 0.5) * 80}px`,
  ty: `${(Math.random() - 0.5) * 80}px`,
});

export default function FirefliesBackground() {
  const [fireflies, setFireflies] = useState([]);
  const idCounterRef = useRef(1);

  useEffect(() => {
    const initial = Array.from({ length: 18 }, () =>
      createFirefly(idCounterRef.current++),
    );
    setFireflies(initial);

    const interval = setInterval(() => {
      setFireflies((prev) => {
        if (prev.length >= 24) return prev;
        return [...prev.slice(-17), createFirefly(idCounterRef.current++)];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[4]"
    >
      <style jsx>{`
        @keyframes fireflyDrift {
          0% {
            transform: translate3d(0, 0, 0) scale(0.85);
            opacity: 0.45;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(var(--tx, 20px), var(--ty, -20px), 0)
              scale(1.15);
            opacity: 0.55;
          }
        }
      `}</style>

      {fireflies.map((fly) => (
        <div
          key={fly.id}
          className="absolute w-[6px] h-[6px] rounded-full bg-accent/80 blur-[1px]"
          style={{
            top: fly.top,
            left: fly.left,
            "--tx": fly.tx,
            "--ty": fly.ty,
            boxShadow: "0 0 8px rgba(103, 232, 249, 0.45)",
            animation: `fireflyDrift ${fly.animationDuration} infinite alternate ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
