"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { projectsData } from "@/data/data";

const WizardStaff = dynamic(() => import("@/components/models/WizardStaff"), {
  ssr: false,
});

function ProjectsBackground3D() {
  const pointsRef = useRef();
  const ringRef = useRef();

  const { positions, colors } = useMemo(() => {
    const count = 260;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      [0.4, 0.91, 0.98],
      [0.85, 0.71, 0.99],
      [0.99, 0.88, 0.28],
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 24634.6345;
      const seed3 = Math.sin(i * 39.425) * 19283.4712;

      const r1 = seed1 - Math.floor(seed1);
      const r2 = seed2 - Math.floor(seed2);
      const r3 = seed3 - Math.floor(seed3);

      pos[i3] = (r1 - 0.5) * 16;
      pos[i3 + 1] = (r2 - 0.5) * 11;
      pos[i3 + 2] = (r3 - 0.5) * 9 - 2;

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
      pointsRef.current.rotation.y += dt * 0.03;
      pointsRef.current.rotation.x = Math.sin(t * 0.2) * 0.06;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z -= dt * 0.06;
      ringRef.current.rotation.x = 1.15 + Math.sin(t * 0.35) * 0.08;
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
          opacity={0.65}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <mesh
        ref={ringRef}
        position={[2.2, -0.4, -3.5]}
        rotation={[1.15, 0.2, 0]}
      >
        <torusGeometry args={[3.4, 0.012, 12, 100]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.14} />
      </mesh>
    </>
  );
}

const defaultProjectsMeta = {
  eyebrow: "Arcane Archive",
  headingPrefix: "Selected",
  headingHighlight: "Projects",
  subtitle:
    "Full-stack web apps, interactive 3D builds, and practical software experiments.",
};

const fallbackProjects = projectsData.map((proj, idx) => ({
  id: `proj-${proj.id || idx + 1}`,
  tag: proj.tech?.[0] || "PROJECT",
  title: proj.name,
  desc: proj.description,
  tech: proj.tech || [],
  image: "",
  liveUrl: proj.demoLink || "",
  repoUrl: proj.demoLink || "",
}));

export default function ProjectsPage() {
  const [meta, setMeta] = useState(defaultProjectsMeta);
  const [items, setItems] = useState(fallbackProjects);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedTech, setSelectedTech] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active || !json?.data?.projects) return;
        const incoming = json.data.projects;
        setMeta({
          eyebrow: incoming.eyebrow || defaultProjectsMeta.eyebrow,
          headingPrefix:
            incoming.headingPrefix ?? defaultProjectsMeta.headingPrefix,
          headingHighlight:
            incoming.headingHighlight || defaultProjectsMeta.headingHighlight,
          subtitle: incoming.subtitle || "",
        });
        if (Array.isArray(incoming.items) && incoming.items.length > 0) {
          setItems(incoming.items);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProject]);

  const techFilters = useMemo(() => {
    const counts = new Map();
    items.forEach((proj) => {
      const list = Array.isArray(proj?.tech) ? proj.tech : [];
      list.forEach((t) => {
        const clean = String(t || "").trim();
        if (clean) counts.set(clean, (counts.get(clean) || 0) + 1);
      });
    });
    const topTech = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
    return ["All", ...topTech];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((project) => {
      const techList = Array.isArray(project?.tech) ? project.tech : [];
      const matchesTech =
        selectedTech === "All" ||
        techList.some(
          (t) => String(t).toLowerCase() === selectedTech.toLowerCase(),
        );
      const q = searchQuery.trim().toLowerCase();
      const title = (project?.title || project?.name || "").toLowerCase();
      const desc = (project?.desc || project?.description || "").toLowerCase();
      const matchesQuery =
        !q ||
        title.includes(q) ||
        desc.includes(q) ||
        techList.some((t) => String(t).toLowerCase().includes(q));
      return matchesTech && matchesQuery;
    });
  }, [items, selectedTech, searchQuery]);

  const handleTechChipClick = (techName) => {
    if (!techName) return;
    setSelectedTech((prev) =>
      prev.toLowerCase() === String(techName).toLowerCase() ? "All" : techName,
    );
  };

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "104px 24px 96px",
        overflowX: "clip",
        background:
          "radial-gradient(circle at 15% 18%, rgba(103, 232, 249, 0.13), transparent 44%), radial-gradient(circle at 86% 74%, rgba(192, 132, 252, 0.14), transparent 48%), radial-gradient(circle at 52% 8%, rgba(253, 224, 71, 0.06), transparent 36%), linear-gradient(180deg, #050814 0%, #090d1c 100%)",
        color: "#f8fafc",
      }}
    >
      <style jsx global>{`
        @keyframes projHairlineSweep {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes projOrbPulse {
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

      {/* 3D Background Starfield & Ring */}
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
          <ProjectsBackground3D />
        </Canvas>
      </div>

      {/* Main Content Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1220px",
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "40px",
        }}
      >
        {/* Left: Balanced 3D WizardStaff */}
        <div
          style={{
            position: "relative",
            flex: "0 1 340px",
            maxWidth: "360px",
            width: "100%",
            height: "540px",
            margin: "0 auto",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.4, 6.2], fov: 42 }}
            gl={{ alpha: true, antialias: true }}
            style={{ width: "100%", height: "100%" }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[3, 5, 4]}
              intensity={1.7}
              color="#67e8f9"
            />
            <pointLight
              position={[-3, -2, 3]}
              intensity={1.4}
              color="#d8b4fe"
            />
            <Environment resolution={128}>
              <ambientLight intensity={0.45} />
            </Environment>
            <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.3}>
              <group scale={0.88} position={[0, -0.35, 0]}>
                <WizardStaff />
              </group>
            </Float>
          </Canvas>
        </div>

        {/* Right: Modern Header, Filter & Project Cards */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            flex: "1 1 600px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              padding: "24px 26px",
              borderRadius: "24px",
              background:
                "linear-gradient(150deg, rgba(15, 23, 42, 0.88), rgba(9, 13, 28, 0.96))",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              boxShadow: "0 20px 50px rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: "24px",
                right: "24px",
                height: "1.5px",
                background:
                  "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.8), rgba(253, 224, 71, 0.5), rgba(216, 180, 254, 0.7), transparent)",
                backgroundSize: "200% 100%",
                animation: "projHairlineSweep 5s linear infinite",
              }}
            />

            <div style={{ maxWidth: "560px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#67e8f9",
                  backgroundColor: "rgba(34, 211, 238, 0.09)",
                  border: "1px solid rgba(103, 232, 249, 0.25)",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor: "#67e8f9",
                    animation: "projOrbPulse 2s ease-in-out infinite",
                  }}
                />
                <span>{meta.eyebrow}</span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 700,
                  lineHeight: 1.14,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  color: "#ffffff",
                }}
              >
                {meta.headingPrefix ? `${meta.headingPrefix} ` : ""}
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {meta.headingHighlight}
                </span>
              </h1>

              {meta.subtitle ? (
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "#cbd5e1",
                    margin: "10px 0 0 0",
                  }}
                >
                  {meta.subtitle}
                </p>
              ) : null}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#d8b4fe",
                  backgroundColor: "rgba(192, 132, 252, 0.11)",
                  border: "1px solid rgba(192, 132, 252, 0.28)",
                }}
              >
                {filteredItems.length === items.length
                  ? `${items.length} Builds`
                  : `${filteredItems.length} / ${items.length} Builds`}
              </span>

              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "9999px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "#f8fafc",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                }}
              >
                <span>←</span>
                <span>Home</span>
              </Link>
            </div>
          </div>

          {/* Filter & Search Row */}
          {items.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {techFilters.map((tech) => {
                  const active =
                    selectedTech.toLowerCase() === tech.toLowerCase();
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => setSelectedTech(tech)}
                      style={{
                        padding: "6px 13px",
                        borderRadius: "9999px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: active ? "#050814" : "#cbd5e1",
                        background: active
                          ? "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)"
                          : "rgba(15, 23, 42, 0.82)",
                        border: active
                          ? "1px solid transparent"
                          : "1px solid rgba(148, 163, 184, 0.22)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>

              {items.length > 2 && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project or stack..."
                  style={{
                    padding: "7px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    color: "#f8fafc",
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    border: "1px solid rgba(148, 163, 184, 0.24)",
                    outline: "none",
                    minWidth: "205px",
                  }}
                />
              )}
            </div>
          )}

          {/* Modern Project Cards Grid */}
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: "24px",
                borderRadius: "20px",
                background: "rgba(15, 23, 42, 0.86)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#cbd5e1",
                fontSize: "13.5px",
              }}
            >
              No projects match this filter.{" "}
              <button
                type="button"
                onClick={() => {
                  setSelectedTech("All");
                  setSearchQuery("");
                }}
                style={{
                  marginLeft: "6px",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredItems.map((project, idx) => {
                const title =
                  project.title || project.name || "Untitled Project";
                const desc = project.desc || project.description || "";
                const techList = Array.isArray(project.tech)
                  ? project.tech
                  : [];
                const linkUrl =
                  project.liveUrl || project.repoUrl || project.demoLink || "";
                const isHovered = hoveredCard === (project.id || idx);
                const isFeatured =
                  idx === 0 && selectedTech === "All" && !searchQuery;
                const accent = isFeatured
                  ? "#fde047"
                  : idx % 2 === 0
                    ? "#67e8f9"
                    : "#d8b4fe";

                return (
                  <motion.article
                    key={project.id || idx}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                    onMouseEnter={() => setHoveredCard(project.id || idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      position: "relative",
                      borderRadius: "24px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      padding: "22px",
                      gap: "14px",
                      background:
                        "linear-gradient(160deg, rgba(15, 23, 42, 0.9), rgba(9, 13, 28, 0.97))",
                      border: isHovered
                        ? `1px solid ${accent}99`
                        : isFeatured
                          ? "1px solid rgba(253, 224, 71, 0.34)"
                          : "1px solid rgba(148, 163, 184, 0.18)",
                      boxShadow: isHovered
                        ? `0 22px 48px rgba(2, 6, 23, 0.85), 0 0 28px ${accent}24`
                        : "0 16px 38px rgba(2, 6, 23, 0.72)",
                      transform: isHovered
                        ? "translateY(-4px)"
                        : "translateY(0)",
                      transition: "all 0.25s ease",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "20px",
                        right: "20px",
                        height: "1px",
                        background: `linear-gradient(90deg, transparent, ${accent}88, transparent)`,
                        opacity: isHovered || isFeatured ? 1 : 0.45,
                        transition: "opacity 0.25s ease",
                      }}
                    />

                    {project.image ? (
                      <div
                        onClick={() => setActiveProject(project)}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "156px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "1px solid rgba(148, 163, 184, 0.16)",
                          backgroundColor: "rgba(2, 6, 23, 0.85)",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={project.image}
                          alt={title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transform: isHovered ? "scale(1.04)" : "scale(1)",
                            transition: "transform 0.35s ease",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            padding: "3px 9px",
                            borderRadius: "9999px",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "#f8fafc",
                            backgroundColor: "rgba(2, 6, 23, 0.78)",
                            border: "1px solid rgba(148, 163, 184, 0.28)",
                          }}
                        >
                          Case Study
                        </div>
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 11px",
                            borderRadius: "9999px",
                            fontSize: "10.5px",
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: accent,
                            backgroundColor: `${accent}16`,
                            border: `1px solid ${accent}3b`,
                          }}
                        >
                          {project.tag || techList[0] || "PROJECT"}
                        </span>

                        {isFeatured ? (
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "9999px",
                              fontSize: "9.5px",
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "#fde047",
                              backgroundColor: "rgba(253, 224, 71, 0.08)",
                              border: "1px solid rgba(253, 224, 71, 0.28)",
                            }}
                          >
                            Spotlight
                          </span>
                        ) : null}
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          color: "#94a3b8",
                        }}
                      >
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "7px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "18.5px",
                          fontWeight: 600,
                          lineHeight: 1.32,
                          letterSpacing: "-0.01em",
                          margin: 0,
                          color: "#ffffff",
                        }}
                      >
                        {title}
                      </h2>

                      <p
                        style={{
                          fontSize: "13px",
                          lineHeight: 1.62,
                          margin: 0,
                          color: "#cbd5e1",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {desc}
                      </p>
                    </div>

                    {techList.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "7px",
                        }}
                      >
                        {techList.map((item, techIdx) => {
                          const isSelectedChip =
                            selectedTech.toLowerCase() ===
                            String(item).toLowerCase();
                          return (
                            <button
                              key={`${item}-${techIdx}`}
                              type="button"
                              onClick={() => handleTechChipClick(item)}
                              title={`Filter by ${item}`}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "11px",
                                fontWeight: 500,
                                cursor: "pointer",
                                color: isSelectedChip ? "#050814" : "#e2e8f0",
                                backgroundColor: isSelectedChip
                                  ? "#67e8f9"
                                  : "rgba(255, 255, 255, 0.045)",
                                border: isSelectedChip
                                  ? "1px solid #67e8f9"
                                  : "1px solid rgba(148, 163, 184, 0.18)",
                                transition: "all 0.18s ease",
                              }}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(148, 163, 184, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveProject(project)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#f8fafc",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(148, 163, 184, 0.22)",
                        }}
                      >
                        Details
                      </button>

                      {linkUrl ? (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            textDecoration: "none",
                            color: accent,
                          }}
                        >
                          <span>Open Project</span>
                          <span
                            style={{
                              transform: isHovered
                                ? "translateX(3px)"
                                : "translateX(0)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            →
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Project Case Study Modal */}
      {activeProject && (
        <div
          onClick={() => setActiveProject(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            backgroundColor: "rgba(2, 6, 23, 0.88)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "640px",
              width: "100%",
              borderRadius: "22px",
              overflow: "hidden",
              background:
                "linear-gradient(155deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 28, 0.99))",
              border: "1px solid rgba(103, 232, 249, 0.34)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.85)",
            }}
          >
            {activeProject.image ? (
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  overflow: "hidden",
                  backgroundColor: "#020617",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
                }}
              >
                <img
                  src={activeProject.image}
                  alt={activeProject.title || activeProject.name || "Project"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ) : null}

            <div
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#67e8f9",
                      backgroundColor: "rgba(34, 211, 238, 0.12)",
                      border: "1px solid rgba(103, 232, 249, 0.28)",
                      marginBottom: "8px",
                    }}
                  >
                    {activeProject.tag || activeProject.tech?.[0] || "PROJECT"}
                  </span>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "21px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {activeProject.title ||
                      activeProject.name ||
                      "Untitled Project"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(148, 163, 184, 0.28)",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    color: "#e2e8f0",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close ✕
                </button>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  lineHeight: 1.68,
                  color: "#cbd5e1",
                }}
              >
                {activeProject.desc || activeProject.description || ""}
              </p>

              {Array.isArray(activeProject.tech) &&
              activeProject.tech.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                  {activeProject.tech.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#e2e8f0",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              <div
                style={{
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(148, 163, 184, 0.14)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {activeProject.liveUrl ? (
                  <a
                    href={activeProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      textDecoration: "none",
                      color: "#050814",
                      background:
                        "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)",
                    }}
                  >
                    Live Demo ↗
                  </a>
                ) : null}

                {activeProject.repoUrl &&
                activeProject.repoUrl !== activeProject.liveUrl ? (
                  <a
                    href={activeProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      textDecoration: "none",
                      color: "#e9d5ff",
                      backgroundColor: "rgba(192, 132, 252, 0.14)",
                      border: "1px solid rgba(192, 132, 252, 0.36)",
                    }}
                  >
                    Source Code ↗
                  </a>
                ) : null}

                {!activeProject.liveUrl &&
                !activeProject.repoUrl &&
                activeProject.demoLink ? (
                  <a
                    href={activeProject.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      textDecoration: "none",
                      color: "#050814",
                      background:
                        "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)",
                    }}
                  >
                    Open Project ↗
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
