"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const WizardHead = dynamic(() => import("@/components/models/WizardHead"), {
  ssr: false,
});

function Beacon3DRig({ isTyping, sentFlash }) {
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const coreRef = useRef();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    const speedBoost = sentFlash ? 3.2 : isTyping ? 1.8 : 1;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += dt * 0.55 * speedBoost;
      outerRingRef.current.rotation.x =
        Math.PI / 2.4 + Math.sin(t * 0.8) * 0.14;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= dt * 0.9 * speedBoost;
      innerRingRef.current.rotation.y = Math.cos(t * 0.7) * 0.22;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += dt * 0.75 * speedBoost;
      coreRef.current.rotation.x += dt * 0.35 * speedBoost;
      const pulse = sentFlash
        ? 1.25 + Math.sin(t * 14) * 0.08
        : isTyping
          ? 1.08 + Math.sin(t * 5) * 0.04
          : 1 + Math.sin(t * 2.5) * 0.03;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[3, 4, 3]}
        intensity={sentFlash ? 2.4 : 1.5}
        color="#67e8f9"
      />
      <pointLight
        position={[-2.5, -1.5, 2]}
        intensity={sentFlash ? 2.2 : 1.2}
        color="#d8b4fe"
      />
      <Environment resolution={128}>
        <ambientLight intensity={0.4} />
      </Environment>

      {/* Outer 3D Cyan Signal Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.65, 0.018, 16, 100]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={sentFlash ? 1.8 : isTyping ? 1.1 : 0.65}
          toneMapped={false}
        />
      </mesh>

      {/* Inner 3D Violet/Gold Beacon Ring */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[1.28, 0.014, 16, 80]} />
        <meshStandardMaterial
          color="#d8b4fe"
          emissive="#d8b4fe"
          emissiveIntensity={sentFlash ? 1.6 : 0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Subtle Wireframe Beacon Cage around WizardHead */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial
          color={sentFlash ? "#fde047" : "#67e8f9"}
          wireframe
          transparent
          opacity={sentFlash ? 0.38 : isTyping ? 0.22 : 0.11}
        />
      </mesh>

      {/* Floating WizardHead Model */}
      <Float
        speed={sentFlash ? 3.5 : 1.8}
        rotationIntensity={isTyping ? 0.35 : 0.18}
        floatIntensity={0.35}
      >
        <WizardHead />
      </Float>
    </>
  );
}

const defaultContact = {
  eyebrow: "Signal Beacon",
  headingPrefix: "Get In",
  headingHighlight: "Touch",
  subtitle:
    "Open to software developer roles, full-stack builds, and creative web collaborations.",
  email: "akashbhunia@example.com",
  location: "West Bengal, India",
  availability: "Available for opportunities",
  socials: [
    {
      id: "soc-1",
      label: "GitHub",
      value: "github.com/akash-bhunia",
      url: "https://github.com/akash-bhunia",
    },
    {
      id: "soc-2",
      label: "LinkedIn",
      value: "linkedin.com/in/akash-bhunia-14834428b",
      url: "https://linkedin.com/in/akash-bhunia-14834428b",
    },
  ],
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState(defaultContact);
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);
  const [messageLen, setMessageLen] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active || !json?.data?.contact) return;
        const incoming = json.data.contact;
        setContactInfo({
          ...defaultContact,
          ...incoming,
          socials: Array.isArray(incoming.socials)
            ? incoming.socials
            : defaultContact.socials,
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleCopyEmail = async () => {
    if (!contactInfo.email || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(contactInfo.email);
      toast.success("Email copied to clipboard!");
    } catch {
      // Fallback to normal mailto if clipboard blocked
    }
  };

  const onSubmit = async (data) => {
    const toastId = toast.loading("Sending your message...");

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      toast.dismiss(toastId);
      toast.error("Web3Forms access key is not configured yet in .env.local");
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: data.name,
          email: data.email,
          message: data.message,
          subject: `New Portfolio Message from ${data.name}`,
          from_name: "Arcane Observatory",
        }),
      });

      const result = await response.json();

      toast.dismiss(toastId);
      if (result.success) {
        toast.success("Message sent successfully!");
        setSentFlash(true);
        setMessageLen(0);
        setTimeout(() => setSentFlash(false), 1800);
        reset();
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const getInputStyle = (fieldName) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    fontSize: "13.5px",
    lineHeight: 1.5,
    color: "#f8fafc",
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    border:
      focusedField === fieldName
        ? "1px solid #67e8f9"
        : "1px solid rgba(148, 163, 184, 0.22)",
    boxShadow:
      focusedField === fieldName
        ? "0 0 0 3px rgba(103, 232, 249, 0.14)"
        : "none",
    outline: "none",
    transition: "all 0.2s ease",
  });

  const isTyping = focusedField !== null;

  const beaconStatusText = sentFlash
    ? "SIGNAL TRANSMITTED"
    : isSubmitting
      ? "ENCODING TRANSMISSION..."
      : isTyping
        ? "FREQUENCY LOCKED"
        : "BEACON CORE ACTIVE";

  const messageFieldProps = register("message", {
    required: "Message is required",
    minLength: {
      value: 10,
      message: "Message must be at least 10 characters",
    },
    onChange: (e) => setMessageLen(e.target.value.length),
  });

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "84px 20px 56px",
        overflowX: "clip",
        overflowY: "visible",
        background:
          "radial-gradient(ellipse at 50% 18%, rgba(103, 232, 249, 0.15), transparent 45%), radial-gradient(circle at 85% 78%, rgba(216, 180, 254, 0.14), transparent 48%), linear-gradient(180deg, #040711 0%, #090e1e 100%)",
        color: "#f8fafc",
      }}
    >
      <style jsx global>{`
        @keyframes beaconDotBlink {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes conduitPulse {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.95;
          }
        }

        @keyframes hairlineSweep {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes sheenSlide {
          0% {
            transform: translateX(-140%) skewX(-20deg);
          }
          45%,
          100% {
            transform: translateX(240%) skewX(-20deg);
          }
        }

        @keyframes cometSweep {
          0% {
            transform: translate3d(-140px, -70px, 0) rotate(-26deg);
            opacity: 0;
          }
          12% {
            opacity: 0.85;
          }
          30% {
            transform: translate3d(460px, 230px, 0) rotate(-26deg);
            opacity: 0;
          }
          100% {
            transform: translate3d(460px, 230px, 0) rotate(-26deg);
            opacity: 0;
          }
        }

        @keyframes podRise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Beacon Sky & Comet */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 16% 24%, rgba(255,255,255,0.6), transparent), radial-gradient(1.3px 1.3px at 82% 20%, rgba(103,232,249,0.65), transparent), radial-gradient(1.5px 1.5px at 78% 76%, rgba(216,180,254,0.6), transparent), radial-gradient(1.2px 1.2px at 24% 82%, rgba(253,224,71,0.5), transparent), radial-gradient(1.4px 1.4px at 50% 10%, rgba(255,255,255,0.45), transparent)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "18%",
            width: "120px",
            height: "1.5px",
            borderRadius: "9999px",
            background:
              "linear-gradient(90deg, rgba(103,232,249,0.9), rgba(216,180,254,0.4), transparent)",
            boxShadow: "0 0 10px rgba(103,232,249,0.55)",
            animation: "cometSweep 8s ease-out infinite",
          }}
        />
      </div>

      {/* Centered Vertical Beacon Stack */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "580px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "podRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Top 3D Beacon Node */}
        <div
          style={{
            position: "relative",
            width: "240px",
            marginBottom: "6px",
            zIndex: 25,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "142px",
              pointerEvents: "none",
            }}
          >
            <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 0.15, 4.9], fov: 40 }}
              gl={{ alpha: true, antialias: true }}
            >
              <Beacon3DRig isTyping={isTyping} sentFlash={sentFlash} />
            </Canvas>
          </div>

          {/* Beacon Telemetry Pill + Signal Bars */}
          <div
            style={{
              position: "relative",
              zIndex: 15,
              marginTop: "2px",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "3px 11px",
              borderRadius: "9999px",
              fontSize: "9.5px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: sentFlash ? "#050814" : "#67e8f9",
              backgroundColor: sentFlash ? "#67e8f9" : "rgba(5, 8, 20, 0.92)",
              border: "1px solid rgba(103, 232, 249, 0.4)",
              boxShadow: "0 4px 14px rgba(2, 6, 23, 0.7)",
              transition: "all 0.25s ease",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: sentFlash ? "#050814" : "#67e8f9",
                animation: "beaconDotBlink 1.8s ease-in-out infinite",
              }}
            />
            <span>{beaconStatusText}</span>
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "flex-end",
                gap: "1.5px",
                height: "9px",
              }}
            >
              {[4, 7, 9].map((h, i) => {
                const activeBar =
                  sentFlash || isSubmitting || (isTyping && i < 2) || i === 0;
                return (
                  <span
                    key={h}
                    style={{
                      width: "2px",
                      height: `${h}px`,
                      borderRadius: "2px",
                      backgroundColor: sentFlash
                        ? "#050814"
                        : activeBar
                          ? "#67e8f9"
                          : "rgba(103, 232, 249, 0.25)",
                    }}
                  />
                );
              })}
            </span>
          </div>

          {/* Vertical Signal Conduit connecting Beacon to Card */}
          <div
            aria-hidden="true"
            style={{
              width: "2px",
              height: "14px",
              marginTop: "4px",
              background:
                "linear-gradient(180deg, rgba(103, 232, 249, 0.8), rgba(216, 180, 254, 0.15))",
              animation: "conduitPulse 2.2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Main Contact Glass Card */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            width: "100%",
            borderRadius: "24px",
            padding: "24px 26px 26px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            background:
              "linear-gradient(160deg, rgba(15, 23, 42, 0.92), rgba(7, 11, 24, 0.98))",
            border: sentFlash
              ? "1px solid rgba(103, 232, 249, 0.6)"
              : "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: sentFlash
              ? "0 0 38px rgba(103, 232, 249, 0.24), 0 24px 60px rgba(2, 6, 23, 0.88)"
              : "0 24px 60px rgba(2, 6, 23, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            transition: "box-shadow 0.35s ease, border-color 0.35s ease",
          }}
        >
          {/* Shimmering Top Accent Hairline */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "28px",
              right: "28px",
              height: "1.5px",
              background:
                "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.85), rgba(253, 224, 71, 0.55), rgba(216, 180, 254, 0.75), transparent)",
              backgroundSize: "200% 100%",
              animation: "hairlineSweep 4.5s linear infinite",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 11px",
                  borderRadius: "9999px",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#67e8f9",
                  backgroundColor: "rgba(34, 211, 238, 0.1)",
                  border: "1px solid rgba(103, 232, 249, 0.28)",
                  marginBottom: "10px",
                }}
              >
                <span>✦</span>
                <span>{contactInfo.eyebrow}</span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(26px, 4vw, 34px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  color: "#ffffff",
                }}
              >
                {contactInfo.headingPrefix}{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {contactInfo.headingHighlight}
                </span>
              </h1>

              {contactInfo.subtitle ? (
                <p
                  style={{
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "#cbd5e1",
                    margin: "8px 0 0 0",
                  }}
                >
                  {contactInfo.subtitle}
                </p>
              ) : null}
            </div>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                color: "#f8fafc",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                flexShrink: 0,
              }}
            >
              <span>←</span>
              <span>Home</span>
            </Link>
          </div>

          {/* Contact Info & Socials Box */}
          {(contactInfo.email ||
            contactInfo.location ||
            contactInfo.availability ||
            contactInfo.socials?.length > 0) && (
            <div
              style={{
                borderRadius: "16px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "12.5px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                {contactInfo.availability ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "#67e8f9",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "9999px",
                        backgroundColor: "#67e8f9",
                        boxShadow: "0 0 8px #67e8f9",
                        animation: "beaconDotBlink 2.2s ease-in-out infinite",
                      }}
                    />
                    <span>{contactInfo.availability}</span>
                  </span>
                ) : null}

                {contactInfo.location ? (
                  <span style={{ color: "#cbd5e1" }}>
                    {contactInfo.location}
                  </span>
                ) : null}
              </div>

              {contactInfo.email ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "8px",
                    color: "#e2e8f0",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Email: </span>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    onClick={handleCopyEmail}
                    title="Click to copy email"
                    style={{
                      color: "#67e8f9",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {contactInfo.email}
                  </a>
                  <span
                    style={{
                      fontSize: "10.5px",
                      color: "#94a3b8",
                    }}
                  >
                    (click to copy)
                  </span>
                </div>
              ) : null}

              {Array.isArray(contactInfo.socials) &&
              contactInfo.socials.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    paddingTop: "2px",
                  }}
                >
                  {contactInfo.socials.map((soc, idx) => (
                    <a
                      key={soc.id || `${soc.label}-${idx}`}
                      href={soc.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "5px 11px",
                        borderRadius: "9999px",
                        fontSize: "11.5px",
                        fontWeight: 500,
                        textDecoration: "none",
                        color: "#e2e8f0",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      {soc.label}: {soc.value} ↗
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div>
              <input
                type="text"
                placeholder="Your Name"
                {...register("name", { required: "Name is required" })}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("name")}
              />
              {errors.name && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#f87171",
                    margin: "5px 0 0 2px",
                  }}
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Your Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("email")}
              />
              {errors.email && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#f87171",
                    margin: "5px 0 0 2px",
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                rows={4}
                placeholder="Your Message"
                {...messageFieldProps}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...getInputStyle("message"),
                  resize: "vertical",
                  minHeight: "106px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  marginTop: "5px",
                  padding: "0 2px",
                }}
              >
                {errors.message ? (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#f87171",
                      margin: 0,
                    }}
                  >
                    {errors.message.message}
                  </p>
                ) : (
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Min. 10 characters
                  </span>
                )}
                <span
                  style={{
                    fontSize: "11px",
                    color: messageLen >= 10 ? "#67e8f9" : "#94a3b8",
                    marginLeft: "auto",
                  }}
                >
                  {messageLen} chars
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                padding: "12px 18px",
                borderRadius: "12px",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "13.5px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: "#050814",
                background: "linear-gradient(90deg, #67e8f9 0%, #d8b4fe 100%)",
                boxShadow: hoveredBtn
                  ? "0 12px 28px rgba(103, 232, 249, 0.28)"
                  : "0 8px 20px rgba(2, 6, 23, 0.5)",
                opacity: isSubmitting ? 0.6 : 1,
                transform:
                  hoveredBtn && !isSubmitting
                    ? "translateY(-1px)"
                    : "translateY(0)",
                transition: "all 0.2s ease",
              }}
            >
              {!isSubmitting && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "45%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent)",
                    animation: "sheenSlide 3.8s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>
                {isSubmitting ? "Sending..." : "Cast Your Message"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
