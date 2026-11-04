import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import badge from "../../assets/pdld-badge.svg";
import {
	BORDER, DEVANAGARI_FONT, GRADE, GRADE_BANDS, HEADING_FONT, INK, LEVEL_GLOSS, LEVEL_LABEL, LEVEL_RAMP, LINK, MUTED,
	RAMP, TEST_SERIES, WARN_BG, WARN_FG, YELLOW, BLUE, BLUE_DARK, cachedPublicReport, classLabel, fetchLearningProgress, fmt, pct,
	placeName, rampIndex, savePublicReport, titleCase, unitWord,
} from "./lpTheme";
import { downloadCsv, downloadExcel, fileBase, pendingSheet, reportSheets, unitSheet } from "./exporters";

// The Learning Progress report, shared by the public website (audience "public": district, blocks
// and clusters only) and the dashboard (audience "staff": adds schools, marks not entered and
// downloads; schoolMode pins it to a headmaster's own school). Filters live in the URL so a view
// can be shared as a link.

const PARAMS = ["view", "year", "test", "from", "to", "block", "cluster", "school", "classes", "subject", "compareBy"];
const CLASS_OPTIONS = ["1-8", "1-5", "6-8", "9-12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const card = { background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 20, boxSizing: "border-box" };
const h2 = { fontFamily: HEADING_FONT, fontSize: 24, fontWeight: 700, margin: 0, color: INK };
const note = { margin: "4px 0 0", fontSize: 15, color: MUTED };
const selectStyle = { minWidth: 140, height: 44, border: "1px solid #C4CDCD", borderRadius: 8, padding: "0 10px", color: INK, background: "#ffffff", font: "inherit", fontSize: 15 };
const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: 14, color: MUTED };
const th = { padding: "10px 8px", fontWeight: 600, textAlign: "left", fontSize: 14, color: MUTED, borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" };
const td = { padding: "10px 8px", borderBottom: "1px solid #EAEDED", fontSize: 15 };
const linkButton = { background: "none", border: "none", padding: 0, font: "inherit", fontWeight: 800, color: LINK, cursor: "pointer", textAlign: "left", textDecoration: "underline", textUnderlineOffset: 3 };

const PRINT_CSS = `
@media print {
  body * { visibility: hidden; }
  .lp-print-area, .lp-print-area * { visibility: visible; }
  .lp-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .lp-noprint { display: none !important; }
  .lp-print-only { display: flex !important; }
  .lp-print-area section { break-inside: avoid; }
}`;

export function GradeBadge({ grade, size = 36, hiddenLabel }) {
	if (!grade) return <span style={{ display: "inline-flex", width: size, height: size, alignItems: "center", justifyContent: "center", color: MUTED }}>—</span>;
	const g = GRADE[grade] || GRADE.E;
	return (
		<span
			aria-label={`Grade ${grade}`}
			title={hiddenLabel}
			style={{
				display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
				width: size, height: size, borderRadius: Math.round(size * 0.24), background: g.bg, color: g.fg,
				border: `1px solid ${g.bd}`, fontFamily: HEADING_FONT, fontWeight: 700, fontSize: Math.round(size * 0.62), lineHeight: 1,
			}}
		>
			{grade}
		</span>
	);
}

const GradeShares = ({ shares, width = "100%" }) => (
	<div>
		<div role="img" aria-label={`Children by grade: ${GRADE_BANDS.map(([l]) => `${l} ${shares[l]}%`).join(", ")}`} style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", width }}>
			{GRADE_BANDS.map(([l]) => <div key={l} style={{ width: `${shares[l]}%`, background: l === "E" ? "#E3E8E8" : GRADE[l].bg }} />)}
		</div>
		<div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED, marginTop: 4, width }}>
			{GRADE_BANDS.map(([l]) => <span key={l}>{l} {Math.round(shares[l])}%</span>)}
		</div>
	</div>
);

const Delta = ({ now, prev }) => {
	if (now == null || prev == null) return null;
	const d = Math.round((now - prev) * 10) / 10;
	return <span style={{ color: d >= 0 ? BLUE_DARK : "#a12d23", fontWeight: 700 }}>{d >= 0 ? "▲" : "▼"} {Math.abs(d)}</span>;
};

const Empty = ({ children }) => <div style={{ ...card, color: MUTED, fontSize: 16 }}>{children}</div>;

const Section = ({ title, subtitle, action, children }) => (
	<section style={{ ...card, marginBottom: 20 }}>
		<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
			<div>
				<h2 style={h2}>{title}</h2>
				{subtitle && <p style={note}>{subtitle}</p>}
			</div>
			{action && <div className="lp-noprint" style={{ alignSelf: "flex-start" }}>{action}</div>}
		</div>
		{children}
	</section>
);

const SmallDownload = ({ onExcel, onCsv }) => (
	<div style={{ display: "flex", gap: 6 }}>
		<button type="button" onClick={onExcel} style={{ height: 40, border: "1px solid #C4CDCD", background: "#ffffff", color: INK, borderRadius: 20, padding: "0 14px", font: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>⤓ Excel</button>
		{onCsv && <button type="button" onClick={onCsv} style={{ height: 40, border: "1px solid #C4CDCD", background: "#ffffff", color: INK, borderRadius: 20, padding: "0 12px", font: "inherit", fontSize: 14, cursor: "pointer" }}>CSV</button>}
	</div>
);

// ---------- class tests ----------

function SummaryCards({ data }) {
	const { summary, place } = data;
	const now = summary?.now;
	if (!now) return <Empty>No marks have been entered yet for this selection.</Empty>;
	if (now.hidden) return <Empty>Fewer than 10 children were assessed here, so the figures are not shown publicly.</Empty>;
	const prev = summary.prev && !summary.prev.hidden ? summary.prev : null;
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
			<div style={{ ...card, flex: "1 1 380px", display: "flex", gap: 18, alignItems: "center" }}>
				<GradeBadge grade={now.grade} size={104} />
				<div style={{ minWidth: 0, flex: "1 1 auto" }}>
					<div style={{ fontSize: 15, color: MUTED }}>{placeName(place)} grade · {data.testLabel}</div>
					<div style={{ fontSize: 16, margin: "2px 0 10px" }}>
						{now.points} of 4 grade points{prev ? <> · {summary.prevTag} was <b>{prev.grade}</b> ({prev.points})</> : null}
					</div>
					<GradeShares shares={now.shares} />
				</div>
			</div>
			<div style={{ ...card, flex: "1 1 180px" }}>
				<div style={{ fontSize: 15, color: MUTED }}>Average score</div>
				<div style={{ fontSize: 36, fontWeight: 800 }}>{pct(now.avgPct)}</div>
				{prev && <div style={{ fontSize: 14 }}><Delta now={now.avgPct} prev={prev.avgPct} /> <span style={{ color: MUTED }}>pts since {summary.prevTag}</span></div>}
			</div>
			<div style={{ ...card, flex: "1 1 180px" }}>
				<div style={{ fontSize: 15, color: MUTED }}>Passed (33% or more)</div>
				<div style={{ fontSize: 36, fontWeight: 800 }}>{pct(now.passPct)}</div>
				{prev && <div style={{ fontSize: 14 }}><Delta now={now.passPct} prev={prev.passPct} /> <span style={{ color: MUTED }}>pts since {summary.prevTag}</span></div>}
			</div>
			<div style={{ ...card, flex: "1 1 180px" }}>
				<div style={{ fontSize: 15, color: MUTED }}>Children assessed</div>
				<div style={{ fontSize: 36, fontWeight: 800 }}>{fmt(now.present)}</div>
				<div style={{ fontSize: 14, color: MUTED }}>{classLabel(data.classes)}</div>
			</div>
		</div>
	);
}

function Matrix({ data }) {
	const [metric, setMetric] = useState("grade");
	const { subjects, rows } = data.matrix || { subjects: [], rows: [] };
	if (!rows.length) return null;
	const cell = (s, strong) => {
		if (!s) return { main: "—", sub: "", bg: "#ffffff", fg: "#949494", bd: "#EAEDED", tip: "No marks" };
		if (s.hidden) return { main: "·", sub: "under 10", bg: "#ffffff", fg: MUTED, bd: "#EAEDED", tip: "Fewer than 10 children" };
		if (metric === "grade") {
			const g = GRADE[s.grade] || GRADE.E;
			return { main: s.grade || "—", sub: pct(s.avgPct), bg: g.bg, fg: g.fg, bd: strong ? INK : g.bd, tip: `Grade ${s.grade}, average ${s.avgPct}%, ${s.present} children` };
		}
		const v = metric === "avg" ? s.avgPct : s.passPct;
		const i = rampIndex(v ?? 0);
		return { main: v == null ? "—" : `${Math.round(v)}%`, sub: metric === "avg" ? "average" : "passed", bg: RAMP[i], fg: i >= 3 ? "#ffffff" : INK, bd: strong ? INK : RAMP[i], tip: `${v}% · ${s.present} children` };
	};
	const Cell = ({ s, strong }) => {
		const c = cell(s, strong);
		return (
			<td title={c.tip} style={{ textAlign: "center", borderRadius: 8, padding: "8px 4px", background: c.bg, color: c.fg, border: `${strong ? 2 : 1}px solid ${c.bd}` }}>
				<div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.1 }}>{c.main}</div>
				<div style={{ fontSize: 12 }}>{c.sub}</div>
			</td>
		);
	};
	return (
		<Section
			title="Class × subject"
			subtitle={`${placeName(data.place)}, ${data.testLabel} ${data.year}. Hover a cell for the number of children.`}
			action={
				<div role="group" aria-label="Show" style={{ display: "flex", border: "1px solid #C4CDCD", borderRadius: 10, overflow: "hidden", height: 42 }}>
					{[["grade", "Grade"], ["avg", "Average %"], ["pass", "Pass rate"]].map(([k, l]) => (
						<button key={k} type="button" aria-pressed={metric === k} onClick={() => setMetric(k)} style={{ border: "none", padding: "0 14px", font: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", background: metric === k ? INK : "#ffffff", color: metric === k ? "#ffffff" : INK }}>{l}</button>
					))}
				</div>
			}
		>
			<div style={{ overflowX: "auto" }}>
				<table style={{ borderCollapse: "separate", borderSpacing: 5, fontSize: 14, minWidth: Math.max(480, 110 + subjects.length * 96), width: "100%" }}>
					<thead>
						<tr>
							<th scope="col" />
							{subjects.map((s) => <th key={s} scope="col" style={{ fontWeight: 600, color: MUTED, fontSize: 14, paddingBottom: 4 }}>{s}</th>)}
							<th scope="col" style={{ fontWeight: 800, fontSize: 14, paddingBottom: 4 }}>Class</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r.cls}>
								<th scope="row" style={{ textAlign: "left", fontWeight: 600, color: MUTED, fontSize: 14, whiteSpace: "nowrap", paddingRight: 6 }}>Class {r.cls}</th>
								{subjects.map((s) => <Cell key={s} s={r.cells[s]} />)}
								<Cell s={r.total} strong />
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12, fontSize: 14, color: MUTED }}>
				{metric === "grade"
					? GRADE_BANDS.map(([l, range]) => <span key={l} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><GradeBadge grade={l} size={24} />{range}</span>)
					: <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>Below 45%{RAMP.map((c) => <span key={c} style={{ width: 26, height: 10, background: c }} />)}75% and above</span>}
			</div>
		</Section>
	);
}

function CompareTests({ data }) {
	const tests = data.compareTests || [];
	if (tests.length < 2) return null;
	const subjects = data.matrix?.subjects || [];
	const colours = TEST_SERIES.slice(-tests.length);
	const latest = tests.length - 1;
	return (
		<Section
			title="Compare tests"
			subtitle={`Average score by subject in each class test of ${data.year}. ${placeName(data.place)}, ${classLabel(data.classes)}.`}
			action={
				<div style={{ display: "flex", gap: 14, fontSize: 14, color: MUTED, flexWrap: "wrap" }}>
					{tests.map((t, i) => <span key={t.tag} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 14, height: 14, background: colours[i], borderRadius: 3 }} />{t.label}</span>)}
				</div>
			}
		>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "8px 32px" }}>
				{["__all", ...subjects].map((s) => {
					const values = tests.map((t) => (s === "__all" ? t.overall : t.subjects?.[s]));
					const last = values[latest];
					const before = values[latest - 1];
					return (
						<div key={s} style={{ display: "grid", gridTemplateColumns: "116px minmax(0, 1fr)", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: "1px solid #EAEDED" }}>
							<div>
								<div style={{ fontWeight: 800 }}>{s === "__all" ? "All subjects" : s}</div>
								<div style={{ fontSize: 13 }}><Delta now={last?.avgPct} prev={before?.avgPct} /> {before?.avgPct != null && last?.avgPct != null && <span style={{ color: MUTED }}>since {tests[latest - 1].label}</span>}</div>
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
								{values.map((v, i) => (
									<div key={tests[i].tag} style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<div style={{ height: 10, borderRadius: 2, background: colours[i], width: v?.avgPct != null ? `${v.avgPct}%` : 0 }} />
										<span style={{ fontSize: 13, color: i === latest ? INK : MUTED, fontWeight: i === latest ? 800 : 400 }}>{v?.hidden ? "under 10" : pct(v?.avgPct)}</span>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</Section>
	);
}

function Units({ data, audience, onDrill, onDownload }) {
	const level = data.compareBy;
	if (!level) return null;
	const isSchool = level === "school";
	const units = data.units || [];
	const prevTag = data.summary?.prevTag;
	return (
		<Section
			title={`${unitWord[level][1]} in ${placeName(data.place)}`}
			subtitle={`${data.testLabel} ${data.year}. Lowest grade first.${audience === "public" || isSchool ? "" : " Open one to see it on its own."}`}
			action={onDownload && <SmallDownload onExcel={() => onDownload("xlsx")} onCsv={() => onDownload("csv")} />}
		>
			<div style={{ overflowX: "auto" }}>
				<table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
					<thead>
						<tr>
							<th scope="col" style={th}>Grade</th>
							<th scope="col" style={th}>{unitWord[level][0]}</th>
							{isSchool && <th scope="col" style={th}>Cluster</th>}
							<th scope="col" style={th}>{isSchool ? "Marks" : "Schools that entered marks"}</th>
							<th scope="col" style={{ ...th, textAlign: "right" }}>Children</th>
							<th scope="col" style={{ ...th, textAlign: "right" }}>Average</th>
							<th scope="col" style={{ ...th, textAlign: "right" }}>Passed</th>
							{prevTag && <th scope="col" style={{ ...th, textAlign: "right" }}>Since {prevTag}</th>}
						</tr>
					</thead>
					<tbody>
						{units.map((u) => {
							const hidden = u.now?.hidden;
							const fade = u.early ? 0.55 : 1;
							const marks = u.marks;
							const marksLabel = !marks ? "" : marks.due == null ? `${marks.entered} entered` : marks.entered === 0 ? "Not entered" : marks.entered >= marks.due ? "All entered" : `${marks.entered} of ${marks.due}`;
							const marksStyle = !marks || marks.due == null ? {} : marks.entered === 0 ? { background: "#FFE5E3", color: "#a12d23" } : marks.entered >= marks.due ? { background: "#E9F5E9", color: "#1d5e3a" } : { background: WARN_BG, color: WARN_FG };
							return (
								<tr key={u.key}>
									<td style={td}><GradeBadge grade={hidden ? null : u.now?.grade} size={38} /></td>
									<td style={td}>
										{onDrill ? <button type="button" style={linkButton} onClick={() => onDrill(level, u)}>{isSchool ? u.name : titleCase(u.name)}</button> : <b>{isSchool ? u.name : titleCase(u.name)}</b>}
										{isSchool && <div style={{ fontSize: 13, color: MUTED }}>UDISE {u.udise}</div>}
										{u.early && <span style={{ marginLeft: 8, fontSize: 13, color: WARN_FG, background: WARN_BG, borderRadius: 10, padding: "2px 9px" }}>early result</span>}
									</td>
									{isSchool && <td style={{ ...td, color: MUTED }}>{titleCase(u.cluster)}</td>}
									<td style={{ ...td, minWidth: 150 }}>
										{isSchool ? (
											<span style={{ fontSize: 13, fontWeight: 700, padding: "3px 9px", borderRadius: 10, ...marksStyle }}>{marksLabel}</span>
										) : u.eligible ? (
											<>
												<div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>{u.entered} / {u.eligible}</span><span style={{ color: MUTED }}>{Math.round((u.entered / u.eligible) * 100)}%</span></div>
												<div style={{ height: 6, background: "#EAEDED", borderRadius: 3, marginTop: 4 }}><div style={{ height: 6, borderRadius: 3, background: BLUE, width: `${Math.min(100, (u.entered / u.eligible) * 100)}%` }} /></div>
											</>
										) : <span>{u.entered}</span>}
									</td>
									<td style={{ ...td, textAlign: "right", opacity: fade }}>{hidden ? "under 10" : fmt(u.now?.present)}</td>
									<td style={{ ...td, textAlign: "right", fontWeight: 800, opacity: fade }}>{hidden ? "" : pct(u.now?.avgPct)}</td>
									<td style={{ ...td, textAlign: "right", opacity: fade }}>{hidden ? "" : pct(u.now?.passPct)}</td>
									{prevTag && <td style={{ ...td, textAlign: "right", opacity: fade }}>{hidden ? "" : <Delta now={u.now?.avgPct} prev={u.prev?.hidden ? null : u.prev?.avgPct} />}</td>}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<p style={{ ...note, fontSize: 14, marginTop: 12 }}>
				{data.isCurrentYear ? "“Early result”: fewer than 60% of the schools that should enter marks have done so, so the average may change. " : ""}
				{audience === "public" ? "Groups with fewer than 10 children are not shown." : ""}
			</p>
		</Section>
	);
}

function Pending({ data, onDownload }) {
	const [all, setAll] = useState(false);
	if (!data.pending) return null;
	const list = data.pending.schools;
	const shown = all ? list : list.slice(0, 8);
	const deadline = data.pending.deadline ? new Date(data.pending.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
	return (
		<Section
			title="Marks not entered"
			subtitle={`${list.length} school${list.length === 1 ? "" : "s"} in ${placeName(data.place)} still have class-subjects to enter for ${data.testLabel}${deadline ? ` · deadline ${deadline}` : ""}.`}
			action={list.length > 0 && <SmallDownload onExcel={() => onDownload("xlsx")} onCsv={() => onDownload("csv")} />}
		>
			{list.length === 0 ? <p style={{ margin: 0, fontSize: 16 }}>Every school has entered all its marks.</p> : (
				<>
					{shown.map((s) => (
						<div key={s.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, padding: "10px 0", borderBottom: "1px solid #EAEDED" }}>
							<div>
								<b>{s.name}</b> <span style={{ fontSize: 13, color: MUTED }}>UDISE {s.udise} · {titleCase(s.cluster)}</span>
								<div style={{ fontSize: 14, color: MUTED }}>{s.missing.length === s.due ? "Nothing entered yet" : s.missing.map((m) => `Class ${m.cls} ${m.subject}`).join(", ")}</div>
							</div>
							<span style={{ fontSize: 14, color: WARN_FG, whiteSpace: "nowrap" }}>{s.missing.length} of {s.due} missing</span>
						</div>
					))}
					{list.length > 8 && <button type="button" onClick={() => setAll(!all)} style={{ ...linkButton, marginTop: 12 }}>{all ? "Show fewer" : `Show all ${list.length}`}</button>}
				</>
			)}
		</Section>
	);
}

// ---------- reading and maths levels ----------

const levelText = (l) => LEVEL_LABEL[l] || l;
const isDevanagari = (l) => !LEVEL_LABEL[l];

function LevelBar({ stats, levels, label }) {
	const ramp = LEVEL_RAMP[levels.length] || LEVEL_RAMP[5];
	if (!stats) return <div style={{ fontSize: 14, color: MUTED }}>{label}: no marks</div>;
	if (stats.hidden) return <div style={{ fontSize: 14, color: MUTED }}>{label}: fewer than 10 children</div>;
	return (
		<div>
			<div style={{ fontSize: 14, color: MUTED, marginBottom: 4 }}>{label} · {fmt(stats.present)} children</div>
			<div role="img" aria-label={`${label}: ${levels.map((l) => `${levelText(l)} ${stats.shares[l]}%`).join(", ")}`} style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden" }}>
				{levels.map((l, i) => (
					<div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, width: `${stats.shares[l]}%`, background: ramp[i], color: i >= ramp.length - 2 ? "#ffffff" : INK, borderRight: "2px solid #ffffff", boxSizing: "border-box", overflow: "hidden" }}>
						{stats.shares[l] >= 8 ? `${Math.round(stats.shares[l])}%` : ""}
					</div>
				))}
			</div>
		</div>
	);
}

function FlnView({ data, audience, onDrill, onDownload }) {
	if (!data.from) return <Empty>No reading and maths level tests have marks for this selection yet.</Empty>;
	const both = data.from !== data.to;
	const unitLevel = data.compareBy;
	return (
		<>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20, marginBottom: 20 }}>
				{data.subjects.map((s) => {
					const ramp = LEVEL_RAMP[s.levels.length] || LEVEL_RAMP[5];
					const a = s.from && !s.from.hidden ? s.from : null;
					const b = s.to && !s.to.hidden ? s.to : null;
					return (
						<section key={s.subject} style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
								<div>
									<h2 style={h2}>{s.subject}</h2>
									<div style={{ fontSize: 15, color: MUTED }}>{b ? <>Average level {both && a ? `${a.avgLevel} → ` : ""}<b style={{ color: INK }}>{b.avgLevel}</b> of {b.maxLevel}</> : "No marks"}</div>
								</div>
								<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
									{both && <><GradeBadge grade={a?.grade} size={40} /><span style={{ color: MUTED }}>→</span></>}
									<GradeBadge grade={b?.grade} size={58} />
								</div>
							</div>
							{both && <LevelBar stats={s.from} levels={s.levels} label={data.from} />}
							<LevelBar stats={s.to} levels={s.levels} label={data.to} />
							<ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, fontSize: 14 }}>
								{s.levels.map((l, i) => (
									<li key={l} style={{ display: "flex", gap: 8, alignItems: "center" }}>
										<span style={{ flex: "0 0 auto", width: 12, height: 12, borderRadius: 2, background: ramp[i], border: "1px solid #C4CDCD" }} />
										<span>
											<span lang={isDevanagari(l) ? "hi" : "en"} style={{ fontFamily: DEVANAGARI_FONT }}>{levelText(l)}</span>
											{LEVEL_GLOSS[l] && <span style={{ color: MUTED }}> {LEVEL_GLOSS[l]}</span>}
										</span>
									</li>
								))}
							</ul>
							{b && (
								<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, borderTop: "1px solid #EAEDED", paddingTop: 12 }}>
									<div><div style={{ fontSize: 13, color: MUTED }}>At the top two levels</div><div style={{ fontSize: 21, fontWeight: 800, color: BLUE_DARK }}>{both && a ? `${a.topSharePct}% → ` : ""}{b.topSharePct}%</div></div>
									<div><div style={{ fontSize: 13, color: MUTED }}>Still at the first level</div><div style={{ fontSize: 21, fontWeight: 800 }}>{both && a ? `${a.firstLevelPct}% → ` : ""}{b.firstLevelPct}%</div></div>
								</div>
							)}
						</section>
					);
				})}
			</div>

			{data.byClass?.length > 0 && (
				<Section title="By class" subtitle={`Grade ${both ? `at ${data.from} → ${data.to}` : `at ${data.to}`}, and the share of children at the top two levels.`}>
					<div style={{ overflowX: "auto" }}>
						<table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
							<thead><tr><th scope="col" style={th}>Class</th>{["Hindi", "English", "Maths"].map((s) => <th key={s} scope="col" style={th}>{s}</th>)}</tr></thead>
							<tbody>
								{data.byClass.map((c) => (
									<tr key={c.cls}>
										<th scope="row" style={{ ...td, textAlign: "left", fontWeight: 800 }}>Class {c.cls}</th>
										{["Hindi", "English", "Maths"].map((s) => {
											const x = c.subjects[s] || {};
											const to = x.to && !x.to.hidden ? x.to : null;
											return (
												<td key={s} style={td}>
													{x.to?.hidden ? <span style={{ color: MUTED, fontSize: 14 }}>under 10</span> : !to ? <span style={{ color: MUTED }}>—</span> : (
														<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
															{both && <><GradeBadge grade={x.from && !x.from.hidden ? x.from.grade : null} size={30} /><span style={{ color: MUTED }}>→</span></>}
															<GradeBadge grade={to.grade} size={30} />
															<span style={{ fontSize: 14, color: MUTED, marginLeft: 6 }}>{to.topSharePct}% at top levels</span>
														</div>
													)}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Section>
			)}

			{unitLevel && (
				<Section
					title={`${unitWord[unitLevel][1]} in ${placeName(data.place)}`}
					subtitle={`${data.to} grade by subject${both ? `, with ${data.from} before it` : ""}.`}
					action={onDownload && <SmallDownload onExcel={() => onDownload("xlsx")} />}
				>
					<div style={{ overflowX: "auto" }}>
						<table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
							<thead><tr><th scope="col" style={th}>{unitWord[unitLevel][0]}</th>{["Hindi", "English", "Maths"].map((s) => <th key={s} scope="col" style={th}>{s}</th>)}<th scope="col" style={{ ...th, textAlign: "right" }}>Children</th></tr></thead>
							<tbody>
								{data.units.map((u) => (
									<tr key={u.key}>
										<td style={td}>
											{onDrill ? <button type="button" style={linkButton} onClick={() => onDrill(unitLevel, u)}>{unitLevel === "school" ? u.name : titleCase(u.name)}</button> : <b>{titleCase(u.name)}</b>}
											{u.udise && <div style={{ fontSize: 13, color: MUTED }}>UDISE {u.udise}</div>}
										</td>
										{["Hindi", "English", "Maths"].map((s) => {
											const x = u.subjects[s] || {};
											if (x.to?.hidden) return <td key={s} style={{ ...td, color: MUTED, fontSize: 14 }}>under 10</td>;
											return (
												<td key={s} style={td}>
													<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
														{both && x.from && !x.from.hidden && <><GradeBadge grade={x.from.grade} size={26} /><span style={{ color: MUTED }}>→</span></>}
														<GradeBadge grade={x.to?.grade} size={32} />
													</span>
												</td>
											);
										})}
										<td style={{ ...td, textAlign: "right" }}>{fmt(Math.max(...["Hindi", "English", "Maths"].map((s) => (u.subjects[s]?.to?.present || 0)))) || "—"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{audience === "public" && <p style={{ ...note, fontSize: 14, marginTop: 12 }}>Groups with fewer than 10 children are not shown.</p>}
				</Section>
			)}
		</>
	);
}

// ---------- filters and downloads ----------

function Filters({ data, params, set, audience, schoolMode }) {
	const o = data?.options || {};
	const fln = (params.view || "tests") === "fln";
	const level = data?.place?.level;
	const allowed = !level ? [] : level === "district" ? ["block", "cluster", ...(audience === "staff" ? ["school"] : [])]
		: level === "block" ? ["cluster", ...(audience === "staff" ? ["school"] : [])] : [];
	const disabled = !data;
	const blockLocked = audience === "staff" && (o.blocks || []).length === 1;
	return (
		<section aria-label="Filters" className="lp-noprint" style={{ ...card, padding: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", marginBottom: 10 }}>
			{!schoolMode && (
				<>
					<label style={labelStyle}>Block
						<select style={selectStyle} disabled={disabled || blockLocked} value={data?.place?.block || ""} onChange={(e) => set({ block: e.target.value, cluster: "", school: "", compareBy: "" })}>
							{!blockLocked && <option value="">All blocks</option>}
							{(o.blocks || []).map((b) => <option key={b} value={b}>{titleCase(b)}</option>)}
						</select>
					</label>
					<label style={labelStyle}>Cluster
						<select style={selectStyle} disabled={disabled} value={data?.place?.cluster || ""} onChange={(e) => {
							const c = (o.clusters || []).find((x) => x.name === e.target.value);
							set({ cluster: e.target.value, block: c ? c.block : params.block, school: "", compareBy: "" });
						}}>
							<option value="">All clusters</option>
							{(o.clusters || []).map((c) => <option key={c.name} value={c.name}>{titleCase(c.name)}{data?.place?.block ? "" : ` (${titleCase(c.block)})`}</option>)}
						</select>
					</label>
					{audience === "staff" && (
						<label style={labelStyle}>School
							<select style={{ ...selectStyle, minWidth: 200, maxWidth: 320 }} disabled={disabled} value={params.school || ""} onChange={(e) => set({ school: e.target.value, compareBy: "" })}>
								<option value="">All schools</option>
								{(o.schools || []).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.udise})</option>)}
							</select>
						</label>
					)}
				</>
			)}
			<label style={labelStyle}>Year
				<select style={{ ...selectStyle, minWidth: 110 }} disabled={disabled} value={data?.year || ""} onChange={(e) => set({ year: e.target.value, test: "", from: "", to: "" })}>
					{(o.years || []).map((y) => <option key={y} value={y}>{y}</option>)}
				</select>
			</label>
			{!fln ? (
				<label style={labelStyle}>Test
					<select style={selectStyle} disabled={disabled || !(data?.tags || []).length} value={data?.test || ""} onChange={(e) => set({ test: e.target.value })}>
						{!(data?.tags || []).length && <option value="">No marks yet</option>}
						{(data?.tags || []).map((t) => <option key={t.tag} value={t.tag}>{t.label}</option>)}
					</select>
				</label>
			) : (
				<>
					<label style={labelStyle}>From
						<select style={selectStyle} disabled={disabled || !(data?.tags || []).length} value={data?.from || ""} onChange={(e) => set({ from: e.target.value })}>
							{(data?.tags || []).map((t) => <option key={t.tag} value={t.tag}>{t.label}</option>)}
						</select>
					</label>
					<label style={labelStyle}>To
						<select style={selectStyle} disabled={disabled || !(data?.tags || []).length} value={data?.to || ""} onChange={(e) => set({ to: e.target.value })}>
							{(data?.tags || []).map((t) => <option key={t.tag} value={t.tag}>{t.label}</option>)}
						</select>
					</label>
				</>
			)}
			<label style={labelStyle}>Classes
				<select style={selectStyle} disabled={disabled} value={data?.classes || params.classes || "1-8"} onChange={(e) => set({ classes: e.target.value, subject: "" })}>
					{CLASS_OPTIONS.map((c) => <option key={c} value={c}>{classLabel(c)}</option>)}
				</select>
			</label>
			{!fln && (
				<label style={labelStyle}>Subject
					<select style={selectStyle} disabled={disabled} value={data?.subject || "all"} onChange={(e) => set({ subject: e.target.value === "all" ? "" : e.target.value })}>
						<option value="all">All subjects</option>
						{(o.subjects || []).map((s) => <option key={s} value={s}>{s}</option>)}
					</select>
				</label>
			)}
			{!schoolMode && allowed.length > 1 && (
				<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
					<span id="lp-compare" style={{ fontSize: 14, color: MUTED }}>Compare by</span>
					<div role="group" aria-labelledby="lp-compare" style={{ display: "flex", border: "1px solid #C4CDCD", borderRadius: 10, overflow: "hidden", height: 44 }}>
						{allowed.map((k) => (
							<button key={k} type="button" aria-pressed={data?.compareBy === k} onClick={() => set({ compareBy: k })} style={{ border: "none", padding: "0 16px", font: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", background: data?.compareBy === k ? INK : "#ffffff", color: data?.compareBy === k ? "#ffffff" : INK }}>{unitWord[k][1]}</button>
						))}
					</div>
				</div>
			)}
			{PARAMS.some((p) => p !== "view" && params[p]) && (
				<button type="button" onClick={() => set(Object.fromEntries(PARAMS.filter((p) => p !== "view").map((p) => [p, ""])))} style={{ ...linkButton, height: 44, fontWeight: 700 }}>Reset filters</button>
			)}
		</section>
	);
}

function DownloadMenu({ data, schoolMode, onDone }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);
	useEffect(() => {
		if (!open) return undefined;
		const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
		const esc = (e) => { if (e.key === "Escape") setOpen(false); };
		document.addEventListener("mousedown", close);
		document.addEventListener("keydown", esc);
		return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
	}, [open]);
	if (!data) return null;
	const base = fileBase(data);
	const run = async (label, fn) => {
		setOpen(false);
		try { await fn(); onDone(`${label} is downloading.`); } catch { onDone(`Could not make ${label}. Please try again.`, true); }
	};
	const rows = [
		{ badge: "PDF", bg: "#C9472A", title: schoolMode ? "School report card (PDF)" : "Report as PDF", desc: "What’s on screen, with the PDLD logo. Choose “Save as PDF” in the print window.", actions: [["PDF", () => { setOpen(false); setTimeout(() => window.print(), 50); }]] },
		{ badge: "XLSX", bg: "#1F7A52", title: "Report as Excel", desc: "One sheet per section of this report.", actions: [["Excel", () => run(`${base}.xlsx`, () => downloadExcel(reportSheets(data), base))]] },
	];
	if (data.compareBy && data.view !== "fln") {
		const sheet = unitSheet(data);
		rows.push({ title: `${unitWord[data.compareBy][0]}-wise results`, desc: `Every ${unitWord[data.compareBy][0].toLowerCase()}: grade, average, pass rate and marks entered.`, actions: [["Excel", () => run(`${base}_${sheet.name}.xlsx`, () => downloadExcel([sheet], `${base}_${sheet.name}`))], ["CSV", () => run(`${base}_${sheet.name}.csv`, async () => downloadCsv(sheet, `${base}_${sheet.name}`))]] });
	}
	if (data.pending) {
		const sheet = pendingSheet(data);
		rows.push({ title: "Marks not entered", desc: "Schools and the class-subjects still to enter, with UDISE and cluster.", actions: [["Excel", () => run(`${base}_MarksNotEntered.xlsx`, () => downloadExcel([sheet], `${base}_MarksNotEntered`))], ["CSV", () => run(`${base}_MarksNotEntered.csv`, async () => downloadCsv(sheet, `${base}_MarksNotEntered`))]] });
	}
	return (
		<div ref={ref} className="lp-noprint" style={{ position: "relative" }}>
			<button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="lp-download" style={{ height: 48, display: "inline-flex", alignItems: "center", gap: 10, padding: "0 20px", border: "none", background: YELLOW, color: INK, borderRadius: 24, font: "inherit", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></svg>
				Download
			</button>
			{open && (
				<div id="lp-download" role="dialog" aria-label="Download report" style={{ position: "absolute", right: 0, top: 56, zIndex: 20, width: 440, maxWidth: "86vw", background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 18px 40px rgba(47,79,79,0.22)", padding: 14 }}>
					{rows.map((r) => (
						<div key={r.title} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 6px", borderBottom: "1px solid #EAEDED" }}>
							{r.badge && <span style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: r.bg, color: "#ffffff", fontSize: 11, fontWeight: 800 }}>{r.badge}</span>}
							<div style={{ flex: "1 1 auto", minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{r.title}</div><div style={{ fontSize: 14, color: MUTED }}>{r.desc}</div></div>
							{r.actions.map(([label, fn]) => (
								<button key={label} type="button" onClick={fn} style={{ flex: "0 0 auto", minHeight: 40, padding: "0 12px", border: `1px solid ${INK}`, background: "#ffffff", color: INK, borderRadius: 20, font: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>{label}</button>
							))}
						</div>
					))}
					<p style={{ margin: "10px 4px 2px", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
						Downloads follow your filters. School names and UDISE codes are included; children’s names are not.
					</p>
				</div>
			)}
		</div>
	);
}

// ---------- the report ----------

export default function ReportView({ audience = "public", schoolMode = false, onData }) {
	const [searchParams, setSearchParams] = useSearchParams();
	const params = useMemo(() => Object.fromEntries(PARAMS.map((p) => [p, searchParams.get(p) || ""])), [searchParams]);
	const paramsKey = searchParams.toString();
	// Public: start from the last figures seen for these filters (or those saved into the site), so
	// the page shows real numbers at once and refreshes them quietly
	const [data, setData] = useState(() => (audience === "public" ? cachedPublicReport(params) : null));
	const [shownKey, setShownKey] = useState(() => (data ? paramsKey : null));
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [toast, setToast] = useState(null);
	const latest = useRef(0);
	const view = params.view === "fln" ? "fln" : "tests";

	useEffect(() => {
		const id = ++latest.current;
		setLoading(true);
		if (audience === "public") {
			const cached = cachedPublicReport(params);
			if (cached) {
				setData(cached);
				setShownKey(paramsKey);
				onData?.(cached);
			}
		}
		fetchLearningProgress(audience, params)
			.then((d) => {
				if (id !== latest.current) return; // a newer request is on its way
				setData(d);
				setShownKey(paramsKey);
				setError(null);
				onData?.(d);
				if (audience === "public") savePublicReport(params, d);
			})
			.catch((e) => {
				if (id !== latest.current) return;
				// Figures already on screen stay; only say so when there is nothing to show
				if (shownKey !== paramsKey) setError(e?.response?.status === 403 ? "You don’t have access to this report." : "The report could not be loaded. Please try again.");
			})
			.finally(() => { if (id === latest.current) setLoading(false); });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [audience, searchParams.toString()]);

	const set = (patch) => {
		const next = new URLSearchParams(searchParams);
		for (const [k, v] of Object.entries(patch)) {
			if (v === undefined || v === null || v === "") next.delete(k);
			else next.set(k, v);
		}
		setSearchParams(next);
	};

	// Opening a row shows that block, cluster or school on its own (schools: dashboard only)
	const onDrill = (level, u) => {
		if (level === "block") set({ block: u.key, cluster: "", school: "", compareBy: "" });
		else if (level === "cluster") set({ block: u.block || params.block, cluster: u.key, school: "", compareBy: "" });
		else if (audience === "staff") set({ school: u.key, compareBy: "" });
	};

	const notify = (message, bad) => {
		setToast({ message, bad });
		setTimeout(() => setToast(null), 6000);
	};
	const downloadUnits = (kind) => {
		const sheet = unitSheet(data);
		const name = `${fileBase(data)}_${sheet.name}`;
		if (kind === "csv") downloadCsv(sheet, name); else downloadExcel([sheet], name);
		notify(`${name}.${kind} is downloading.`);
	};
	const downloadPending = (kind) => {
		const sheet = pendingSheet(data);
		const name = `${fileBase(data)}_MarksNotEntered`;
		if (kind === "csv") downloadCsv(sheet, name); else downloadExcel([sheet], name);
		notify(`${name}.${kind} is downloading.`);
	};
	const downloadFlnUnits = () => {
		const name = `${fileBase(data)}_by_${data.compareBy}`;
		downloadExcel(reportSheets(data).slice(-1), name);
		notify(`${name}.xlsx is downloading.`);
	};
	const staff = audience === "staff";

	return (
		<div className="lp-print-area" style={{ fontFamily: "'Karla', sans-serif", color: INK }}>
			<style>{PRINT_CSS}</style>
			<div className="lp-print-only" style={{ display: "none", alignItems: "center", gap: 12, marginBottom: 16 }}>
				<img src={badge} alt="" width="48" height="48" />
				<div>
					<div style={{ fontFamily: HEADING_FONT, fontSize: 22, fontWeight: 700 }}>Padhe Dantewada Likhe Dantewada · Learning Progress</div>
					<div style={{ fontSize: 14, color: MUTED }}>{data ? `${placeName(data.place)} · ${view === "fln" ? `${data.from} → ${data.to}` : data.testLabel} · ${data.year} · ${classLabel(data.classes)} · printed ${new Date().toLocaleDateString("en-IN")}` : ""}</div>
				</div>
			</div>

			<div className="lp-noprint" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
				<div role="tablist" aria-label="Report" style={{ display: "flex", gap: 4 }}>
					{[["tests", "Class tests"], ["fln", "Reading and maths levels (FLN)"]].map(([k, l]) => (
						<button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => set({ view: k === "tests" ? "" : k, test: "", from: "", to: "" })} style={{ padding: "12px 18px", font: "inherit", fontSize: 16, fontWeight: view === k ? 800 : 500, color: view === k ? INK : MUTED, background: "none", border: "none", borderBottom: `3px solid ${view === k ? INK : "transparent"}`, marginBottom: -1, cursor: "pointer" }}>{l}</button>
					))}
				</div>
				{staff && <div style={{ paddingBottom: 8 }}><DownloadMenu data={data} schoolMode={schoolMode} onDone={notify} /></div>}
			</div>

			{toast && (
				<div role="status" className="lp-noprint" style={{ display: "flex", alignItems: "center", gap: 10, background: toast.bad ? "#FFE5E3" : "#E9F5E9", border: `1px solid ${toast.bad ? "#F44336" : "#219464"}`, color: toast.bad ? "#a12d23" : "#1d5e3a", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 15 }}>{toast.message}</div>
			)}

			<Filters data={data} params={params} set={set} audience={audience} schoolMode={schoolMode} />

			{data && (
				<p className="lp-noprint" style={{ margin: "0 0 18px", fontSize: 15, color: MUTED }}>
					{view === "tests" && data.summary ? (
						data.summary.eligible
							? <>Based on marks from <b style={{ color: INK }}>{fmt(data.summary.entered)} of {fmt(data.summary.eligible)} schools ({Math.round((data.summary.entered / data.summary.eligible) * 100)}%)</b> in {placeName(data.place)}. Results can still change while the test is open.</>
							: <>Based on marks from <b style={{ color: INK }}>{fmt(data.summary.entered)} schools</b> in {placeName(data.place)}.</>
					) : <>{placeName(data.place)} · {data.year}.</>}
					{data.dataAsOf && ` Figures as of ${new Date(data.dataAsOf).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}.`}
					{audience === "public" && " Only district, block and cluster totals are shown here; no child’s name or marks, and no single school."}
				</p>
			)}

			{error && <div role="alert" style={{ ...card, borderColor: "#F44336", color: "#a12d23", marginBottom: 16 }}>{error}</div>}
			{loading && !data && <Empty>Loading the report…</Empty>}

			{data && (
				<div style={{ opacity: loading && shownKey !== paramsKey ? 0.5 : 1, transition: "opacity .2s" }} aria-busy={loading && shownKey !== paramsKey}>
					{view === "tests" ? (
						<>
							<SummaryCards data={data} />
							<Matrix data={data} />
							<CompareTests data={data} />
							<Units data={data} audience={audience} onDrill={schoolMode ? null : onDrill} onDownload={staff ? downloadUnits : null} />
							{staff && <Pending data={data} onDownload={downloadPending} />}
						</>
					) : (
						<FlnView data={data} audience={audience} onDrill={schoolMode ? null : onDrill} onDownload={staff && data.compareBy ? downloadFlnUnits : null} />
					)}
				</div>
			)}
		</div>
	);
}
