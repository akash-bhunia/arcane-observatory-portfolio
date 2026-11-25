"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function CertificatesBackground3D() {
  const pointsRef = useRef();
  const driftRingRef = useRef();

  const { positions, colors } = useMemo(() => {
    const count = 220;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      [0.99, 0.88, 0.28], // soft gold
      [0.4, 0.91, 0.98], // cyan
      [0.85, 0.71, 0.99], // violet
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const s1 = Math.sin(i * 15.713) * 43758.5453;
      const s2 = Math.sin(i * 67.419) * 24634.6345;
      const s3 = Math.sin(i * 31.827) * 19283.4712;

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
      pointsRef.current.rotation.x = Math.sin(t * 0.18) * 0.05;
    }

    if (driftRingRef.current) {
      driftRingRef.current.rotation.z += dt * 0.045;
      driftRingRef.current.rotation.x = 1.12 + Math.cos(t * 0.3) * 0.08;
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
          size={0.052}
          vertexColors
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <mesh
        ref={driftRingRef}
        position={[0, 0.3, -3.8]}
        rotation={[1.12, 0.15, 0]}
      >
        <torusGeometry args={[3.7, 0.011, 12, 100]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.11} />
      </mesh>
    </>
  );
}

function CertificateSeal3D({ activeHover }) {
  const rootGroupRef = useRef();
  const outerRingRef = useRef();
  const middleRingRef = useRef();
  const crystalRef = useRef();
  const haloRef = useRef();
  const node1Ref = useRef();
  const node2Ref = useRef();
  const node3Ref = useRef();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const boost = activeHover ? 2.1 : 1;
    const px = state.pointer?.x || 0;
    const py = state.pointer?.y || 0;

    if (rootGroupRef.current) {
      const targetY = px * 0.24;
      const targetX = -py * 0.16;
      rootGroupRef.current.rotation.y +=
        (targetY - rootGroupRef.current.rotation.y) * Math.min(dt * 5, 1);
      rootGroupRef.current.rotation.x +=
        (targetX - rootGroupRef.current.rotation.x) * Math.min(dt * 5, 1);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += dt * 0.45 * boost;
      outerRingRef.current.rotation.x = 0.35 + Math.sin(t * 0.7) * 0.1;
    }

    if (middleRingRef.current) {
      middleRingRef.current.rotation.z -= dt * 0.75 * boost;
      middleRingRef.current.rotation.y = -0.3 + Math.cos(t * 0.8) * 0.12;
    }

    if (crystalRef.current) {
      crystalRef.current.rotation.y += dt * 0.85 * boost;
      crystalRef.current.rotation.x = Math.sin(t * 1.1) * 0.18;
      const s = activeHover
        ? 1.08 + Math.sin(t * 6) * 0.03
        : 1 + Math.sin(t * 2.2) * 0.025;
      crystalRef.current.scale.setScalar(s);
    }

    if (haloRef.current) {
      haloRef.current.rotation.z += dt * 0.3 * boost;
    }

    const orbitRadius = activeHover ? 1.56 : 1.5;
    const angle1 = t * 1.1 * boost;
    const angle2 = angle1 + (Math.PI * 2) / 3;
    const angle3 = angle1 + (Math.PI * 4) / 3;

    if (node1Ref.current) {
      node1Ref.current.position.set(
        Math.cos(angle1) * orbitRadius,
        Math.sin(angle1) * orbitRadius * 0.72,
        Math.sin(angle1) * 0.35,
      );
    }
    if (node2Ref.current) {
      node2Ref.current.position.set(
        Math.cos(angle2) * orbitRadius,
        Math.sin(angle2) * orbitRadius * 0.72,
        Math.sin(angle2) * 0.35,
      );
    }
    if (node3Ref.current) {
      node3Ref.current.position.set(
        Math.cos(angle3) * orbitRadius,
        Math.sin(angle3) * orbitRadius * 0.72,
        Math.sin(angle3) * 0.35,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 4]} intensity={1.8} color="#fde047" />
      <pointLight position={[-3, -2, 3]} intensity={1.5} color="#67e8f9" />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.16}>
        <group ref={rootGroupRef} scale={0.86}>
          {/* Outer Gold Crest Ring */}
          <mesh ref={outerRingRef} rotation={[0.35, 0, 0]}>
            <torusGeometry args={[1.5, 0.024, 16, 100]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#facc15"
              emissiveIntensity={activeHover ? 1.2 : 0.65}
              metalness={0.6}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>

          {/* Inner Cyan Orbital Ring */}
          <mesh ref={middleRingRef} rotation={[-0.35, 0.3, 0]}>
            <torusGeometry args={[1.16, 0.018, 16, 90]} />
            <meshStandardMaterial
              color="#67e8f9"
              emissive="#22d3ee"
              emissiveIntensity={activeHover ? 1.35 : 0.75}
              toneMapped={false}
            />
          </mesh>

          {/* Subtle Wireframe Star Cage */}
          <mesh ref={haloRef}>
            <dodecahedronGeometry args={[0.92, 0]} />
            <meshBasicMaterial
              color="#d8b4fe"
              wireframe
              transparent
              opacity={activeHover ? 0.32 : 0.16}
            />
          </mesh>

          {/* Central Verified Relic Crystal */}
          <mesh ref={crystalRef}>
            <octahedronGeometry args={[0.58, 0]} />
            <meshStandardMaterial
              color="#67e8f9"
              emissive="#38bdf8"
              emissiveIntensity={activeHover ? 1.1 : 0.55}
              metalness={0.35}
              roughness={0.18}
              toneMapped={false}
            />
          </mesh>

          {/* Orbiting Star Nodes */}
          <mesh ref={node1Ref}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#facc15"
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={node2Ref}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial
              color="#67e8f9"
              emissive="#22d3ee"
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={node3Ref}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial
              color="#d8b4fe"
              emissive="#c084fc"
              emissiveIntensity={1.15}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Float>
    </>
  );
}

const fallbackCertificates = {
  eyebrow: "Verified Credentials",
  headingPrefix: "Honors &",
  headingHighlight: "Certificates",
  subtitle:
    "Certifications, conference presentations, and technical milestones.",
  items: [],
};

export default function CertificatesPage() {
  const [certData, setCertData] = useState(fallbackCertificates);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [selectedIssuer, setSelectedIssuer] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json?.data?.certificates) {
          setCertData({
            ...fallbackCertificates,
            ...json.data.certificates,
            items: Array.isArray(json.data.certificates.items)
              ? json.data.certificates.items
              : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCert) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedCert(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCert]);

  const issuers = useMemo(() => {
    const unique = new Set();
    certData.items.forEach((item) => {
      if (item?.issuer && item.issuer.trim()) {
        unique.add(item.issuer.trim());
      }
    });
    return ["All", ...Array.from(unique)];
  }, [certData.items]);

  const filteredItems = useMemo(() => {
    return certData.items.filter((cert) => {
      const matchesIssuer =
        selectedIssuer === "All" ||
        (cert?.issuer || "").trim() === selectedIssuer;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (cert?.title || "").toLowerCase().includes(q) ||
        (cert?.issuer || "").toLowerCase().includes(q) ||
        (cert?.date || "").toLowerCase().includes(q);
      return matchesIssuer && matchesQuery;
    });
  }, [certData.items, selectedIssuer, searchQuery]);

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "84px 20px 96px",
        overflowX: "clip",
        background:
          "radial-gradient(circle at 18% 16%, rgba(253, 224, 71, 0.1), transparent 40%), radial-gradient(circle at 82% 24%, rgba(103, 232, 249, 0.14), transparent 44%), radial-gradient(circle at 76% 78%, rgba(192, 132, 252, 0.14), transparent 48%), linear-gradient(180deg, #050814 0%, #090d1c 100%)",
        color: "#f8fafc",
      }}
    >
      <style jsx global>{`
        @keyframes certCardRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes certHairlineSweep {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes certBadgePulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.18);
          }
        }
      `}</style>

      {/* 3D Background Starfield & Drifting Ring */}
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
          <CertificatesBackground3D />
        </Canvas>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        {/* Top Nav Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 16px",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              color: "#67e8f9",
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(9, 13, 28, 0.92))",
              border: "1px solid rgba(103, 232, 249, 0.3)",
              boxShadow: "0 0 18px rgba(103, 232, 249, 0.14)",
            }}
          >
            <span>←</span>
            <span>Back to Orbit</span>
          </Link>
        </div>

        {/* Hero Header + 3D Verified Crest */}
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "32px",
            padding: "24px 26px",
            borderRadius: "24px",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(155deg, rgba(15, 23, 42, 0.86), rgba(7, 11, 24, 0.96))",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 20px 50px rgba(2, 6, 23, 0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "28px",
              right: "28px",
              height: "1.5px",
              background:
                "linear-gradient(90deg, transparent, rgba(253, 224, 71, 0.8), rgba(103, 232, 249, 0.85), rgba(216, 180, 254, 0.75), transparent)",
              backgroundSize: "200% 100%",
              animation: "certHairlineSweep 5s linear infinite",
            }}
          />

          <div style={{ flex: "1 1 340px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "5px 13px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fde047",
                backgroundColor: "rgba(253, 224, 71, 0.1)",
                border: "1px solid rgba(253, 224, 71, 0.3)",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "9999px",
                  backgroundColor: "#fde047",
                  animation: "certBadgePulse 2s ease-in-out infinite",
                }}
              />
              <span>{certData.eyebrow}</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(28px, 4.5vw, 44px)",
                fontWeight: 700,
                margin: "0 0 10px 0",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              {certData.headingPrefix}{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #fde047 0%, #67e8f9 55%, #d8b4fe 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {certData.headingHighlight}
              </span>
            </h1>

            <p
              style={{
                fontSize: "14.5px",
                color: "#cbd5e1",
                maxWidth: "600px",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {certData.subtitle}
            </p>

            {!loading && certData.items.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                }}
              >
                <span>
                  <strong style={{ color: "#67e8f9" }}>
                    {certData.items.length}
                  </strong>{" "}
                  {certData.items.length === 1 ? "Credential" : "Credentials"}
                </span>
                {issuers.length > 2 && (
                  <>
                    <span style={{ color: "#475569" }}>•</span>
                    <span>
                      <strong style={{ color: "#fde047" }}>
                        {issuers.length - 1}
                      </strong>{" "}
                      Issuers
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3D Verified Crest Canvas */}
          <div
            style={{
              width: "196px",
              height: "182px",
              flexShrink: 0,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "100%", height: "160px" }}>
              <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 5.15], fov: 42 }}
                gl={{ alpha: true, antialias: true }}
              >
                <CertificateSeal3D activeHover={Boolean(hoveredCardId)} />
              </Canvas>
            </div>
            <span
              style={{
                marginTop: "-4px",
                fontSize: "9.5px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#fde047",
                opacity: 0.85,
              }}
            >
              ARCHIVE SEAL
            </span>
          </div>
        </header>

        {/* Search & Issuer Filter Bar (shows when certificates exist) */}
        {!loading && certData.items.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {issuers.map((issuer) => {
                const active = selectedIssuer === issuer;
                return (
                  <button
                    key={issuer}
                    type="button"
                    onClick={() => setSelectedIssuer(issuer)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: active ? "#050814" : "#cbd5e1",
                      background: active
                        ? "linear-gradient(90deg, #67e8f9 0%, #fde047 100%)"
                        : "rgba(15, 23, 42, 0.82)",
                      border: active
                        ? "1px solid transparent"
                        : "1px solid rgba(148, 163, 184, 0.24)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {issuer}
                  </button>
                );
              })}
            </div>

            {certData.items.length > 2 && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or issuer..."
                style={{
                  padding: "8px 14px",
                  borderRadius: "9999px",
                  fontSize: "12.5px",
                  color: "#f8fafc",
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.26)",
                  outline: "none",
                  minWidth: "220px",
                }}
              />
            )}
          </div>
        )}

        {/* Content State */}
        {loading ? (
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            Loading certificates...
          </div>
        ) : certData.items.length === 0 ? (
          <div
            style={{
              padding: "28px",
              borderRadius: "20px",
              background:
                "linear-gradient(150deg, rgba(15, 23, 42, 0.86), rgba(9, 13, 28, 0.95))",
              border: "1px solid rgba(103, 232, 249, 0.22)",
              color: "#cbd5e1",
              fontSize: "14px",
            }}
          >
            No certificates added yet. Open <strong>/edit</strong> →{" "}
            <strong>Certificates Section</strong> to upload a JPG/PNG or add an
            image link.
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "20px",
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              color: "#cbd5e1",
              fontSize: "14px",
            }}
          >
            No matching certificates found.{" "}
            <button
              type="button"
              onClick={() => {
                setSelectedIssuer("All");
                setSearchQuery("");
              }}
              style={{
                marginLeft: "8px",
                color: "#67e8f9",
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredItems.map((cert, idx) => {
              const isHovered = hoveredCardId === cert.id;
              return (
                <article
                  key={cert.id}
                  onMouseEnter={() => setHoveredCardId(cert.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    position: "relative",
                    borderRadius: "22px",
                    overflow: "hidden",
                    background:
                      "linear-gradient(155deg, rgba(15, 23, 42, 0.92), rgba(9, 13, 28, 0.98))",
                    border: isHovered
                      ? "1px solid rgba(103, 232, 249, 0.55)"
                      : "1px solid rgba(103, 232, 249, 0.22)",
                    boxShadow: isHovered
                      ? "0 22px 48px rgba(2, 6, 23, 0.88), 0 0 24px rgba(103, 232, 249, 0.16)"
                      : "0 18px 42px rgba(2, 6, 23, 0.78)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.25s ease",
                    animation: `certCardRise 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(idx * 0.06, 0.36)}s both`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Image Thumbnail */}
                  <div
                    onClick={() => cert.image && setSelectedCert(cert)}
                    style={{
                      position: "relative",
                      height: "205px",
                      backgroundColor: "rgba(2, 6, 23, 0.85)",
                      borderBottom: "1px solid rgba(103, 232, 249, 0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: cert.image ? "pointer" : "default",
                      overflow: "hidden",
                    }}
                  >
                    {cert.image ? (
                      <>
                        <img
                          src={cert.image}
                          alt={cert.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: isHovered ? "scale(1.04)" : "scale(1)",
                            transition: "transform 0.35s ease",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "10.5px",
                            fontWeight: 600,
                            color: "#f8fafc",
                            backgroundColor: "rgba(2, 6, 23, 0.78)",
                            border: "1px solid rgba(103, 232, 249, 0.35)",
                            opacity: isHovered ? 1 : 0.8,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          Click to zoom
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          padding: "10px 16px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          color: "#94a3b8",
                          backgroundColor: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                        }}
                      >
                        No Image Attached
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#67e8f9",
                          backgroundColor: "rgba(34, 211, 238, 0.1)",
                          border: "1px solid rgba(103, 232, 249, 0.25)",
                        }}
                      >
                        {cert.issuer || "Credential"}
                      </span>
                      {cert.date && (
                        <span
                          style={{
                            fontSize: "11.5px",
                            color: "#fde047",
                            fontWeight: 500,
                          }}
                        >
                          {cert.date}
                        </span>
                      )}
                    </div>

                    <h2
                      style={{
                        fontSize: "17.5px",
                        fontWeight: 600,
                        color: "#ffffff",
                        margin: "2px 0 0 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {cert.title}
                    </h2>

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "12px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      {cert.image && (
                        <button
                          type="button"
                          onClick={() => setSelectedCert(cert)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "9999px",
                            border: "1px solid rgba(103, 232, 249, 0.4)",
                            background:
                              "linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(15, 23, 42, 0.8))",
                            color: "#67e8f9",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Inspect Preview
                        </button>
                      )}

                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "8px 14px",
                            borderRadius: "9999px",
                            border: "1px solid rgba(192, 132, 252, 0.42)",
                            background:
                              "linear-gradient(135deg, rgba(192, 132, 252, 0.18), rgba(15, 23, 42, 0.8))",
                            color: "#e9d5ff",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          Verify Link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Certificate Modal */}
      {selectedCert && (
        <div
          onClick={() => setSelectedCert(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            backgroundColor: "rgba(2, 6, 23, 0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "920px",
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              background:
                "linear-gradient(155deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 28, 0.98))",
              border: "1px solid rgba(103, 232, 249, 0.35)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>
                  {selectedCert.title}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {selectedCert.issuer}{" "}
                  {selectedCert.date ? `• ${selectedCert.date}` : ""}
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {selectedCert.credentialUrl && (
                  <a
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "7px 14px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(192, 132, 252, 0.42)",
                      backgroundColor: "rgba(192, 132, 252, 0.14)",
                      color: "#e9d5ff",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Verify ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(103, 232, 249, 0.35)",
                    backgroundColor: "rgba(34, 211, 238, 0.12)",
                    color: "#67e8f9",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Close ✕
                </button>
              </div>
            </div>
            <div
              style={{
                padding: "18px",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#020617",
              }}
            >
              <img
                src={selectedCert.image}
                alt={selectedCert.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
