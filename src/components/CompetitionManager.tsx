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
import styles from "./competitions.module.css";

export interface CompetitionWinner {
  id?: string;
  competitionName: string;
  position: string;
  participants: string;
  institution: string;
  date: string;
  projectTitle: string;
  description: string;
  image: string;
}

const emptyCompetitionMode: CompetitionWinner = {
  competitionName: "",
  position: "",
  participants: "",
  institution: "",
  date: new Date().toISOString().split('T')[0],
  projectTitle: "",
  description: "",
  image: ""
};

export default function CompetitionManager() {
  const [winners, setWinners] = useState<CompetitionWinner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CompetitionWinner>(emptyCompetitionMode);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Sort by date latest first
    const q = query(collection(db, "competition_winners"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWinners: CompetitionWinner[] = [];
      snapshot.forEach((docSnap) => {
        fetchedWinners.push({ id: docSnap.id, ...docSnap.data() } as CompetitionWinner);
      });
      setWinners(fetchedWinners);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching competition winners:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setFormData(emptyCompetitionMode);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (winner: CompetitionWinner) => {
    setFormData(winner);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(emptyCompetitionMode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        const docRef = doc(db, "competition_winners", formData.id);
        await updateDoc(docRef, {
          competitionName: formData.competitionName,
          position: formData.position,
          participants: formData.participants,
          institution: formData.institution,
          date: formData.date,
          projectTitle: formData.projectTitle,
          description: formData.description,
          image: formData.image
        });
      } else {
        // Create new
        await addDoc(collection(db, "competition_winners"), {
          competitionName: formData.competitionName,
          position: formData.position,
          participants: formData.participants,
          institution: formData.institution,
          date: formData.date,
          projectTitle: formData.projectTitle,
          description: formData.description,
          image: formData.image
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving competition winner: ", error);
      alert("Failed to save. Please check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this winner? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "competition_winners", id));
      } catch (error) {
        console.error("Error deleting competition winner: ", error);
        alert("Failed to delete.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Competition Winners</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add Winner
        </button>
      </header>

      {loading ? (
        <p>Loading competition winners...</p>
      ) : (
        <div className={styles.grid}>
          {winners.map((winner) => (
            <div key={winner.id} className={styles.card}>
              <div className={styles.positionBadge}>{winner.position}</div>
              
              <div className={styles.cardActions}>
                <button 
                  className={`${styles.iconButton} ${styles.edit}`} 
                  onClick={() => openEditModal(winner)}
                  title="Edit Winner"
                >
                  ✎
                </button>
                <button 
                  className={`${styles.iconButton} ${styles.delete}`} 
                  onClick={() => handleDelete(winner.id!)}
                  title="Delete Winner"
                >
                  ✕
                </button>
              </div>

              <div className={styles.imageContainer}>
                {winner.image ? (
                  <img src={winner.image} alt={winner.projectTitle} className={styles.profileImage} />
                ) : (
                  <span className={styles.fallbackIcon}>🏅</span>
                )}
              </div>

              <h2 className={styles.name}>{winner.projectTitle}</h2>
              <div className={styles.position} style={{marginBottom: "0.2rem"}}>{winner.participants}</div>
              <div className={styles.term} style={{color: "#888", fontSize: "0.85rem"}}>{new Date(winner.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>

              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Competition</span>
                  <span className={styles.detailValue} style={{fontWeight: 600}}>{winner.competitionName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Hosting Institution</span>
                  <span className={styles.detailValue}>{winner.institution || "-"}</span>
                </div>
              </div>

              {winner.description && (
                <div className={styles.bio}>"{winner.description}"</div>
              )}
            </div>
          ))}
          {winners.length === 0 && <p>No winners found. Add a victory!</p>}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>
              {isEditing ? "Edit Winner" : "Add New Winner"}
            </h2>
            
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Competition Name *</label>
                <input required type="text" name="competitionName" className={styles.input} value={formData.competitionName} onChange={handleChange} placeholder="e.g. NASA Space Apps Challenge" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Position Achieved *</label>
                <select required name="position" className={styles.input} value={formData.position} onChange={handleChange}>
                  <option value="" disabled>Select Position</option>
                  <option value="1st Place (Champion)">1st Place (Champion)</option>
                  <option value="2nd Place (Runner-up)">2nd Place (Runner-up)</option>
                  <option value="3rd Place">3rd Place</option>
                  <option value="Finalist">Finalist</option>
                  <option value="Honorable Mention">Honorable Mention</option>
                  <option value="Winner">Winner</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Participant(s) / Team Name *</label>
                <input required type="text" name="participants" className={styles.input} value={formData.participants} onChange={handleChange} placeholder="e.g. Team Alpha (Alice, Bob)" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Institution Hosting *</label>
                <input required type="text" name="institution" className={styles.input} value={formData.institution} onChange={handleChange} placeholder="e.g. MIT" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Date *</label>
                <input required type="date" name="date" className={styles.input} value={formData.date} onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Project Title *</label>
                <input required type="text" name="projectTitle" className={styles.input} value={formData.projectTitle} onChange={handleChange} placeholder="e.g. AI Crop Prediction" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Image / Team Photo URL</label>
                <input type="url" name="image" className={styles.input} value={formData.image} onChange={handleChange} placeholder="https://imgur.com/..." />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Short Description *</label>
                <textarea required name="description" className={styles.input} value={formData.description} onChange={handleChange} placeholder="Summary of the winning project..." maxLength={200} />
              </div>

              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (isEditing ? "Update Winner" : "Add Winner")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
