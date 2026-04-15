"use client";

import { useState, useEffect } from "react";
import {
  collection, onSnapshot, setDoc, deleteDoc, doc, query, where, getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import styles from "@/components/resources.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VerType = "membership" | "certificate" | "volunteership";

interface VerRecord {
  verificationId: string;
  type: VerType;
  name: string;
  department: string;
  batch: string;
  membershipType: string;
  joinDate: string;
  event: string;
  certificateType: string;
  issuedBy: string;
  role: string;
  events: string;
  duration: string;
  issueDate: string;
  status: string;
  extraData: string;
}

const empty = (type: VerType): VerRecord => ({
  verificationId: "", type,
  name: "", department: "", batch: "", membershipType: "",
  joinDate: "", event: "", certificateType: "", issuedBy: "",
  role: "", events: "", duration: "",
  issueDate: new Date().toISOString().split("T")[0],
  status: "Active", extraData: ""
});

const prefixes: Record<VerType, string> = {
  membership: "HSTURS-M-",
  certificate: "HSTURS-C-",
  volunteership: "HSTURS-V-"
};

const statusColors: Record<string, string> = {
  "Active": "#059669", "Valid": "#059669",
  "Inactive": "#dc2626", "Revoked": "#dc2626",
  "Expired": "#d97706"
};

const labels: Record<VerType, { title: string, icon: string }> = {
  membership:    { title: "Membership Verification",    icon: "🪪" },
  certificate:   { title: "Certificate Verification",   icon: "🏅" },
  volunteership: { title: "Volunteership Verification", icon: "🤝" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerificationManager({ type }: { type: VerType }) {
  const [records, setRecords] = useState<VerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<VerRecord>(empty(type));
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Verification lookup state
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<VerRecord | null | "not_found" | "loading">(null);

  const { title, icon } = labels[type];

  useEffect(() => {
    const q = query(collection(db, "verifications"), where("type", "==", type));
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => ({ verificationId: d.id, ...d.data() } as VerRecord)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.verificationId.trim()) { alert("Verification ID is required."); return; }
    setSaving(true);
    const p: any = { ...form };
    const docId = form.verificationId.trim().toUpperCase();
    try {
      // setDoc uses the verification ID as the document ID
      await setDoc(doc(db, "verifications", docId), { ...p, verificationId: docId, type });
      setIsModalOpen(false); setForm(empty(type)); setEditId(null);
    } catch (err) { alert("Save failed."); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Delete verification record ${id}? This cannot be undone.`)) {
      try { await deleteDoc(doc(db, "verifications", id)); }
      catch (err) { alert("Delete failed."); console.error(err); }
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLookupResult("loading");
    try {
      const snap = await getDoc(doc(db, "verifications", lookupId.trim().toUpperCase()));
      if (snap.exists()) setLookupResult({ verificationId: snap.id, ...snap.data() } as VerRecord);
      else setLookupResult("not_found");
    } catch (err) { setLookupResult("not_found"); console.error(err); }
  };

  return (
    <div className={styles.container}>
      {/* ─── Header ─── */}
      <header className={styles.header}>
        <h1 className={styles.title}>{icon} {title}</h1>
        <button className={styles.addButton} onClick={() => { setForm(empty(type)); setEditId(null); setIsModalOpen(true); }}>
          + Issue Record
        </button>
      </header>

      {/* ─── Lookup Preview Panel ─── */}
      <div style={{
        background: "rgba(0,112,243,0.04)", border: "1px solid rgba(0,112,243,0.15)",
        borderRadius: "16px", padding: "1.5rem", marginBottom: "2.5rem"
      }}>
        <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>🔍 Preview Verification Portal</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            className={styles.searchInput}
            placeholder={`Enter ${type === "membership" ? "Membership" : type === "certificate" ? "Certificate" : "Volunteer"} ID (e.g. ${prefixes[type]}001)`}
            value={lookupId}
            onChange={e => setLookupId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLookup()}
            style={{ maxWidth: "400px" }}
          />
          <button className={styles.addButton} onClick={handleLookup} style={{ padding: "0.75rem 1.5rem" }}>Verify</button>
        </div>

        {/* Lookup result */}
        {lookupResult && (
          <div style={{ marginTop: "1.25rem" }}>
            {lookupResult === "loading" && <p style={{ color: "#888" }}>Looking up...</p>}
            {lookupResult === "not_found" && (
              <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "1rem 1.25rem", color: "#dc2626", fontWeight: 600 }}>
                ❌ No record found for ID: <code>{lookupId.toUpperCase()}</code>
              </div>
            )}
            {lookupResult !== "loading" && lookupResult !== "not_found" && (
              <div style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.25)", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.8rem" }}>
                  <span style={{ background: "#059669", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 800 }}>✅ VERIFIED</span>
                  <code style={{ background: "rgba(0,0,0,0.06)", padding: "0.25rem 0.7rem", borderRadius: "6px", fontSize: "0.82rem", fontWeight: 700 }}>{lookupResult.verificationId}</code>
                  <span style={{ background: `${statusColors[lookupResult.status] || "#555"}18`, color: statusColors[lookupResult.status] || "#555", padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>{lookupResult.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.6rem" }}>
                  {[
                    { l: "Name", v: lookupResult.name },
                    { l: "Department", v: lookupResult.department },
                    { l: "Batch", v: lookupResult.batch },
                    { l: "Membership Type", v: lookupResult.membershipType },
                    { l: "Join Date", v: lookupResult.joinDate },
                    { l: "Event", v: lookupResult.event },
                    { l: "Certificate Type", v: lookupResult.certificateType },
                    { l: "Issued By", v: lookupResult.issuedBy },
                    { l: "Role", v: lookupResult.role },
                    { l: "Duration", v: lookupResult.duration },
                    { l: "Issue Date", v: lookupResult.issueDate },
                    { l: "Extra Info", v: lookupResult.extraData },
                  ].filter(f => f.v).map(f => (
                    <div key={f.l}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.l}</div>
                      <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{f.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Records Table ─── */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Issued Records ({records.length})</h2>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className={styles.list}>
          {records.map(r => (
            <div key={r.verificationId} className={styles.listCard}>
              <div className={styles.listActions}>
                <button className={`${styles.iconButton} ${styles.edit}`} onClick={() => { setForm(r); setEditId(r.verificationId); setIsModalOpen(true); }}>✎</button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(r.verificationId)}>✕</button>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                <code style={{ background: "rgba(0,0,0,0.06)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.82rem", fontWeight: 700 }}>{r.verificationId}</code>
                <span style={{ background: `${statusColors[r.status] || "#555"}18`, color: statusColors[r.status] || "#555", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>{r.status}</span>
                {r.membershipType && <span style={{ background: "rgba(0,112,243,0.1)", color: "#0070f3", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>{r.membershipType}</span>}
                {r.certificateType && <span style={{ background: "rgba(0,112,243,0.1)", color: "#0070f3", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>{r.certificateType}</span>}
              </div>
              <h3 className={styles.listTitle} style={{ paddingRight: "5.5rem" }}>{r.name}</h3>
              <div className={styles.listMeta}>
                {r.department && <span>🏫 {r.department}</span>}
                {r.batch      && <span>🎓 Batch {r.batch}</span>}
                {r.event      && <span>🎪 {r.event}</span>}
                {r.role       && <span>👤 {r.role}</span>}
                {r.issueDate  && <span>📅 Issued: {r.issueDate}</span>}
                {r.issuedBy   && <span>✍️ Issued by: {r.issuedBy}</span>}
              </div>
              {r.extraData && <p className={styles.listDescription}>{r.extraData}</p>}
            </div>
          ))}
          {records.length === 0 && <div className={styles.emptyState}>No {type} records issued yet.</div>}
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className={styles.modalTitle}>{editId ? "Edit Record" : `Issue New ${title.split(" ")[0]}`}</h2>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              {/* Shared */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Verification ID *</label>
                <input required type="text" name="verificationId" className={styles.input}
                  value={form.verificationId} onChange={handleChange}
                  placeholder={`${prefixes[type]}001`}
                  disabled={!!editId}
                  style={{ fontFamily: "monospace", textTransform: "uppercase", opacity: editId ? 0.6 : 1 }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status *</label>
                <select required name="status" className={styles.input} value={form.status} onChange={handleChange}>
                  {type === "membership"
                    ? ["Active", "Inactive"].map(s => <option key={s}>{s}</option>)
                    : type === "certificate"
                      ? ["Valid", "Expired", "Revoked"].map(s => <option key={s}>{s}</option>)
                      : ["Active", "Inactive"].map(s => <option key={s}>{s}</option>)
                  }
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Full Name *</label>
                <input required type="text" name="name" className={styles.input} value={form.name} onChange={handleChange} placeholder="Recipient's full name" />
              </div>

              {/* Membership-specific */}
              {type === "membership" && (<>
                <div className={styles.formGroup}><label className={styles.label}>Department</label><input type="text" name="department" className={styles.input} value={form.department} onChange={handleChange} placeholder="e.g. EEE" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Batch</label><input type="text" name="batch" className={styles.input} value={form.batch} onChange={handleChange} placeholder="e.g. 2024" /></div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Membership Type</label>
                  <select name="membershipType" className={styles.input} value={form.membershipType} onChange={handleChange}>
                    <option value="">Select Type</option>
                    <option>General Member</option><option>Executive Member</option>
                    <option>Associate Member</option><option>Life Member</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label className={styles.label}>Join Date</label><input type="date" name="joinDate" className={styles.input} value={form.joinDate} onChange={handleChange} /></div>
              </>)}

              {/* Certificate-specific */}
              {type === "certificate" && (<>
                <div className={styles.formGroup}><label className={styles.label}>Event / Course Name</label><input type="text" name="event" className={styles.input} value={form.event} onChange={handleChange} placeholder="e.g. Research Workshop 2026" /></div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Certificate Type</label>
                  <select name="certificateType" className={styles.input} value={form.certificateType} onChange={handleChange}>
                    <option value="">Select Type</option>
                    <option>Workshop Participation</option><option>Competition Winner</option>
                    <option>Training Completion</option><option>Speaker</option><option>Organizer</option>
                  </select>
                </div>
                <div className={styles.formGroup}><label className={styles.label}>Issue Date</label><input type="date" name="issueDate" className={styles.input} value={form.issueDate} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Issued By</label><input type="text" name="issuedBy" className={styles.input} value={form.issuedBy} onChange={handleChange} placeholder="e.g. HSTU Research Society" /></div>
              </>)}

              {/* Volunteership-specific */}
              {type === "volunteership" && (<>
                <div className={styles.formGroup}><label className={styles.label}>Role</label><input type="text" name="role" className={styles.input} value={form.role} onChange={handleChange} placeholder="e.g. Media Team Lead" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Duration</label><input type="text" name="duration" className={styles.input} value={form.duration} onChange={handleChange} placeholder="e.g. Jan 2025 – Apr 2025" /></div>
                <div className={styles.formGroup}><label className={styles.label}>Issue Date</label><input type="date" name="issueDate" className={styles.input} value={form.issueDate} onChange={handleChange} /></div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}><label className={styles.label}>Events (served in)</label><input type="text" name="events" className={styles.input} value={form.events} onChange={handleChange} placeholder="e.g. Research Workshop 2025, Annual Seminar 2026" /></div>
              </>)}

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Additional Info (optional)</label>
                <textarea name="extraData" className={styles.input} value={form.extraData} onChange={handleChange} placeholder="Any extra information to display on verification..." />
              </div>

              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? "Saving..." : (editId ? "Update Record" : "Issue Record")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
