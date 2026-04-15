"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "./research.module.css";

export interface ResearchAchievement {
  id?: string;
  title: string;
  researcherName: string;
  department: string;
  achievementType: string;
  journalConference: string;
  year: string;
  summary: string;
  thumbnail: string;
  externalLink: string;
}

const emptyResearch: ResearchAchievement = {
  title: "",
  researcherName: "",
  department: "",
  achievementType: "",
  journalConference: "",
  year: new Date().getFullYear().toString(),
  summary: "",
  thumbnail: "",
  externalLink: ""
};

export default function ResearchManager() {
  const [items, setItems] = useState<ResearchAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ResearchAchievement>(emptyResearch);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "research_achievements"), orderBy("year", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ResearchAchievement[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as ResearchAchievement);
      });
      setItems(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching research achievements:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => { setFormData(emptyResearch); setIsEditing(false); setIsModalOpen(true); };
  const openEditModal = (item: ResearchAchievement) => { setFormData(item); setIsEditing(true); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setFormData(emptyResearch); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        researcherName: formData.researcherName,
        department: formData.department,
        achievementType: formData.achievementType,
        journalConference: formData.journalConference,
        year: formData.year,
        summary: formData.summary,
        thumbnail: formData.thumbnail,
        externalLink: formData.externalLink
      };
      if (isEditing && formData.id) {
        await updateDoc(doc(db, "research_achievements", formData.id), payload);
      } else {
        await addDoc(collection(db, "research_achievements"), payload);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving research achievement:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this research achievement? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "research_achievements", id));
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Research Achievements</h1>
        <button className={styles.addButton} onClick={openAddModal}>+ Add Research</button>
      </header>

      {loading ? (
        <p>Loading research achievements...</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.positionBadge}>{item.achievementType}</div>

              <div className={styles.cardActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => openEditModal(item)} title="Edit">✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(item.id!)} title="Delete">✕</button>
              </div>

              <div className={styles.imageContainer}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className={styles.profileImage} />
                ) : (
                  <span className={styles.fallbackIcon}>📄</span>
                )}
              </div>

              <h2 className={styles.name}>{item.title}</h2>
              <div className={styles.position} style={{ marginBottom: "0.2rem" }}>{item.researcherName}</div>
              <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{item.year}</div>

              <div style={{ marginTop: "1rem", width: "100%" }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Department</span>
                  <span className={styles.detailValue}>{item.department || "-"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Journal / Conference</span>
                  <span className={styles.detailValue} style={{ fontWeight: 600 }}>{item.journalConference || "-"}</span>
                </div>
                {item.externalLink && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Paper / DOI</span>
                    <span className={styles.detailValue}>
                      <a href={item.externalLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3" }}>View Paper →</a>
                    </span>
                  </div>
                )}
              </div>

              {item.summary && (
                <div className={styles.bio} style={{ textAlign: "left", fontStyle: "normal", lineHeight: "1.6" }}>
                  {item.summary}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p>No research found. Add a publication or achievement!</p>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>{isEditing ? "Edit Research" : "Add Research Achievement"}</h2>

            <form onSubmit={handleSubmit} className={styles.formGrid}>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Title *</label>
                <input required type="text" name="title" className={styles.input} value={formData.title} onChange={handleChange} placeholder="e.g. Deep Learning for Crop Disease Detection" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Researcher Name *</label>
                <input required type="text" name="researcherName" className={styles.input} value={formData.researcherName} onChange={handleChange} placeholder="e.g. Dr. John Doe" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Department *</label>
                <input required type="text" name="department" className={styles.input} value={formData.department} onChange={handleChange} placeholder="e.g. Dept. of CSE" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Achievement Type *</label>
                <select required name="achievementType" className={styles.input} value={formData.achievementType} onChange={handleChange}>
                  <option value="" disabled>Select Type</option>
                  <option value="Journal Publication">Journal Publication</option>
                  <option value="Conference Paper">Conference Paper</option>
                  <option value="Book Chapter">Book Chapter</option>
                  <option value="Patent">Patent</option>
                  <option value="Research Grant">Research Grant</option>
                  <option value="Thesis">Thesis</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Journal / Conference Name *</label>
                <input required type="text" name="journalConference" className={styles.input} value={formData.journalConference} onChange={handleChange} placeholder="e.g. IEEE Transactions on AI" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Year *</label>
                <input required type="number" name="year" className={styles.input} value={formData.year} onChange={handleChange} placeholder="e.g. 2025" min="1990" max="2100" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Thumbnail Image URL</label>
                <input type="url" name="thumbnail" className={styles.input} value={formData.thumbnail} onChange={handleChange} placeholder="https://imgur.com/..." />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>External Link (Paper / DOI)</label>
                <input type="url" name="externalLink" className={styles.input} value={formData.externalLink} onChange={handleChange} placeholder="https://doi.org/..." />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Summary (2–3 paragraphs) *</label>
                <textarea required name="summary" className={styles.input} value={formData.summary} onChange={handleChange} placeholder="Describe the research, methodology, and impact..." style={{ minHeight: "140px" }} />
              </div>

              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (isEditing ? "Update Research" : "Add Research")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
