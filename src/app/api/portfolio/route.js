import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { BtnList, projectsData } from "@/data/data";

export const dynamic = "force-dynamic";

const DB_NAME = "arcane_observatory";
const COLLECTION_NAME = "portfolio_cms";
const DOC_ID = "main_site_content";

const defaultPortfolioData = {
  navItems: BtnList.map((item, idx) => ({
    id: `nav-${idx + 1}`,
    label: item.label,
    link: item.link,
    icon: item.icon,
    newTab: Boolean(item.newTab),
  })),
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

let cachedClient = null;

async function getCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in .env.local");
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME).collection(COLLECTION_NAME);
}

export async function GET() {
  try {
    const collection = await getCollection();
    const doc = await collection.findOne({ _id: DOC_ID });
    if (!doc) {
      return NextResponse.json({ data: defaultPortfolioData }, { status: 200 });
    }
    const { _id, updatedAt, ...payload } = doc;
    return NextResponse.json(
      { data: { ...defaultPortfolioData, ...payload } },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        data: defaultPortfolioData,
        warning: err?.message || "Using default data",
      },
      { status: 200 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const passcode = String(body?.passcode || "");
    const expectedPasscode = process.env.ADMIN_PASSCODE || "arcane2026";

    if (passcode !== expectedPasscode) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 },
      );
    }

    const payload = body?.data;
    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid portfolio payload." },
        { status: 400 },
      );
    }

    const { _id, updatedAt, ...cleanPayload } = payload;
    const collection = await getCollection();
    await collection.updateOne(
      { _id: DOC_ID },
      {
        $set: {
          ...cleanPayload,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json(
      { ok: true, message: "Saved to MongoDB." },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Failed to save to MongoDB." },
      { status: 500 },
    );
  }
}
