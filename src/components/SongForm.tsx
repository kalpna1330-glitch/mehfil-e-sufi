import { useMemo, useState } from "react";
import type { Song, SongInput } from "../types";
import {
  POPULAR_CATEGORIES,
  POPULAR_SINGERS,
  formatSingerName,
  getCustomSingers,
  matchCanonicalSinger,
  saveCustomSinger,
} from "../lib/singerUtils";

interface Props {
  initial?: Song | SongInput | null;
  existingSingers?: string[];
  existingCategories?: string[];
  onSave: (input: SongInput, id?: string) => void;
  onCancel: () => void;
}

const EMPTY: SongInput = {
  title: "",
  singer: "",
  category: "Qawwali",
  language: "Hindi",
  lyrics: "",
  source: "",
  notes: "",
};

export default function SongForm({
  initial,
  existingSingers = [],
  existingCategories = [],
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<SongInput>({
    ...EMPTY,
    ...initial,
  });
  const [customSingers, setCustomSingers] = useState<string[]>(getCustomSingers);
  const [error, setError] = useState("");

  const singerSuggestions = useMemo(() => {
    const list = [...new Set([...existingSingers, ...customSingers, ...POPULAR_SINGERS])];
    return list.filter(Boolean);
  }, [existingSingers, customSingers]);

  const categorySuggestions = useMemo(() => {
    const list = [...new Set([...existingCategories, ...POPULAR_CATEGORIES])];
    return list.filter(Boolean);
  }, [existingCategories]);

  const detectedCanonical = useMemo(() => {
    if (!form.singer.trim()) return null;
    return matchCanonicalSinger(form.singer);
  }, [form.singer]);

  const isNewSinger = useMemo(() => {
    const clean = form.singer.trim();
    if (!clean) return false;
    return !singerSuggestions.some((s) => s.toLowerCase() === clean.toLowerCase());
  }, [form.singer, singerSuggestions]);

  function set<K extends keyof SongInput>(key: K, value: SongInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.singer.trim() || !form.lyrics.trim()) {
      setError("Title, singer and lyrics are required.");
      return;
    }

    // Auto-normalize singer to canonical name if matched, or format clean name
    const finalSinger = detectedCanonical || formatSingerName(form.singer);

    // Automatically add to custom singers so it appears in the dropdown and chips permanently
    const updated = saveCustomSinger(finalSinger);
    setCustomSingers(updated);

    const songId = initial && "id" in initial ? (initial as Song).id : undefined;
    onSave({ ...form, singer: finalSinger }, songId);
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{initial && "id" in initial ? "Edit lyrics" : "Add lyrics"}</h2>
      {error && <p className="error">{error}</p>}

      <label>
        Song title*
        <input
          value={form.title}
          placeholder="e.g. Dil Pe Zakhm Khate Hain, Chaap Tilak"
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </label>

      <label>
        Singer*
        <input
          list="singer-datalist"
          value={form.singer}
          placeholder="e.g. Nusrat Fateh Ali Khan, Jaipal Sahota..."
          onChange={(e) => set("singer", e.target.value)}
          required
        />
        <datalist id="singer-datalist">
          {singerSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      {/* All singers dropdown selector */}
      <div className="select-singer-row">
        <select
          value={singerSuggestions.includes(form.singer) ? form.singer : ""}
          onChange={(e) => {
            if (e.target.value) set("singer", e.target.value);
          }}
          aria-label="Choose from all singers"
        >
          <option value="">▼ Or choose from all singers ({singerSuggestions.length})...</option>
          {singerSuggestions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Suggested singer quick chips - ALL singers visible */}
      <div className="quick-chips">
        <span className="chips-label">Quick select:</span>
        {singerSuggestions.map((name) => (
          <button
            key={name}
            type="button"
            className={`chip-btn ${form.singer === name ? "active" : ""}`}
            onClick={() => set("singer", name)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Real-time canonical folder hint */}
      {detectedCanonical && detectedCanonical !== form.singer.trim() && (
        <div className="canonical-hint">
          <span>
            Will be grouped under: <strong>{detectedCanonical}</strong>
          </span>
          <button
            type="button"
            className="chip-btn apply-btn"
            onClick={() => set("singer", detectedCanonical)}
          >
            Use standard name
          </button>
        </div>
      )}

      {/* New singer auto-add indicator */}
      {isNewSinger && !detectedCanonical && (
        <div className="canonical-hint" style={{ background: "rgba(23, 76, 58, 0.15)" }}>
          <span>
            ✨ New singer: <strong>{formatSingerName(form.singer)}</strong> (will be added automatically)
          </span>
          <button
            type="button"
            className="chip-btn apply-btn"
            onClick={() => {
              const updated = saveCustomSinger(form.singer);
              setCustomSingers(updated);
              set("singer", formatSingerName(form.singer));
            }}
          >
            + Add to list now
          </button>
        </div>
      )}

      <div className="grid2">
        <label>
          Category
          <input
            list="category-datalist"
            value={form.category}
            placeholder="Qawwali / Sufi Kalaam"
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="category-datalist">
            {categorySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Language
          <select value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="Hindi">Hindi</option>
            <option value="Punjabi">Punjabi</option>
            <option value="Urdu">Urdu</option>
            <option value="English">English</option>
          </select>
        </label>
      </div>

      <label>
        Full lyrics*
        <textarea
          value={form.lyrics}
          placeholder="Write or paste complete lyrics here..."
          onChange={(e) => set("lyrics", e.target.value)}
          rows={10}
          required
        />
      </label>

      <label>
        Source
        <input
          value={form.source}
          placeholder="e.g. Traditional / Amir Khusrau"
          onChange={(e) => set("source", e.target.value)}
        />
      </label>

      <label>
        Optional notes
        <textarea
          value={form.notes ?? ""}
          placeholder="Additional details, background or translation..."
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
        />
      </label>

      <div className="row">
        <button type="submit" className="gold">
          Save
        </button>
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
