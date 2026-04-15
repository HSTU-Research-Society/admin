"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/research.module.css";

interface CollabPost {
  id?: string;
  title: string;
  postedBy: string;
  department: string;
  collaborationType: string;
  researchArea: string;
  description: string;
  contactEmail: string;
  date: string;
}

const empty: CollabPost = { title: "", postedBy: "", department: "", collaborationType: "", researchArea: "", description: "", contactEmail: "", date: new Date().toISOString().split("T")[0] };

export default function CollaborationManager() {
  const [items, setItems] = useState<CollabPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CollabPost>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterArea, setFilterArea] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "collaboration_board"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, snap => { setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as CollabPost))); setLoading(false); }, () => setLoading(false));
    return () => unsub();
  }, []);

  const types = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.collaborationType).filter(Boolean)))], [items]);
  const areas = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.researchArea).filter(Boolean)))], [items]);
  const filtered = useMemo(() => items.filter(i => (filterType === "All" || i.collaborationType === filterType) && (filterArea === "All" || i.researchArea === filterArea)), [items, filterType, filterArea]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (isEditing && form.id) await updateDoc(doc(db, "collaboration_board", form.id), p);
      else await addDoc(collection(db, "collaboration_board"), p);
      setIsModalOpen(false); setForm(empty);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this collaboration post?")) {
      try { await deleteDoc(doc(db, "collaboration_board", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  const typeColors: Record<string, string> = {
    "Looking for Collaborators": "#0070f3",
    "Seeking Supervisor": "#7c3aed",
    "Joining Research Team": "#059669",
    "Interdisciplinary Call": "#d97706",
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Collaboration Board</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty); setIsEditing(false); setIsModalOpen(true); }}>+ Post Opportunity</button>
      </header>

      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value)}>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>
        <span style={{ color: "#888", fontSize: "0.9rem", marginLeft: "auto" }}>{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className={styles.list}>
          {filtered.map(item => (
            <div key={item.id} className={styles.listCard}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => { setForm(item); setIsEditing(true); setIsModalOpen(true); }}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(item.id!)}>✕</button>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: `${typeColors[item.collaborationType] || "#888"}22`, color: typeColors[item.collaborationType] || "#888", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>{item.collaborationType}</span>
                {item.researchArea && <span style={{ background: "rgba(0,0,0,0.05)", color: "#555", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem" }}>{item.researchArea}</span>}
                <span style={{ color: "#aaa", fontSize: "0.8rem", marginLeft: "auto" }}>{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>

              <h3 className={styles.listTitle} style={{ paddingRight: "5.5rem" }}>{item.title}</h3>
              <div className={styles.listMeta}>
                <span>👤 {item.postedBy}</span>
                {item.department && <span>🏫 {item.department}</span>}
                {item.contactEmail && <span>✉️ <a href={`mailto:${item.contactEmail}`} style={{ color: "#0070f3" }}>{item.contactEmail}</a></span>}
              </div>
              {item.description && <p className={styles.listDescription}>{item.description}</p>}
            </div>
          ))}
          {filtered.length === 0 && <div className={styles.emptyState}>No collaboration posts yet. Post an opportunity!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{isEditing ? "Edit Post" : "Post Collaboration Opportunity"}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Title *</label><input required type="text" name="title" className={styles.input} value={form.title} onChange={handleChange} placeholder="e.g. Looking for ML experts for Climate Research project" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Posted By *</label><input required type="text" name="postedBy" className={styles.input} value={form.postedBy} onChange={handleChange} placeholder="e.g. Dr. John Doe" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Department *</label><input required type="text" name="department" className={styles.input} value={form.department} onChange={handleChange} placeholder="e.g. Dept. of CSE" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Collaboration Type *</label>
                <select required name="collaborationType" className={styles.input} value={form.collaborationType} onChange={handleChange}>
                  <option value="" disabled>Select Type</option>
                  <option>Looking for Collaborators</option>
                  <option>Seeking Supervisor</option>
                  <option>Joining Research Team</option>
                  <option>Interdisciplinary Call</option>
                </select>
              </div>
              <div className={styles.formGroup}><label className={styles.label}>Research Area *</label><input required type="text" name="researchArea" className={styles.input} value={form.researchArea} onChange={handleChange} placeholder="e.g. Machine Learning, Climate Science" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Contact Email *</label><input required type="email" name="contactEmail" className={styles.input} value={form.contactEmail} onChange={handleChange} placeholder="contact@example.com" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Post Date *</label><input required type="date" name="date" className={styles.input} value={form.date} onChange={handleChange} /></div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Description *</label><textarea required name="description" className={styles.input} value={form.description} onChange={handleChange} placeholder="Describe the opportunity, required skills, and how to apply..." style={{ minHeight: "120px" }} /></div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (isEditing ? "Update Post" : "Post Opportunity")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
