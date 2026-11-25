"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function WizardStaff(props) {
  const staffRef = useRef();
  const crystalRef = useRef();
  const crystalMatRef = useRef();
  const gyroRingRef = useRef();
  const surgeUntilRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);

    return () => {
      mq.removeEventListener("change", handleChange);
      if (typeof document !== "undefined") {
        document.body.style.cursor = "auto";
      }
    };
  }, []);

  const handleClick = (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    surgeUntilRef.current = performance.now() + 1250;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime + dt * 0;
    const surgeRemaining =
      Math.max(0, surgeUntilRef.current - performance.now()) / 1250;
    const surgeBoost =
      surgeRemaining > 0 ? Math.sin(surgeRemaining * Math.PI) : 0;

    if (reducedMotion) {
      if (staffRef.current) {
        staffRef.current.position.y = 0;
        staffRef.current.rotation.z = 0;
      }
      if (crystalRef.current) {
        crystalRef.current.rotation.set(0, 0, 0);
        crystalRef.current.scale.setScalar(1);
      }
      if (gyroRingRef.current) {
        gyroRingRef.current.rotation.set(Math.PI / 3, 0.4, 0);
      }
      return;
    }

    if (staffRef.current) {
      staffRef.current.position.y = Math.sin(t * 1.2) * 0.1 + surgeBoost * 0.06;
      staffRef.current.rotation.z =
        Math.sin(t * 0.9) * 0.03 - surgeBoost * 0.05;
    }

    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * (1.2 + surgeBoost * 3.5);
      crystalRef.current.rotation.x = Math.sin(t * 1.5) * 0.18;
      const pulse = 1 + Math.sin(t * 2.6) * 0.06 + surgeBoost * 0.22;
      crystalRef.current.scale.setScalar(pulse);
    }

    if (crystalMatRef.current) {
      crystalMatRef.current.emissiveIntensity =
        0.65 + Math.sin(t * 2.6) * 0.2 + surgeBoost * 1.25;
    }

    if (gyroRingRef.current) {
      const speedMult = 1 + surgeBoost * 3;
      gyroRingRef.current.rotation.x = Math.PI / 3 + t * 1.1 * speedMult;
      gyroRingRef.current.rotation.y = 0.4 + t * 1.6 * speedMult;
      gyroRingRef.current.rotation.z =
        Math.sin(t * 1.4) * 0.25 + surgeBoost * 0.35;
    }
  });

  return (
    <group
      ref={staffRef}
      scale={[0.9, 0.9, 0.9]}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
      {...props}
    >
      {/* Main Wooden Shaft */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.08, 3.2, 16]} />
        <meshStandardMaterial
          color="#78350f"
          roughness={0.62}
          metalness={0.12}
        />
      </mesh>

      {/* Bottom Golden Tip */}
      <mesh position={[0, -1.64, 0]}>
        <coneGeometry args={[0.082, 0.18, 16]} />
        <meshStandardMaterial
          color="#eab308"
          emissive="#ca8a04"
          emissiveIntensity={0.35}
          roughness={0.32}
          metalness={0.7}
        />
      </mesh>

      {/* Mid Decorative Gold Collar */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.018, 12, 24]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#ca8a04"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.72}
        />
      </mesh>

      {/* Upper Crown Collar Ring */}
      <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.085, 0.022, 12, 28]} />
        <meshStandardMaterial
          color="#fde047"
          emissive="#eab308"
          emissiveIntensity={0.55}
          roughness={0.28}
          metalness={0.75}
        />
      </mesh>

      {/* Crystal Head Assembly */}
      <group position={[0, 1.75, 0]}>
        <mesh ref={crystalRef}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            ref={crystalMatRef}
            color="#facc15"
            emissive="#eab308"
            emissiveIntensity={0.65}
            roughness={0.22}
            metalness={0.45}
          />
        </mesh>

        {/* Bright Inner Core */}
        <mesh>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial
            color="#fef9c3"
            emissive="#fde047"
            emissiveIntensity={1.2}
            roughness={0.15}
          />
        </mesh>

        {/* Tilted Gyro Ring Around Crystal */}
        <mesh ref={gyroRingRef} rotation={[Math.PI / 3, 0.4, 0]}>
          <torusGeometry args={[0.45, 0.014, 10, 36]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#22d3ee"
            emissiveIntensity={0.95}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
