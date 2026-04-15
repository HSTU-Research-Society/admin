"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef } from "react";

const navLink = (active: boolean): React.CSSProperties => ({
  color: active ? "#0070f3" : "inherit",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.9rem",
  whiteSpace: "nowrap"
});

export default function TopBar() {
  const pathname = usePathname();
  const [researchOpen, setResearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (pathname === "/auth") return null;

  const isResearch = pathname.startsWith("/research") && !pathname.startsWith("/research-achievements");

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setResearchOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setResearchOpen(false), 200);
  };

  return (
    <div style={{
      width: "100%",
      padding: "0.9rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "var(--background)",
      borderBottom: "1px solid rgba(150, 150, 150, 0.2)",
      zIndex: 1000,
      position: "sticky",
      top: 0,
      overflowX: "auto"
    }}>
      <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 800, marginRight: "0.5rem", whiteSpace: "nowrap" }}>⚙ Admin</h2>

        <Link href="/" style={navLink(pathname === "/")}>Dashboard</Link>
        <Link href="/executive-committee" style={navLink(pathname.includes("/executive-committee"))}>Exec. Committee</Link>
        <Link href="/advisory-board" style={navLink(pathname.includes("/advisory-board"))}>Advisory Board</Link>
        <Link href="/alumni-association" style={navLink(pathname.includes("/alumni-association"))}>Alumni</Link>
        <Link href="/mentor-panel" style={navLink(pathname.includes("/mentor-panel"))}>Mentors</Link>
        <Link href="/awards" style={navLink(pathname.includes("/awards"))}>Awards</Link>
        <Link href="/competition-winners" style={navLink(pathname.includes("/competition-winners"))}>Competitions</Link>
        <Link href="/research-achievements" style={navLink(pathname.includes("/research-achievements"))}>Achievements</Link>

        <div
          style={{ position: "relative" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button style={{
            ...navLink(isResearch),
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: "0.3rem",
            color: isResearch ? "#0070f3" : "inherit"
          }}>
            Research ▾
          </button>
          {researchOpen && (
            <DropdownPanel pathname={pathname} onClose={() => setResearchOpen(false)} items={[
              { href: "/research/publications",  label: "📚 Publications" },
              { href: "/research/projects",      label: "🔬 Projects" },
              { href: "/research/magazine",      label: "📰 Magazine" },
              { href: "/research/collaboration", label: "🤝 Collaboration Board" },
            ]} />
          )}
        </div>

        <DropdownMenu label="Library"       active={pathname.startsWith("/resources/library")}       pathname={pathname} items={[
          { href: "/resources/library/books",         label: "📗 Books" },
          { href: "/resources/library/papers",        label: "📄 Research Papers" },
          { href: "/resources/library/lecture-notes", label: "📝 Lecture Notes" },
          { href: "/resources/library/thesis",        label: "🎓 Thesis Repository" },
        ]} />

        <DropdownMenu label="Opportunities" active={pathname.startsWith("/resources/opportunities")} pathname={pathname} items={[
          { href: "/resources/opportunities/scholarships",  label: "🎓 Scholarships" },
          { href: "/resources/opportunities/internships",   label: "💼 Internships" },
          { href: "/resources/opportunities/fellowships",   label: "🏅 Fellowships" },
          { href: "/resources/opportunities/conferences",   label: "🎤 Conferences" },
          { href: "/resources/opportunities/competitions",  label: "🏆 Competitions" },
        ]} />

        <DropdownMenu label="Learning"      active={pathname.startsWith("/resources/learning")}      pathname={pathname} items={[
          { href: "/resources/learning/tutorials",  label: "📖 Tutorials" },
          { href: "/resources/learning/workshops",  label: "🛠️ Workshops" },
          { href: "/resources/learning/datasets",   label: "🗂️ Datasets" },
        ]} />

        <Link href="/resources/downloads" style={navLink(pathname === "/resources/downloads")}>Downloads</Link>

        <DropdownMenu label="Blog" active={pathname.startsWith("/media/blog")} pathname={pathname} items={[
          { href: "/media/blog/research-articles", label: "🔬 Research Articles" },
          { href: "/media/blog/tutorials",         label: "📖 Blog Tutorials" },
          { href: "/media/blog/tech-insights",     label: "💡 Tech Insights" },
        ]} />

        <DropdownMenu label="Gallery" active={pathname.startsWith("/media/gallery")} pathname={pathname} items={[
          { href: "/media/gallery/albums", label: "📁 Albums" },
          { href: "/media/gallery/photos", label: "📷 Photos" },
          { href: "/media/gallery/videos", label: "🎬 Videos" },
        ]} />

        <DropdownMenu label="Community" active={pathname.startsWith("/community")} pathname={pathname} items={[
          { href: "/community/volunteer/call",            label: "📣 Volunteer Calls" },
          { href: "/community/volunteer/applications",    label: "📋 Applications" },
          { href: "/community/partnerships/organizations","label": "🤝 Partners" },
          { href: "/community/partnerships/institutions", label: "🏛️ Institutions" },
          { href: "/community/notices",                   label: "📌 Notices" },
        ]} />

        <DropdownMenu label="Events" active={pathname.startsWith("/events")} pathname={pathname} items={[
          { href: "/events/upcoming", label: "📅 Upcoming Events" },
          { href: "/events/past",     label: "🗓️ Past Events" },
          { href: "/events/reports",  label: "📝 Event Reports" },
        ]} />

        <DropdownMenu label="Verify" active={pathname.startsWith("/verification")} pathname={pathname} items={[
          { href: "/verification/membership",    label: "🪪 Membership" },
          { href: "/verification/certificate",   label: "🏅 Certificate" },
          { href: "/verification/volunteership", label: "🤝 Volunteership" },
        ]} />

        <Link href="/faq" style={navLink(pathname === "/faq")}>FAQ</Link>
      </div>

      <button
        onClick={() => signOut(auth)}
        style={{
          padding: "0.55rem 1.1rem",
          backgroundColor: "#e53e3e", color: "white",
          border: "none", borderRadius: "8px", cursor: "pointer",
          fontWeight: 600, fontSize: "0.88rem",
          transition: "background-color 0.2s", whiteSpace: "nowrap", marginLeft: "1rem"
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = "#c53030"}
        onMouseOut={e => e.currentTarget.style.backgroundColor = "#e53e3e"}
      >
        Sign Out
      </button>
    </div>
  );
}

function DropdownPanel({ pathname, items, onClose }: { pathname: string; items: { href: string; label: string }[]; onClose?: () => void; }) {
  return (
    <div style={{
      position: "absolute", top: "calc(100% + 0.75rem)", left: 0,
      background: "var(--background)",
      border: "1px solid rgba(150,150,150,0.2)",
      borderRadius: "12px", padding: "0.5rem",
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      minWidth: "210px", zIndex: 2000,
      display: "flex", flexDirection: "column", gap: "0.1rem"
    }}>
      {items.map(item => (
        <Link key={item.href} href={item.href} onClick={onClose}
          style={{
            display: "block", padding: "0.6rem 0.9rem", borderRadius: "8px",
            textDecoration: "none", fontSize: "0.9rem", fontWeight: 600,
            color: pathname === item.href ? "#0070f3" : "inherit",
            background: pathname === item.href ? "rgba(0,112,243,0.08)" : "transparent",
            transition: "background 0.15s", whiteSpace: "nowrap"
          }}
          onMouseOver={e => { if (pathname !== item.href) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
          onMouseOut={e => { if (pathname !== item.href) e.currentTarget.style.background = "transparent"; }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function DropdownMenu({ label, active, pathname, items }: {
  label: string; active: boolean; pathname: string; items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => { if (timer.current) clearTimeout(timer.current); setOpen(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 200); }}
    >
      <button style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", gap: "0.3rem",
        fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap",
        color: active ? "#0070f3" : "inherit"
      }}>
        {label} ▾
      </button>
      {open && <DropdownPanel pathname={pathname} items={items} onClose={() => setOpen(false)} />}
    </div>
  );
}
