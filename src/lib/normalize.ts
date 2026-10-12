import { singerKey } from "./singerUtils";

/** Normalize text for exact duplicate detection: title + singer + language. */
export function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function songDedupeKey(title: string, singer: string, language: string): string {
  return [normalizeKey(title), singerKey(singer), normalizeKey(language)].join("|");
}
