"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/resources.module.css";

interface Notice {
  id?: string;
  title: string;
  category: string;
  description: string;
  date: string;
  attachment: string;
  important: string; // "Yes" | "No"
}

const empty: Notice = {
  title: "", category: "", description: "",
  date: new Date().toISOString().split("T")[0], attachment: "", important: "No"
};

const categoryColors: Record<string, string> = {
  "General":     "#555",
  "Event":       "#059669",
  "Recruitment": "#7c3aed",
  "Deadline":    "#dc2626",
  "Call for Papers": "#d97706",
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Notice>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    // Fetch by date desc; we sort Important to top client-side
    const q = query(collection(db, "notices"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, snap => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  // Client-side: Important notices pinned first, then by date desc (already sorted)
  const sorted = useMemo(() => {
    const list = filterCategory === "All" ? notices : notices.filter(n => n.category === filterCategory);
    return [...list].sort((a, b) => {
      if (a.important === "Yes" && b.important !== "Yes") return -1;
      if (a.important !== "Yes" && b.important === "Yes") return 1;
      return 0; // keep Firestore date order otherwise
    });
  }, [notices, filterCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (editId) await updateDoc(doc(db, "notices", editId), p);
      else await addDoc(collection(db, "notices"), p);
      setIsModalOpen(false); setForm(empty); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this notice?")) {
      try { await deleteDoc(doc(db, "notices", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Notices</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty); setEditId(null); setIsModalOpen(true); }}>+ Post Notice</button>
      </header>

      <div className={styles.toolbar}>
        {["All", "General", "Event", "Recruitment", "Deadline", "Call for Papers"].map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)} style={{
            padding: "0.45rem 1rem", borderRadius: "20px", border: "none",
            cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
            background: filterCategory === cat ? "#0070f3" : "rgba(0,0,0,0.06)",
            color: filterCategory === cat ? "#fff" : "inherit",
            transition: "all 0.15s"
          }}>{cat}</button>
        ))}
      </div>

      {loading ? <p>Loading notices...</p> : (
        <div className={styles.list}>
          {sorted.map(notice => (
            <div key={notice.id} className={styles.listCard} style={{
              borderLeft: notice.important === "Yes" ? "4px solid #dc2626" : "4px solid transparent",
              background: notice.important === "Yes"
                ? "rgba(220,38,38,0.03)"
                : undefined
            }}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => { setForm(notice); setEditId(notice.id!); setIsModalOpen(true); }}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(notice.id!)}>✕</button>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.4rem" }}>
                {notice.important === "Yes" && (
                  <span style={{ background: "#dc2626", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.5px" }}>📌 IMPORTANT</span>
                )}
                <span style={{
                  background: `${categoryColors[notice.category] || "#555"}18`,
                  color: categoryColors[notice.category] || "#555",
                  padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700
                }}>{notice.category}</span>
                <span style={{ color: "#aaa", fontSize: "0.82rem", marginLeft: "auto" }}>
                  {new Date(notice.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <h3 className={styles.listTitle} style={{ paddingRight: "5.5rem" }}>{notice.title}</h3>

              {notice.description && <p className={styles.listDescription}>{notice.description}</p>}

              {notice.attachment && (
                <a href={notice.attachment} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600, marginTop: "0.75rem", display: "inline-block" }}>
                  📎 View Attachment
                </a>
              )}
            </div>
          ))}
          {sorted.length === 0 && <div className={styles.emptyState}>No notices yet. Post an announcement!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit Notice" : "Post Notice"}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Title *</label>
                <input required type="text" name="title" className={styles.input} value={form.title} onChange={handleChange} placeholder="e.g. Upcoming Meeting — Research Society Executive Committee" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category *</label>
                <select required name="category" className={styles.input} value={form.category} onChange={handleChange}>
                  <option value="" disabled>Select Category</option>
                  <option>General</option><option>Event</option>
                  <option>Recruitment</option><option>Deadline</option><option>Call for Papers</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date *</label>
                <input required type="date" name="date" className={styles.input} value={form.date} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mark as Important?</label>
                <select name="important" className={styles.input} value={form.important} onChange={handleChange}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Attachment URL (optional)</label>
                <input type="url" name="attachment" className={styles.input} value={form.attachment} onChange={handleChange} placeholder="https://drive.google.com/..." />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Description *</label>
                <textarea required name="description" className={styles.input} value={form.description} onChange={handleChange} placeholder="Full notice details..." style={{ minHeight: "120px" }} />
              </div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (editId ? "Update Notice" : "Post Notice")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
