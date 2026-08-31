"use client";

import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

export interface PinZuliaStrikeCompositionProps {
  eventType?: "STRIKE" | "SPARE" | "SPLIT" | "TURKEY";
  laneNumber?: number;
  speedKmh?: number;
  rpm?: number;
}

export function PinZuliaStrikeComposition({
  eventType = "STRIKE",
  laneNumber = 7,
  speedKmh = 29.4,
  rpm = 430,
}: PinZuliaStrikeCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isStrike = eventType === "STRIKE";
  const isSpare = eventType === "SPARE";
  const isSplit = eventType === "SPLIT";
  const isTurkey = eventType === "TURKEY";

  // Camera Shake on impact
  const shake =
    frame > 34 && frame < 65
      ? Math.sin(frame * 2.8) *
        interpolate(frame, [34, 45, 65], [0, isTurkey ? 12 : 8, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  // Ball Movement
  const ballY = interpolate(frame, [0, 36], [320, 70], {
    extrapolateRight: "clamp",
  });
  const ballScale = interpolate(frame, [0, 36], [1.8, 0.45], {
    extrapolateRight: "clamp",
  });
  const ballOpacity = interpolate(frame, [34, 38], [1, 0], {
    extrapolateRight: "clamp",
  });
  const ballRotate = frame * 20;

  // Pin Impact Physics
  const pinImpactSpring = spring({
    frame: frame - 34,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  const celebrationOpacity = interpolate(frame, [38, 48, 110, 120], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const celebrationScale = spring({
    frame: frame - 38,
    fps,
    config: { damping: 8, stiffness: 190 },
  });

  const glowPulse = Math.sin(frame * 0.15) * 0.25 + 0.75;

  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${shake}px)`,
        backgroundColor: "#02040a",
        overflow: "hidden",
        fontFamily: "'Barlow Condensed', 'Outfit', sans-serif",
      }}
    >
      {/* Background Cyberpunk Neon Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isTurkey
            ? `radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.4) 0%, rgba(5, 10, 24, 0.95) 70%, #02040a 100%)`
            : `radial-gradient(circle at 50% 30%, rgba(2, 132, 199, 0.4) 0%, rgba(5, 10, 24, 0.95) 70%, #02040a 100%)`,
        }}
      />

      {/* Top Telemetry Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "44px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid rgba(56, 189, 248, 0.25)",
          background: "rgba(2, 6, 18, 0.88)",
          backdropFilter: "blur(6px)",
          zIndex: 15,
        }}
      >
        <div
          style={{
            color: "#38bdf8",
            fontSize: "11px",
            fontWeight: "900",
            letterSpacing: "2px",
            textShadow: "0 0 10px #38bdf8",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
          PINZULIA SYNCHRO™ JUMBOTRON 60FPS
        </div>
        <div style={{ color: "#f87171", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace" }}>
          LANE {laneNumber < 10 ? `0${laneNumber}` : laneNumber} • {speedKmh} KM/H • {rpm} RPM
        </div>
      </div>

      {/* 3D Bowling Lane Perspective Floor */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          bottom: "22px",
          left: "50%",
          transform: "translateX(-50%) perspective(380px) rotateX(44deg)",
          width: "270px",
          background: isTurkey
            ? "linear-gradient(180deg, #450a0a 0%, #1e1b4b 40%, #02040a 100%)"
            : "linear-gradient(180deg, #0c2847 0%, #1e4570 40%, #051021 100%)",
          borderLeft: "4px solid #ef4444",
          borderRight: "4px solid #ef4444",
          boxShadow: `0 0 ${25 * glowPulse}px rgba(56, 189, 248, 0.4), inset 0 0 35px rgba(2, 132, 199, 0.6)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "10px 0",
        }}
      >
        {/* Laser Direction Guide Arrows */}
        <div style={{ display: "flex", justifyContent: "space-around", opacity: 0.7 }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: "10px solid #38bdf8",
                filter: "drop-shadow(0 0 4px #38bdf8)",
              }}
            />
          ))}
        </div>

        {/* Laser Foul Line */}
        <div
          style={{
            height: "4px",
            background: "#ef4444",
            boxShadow: "0 0 12px #ef4444",
            width: "100%",
          }}
        />
      </div>

      {/* 10 Pins Deck Container */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "160px",
          height: "90px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Row 4: 4 Pins */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { id: 7, dx: -70, dy: -30, rot: -110 },
            { id: 8, dx: -25, dy: -45, rot: -60 },
            { id: 9, dx: 25, dy: -45, rot: 60 },
            { id: 10, dx: 70, dy: -30, rot: 110 },
          ].map((pin) => (
            <div
              key={pin.id}
              style={{
                width: "12px",
                height: "24px",
                borderRadius: "6px 6px 3px 3px",
                background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)",
                border: "1px solid #ef4444",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.6)",
                transform: `translate(${pin.dx * pinImpactSpring}px, ${pin.dy * pinImpactSpring}px) rotate(${pin.rot * pinImpactSpring}deg) scale(${1 - pinImpactSpring * 0.3})`,
                opacity: 1 - pinImpactSpring * 0.9,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "5px", left: 0, right: 0, height: "2.5px", background: "#ef4444" }} />
            </div>
          ))}
        </div>

        {/* Row 3: 3 Pins */}
        <div style={{ display: "flex", gap: "20px", marginTop: "2px" }}>
          {[
            { id: 4, dx: -55, dy: -20, rot: -95 },
            { id: 5, dx: 0, dy: -50, rot: -180 },
            { id: 6, dx: 55, dy: -20, rot: 95 },
          ].map((pin) => (
            <div
              key={pin.id}
              style={{
                width: "13px",
                height: "26px",
                borderRadius: "7px 7px 3px 3px",
                background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)",
                border: "1px solid #ef4444",
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.7)",
                transform: `translate(${pin.dx * pinImpactSpring}px, ${pin.dy * pinImpactSpring}px) rotate(${pin.rot * pinImpactSpring}deg) scale(${1 - pinImpactSpring * 0.3})`,
                opacity: 1 - pinImpactSpring * 0.9,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "6px", left: 0, right: 0, height: "2.5px", background: "#ef4444" }} />
            </div>
          ))}
        </div>

        {/* Row 2: 2 Pins */}
        <div style={{ display: "flex", gap: "24px", marginTop: "2px" }}>
          {[
            { id: 2, dx: -45, dy: 10, rot: -75 },
            { id: 3, dx: 45, dy: 10, rot: 75 },
          ].map((pin) => (
            <div
              key={pin.id}
              style={{
                width: "14px",
                height: "28px",
                borderRadius: "7px 7px 3px 3px",
                background: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)",
                border: "1.5px solid #ef4444",
                boxShadow: "0 0 12px rgba(255, 255, 255, 0.8)",
                transform: `translate(${pin.dx * pinImpactSpring}px, ${pin.dy * pinImpactSpring}px) rotate(${pin.rot * pinImpactSpring}deg) scale(${1 - pinImpactSpring * 0.3})`,
                opacity: 1 - pinImpactSpring * 0.9,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "7px", left: 0, right: 0, height: "3px", background: "#ef4444" }} />
            </div>
          ))}
        </div>

        {/* Row 1: Pin 1 (Head Pin) */}
        <div style={{ marginTop: "2px" }}>
          <div
            style={{
              width: "16px",
              height: "30px",
              borderRadius: "8px 8px 4px 4px",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%)",
              border: "2px solid #ef4444",
              boxShadow: "0 0 16px #38bdf8",
              transform: `translate(0px, ${-60 * pinImpactSpring}px) rotate(${180 * pinImpactSpring}deg) scale(${1 - pinImpactSpring * 0.4})`,
              opacity: 1 - pinImpactSpring * 0.9,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: "8px", left: 0, right: 0, height: "3.5px", background: "#ef4444" }} />
          </div>
        </div>
      </div>

      {/* Rolling Bowling Ball */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${ballY}px`,
          transform: `translateX(-50%) scale(${ballScale}) rotate(${ballRotate}deg)`,
          opacity: ballOpacity,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: isTurkey
            ? "radial-gradient(circle at 35% 30%, #ef4444 0%, #b91c1c 40%, #0f172a 100%)"
            : "radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 40%, #0f172a 100%)",
          border: "2px solid #ffffff",
          boxShadow: isTurkey
            ? "0 0 25px #ef4444, 0 0 45px rgba(239, 68, 68, 0.8)"
            : "0 0 25px #38bdf8, 0 0 45px rgba(2, 132, 199, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: "2px" }}>
          <div style={{ width: "3.5px", height: "3.5px", borderRadius: "50%", background: "#000" }} />
          <div style={{ width: "3.5px", height: "3.5px", borderRadius: "50%", background: "#000" }} />
        </div>
      </div>

      {/* Event Celebration Explosion Jumbotron */}
      {frame > 36 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: celebrationOpacity,
            transform: `scale(${celebrationScale})`,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {isStrike && (
            <>
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  letterSpacing: "-1px",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  textShadow: "0 0 20px #ef4444, 0 0 40px #ef4444, 0 0 60px #dc2626",
                  lineHeight: "1",
                  border: "3px solid #ef4444",
                  padding: "6px 28px",
                  borderRadius: "16px",
                  background: "rgba(4, 10, 24, 0.94)",
                  boxShadow: "0 0 40px rgba(239, 68, 68, 0.7), inset 0 0 20px rgba(56, 189, 248, 0.4)",
                }}
              >
                🔥 STRIKE! 🔥
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  fontWeight: "800",
                  fontFamily: "monospace",
                  color: "#fde047",
                  letterSpacing: "3px",
                  textShadow: "0 0 10px #eab308",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "2px 10px",
                  borderRadius: "6px",
                  border: "1px solid #eab308",
                }}
              >
                PERFECT HIT • 300 SCORE PACE
              </div>
            </>
          )}

          {isSpare && (
            <>
              <div
                style={{
                  fontSize: "50px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  letterSpacing: "-1px",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  textShadow: "0 0 20px #38bdf8, 0 0 40px #0284c7",
                  lineHeight: "1",
                  border: "3px solid #38bdf8",
                  padding: "6px 26px",
                  borderRadius: "16px",
                  background: "rgba(4, 10, 24, 0.94)",
                  boxShadow: "0 0 40px rgba(56, 189, 248, 0.7), inset 0 0 20px rgba(2, 132, 199, 0.4)",
                }}
              >
                ⚡ SPARE! ⚡
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  fontWeight: "800",
                  fontFamily: "monospace",
                  color: "#38bdf8",
                  letterSpacing: "3px",
                  textShadow: "0 0 10px #0284c7",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "2px 10px",
                  borderRadius: "6px",
                  border: "1px solid #38bdf8",
                }}
              >
                CLEAN CONVERSION • FRAME CLOSED
              </div>
            </>
          )}

          {isSplit && (
            <>
              <div
                style={{
                  fontSize: "46px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  letterSpacing: "-1px",
                  color: "#fbbf24",
                  textTransform: "uppercase",
                  textShadow: "0 0 20px #f59e0b, 0 0 40px #b45309",
                  lineHeight: "1",
                  border: "3px solid #f59e0b",
                  padding: "6px 24px",
                  borderRadius: "16px",
                  background: "rgba(4, 10, 24, 0.94)",
                  boxShadow: "0 0 40px rgba(245, 158, 11, 0.7)",
                }}
              >
                ⚠️ 7-10 SPLIT! ⚠️
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  fontWeight: "800",
                  fontFamily: "monospace",
                  color: "#fca5a5",
                  letterSpacing: "3px",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "2px 10px",
                  borderRadius: "6px",
                  border: "1px solid #f87171",
                }}
              >
                HIGH TENSION SHOT • CORNER PINS
              </div>
            </>
          )}

          {isTurkey && (
            <>
              <div
                style={{
                  fontSize: "50px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  letterSpacing: "-1px",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  textShadow: "0 0 20px #ef4444, 0 0 40px #f59e0b, 0 0 60px #dc2626",
                  lineHeight: "1",
                  border: "3px solid #ef4444",
                  padding: "6px 28px",
                  borderRadius: "16px",
                  background: "rgba(15, 23, 42, 0.96)",
                  boxShadow: "0 0 50px rgba(239, 68, 68, 0.9), inset 0 0 20px rgba(245, 158, 11, 0.6)",
                }}
              >
                🦃 TURKEY! (3 IN A ROW) 🦃
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  fontWeight: "800",
                  fontFamily: "monospace",
                  color: "#fde047",
                  letterSpacing: "3px",
                  textShadow: "0 0 10px #eab308",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "2px 10px",
                  borderRadius: "6px",
                  border: "1px solid #eab308",
                }}
              >
                3 STRIKES CONSECUTIVOS • TRIPLE CORONA
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom Telemetry Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "6px",
          left: "14px",
          right: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "9px",
          fontFamily: "monospace",
          color: "rgba(255, 255, 255, 0.6)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "4px",
        }}
      >
        <span>BRUNSWICK PRO-LANE™ 72FT</span>
        <span style={{ color: "#38bdf8", fontWeight: "bold" }}>● REMOTION 60FPS</span>
        <span>FRAME: {frame}/120</span>
      </div>
    </AbsoluteFill>
  );
}