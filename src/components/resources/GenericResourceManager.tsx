"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/resources.module.css";

// ─── Field definition ───────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "url" | "email" | "date" | "number" | "select";
export type DisplayRole = "title" | "badge" | "meta" | "description" | "link" | "none";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];        // for select
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  display?: DisplayRole;     // how it appears on the card  (default: "meta")
  linkLabel?: string;        // custom label if display = "link"
}

export interface ResourceConfig {
  pageTitle: string;
  addButtonLabel?: string;
  collectionName: string;
  sortField: string;
  sortDir?: "asc" | "desc";
  searchFields?: string[];   // fields to search over
  fields: FieldDef[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────

type RecordData = Record<string, string>;

function buildEmpty(fields: FieldDef[]): RecordData {
  const obj: RecordData = {};
  fields.forEach(f => {
    if (f.type === "date") obj[f.name] = new Date().toISOString().split("T")[0];
    else if (f.type === "number") obj[f.name] = "";
    else obj[f.name] = "";
  });
  return obj;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function GenericResourceManager({ config }: { config: ResourceConfig }) {
  const { pageTitle, addButtonLabel = "+ Add Entry", collectionName, sortField, sortDir = "desc", searchFields = [], fields } = config;

  const [items, setItems] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<RecordData>(buildEmpty(fields));
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy(sortField, sortDir));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as RecordData)));
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, [collectionName, sortField, sortDir]);

  const filtered = useMemo(() => {
    if (!search.trim() || searchFields.length === 0) return items;
    const sq = search.toLowerCase();
    return items.filter(item => searchFields.some(f => item[f]?.toLowerCase().includes(sq)));
  }, [items, search, searchFields]);

  const openAdd = () => { setForm(buildEmpty(fields)); setEditId(null); setIsModalOpen(true); };
  const openEdit = (item: RecordData) => { setForm({ ...item }); setEditId(item.id || null); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setForm(buildEmpty(fields)); setEditId(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload: RecordData = {};
    fields.forEach(f => { payload[f.name] = form[f.name] || ""; });
    try {
      if (editId) await updateDoc(doc(db, collectionName, editId), payload);
      else await addDoc(collection(db, collectionName), payload);
      closeModal();
    } catch (err) { alert("Save failed. Check console."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    try { await deleteDoc(doc(db, collectionName, id)); }
    catch (err) { alert("Delete failed."); console.error(err); }
  };

  // ─── Categorised field lists for card rendering ──────────────────────────
  const titleField = fields.find(f => f.display === "title");
  const badgeFields = fields.filter(f => f.display === "badge");
  const metaFields = fields.filter(f => !f.display || f.display === "meta");
  const descField = fields.find(f => f.display === "description");
  const linkFields = fields.filter(f => f.display === "link");

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <button className={styles.addButton} onClick={openAdd}>{addButtonLabel}</button>
      </header>

      {searchFields.length > 0 && (
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder={`Search ${pageTitle.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ color: "#888", fontSize: "0.9rem" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className={styles.list}>
          {filtered.map(item => (
            <div key={item.id} className={styles.listCard}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => openEdit(item)}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(item.id!)}>✕</button>
              </div>

              {/* Badges */}
              {badgeFields.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                  {badgeFields.map(f => item[f.name] && (
                    <span key={f.name} style={{
                      background: "rgba(0,112,243,0.1)", color: "#0070f3",
                      padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700
                    }}>{item[f.name]}</span>
                  ))}
                </div>
              )}

              {/* Primary title */}
              {titleField && <h3 className={styles.listTitle} style={{ paddingRight: "5.5rem" }}>{item[titleField.name]}</h3>}

              {/* Meta info row */}
              {metaFields.length > 0 && (
                <div className={styles.listMeta}>
                  {metaFields.filter(f => item[f.name]).map(f => (
                    <span key={f.name}><strong style={{ color: "#777" }}>{f.label}:</strong> {item[f.name]}</span>
                  ))}
                </div>
              )}

              {/* Description */}
              {descField && item[descField.name] && (
                <p className={styles.listDescription}>{item[descField.name]}</p>
              )}

              {/* Links */}
              {linkFields.length > 0 && (
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                  {linkFields.filter(f => item[f.name]).map(f => (
                    <a key={f.name} href={item[f.name]} target="_blank" rel="noreferrer"
                      style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600 }}>
                      🔗 {f.linkLabel || f.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.emptyState}>No entries yet. {addButtonLabel}!</div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit" : addButtonLabel.replace("+", "Add")} — {pageTitle}</h2>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              {fields.map(f => (
                <div key={f.name} className={`${styles.formGroup} ${f.fullWidth ? styles.fullWidth : ""}`}>
                  <label className={styles.label}>{f.label}{f.required ? " *" : ""}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      name={f.name} required={f.required}
                      className={styles.input} value={form[f.name] || ""}
                      onChange={handleChange} placeholder={f.placeholder}
                      style={{ minHeight: "100px" }}
                    />
                  ) : f.type === "select" ? (
                    <select name={f.name} required={f.required} className={styles.input} value={form[f.name] || ""} onChange={handleChange}>
                      <option value="" disabled>Select {f.label}</option>
                      {f.options?.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type} name={f.name} required={f.required}
                      className={styles.input} value={form[f.name] || ""}
                      onChange={handleChange} placeholder={f.placeholder}
                    />
                  )}
                </div>
              ))}
              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (editId ? "Update" : "Save")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
