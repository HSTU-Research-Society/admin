"use client";

import { useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/media.module.css";

interface Partner {
  id?: string;
  orgName: string;
  logo: string;
  description: string;
  websiteLink: string;
  partnershipType: string;
  since: string;
}

const empty: Partner = { orgName: "", logo: "", description: "", websiteLink: "", partnershipType: "", since: "" };

export default function PartnerOrgsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partner>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "partnerships_orgs"), orderBy("orgName", "asc"));
    const unsub = onSnapshot(q, snap => {
      setPartners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Partner)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (editId) await updateDoc(doc(db, "partnerships_orgs", editId), p);
      else await addDoc(collection(db, "partnerships_orgs"), p);
      setIsModalOpen(false); setForm(empty); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this partner?")) {
      try { await deleteDoc(doc(db, "partnerships_orgs", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Partner Organizations</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty); setEditId(null); setIsModalOpen(true); }}>+ Add Partner</button>
      </header>

      {loading ? <p>Loading partners...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {partners.map(p => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
              borderRadius: "16px", padding: "1.5rem", textAlign: "center",
              border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              transition: "transform 0.2s, box-shadow 0.2s", position: "relative"
            }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
            >
              {/* Actions */}
              <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", display: "flex", gap: "0.4rem", opacity: 0, transition: "opacity 0.2s" }}
                onMouseOver={e => e.currentTarget.style.opacity = "1"}
                onMouseOut={e => e.currentTarget.style.opacity = "0"}
              >
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => { setForm(p); setEditId(p.id!); setIsModalOpen(true); }}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(p.id!)}>✕</button>
              </div>
              {/* Logo */}
              {p.logo
                ? <img src={p.logo} alt={p.orgName} style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "12px", marginBottom: "0.75rem" }} />
                : <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea, #764ba2)", margin: "0 auto 0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🤝</div>
              }
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.3rem" }}>{p.orgName}</div>
              {p.partnershipType && <span style={{ background: "rgba(0,112,243,0.1)", color: "#0070f3", padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{p.partnershipType}</span>}
              {p.since && <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "0.3rem" }}>Since {p.since}</div>}
              {p.description && <p style={{ fontSize: "0.82rem", color: "#666", marginTop: "0.6rem", lineHeight: 1.5 }}>{p.description}</p>}
              {p.websiteLink && <a href={p.websiteLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "0.6rem", color: "#0070f3", fontSize: "0.85rem", fontWeight: 600 }}>🔗 Visit</a>}
            </div>
          ))}
          {partners.length === 0 && <div className={styles.emptyState} style={{ gridColumn: "1/-1" }}>No partners yet. Add one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit Partner" : "Add Partner Organization"}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Organization Name *</label><input required type="text" name="orgName" className={styles.input} value={form.orgName} onChange={handleChange} placeholder="e.g. IEEE Bangladesh Section" /></div>
              <div className={styles.formGroup}><label className={styles.label}>Logo URL</label><input type="url" name="logo" className={styles.input} value={form.logo} onChange={handleChange} placeholder="https://imgur.com/..." /></div>
              <div className={styles.formGroup}><label className={styles.label}>Website</label><input type="url" name="websiteLink" className={styles.input} value={form.websiteLink} onChange={handleChange} placeholder="https://www.org.com" /></div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Partnership Type *</label>
                <select required name="partnershipType" className={styles.input} value={form.partnershipType} onChange={handleChange}>
                  <option value="" disabled>Select Type</option>
                  <option>Research Society</option><option>NGO</option><option>Tech Company</option>
                  <option>Academic Body</option><option>Government</option><option>Other</option>
                </select>
              </div>
              <div className={styles.formGroup}><label className={styles.label}>Since Year</label><input type="text" name="since" className={styles.input} value={form.since} onChange={handleChange} placeholder="e.g. 2022" /></div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="description" className={styles.input} value={form.description} onChange={handleChange} placeholder="Brief description of the partnership..." /></div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (editId ? "Update" : "Add Partner")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
