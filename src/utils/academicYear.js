// Academic year runs April to March (same rule as the API)

// Start year of the academic year a date falls in, e.g. Oct 2026 -> 2026, Feb 2027 -> 2026
export const getAcademicYearStart = (date = new Date()) =>
  date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;

// 2026 -> "2026-27" (for display)
export const formatAcademicYear = (startYear) => `${startYear}-${String(startYear + 1).slice(-2)}`;

// 2026 -> "2026-2027" (the form the API takes in ?year=)
export const toApiAcademicYear = (startYear) => `${startYear}-${startYear + 1}`;

// "2026-2027" or "2026-27" -> "2026-27"; anything else -> the current academic year
export const toDisplayAcademicYear = (year) => {
  const match = /^(\d{4})-(\d{2}|\d{4})$/.exec(String(year || "").trim());
  return formatAcademicYear(match ? Number(match[1]) : getAcademicYearStart());
};

export const getCurrentAcademicYear = () => formatAcademicYear(getAcademicYearStart());

// First academic year with data in PDLD
const FIRST_ACADEMIC_YEAR_START = 2024;

// Start years from the current academic year back to the first one, newest first
export const getAcademicYearStarts = () => {
  const years = [];
  for (let y = getAcademicYearStart(); y >= FIRST_ACADEMIC_YEAR_START; y--) years.push(y);
  return years;
};

// "DD-MM-YYYY" bounds of an academic year (1 Apr to 31 Mar), the format /test/filter takes
export const getAcademicYearDateRange = (startYear) => ({
  startDate: `01-04-${startYear}`,
  endDate: `31-03-${startYear + 1}`,
});

// Remembers a page's academic year choice for this browser tab, so it survives going to a
// detail page and back. Storage can be unavailable (private mode), so failures fall back.
export const readStoredAcademicYear = (key, fallback) => {
  try {
    const stored = sessionStorage.getItem(`academicYear:${key}`);
    if (stored === "all") return stored;
    const year = Number(stored);
    return stored && getAcademicYearStarts().includes(year) ? year : fallback;
  } catch {
    return fallback;
  }
};

export const storeAcademicYear = (key, value) => {
  try {
    sessionStorage.setItem(`academicYear:${key}`, String(value));
  } catch {
    // not critical
  }
};
