export const POPULAR_SINGERS: string[] = [
  "Nusrat Fateh Ali Khan",
  "Jaipal Sahota",
  "Lakhwinder Wadali",
  "Sabri Brothers",
  "Rahat Fateh Ali Khan",
  "Abida Parveen",
  "Aziz Mian",
  "Amjad Sabri",
  "Wadali Brothers",
  "Nooran Sisters",
  "Satinder Sartaaj",
  "Kailash Kher",
  "Hans Raj Hans",
  "Arif Lohar",
  "Sanam Marvi",
  "Reshma",
  "Ghulam Ali",
  "Mehdi Hassan",
  "Atif Aslam",
];

export const POPULAR_CATEGORIES: string[] = [
  "Qawwali",
  "Punjabi Sufi Qawwali",
  "Sufi Song",
  "Sufi Dhamaal / Qawwali",
  "Sufi Qawwali / Bhajan",
  "Ghazal",
  "Kafi / Sufi Kalaam",
  "Hamd / Naat",
];

/**
 * Mapping of canonical singer names to known aliases across English,
 * Urdu, Hindi, Punjabi, and various spellings or titles.
 */
const ARTIST_ALIASES: Record<string, string[]> = {
  "Nusrat Fateh Ali Khan": [
    "nusrat fateh ali khan",
    "nusrat fateh ali",
    "nusrat ali khan",
    "nusrat fateh",
    "nusrat",
    "nfak",
    "ustad nusrat fateh ali khan",
    "ustad nusrat",
    "nusrat khan",
    "nusrat sahab",
    "nusrat fateh ali khan sahab",
    "نصرت فتح علی خان",
    "استاد نصرت فتح علی خان",
    "نصرت فتح علی",
    "نصرت صاحب",
    "نصرت خان",
    "نصرت",
    "خان صاحب نصرت",
    "नुसरत फतेह अली खान",
    "नुसरत फ़तेह अली ख़ान",
    "नुसरत फ़तेह अली खान",
    "उस्ताद नुसरत फतेह अली खान",
    "नुसरत",
    "ਨੁਸਰਤ ਫਤਿਹ ਅਲੀ ਖਾਨ",
    "ਨੁਸਰਤ",
  ],
  "Lakhwinder Wadali": [
    "lakhwinder wadali",
    "lakhwinder",
    "wadali lakhwinder",
    "लखविंदर वडाली",
    "लखविंदर",
    "ਲਖਵਿੰਦਰ ਵਡਾਲੀ",
    "ਲਖਵਿੰਦਰ",
    "لکھویندر ودالی",
    "لکھویندر",
  ],
  "Sabri Brothers": [
    "sabri brothers",
    "sabri brotheran",
    "sabri",
    "ghulam farid sabri",
    "maqbool ahmed sabri",
    "haji ghulam farid sabri",
    "صابری برادران",
    "غلام فرید صابری",
    "مقبول احمد صابری",
    "صابری",
    "साबरी ब्रदर्स",
    "साबरी बिरादरान",
    "साबरी",
  ],
  "Rahat Fateh Ali Khan": [
    "rahat fateh ali khan",
    "rahat ali khan",
    "rahat fateh ali",
    "rahat",
    "ustad rahat fateh ali khan",
    "ustad rahat",
    "راحت فتح علی خان",
    "استاد راحت فتح علی خان",
    "راحت",
    "राहत फतेह अली खान",
    "राहत",
  ],
  "Abida Parveen": [
    "abida parveen",
    "abida parveen begum",
    "abida",
    "begum abida parveen",
    "عابدہ پروین",
    "عابدہ",
    "आबिदा परवीन",
    "आबिदा",
  ],
  "Aziz Mian": [
    "aziz mian",
    "azeez mian",
    "aziz mian qawwal",
    "عزیز میاں",
    "عزیز میاں قوال",
    "अज़ीज़ मियाँ",
    "अज़ीज़ मियाँ क़व्वाल",
  ],
  "Amjad Sabri": [
    "amjad sabri",
    "amjad fareed sabri",
    "امجد صابری",
    "امجد فرید صابری",
    "अमजद साबरी",
  ],
  "Wadali Brothers": [
    "wadali brothers",
    "puranchand wadali",
    "pyarelal wadali",
    "puranchand pyarelal wadali",
    "ਵਡਾਲੀ ਬ੍ਰਦਰਜ਼",
    "ودالی برادران",
    "वडाली ब्रदर्स",
  ],
  "Nooran Sisters": [
    "nooran sisters",
    "jyoti nooran",
    "sultana nooran",
    "ਨੂਰਾਂ ਸਿਸਟਰਜ਼",
    "नूरा सिस्टर्स",
    "نوراں سسٹرز",
  ],
  "Ghulam Ali": [
    "ghulam ali",
    "ustad ghulam ali",
    "غلام علی",
    "استاد غلام علی",
    "गुलाम अली",
  ],
  "Mehdi Hassan": [
    "mehdi hassan",
    "khan sahab mehdi hassan",
    "مہدی حسن",
    "خان صاحب مہدی حسن",
    "मेहदी हसन",
  ],
  "Atif Aslam": [
    "atif aslam",
    "عاطف اسلم",
    "आतिफ असलम",
  ],
  "Jaipal Sahota": [
    "jaipal sahota",
    "jaipal",
    "jai paul sahota",
    "jaipaul sahota",
    "jai paul",
    "sahota",
    "جے پال سہوتا",
    "جے پال",
    "سہوتا",
    "जयपाल सहोता",
    "जय पाल सहोता",
    "जयपाल",
    "ਜੈਪਾਲ ਸਹੋਤਾ",
    "ਜੈ ਪਾਲ ਸਹੋਤਾ",
    "ਸਹੋਤਾ",
  ],
};

/** Normalize string by lowercasing, trimming, and stripping punctuation/extra spaces */
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()'"?।]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Check if input matches any known alias of a canonical singer */
export function matchCanonicalSinger(raw: string): string | null {
  if (!raw || !raw.trim()) return null;
  const cleaned = cleanText(raw);

  // Exact or alias match
  for (const [canonical, aliases] of Object.entries(ARTIST_ALIASES)) {
    for (const alias of aliases) {
      const cleanedAlias = cleanText(alias);
      if (cleaned === cleanedAlias) return canonical;
    }
  }

  // Substring / keyword match for prominent artists
  if (
    cleaned.includes("nusrat") ||
    raw.includes("نصرت") ||
    raw.includes("नुसरत") ||
    raw.includes("ਨੁਸਰਤ")
  ) {
    return "Nusrat Fateh Ali Khan";
  }

  if (
    cleaned.includes("lakhwinder") ||
    raw.includes("لکھویندر") ||
    raw.includes("लखविंदर") ||
    raw.includes("ਲਖਵਿੰਦਰ")
  ) {
    return "Lakhwinder Wadali";
  }

  if (
    cleaned.includes("sabri brother") ||
    cleaned.includes("sabri brotheran") ||
    raw.includes("صابری برادران") ||
    raw.includes("साबरी ब्रदर्स")
  ) {
    return "Sabri Brothers";
  }

  if (
    cleaned.includes("rahat") ||
    raw.includes("راحت") ||
    raw.includes("राहत")
  ) {
    return "Rahat Fateh Ali Khan";
  }

  if (
    cleaned.includes("abida") ||
    raw.includes("عابدہ") ||
    raw.includes("आबिदा")
  ) {
    return "Abida Parveen";
  }

  if (
    cleaned.includes("aziz mian") ||
    raw.includes("عزیز میاں") ||
    raw.includes("अज़ीज़ मियाँ")
  ) {
    return "Aziz Mian";
  }

  if (
    cleaned.includes("amjad sabri") ||
    raw.includes("امجد صابری") ||
    raw.includes("अमजद साबरी")
  ) {
    return "Amjad Sabri";
  }

  if (
    cleaned.includes("sahota") ||
    cleaned.includes("jaipal") ||
    cleaned.includes("jai paul") ||
    raw.includes("سہوتا") ||
    raw.includes("جے پال") ||
    raw.includes("सहोता") ||
    raw.includes("जयपाल") ||
    raw.includes("ਸਹੋਤਾ")
  ) {
    return "Jaipal Sahota";
  }

  return null;
}

/**
 * Returns a uniform group key for any singer.
 * Guarantees that "Nusrat Fateh Ali Khan", "نصرت فتح علی خان", and
 * "Ustad Nusrat Fateh Ali Khan" all yield the exact same key.
 */
export function singerKey(singer: string): string {
  if (!singer) return "unknown";

  // Check canonical match first
  const canonical = matchCanonicalSinger(singer);
  if (canonical) {
    return cleanText(canonical).replace(/\s+/g, "-");
  }

  // If bilingual/trilingual with slashes (e.g. "Lakhwinder Wadali / लखविंदर वडाली"), take first part
  const primary = singer.split("/")[0].trim() || singer.trim();

  // Strip common honorifics
  const stripped = primary
    .replace(/^(ustad|ustaad|khan sahab|pandit|hazrat|baba|peer|pir|sufi|saint|syed|dr\.|sheikh)\s+/i, "")
    .replace(/\s+(sahab|saheb|ji|qawwal|qawwal party|and party|brotheran)$/i, "")
    .trim();

  return cleanText(stripped || primary).replace(/\s+/g, "-") || "unknown";
}

/**
 * Returns the best human-readable display name for a singer.
 */
export function getDisplaySinger(singer: string): string {
  const canonical = matchCanonicalSinger(singer);
  if (canonical) return canonical;

  // Use primary part before slash
  const primary = singer.split("/")[0].trim();
  const raw = primary || singer.trim() || "Unknown Singer";
  return formatSingerName(raw);
}

const STORAGE_CUSTOM_SINGERS = "ms-custom-singers";

/** Get user-added custom singers from localStorage */
export function getCustomSingers(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_CUSTOM_SINGERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((s): s is string => typeof s === "string" && Boolean(s.trim()));
      }
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

/** Format singer name cleanly with title casing if Latin alphabet */
export function formatSingerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // If it's plain lowercase/mixed Latin, title-case words
  if (/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return trimmed
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return trimmed;
}

/** Save a new singer name automatically into custom singers memory */
export function saveCustomSinger(name: string): string[] {
  const formatted = formatSingerName(name);
  if (!formatted) return getCustomSingers();

  // If already matches canonical, don't duplicate
  const canonical = matchCanonicalSinger(formatted);
  const target = canonical || formatted;

  const current = getCustomSingers();
  if (
    !current.some((s) => s.toLowerCase() === target.toLowerCase()) &&
    !POPULAR_SINGERS.some((s) => s.toLowerCase() === target.toLowerCase())
  ) {
    const updated = [target, ...current];
    try {
      localStorage.setItem(STORAGE_CUSTOM_SINGERS, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
    return updated;
  }
  return current;
}
