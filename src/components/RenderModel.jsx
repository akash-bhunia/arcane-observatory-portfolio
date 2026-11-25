"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import clsx from "clsx";

export default function RenderModel({ children, className }) {
  return (
    <Canvas
      className={clsx("w-full h-full relative z-10", className)}
      camera={{
        position: [0, 0.05, 5.2],
        fov: 42,
        near: 0.1,
        far: 100,
      }}
      shadows={false}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 4]} intensity={1.8} color="#f5f3ff" />
      <pointLight position={[-3, -1, 3]} intensity={0.9} color="#67e8f9" />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
