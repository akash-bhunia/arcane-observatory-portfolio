/*
- a frames of reference:
- - images: /images/
 */

export const projectsData = [
  {
    id: 1,
    name: "Aavira Fashion",
    description:
      "Full-stack e-commerce platform with authentication, password reset flow, admin controls, and cloud media storage.",
    tech: ["React", "Node.js", "Express", "MongoDB"],
    demoLink: "",
  },
  {
    id: 2,
    name: "WebRTC Video Conferencing App",
    description:
      "Dynamic rooms with peer-to-peer media streaming, screen sharing, and real-time chat.",
    tech: ["React", "Node.js", "Socket.IO", "WebRTC"],
    demoLink: "",
  },
];

export const BtnList = [
  { label: "Home", link: "/", icon: "home", newTab: false },
  { label: "About", link: "/about", icon: "about", newTab: false },
  { label: "Projects", link: "/projects", icon: "projects", newTab: false },
  {
    label: "Certificates",
    link: "/certificates",
    icon: "certificates",
    newTab: false,
  },
  { label: "Contact", link: "/contact", icon: "contact", newTab: false },
  {
    label: "GitHub",
    link: "https://github.com/akash-bhunia",
    icon: "github",
    newTab: true,
  },
  {
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/akash-bhunia-14834428b/",
    icon: "linkedin",
    newTab: true,
  },
  {
    label: "Resume",
    link: "/resume.pdf",
    icon: "resume",
    newTab: true,
  },
];
