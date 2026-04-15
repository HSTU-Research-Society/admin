"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/research.module.css";

interface Publication {
  id?: string;
  title: string;
  authors: string;
  department: string;
  publicationType: string;
  journalConference: string;
  year: string;
  abstract: string;
  doi: string;
  pdfLink: string;
  tags: string;
}

const empty: Publication = {
  title: "", authors: "", department: "", publicationType: "", journalConference: "",
  year: new Date().getFullYear().toString(), abstract: "", doi: "", pdfLink: "", tags: ""
};

export default function PublicationsManager() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Publication>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterTag, setFilterTag] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "publications"), orderBy("year", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as Publication)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const years = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.year))).sort().reverse()], [items]);
  const depts = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.department).filter(Boolean)))], [items]);
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(i => i.tags?.split(",").forEach(t => t.trim() && tagSet.add(t.trim())));
    return ["All", ...Array.from(tagSet).sort()];
  }, [items]);

  const filtered = useMemo(() => items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.title.toLowerCase().includes(q) || i.authors.toLowerCase().includes(q) || i.abstract.toLowerCase().includes(q);
    const matchYear = filterYear === "All" || i.year === filterYear;
    const matchDept = filterDept === "All" || i.department === filterDept;
    const matchTag = filterTag === "All" || i.tags?.toLowerCase().includes(filterTag.toLowerCase());
    return matchSearch && matchYear && matchDept && matchTag;
  }), [items, search, filterYear, filterDept, filterTag]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...formData };
    delete (payload as any).id;
    try {
      if (isEditing && formData.id) await updateDoc(doc(db, "publications", formData.id), payload);
      else await addDoc(collection(db, "publications"), payload);
      setIsModalOpen(false); setFormData(empty);
    } catch (err) { alert("Save failed. Check console."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this publication?")) {
      try { await deleteDoc(doc(db, "publications", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Publications</h1>
        <button className={styles.addButton} onClick={() => { setFormData(empty); setIsEditing(false); setIsModalOpen(true); }}>+ Add Publication</button>
      </header>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search by title, author, abstract..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
          {allTags.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>

      {loading ? <p>Loading...</p> : (
        <div className={styles.list}>
          {filtered.map(item => (
            <div key={item.id} className={styles.listCard}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => { setFormData(item); setIsEditing(true); setIsModalOpen(true); }}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(item.id!)}>✕</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(0,112,243,0.1)", color: "#0070f3", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>{item.publicationType}</span>
                <span style={{ color: "#888", fontSize: "0.85rem" }}>{item.year}</span>
              </div>

              <h3 className={styles.listTitle} style={{ fontSize: "1.15rem", paddingRight: "5.5rem" }}>{item.title}</h3>
              <div className={styles.listMeta}>
                <span>👤 {item.authors}</span>
                {item.department && <span>🏫 {item.department}</span>}
                {item.journalConference && <span>📖 {item.journalConference}</span>}
              </div>

              {item.abstract && (<p className={styles.listDescription}>{item.abstract}</p>)}

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                {item.doi && <a href={item.doi} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600 }}>🔗 DOI / Paper</a>}
                {item.pdfLink && <a href={item.pdfLink} target="_blank" rel="noreferrer" style={{ color: "#e53e3e", fontSize: "0.9rem", fontWeight: 600 }}>📄 PDF</a>}
              </div>

              {item.tags && (
                <div className={styles.tagsContainer}>
                  {item.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className={styles.emptyState}>No publications found. Try adjusting your filters or add one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{isEditing ? "Edit Publication" : "Add Publication"}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Title *</label>
                <input required type="text" name="title" className={styles.input} value={formData.title} onChange={handleChange} placeholder="Full paper title" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Authors *</label>
                <input required type="text" name="authors" className={styles.input} value={formData.authors} onChange={handleChange} placeholder="e.g. John Doe, Jane Smith" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Department *</label>
                <input required type="text" name="department" className={styles.input} value={formData.department} onChange={handleChange} placeholder="e.g. Dept. of CSE" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Publication Type *</label>
                <select required name="publicationType" className={styles.input} value={formData.publicationType} onChange={handleChange}>
                  <option value="" disabled>Select Type</option>
                  <option>Journal Paper</option>
                  <option>Conference Paper</option>
                  <option>Review Article</option>
                  <option>Preprint</option>
                  <option>Student Research Report</option>
                  <option>Book Chapter</option>
                  <option>Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Journal / Conference Name *</label>
                <input required type="text" name="journalConference" className={styles.input} value={formData.journalConference} onChange={handleChange} placeholder="e.g. IEEE Transactions" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Year *</label>
                <input required type="number" name="year" className={styles.input} value={formData.year} onChange={handleChange} min="1990" max="2100" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>DOI / External Link</label>
                <input type="url" name="doi" className={styles.input} value={formData.doi} onChange={handleChange} placeholder="https://doi.org/..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>PDF Link (optional)</label>
                <input type="url" name="pdfLink" className={styles.input} value={formData.pdfLink} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Tags (comma-separated)</label>
                <input type="text" name="tags" className={styles.input} value={formData.tags} onChange={handleChange} placeholder="e.g. AI, Machine Learning, Power Systems" />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Abstract *</label>
                <textarea required name="abstract" className={styles.input} value={formData.abstract} onChange={handleChange} placeholder="Full abstract..." style={{ minHeight: "120px" }} />
              </div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (isEditing ? "Update" : "Add Publication")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
