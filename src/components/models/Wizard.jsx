"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function Wizard(props) {
  const modelRef = useRef();
  const robeRef = useRef();
  const headGroupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftBrowRef = useRef();
  const rightBrowRef = useRef();
  const hatRef = useRef();
  const wandRef = useRef();
  const orbRef = useRef();
  const orbMatRef = useRef();
  const wandRingRef = useRef();
  const sparksRef = useRef();
  const haloRef = useRef();
  const outerRuneRingRef = useRef();

  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerSmoothRef = useRef({ x: 0, y: 0 });
  const surgeUntilRef = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);

    const handlePointerMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const nx = Math.max(
        -1,
        Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2),
      );
      const ny = Math.max(
        -1,
        Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2),
      );
      pointerTargetRef.current = { x: nx, y: ny };
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      mq.removeEventListener("change", handleChange);
      window.removeEventListener("pointermove", handlePointerMove);
      if (typeof document !== "undefined") {
        document.body.style.cursor = "auto";
      }
    };
  }, []);

  const triggerMagicSurge = (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    surgeUntilRef.current = performance.now() + 1400;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const now = performance.now();
    const surgeRemaining = Math.max(0, surgeUntilRef.current - now) / 1400;
    const surgeBoost =
      surgeRemaining > 0 ? Math.sin(surgeRemaining * Math.PI) : 0;

    if (reducedMotion) {
      if (modelRef.current) {
        modelRef.current.position.y = -0.15;
        modelRef.current.rotation.set(0, 0, 0);
      }
      if (robeRef.current) robeRef.current.scale.set(1, 1, 1);
      if (headGroupRef.current) headGroupRef.current.rotation.set(0, 0, 0);
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 1;
        rightEyeRef.current.scale.y = 1;
      }
      if (leftBrowRef.current && rightBrowRef.current) {
        leftBrowRef.current.position.y = 0.84;
        rightBrowRef.current.position.y = 0.84;
      }
      if (hatRef.current) hatRef.current.rotation.z = 0;
      if (wandRef.current) {
        wandRef.current.position.y = 0.2;
        wandRef.current.rotation.z = -0.35;
      }
      if (sparksRef.current) {
        sparksRef.current.scale.setScalar(1);
      }
      return;
    }

    // Frame-rate safe smooth pointer tracking
    const lerpFactor = Math.min(dt * 6.5, 1);
    pointerSmoothRef.current.x +=
      (pointerTargetRef.current.x - pointerSmoothRef.current.x) * lerpFactor;
    pointerSmoothRef.current.y +=
      (pointerTargetRef.current.y - pointerSmoothRef.current.y) * lerpFactor;

    const px = pointerSmoothRef.current.x;
    const py = pointerSmoothRef.current.y;
    const proximity = Math.max(0, 1 - Math.hypot(px, py) * 0.85);

    // Gentle body float & breathing sway + surge lift
    if (modelRef.current) {
      modelRef.current.position.y =
        -0.15 + Math.sin(t * 1.6) * 0.08 + surgeBoost * 0.08;
      modelRef.current.rotation.y = Math.sin(t * 0.65) * 0.2 + px * 0.14;
      modelRef.current.rotation.z = Math.sin(t * 1.1) * 0.025;
    }

    // Subtle breathing on robe
    if (robeRef.current) {
      const breath = 1 + Math.sin(t * 2.2) * 0.018;
      robeRef.current.scale.set(breath, 1, breath);
    }

    // Head expression + cursor gaze + playful surge nod
    if (headGroupRef.current) {
      headGroupRef.current.rotation.x =
        Math.sin(t * 1.35) * 0.04 + py * 0.11 - surgeBoost * 0.12;
      headGroupRef.current.rotation.y =
        Math.sin(t * 0.9 + 0.4) * 0.1 + px * 0.2;
      headGroupRef.current.rotation.z =
        Math.sin(t * 1.15) * 0.05 - px * 0.05 + surgeBoost * 0.08;
    }

    // Natural blink every ~3.4 seconds
    const blinkCycle = t % 3.4;
    const isBlinking = blinkCycle > 3.24;
    const blinkScaleY = isBlinking ? 0.1 : 1;

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = blinkScaleY;
      rightEyeRef.current.scale.y = blinkScaleY;
    }

    // Expressive eyebrows reacting to magic pulse & surge
    const browLift =
      Math.sin(t * 2.4) * 0.015 - py * 0.012 + surgeBoost * 0.032;
    if (leftBrowRef.current && rightBrowRef.current) {
      leftBrowRef.current.position.y = 0.84 + browLift;
      leftBrowRef.current.rotation.z =
        0.15 + Math.sin(t * 1.8) * 0.04 + surgeBoost * 0.1;

      rightBrowRef.current.position.y = 0.84 + browLift * 1.15;
      rightBrowRef.current.rotation.z =
        -0.17 - Math.sin(t * 1.8) * 0.05 - surgeBoost * 0.1;
    }

    // Hat gentle follow-through
    if (hatRef.current) {
      hatRef.current.rotation.z =
        Math.sin(t * 1.4 - 0.3) * 0.045 - surgeBoost * 0.06;
    }

    // Wand float & tilt
    if (wandRef.current) {
      wandRef.current.position.y =
        0.2 + Math.cos(t * 2.2) * 0.06 + surgeBoost * 0.05;
      wandRef.current.rotation.z =
        -0.35 + Math.sin(t * 1.8) * 0.07 - surgeBoost * 0.14;
    }

    // Wand crystal pulse, proximity & surge intensity
    if (orbRef.current) {
      orbRef.current.rotation.y = t * (1.8 + surgeBoost * 4.5);
      const pulse =
        1 + Math.sin(t * 3.4) * 0.12 + surgeBoost * 0.28 + proximity * 0.06;
      orbRef.current.scale.setScalar(pulse);
    }
    if (orbMatRef.current) {
      orbMatRef.current.emissiveIntensity =
        1.55 + proximity * 0.35 + surgeBoost * 1.4;
    }

    // Wand mini gyro ring spin
    if (wandRingRef.current) {
      const spinMult = 1 + surgeBoost * 3.2;
      wandRingRef.current.rotation.x = t * 1.5 * spinMult;
      wandRingRef.current.rotation.y = t * 2.1 * spinMult;
    }

    // Orbiting mini sparkles around wand orb + surge expansion
    if (sparksRef.current) {
      sparksRef.current.rotation.y = t * (2.4 + surgeBoost * 4);
      sparksRef.current.rotation.z = Math.sin(t * 1.5) * 0.35;
      sparksRef.current.scale.setScalar(1 + surgeBoost * 0.18);
    }

    // Counter-rotating pedestal rings
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.6;
    }
    if (outerRuneRingRef.current) {
      outerRuneRingRef.current.rotation.z = -t * 0.4;
    }
  });

  return (
    <group
      ref={modelRef}
      position={[0, -0.15, 0]}
      scale={[0.64, 0.64, 0.64]}
      onClick={triggerMagicSurge}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
      {...props}
    >
      {/* Balanced Studio + Arcane Rim Lighting */}
      <ambientLight intensity={1.35} />
      <directionalLight position={[3, 5, 4]} intensity={2.35} color="#faf5ff" />
      <pointLight
        position={[-2.6, 1.6, 2.2]}
        intensity={2.25}
        color="#38bdf8"
      />
      <pointLight position={[2.4, 1.2, 2.2]} intensity={2.55} color="#c084fc" />
      <pointLight position={[0, -0.8, 2.5]} intensity={1.15} color="#5eead4" />

      {/* Base Platform / Pedestal */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.78, 0.94, 0.15, 36]} />
        <meshStandardMaterial
          color="#1e1b4b"
          emissive="#4c1d95"
          emissiveIntensity={0.45}
          roughness={0.35}
          metalness={0.55}
        />
      </mesh>

      {/* Inner Glowing Pedestal Ring */}
      <mesh position={[0, -0.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.025, 14, 48]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={1.25}
          roughness={0.2}
        />
      </mesh>

      {/* Clockwise Cyan Energy Ring */}
      <mesh
        ref={haloRef}
        position={[0, -0.99, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.02, 0.012, 10, 48]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={0.85}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Counter-Clockwise Outer Dashed-Look Ring */}
      <mesh
        ref={outerRuneRingRef}
        position={[0, -1.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.18, 0.009, 8, 24]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#eab308"
          emissiveIntensity={0.65}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Breathing Robe Group */}
      <group ref={robeRef}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.36, 0.72, 1.45, 32]} />
          <meshStandardMaterial
            color="#4c1d95"
            emissive="#2e1065"
            emissiveIntensity={0.5}
            roughness={0.5}
            metalness={0.18}
          />
        </mesh>

        {/* Subtle Front Robe Trim Strip */}
        <mesh position={[0, -0.44, 0.56]} rotation={[-0.24, 0, 0]}>
          <boxGeometry args={[0.075, 0.92, 0.02]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Robe Bottom Gold Hem Trim */}
        <mesh position={[0, -0.94, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.71, 0.028, 12, 36]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#ca8a04"
            emissiveIntensity={0.45}
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        {/* Robe Sash / Belt */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.43, 0.055, 14, 36]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#ca8a04"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        {/* Belt Center Buckle Gem */}
        <mesh position={[0, 0.05, 0.43]}>
          <octahedronGeometry args={[0.075, 0]} />
          <meshStandardMaterial
            color="#a5f3fc"
            emissive="#22d3ee"
            emissiveIntensity={1.2}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* Layered Collar / Scarf Accent */}
      <mesh position={[0, 0.41, 0.01]} rotation={[Math.PI / 2 + 0.08, 0, 0]}>
        <torusGeometry args={[0.34, 0.065, 14, 36]} />
        <meshStandardMaterial
          color="#7e22ce"
          emissive="#581c87"
          emissiveIntensity={0.45}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0.37, 0.01]} rotation={[Math.PI / 2 + 0.08, 0, 0]}>
        <torusGeometry args={[0.36, 0.022, 10, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Left & Right Sleeves + Cuffs + Hands */}
      <mesh position={[-0.48, 0.15, 0.05]} rotation={[0, 0, -0.45]}>
        <capsuleGeometry args={[0.13, 0.42, 12, 18]} />
        <meshStandardMaterial
          color="#5b21b6"
          emissive="#3b0764"
          emissiveIntensity={0.4}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[-0.58, 0.03, 0.1]} rotation={[0.35, 0, -0.45]}>
        <torusGeometry args={[0.125, 0.02, 10, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.64, -0.05, 0.14]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.5} />
      </mesh>

      <mesh position={[0.48, 0.15, 0.05]} rotation={[0, 0, 0.45]}>
        <capsuleGeometry args={[0.13, 0.42, 12, 18]} />
        <meshStandardMaterial
          color="#5b21b6"
          emissive="#3b0764"
          emissiveIntensity={0.4}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0.58, 0.03, 0.1]} rotation={[0.35, 0, 0.45]}>
        <torusGeometry args={[0.125, 0.02, 10, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.64, -0.05, 0.14]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.5} />
      </mesh>

      {/* Expressive Head Group */}
      <group ref={headGroupRef}>
        {/* Head */}
        <mesh position={[0, 0.72, 0.02]}>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#78350f"
            emissiveIntensity={0.12}
            roughness={0.45}
          />
        </mesh>

        {/* Left Eye + Catchlight */}
        <group ref={leftEyeRef} position={[-0.12, 0.75, 0.35]}>
          <mesh>
            <sphereGeometry args={[0.048, 14, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.015, 0.018, 0.038]}>
            <sphereGeometry args={[0.015, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.85}
            />
          </mesh>
        </group>

        {/* Right Eye + Catchlight */}
        <group ref={rightEyeRef} position={[0.12, 0.75, 0.35]}>
          <mesh>
            <sphereGeometry args={[0.048, 14, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.015, 0.018, 0.038]}>
            <sphereGeometry args={[0.015, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.85}
            />
          </mesh>
        </group>

        {/* Left & Right Eyebrows */}
        <mesh
          ref={leftBrowRef}
          position={[-0.12, 0.84, 0.35]}
          rotation={[0, 0, 0.15]}
        >
          <boxGeometry args={[0.095, 0.018, 0.025]} />
          <meshStandardMaterial color="#451a03" roughness={0.6} />
        </mesh>
        <mesh
          ref={rightBrowRef}
          position={[0.12, 0.84, 0.35]}
          rotation={[0, 0, -0.17]}
        >
          <boxGeometry args={[0.095, 0.018, 0.025]} />
          <meshStandardMaterial color="#451a03" roughness={0.6} />
        </mesh>

        {/* Friendly Smile */}
        <mesh position={[0, 0.63, 0.355]} rotation={[0.2, 0, Math.PI]}>
          <torusGeometry args={[0.068, 0.013, 10, 24, Math.PI * 0.85]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.5} />
        </mesh>

        {/* Subtle Rosy Cheeks */}
        <mesh position={[-0.2, 0.68, 0.31]}>
          <sphereGeometry args={[0.036, 12, 12]} />
          <meshStandardMaterial
            color="#fda4af"
            roughness={0.8}
            transparent
            opacity={0.62}
          />
        </mesh>
        <mesh position={[0.2, 0.68, 0.31]}>
          <sphereGeometry args={[0.036, 12, 12]} />
          <meshStandardMaterial
            color="#fda4af"
            roughness={0.8}
            transparent
            opacity={0.62}
          />
        </mesh>

        {/* Pointed Wizard Hat + Golden Star Emblem */}
        <group ref={hatRef} position={[0, 1.02, 0]}>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.56, 0.065, 14, 36]} />
            <meshStandardMaterial
              color="#312e81"
              emissive="#4c1d95"
              emissiveIntensity={0.5}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.035, 12, 32]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#d97706"
              emissiveIntensity={0.6}
              metalness={0.55}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <coneGeometry args={[0.44, 0.78, 32]} />
            <meshStandardMaterial
              color="#3730a3"
              emissive="#4c1d95"
              emissiveIntensity={0.45}
              roughness={0.4}
            />
          </mesh>
          {/* Golden Star Emblem on Hat */}
          <mesh position={[0, 0.36, 0.31]} rotation={[-0.45, 0, 0]}>
            <octahedronGeometry args={[0.068, 0]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#eab308"
              emissiveIntensity={0.9}
              metalness={0.65}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0.08, 0.84, -0.04]} rotation={[0, 0, -0.35]}>
            <coneGeometry args={[0.16, 0.35, 24]} />
            <meshStandardMaterial
              color="#4338ca"
              emissive="#6d28d9"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Hat Tip Golden Accent */}
          <mesh position={[0.16, 0.99, -0.08]}>
            <octahedronGeometry args={[0.038, 0]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#eab308"
              emissiveIntensity={1.1}
            />
          </mesh>
        </group>
      </group>

      {/* Floating Magic Wand / Staff with Glowing Orb & Sparkles */}
      <group
        ref={wandRef}
        position={[0.76, 0.2, 0.25]}
        rotation={[0, 0, -0.35]}
      >
        <mesh>
          <cylinderGeometry args={[0.025, 0.035, 1.15, 14]} />
          <meshStandardMaterial
            color="#92400e"
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0, -0.58, 0]}>
          <coneGeometry args={[0.04, 0.1, 12]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={0.5}
            metalness={0.65}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.54, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.055, 0.015, 10, 24]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#d97706"
            emissiveIntensity={0.5}
            metalness={0.65}
            roughness={0.25}
          />
        </mesh>

        <group position={[0, 0.65, 0]}>
          <mesh ref={orbRef}>
            <octahedronGeometry args={[0.12, 1]} />
            <meshStandardMaterial
              ref={orbMatRef}
              color="#67e8f9"
              emissive="#22d3ee"
              emissiveIntensity={1.6}
              roughness={0.15}
            />
          </mesh>

          {/* Bright inner crystal core */}
          <mesh>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e0f2fe"
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Spinning mini gyro ring around orb */}
          <mesh ref={wandRingRef}>
            <torusGeometry args={[0.165, 0.008, 8, 28]} />
            <meshStandardMaterial
              color="#a5f3fc"
              emissive="#38bdf8"
              emissiveIntensity={1.1}
              transparent
              opacity={0.85}
            />
          </mesh>

          <group ref={sparksRef}>
            <mesh position={[0.2, 0.04, 0]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial
                color="#fef9c3"
                emissive="#fde047"
                emissiveIntensity={1.4}
              />
            </mesh>
            <mesh position={[-0.18, -0.05, 0.08]}>
              <sphereGeometry args={[0.018, 10, 10]} />
              <meshStandardMaterial
                color="#a5f3fc"
                emissive="#22d3ee"
                emissiveIntensity={1.3}
              />
            </mesh>
            <mesh position={[0.02, 0.19, -0.1]}>
              <sphereGeometry args={[0.02, 10, 10]} />
              <meshStandardMaterial
                color="#e9d5ff"
                emissive="#c084fc"
                emissiveIntensity={1.3}
              />
            </mesh>
            <mesh position={[-0.04, -0.18, -0.08]}>
              <sphereGeometry args={[0.016, 10, 10]} />
              <meshStandardMaterial
                color="#99f6e4"
                emissive="#2dd4bf"
                emissiveIntensity={1.25}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
