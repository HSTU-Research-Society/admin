"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const navLink = (active: boolean): React.CSSProperties => ({
  color: active ? "#0070f3" : "inherit",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
  transition: "color 0.2s ease"
});

export default function TopBar() {
  const pathname = usePathname();
  const [researchOpen, setResearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (pathname === "/auth") return null;

  const isResearch = pathname.startsWith("/research") && !pathname.startsWith("/research-achievements");

  return (
    <div style={{
      width: "100%",
      padding: "0 2rem",
      height: "72px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "var(--background)",
      borderBottom: "1px solid rgba(150, 150, 150, 0.15)",
      zIndex: 1000,
      position: "sticky",
      top: 0,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    }}>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", height: "100%" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ 
            fontSize: "1.2rem", 
            margin: 0, 
            fontWeight: 800, 
            marginRight: "1rem", 
            whiteSpace: "nowrap",
            letterSpacing: "-0.5px",
            cursor: "pointer"
          }}>
            ⚙ Admin
          </h2>
        </Link>

        {/* Leadership Dropdown */}
        <DropdownMenu 
          label="Leadership" 
          active={["/executive-committee", "/advisory-board", "/alumni-association", "/mentor-panel"].some(path => pathname.includes(path))}
          pathname={pathname} 
          items={[
            { href: "/executive-committee", label: "Exec. Committee" },
            { href: "/advisory-board",      label: "Advisory Board" },
            { href: "/alumni-association",  label: "Alumni" },
            { href: "/mentor-panel",        label: "Mentors" },
          ]} 
        />

        {/* Accomplishments Dropdown */}
        <DropdownMenu 
          label="Accomplishments" 
          active={["/awards", "/competition-winners", "/research-achievements"].some(path => pathname.includes(path))}
          pathname={pathname} 
          items={[
            { href: "/awards",                label: "Awards" },
            { href: "/competition-winners",   label: "Competitions" },
            { href: "/research-achievements", label: "Achievements" },
          ]} 
        />

        {/* Research Dropdown */}
        <DropdownMenu 
          label="Research" 
          active={isResearch}
          pathname={pathname} 
          items={[
            { href: "/research/publications",  label: "Publications" },
            { href: "/research/projects",      label: "Projects" },
            { href: "/research/magazine",      label: "Magazine" },
            { href: "/research/collaboration", label: "Collaboration Board" },
          ]} 
        />

        <DropdownMenu label="Library" active={pathname.startsWith("/resources/library")} pathname={pathname} items={[
          { href: "/resources/library/books",         label: "Books" },
          { href: "/resources/library/papers",        label: "Research Papers" },
          { href: "/resources/library/lecture-notes", label: "Lecture Notes" },
          { href: "/resources/library/thesis",        label: "Thesis Repository" },
        ]} />

        <DropdownMenu label="Opportunities" active={pathname.startsWith("/resources/opportunities")} pathname={pathname} items={[
          { href: "/resources/opportunities/scholarships",  label: "Scholarships" },
          { href: "/resources/opportunities/internships",   label: "Internships" },
          { href: "/resources/opportunities/fellowships",   label: "Fellowships" },
          { href: "/resources/opportunities/conferences",   label: "Conferences" },
          { href: "/resources/opportunities/competitions",  label: "Competitions" },
        ]} />

        <DropdownMenu label="Learning" active={pathname.startsWith("/resources/learning")} pathname={pathname} items={[
          { href: "/resources/learning/tutorials",  label: "Tutorials" },
          { href: "/resources/learning/workshops",  label: "Workshops" },
          { href: "/resources/learning/datasets",   label: "Datasets" },
        ]} />

        <Link href="/resources/downloads" style={navLink(pathname === "/resources/downloads")}>Downloads</Link>

        <DropdownMenu label="Blog" active={pathname.startsWith("/media/blog")} pathname={pathname} items={[
          { href: "/media/blog/research-articles", label: "Research Articles" },
          { href: "/media/blog/tutorials",         label: "Blog Tutorials" },
          { href: "/media/blog/tech-insights",     label: "Tech Insights" },
        ]} />

        <DropdownMenu label="Gallery" active={pathname.startsWith("/media/gallery")} pathname={pathname} items={[
          { href: "/media/gallery/albums", label: "Albums" },
          { href: "/media/gallery/photos", label: "Photos" },
          { href: "/media/gallery/videos", label: "Videos" },
        ]} />

        <DropdownMenu label="Community" active={pathname.startsWith("/community")} pathname={pathname} items={[
          { href: "/community/volunteer/call",            label: "Volunteer Calls" },
          { href: "/community/volunteer/applications",    label: "Applications" },
          { href: "/community/partnerships/organizations",label: "Partners" },
          { href: "/community/partnerships/institutions", label: "Institutions" },
          { href: "/community/notices",                   label: "Notices" },
        ]} />

        <DropdownMenu label="Events" active={pathname.startsWith("/events")} pathname={pathname} items={[
          { href: "/events/upcoming", label: "Upcoming Events" },
          { href: "/events/past",     label: "Past Events" },
          { href: "/events/reports",  label: "Event Reports" },
        ]} />

        <DropdownMenu label="Verify" active={pathname.startsWith("/verification")} pathname={pathname} items={[
          { href: "/verification/membership",    label: "Membership" },
          { href: "/verification/certificate",   label: "Certificate" },
          { href: "/verification/volunteership", label: "Volunteership" },
        ]} />

        <Link href="/faq" style={navLink(pathname === "/faq")}>FAQ</Link>
      </div>

      <button
        onClick={() => signOut(auth)}
        style={{
          padding: "0.6rem 1.2rem",
          backgroundColor: "#e53e3e", color: "white",
          border: "none", borderRadius: "10px", cursor: "pointer",
          fontWeight: 700, fontSize: "0.88rem",
          transition: "all 0.2s", whiteSpace: "nowrap", marginLeft: "1.5rem",
          boxShadow: "0 4px 12px rgba(229, 62, 62, 0.2)"
        }}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = "#c53030";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(229, 62, 62, 0.3)";
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = "#e53e3e";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(229, 62, 62, 0.2)";
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

function DropdownPanel({ pathname, items, onClose }: { pathname: string; items: { href: string; label: string }[]; onClose?: () => void; }) {
  return (
    <>
      <div style={{
        position: "absolute", top: "100%", left: 0,
        width: "100%", height: "20px", // Bridge the gap between button and dropdown
        background: "transparent", zIndex: 1999
      }} />
      <div style={{
        position: "absolute", top: "calc(100% + 5px)", left: "-10px",
        background: "var(--background)",
        border: "1px solid rgba(150,150,150,0.15)",
        borderRadius: "14px", padding: "0.6rem",
        boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
        minWidth: "220px", zIndex: 2000,
        display: "flex", flexDirection: "column", gap: "0.1rem",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "dropdownFadeIn 0.2s ease-out"
      }}>
        <style>{`
          @keyframes dropdownFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {items.map(item => (
          <Link key={item.href} href={item.href} onClick={onClose}
            style={{
              display: "block", padding: "0.7rem 1rem", borderRadius: "10px",
              textDecoration: "none", fontSize: "0.9rem", fontWeight: 600,
              color: pathname === item.href ? "#0070f3" : "inherit",
              background: pathname === item.href ? "rgba(0,112,243,0.08)" : "transparent",
              transition: "all 0.15s ease", whiteSpace: "nowrap"
            }}
            onMouseOver={e => { if (pathname !== item.href) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
            onMouseOut={e => { if (pathname !== item.href) e.currentTarget.style.background = "transparent"; }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}

function DropdownMenu({ label, active, pathname, items }: {
  label: string; active: boolean; pathname: string; items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button style={{
        background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0",
        display: "flex", alignItems: "center", gap: "0.3rem",
        fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap",
        color: active ? "#0070f3" : "inherit",
        transition: "color 0.2s ease"
      }}>
        {label} <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>▼</span>
      </button>
      {open && <DropdownPanel pathname={pathname} items={items} onClose={() => setOpen(false)} />}
    </div>
  );
}

