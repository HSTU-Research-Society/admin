"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/resources.module.css";

interface Application {
  id?: string;
  fullName: string;
  department: string;
  batch: string;
  email: string;
  phone: string;
  interestedRole: string;
  skills: string;
  motivation: string;
  previousExperience: string;
  cvLink: string;
  submittedAt?: string;
}

export default function VolunteerApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "volunteer_applications"), orderBy("submittedAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Remove this application from the database?")) {
      try { await deleteDoc(doc(db, "volunteer_applications", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Volunteer Applications</h1>
        <span style={{ color: "#888", fontSize: "0.95rem" }}>{apps.length} application{apps.length !== 1 ? "s" : ""} received</span>
      </header>

      {loading ? <p>Loading applications...</p> : (
        <div className={styles.list}>
          {apps.map(app => (
            <div key={app.id} className={styles.listCard}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(app.id!)} title="Delete application">✕</button>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                <span style={{ background: "rgba(0,112,243,0.1)", color: "#0070f3", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>{app.interestedRole || "Not specified"}</span>
                {app.submittedAt && <span style={{ color: "#aaa", fontSize: "0.8rem", marginLeft: "auto" }}>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>}
              </div>

              <h3 className={styles.listTitle} style={{ paddingRight: "4rem" }}>{app.fullName}</h3>
              <div className={styles.listMeta}>
                <span>🏫 {app.department}</span>
                <span>🎓 Batch: {app.batch}</span>
                <span>✉️ <a href={`mailto:${app.email}`} style={{ color: "#0070f3" }}>{app.email}</a></span>
                {app.phone && <span>📞 {app.phone}</span>}
              </div>

              {/* Expandable details */}
              <button
                onClick={() => setExpanded(expanded === app.id ? null : (app.id ?? null))}
                style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, marginTop: "0.75rem", padding: 0 }}
              >
                {expanded === app.id ? "▲ Hide Details" : "▼ View Full Application"}
              </button>

              {expanded === app.id && (
                <div style={{ marginTop: "1rem", width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <div className={styles.detailLabel} style={{ color: "#888" }}>Skills</div>
                    <p className={styles.listDescription} style={{ margin: 0 }}>{app.skills || "—"}</p>
                  </div>
                  <div>
                    <div className={styles.detailLabel} style={{ color: "#888" }}>Motivation Statement</div>
                    <p className={styles.listDescription} style={{ margin: 0 }}>{app.motivation || "—"}</p>
                  </div>
                  {app.previousExperience && (
                    <div>
                      <div className={styles.detailLabel} style={{ color: "#888" }}>Previous Experience</div>
                      <p className={styles.listDescription} style={{ margin: 0 }}>{app.previousExperience}</p>
                    </div>
                  )}
                  {app.cvLink && (
                    <a href={app.cvLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontWeight: 600, fontSize: "0.9rem" }}>📄 View CV / Resume</a>
                  )}
                </div>
              )}
            </div>
          ))}
          {apps.length === 0 && (
            <div className={styles.emptyState}>No applications received yet. Share the volunteer call to get started!</div>
          )}
        </div>
      )}
    </div>
  );
}
