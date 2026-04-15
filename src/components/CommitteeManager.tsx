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
import styles from "./committee.module.css";

export interface CommitteeMember {
  id?: string;
  photo: string;
  fullName: string;
  position: string;
  positionId: number;
  degree: string;
  session: string;
  email: string;
  linkedIn: string;
  bio: string;
  termYear: string;
}

const emptyMember: CommitteeMember = {
  photo: "",
  fullName: "",
  position: "",
  positionId: 100,
  degree: "",
  session: "",
  email: "",
  linkedIn: "",
  bio: "",
  termYear: "2025-26"
};

interface CommitteeManagerProps {
  title: string;
  collectionName: string;
}

export default function CommitteeManager({ title, collectionName }: CommitteeManagerProps) {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CommitteeMember>(emptyMember);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("positionId", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMembers: CommitteeMember[] = [];
      snapshot.forEach((docSnap) => {
        fetchedMembers.push({ id: docSnap.id, ...docSnap.data() } as CommitteeMember);
      });
      setMembers(fetchedMembers);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName} members:`, error);
      // Fallback in case rules aren't set correctly yet, avoid infinite load state
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const openAddModal = () => {
    setFormData(emptyMember);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (member: CommitteeMember) => {
    setFormData(member);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(emptyMember);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "positionId" ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditing && formData.id) {
        // Update existing member
        const memberRef = doc(db, collectionName, formData.id);
        await updateDoc(memberRef, {
          photo: formData.photo,
          fullName: formData.fullName,
          position: formData.position,
          positionId: Number(formData.positionId),
          degree: formData.degree,
          session: formData.session,
          email: formData.email,
          linkedIn: formData.linkedIn,
          bio: formData.bio,
          termYear: formData.termYear
        });
      } else {
        // Create new member
        await addDoc(collection(db, collectionName), {
          photo: formData.photo,
          fullName: formData.fullName,
          position: formData.position,
          positionId: Number(formData.positionId),
          degree: formData.degree,
          session: formData.session,
          email: formData.email,
          linkedIn: formData.linkedIn,
          bio: formData.bio,
          termYear: formData.termYear
        });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving member: ", error);
      alert("Failed to save member. Please check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this member? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        console.error("Error deleting member: ", error);
        alert("Failed to delete member.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          + Add Member
        </button>
      </header>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div className={styles.grid}>
          {members.map((member) => (
            <div key={member.id} className={styles.card}>
              <div className={styles.positionBadge}>{member.position}</div>
              
              <div className={styles.cardActions}>
                <button 
                  className={`${styles.iconButton} ${styles.edit}`} 
                  onClick={() => openEditModal(member)}
                  title="Edit Member"
                >
                  ✎
                </button>
                <button 
                  className={`${styles.iconButton} ${styles.delete}`} 
                  onClick={() => handleDelete(member.id!)}
                  title="Delete Member"
                >
                  ✕
                </button>
              </div>

              <div className={styles.imageContainer}>
                {member.photo ? (
                  <img src={member.photo} alt={member.fullName} className={styles.profileImage} />
                ) : (
                  <span className={styles.fallbackIcon}>👤</span>
                )}
              </div>

              <h2 className={styles.name}>{member.fullName}</h2>
              <div className={styles.term}>{member.termYear}</div>

              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Degree</span>
                  <span className={styles.detailValue}>{member.degree || "-"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Session</span>
                  <span className={styles.detailValue}>{member.session || "-"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{member.email || "-"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>LinkedIn</span>
                  <span className={styles.detailValue}>
                    {member.linkedIn ? (
                      <a href={member.linkedIn} target="_blank" rel="noreferrer" style={{color: '#0070f3'}}>View Profile</a>
                    ) : "-"}
                  </span>
                </div>
              </div>

              {member.bio && (
                <div className={styles.bio}>"{member.bio}"</div>
              )}
            </div>
          ))}
          {members.length === 0 && <p>No members found. Add someone to the committee!</p>}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>
              {isEditing ? `Edit ${title} Member` : `Add New Member`}
            </h2>
            
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name *</label>
                <input required type="text" name="fullName" className={styles.input} value={formData.fullName} onChange={handleChange} placeholder="e.g. John Doe" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Position *</label>
                <input required type="text" name="position" className={styles.input} value={formData.position} onChange={handleChange} placeholder="e.g. President" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Hierarchy Priority (ID) *</label>
                <input required type="number" name="positionId" className={styles.input} value={formData.positionId} onChange={handleChange} placeholder="1" title="1 is highest" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Photo Image URL</label>
                <input type="url" name="photo" className={styles.input} value={formData.photo} onChange={handleChange} placeholder="https://imgur.com/..." />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Degree</label>
                <input type="text" name="degree" className={styles.input} value={formData.degree} onChange={handleChange} placeholder="e.g. B.Sc. in CSE" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Session</label>
                <input type="text" name="session" className={styles.input} value={formData.session} onChange={handleChange} placeholder="e.g. 2019-20" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} placeholder="e.g. email@example.com" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>LinkedIn URL</label>
                <input type="url" name="linkedIn" className={styles.input} value={formData.linkedIn} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Short Bio</label>
                <textarea name="bio" className={styles.input} value={formData.bio} onChange={handleChange} placeholder="1-2 lines about the member..." maxLength={150} />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Term Year</label>
                <input type="text" name="termYear" className={styles.input} value={formData.termYear} onChange={handleChange} placeholder="e.g. 2025-26" />
              </div>

              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (isEditing ? "Update Member" : "Add Member")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
