import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "./components/Logo";
import LyricsPage from "./components/LyricsPage";
import SongForm from "./components/SongForm";
import QRCodeModal from "./components/QRCodeModal";
import {
  addSong,
  deleteSong,
  listSongs,
  putSong,
  restoreDefaultSongs,
  seedDefaultSongsIfEmpty,
  toggleFavorite,
} from "./lib/db";
import { downloadBackup, importBackup } from "./lib/backup";
import { getCustomSingers, getDisplaySinger, singerKey } from "./lib/singerUtils";
import type { Song, SongInput } from "./types";
import "./App.css";

type View = "singers" | "songs" | "all" | "favorites" | "settings";

interface RouteState {
  view: View;
  singer: string;
  songId: string | null;
  isAdding: boolean;
  editingId: string | null;
}

function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, "").trim();
  const parts = clean.split("/").map((p) => decodeURIComponent(p));
  const root = parts[0] || "";

  if (root === "all") {
    return { view: "all", singer: "", songId: null, isAdding: false, editingId: null };
  }
  if (root === "favorites") {
    return { view: "favorites", singer: "", songId: null, isAdding: false, editingId: null };
  }
  if (root === "settings") {
    return { view: "settings", singer: "", songId: null, isAdding: false, editingId: null };
  }
  if (root === "singer" && parts[1]) {
    return { view: "songs", singer: parts[1], songId: null, isAdding: false, editingId: null };
  }
  if (root === "song" && parts[1]) {
    return { view: "singers", singer: "", songId: parts[1], isAdding: false, editingId: null };
  }
  if (root === "add") {
    return { view: "singers", singer: "", songId: null, isAdding: true, editingId: null };
  }
  if (root === "edit" && parts[1]) {
    return { view: "singers", singer: "", songId: null, isAdding: false, editingId: parts[1] };
  }
  return { view: "singers", singer: "", songId: null, isAdding: false, editingId: null };
}

function navigate(hash: string) {
  window.location.hash = hash;
}

function handleBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate("#/singers");
  }
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash));
  const [query, setQuery] = useState("");
  const [report, setReport] = useState("");
  const [saveError, setSaveError] = useState("");
  const [importMode, setImportMode] = useState<"skip" | "merge">("skip");
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [duplicateSeed, setDuplicateSeed] = useState<SongInput | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ms-theme");
    return saved === "dark" ? "dark" : "light";
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ms-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  async function refresh() {
    setSongs(await listSongs());
  }

  // Load and seed sample songs if first time
  useEffect(() => {
    let isMounted = true;
    seedDefaultSongsIfEmpty()
      .then((data) => {
        if (isMounted) {
          setSongs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for browser Back/Forward or hash changes
  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash(window.location.hash));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const { view, singer, songId, isAdding, editingId } = route;
  const openedSong = useMemo(() => (songId ? songs.find((s) => s.id === songId) || null : null), [songId, songs]);
  const editingSong = useMemo(() => (editingId ? songs.find((s) => s.id === editingId) || null : null), [editingId, songs]);

  // Group singers canonically so all variants (English, Urdu, titles) merge into a single folder
  const singers = useMemo(() => {
    const map = new Map<string, { display: string; count: number }>();
    for (const s of songs) {
      const key = singerKey(s.singer);
      const display = getDisplaySinger(s.singer);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        // Prefer display with Latin letters if previously non-Latin
        if (/[a-zA-Z]/.test(display) && !/[a-zA-Z]/.test(existing.display)) {
          existing.display = display;
        }
      } else {
        map.set(key, { display, count: 1 });
      }
    }
    return [...map.entries()]
      .map(([key, val]) => [val.display, val.count, key] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [songs]);

  const existingSingersList = useMemo(() => {
    const set = new Set<string>();
    for (const s of songs) {
      const name = getDisplaySinger(s.singer);
      if (name) set.add(name);
    }
    for (const c of getCustomSingers()) {
      if (c) set.add(c);
    }
    return [...set].sort();
  }, [songs]);

  const existingCategoriesList = useMemo(() => {
    const set = new Set<string>();
    for (const s of songs) {
      if (s.category?.trim()) set.add(s.category.trim());
    }
    return [...set].sort();
  }, [songs]);

  const normalizedQuery = query.trim().toLowerCase();

  // Search filtering for Singers tab
  const matchingSingers = useMemo(() => {
    if (!normalizedQuery) return singers;
    return singers.filter(([name, _, key]) => {
      if (name.toLowerCase().includes(normalizedQuery)) return true;
      return songs.some(
        (s) =>
          singerKey(s.singer) === key &&
          [s.title, s.singer, s.lyrics, s.category, s.language].join("\n").toLowerCase().includes(normalizedQuery),
      );
    });
  }, [singers, songs, normalizedQuery]);

  const matchingSongs = useMemo(() => {
    if (!normalizedQuery) return [];
    return songs
      .filter((s) =>
        [s.title, s.singer, s.lyrics, s.category, s.language].join("\n").toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [songs, normalizedQuery]);

  // General filtered list for Songs / All / Favorites
  const filtered = useMemo(() => {
    let rows = songs;
    if (view === "songs" && singer) {
      rows = rows.filter((s) => singerKey(s.singer) === singerKey(singer));
    }
    if (view === "favorites") rows = rows.filter((s) => s.favorite);
    if (normalizedQuery) {
      rows = rows.filter((s) =>
        [s.title, s.singer, s.lyrics, s.category, s.language].join("\n").toLowerCase().includes(normalizedQuery),
      );
    }
    return [...rows].sort((a, b) => a.title.localeCompare(b.title));
  }, [songs, view, singer, normalizedQuery]);

  const activeSingerDisplay = useMemo(() => {
    if (!singer) return "";
    const found = singers.find(([_, __, key]) => key === singerKey(singer));
    return found ? found[0] : getDisplaySinger(singer);
  }, [singer, singers]);

  async function handleSave(input: SongInput, id?: string) {
    try {
      if (id) {
        const existing = songs.find((s) => s.id === id);
        if (existing) {
          const updated = await putSong({ ...existing, ...input });
          await refresh();
          navigate(`#/song/${encodeURIComponent(updated.id)}`);
        }
      } else {
        const created = await addSong(input);
        await refresh();
        navigate(`#/song/${encodeURIComponent(created.id)}`);
      }
      setSaveError("");
    } catch {
      setSaveError("Could not save offline. Please try again.");
    }
  }

  async function handleDelete(song: Song) {
    const ok = window.confirm(`Delete "${song.title}" by ${song.singer}? This cannot be undone.`);
    if (!ok) return;
    await deleteSong(song.id);
    await refresh();
    handleBack();
  }

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const result = await importBackup(parsed, importMode);
      setReport(
        `Import: ${result.added} added, ${result.skippedDuplicates} duplicates skipped, ${result.merged} merged. ${result.errors.join(" ")}`,
      );
      await refresh();
    } catch {
      setReport("Import failed: invalid JSON file.");
    }
  }

  async function handleRestoreSamples() {
    const seeded = await restoreDefaultSongs();
    setSongs(seeded);
    setReport("Sample songs (Nusrat Fateh Ali Khan & Lakhwinder Wadali) loaded successfully!");
  }

  if (loading) return <main className="shell"><p>Loading offline library…</p></main>;

  return (
    <main className="shell">
      <header className="brand">
        <div className="brand-left">
          <Logo size={74} />
          <div className="brand-text">
            <h1>Mehfil-e-Sufi</h1>
            <p>Offline Qawwali &amp; Sufi Lyrics</p>
          </div>
        </div>
        <div className="brand-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setShowQrModal(true)}
            aria-label="Open QR Code to install app"
          >
            📲 Install App (QR)
          </button>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme mode"
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={view === "singers" && !singer && !openedSong ? "active" : ""}
          onClick={() => navigate("#/singers")}
        >
          Singers
        </button>
        <button
          className={view === "all" && !openedSong ? "active" : ""}
          onClick={() => navigate("#/all")}
        >
          All songs
        </button>
        <button
          className={view === "favorites" && !openedSong ? "active" : ""}
          onClick={() => navigate("#/favorites")}
        >
          Favorites
        </button>
        <button
          className={view === "settings" && !openedSong ? "active" : ""}
          onClick={() => navigate("#/settings")}
        >
          Settings
        </button>
        <button className="gold" onClick={() => navigate("#/add")}>
          + Add
        </button>
      </nav>

      {!openedSong && !isAdding && editingId === null && (
        <div className="toolbar">
          <div className="search-wrap">
            <input
              type="search"
              placeholder="Search title, singer, lyrics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {(isAdding || editingId !== null) && (
        <SongForm
          initial={editingSong ?? duplicateSeed ?? null}
          existingSingers={existingSingersList}
          existingCategories={existingCategoriesList}
          onCancel={() => {
            setSaveError("");
            setDuplicateSeed(null);
            handleBack();
          }}
          onSave={async (input, id) => {
            setDuplicateSeed(null);
            await handleSave(input, id);
          }}
        />
      )}
      {saveError && <p className="error">{saveError}</p>}

      {openedSong ? (
        <LyricsPage
          song={openedSong}
          onBack={handleBack}
          onEdit={(s) => navigate(`#/edit/${encodeURIComponent(s.id)}`)}
          onDuplicate={(s) => {
            setDuplicateSeed({
              title: `${s.title} (Personal)`,
              singer: s.singer,
              category: s.category,
              language: s.language,
              lyrics: s.lyrics,
              source: s.source ? `${s.source} (Personal)` : "Personal copy",
              notes: s.notes || "",
              favorite: s.favorite,
            });
            navigate("#/add");
          }}
          onToggleFavorite={async (s) => {
            await toggleFavorite(s);
            await refresh();
          }}
          onDelete={handleDelete}
        />
      ) : isAdding || editingId !== null ? null : view === "singers" && !singer ? (
        <section>
          {songs.length === 0 ? (
            <div className="card empty-banner">
              <p>No songs found in your library yet.</p>
              <button type="button" className="gold" onClick={handleRestoreSamples}>
                Load Sample Songs (Nusrat &amp; Wadali)
              </button>
            </div>
          ) : normalizedQuery ? (
            <div>
              {matchingSingers.length > 0 && (
                <div className="search-group">
                  <h3>Matching Singers ({matchingSingers.length})</h3>
                  <div className="grid">
                    {matchingSingers.map(([name, count]) => (
                      <button
                        key={name}
                        className="card singer"
                        onClick={() => navigate(`#/singer/${encodeURIComponent(name)}`)}
                      >
                        <strong>{name}</strong>
                        <span>{count} song{count === 1 ? "" : "s"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingSongs.length > 0 && (
                <div className="search-group">
                  <h3>Matching Songs ({matchingSongs.length})</h3>
                  <ul className="list">
                    {matchingSongs.map((s) => (
                      <li key={s.id} className="card row-between">
                        <button
                          className="song-link"
                          onClick={() => navigate(`#/song/${encodeURIComponent(s.id)}`)}
                        >
                          <strong>{s.title}</strong>
                          <span>{s.singer} • {s.category}</span>
                        </button>
                        <button
                          aria-label="favorite"
                          onClick={async () => {
                            await toggleFavorite(s);
                            await refresh();
                          }}
                        >
                          {s.favorite ? "★" : "☆"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchingSingers.length === 0 && matchingSongs.length === 0 && (
                <div className="card empty-banner">
                  <p>No singers or songs found matching "{query}".</p>
                  <button type="button" className="link-btn" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid">
              {singers.map(([name, count]) => (
                <button
                  key={name}
                  className="card singer"
                  onClick={() => navigate(`#/singer/${encodeURIComponent(name)}`)}
                >
                  <strong>{name}</strong>
                  <span>{count} song{count === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : view === "settings" ? (
        <section className="card">
          <h2>Settings</h2>
          <p>
            Backup keeps your offline library safe. Import preserves existing songs and handles duplicates per the selected mode.
          </p>
          <label>
            Duplicate handling
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as "skip" | "merge")}
            >
              <option value="skip">Skip duplicates</option>
              <option value="merge">Merge missing fields</option>
            </select>
          </label>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button type="button" onClick={() => downloadBackup(songs)}>
              Backup JSON
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}>
              Import JSON
            </button>
            <button type="button" className="gold" onClick={() => setShowQrModal(true)}>
              📲 Share / Install via QR Code
            </button>
            <button type="button" onClick={handleRestoreSamples}>
              Load Sample Songs
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
          {report && <p className="report">{report}</p>}
        </section>
      ) : (
        <section>
          {view === "songs" && singer && (
            <button
              className="link-btn"
              onClick={() => navigate("#/singers")}
            >
              ← All singers
            </button>
          )}
          <h2>
            {view === "favorites" ? "Favorites" : activeSingerDisplay || "All songs"} ({filtered.length})
          </h2>
          <ul className="list">
            {filtered.map((s) => (
              <li key={s.id} className="card row-between">
                <button
                  className="song-link"
                  onClick={() => navigate(`#/song/${encodeURIComponent(s.id)}`)}
                >
                  <strong>{s.title}</strong>
                  <span>{s.singer} • {s.category}</span>
                </button>
                <button
                  aria-label="favorite"
                  onClick={async () => {
                    await toggleFavorite(s);
                    await refresh();
                  }}
                >
                  {s.favorite ? "★" : "☆"}
                </button>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="empty">
              {normalizedQuery ? `No songs found matching "${query}".` : "No songs found."}
            </p>
          )}
        </section>
      )}

      <QRCodeModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />

      <footer className="foot">
        <p>Saved lyrics work offline. Backup file is needed to move data between devices.</p>
        <p className="ver">App version v2026.10.11-6</p>
      </footer>
    </main>
  );
}
