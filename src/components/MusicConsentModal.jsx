"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const ASTRAL_NOTES = [
  293.66, 440.0, 659.25, 493.88, 440.0, 587.33, 739.99, 659.25, 329.63, 493.88,
  659.25, 587.33,
];

const BASS_NOTES = [
  110.0, 110.0, 110.0, 110.0, 146.83, 146.83, 146.83, 146.83, 123.47, 123.47,
  164.81, 146.83,
];

export default function MusicConsentModal() {
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const bassOscRef = useRef(null);
  const bassOctaveOscRef = useRef(null);
  const melodyTimerRef = useRef(null);
  const stepIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  const playObservatoryStep = useCallback(
    (ctx, destination, freq, bassFreq, stepIdx) => {
      const now = ctx.currentTime;
      const isPulseAccent = stepIdx % 4 === 0;

      if (bassOscRef.current) {
        bassOscRef.current.frequency.setTargetAtTime(bassFreq, now, 0.08);
      }
      if (bassOctaveOscRef.current) {
        bassOctaveOscRef.current.frequency.setTargetAtTime(
          bassFreq * 2,
          now,
          0.08,
        );
      }

      const mainOsc = ctx.createOscillator();
      const fifthOsc = ctx.createOscillator();
      const shimmerOsc = ctx.createOscillator();

      const mainGain = ctx.createGain();
      const fifthGain = ctx.createGain();
      const shimmerGain = ctx.createGain();
      const envGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      mainOsc.type = "triangle";
      mainOsc.frequency.setValueAtTime(freq, now);

      fifthOsc.type = "sine";
      fifthOsc.frequency.setValueAtTime(freq * 1.5, now);

      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(freq * 2, now);

      mainGain.gain.setValueAtTime(isPulseAccent ? 0.38 : 0.31, now);
      fifthGain.gain.setValueAtTime(isPulseAccent ? 0.16 : 0.12, now);
      shimmerGain.gain.setValueAtTime(isPulseAccent ? 0.14 : 0.09, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(isPulseAccent ? 2700 : 2150, now);
      filter.frequency.exponentialRampToValueAtTime(1050, now + 0.95);
      filter.Q.setValueAtTime(1.2, now);

      const peakGain = isPulseAccent ? 0.5 : 0.41;
      envGain.gain.setValueAtTime(0.001, now);
      envGain.gain.linearRampToValueAtTime(peakGain, now + 0.025);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);

      mainOsc.connect(mainGain);
      fifthOsc.connect(fifthGain);
      shimmerOsc.connect(shimmerGain);

      mainGain.connect(filter);
      fifthGain.connect(filter);
      shimmerGain.connect(filter);

      filter.connect(envGain);
      envGain.connect(destination);

      mainOsc.start(now);
      fifthOsc.start(now);
      shimmerOsc.start(now);

      mainOsc.stop(now + 1.02);
      fifthOsc.stop(now + 1.02);
      shimmerOsc.stop(now + 1.02);
    },
    [],
  );

  const ensureAudioGraph = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const ctx = new AudioContextClass();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(18, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.005, ctx.currentTime);
      compressor.release.setValueAtTime(0.15, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      const bassOsc = ctx.createOscillator();
      const bassOctaveOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const octaveSubGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();

      bassOsc.type = "triangle";
      bassOsc.frequency.setValueAtTime(110.0, ctx.currentTime);

      bassOctaveOsc.type = "sine";
      bassOctaveOsc.frequency.setValueAtTime(220.0, ctx.currentTime);

      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(520, ctx.currentTime);

      bassGain.gain.setValueAtTime(0.24, ctx.currentTime);
      octaveSubGain.gain.setValueAtTime(0.12, ctx.currentTime);

      bassOsc.connect(bassFilter);
      bassOctaveOsc.connect(octaveSubGain);
      octaveSubGain.connect(bassFilter);

      bassFilter.connect(bassGain);
      bassGain.connect(masterGain);

      bassOsc.start();
      bassOctaveOsc.start();

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      bassOscRef.current = bassOsc;
      bassOctaveOscRef.current = bassOctaveOsc;
    }

    return audioCtxRef.current;
  }, []);

  const startTune = useCallback(async () => {
    const ctx = ensureAudioGraph();
    if (!ctx || !masterGainRef.current) return false;

    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setTargetAtTime(1.1, now, 0.04);

    isPlayingRef.current = true;
    setIsPlaying(true);

    if (melodyTimerRef.current) {
      clearInterval(melodyTimerRef.current);
      melodyTimerRef.current = null;
    }

    const triggerStep = () => {
      if (
        !isPlayingRef.current ||
        !audioCtxRef.current ||
        !masterGainRef.current
      ) {
        return;
      }
      const idx = stepIndexRef.current % ASTRAL_NOTES.length;
      playObservatoryStep(
        audioCtxRef.current,
        masterGainRef.current,
        ASTRAL_NOTES[idx],
        BASS_NOTES[idx],
        idx,
      );
      stepIndexRef.current += 1;
    };

    triggerStep();
    melodyTimerRef.current = setInterval(triggerStep, 760);
    return true;
  }, [ensureAudioGraph, playObservatoryStep]);

  const stopTune = useCallback(async () => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (melodyTimerRef.current) {
      clearInterval(melodyTimerRef.current);
      melodyTimerRef.current = null;
    }

    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (ctx && masterGain) {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(0.0001, now, 0.04);
    }
  }, []);

  const handleChoice = useCallback(
    async (allowMusic) => {
      localStorage.setItem("musicConsent", String(allowMusic));
      localStorage.setItem("consentTime", new Date().toISOString());
      setShowModal(false);

      if (allowMusic) {
        await startTune();
      } else {
        await stopTune();
      }
    },
    [startTune, stopTune],
  );

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        handleChoice(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showModal, handleChoice]);

  useEffect(() => {
    const consent = localStorage.getItem("musicConsent");
    const consentTime = localStorage.getItem("consentTime");

    if (!consent || !consentTime) {
      setShowModal(true);
      return;
    }

    const parsedTime = new Date(consentTime).getTime();
    const isValid =
      !Number.isNaN(parsedTime) && parsedTime + THREE_DAYS_MS > Date.now();

    if (!isValid) {
      setShowModal(true);
      return;
    }

    if (consent === "true") {
      const retryOnGesture = () => {
        if (!isPlayingRef.current) {
          startTune().catch(() => {});
        }
        window.removeEventListener("pointerdown", retryOnGesture);
        window.removeEventListener("keydown", retryOnGesture);
      };
      window.addEventListener("pointerdown", retryOnGesture, { once: true });
      window.addEventListener("keydown", retryOnGesture, { once: true });

      return () => {
        window.removeEventListener("pointerdown", retryOnGesture);
        window.removeEventListener("keydown", retryOnGesture);
      };
    }
  }, [startTune]);

  useEffect(() => {
    return () => {
      if (melodyTimerRef.current) {
        clearInterval(melodyTimerRef.current);
      }
      if (bassOscRef.current) {
        try {
          bassOscRef.current.stop();
        } catch {}
      }
      if (bassOctaveOscRef.current) {
        try {
          bassOctaveOscRef.current.stop();
        } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const togglePlay = async () => {
    if (isPlayingRef.current || isPlaying) {
      await stopTune();
    } else {
      await startTune();
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes arcaneEqPulse {
          0%,
          100% {
            transform: scaleY(0.35);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @keyframes modalFadeRise {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .arcane-music-toggle-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          left: auto;
          top: auto;
        }

        @media (max-width: 767px) {
          .arcane-music-toggle-btn {
            top: 16px;
            left: 16px;
            bottom: auto;
            right: auto;
          }
        }
      `}</style>

      {!showModal && (
        <button
          type="button"
          className="arcane-music-toggle-btn"
          onClick={togglePlay}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-pressed={isPlaying}
          style={{
            zIndex: 40,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            borderRadius: "9999px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: isPlaying ? "#cffafe" : "#f1f5f9",
            background: isPlaying
              ? "linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 27, 75, 0.88))"
              : "linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(9, 13, 28, 0.92))",
            border: isPlaying
              ? "1px solid rgba(103, 232, 249, 0.55)"
              : isHovered
                ? "1px solid rgba(192, 132, 252, 0.55)"
                : "1px solid rgba(148, 163, 184, 0.28)",
            boxShadow: isPlaying
              ? "0 0 24px rgba(34, 211, 238, 0.26), inset 0 0 12px rgba(103, 232, 249, 0.12)"
              : isHovered
                ? "0 10px 26px rgba(15, 23, 42, 0.7), 0 0 18px rgba(168, 85, 247, 0.22)"
                : "0 8px 22px rgba(2, 6, 23, 0.65)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transform: isHovered ? "translateY(-2px)" : "translateY(0px)",
            transition: "all 0.25s ease",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "3px",
              height: "14px",
              width: "16px",
            }}
          >
            {isPlaying ? (
              <>
                <span
                  style={{
                    width: "3px",
                    height: "100%",
                    borderRadius: "9999px",
                    backgroundColor: "#67e8f9",
                    transformOrigin: "bottom",
                    animation: "arcaneEqPulse 0.75s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    width: "3px",
                    height: "100%",
                    borderRadius: "9999px",
                    backgroundColor: "#fde047",
                    transformOrigin: "bottom",
                    animation: "arcaneEqPulse 0.75s ease-in-out 0.18s infinite",
                  }}
                />
                <span
                  style={{
                    width: "3px",
                    height: "100%",
                    borderRadius: "9999px",
                    backgroundColor: "#d8b4fe",
                    transformOrigin: "bottom",
                    animation: "arcaneEqPulse 0.75s ease-in-out 0.36s infinite",
                  }}
                />
              </>
            ) : (
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  backgroundColor: isHovered ? "#67e8f9" : "#94a3b8",
                  alignSelf: "center",
                  transition: "background-color 0.2s ease",
                }}
              />
            )}
          </span>

          <span>{isPlaying ? "Pause Music" : "Play Music"}</span>
        </button>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              maxWidth: "380px",
              width: "100%",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
              background:
                "linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 28, 0.98))",
              border: "1px solid rgba(103, 232, 249, 0.28)",
              boxShadow: "0 20px 50px rgba(2, 6, 23, 0.8)",
              animation: "modalFadeRise 0.25s ease-out both",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: "20px",
                right: "20px",
                height: "1.5px",
                background:
                  "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.8), rgba(216, 180, 254, 0.75), transparent)",
                pointerEvents: "none",
              }}
            />

            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              Play Background Music?
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#cbd5e1",
                marginBottom: "20px",
                lineHeight: 1.5,
              }}
            >
              Would you like to play an observatory chime & bass score while
              exploring?
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => handleChoice(true)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: "#67e8f9",
                  color: "#020617",
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChoice(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
