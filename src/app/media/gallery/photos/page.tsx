"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/media.module.css";

interface Photo {
  id?: string;
  image: string;
  caption: string;
  albumName: string;
  uploadedDate: string;
}

interface Album { id: string; albumTitle: string; }

const empty: Photo = { image: "", caption: "", albumName: "", uploadedDate: new Date().toISOString().split("T")[0] };

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Photo>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterAlbum, setFilterAlbum] = useState("All");

  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded === 2) setLoading(false); };
    const u1 = onSnapshot(query(collection(db, "gallery_photos"), orderBy("uploadedDate", "desc")), snap => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Photo)));
      done();
    }, () => done());
    const u2 = onSnapshot(query(collection(db, "gallery_albums"), orderBy("date", "desc")), snap => {
      setAlbums(snap.docs.map(d => ({ id: d.id, albumTitle: (d.data() as any).albumTitle })));
      done();
    }, () => done());
    return () => { u1(); u2(); };
  }, []);

  const albumNames = useMemo(() => ["All", ...albums.map(a => a.albumTitle)], [albums]);
  const filtered = useMemo(() => filterAlbum === "All" ? photos : photos.filter(p => p.albumName === filterAlbum), [photos, filterAlbum]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (editId) await updateDoc(doc(db, "gallery_photos", editId), p);
      else await addDoc(collection(db, "gallery_photos"), p);
      setIsModalOpen(false); setForm(empty); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this photo?")) {
      try { await deleteDoc(doc(db, "gallery_photos", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gallery — Photos</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty); setEditId(null); setIsModalOpen(true); }}>+ Add Photo</button>
      </header>

      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filterAlbum} onChange={e => setFilterAlbum(e.target.value)}>
          {albumNames.map(a => <option key={a}>{a}</option>)}
        </select>
        <span style={{ color: "#888", fontSize: "0.9rem" }}>{filtered.length} photo{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? <p>Loading photos...</p> : (
        /* Masonry-style grid */
        <div style={{ columns: "4 200px", gap: "1rem" }}>
          {filtered.map(photo => (
            <div key={photo.id} style={{
              breakInside: "avoid", marginBottom: "1rem", borderRadius: "12px",
              overflow: "hidden", position: "relative",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <img src={photo.image} alt={photo.caption || "Gallery photo"} style={{ width: "100%", display: "block", borderRadius: "12px" }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                padding: "1rem 0.75rem 0.5rem", borderRadius: "0 0 12px 12px",
                opacity: 0, transition: "opacity 0.2s"
              }}
                onMouseOver={e => e.currentTarget.style.opacity = "1"}
                onMouseOut={e => e.currentTarget.style.opacity = "0"}
              >
                {photo.caption && <p style={{ color: "#fff", margin: 0, fontSize: "0.85rem" }}>{photo.caption}</p>}
                {photo.albumName && <p style={{ color: "rgba(255,255,255,0.7)", margin: "0.2rem 0 0", fontSize: "0.75rem" }}>📁 {photo.albumName}</p>}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button onClick={() => { setForm(photo); setEditId(photo.id!); setIsModalOpen(true); }}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "0.25rem 0.6rem", color: "#fff", cursor: "pointer", fontSize: "0.8rem" }}>✎ Edit</button>
                  <button onClick={() => handleDelete(photo.id!)}
                    style={{ background: "rgba(229,62,62,0.7)", border: "none", borderRadius: "6px", padding: "0.25rem 0.6rem", color: "#fff", cursor: "pointer", fontSize: "0.8rem" }}>✕ Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className={styles.emptyState}>No photos found. Add some!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit Photo" : "Add Photo"}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Image URL *</label>
                <input required type="url" name="image" className={styles.input} value={form.image} onChange={handleChange} placeholder="https://imgur.com/..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Album</label>
                <select name="albumName" className={styles.input} value={form.albumName} onChange={handleChange}>
                  <option value="">No Album</option>
                  {albums.map(a => <option key={a.id} value={a.albumTitle}>{a.albumTitle}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Upload Date</label>
                <input type="date" name="uploadedDate" className={styles.input} value={form.uploadedDate} onChange={handleChange} />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Caption</label>
                <input type="text" name="caption" className={styles.input} value={form.caption} onChange={handleChange} placeholder="Optional caption for this photo" />
              </div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (editId ? "Update Photo" : "Add Photo")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
