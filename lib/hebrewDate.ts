/**
 * Hebrew-calendar date formatting with proper Hebrew numerals (gematria).
 * ICU resolves the `hebr` numbering system to `latn` in Node and some browsers,
 * so digits are converted here — deterministic across preview and PDF (spec §12).
 * Output: `יום שני, א׳ באדר ב׳ תשפ״ד (11.03.2024)`
 */

const GERESH = "׳"; // ׳
const GERSHAYIM = "״"; // ״

const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש", "ת"];

/** 1–9999 → gematria letters with geresh/gershayim (15/16 → ט״ו/ט״ז). */
export function toGematria(n: number): string {
  let rest = n % 1000; // years drop the thousands (5784 → 784 → תשפ"ד)
  let out = "";
  while (rest >= 400) {
    out += "ת";
    rest -= 400;
  }
  out += HUNDREDS[Math.floor(rest / 100)];
  rest %= 100;
  if (rest === 15) out += "טו";
  else if (rest === 16) out += "טז";
  else out += TENS[Math.floor(rest / 10)] + ONES[rest % 10];
  if (out.length === 1) return out + GERESH;
  return out.slice(0, -1) + GERSHAYIM + out.slice(-1);
}

/** Full Hebrew date + Gregorian in parentheses, from an ISO date string. */
export function formatHebrewDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return isoDate;

  // Hebrew-calendar day/month/year via Intl; digits converted to gematria below.
  const parts = new Intl.DateTimeFormat("he-u-ca-hebrew", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = toGematria(parseInt(get("day"), 10));
  const month = get("month");
  const year = toGematria(parseInt(get("year"), 10));

  const weekday = new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(d);
  const gregorian = new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

  return `${weekday}, ${day} ב${month} ${year} (${gregorian})`;
}
