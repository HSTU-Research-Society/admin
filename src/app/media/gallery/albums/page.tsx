"use client";

import { useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/media.module.css";

interface Album {
  id?: string;
  albumTitle: string;
  eventName: string;
  date: string;
  description: string;
  coverImage: string;
  photoCount: string;
  videoCount: string;
}

const empty: Album = { albumTitle: "", eventName: "", date: new Date().toISOString().split("T")[0], description: "", coverImage: "", photoCount: "0", videoCount: "0" };

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Album>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "gallery_albums"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, snap => {
      setAlbums(snap.docs.map(d => ({ id: d.id, ...d.data() } as Album)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (editId) await updateDoc(doc(db, "gallery_albums", editId), p);
      else await addDoc(collection(db, "gallery_albums"), p);
      setIsModalOpen(false); setForm(empty); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this album?")) {
      try { await deleteDoc(doc(db, "gallery_albums", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gallery — Albums</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty); setEditId(null); setIsModalOpen(true); }}>+ New Album</button>
      </header>

      {loading ? <p>Loading albums...</p> : (
        <div className={styles.magazineGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {albums.map(album => (
            <div key={album.id} className={styles.magazineCover}>
              <div className={styles.magazineCoverActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => { setForm(album); setEditId(album.id!); setIsModalOpen(true); }}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(album.id!)}>✕</button>
              </div>

              {album.coverImage
                ? <img src={album.coverImage} alt={album.albumTitle} className={styles.magazineCoverImage} style={{ height: "200px" }} />
                : <div className={styles.magazineCoverFallback} style={{ height: "200px", fontSize: "3rem" }}>🖼️</div>
              }

              <div className={styles.magazineCoverInfo}>
                <div className={styles.magazineCoverTitle}>{album.albumTitle}</div>
                {album.eventName && <div className={styles.magazineCoverMeta}>{album.eventName}</div>}
                <div className={styles.magazineCoverMeta} style={{ color: "#888" }}>
                  {new Date(album.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.6rem", fontSize: "0.85rem", color: "#888" }}>
                  <span>📷 {album.photoCount || 0} Photos</span>
                  <span>🎬 {album.videoCount || 0} Videos</span>
                </div>
                {album.description && <p style={{ fontSize: "0.85rem", color: "#777", marginTop: "0.5rem", lineHeight: 1.5 }}>{album.description}</p>}
              </div>
            </div>
          ))}
          {albums.length === 0 && <div className={styles.emptyState} style={{ gridColumn: "1/-1" }}>No albums yet. Create your first album!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit Album" : "New Album"}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Album Title *</label>
                <input required type="text" name="albumTitle" className={styles.input} value={form.albumTitle} onChange={handleChange} placeholder="e.g. Research Workshop 2026" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Event Name</label>
                <input type="text" name="eventName" className={styles.input} value={form.eventName} onChange={handleChange} placeholder="e.g. Annual Research Symposium" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date *</label>
                <input required type="date" name="date" className={styles.input} value={form.date} onChange={handleChange} />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Cover Image URL</label>
                <input type="url" name="coverImage" className={styles.input} value={form.coverImage} onChange={handleChange} placeholder="https://imgur.com/..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Photo Count</label>
                <input type="number" name="photoCount" className={styles.input} value={form.photoCount} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Video Count</label>
                <input type="number" name="videoCount" className={styles.input} value={form.videoCount} onChange={handleChange} placeholder="0" min="0" />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="description" className={styles.input} value={form.description} onChange={handleChange} placeholder="Brief description of this event/album..." />
              </div>
              <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (editId ? "Update Album" : "Create Album")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
