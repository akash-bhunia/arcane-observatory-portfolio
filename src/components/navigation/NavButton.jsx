"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  FileText,
  Folder,
  Github,
  Home,
  Linkedin,
  Phone,
  User,
} from "lucide-react";

const getIcon = (icon, label = "", link = "") => {
  const key = String(icon || "")
    .toLowerCase()
    .trim();
  const txt = `${label} ${link}`.toLowerCase();

  if (key === "home" || txt.includes("home") || link === "/") {
    return <Home className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (key === "about" || key === "user" || txt.includes("about")) {
    return <User className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (key === "projects" || key === "folder" || txt.includes("project")) {
    return <Folder className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (
    key === "certificates" ||
    key === "award" ||
    txt.includes("certificat") ||
    txt.includes("award")
  ) {
    return <Award className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (
    key === "contact" ||
    key === "phone" ||
    txt.includes("contact") ||
    txt.includes("mail")
  ) {
    return <Phone className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (key === "github" || txt.includes("github")) {
    return <Github className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (key === "linkedin" || txt.includes("linkedin")) {
    return <Linkedin className="w-full h-auto" strokeWidth={1.6} />;
  }
  if (
    key === "resume" ||
    key === "filetext" ||
    txt.includes("resume") ||
    txt.includes("cv")
  ) {
    return <FileText className="w-full h-auto" strokeWidth={1.6} />;
  }

  return <Home className="w-full h-auto" strokeWidth={1.6} />;
};

export default function NavButton({
  x,
  y,
  label,
  link,
  icon,
  newTab,
  paused,
  isMobile,
}) {
  const linkProps = {
    href: link || "/",
    target: newTab ? "_blank" : "_self",
    rel: newTab ? "noopener noreferrer" : undefined,
    "aria-label": label,
  };

  if (isMobile) {
    return (
      <Link
        {...linkProps}
        title={label}
        className="transition-transform duration-200 active:scale-95"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#67e8f9",
          backgroundColor: "rgba(15, 23, 42, 0.78)",
          border: "1px solid rgba(103, 232, 249, 0.28)",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <span style={{ width: "16px", height: "16px", display: "flex" }}>
          {getIcon(icon, label, link)}
        </span>
      </Link>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
      }}
    >
      <div
        style={{
          animation: "counterOrbit 30s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        <Link
          {...linkProps}
          className="group relative flex items-center justify-center rounded-full hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          style={{
            width: "52px",
            height: "52px",
            color: "#67e8f9",
            background:
              "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(9, 13, 28, 0.96))",
            border: "1px solid rgba(103, 232, 249, 0.38)",
            boxShadow:
              "0 0 22px rgba(103, 232, 249, 0.18), inset 0 0 12px rgba(192, 132, 252, 0.12)",
            textDecoration: "none",
            transition:
              "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
          }}
        >
          <span
            style={{
              width: "21px",
              height: "21px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getIcon(icon, label, link)}
          </span>

          <span
            className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200"
            style={{
              position: "absolute",
              bottom: "-26px",
              whiteSpace: "nowrap",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontSize: "10.5px",
              fontWeight: 600,
              color: "#f8fafc",
              backgroundColor: "rgba(9, 13, 28, 0.94)",
              border: "1px solid rgba(103, 232, 249, 0.34)",
              boxShadow: "0 6px 16px rgba(2, 6, 23, 0.75)",
            }}
          >
            {label}
          </span>
        </Link>
      </div>
    </div>
  );
}
