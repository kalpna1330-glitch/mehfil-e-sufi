import { useState } from "react";
import type { Song } from "../types";

interface Props {
  song: Song;
  onBack: () => void;
  onEdit: (song: Song) => void;
  onDuplicate?: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onDelete: (song: Song) => void;
}

const MIN_SIZE = 16;
const MAX_SIZE = 32;
const STEP = 2;
const DEFAULT_SIZE = 18;
const STORAGE_KEY = "ms-lyrics-font-size";

function loadFontSize(): number {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  if (Number.isFinite(saved) && saved >= MIN_SIZE && saved <= MAX_SIZE) {
    return saved;
  }
  return DEFAULT_SIZE;
}

export default function LyricsPage({
  song,
  onBack,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onDelete,
}: Props) {
  const [fontSize, setFontSize] = useState<number>(loadFontSize);

  function changeFontSize(delta: number) {
    setFontSize((prev) => {
      const next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, prev + delta));
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <article className="lyrics-page">
      <button type="button" className="link-btn" onClick={onBack}>
        ← Back
      </button>
      <header className="lyrics-header">
        <h2>{song.title}</h2>
        <p className="meta">
          {song.singer} • {song.category || "Qawwali"} • {song.language || "Hindi"}
        </p>
        {song.source && (
          <p className="source">
            Source:{" "}
            {song.source.startsWith("http://") || song.source.startsWith("https://") ? (
              <a href={song.source} target="_blank" rel="noopener noreferrer">
                {song.source}
              </a>
            ) : (
              song.source
            )}
          </p>
        )}
      </header>
      <div className="row font-controls" role="group" aria-label="Lyrics font size">
        <button
          type="button"
          onClick={() => changeFontSize(-STEP)}
          disabled={fontSize <= MIN_SIZE}
          aria-label="Decrease lyrics font size"
        >
          A−
        </button>
        <span className="font-size-indicator" aria-live="polite">
          {fontSize}px
        </span>
        <button
          type="button"
          onClick={() => changeFontSize(STEP)}
          disabled={fontSize >= MAX_SIZE}
          aria-label="Increase lyrics font size"
        >
          A+
        </button>
      </div>
      <pre className="lyrics-text" style={{ fontSize: `${fontSize}px` }}>
        {song.lyrics}
      </pre>
      {song.notes && (
        <p className="notes">
          <strong>Notes:</strong> {song.notes}
        </p>
      )}
      <div className="row lyrics-actions">
        <button type="button" className="gold" onClick={() => onEdit(song)}>
          ✏️ Edit Lyrics
        </button>
        {onDuplicate && (
          <button type="button" onClick={() => onDuplicate(song)}>
            📋 Save Copy as My Song
          </button>
        )}
        <button type="button" onClick={() => onToggleFavorite(song)}>
          {song.favorite ? "★ Unfavorite" : "☆ Favorite"}
        </button>
        <button type="button" className="danger" onClick={() => onDelete(song)}>
          Delete
        </button>
      </div>
    </article>
  );
}
