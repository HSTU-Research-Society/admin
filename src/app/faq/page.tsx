"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/resources.module.css";

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const empty: FAQ = { question: "", answer: "", category: "General", order: 0 };

const CATEGORIES = ["All", "General", "Membership", "Research", "Events", "Certificates"];

const categoryColors: Record<string, string> = {
  "Membership":   "#0070f3",
  "Research":     "#7c3aed",
  "Events":       "#059669",
  "Certificates": "#d97706",
  "General":      "#555",
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FAQ>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null); // accordion state

  useEffect(() => {
    const q = query(collection(db, "faqs"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, snap => {
      setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQ)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const displayed = useMemo(() =>
    filterCategory === "All" ? faqs : faqs.filter(f => f.category === filterCategory),
    [faqs, filterCategory]
  );

  // Group by category for display
  const grouped = useMemo(() => {
    if (filterCategory !== "All") return { [filterCategory]: displayed };
    return displayed.reduce<Record<string, FAQ[]>>((acc, faq) => {
      (acc[faq.category] = acc[faq.category] || []).push(faq);
      return acc;
    }, {});
  }, [displayed, filterCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "order" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (editId) await updateDoc(doc(db, "faqs", editId), p);
      else await addDoc(collection(db, "faqs"), p);
      setIsModalOpen(false); setForm(empty); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this FAQ?")) {
      try { await deleteDoc(doc(db, "faqs", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  const openEdit = (faq: FAQ) => {
    setForm(faq); setEditId(faq.id!); setIsModalOpen(true);
  };

  return (
    <div className={styles.container} style={{ maxWidth: "860px" }}>
      <header className={styles.header}>
        <h1 className={styles.title}>FAQ Manager</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty); setEditId(null); setIsModalOpen(true); }}>
          + Add Question
        </button>
      </header>

      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)} style={{
            padding: "0.45rem 1.1rem", borderRadius: "20px", border: "none",
            cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
            background: filterCategory === cat ? "#0070f3" : "rgba(0,0,0,0.06)",
            color: filterCategory === cat ? "#fff" : "inherit",
            transition: "all 0.15s"
          }}>
            {cat} {cat !== "All" && <span style={{ opacity: 0.7 }}>({faqs.filter(f => f.category === cat).length})</span>}
          </button>
        ))}
        <span style={{ marginLeft: "auto", color: "#888", fontSize: "0.9rem", alignSelf: "center" }}>
          {displayed.length} question{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? <p>Loading FAQs...</p> : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: "2.5rem" }}>
            {filterCategory === "All" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{
                  background: `${categoryColors[cat] || "#555"}18`,
                  color: categoryColors[cat] || "#555",
                  padding: "0.3rem 0.9rem", borderRadius: "20px",
                  fontSize: "0.85rem", fontWeight: 700
                }}>{cat}</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.08)" }} />
                <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{items.length} question{items.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Accordion */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {items.map(faq => (
                <div key={faq.id} style={{
                  background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                  borderRadius: "14px", overflow: "hidden",
                  border: openId === faq.id
                    ? `1px solid ${categoryColors[faq.category] || "#0070f3"}40`
                    : "1px solid rgba(0,0,0,0.07)",
                  boxShadow: openId === faq.id ? `0 4px 20px ${categoryColors[faq.category] || "#0070f3"}15` : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.25s ease"
                }}>
                  {/* Question row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "1rem 1.25rem", cursor: "pointer",
                    userSelect: "none"
                  }} onClick={() => setOpenId(openId === faq.id ? null : (faq.id ?? null))}>
                    <span style={{ fontWeight: 700, color: categoryColors[faq.category] || "#555", fontSize: "1.1rem", minWidth: "20px" }}>
                      {openId === faq.id ? "−" : "+"}
                    </span>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "1rem", flex: 1 }}>{faq.question}</p>
                    <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.72rem", color: "#bbb", marginRight: "0.4rem" }}>#{faq.order}</span>
                      <button className={`${styles.iconButton} ${styles.edit}`}
                        onClick={e => { e.stopPropagation(); openEdit(faq); }} title="Edit">✎</button>
                      <button className={`${styles.iconButton} ${styles.delete}`}
                        onClick={e => { e.stopPropagation(); handleDelete(faq.id!); }} title="Delete">✕</button>
                    </div>
                  </div>

                  {/* Answer (accordion body) */}
                  {openId === faq.id && (
                    <div style={{
                      padding: "0 1.25rem 1.25rem 3.35rem",
                      fontSize: "0.95rem", lineHeight: 1.7, color: "#555",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      paddingTop: "1rem", marginTop: "0"
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {displayed.length === 0 && !loading && (
        <div className={styles.emptyState}>No FAQ entries for this category. Add one!</div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit FAQ" : "Add FAQ"}</h2>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Question *</label>
                <input required type="text" name="question" className={styles.input}
                  value={form.question} onChange={handleChange}
                  placeholder="e.g. How do I become a member of HSTURS?" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category *</label>
                <select required name="category" className={styles.input} value={form.category} onChange={handleChange}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Display Order</label>
                <input type="number" name="order" className={styles.input}
                  value={form.order} onChange={handleChange}
                  placeholder="e.g. 1 (lower = shown first)" min="0" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Answer *</label>
                <textarea required name="answer" className={styles.input}
                  value={form.answer} onChange={handleChange}
                  placeholder="Write the full answer here..."
                  style={{ minHeight: "140px" }} />
              </div>

              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (editId ? "Update FAQ" : "Add FAQ")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
