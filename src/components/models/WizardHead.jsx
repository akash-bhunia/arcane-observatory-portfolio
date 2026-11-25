"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function WizardHead(props) {
  const headRef = useRef();
  const faceGroupRef = useRef();
  const hatGroupRef = useRef();
  const haloRef = useRef();
  const shardOrbitRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const leftBrowRef = useRef();
  const rightBrowRef = useRef();
  const frontGemMatRef = useRef();

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

  const handleClick = (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    surgeUntilRef.current = performance.now() + 1300;
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const surgeRemaining =
      Math.max(0, surgeUntilRef.current - performance.now()) / 1300;
    const surgeBoost =
      surgeRemaining > 0 ? Math.sin(surgeRemaining * Math.PI) : 0;

    if (reducedMotion) {
      if (headRef.current) headRef.current.rotation.set(0, 0, 0);
      if (faceGroupRef.current) faceGroupRef.current.rotation.set(0, 0, 0);
      if (hatGroupRef.current) hatGroupRef.current.rotation.set(0, 0, 0);
      if (haloRef.current) {
        haloRef.current.position.y = 1.06;
        haloRef.current.rotation.set(Math.PI / 2.4, 0, 0);
      }
      if (shardOrbitRef.current) {
        shardOrbitRef.current.rotation.set(0.3, 0, -0.25);
        shardOrbitRef.current.scale.setScalar(1);
      }
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.set(1, 1, 1);
        rightEyeRef.current.scale.set(1, 1, 1);
      }
      if (leftBrowRef.current && rightBrowRef.current) {
        leftBrowRef.current.position.y = 0.23;
        rightBrowRef.current.position.y = 0.23;
      }
      return;
    }

    const lerpFactor = Math.min(dt * 6.5, 1);
    pointerSmoothRef.current.x +=
      (pointerTargetRef.current.x - pointerSmoothRef.current.x) * lerpFactor;
    pointerSmoothRef.current.y +=
      (pointerTargetRef.current.y - pointerSmoothRef.current.y) * lerpFactor;

    const px = pointerSmoothRef.current.x;
    const py = pointerSmoothRef.current.y;

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.22 + px * 0.2;
      headRef.current.rotation.x =
        Math.sin(t * 1.1) * 0.04 + py * 0.1 - surgeBoost * 0.11;
      headRef.current.rotation.z =
        Math.sin(t * 0.95) * 0.04 - px * 0.05 + surgeBoost * 0.06;
    }

    if (faceGroupRef.current) {
      faceGroupRef.current.rotation.y = px * 0.08;
      faceGroupRef.current.rotation.x = py * 0.05;
    }

    if (hatGroupRef.current) {
      hatGroupRef.current.rotation.z =
        Math.sin(t * 1.3) * 0.04 - surgeBoost * 0.08;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = t * (0.9 + surgeBoost * 3.5);
      haloRef.current.position.y =
        1.06 + Math.sin(t * 2.1) * 0.03 + surgeBoost * 0.08;
    }

    if (shardOrbitRef.current) {
      shardOrbitRef.current.rotation.y = t * (1.5 + surgeBoost * 3.2);
      shardOrbitRef.current.scale.setScalar(1 + surgeBoost * 0.14);
    }

    if (frontGemMatRef.current) {
      frontGemMatRef.current.emissiveIntensity =
        1.15 + Math.sin(t * 2.8) * 0.25 + surgeBoost * 1.2;
    }

    // Natural blink every ~3.5 seconds
    const blinkCycle = t % 3.5;
    const blinkScaleY = blinkCycle > 3.34 ? 0.1 : 1 + surgeBoost * 0.14;
    const eyeScaleXZ = 1 + surgeBoost * 0.12;

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.set(eyeScaleXZ, blinkScaleY, eyeScaleXZ);
      rightEyeRef.current.scale.set(eyeScaleXZ, blinkScaleY, eyeScaleXZ);
    }

    // Expressive eyebrows
    const browLift = Math.sin(t * 2.2) * 0.02 - py * 0.015 + surgeBoost * 0.065;
    if (leftBrowRef.current && rightBrowRef.current) {
      leftBrowRef.current.position.y = 0.23 + browLift;
      leftBrowRef.current.rotation.z =
        0.16 + Math.sin(t * 1.7) * 0.04 + surgeBoost * 0.12;

      rightBrowRef.current.position.y = 0.23 + browLift * 1.1;
      rightBrowRef.current.rotation.z =
        -0.18 - Math.sin(t * 1.7) * 0.05 - surgeBoost * 0.12;
    }
  });

  return (
    <group
      ref={headRef}
      scale={[1.1, 1.1, 1.1]}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
      {...props}
    >
      {/* Head Sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#4c1d95"
          emissiveIntensity={0.28}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>

      {/* Side Temple Crystal Accents */}
      <mesh position={[-0.72, -0.02, 0.04]} rotation={[0, 0, 0.35]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#ca8a04"
          emissiveIntensity={0.65}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0.72, -0.02, 0.04]} rotation={[0, 0, -0.35]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#ca8a04"
          emissiveIntensity={0.65}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      {/* Face Features */}
      <group ref={faceGroupRef}>
        {/* Left Eye + Catchlight */}
        <group ref={leftEyeRef} position={[-0.22, 0.06, 0.65]}>
          <mesh>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.025, 0.03, 0.068]}>
            <sphereGeometry args={[0.026, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.85}
            />
          </mesh>
        </group>

        {/* Right Eye + Catchlight */}
        <group ref={rightEyeRef} position={[0.22, 0.06, 0.65]}>
          <mesh>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.025, 0.03, 0.068]}>
            <sphereGeometry args={[0.026, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.85}
            />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh
          ref={leftBrowRef}
          position={[-0.22, 0.23, 0.65]}
          rotation={[0, 0, 0.16]}
        >
          <boxGeometry args={[0.17, 0.032, 0.04]} />
          <meshStandardMaterial color="#fde68a" roughness={0.4} />
        </mesh>
        <mesh
          ref={rightBrowRef}
          position={[0.22, 0.23, 0.65]}
          rotation={[0, 0, -0.18]}
        >
          <boxGeometry args={[0.17, 0.032, 0.04]} />
          <meshStandardMaterial color="#fde68a" roughness={0.4} />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.14, 0.66]} rotation={[0.18, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.022, 12, 28, Math.PI * 0.85]} />
          <meshStandardMaterial color="#fde68a" roughness={0.35} />
        </mesh>

        {/* Cheeks */}
        <mesh position={[-0.36, -0.05, 0.56]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial
            color="#f472b6"
            roughness={0.7}
            transparent
            opacity={0.55}
          />
        </mesh>
        <mesh position={[0.36, -0.05, 0.56]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial
            color="#f472b6"
            roughness={0.7}
            transparent
            opacity={0.55}
          />
        </mesh>
      </group>

      {/* Wizard Hat Group */}
      <group ref={hatGroupRef} position={[0, 0.56, 0]}>
        {/* Hat Brim */}
        <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.78, 0.085, 16, 36]} />
          <meshStandardMaterial
            color="#4338ca"
            roughness={0.38}
            metalness={0.25}
          />
        </mesh>

        {/* Golden Hat Band */}
        <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.58, 0.042, 12, 32]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#ca8a04"
            emissiveIntensity={0.45}
            roughness={0.3}
            metalness={0.65}
          />
        </mesh>

        {/* Main Hat Cone */}
        <mesh position={[0, 0.44, 0]}>
          <coneGeometry args={[0.65, 0.88, 24]} />
          <meshStandardMaterial
            color="#4f46e5"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Curved Hat Tip */}
        <mesh position={[0.08, 0.88, -0.04]} rotation={[0, 0, -0.32]}>
          <coneGeometry args={[0.16, 0.34, 18]} />
          <meshStandardMaterial
            color="#4338ca"
            emissive="#3730a3"
            emissiveIntensity={0.3}
            roughness={0.38}
            metalness={0.22}
          />
        </mesh>

        {/* Hat Front Gem */}
        <mesh position={[0, 0.26, 0.45]} rotation={[-0.4, 0, 0]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial
            ref={frontGemMatRef}
            color="#67e8f9"
            emissive="#22d3ee"
            emissiveIntensity={1.2}
            roughness={0.15}
          />
        </mesh>

        {/* Hat Tip Star Gem */}
        <mesh position={[0.14, 1.03, -0.07]}>
          <octahedronGeometry args={[0.052, 0]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={1.15}
          />
        </mesh>
      </group>

      {/* Floating Arcane Halo Ring */}
      <mesh
        ref={haloRef}
        position={[0, 1.06, 0]}
        rotation={[Math.PI / 2.4, 0, 0]}
      >
        <torusGeometry args={[0.42, 0.015, 12, 36]} />
        <meshStandardMaterial
          color="#a5f3fc"
          emissive="#22d3ee"
          emissiveIntensity={1.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Tilted Orbiting Astral Shard */}
      <group
        ref={shardOrbitRef}
        position={[0, 0.92, 0]}
        rotation={[0.3, 0, -0.25]}
      >
        <mesh position={[0.62, 0.06, 0]}>
          <octahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial
            color="#f5d0fe"
            emissive="#c084fc"
            emissiveIntensity={1.25}
          />
        </mesh>
      </group>
    </group>
  );
}
