import axios from "axios";
import apiInstance from "../../../api";
import seed from "../../data/learningProgressSeed.json";

// Learning Progress look: the dashboard theme (theme/theme.js) plus one teal ramp for grades and
// levels, darkest = best. Text on the two darkest steps is white; the rest use ink
export const INK = "#2F4F4F";
export const MUTED = "#597272";
export const LINK = "#025B5A";
export const BORDER = "#DEDEDE";
export const PAGE_BG = "#F5F7F7";
export const YELLOW = "#FED700";
export const TEAL = "#049796";
export const WARN_BG = "#FFEFD6";
export const WARN_FG = "#7a5418";

export const HEADING_FONT = "'Philosopher', sans-serif";
export const BODY_FONT = "'Karla', sans-serif";
export const DEVANAGARI_FONT = "'Noto Sans Devanagari', 'Karla', sans-serif";

// Data colours: the blue scale from the first Learning Progress preview, darkest = best. The page
// itself stays plain like the other reports (white cards, dark teal text, yellow main buttons)
export const BLUE = "#3987e5";
export const BLUE_DARK = "#1c5cab";
export const GRADE = {
	A: { bg: "#184f95", fg: "#ffffff", bd: "#184f95" },
	B: { bg: "#256abf", fg: "#ffffff", bd: "#256abf" },
	C: { bg: "#9ec5f4", fg: INK, bd: "#9ec5f4" },
	D: { bg: "#cde2fb", fg: INK, bd: "#cde2fb" },
	E: { bg: "#eef2f7", fg: INK, bd: "#c9d3df" },
};
export const GRADE_BANDS = [
	["A", "81–100%", 4],
	["B", "61–80%", 3],
	["C", "41–60%", 2],
	["D", "33–40%", 1],
	["E", "Below 33%", 0],
];
export const RAMP = ["#e3effd", "#cde2fb", "#9ec5f4", "#256abf", "#184f95"];
export const rampIndex = (v) => (v < 45 ? 0 : v < 55 ? 1 : v < 65 ? 2 : v < 75 ? 3 : 4);
export const LEVEL_RAMP = { 5: ["#eef2f7", "#cde2fb", "#9ec5f4", "#256abf", "#184f95"], 4: ["#eef2f7", "#9ec5f4", "#256abf", "#184f95"] };
export const TEST_SERIES = ["#cde2fb", "#9ec5f4", "#6da7ec", "#256abf", "#184f95"];

// Level names as the app stores them, with an English gloss
export const LEVEL_LABEL = {
	CAPITAL_LETTER: "Capital letters",
	SMALL_LETTER: "Small letters",
	WORD: "Words",
	SENTENCE: "Sentences",
};
export const LEVEL_GLOSS = {
	"प्रारंभिक": "Beginner",
	"अक्षर": "Letters",
	"शब्द": "Words",
	"अनुच्छेद": "Paragraph",
	"कहानी": "Story",
	"अंक पहचान": "Digits",
	"संख्या पहचान": "Numbers",
	"घटाव": "Subtraction",
	"भाग": "Division",
};

// "BADE KARLI" → "Bade Karli"; names are stored in capitals
export const titleCase = (s) =>
	String(s || "")
		.toLowerCase()
		.replace(/(^|[\s(.-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
export const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));
export const pct = (v) => (v == null ? "—" : `${v}%`);
export const classLabel = (key) =>
	({ "1-8": "Classes 1–8", "1-5": "Classes 1–5 (primary)", "6-8": "Classes 6–8 (middle)", "9-12": "Classes 9–12" }[key] || `Class ${key}`);
export const placeName = (place) => {
	if (!place) return "Dantewada district";
	if (place.level === "school") return place.school?.name || "School";
	if (place.level === "cluster") return `${titleCase(place.cluster)} cluster`;
	if (place.level === "block") return `${titleCase(place.block)} block`;
	return "Dantewada district";
};
export const unitWord = { block: ["Block", "Blocks"], cluster: ["Cluster", "Clusters"], school: ["School", "Schools"] };

// Public pages call the API without a login; dashboard pages go through apiInstance (adds the token)
const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
const cleanParams = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
export const fetchLearningProgress = (audience, params) => {
	const clean = cleanParams(params);
	const request = audience === "public"
		? publicClient.get("/public/learning-progress", { params: clean })
		: apiInstance.get("/report/learning-progress", { params: clean });
	return request.then((res) => res.data.data);
};

// Public figures to show before (or without) a network answer, so a visitor never waits: the last
// answer this browser saw for the same filters, else the figures saved into the site at build
// time (src/data/learningProgressSeed.json, from scripts/fetch-learning-progress-seed.mjs). The
// saved figures are used only if they came from this site's own API.
const cacheKey = (params) => `lp:public:${JSON.stringify(Object.entries(cleanParams(params)).sort())}`;
export function cachedPublicReport(params) {
	try {
		const hit = localStorage.getItem(cacheKey(params));
		if (hit) return JSON.parse(hit);
	} catch {
		// storage blocked: fall through to the saved figures
	}
	const clean = cleanParams(params);
	const keys = Object.keys(clean);
	if (seed.apiBase !== import.meta.env.VITE_API_BASE_URL) return null;
	if (keys.length === 0) return seed.tests || null;
	if (keys.length === 1 && clean.view === "fln") return seed.fln || null;
	return null;
}
export function savePublicReport(params, data) {
	try {
		localStorage.setItem(cacheKey(params), JSON.stringify(data));
	} catch {
		// storage full or blocked: the next visit fetches again
	}
}
