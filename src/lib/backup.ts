import { addSong, listSongs, putSong } from "./db";
import { songDedupeKey } from "./normalize";
import type { ImportReport, Song } from "../types";

export const BACKUP_VERSION = 1;

export interface BackupFile {
  app: "mehfil-e-sufi";
  version: number;
  exportedAt: number;
  songs: Song[];
}

export function buildBackup(songs: Song[]): BackupFile {
  return {
    app: "mehfil-e-sufi",
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    songs,
  };
}

export function downloadBackup(songs: Song[]): void {
  const blob = new Blob([JSON.stringify(buildBackup(songs), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mehfil-e-sufi-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isValidSong(value: unknown): value is Song {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s["title"] === "string" &&
    typeof s["singer"] === "string" &&
    typeof s["lyrics"] === "string"
  );
}

/**
 * Import songs: preserves existing songs, detects duplicates by
 * normalized title+singer+language, merges safely.
 * mode "skip" keeps existing on duplicate, "merge" fills empty fields.
 */
export async function importBackup(
  file: unknown,
  mode: "skip" | "merge" = "skip",
): Promise<ImportReport> {
  const report: ImportReport = { total: 0, added: 0, skippedDuplicates: 0, merged: 0, errors: [] };
  const songs = (file as BackupFile)?.songs;
  if (!Array.isArray(songs)) {
    report.errors.push("Invalid backup file: missing songs array.");
    return report;
  }
  const existing = await listSongs();
  const byKey = new Map(existing.map((s) => [songDedupeKey(s.title, s.singer, s.language), s]));
  report.total = songs.length;

  for (const [index, raw] of songs.entries()) {
    if (!isValidSong(raw)) {
      report.errors.push(`Row ${index + 1}: missing title/singer/lyrics.`);
      continue;
    }
    const key = songDedupeKey(raw.title, raw.singer, raw.language ?? "");
    const found = byKey.get(key);
    if (found) {
      if (mode === "merge") {
        const merged: Song = {
          ...found,
          category: found.category || (raw.category as string) || "",
          language: found.language || (raw.language as string) || "",
          source: found.source || (raw.source as string) || "",
          notes: found.notes || (raw.notes as string) || "",
          lyrics: found.lyrics || raw.lyrics,
        };
        await putSong(merged);
        byKey.set(key, merged);
        report.merged += 1;
      } else {
        report.skippedDuplicates += 1;
      }
      continue;
    }
    const created = await addSong({
      title: raw.title,
      singer: raw.singer,
      category: (raw.category as string) ?? "",
      language: (raw.language as string) ?? "",
      lyrics: raw.lyrics,
      source: (raw.source as string) ?? "",
      notes: (raw.notes as string) ?? "",
      favorite: Boolean((raw as Song).favorite),
    });
    byKey.set(key, created);
    report.added += 1;
  }
  return report;
}
