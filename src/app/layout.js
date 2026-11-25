import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { Toaster } from "sonner";
import MusicConsentModal from "@/components/MusicConsentModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "3D Portfolio | Next.js & Three.js",
  description:
    "Interactive 3D portfolio built with Next.js, Three.js, and Tailwind CSS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={clsx(
          inter.variable,
          "font-inter bg-background text-foreground antialiased overflow-x-hidden",
        )}
      >
        {/* Subtle Global Top Observatory Hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.7), rgba(216, 180, 254, 0.65), rgba(253, 224, 71, 0.45), transparent)",
            opacity: 0.75,
          }}
        />
        {children}
        <MusicConsentModal />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
