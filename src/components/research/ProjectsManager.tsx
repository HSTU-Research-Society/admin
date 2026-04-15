"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/research.module.css";

interface OngoingProject {
  id?: string;
  projectTitle: string;
  teamMembers: string;
  supervisor: string;
  department: string;
  startDate: string;
  description: string;
  expectedCompletion: string;
}

interface CompletedProject {
  id?: string;
  projectTitle: string;
  teamMembers: string;
  supervisor: string;
  department: string;
  completionYear: string;
  summary: string;
  reportLink: string;
  publicationLink: string;
}

const emptyOngoing: OngoingProject = { projectTitle: "", teamMembers: "", supervisor: "", department: "", startDate: new Date().toISOString().split("T")[0], description: "", expectedCompletion: "" };
const emptyCompleted: CompletedProject = { projectTitle: "", teamMembers: "", supervisor: "", department: "", completionYear: new Date().getFullYear().toString(), summary: "", reportLink: "", publicationLink: "" };

export default function ProjectsManager() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">("ongoing");
  const [ongoing, setOngoing] = useState<OngoingProject[]>([]);
  const [completed, setCompleted] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ongoingForm, setOngoingForm] = useState<OngoingProject>(emptyOngoing);
  const [completedForm, setCompletedForm] = useState<CompletedProject>(emptyCompleted);

  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded === 2) setLoading(false); };
    const u1 = onSnapshot(query(collection(db, "projects_ongoing"), orderBy("startDate", "desc")), snap => { setOngoing(snap.docs.map(d => ({ id: d.id, ...d.data() } as OngoingProject))); done(); }, () => done());
    const u2 = onSnapshot(query(collection(db, "projects_completed"), orderBy("completionYear", "desc")), snap => { setCompleted(snap.docs.map(d => ({ id: d.id, ...d.data() } as CompletedProject))); done(); }, () => done());
    return () => { u1(); u2(); };
  }, []);

  const openAdd = () => { if (activeTab === "ongoing") setOngoingForm(emptyOngoing); else setCompletedForm(emptyCompleted); setIsEditing(false); setIsModalOpen(true); };
  const openEdit = (item: OngoingProject | CompletedProject) => { if (activeTab === "ongoing") setOngoingForm(item as OngoingProject); else setCompletedForm(item as CompletedProject); setIsEditing(true); setIsModalOpen(true); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (activeTab === "ongoing") setOngoingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    else setCompletedForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (activeTab === "ongoing") {
        const p = { ...ongoingForm }; delete (p as any).id;
        if (isEditing && ongoingForm.id) await updateDoc(doc(db, "projects_ongoing", ongoingForm.id), p);
        else await addDoc(collection(db, "projects_ongoing"), p);
      } else {
        const p = { ...completedForm }; delete (p as any).id;
        if (isEditing && completedForm.id) await updateDoc(doc(db, "projects_completed", completedForm.id), p);
        else await addDoc(collection(db, "projects_completed"), p);
      }
      setIsModalOpen(false);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const col = activeTab === "ongoing" ? "projects_ongoing" : "projects_completed";
    if (confirm("Delete this project?")) {
      try { await deleteDoc(doc(db, col, id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  const displayList = activeTab === "ongoing" ? ongoing : completed;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Research Projects</h1>
        <button className={styles.addButton} onClick={openAdd}>+ Add Project</button>
      </header>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "ongoing" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ongoing")}>🔬 Ongoing ({ongoing.length})</button>
        <button className={`${styles.tab} ${activeTab === "completed" ? styles.tabActive : ""}`} onClick={() => setActiveTab("completed")}>✅ Completed ({completed.length})</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className={styles.list}>
          {displayList.map((item: any) => (
            <div key={item.id} className={styles.listCard}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => openEdit(item)}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(item.id)}>✕</button>
              </div>
              <h3 className={styles.listTitle} style={{ paddingRight: "5.5rem" }}>{item.projectTitle}</h3>
              <div className={styles.listMeta}>
                {item.department && <span>🏫 {item.department}</span>}
                {item.supervisor && <span>👨‍🏫 Supervisor: {item.supervisor}</span>}
                {activeTab === "ongoing" ? (
                  <span>📅 Started: {new Date(item.startDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
                ) : (
                  <span>🎓 Completed: {item.completionYear}</span>
                )}
                {item.expectedCompletion && <span>⏳ Expected: {item.expectedCompletion}</span>}
              </div>
              <div className={styles.listMeta}><span>👥 {item.teamMembers}</span></div>
              {(item.description || item.summary) && <p className={styles.listDescription}>{item.description || item.summary}</p>}
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {item.reportLink && <a href={item.reportLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600 }}>📋 Report</a>}
                {item.publicationLink && <a href={item.publicationLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600 }}>📄 Publication</a>}
              </div>
            </div>
          ))}
          {displayList.length === 0 && <div className={styles.emptyState}>No {activeTab} projects yet. Add one!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{isEditing ? "Edit" : "Add"} {activeTab === "ongoing" ? "Ongoing" : "Completed"} Project</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              {activeTab === "ongoing" ? (<>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Project Title *</label>
                  <input required type="text" name="projectTitle" className={styles.input} value={ongoingForm.projectTitle} onChange={handleChange} placeholder="e.g. AI Crop Disease Detection" />
                </div>
                <div className={styles.formGroup}><label className={styles.label}>Team Members *</label><input required type="text" name="teamMembers" className={styles.input} value={ongoingForm.teamMembers} onChange={handleChange} placeholder="e.g. Alice, Bob, Carol" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Supervisor</label><input type="text" name="supervisor" className={styles.input} value={ongoingForm.supervisor} onChange={handleChange} placeholder="e.g. Dr. John Doe" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Department *</label><input required type="text" name="department" className={styles.input} value={ongoingForm.department} onChange={handleChange} placeholder="e.g. Dept. of CSE" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Start Date *</label><input required type="date" name="startDate" className={styles.input} value={ongoingForm.startDate} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Expected Completion</label><input type="text" name="expectedCompletion" className={styles.input} value={ongoingForm.expectedCompletion} onChange={handleChange} placeholder="e.g. December 2025" /></div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Short Description *</label><textarea required name="description" className={styles.input} value={ongoingForm.description} onChange={handleChange} placeholder="Describe the project goals and methodology..." /></div>
              </>) : (<>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Project Title *</label>
                  <input required type="text" name="projectTitle" className={styles.input} value={completedForm.projectTitle} onChange={handleChange} placeholder="e.g. Smart Irrigation System" />
                </div>
                <div className={styles.formGroup}><label className={styles.label}>Team Members *</label><input required type="text" name="teamMembers" className={styles.input} value={completedForm.teamMembers} onChange={handleChange} placeholder="e.g. Alice, Bob" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Supervisor *</label><input required type="text" name="supervisor" className={styles.input} value={completedForm.supervisor} onChange={handleChange} placeholder="e.g. Dr. John Doe" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Department *</label><input required type="text" name="department" className={styles.input} value={completedForm.department} onChange={handleChange} placeholder="e.g. Dept. of EEE" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Completion Year *</label><input required type="number" name="completionYear" className={styles.input} value={completedForm.completionYear} onChange={handleChange} min="1990" max="2100" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Report Link</label><input type="url" name="reportLink" className={styles.input} value={completedForm.reportLink} onChange={handleChange} placeholder="https://..." /></div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Publication Link</label><input type="url" name="publicationLink" className={styles.input} value={completedForm.publicationLink} onChange={handleChange} placeholder="https://doi.org/..." /></div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Summary *</label><textarea required name="summary" className={styles.input} value={completedForm.summary} onChange={handleChange} placeholder="Project outcomes and impact..." style={{ minHeight: "100px" }} /></div>
              </>)}
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (isEditing ? "Update Project" : "Add Project")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
