export interface Song {
  id: string;
  title: string;
  singer: string;
  category: string;
  language: string;
  lyrics: string;
  source: string;
  notes?: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SongInput = Omit<Song, "id" | "createdAt" | "updatedAt" | "favorite"> & {
  favorite?: boolean;
};

export interface ImportReport {
  total: number;
  added: number;
  skippedDuplicates: number;
  merged: number;
  errors: string[];
}

export function createSongId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `song-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}
