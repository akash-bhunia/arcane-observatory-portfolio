"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";

const WizardHead = dynamic(() => import("@/components/models/WizardHead"), {
  ssr: false,
});

function AboutBackground3D() {
  const pointsRef = useRef();
  const outerRingRef = useRef();
  const innerRingRef = useRef();

  const { positions, colors } = useMemo(() => {
    const count = 240;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      [0.4, 0.91, 0.98], // cyan
      [0.85, 0.71, 0.99], // violet
      [0.99, 0.88, 0.28], // soft gold
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const s1 = Math.sin(i * 19.317) * 43758.5453;
      const s2 = Math.sin(i * 61.913) * 24634.6345;
      const s3 = Math.sin(i * 27.719) * 19283.4712;

      const r1 = s1 - Math.floor(s1);
      const r2 = s2 - Math.floor(s2);
      const r3 = s3 - Math.floor(s3);

      pos[i3] = (r1 - 0.5) * 16;
      pos[i3 + 1] = (r2 - 0.5) * 11;
      pos[i3 + 2] = (r3 - 0.5) * 9 - 2.5;

      const c = palette[i % palette.length];
      col[i3] = c[0];
      col[i3 + 1] = c[1];
      col[i3 + 2] = c[2];
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.y += dt * 0.025;
      pointsRef.current.rotation.x = Math.cos(t * 0.18) * 0.05;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += dt * 0.05;
      outerRingRef.current.rotation.x = 1.1 + Math.sin(t * 0.3) * 0.08;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= dt * 0.08;
      innerRingRef.current.rotation.y = Math.cos(t * 0.25) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.62}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <mesh
        ref={outerRingRef}
        position={[-2.4, 0.2, -3.6]}
        rotation={[1.1, 0.15, 0]}
      >
        <torusGeometry args={[3.5, 0.012, 12, 100]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.14} />
      </mesh>

      <mesh
        ref={innerRingRef}
        position={[-2.4, 0.2, -3.6]}
        rotation={[-0.7, 0.3, 0]}
      >
        <torusGeometry args={[2.55, 0.01, 12, 90]} />
        <meshBasicMaterial color="#d8b4fe" transparent opacity={0.13} />
      </mesh>
    </>
  );
}

function AnimatedWizardHeadRig() {
  const headGroupRef = useRef();
  const cyanRingRef = useRef();
  const violetRingRef = useRef();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const pointerX = state.pointer?.x || 0;
    const pointerY = state.pointer?.y || 0;

    if (headGroupRef.current) {
      headGroupRef.current.position.y = -0.18 + Math.sin(t * 1.4) * 0.09;
      const targetRotY = pointerX * 0.28 + Math.sin(t * 0.6) * 0.08;
      const targetRotX = -pointerY * 0.16 + Math.cos(t * 0.5) * 0.04;
      headGroupRef.current.rotation.y +=
        (targetRotY - headGroupRef.current.rotation.y) * Math.min(dt * 5, 1);
      headGroupRef.current.rotation.x +=
        (targetRotX - headGroupRef.current.rotation.x) * Math.min(dt * 5, 1);
    }

    if (cyanRingRef.current) {
      cyanRingRef.current.rotation.z += dt * 0.38;
      cyanRingRef.current.rotation.x = 1.15 + Math.sin(t * 0.7) * 0.12;
    }

    if (violetRingRef.current) {
      violetRingRef.current.rotation.z -= dt * 0.55;
      violetRingRef.current.rotation.y = -0.45 + Math.cos(t * 0.6) * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 4]} intensity={1.85} color="#67e8f9" />
      <pointLight position={[-3, -2, 3]} intensity={1.55} color="#d8b4fe" />
      <pointLight position={[0, 2.5, -2]} intensity={0.9} color="#fde047" />

      <group ref={headGroupRef} scale={0.92} position={[0, -0.18, 0]}>
        <WizardHead />

        {/* 3D Orbital Cyan Ring around WizardHead */}
        <mesh ref={cyanRingRef} position={[0, 0.05, 0]} rotation={[1.15, 0, 0]}>
          <torusGeometry args={[1.65, 0.016, 16, 100]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#22d3ee"
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>

        {/* 3D Tilted Violet Ring */}
        <mesh
          ref={violetRingRef}
          position={[0, 0.05, 0]}
          rotation={[-0.65, -0.45, 0]}
        >
          <torusGeometry args={[1.38, 0.012, 16, 90]} />
          <meshStandardMaterial
            color="#d8b4fe"
            emissive="#c084fc"
            emissiveIntensity={0.75}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}

const defaultAbout = {
  eyebrow: "About Me",
  builderTag: "✦ AKASH BHUNIA",
  headingPrefix: "Creative",
  headingHighlight: "Developer",
  bio: "I build interactive web experiences combining modern frontend engineering, 3D visuals, and smooth motion design.",
  quickStats: [
    { id: "stat-1", label: "Track", value: "B.Tech CSE" },
    { id: "stat-2", label: "Craft", value: "MERN + R3F" },
    { id: "stat-3", label: "Focus", value: "3D Web & UI" },
  ],
  focusAreas: [
    {
      id: "focus-1",
      code: "01 // 3D & MOTION",
      title: "Interactive 3D & UI",
      desc: "Responsive interfaces, orbital motion, and Three.js / R3F scenes built for smooth performance.",
      accent: "#67e8f9",
    },
    {
      id: "focus-2",
      code: "02 // ARCHITECTURE",
      title: "Full-Stack Engineering",
      desc: "End-to-end web apps with clean state flow, APIs, and polished user interactions.",
      accent: "#d8b4fe",
    },
  ],
  skills: [
    "Next.js",
    "React",
    "Three.js",
    "React Three Fiber",
    "Tailwind CSS",
    "Framer Motion",
    "JavaScript",
    "Node.js",
  ],
};

export default function AboutPage() {
  const [about, setAbout] = useState(defaultAbout);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active || !json?.data?.about) return;
        const incoming = json.data.about;
        setAbout({
          ...defaultAbout,
          ...incoming,
          quickStats:
            Array.isArray(incoming.quickStats) && incoming.quickStats.length > 0
              ? incoming.quickStats
              : defaultAbout.quickStats,
          focusAreas:
            Array.isArray(incoming.focusAreas) && incoming.focusAreas.length > 0
              ? incoming.focusAreas
              : defaultAbout.focusAreas,
          skills:
            Array.isArray(incoming.skills) && incoming.skills.length > 0
              ? incoming.skills
              : defaultAbout.skills,
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "92px 24px 88px",
        overflowX: "clip",
        background:
          "radial-gradient(circle at 20% 28%, rgba(103, 232, 249, 0.12), transparent 45%), radial-gradient(circle at 82% 66%, rgba(192, 132, 252, 0.14), transparent 48%), radial-gradient(circle at 52% 12%, rgba(253, 224, 71, 0.06), transparent 38%), linear-gradient(180deg, #050814 0%, #090d1c 100%)",
        color: "#f8fafc",
      }}
    >
      <style jsx global>{`
        @keyframes aboutHairlineSweep {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes aboutDotPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>

      {/* 3D Background Starfield & Rings */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
        >
          <AboutBackground3D />
        </Canvas>
      </div>

      {/* Content Wrapper */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1140px",
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "38px",
        }}
      >
        {/* Left Column: Animated 3D WizardHead + 3D Orbital Rings */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            flex: "1 1 380px",
            minWidth: "280px",
            height: "470px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "24px",
            background:
              "radial-gradient(circle at center, rgba(103, 232, 249, 0.14) 0%, rgba(15, 23, 42, 0.24) 65%, transparent 100%)",
          }}
        >
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.2, 5.3], fov: 42 }}
            gl={{ alpha: true, antialias: true }}
            style={{ width: "100%", height: "100%" }}
          >
            <AnimatedWizardHeadRig />
          </Canvas>
        </div>

        {/* Right Column: Glassmorphic About Card */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            flex: "1 1 440px",
            maxWidth: "620px",
            width: "100%",
            margin: "0 auto",
            borderRadius: "24px",
            padding: "32px 28px",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(9, 13, 28, 0.96))",
            border: "1px solid rgba(103, 232, 249, 0.26)",
            boxShadow:
              "0 24px 60px rgba(2, 6, 23, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          {/* Shimmer Top Hairline */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "24px",
              right: "24px",
              height: "1.5px",
              background:
                "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.8), rgba(253, 224, 71, 0.55), rgba(216, 180, 254, 0.75), transparent)",
              backgroundSize: "200% 100%",
              animation: "aboutHairlineSweep 5s linear infinite",
            }}
          />

          {/* Top Tag Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 12px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#67e8f9",
                backgroundColor: "rgba(34, 211, 238, 0.1)",
                border: "1px solid rgba(103, 232, 249, 0.28)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "9999px",
                  backgroundColor: "#67e8f9",
                  animation: "aboutDotPulse 2s ease-in-out infinite",
                }}
              />
              {about.eyebrow}
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#fde047",
              }}
            >
              {about.builderTag}
            </span>
          </div>

          {/* Heading & Bio */}
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "0 0 12px 0",
              color: "#ffffff",
            }}
          >
            {about.headingPrefix}{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {about.headingHighlight}
            </span>
          </h1>

          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#cbd5e1",
              margin: "0 0 20px 0",
            }}
          >
            {about.bio}
          </p>

          {/* Compact Stats Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {about.quickStats.map((stat, idx) => {
              const statAccent =
                idx === 0 ? "#67e8f9" : idx === 1 ? "#d8b4fe" : "#fde047";
              return (
                <div
                  key={stat.id || `${stat.label}-${idx}`}
                  style={{
                    padding: "10px 13px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(148, 163, 184, 0.16)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10.5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "#94a3b8",
                      marginBottom: "2px",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: statAccent,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-Sections: Focus Areas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {about.focusAreas.map((area, idx) => {
              const active = hoveredArea === idx;
              const accentColor =
                area.accent || (idx % 2 === 0 ? "#67e8f9" : "#d8b4fe");
              return (
                <div
                  key={area.id || `${area.title}-${idx}`}
                  onMouseEnter={() => setHoveredArea(idx)}
                  onMouseLeave={() => setHoveredArea(null)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: active
                      ? `1px solid ${accentColor}`
                      : "1px solid rgba(148, 163, 184, 0.18)",
                    boxShadow: active ? `0 8px 22px ${accentColor}1a` : "none",
                    transform: active ? "translateY(-2px)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: accentColor,
                      marginBottom: "4px",
                    }}
                  >
                    {area.code}
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "4px",
                    }}
                  >
                    {area.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.55,
                      color: "#cbd5e1",
                    }}
                  >
                    {area.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Skills */}
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
                margin: "0 0 12px 0",
              }}
            >
              Core Skills
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {about.skills.map((skill, idx) => {
                const isSkillHovered = hoveredSkill === `${skill}-${idx}`;
                return (
                  <span
                    key={`${skill}-${idx}`}
                    onMouseEnter={() => setHoveredSkill(`${skill}-${idx}`)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: isSkillHovered ? "#cffafe" : "#e2e8f0",
                      backgroundColor: isSkillHovered
                        ? "rgba(34, 211, 238, 0.14)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: isSkillHovered
                        ? "1px solid rgba(103, 232, 249, 0.5)"
                        : "1px solid rgba(148, 163, 184, 0.22)",
                      transform: isSkillHovered ? "translateY(-1px)" : "none",
                      transition: "all 0.2s ease",
                      cursor: "default",
                    }}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Navigation Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Link
              href="/"
              onMouseEnter={() => setHoveredBtn("home")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                color: "#020617",
                backgroundColor: hoveredBtn === "home" ? "#a5f3fc" : "#67e8f9",
                boxShadow:
                  hoveredBtn === "home"
                    ? "0 0 22px rgba(103, 232, 249, 0.4)"
                    : "0 6px 18px rgba(34, 211, 238, 0.2)",
                transform: hoveredBtn === "home" ? "translateY(-1px)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Back to Home
            </Link>

            <Link
              href="/projects"
              onMouseEnter={() => setHoveredBtn("projects")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 18px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                color: hoveredBtn === "projects" ? "#ffffff" : "#e2e8f0",
                backgroundColor:
                  hoveredBtn === "projects"
                    ? "rgba(255, 255, 255, 0.14)"
                    : "rgba(255, 255, 255, 0.07)",
                border:
                  hoveredBtn === "projects"
                    ? "1px solid rgba(192, 132, 252, 0.5)"
                    : "1px solid rgba(148, 163, 184, 0.25)",
                transform:
                  hoveredBtn === "projects" ? "translateY(-1px)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
