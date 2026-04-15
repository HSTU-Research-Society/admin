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
import styles from "./awards.module.css";

export interface Award {
  id?: string;
  title: string;
  recipient: string;
  organization: string;
  date: string;
  category: string;
  description: string;
  image: string;
  externalLink: string;
}

const emptyAward: Award = {
  title: "",
  recipient: "",
  organization: "",
  date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  category: "",
  description: "",
  image: "",
  externalLink: ""
};

export default function AwardsManager() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Award>(emptyAward);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Sort by date descending (newest first)
    const q = query(collection(db, "awards"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAwards: Award[] = [];
      snapshot.forEach((docSnap) => {
        fetchedAwards.push({ id: docSnap.id, ...docSnap.data() } as Award);
      });
      setAwards(fetchedAwards);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching awards:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setFormData(emptyAward);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (award: Award) => {
    setFormData(award);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(emptyAward);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditing && formData.id) {
        // Update existing
        const awardRef = doc(db, "awards", formData.id);
        await updateDoc(awardRef, {
          title: formData.title,
          recipient: formData.recipient,
          organization: formData.organization,
          date: formData.date,
          category: formData.category,
          description: formData.description,
          image: formData.image,
          externalLink: formData.externalLink
        });
      } else {
        // Create new
        await addDoc(collection(db, "awards"), {
          title: formData.title,
          recipient: formData.recipient,
          organization: formData.organization,
          date: formData.date,
          category: formData.category,
          description: formData.description,
          image: formData.image,
          externalLink: formData.externalLink
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving award: ", error);
      alert("Failed to save award. Please check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this award? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "awards", id));
      } catch (error) {
        console.error("Error deleting award: ", error);
        alert("Failed to delete award.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Awards</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add Award
        </button>
      </header>

      {loading ? (
        <p>Loading awards...</p>
      ) : (
        <div className={styles.grid}>
          {awards.map((award) => (
            <div key={award.id} className={styles.card}>
              {award.category && (
                <div className={styles.positionBadge}>{award.category}</div>
              )}
              
              <div className={styles.cardActions}>
                <button 
                  className={`${styles.iconButton} ${styles.edit}`} 
                  onClick={() => openEditModal(award)}
                  title="Edit Award"
                >
                  ✎
                </button>
                <button 
                  className={`${styles.iconButton} ${styles.delete}`} 
                  onClick={() => handleDelete(award.id!)}
                  title="Delete Award"
                >
                  ✕
                </button>
              </div>

              <div className={styles.imageContainer}>
                {award.image ? (
                  <img src={award.image} alt={award.title} className={styles.profileImage} />
                ) : (
                  <span className={styles.fallbackIcon}>🏆</span>
                )}
              </div>

              <h2 className={styles.name}>{award.title}</h2>
              <div className={styles.position} style={{marginBottom: "0.2rem"}}>{award.recipient}</div>
              <div className={styles.term} style={{color: "#888", fontSize: "0.85rem"}}>{new Date(award.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>

              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Awarding Org.</span>
                  <span className={styles.detailValue} style={{fontWeight: 600}}>{award.organization || "-"}</span>
                </div>
                {award.externalLink && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>External Link</span>
                    <span className={styles.detailValue}>
                      <a href={award.externalLink} target="_blank" rel="noreferrer" style={{color: '#0070f3'}}>View More Info</a>
                    </span>
                  </div>
                )}
              </div>

              {award.description && (
                <div className={styles.bio}>"{award.description}"</div>
              )}
            </div>
          ))}
          {awards.length === 0 && <p>No awards found. Add an achievement!</p>}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>
              {isEditing ? "Edit Award" : "Add New Award"}
            </h2>
            
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Title of Award *</label>
                <input required type="text" name="title" className={styles.input} value={formData.title} onChange={handleChange} placeholder="e.g. Best Research Paper" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recipient Name (or Team) *</label>
                <input required type="text" name="recipient" className={styles.input} value={formData.recipient} onChange={handleChange} placeholder="e.g. John Doe / Alpha Team" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Awarding Organization *</label>
                <input required type="text" name="organization" className={styles.input} value={formData.organization} onChange={handleChange} placeholder="e.g. IEEE" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Date Received *</label>
                <input required type="date" name="date" className={styles.input} value={formData.date} onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <input type="text" name="category" className={styles.input} value={formData.category} onChange={handleChange} placeholder="e.g. Technology, Science (Optional)" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Image / Certificate URL</label>
                <input type="url" name="image" className={styles.input} value={formData.image} onChange={handleChange} placeholder="https://imgur.com/..." />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>External Link</label>
                <input type="url" name="externalLink" className={styles.input} value={formData.externalLink} onChange={handleChange} placeholder="e.g. https://news-press.com/article" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Short Description *</label>
                <textarea required name="description" className={styles.input} value={formData.description} onChange={handleChange} placeholder="Brief summary of the achievement..." maxLength={200} />
              </div>

              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (isEditing ? "Update Award" : "Add Award")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
