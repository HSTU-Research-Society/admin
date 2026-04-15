"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/resources.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventMode = "upcoming" | "past" | "reports";

export interface Event {
  id?: string;
  // Core
  title: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  description: string;
  posterImage: string;
  registrationLink: string;
  speakers: string;
  capacity: string;
  // Past event extras
  photosLink: string;
  videosLink: string;
  // Report fields
  reportTitle: string;
  reportAuthor: string;
  reportCoverImage: string;
  reportContent: string;
  galleryLink: string;
  reportAttachment: string;
}

const empty: Event = {
  title: "", eventType: "", date: new Date().toISOString().split("T")[0],
  time: "", location: "", organizer: "", description: "",
  posterImage: "", registrationLink: "", speakers: "", capacity: "",
  photosLink: "", videosLink: "",
  reportTitle: "", reportAuthor: "", reportCoverImage: "", reportContent: "",
  galleryLink: "", reportAttachment: ""
};

const eventTypeEmojis: Record<string, string> = {
  "Workshop": "🛠️", "Seminar": "🎤", "Competition": "🏆",
  "Research Talk": "🔬", "Training Session": "📚", "Other": "📌"
};

const today = new Date().toISOString().split("T")[0];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventsManager({ mode }: { mode: EventMode }) {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Event>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [activeSection, setActiveSection] = useState<"core" | "past" | "report">("core");

  useEffect(() => {
    // Fetch all events; filter/sort client-side per mode
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, snap => {
      setAllEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Event)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  // ─── Filter per mode ────────────────────────────────────────────────────────
  const baseFiltered = useMemo(() => {
    if (mode === "upcoming") return [...allEvents].filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    if (mode === "past")     return allEvents.filter(e => e.date < today);
    if (mode === "reports")  return allEvents.filter(e => e.reportContent?.trim());
    return allEvents;
  }, [allEvents, mode]);

  const eventTypes = useMemo(() => ["All", ...Array.from(new Set(baseFiltered.map(e => e.eventType).filter(Boolean)))], [baseFiltered]);
  const years      = useMemo(() => ["All", ...Array.from(new Set(baseFiltered.map(e => e.date.slice(0, 4)))).sort().reverse()], [baseFiltered]);

  const displayed = useMemo(() => baseFiltered.filter(e => {
    const matchType = filterType === "All" || e.eventType === filterType;
    const matchYear = filterYear === "All" || e.date.startsWith(filterYear);
    return matchType && matchYear;
  }), [baseFiltered, filterType, filterYear]);

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  const openAdd = () => { setForm({ ...empty, date: new Date().toISOString().split("T")[0] }); setEditId(null); setActiveSection("core"); setIsModalOpen(true); };
  const openEdit = (ev: Event) => { setForm(ev); setEditId(ev.id!); setActiveSection("core"); setIsModalOpen(true); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const p = { ...form }; delete (p as any).id;
    try {
      if (editId) await updateDoc(doc(db, "events", editId), p);
      else await addDoc(collection(db, "events"), p);
      setIsModalOpen(false); setForm(empty); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this event permanently?")) {
      try { await deleteDoc(doc(db, "events", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  // ─── Page title ─────────────────────────────────────────────────────────────
  const pageTitle = mode === "upcoming" ? "Upcoming Events" : mode === "past" ? "Past Events" : "Event Reports";

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <button className={styles.addButton} onClick={openAdd}>+ Add Event</button>
      </header>

      {/* Filters (past & reports only) */}
      {(mode === "past" || mode === "reports") && (
        <div className={styles.toolbar}>
          <select className={styles.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value)}>
            {eventTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          {mode === "past" && (
            <select className={styles.filterSelect} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          )}
          <span style={{ color: "#888", fontSize: "0.9rem" }}>{displayed.length} result{displayed.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {loading ? <p>Loading events...</p> : (
        mode === "reports" ? (
          /* ─── Report Layout ── */
          <div className={styles.list}>
            {displayed.map(ev => (
              <div key={ev.id} className={styles.listCard}>
                <div className={styles.listActions}>
                  <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => openEdit(ev)}>✎</button>
                  <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(ev.id!)}>✕</button>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  {ev.reportCoverImage && (
                    <img src={ev.reportCoverImage} alt={ev.reportTitle || ev.title} style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div className={styles.listMeta} style={{ marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: 600, color: "#555" }}>📄 Report on: {ev.title}</span>
                      <span style={{ color: "#aaa", fontSize: "0.8rem" }}>{new Date(ev.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h3 className={styles.listTitle} style={{ paddingRight: "5.5rem", marginBottom: "0.4rem" }}>{ev.reportTitle || `Report: ${ev.title}`}</h3>
                    {ev.reportAuthor && <div className={styles.listMeta}><span>✍️ {ev.reportAuthor}</span></div>}
                    {ev.reportContent && <p className={styles.listDescription} style={{ WebkitLineClamp: 3, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" }}>{ev.reportContent}</p>}
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                      {ev.galleryLink && <a href={ev.galleryLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600 }}>📷 Gallery</a>}
                      {ev.reportAttachment && <a href={ev.reportAttachment} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.9rem", fontWeight: 600 }}>📎 Attachment</a>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {displayed.length === 0 && <div className={styles.emptyState}>No event reports yet. Edit an event and fill in the Report section.</div>}
          </div>
        ) : (
          /* ─── Event Card Grid ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
            {displayed.map(ev => {
              const isPast = ev.date < today;
              const emoji = eventTypeEmojis[ev.eventType] || "📌";
              return (
                <div key={ev.id} style={{
                  background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)",
                  borderRadius: "20px", overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 8px 24px rgba(0,0,0,0.07)",
                  transition: "transform 0.25s, box-shadow 0.25s", position: "relative"
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 18px 40px rgba(0,0,0,0.13)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }}
                >
                  {/* Poster / Hero */}
                  <div style={{ position: "relative", height: "160px" }}>
                    {ev.posterImage
                      ? <img src={ev.posterImage} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>{emoji}</div>
                    }
                    {/* Tags overlay */}
                    <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", gap: "0.4rem" }}>
                      {mode === "upcoming" && <span style={{ background: "#059669", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 800 }}>UPCOMING</span>}
                      {isPast && mode === "past" && <span style={{ background: "#555", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>PAST</span>}
                      {ev.eventType && <span style={{ background: "rgba(0,0,0,0.5)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600 }}>{ev.eventType}</span>}
                    </div>
                    {/* Edit/Delete */}
                    <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", gap: "0.4rem" }}>
                      <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => openEdit(ev)}>✎</button>
                      <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(ev.id!)}>✕</button>
                    </div>
                    {/* Date badge */}
                    <div style={{
                      position: "absolute", bottom: "0.75rem", right: "0.75rem",
                      background: "#fff", borderRadius: "10px", padding: "0.4rem 0.7rem",
                      textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", minWidth: "48px"
                    }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#0070f3", textTransform: "uppercase" }}>
                        {new Date(ev.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}
                      </div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1 }}>
                        {new Date(ev.date + "T00:00:00").getDate()}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>{ev.title}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.85rem", color: "#777", marginBottom: "0.8rem" }}>
                      {ev.time && <span>🕐 {ev.time}</span>}
                      {ev.location && <span>📍 {ev.location}</span>}
                      {ev.organizer && <span>👤 {ev.organizer}</span>}
                      {ev.speakers && <span>🎙️ {ev.speakers}</span>}
                      {ev.capacity && <span>👥 Capacity: {ev.capacity}</span>}
                    </div>
                    {ev.description && <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.55, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, overflow: "hidden", WebkitBoxOrient: "vertical" as any }}>{ev.description}</p>}

                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      {ev.registrationLink && mode === "upcoming" && (
                        <a href={ev.registrationLink} target="_blank" rel="noreferrer" style={{ background: "#0070f3", color: "#fff", padding: "0.5rem 1.1rem", borderRadius: "8px", fontSize: "0.88rem", fontWeight: 700, textDecoration: "none" }}>Register →</a>
                      )}
                      {ev.photosLink && <a href={ev.photosLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.85rem", fontWeight: 600 }}>📷 Photos</a>}
                      {ev.videosLink && <a href={ev.videosLink} target="_blank" rel="noreferrer" style={{ color: "#0070f3", fontSize: "0.85rem", fontWeight: 600 }}>🎬 Videos</a>}
                    </div>
                  </div>
                </div>
              );
            })}
            {displayed.length === 0 && (
              <div className={styles.emptyState} style={{ gridColumn: "1/-1" }}>
                {mode === "upcoming" ? "No upcoming events. Add one!" : "No past events found."}
              </div>
            )}
          </div>
        )
      )}

      {/* ─── Add/Edit Modal ─── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "720px" }}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit Event" : "Add Event"}</h2>

            {/* Section Tabs */}
            <div className={styles.tabs} style={{ marginBottom: "2rem" }}>
              {(["core", "past", "report"] as const).map(s => (
                <button key={s} className={`${styles.tab} ${activeSection === s ? styles.tabActive : ""}`} onClick={() => setActiveSection(s)}>
                  {s === "core" ? "📋 Core Details" : s === "past" ? "🔗 Post-Event Links" : "📄 Report"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              {activeSection === "core" && (<>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Event Title *</label><input required type="text" name="title" className={styles.input} value={form.title} onChange={handleChange} placeholder="e.g. Workshop on Deep Learning Applications" /></div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Event Type *</label>
                  <select required name="eventType" className={styles.input} value={form.eventType} onChange={handleChange}>
                    <option value="" disabled>Select Type</option>
                    {Object.keys(eventTypeEmojis).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}><label className={styles.label}>Date *</label><input required type="date" name="date" className={styles.input} value={form.date} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Time</label><input type="text" name="time" className={styles.input} value={form.time} onChange={handleChange} placeholder="e.g. 10:00 AM – 12:00 PM" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Location</label><input type="text" name="location" className={styles.input} value={form.location} onChange={handleChange} placeholder="e.g. Room 301, ECE Building / Zoom Link" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Organizer</label><input type="text" name="organizer" className={styles.input} value={form.organizer} onChange={handleChange} placeholder="e.g. HSTU Research Society" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Speaker(s)</label><input type="text" name="speakers" className={styles.input} value={form.speakers} onChange={handleChange} placeholder="e.g. Dr. John Doe, Prof. Jane Smith" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Capacity</label><input type="text" name="capacity" className={styles.input} value={form.capacity} onChange={handleChange} placeholder="e.g. 50 seats" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Poster Image URL</label><input type="url" name="posterImage" className={styles.input} value={form.posterImage} onChange={handleChange} placeholder="https://imgur.com/..." /></div>
                <div className={styles.formGroup}><label className={styles.label}>Registration Link</label><input type="url" name="registrationLink" className={styles.input} value={form.registrationLink} onChange={handleChange} placeholder="https://forms.google.com/..." /></div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Description *</label><textarea required name="description" className={styles.input} value={form.description} onChange={handleChange} placeholder="Event overview, agenda, and what attendees can expect..." style={{ minHeight: "100px" }} /></div>
              </>)}

              {activeSection === "past" && (<>
                <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ gridColumn: "1/-1", color: "#888", fontSize: "0.9rem" }}>Fill these in after the event is completed.</div>
                <div className={styles.formGroup}><label className={styles.label}>Photos Link</label><input type="url" name="photosLink" className={styles.input} value={form.photosLink} onChange={handleChange} placeholder="https://drive.google.com/..." /></div>
                <div className={styles.formGroup}><label className={styles.label}>Videos Link</label><input type="url" name="videosLink" className={styles.input} value={form.videosLink} onChange={handleChange} placeholder="https://youtube.com/playlist..." /></div>
              </>)}

              {activeSection === "report" && (<>
                <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ color: "#888", fontSize: "0.9rem" }}>A report will make this event appear in the Event Reports section.</div>
                <div className={styles.formGroup}><label className={styles.label}>Report Title</label><input type="text" name="reportTitle" className={styles.input} value={form.reportTitle} onChange={handleChange} placeholder="e.g. Recap: Deep Learning Workshop 2025" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Report Author</label><input type="text" name="reportAuthor" className={styles.input} value={form.reportAuthor} onChange={handleChange} placeholder="e.g. Media Team" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Cover Image URL</label><input type="url" name="reportCoverImage" className={styles.input} value={form.reportCoverImage} onChange={handleChange} placeholder="https://imgur.com/..." /></div>
                <div className={styles.formGroup}><label className={styles.label}>Gallery Link</label><input type="url" name="galleryLink" className={styles.input} value={form.galleryLink} onChange={handleChange} placeholder="https://..." /></div>
                <div className={styles.formGroup}><label className={styles.label}>Attachment</label><input type="url" name="reportAttachment" className={styles.input} value={form.reportAttachment} onChange={handleChange} placeholder="https://..." /></div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Report Content</label><textarea name="reportContent" className={styles.input} value={form.reportContent} onChange={handleChange} placeholder="Full report — outcomes, participant numbers, key highlights..." style={{ minHeight: "160px" }} /></div>
              </>)}

              <div style={{ gridColumn: "1/-1" }}>
                <button type="submit" className={styles.submitButton} disabled={saving}>{saving ? "Saving..." : (editId ? "Update Event" : "Add Event")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
