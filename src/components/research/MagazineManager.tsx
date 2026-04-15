"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/research.module.css";

interface MagazineIssue {
  id?: string;
  issueTitle: string;
  volumeNumber: string;
  publishDate: string;
  coverImage: string;
  description: string;
  readOnlineLink: string;
  downloadPDF: string;
  year?: string; // archive only
}

const emptyCurrent: MagazineIssue = { issueTitle: "", volumeNumber: "", publishDate: new Date().toISOString().split("T")[0], coverImage: "", description: "", readOnlineLink: "", downloadPDF: "" };
const emptyArchive: MagazineIssue = { issueTitle: "", volumeNumber: "", publishDate: "", coverImage: "", description: "", readOnlineLink: "", downloadPDF: "", year: new Date().getFullYear().toString() };

export default function MagazineManager() {
  const [activeTab, setActiveTab] = useState<"current" | "archive">("current");
  const [current, setCurrent] = useState<MagazineIssue[]>([]);
  const [archive, setArchive] = useState<MagazineIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MagazineIssue>(emptyCurrent);

  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded === 2) setLoading(false); };
    const u1 = onSnapshot(query(collection(db, "magazine_current"), orderBy("publishDate", "desc")), snap => { setCurrent(snap.docs.map(d => ({ id: d.id, ...d.data() } as MagazineIssue))); done(); }, () => done());
    const u2 = onSnapshot(query(collection(db, "magazine_archive"), orderBy("year", "desc")), snap => { setArchive(snap.docs.map(d => ({ id: d.id, ...d.data() } as MagazineIssue))); done(); }, () => done());
    return () => { u1(); u2(); };
  }, []);

  const openAdd = () => { setForm(activeTab === "current" ? emptyCurrent : emptyArchive); setIsEditing(false); setIsModalOpen(true); };
  const openEdit = (item: MagazineIssue) => { setForm(item); setIsEditing(true); setIsModalOpen(true); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const col = activeTab === "current" ? "magazine_current" : "magazine_archive";
    const p = { ...form }; delete (p as any).id;
    try {
      if (isEditing && form.id) await updateDoc(doc(db, col, form.id), p);
      else await addDoc(collection(db, col), p);
      setIsModalOpen(false);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const col = activeTab === "current" ? "magazine_current" : "magazine_archive";
    if (confirm("Delete this issue?")) {
      try { await deleteDoc(doc(db, col, id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  const displayList = activeTab === "current" ? current : archive;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Magazine</h1>
        <button className={styles.addButton} onClick={openAdd}>+ Add Issue</button>
      </header>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "current" ? styles.tabActive : ""}`} onClick={() => setActiveTab("current")}>📰 Current Issue ({current.length})</button>
        <button className={`${styles.tab} ${activeTab === "archive" ? styles.tabActive : ""}`} onClick={() => setActiveTab("archive")}>🗄️ Archive ({archive.length})</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className={styles.magazineGrid}>
          {displayList.map((issue) => (
            <div key={issue.id} className={styles.magazineCover}>
              <div className={styles.magazineCoverActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => openEdit(issue)}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(issue.id!)}>✕</button>
              </div>
              {issue.coverImage
                ? <img src={issue.coverImage} alt={issue.issueTitle} className={styles.magazineCoverImage} />
                : <div className={styles.magazineCoverFallback}>📰</div>
              }
              <div className={styles.magazineCoverInfo}>
                <div className={styles.magazineCoverTitle}>{issue.issueTitle}</div>
                <div className={styles.magazineCoverMeta}>{issue.volumeNumber} {issue.year ? `· ${issue.year}` : issue.publishDate ? `· ${new Date(issue.publishDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })}` : ""}</div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                  {issue.readOnlineLink && <a href={issue.readOnlineLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.8rem", fontWeight: 600 }}>📖 Read</a>}
                  {issue.downloadPDF && <a href={issue.downloadPDF} target="_blank" rel="noreferrer" style={{ color: "#e53e3e", fontSize: "0.8rem", fontWeight: 600 }}>⬇ PDF</a>}
                </div>
              </div>
            </div>
          ))}
          {displayList.length === 0 && <div className={styles.emptyState} style={{ gridColumn: "1/-1" }}>No issues yet. Add one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{isEditing ? "Edit" : "Add"} {activeTab === "current" ? "Current" : "Archive"} Issue</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Issue Title *</label><input required type="text" name="issueTitle" className={styles.input} value={form.issueTitle} onChange={handleChange} placeholder="e.g. HSTU Research Bulletin — Spring" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Volume / Number *</label><input required type="text" name="volumeNumber" className={styles.input} value={form.volumeNumber} onChange={handleChange} placeholder="e.g. Vol. 3, No. 1" /></div>
              {activeTab === "current"
                ? <div className={styles.formGroup}><label className={styles.label}>Publish Date *</label><input required type="date" name="publishDate" className={styles.input} value={form.publishDate} onChange={handleChange} /></div>
                : <div className={styles.formGroup}><label className={styles.label}>Year *</label><input required type="number" name="year" className={styles.input} value={form.year} onChange={handleChange} min="1990" max="2100" /></div>
              }
              <div className={styles.formGroup}><label className={styles.label}>Cover Image URL</label><input type="url" name="coverImage" className={styles.input} value={form.coverImage} onChange={handleChange} placeholder="https://imgur.com/..." /></div>
              <div className={styles.formGroup}><label className={styles.label}>Read Online Link</label><input type="url" name="readOnlineLink" className={styles.input} value={form.readOnlineLink} onChange={handleChange} placeholder="https://..." /></div>
              <div className={styles.formGroup}><label className={styles.label}>Download PDF Link</label><input type="url" name="downloadPDF" className={styles.input} value={form.downloadPDF} onChange={handleChange} placeholder="https://..." /></div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="description" className={styles.input} value={form.description} onChange={handleChange} placeholder="Brief description of this issue's content..." /></div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (isEditing ? "Update Issue" : "Add Issue")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
