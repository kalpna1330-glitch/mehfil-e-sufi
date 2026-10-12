import type { Song, SongInput } from "../types";
import { createSongId } from "../types";
import { matchCanonicalSinger } from "./singerUtils";

const DB_NAME = "mehfil-e-sufi";
const DB_VERSION = 1;
const STORE = "songs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("by-singer", "singer", { unique: false });
        store.createIndex("by-title", "title", { unique: false });
        store.createIndex("by-favorite", "favorite", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        let result: T;
        try {
          const req = fn(store);
          req.onsuccess = () => {
            result = req.result;
          };
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
        t.oncomplete = () => {
          db.close();
          resolve(result);
        };
        t.onerror = () => {
          db.close();
          reject(t.error);
        };
      }),
  );
}

export async function listSongs(): Promise<Song[]> {
  const rows = await run<Song[]>("readonly", (store) => store.getAll() as IDBRequest<Song[]>);
  return rows ?? [];
}

export async function addSong(input: SongInput): Promise<Song> {
  const now = Date.now();
  const song: Song = {
    ...input,
    id: createSongId(),
    favorite: input.favorite ?? false,
    createdAt: now,
    updatedAt: now,
  };
  await run("readwrite", (store) => store.add(song));
  return song;
}

export async function putSong(song: Song): Promise<Song> {
  const updated: Song = { ...song, updatedAt: Date.now() };
  await run("readwrite", (store) => store.put(updated));
  return updated;
}

export async function deleteSong(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

export async function toggleFavorite(song: Song): Promise<Song> {
  return putSong({ ...song, favorite: !song.favorite });
}

export async function seedDefaultSongsIfEmpty(): Promise<Song[]> {
  const existing = await listSongs();
  const existingMap = new Map(existing.map((s) => [s.id, s]));
  const { DEFAULT_SAMPLE_SONGS } = await import("./sampleSongs");
  let updatedAny = false;
  for (const song of DEFAULT_SAMPLE_SONGS) {
    const found = existingMap.get(song.id);
    if (!found) {
      await putSong(song);
      updatedAny = true;
    } else if (found.title !== song.title || found.singer !== song.singer) {
      await putSong({ ...found, title: song.title, singer: song.singer });
      updatedAny = true;
    }
  }

  // Auto-normalize any existing saved songs whose singer is an alias or variant of a canonical artist
  for (const s of existing) {
    const canonical = matchCanonicalSinger(s.singer);
    if (canonical && s.singer !== canonical) {
      await putSong({ ...s, singer: canonical });
      updatedAny = true;
    }
  }

  return updatedAny ? listSongs() : existing;
}

export async function restoreDefaultSongs(): Promise<Song[]> {
  const { DEFAULT_SAMPLE_SONGS } = await import("./sampleSongs");
  for (const song of DEFAULT_SAMPLE_SONGS) {
    await putSong(song);
  }
  localStorage.setItem("ms_seeded_once", "true");
  return listSongs();
}
