import Link from "next/link";
import type { ReactNode } from "react";

interface AuthBrandPanelProps {
  tagline: string;
  description: string;
  bottom: ReactNode;
}

export function AuthBrandPanel({ tagline, description, bottom }: AuthBrandPanelProps) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between"
      style={{
        position: "relative",
        background: "#CC1F1F",
        minHeight: "100vh",
        padding: "48px clamp(32px,4vw,64px)",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.14,
          mixBlendMode: "luminosity",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(155deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.32) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -80,
          width: 360,
          height: 360,
          background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo lockup */}
      <Link
        href="/"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "3.5px solid #fff",
              borderRadius: "50%",
              borderRightColor: "transparent",
              transform: "rotate(-45deg)",
            }}
          />
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
          MaxiLearn
        </span>
        <span
          style={{
            marginLeft: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "4px 9px",
            borderRadius: 100,
          }}
        >
          por Maxi 1 Lubrificantes
        </span>
      </Link>

      {/* Tagline */}
      <div style={{ position: "relative", maxWidth: 440 }}>
        <h1
          className="text-balance"
          style={{
            fontSize: "clamp(30px,3.4vw,44px)",
            lineHeight: 1.12,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
          }}
        >
          {tagline}
        </h1>
        <p
          className="text-pretty"
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            fontWeight: 500,
            color: "rgba(255,255,255,0.88)",
            marginTop: 18,
          }}
        >
          {description}
        </p>
      </div>

      {/* Bottom slot */}
      <div style={{ position: "relative" }}>{bottom}</div>
    </div>
  );
}
