// Saves the default public Learning Progress figures into the site (src/data/learningProgressSeed.json)
// so the home page and the report show real numbers before any network answer. Runs before every
// build; if the API can't be reached, the file already in the repo is kept and the build goes on.
import fs from "fs";
import path from "path";

const out = path.join(process.cwd(), "src", "data", "learningProgressSeed.json");

// The same API the build points at: VITE_API_BASE_URL from the environment, else from .env
const fromEnvFile = () => {
	try {
		const line = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split("\n").find((l) => l.startsWith("VITE_API_BASE_URL="));
		return line ? line.slice("VITE_API_BASE_URL=".length).trim() : "";
	} catch {
		return "";
	}
};
const apiBase = process.env.VITE_API_BASE_URL || fromEnvFile();

async function get(params) {
	const res = await fetch(`${apiBase}/public/learning-progress?${new URLSearchParams(params)}`, { signal: AbortSignal.timeout(60000) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return (await res.json()).data;
}

try {
	if (!apiBase) throw new Error("VITE_API_BASE_URL is not set");
	const [tests, fln] = await Promise.all([get({}), get({ view: "fln" })]);
	fs.writeFileSync(out, JSON.stringify({ apiBase, savedAt: new Date().toISOString(), tests, fln }));
	console.log(`Learning Progress figures saved from ${apiBase} (data as of ${tests.dataAsOf})`);
} catch (error) {
	console.warn(`Learning Progress figures not refreshed (${error.message}); keeping ${path.relative(process.cwd(), out)}`);
	if (!fs.existsSync(out)) fs.writeFileSync(out, JSON.stringify({ apiBase: "", savedAt: null, tests: null, fln: null }));
}
