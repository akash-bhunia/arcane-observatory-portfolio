"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BtnList, projectsData } from "@/data/data";

const defaultPortfolioData = {
  about: {
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
  },
  projects: {
    eyebrow: "Arcane Archive",
    headingPrefix: "Selected",
    headingHighlight: "Projects",
    subtitle:
      "Full-stack web apps, interactive 3D builds, and practical software experiments.",
    items: projectsData.map((proj, idx) => ({
      id: `proj-${proj.id || idx + 1}`,
      tag: proj.tech?.[0] || "PROJECT",
      title: proj.name,
      desc: proj.description,
      tech: proj.tech || [],
      image: "",
      liveUrl: proj.demoLink || "",
      repoUrl: proj.demoLink || "",
    })),
  },
  certificates: {
    eyebrow: "Verified Credentials",
    headingPrefix: "Honors &",
    headingHighlight: "Certificates",
    subtitle:
      "Certifications, conference presentations, and technical milestones.",
    items: [
      {
        id: "cert-1",
        title: "Full Stack Web Development (Delta)",
        issuer: "Apna College",
        date: "2026",
        credentialUrl: "",
        image: "",
      },
      {
        id: "cert-2",
        title: "Data Structures & Algorithms in Java (Alpha)",
        issuer: "Apna College",
        date: "2026",
        credentialUrl: "",
        image: "",
      },
    ],
  },
  contact: {
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
  },
};

function normalizeData(raw) {
  if (!raw || typeof raw !== "object") return defaultPortfolioData;
  return {
    about: {
      ...defaultPortfolioData.about,
      ...(raw.about || {}),
      quickStats: Array.isArray(raw.about?.quickStats)
        ? raw.about.quickStats
        : defaultPortfolioData.about.quickStats,
      focusAreas: Array.isArray(raw.about?.focusAreas)
        ? raw.about.focusAreas
        : defaultPortfolioData.about.focusAreas,
      skills: Array.isArray(raw.about?.skills)
        ? raw.about.skills
        : defaultPortfolioData.about.skills,
    },
    projects: {
      ...defaultPortfolioData.projects,
      ...(raw.projects || {}),
      items:
        Array.isArray(raw.projects?.items) && raw.projects.items.length > 0
          ? raw.projects.items
          : defaultPortfolioData.projects.items,
    },
    certificates: {
      ...defaultPortfolioData.certificates,
      ...(raw.certificates || {}),
      items: Array.isArray(raw.certificates?.items)
        ? raw.certificates.items
        : defaultPortfolioData.certificates.items,
    },
    contact: {
      ...defaultPortfolioData.contact,
      ...(raw.contact || {}),
      socials: Array.isArray(raw.contact?.socials)
        ? raw.contact.socials
        : defaultPortfolioData.contact.socials,
    },
  };
}

function compressImageToDataUrl(file, maxWidth = 1100, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EditPortfolioPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const [activeTab, setActiveTab] = useState("about");
  const [data, setData] = useState(defaultPortfolioData);
  const [newSkill, setNewSkill] = useState("");
  const [savedNotice, setSavedNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const noticeTimerRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (active && json?.data) {
          setData(normalizeData(json.data));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const notify = (msg) => {
    setSavedNotice(msg);
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = setTimeout(() => setSavedNotice(""), 2600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const entered = passInput.trim();
    if (!entered) {
      setAuthError("Please enter password.");
      return;
    }

    setIsCheckingAuth(true);
    setAuthError("");
    try {
      const latestRes = await fetch("/api/portfolio", { cache: "no-store" });
      const latestJson = await latestRes.json();
      const latestData = latestJson?.data
        ? normalizeData(latestJson.data)
        : data;

      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: entered,
          data: latestData,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAuthError(json?.error || "Incorrect password. Try again.");
        return;
      }
      setData(latestData);
      setIsUnlocked(true);
      setAuthError("");
    } catch {
      setAuthError("Could not connect to server.");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: passInput.trim(),
          data,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        notify(json?.error || "Save failed");
        return;
      }
      notify("Saved to MongoDB!");
    } catch {
      notify("Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    setData(defaultPortfolioData);
    setIsSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: passInput.trim(),
          data: defaultPortfolioData,
        }),
      });
      if (res.ok) {
        notify("Reset & saved to MongoDB.");
      } else {
        notify("Reset locally (check password).");
      }
    } catch {
      notify("Reset locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const setAboutField = (field, value) => {
    setData((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value },
    }));
  };

  const addStat = () => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        quickStats: [
          ...prev.about.quickStats,
          { id: `stat-${Date.now()}`, label: "New Stat", value: "Value" },
        ],
      },
    }));
  };

  const updateStat = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        quickStats: prev.about.quickStats.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      },
    }));
  };

  const deleteStat = (id) => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        quickStats: prev.about.quickStats.filter((s) => s.id !== id),
      },
    }));
  };

  const addFocus = () => {
    const idx = data.about.focusAreas.length + 1;
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        focusAreas: [
          ...prev.about.focusAreas,
          {
            id: `focus-${Date.now()}`,
            code: `0${idx} // MODULE`,
            title: "New Focus Area",
            desc: "Describe what this section covers.",
            accent: idx % 2 === 0 ? "#d8b4fe" : "#67e8f9",
          },
        ],
      },
    }));
  };

  const updateFocus = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        focusAreas: prev.about.focusAreas.map((f) =>
          f.id === id ? { ...f, [field]: value } : f,
        ),
      },
    }));
  };

  const deleteFocus = (id) => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        focusAreas: prev.about.focusAreas.filter((f) => f.id !== id),
      },
    }));
  };

  const addSkill = (e) => {
    e.preventDefault();
    const val = newSkill.trim();
    if (!val) return;
    setData((prev) => ({
      ...prev,
      about: { ...prev.about, skills: [...prev.about.skills, val] },
    }));
    setNewSkill("");
  };

  const updateSkill = (idx, value) => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        skills: prev.about.skills.map((sk, i) => (i === idx ? value : sk)),
      },
    }));
  };

  const deleteSkill = (idx) => {
    setData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        skills: prev.about.skills.filter((_, i) => i !== idx),
      },
    }));
  };

  const setProjectMeta = (field, value) => {
    setData((prev) => ({
      ...prev,
      projects: { ...prev.projects, [field]: value },
    }));
  };

  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        items: [
          ...prev.projects.items,
          {
            id: `proj-${Date.now()}`,
            tag: "NEW PROJECT",
            title: "Untitled Project",
            desc: "Project summary and key features.",
            tech: ["React", "Node.js"],
            image: "",
            liveUrl: "",
            repoUrl: "",
          },
        ],
      },
    }));
  };

  const updateProject = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        items: prev.projects.items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const handleProjectImageUpload = async (id, file) => {
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      updateProject(id, "image", compressed);
      notify("Project image attached! Click Save Changes.");
    } catch {
      notify("Failed to load project image.");
    }
  };

  const deleteProject = (id) => {
    setData((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        items: prev.projects.items.filter((item) => item.id !== id),
      },
    }));
  };

  const setCertificateMeta = (field, value) => {
    setData((prev) => ({
      ...prev,
      certificates: { ...prev.certificates, [field]: value },
    }));
  };

  const addCertificate = () => {
    setData((prev) => ({
      ...prev,
      certificates: {
        ...prev.certificates,
        items: [
          ...prev.certificates.items,
          {
            id: `cert-${Date.now()}`,
            title: "New Certificate",
            issuer: "Issuing Organization",
            date: "2026",
            credentialUrl: "",
            image: "",
          },
        ],
      },
    }));
  };

  const updateCertificate = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      certificates: {
        ...prev.certificates,
        items: prev.certificates.items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const handleCertificateImageUpload = async (id, file) => {
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      updateCertificate(id, "image", compressed);
      notify("Certificate image attached! Click Save Changes.");
    } catch {
      notify("Failed to read image file.");
    }
  };

  const deleteCertificate = (id) => {
    setData((prev) => ({
      ...prev,
      certificates: {
        ...prev.certificates,
        items: prev.certificates.items.filter((item) => item.id !== id),
      },
    }));
  };

  const setContactMeta = (field, value) => {
    setData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const addSocial = () => {
    setData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socials: [
          ...prev.contact.socials,
          {
            id: `soc-${Date.now()}`,
            label: "Link",
            value: "Handle / Text",
            url: "https://",
          },
        ],
      },
    }));
  };

  const updateSocial = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socials: prev.contact.socials.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      },
    }));
  };

  const deleteSocial = (id) => {
    setData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        socials: prev.contact.socials.filter((s) => s.id !== id),
      },
    }));
  };

  const panelStyle = {
    borderRadius: "20px",
    padding: "22px",
    background:
      "linear-gradient(150deg, rgba(15, 23, 42, 0.88), rgba(9, 13, 28, 0.95))",
    border: "1px solid rgba(103, 232, 249, 0.22)",
    boxShadow: "0 18px 45px rgba(2, 6, 23, 0.75)",
    backdropFilter: "blur(14px)",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    fontSize: "13.5px",
    color: "#f8fafc",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#94a3b8",
    marginBottom: "6px",
  };

  const deleteBtnStyle = {
    padding: "6px 11px",
    borderRadius: "8px",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    color: "#fca5a5",
    fontSize: "11.5px",
    cursor: "pointer",
  };

  const addBtnStyle = {
    padding: "7px 13px",
    borderRadius: "8px",
    border: "1px solid rgba(103, 232, 249, 0.35)",
    backgroundColor: "rgba(34, 211, 238, 0.12)",
    color: "#67e8f9",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  };

  if (!isUnlocked) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background:
            "radial-gradient(circle at 25% 30%, rgba(103, 232, 249, 0.1), transparent 45%), radial-gradient(circle at 80% 70%, rgba(192, 132, 252, 0.12), transparent 48%), linear-gradient(180deg, #050814 0%, #090d1c 100%)",
          color: "#f8fafc",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            ...panelStyle,
            maxWidth: "390px",
            width: "100%",
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              padding: "4px 11px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#67e8f9",
              backgroundColor: "rgba(34, 211, 238, 0.1)",
              border: "1px solid rgba(103, 232, 249, 0.28)",
              marginBottom: "14px",
            }}
          >
            Admin Gate
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: "0 0 8px 0",
              color: "#ffffff",
            }}
          >
            Observatory Editor Login
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#cbd5e1",
              margin: "0 0 18px 0",
              lineHeight: 1.6,
            }}
          >
            Enter admin password to edit About, Projects, Certificates, and
            Contact content.
          </p>

          <label htmlFor="admin-pass" style={labelStyle}>
            Password
          </label>
          <input
            id="admin-pass"
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Enter password..."
            style={{ ...inputStyle, marginBottom: "12px" }}
          />

          {authError && (
            <div
              style={{
                fontSize: "12.5px",
                color: "#fca5a5",
                marginBottom: "12px",
              }}
            >
              {authError}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={isCheckingAuth}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "#67e8f9",
                color: "#020617",
              }}
            >
              {isCheckingAuth ? "Verifying..." : "Unlock Editor"}
            </button>
            <Link
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                color: "#cbd5e1",
                textDecoration: "none",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(148, 163, 184, 0.24)",
              }}
            >
              Home
            </Link>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "80px 20px 72px",
        background:
          "radial-gradient(circle at 20% 25%, rgba(103, 232, 249, 0.09), transparent 45%), radial-gradient(circle at 82% 70%, rgba(192, 132, 252, 0.11), transparent 48%), linear-gradient(180deg, #050814 0%, #090d1c 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            ...panelStyle,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#67e8f9",
                marginBottom: "4px",
              }}
            >
              Arcane Observatory // MongoDB CMS
            </div>
            <h1
              style={{
                fontSize: "25px",
                fontWeight: 700,
                margin: 0,
                color: "#ffffff",
              }}
            >
              Edit Portfolio Sections
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: "4px 0 0 0",
              }}
            >
              Home orbit buttons ({BtnList.map((b) => b.label).join(" • ")})
              remain unchanged; edit section contents below.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {savedNotice && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#67e8f9",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(34, 211, 238, 0.12)",
                  border: "1px solid rgba(103, 232, 249, 0.3)",
                }}
              >
                ✓ {savedNotice}
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "#67e8f9",
                color: "#020617",
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isSaving}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#e2e8f0",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              Reset All
            </button>
            <Link
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                color: "#d8b4fe",
                backgroundColor: "rgba(192, 132, 252, 0.12)",
                border: "1px solid rgba(192, 132, 252, 0.35)",
              }}
            >
              View Home →
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {[
            { id: "about", label: "About Section" },
            { id: "projects", label: "Projects Section" },
            { id: "certificates", label: "Certificates Section" },
            { id: "contact", label: "Contact Section" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: active ? "#020617" : "#e2e8f0",
                  backgroundColor: active
                    ? "#67e8f9"
                    : "rgba(15, 23, 42, 0.85)",
                  border: active
                    ? "1px solid #67e8f9"
                    : "1px solid rgba(148, 163, 184, 0.25)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "about" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <section style={panelStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: "0 0 14px 0",
                }}
              >
                About Heading & Bio
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>Badge</label>
                  <input
                    type="text"
                    value={data.about.eyebrow}
                    onChange={(e) => setAboutField("eyebrow", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Top Tag</label>
                  <input
                    type="text"
                    value={data.about.builderTag}
                    onChange={(e) =>
                      setAboutField("builderTag", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Prefix</label>
                  <input
                    type="text"
                    value={data.about.headingPrefix}
                    onChange={(e) =>
                      setAboutField("headingPrefix", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    type="text"
                    value={data.about.headingHighlight}
                    onChange={(e) =>
                      setAboutField("headingHighlight", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle}>Bio</label>
              <textarea
                rows={3}
                value={data.about.bio}
                onChange={(e) => setAboutField("bio", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </section>

            <section style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Highlights Strip
                </h2>
                <button type="button" onClick={addStat} style={addBtnStyle}>
                  + Add Stat
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "12px",
                }}
              >
                {data.about.quickStats.map((stat) => (
                  <div
                    key={stat.id}
                    style={{
                      padding: "12px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(148, 163, 184, 0.18)",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <label style={labelStyle}>Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(stat.id, "label", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={labelStyle}>Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) =>
                          updateStat(stat.id, "value", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteStat(stat.id)}
                      style={deleteBtnStyle}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Focus Sections
                </h2>
                <button type="button" onClick={addFocus} style={addBtnStyle}>
                  + Add Section
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                  gap: "14px",
                }}
              >
                {data.about.focusAreas.map((area) => (
                  <div
                    key={area.id}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                    }}
                  >
                    <div style={{ marginBottom: "8px" }}>
                      <label style={labelStyle}>Code / Tag</label>
                      <input
                        type="text"
                        value={area.code}
                        onChange={(e) =>
                          updateFocus(area.id, "code", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <label style={labelStyle}>Title</label>
                      <input
                        type="text"
                        value={area.title}
                        onChange={(e) =>
                          updateFocus(area.id, "title", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        rows={2}
                        value={area.desc}
                        onChange={(e) =>
                          updateFocus(area.id, "desc", e.target.value)
                        }
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteFocus(area.id)}
                      style={deleteBtnStyle}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={panelStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: "0 0 12px 0",
                }}
              >
                Skills
              </h2>
              <form
                onSubmit={addSkill}
                style={{ display: "flex", gap: "10px", marginBottom: "14px" }}
              >
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="submit" style={addBtnStyle}>
                  + Add Skill
                </button>
              </form>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.about.skills.map((sk, idx) => (
                  <div
                    key={`${sk}-${idx}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 8px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(148, 163, 184, 0.22)",
                    }}
                  >
                    <input
                      type="text"
                      value={sk}
                      onChange={(e) => updateSkill(idx, e.target.value)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#f8fafc",
                        fontSize: "12px",
                        width: `${Math.max(6, sk.length + 1)}ch`,
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => deleteSkill(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fca5a5",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "projects" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <section style={panelStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: "0 0 14px 0",
                }}
              >
                Projects Header
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>Badge</label>
                  <input
                    type="text"
                    value={data.projects.eyebrow}
                    onChange={(e) => setProjectMeta("eyebrow", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Prefix</label>
                  <input
                    type="text"
                    value={data.projects.headingPrefix}
                    onChange={(e) =>
                      setProjectMeta("headingPrefix", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    type="text"
                    value={data.projects.headingHighlight}
                    onChange={(e) =>
                      setProjectMeta("headingHighlight", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle}>Subtitle</label>
              <input
                type="text"
                value={data.projects.subtitle}
                onChange={(e) => setProjectMeta("subtitle", e.target.value)}
                style={inputStyle}
              />
            </section>

            <section style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Project Items
                </h2>
                <button type="button" onClick={addProject} style={addBtnStyle}>
                  + Add Project
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {data.projects.items.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Tag</label>
                        <input
                          type="text"
                          value={proj.tag}
                          onChange={(e) =>
                            updateProject(proj.id, "tag", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) =>
                            updateProject(proj.id, "title", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Tech (comma separated)</label>
                        <input
                          type="text"
                          value={(proj.tech || []).join(", ")}
                          onChange={(e) =>
                            updateProject(
                              proj.id,
                              "tech",
                              e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            )
                          }
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        rows={2}
                        value={proj.desc}
                        onChange={(e) =>
                          updateProject(proj.id, "desc", e.target.value)
                        }
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleProjectImageUpload(proj.id, e.target.files?.[0])
                        }
                        style={{ fontSize: "12px", color: "#cbd5e1" }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteProject(proj.id)}
                        style={deleteBtnStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "certificates" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <section style={panelStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: "0 0 14px 0",
                }}
              >
                Certificates Header
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>Badge</label>
                  <input
                    type="text"
                    value={data.certificates.eyebrow}
                    onChange={(e) =>
                      setCertificateMeta("eyebrow", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Prefix</label>
                  <input
                    type="text"
                    value={data.certificates.headingPrefix}
                    onChange={(e) =>
                      setCertificateMeta("headingPrefix", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heading Highlight</label>
                  <input
                    type="text"
                    value={data.certificates.headingHighlight}
                    onChange={(e) =>
                      setCertificateMeta("headingHighlight", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle}>Subtitle</label>
              <input
                type="text"
                value={data.certificates.subtitle}
                onChange={(e) => setCertificateMeta("subtitle", e.target.value)}
                style={inputStyle}
              />
            </section>

            <section style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Certificate Items
                </h2>
                <button
                  type="button"
                  onClick={addCertificate}
                  style={addBtnStyle}
                >
                  + Add Certificate
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {data.certificates.items.map((cert) => (
                  <div
                    key={cert.id}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Title</label>
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) =>
                            updateCertificate(cert.id, "title", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Issuer</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateCertificate(cert.id, "issuer", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Date / Year</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) =>
                            updateCertificate(cert.id, "date", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleCertificateImageUpload(
                            cert.id,
                            e.target.files?.[0],
                          )
                        }
                        style={{ fontSize: "12px", color: "#cbd5e1" }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteCertificate(cert.id)}
                        style={deleteBtnStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "contact" && (
          <section style={panelStyle}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 14px 0",
              }}
            >
              Contact Details
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={data.contact.email}
                  onChange={(e) => setContactMeta("email", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  value={data.contact.location}
                  onChange={(e) => setContactMeta("location", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Availability</label>
                <input
                  type="text"
                  value={data.contact.availability}
                  onChange={(e) =>
                    setContactMeta("availability", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Subtitle</label>
              <input
                type="text"
                value={data.contact.subtitle}
                onChange={(e) => setContactMeta("subtitle", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                Social Links
              </h3>
              <button type="button" onClick={addSocial} style={addBtnStyle}>
                + Add Link
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {data.contact.socials.map((soc) => (
                <div
                  key={soc.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr)) auto",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    value={soc.label}
                    onChange={(e) =>
                      updateSocial(soc.id, "label", e.target.value)
                    }
                    placeholder="Label"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={soc.value}
                    onChange={(e) =>
                      updateSocial(soc.id, "value", e.target.value)
                    }
                    placeholder="Display text"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={soc.url}
                    onChange={(e) =>
                      updateSocial(soc.id, "url", e.target.value)
                    }
                    placeholder="https://..."
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => deleteSocial(soc.id)}
                    style={deleteBtnStyle}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
