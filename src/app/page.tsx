import Link from "next/link";
import styles from "./dashboard.module.css";

export default function AdminDashboard() {
  const sections = [
    {
      title: "Leadership",
      icon: "👥",
      items: [
        { href: "/executive-committee", label: "Executive Committee" },
        { href: "/advisory-board", label: "Advisory Board" },
        { href: "/alumni-association", label: "Alumni Association" },
        { href: "/mentor-panel", label: "Mentor Panel" },
      ]
    },
    {
      title: "Accomplishments",
      icon: "🏆",
      items: [
        { href: "/awards", label: "Awards & Recognition" },
        { href: "/competition-winners", label: "Competition Winners" },
        { href: "/research-achievements", label: "Research Achievements" },
      ]
    },
    {
      title: "Research Hub",
      icon: "🔬",
      items: [
        { href: "/research/publications", label: "Publications" },
        { href: "/research/projects", label: "Active Projects" },
        { href: "/research/magazine", label: "Society Magazine" },
        { href: "/research/collaboration", label: "Collaboration Board" },
      ]
    },
    {
      title: "Resources & Library",
      icon: "📚",
      items: [
        { href: "/resources/library/books", label: "Books & Literature" },
        { href: "/resources/library/papers", label: "Academic Papers" },
        { href: "/resources/library/lecture-notes", label: "Lecture Notes" },
        { href: "/resources/opportunities/scholarships", label: "Scholarships" },
      ]
    },
    {
      title: "Media & Blog",
      icon: "📰",
      items: [
        { href: "/media/blog/research-articles", label: "Research Articles" },
        { href: "/media/blog/tutorials", label: "Tutorials" },
        { href: "/media/gallery/albums", label: "Photo Albums" },
        { href: "/media/gallery/videos", label: "Video Gallery" },
      ]
    },
    {
      title: "Community & Events",
      icon: "🤝",
      items: [
        { href: "/events/upcoming", label: "Upcoming Events" },
        { href: "/events/reports", label: "Event Reports" },
        { href: "/community/notices", label: "Official Notices" },
        { href: "/community/volunteer/applications", label: "Volunteer Applications" },
      ]
    },
    {
      title: "Verification",
      icon: "✅",
      items: [
        { href: "/verification/membership", label: "Membership Verification" },
        { href: "/verification/certificate", label: "Certificate Issuance" },
        { href: "/verification/volunteership", label: "Volunteership Status" },
      ]
    },
    {
      title: "General",
      icon: "⚙️",
      items: [
        { href: "/faq", label: "Manage FAQs" },
        { href: "/resources/downloads", label: "Manage Downloads" },
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Control Center</h1>
        <p>Manage all society information, resources, and community engagement from one central hub.</p>
      </header>

      <div className={styles.grid}>
        {sections.map((section) => (
          <div key={section.title} className={styles.categoryCard}>
            <div className={styles.categoryIcon}>{section.icon}</div>
            <h2 className={styles.categoryTitle}>{section.title}</h2>
            <div className={styles.links}>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} className={styles.manageLink}>
                  {item.label}
                  <span>Manage →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
