import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import mark from "../../assets/pdld-mark.svg";
import { SiteFooter, SiteHeader } from "../../components/learningProgress/SiteChrome";
import { GradeBadge } from "../../components/learningProgress/ReportView";
import { BLUE_DARK, BORDER, GRADE, GRADE_BANDS, HEADING_FONT, INK, LINK, MUTED, PAGE_BG, YELLOW, cachedPublicReport, fetchLearningProgress, fmt, pct, savePublicReport, titleCase } from "../../components/learningProgress/lpTheme";

// Public landing page: district grade, the year's tests, blocks at a glance, what the report
// holds, how grades work and about the programme. Only district and block totals.

const wrap = { maxWidth: 1240, margin: "0 auto", padding: "52px 24px" };
const h2 = { fontFamily: HEADING_FONT, fontSize: 34, margin: "0 0 6px", color: INK };
const lead = { margin: "0 0 22px", color: MUTED, fontSize: 17 };

export default function PublicHome() {
	// Real figures from the first frame: the last ones this browser saw, else those saved into the
	// site at build time; newer figures replace them quietly when the API answers
	const [data, setData] = useState(() => cachedPublicReport({}));
	const [failed, setFailed] = useState(false);
	const location = useLocation();

	useEffect(() => {
		fetchLearningProgress("public", {})
			.then((d) => { setData(d); savePublicReport({}, d); })
			.catch(() => setFailed(true));
	}, []);
	useEffect(() => {
		if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
	}, [location.hash, data]);

	const now = data?.summary?.now && !data.summary.now.hidden ? data.summary.now : null;
	const prev = data?.summary?.prev && !data.summary.prev.hidden ? data.summary.prev : null;

	return (
		// Own scroll area: the app locks page scrolling (index.css) for the dashboard layout
		<div style={{ fontFamily: "'Karla', sans-serif", color: INK, background: PAGE_BG, height: "100vh", overflowY: "auto" }}>
			<SiteHeader active="home" />

			<section style={{ background: INK, color: "#ffffff", position: "relative", overflow: "hidden" }}>
				<div aria-hidden="true" style={{ position: "absolute", right: -120, top: -140, width: 520, height: 520, borderRadius: "50%", background: "repeating-linear-gradient(180deg, #FED700 0 7px, transparent 7px 14px)", opacity: 0.14 }} />
				<div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "56px 24px 64px", display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
					<div style={{ flex: "999 1 520px", minWidth: 0 }}>
						<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
							<img src={mark} alt="" width="96" height="51" style={{ display: "block" }} />
							<p lang="hi" style={{ margin: 0, fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: 22, color: YELLOW }}>पढ़े दंतेवाड़ा, लिखे दंतेवाड़ा</p>
						</div>
						<h1 style={{ margin: "0 0 16px", fontFamily: HEADING_FONT, fontSize: "clamp(36px, 4.8vw, 60px)", lineHeight: 1.08 }}>How Dantewada’s children are learning</h1>
						<p style={{ margin: "0 0 28px", fontSize: 19, lineHeight: 1.55, maxWidth: 600, color: "#E3ECEC" }}>
							Test results from the district’s government schools, Classes 1 to 8. Every block and cluster, every class and subject, updated as teachers enter marks.
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
							<Link to="/learning-progress" style={{ height: 50, display: "inline-flex", alignItems: "center", padding: "0 26px", background: YELLOW, color: INK, borderRadius: 25, fontWeight: 800, textDecoration: "none", fontSize: 17 }}>Open the Learning Progress report</Link>
							<a href="#grades" style={{ height: 50, display: "inline-flex", alignItems: "center", padding: "0 24px", border: "1px solid #ffffff", color: "#ffffff", borderRadius: 25, fontWeight: 700, textDecoration: "none", fontSize: 17 }}>How grades work</a>
						</div>
					</div>

					<div style={{ flex: "1 1 380px", background: "#ffffff", color: INK, borderRadius: 20, padding: 24, boxSizing: "border-box", boxShadow: "0 18px 40px rgba(0,0,0,0.18)", minHeight: 260 }}>
						{!data && !failed && <div aria-hidden="true" style={{ height: 200, borderRadius: 14, background: "linear-gradient(90deg, #eef2f7, #f6f8fb, #eef2f7)" }} />}
						{failed && !data && <p style={{ color: MUTED, fontSize: 16 }}>The latest results could not be loaded. <Link to="/learning-progress" style={{ color: LINK }}>Open the report</Link>.</p>}
						{data && !now && <p style={{ color: MUTED, fontSize: 16 }}>No marks have been entered yet for {data.year}.</p>}
						{now && (
							<>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
									<div>
										<div style={{ fontSize: 14, color: MUTED }}>Dantewada district · {data.testLabel} {data.year}</div>
										<div style={{ fontFamily: HEADING_FONT, fontSize: 24, fontWeight: 700, marginTop: 2 }}>District grade</div>
										<div style={{ fontSize: 15, color: MUTED, marginTop: 2 }}>{now.points} of 4 grade points{prev ? ` · ${data.summary.prevTag}: ${prev.grade}` : ""}</div>
									</div>
									<GradeBadge grade={now.grade} size={100} />
								</div>
								<div role="img" aria-label={`Children by grade: ${GRADE_BANDS.map(([l]) => `${l} ${now.shares[l]}%`).join(", ")}`} style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", margin: "18px 0 8px" }}>
									{GRADE_BANDS.map(([l]) => <div key={l} style={{ width: `${now.shares[l]}%`, background: l === "E" ? "#E3E8E8" : GRADE[l].bg }} />)}
								</div>
								<div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED }}>{GRADE_BANDS.map(([l]) => <span key={l}>{l} {Math.round(now.shares[l])}%</span>)}</div>
								<dl style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, margin: "18px 0 0", borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
									<div><dt style={{ fontSize: 14, color: MUTED }}>Average</dt><dd style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{pct(now.avgPct)}</dd></div>
									<div><dt style={{ fontSize: 14, color: MUTED }}>Passed</dt><dd style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{pct(now.passPct)}</dd></div>
									<div><dt style={{ fontSize: 14, color: MUTED }}>Children</dt><dd style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{fmt(now.present)}</dd></div>
								</dl>
								<p style={{ margin: "12px 0 0", fontSize: 14, color: MUTED }}>
									{data.summary.eligible ? `Based on ${fmt(data.summary.entered)} of ${fmt(data.summary.eligible)} schools so far.` : `Based on ${fmt(data.summary.entered)} schools.`}
								</p>
							</>
						)}
					</div>
				</div>
			</section>

			{data?.compareTests?.length > 0 && (
				<section aria-label="This year’s tests" style={{ background: "#ffffff", borderBottom: `1px solid ${BORDER}` }}>
					<div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
						<span style={{ fontSize: 15, fontWeight: 800, marginRight: 6 }}>{data.year} class tests</span>
						{data.compareTests.map((t) => {
							const current = t.tag === data.test;
							return (
								<Link key={t.tag} to={`/learning-progress?year=${data.year}&test=${encodeURIComponent(t.tag)}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 19, fontSize: 15, textDecoration: "none", background: current ? INK : "#ffffff", color: current ? "#ffffff" : INK, border: `1px solid ${INK}` }}>
									<span style={{ width: 8, height: 8, borderRadius: 4, background: current ? YELLOW : "#049796" }} />
									{t.label} <span style={{ fontSize: 13, opacity: 0.85 }}>{t.overall?.avgPct != null ? `${t.overall.avgPct}% average` : ""}</span>
								</Link>
							);
						})}
					</div>
				</section>
			)}

			{data?.units?.length > 0 && (
				<section>
					<div style={wrap}>
						<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 22 }}>
							<div>
								<h2 style={h2}>Blocks at a glance</h2>
								<p style={{ ...lead, margin: 0 }}>{data.testLabel} {data.year}, Classes 1 to 8. Open a block to see its clusters.</p>
							</div>
							<Link to="/learning-progress?compareBy=cluster" style={{ fontWeight: 800, color: LINK }}>Compare all clusters →</Link>
						</div>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
							{data.units.map((b) => {
								const n = b.now && !b.now.hidden ? b.now : null;
								const p = b.prev && !b.prev.hidden ? b.prev : null;
								const g = GRADE[n?.grade] || GRADE.E;
								const change = n && p && n.avgPct != null && p.avgPct != null ? Math.round((n.avgPct - p.avgPct) * 10) / 10 : null;
								return (
									<Link key={b.key} to={`/learning-progress?block=${encodeURIComponent(b.key)}`} style={{ display: "block", textDecoration: "none", color: INK, background: "#ffffff", border: `1px solid ${BORDER}`, borderTop: `5px solid ${g.bg}`, borderRadius: 16, padding: 20 }}>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
											<div>
												<div style={{ fontFamily: HEADING_FONT, fontSize: 26, fontWeight: 700 }}>{titleCase(b.name)}</div>
												<div style={{ fontSize: 14, color: MUTED }}>{b.eligible ? `${fmt(b.entered)} of ${fmt(b.eligible)} schools entered marks` : `${fmt(b.entered)} schools entered marks`}</div>
											</div>
											<GradeBadge grade={n?.grade} size={58} />
										</div>
										<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 16 }}>
											<div><div style={{ fontSize: 13, color: MUTED }}>Average</div><div style={{ fontSize: 21, fontWeight: 800 }}>{pct(n?.avgPct)}</div></div>
											<div><div style={{ fontSize: 13, color: MUTED }}>Passed</div><div style={{ fontSize: 21, fontWeight: 800 }}>{pct(n?.passPct)}</div></div>
											<div><div style={{ fontSize: 13, color: MUTED }}>Change</div><div style={{ fontSize: 21, fontWeight: 800, color: change == null ? MUTED : change >= 0 ? BLUE_DARK : "#a12d23" }}>{change == null ? "—" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change)}`}</div></div>
										</div>
										{b.early && <p style={{ margin: "12px 0 0", fontSize: 14, color: MUTED }}>Early result: fewer than 60% of schools have entered marks.</p>}
									</Link>
								);
							})}
						</div>
					</div>
				</section>
			)}

			<section style={{ background: "#ffffff" }}>
				<div style={wrap}>
					<h2 style={h2}>Inside the report</h2>
					<p style={lead}>Two tabs, the same filters: block, cluster, test, classes and subject.</p>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
						{[
							["/learning-progress", "Tab 1", "Class tests", "Monthly, Quarterly, Half Yearly and Annual tests. Grades, averages and pass rates by class and subject, and how each test compares with the one before.", "Open class tests →"],
							["/learning-progress?view=fln", "Tab 2", "Reading and maths levels (FLN)", "Foundational literacy and numeracy in Hindi, English and Maths: how many children are at each level, and how that moves from Baseline to Midline to Endline.", "Open reading and maths levels →"],
						].map(([to, tab, title, text, cta]) => (
							<Link key={to} to={to} style={{ display: "block", textDecoration: "none", color: INK, background: PAGE_BG, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 26 }}>
								<div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: LINK }}>{tab}</div>
								<h3 style={{ fontFamily: HEADING_FONT, fontSize: 26, margin: "4px 0 8px" }}>{title}</h3>
								<p style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 1.55, color: "#46605F" }}>{text}</p>
								<div style={{ fontWeight: 800, color: LINK }}>{cta}</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section id="grades">
				<div style={wrap}>
					<h2 style={h2}>How grades work</h2>
					<p style={lead}>The same grades the district already uses in the School Performance report.</p>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
						<div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24 }}>
							<h3 style={{ fontSize: 19, margin: "0 0 12px" }}>Class tests</h3>
							<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
								<thead><tr style={{ textAlign: "left", color: MUTED, fontSize: 14 }}><th scope="col" style={{ padding: "6px 0" }}>Grade</th><th scope="col" style={{ padding: "6px 0" }}>A child’s score</th><th scope="col" style={{ padding: "6px 0", textAlign: "right" }}>Points</th></tr></thead>
								<tbody>
									{GRADE_BANDS.map(([l, range, points]) => (
										<tr key={l} style={{ borderTop: "1px solid #EAEDED" }}><td style={{ padding: "8px 0" }}><GradeBadge grade={l} size={34} /></td><td style={{ padding: "8px 0" }}>{range}</td><td style={{ padding: "8px 0", textAlign: "right" }}>{points}</td></tr>
									))}
								</tbody>
							</table>
							<p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.55, color: "#46605F" }}>A class, cluster or block gets the average of its children’s points: 3.5 or more is A, 2.5 B, 1.5 C, 0.5 D, below that E.</p>
						</div>
						<div style={{ background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24 }}>
							<h3 style={{ fontSize: 19, margin: "0 0 12px" }}>Reading and maths levels</h3>
							<dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 16 }}>
								<div><dt style={{ fontWeight: 800 }}>Hindi, 5 levels</dt><dd lang="hi" style={{ margin: "2px 0 0", fontFamily: "'Noto Sans Devanagari', 'Karla', sans-serif", color: "#46605F" }}>प्रारंभिक → अक्षर → शब्द → अनुच्छेद → कहानी</dd></div>
								<div><dt style={{ fontWeight: 800 }}>Maths, 5 levels</dt><dd lang="hi" style={{ margin: "2px 0 0", fontFamily: "'Noto Sans Devanagari', 'Karla', sans-serif", color: "#46605F" }}>प्रारंभिक → अंक पहचान → संख्या पहचान → घटाव → भाग</dd></div>
								<div><dt style={{ fontWeight: 800 }}>English, 4 levels</dt><dd style={{ margin: "2px 0 0", color: "#46605F" }}>Capital letters → Small letters → Words → Sentences</dd></div>
							</dl>
							<p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.55, color: "#46605F" }}>The grade comes from the average level. Hindi and Maths: 4.5 or more is A, 3.5 B, 2.5 C, 1.5 D, below that E. English: 3.5 A, 2.5 B, 1.5 C, below that D.</p>
						</div>
					</div>
				</div>
			</section>

			<section id="about" style={{ background: "#ffffff" }}>
				<div style={{ ...wrap, paddingBottom: 64 }}>
					<h2 style={{ ...h2, marginBottom: 22 }}>About the programme</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
						{[
							["What it is", "Padhe Dantewada Likhe Dantewada is the district’s programme to make sure every child can read, write and do maths at their class level. The district administration runs it with the schools and teachers."],
							["Where the numbers come from", "Teachers enter each test’s marks in the PDLD app. Results here update as marks come in, so a test that is still open can change."],
							["Children’s privacy", "No child’s name or marks, and no single school, appear on this public page. Any group with fewer than 10 children assessed is hidden."],
						].map(([title, text]) => (
							<div key={title} style={{ background: PAGE_BG, borderRadius: 18, padding: 24 }}>
								<h3 style={{ margin: "0 0 8px", fontSize: 19 }}>{title}</h3>
								<p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#46605F" }}>{text}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<SiteFooter lastUpdated={data?.dataAsOf} />
		</div>
	);
}
