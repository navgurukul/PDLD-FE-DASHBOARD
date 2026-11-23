import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../App";
import badge from "../../assets/pdld-badge.svg";
import mark from "../../assets/pdld-mark.svg";
import { HEADING_FONT, INK, LINK, YELLOW } from "./lpTheme";

// Header and footer of the public website. The footer draws a Dantewada scene (striped sun from the
// logo, Bailadila hills, sal trees, a river, letters rising from an open book) with CSS animation;
// it stops for "reduce motion" and has a pause button.

const navLink = (active) => ({ padding: "12px 14px", textDecoration: "none", color: INK, fontWeight: active ? 800 : 500, borderBottom: `3px solid ${active ? YELLOW : "transparent"}` });

export function SiteHeader({ active }) {
	const auth = useContext(AuthContext);
	const isSchool = String(auth?.user?.role || "").toUpperCase() === "SCHOOL";
	return (
		<header style={{ background: "#ffffff", borderBottom: "1px solid #DEDEDE", fontFamily: "'Karla', sans-serif", color: INK }}>
			<div style={{ maxWidth: 1240, margin: "0 auto", padding: "12px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}>
				<Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
					<img src={badge} alt="" width="52" height="52" style={{ display: "block", borderRadius: 12 }} />
					<span style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 20, lineHeight: 1.05 }}>
						<span style={{ color: "#8a6d00" }}>padhe</span> <span style={{ color: INK }}>dantewada</span><br />
						<span style={{ color: LINK }}>likhe</span> <span style={{ color: INK }}>dantewada</span>
					</span>
				</Link>
				<nav aria-label="Main" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginLeft: "auto", alignItems: "center" }}>
					<Link to="/" aria-current={active === "home" ? "page" : undefined} style={navLink(active === "home")}>Home</Link>
					<Link to="/learning-progress" aria-current={active === "report" ? "page" : undefined} style={navLink(active === "report")}>Learning Progress</Link>
					<Link to="/#grades" style={navLink(false)}>How grades work</Link>
					<Link
						to={auth?.isAuthenticated ? (isSchool ? "/my-school" : "/allTest") : "/login"}
						style={{ height: 44, display: "inline-flex", alignItems: "center", gap: 8, padding: "0 20px", background: YELLOW, color: INK, borderRadius: 22, fontWeight: 800, textDecoration: "none" }}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
						{auth?.isAuthenticated ? (isSchool ? "My school" : "Dashboard") : "Staff login"}
					</Link>
				</nav>
			</div>
		</header>
	);
}

const FOOTER_CSS = `
.pdlf-rise{animation:pdlf-rise 2.6s cubic-bezier(.2,.8,.2,1) both}
.pdlf-bob{animation:pdlf-bob 7s ease-in-out 2.6s infinite}
.pdlf-stripes{animation:pdlf-stripes 2.4s linear infinite}
.pdlf-cloud{animation:pdlf-cloud 80s linear infinite}
.pdlf-tree{transform-box:fill-box;transform-origin:50% 100%;animation:pdlf-sway 6s ease-in-out infinite alternate}
.pdlf-birds{animation:pdlf-fly 30s linear infinite}
.pdlf-wing{transform-box:fill-box;transform-origin:50% 50%;animation:pdlf-flap .5s ease-in-out infinite alternate}
.pdlf-flow{animation:pdlf-flow 3.2s linear infinite}
.pdlf-page{transform-box:fill-box;transform-origin:50% 100%;animation:pdlf-open 1.6s cubic-bezier(.2,.8,.2,1) .4s both}
.pdlf-letter{animation:pdlf-float 9s ease-out infinite both}
.pdlf-spark{animation:pdlf-twinkle 2.8s ease-in-out infinite}
.pdlf-paused *{animation-play-state:paused !important}
@keyframes pdlf-rise{from{transform:translateY(90px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pdlf-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes pdlf-stripes{from{transform:translateY(0)}to{transform:translateY(10px)}}
@keyframes pdlf-cloud{from{transform:translateX(-320px)}to{transform:translateX(1760px)}}
@keyframes pdlf-sway{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}
@keyframes pdlf-fly{from{transform:translate(-160px,0)}50%{transform:translate(800px,-24px)}to{transform:translate(1760px,8px)}}
@keyframes pdlf-flap{from{transform:scaleY(1)}to{transform:scaleY(.35)}}
@keyframes pdlf-flow{from{stroke-dashoffset:0}to{stroke-dashoffset:-88}}
@keyframes pdlf-open{from{transform:scaleY(.15);opacity:0}to{transform:scaleY(1);opacity:1}}
@keyframes pdlf-float{0%{transform:translateY(0);opacity:0}12%{opacity:1}70%{opacity:.9}100%{transform:translateY(-170px);opacity:0}}
@keyframes pdlf-twinkle{0%,100%{opacity:.15}50%{opacity:1}}
@media (prefers-reduced-motion: reduce){.pdlf-root *{animation:none !important}}
`;

const TREES = [
	[108, 196, 6.4, 0, 1], [140, 202, 5.2, -1, 0], [292, 196, 7, -2, 1], [326, 204, 5.8, -3, 0], [498, 190, 6.6, -1.4, 1],
	[964, 182, 6.1, -2.4, 1], [998, 190, 5.4, -0.6, 0], [1238, 180, 6.8, -3.2, 1], [1272, 188, 5.6, -1.8, 0], [1376, 178, 6.2, -2.8, 1],
];
const LETTERS = [[-62, -14, 26, "#FED700", "अ"], [44, -16, 24, "#F4E9D8", "A"], [-18, -12, 22, "#FED700", "1"], [76, -12, 26, "#FED700", "क"], [-86, -10, 22, "#F4E9D8", "b"], [12, -14, 24, "#FED700", "आ"], [-40, -14, 22, "#F4E9D8", "+"], [58, -14, 22, "#F4E9D8", "3"]];

function Scene({ compact }) {
	return (
		<svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" style={{ display: "block", width: "100%", height: compact ? 170 : 300 }} role="img" aria-label="A striped sun rising over the Bailadila hills and sal forest of Dantewada, a river flowing below, and letters and numbers rising from an open book.">
			<defs>
				<linearGradient id="pdlf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F5F7F7" /><stop offset="1" stopColor="#D3EAE9" /></linearGradient>
				<clipPath id="pdlf-sunclip"><circle cx="1110" cy="128" r="64" /></clipPath>
			</defs>
			<rect width="1440" height="320" fill="url(#pdlf-sky)" />
			<g className="pdlf-rise"><g className="pdlf-bob">
				<g clipPath="url(#pdlf-sunclip)"><g className="pdlf-stripes">
					{Array.from({ length: 15 }, (_, i) => <rect key={i} x="1040" y={54 + i * 10} width="140" height="6" fill="#FED700" />)}
				</g></g>
				<path d="M1110 98 L1140 152 Q1110 166 1080 152 Z" fill="#FED700" stroke="#E4F1F0" strokeWidth="5" strokeLinejoin="round" />
			</g></g>
			<g opacity="0.85">
				<g className="pdlf-cloud"><path d="M40 70 a18 18 0 0 1 30 -12 a24 24 0 0 1 44 6 a16 16 0 0 1 8 30 h-78 a14 14 0 0 1 -4 -24z" fill="#ffffff" /></g>
				<g className="pdlf-cloud" style={{ animationDelay: "-42s", animationDuration: "95s" }}><path d="M60 40 a14 14 0 0 1 24 -8 a20 20 0 0 1 36 6 a12 12 0 0 1 6 22 h-62 a11 11 0 0 1 -4 -20z" fill="#ffffff" /></g>
			</g>
			<g className="pdlf-birds">
				<g transform="translate(0 92)"><path className="pdlf-wing" d="M0 0 q7 -7 14 0 q7 -7 14 0" fill="none" stroke="#2F4F4F" strokeWidth="2.4" strokeLinecap="round" /></g>
				<g transform="translate(34 78)"><path className="pdlf-wing" style={{ animationDelay: ".2s" }} d="M0 0 q6 -6 12 0 q6 -6 12 0" fill="none" stroke="#2F4F4F" strokeWidth="2.2" strokeLinecap="round" /></g>
				<g transform="translate(-26 74)"><path className="pdlf-wing" style={{ animationDelay: ".35s" }} d="M0 0 q5 -5 10 0 q5 -5 10 0" fill="none" stroke="#2F4F4F" strokeWidth="2" strokeLinecap="round" /></g>
			</g>
			<path d="M0 214 C120 176 220 158 340 182 S560 146 700 170 S920 124 1060 164 S1300 134 1440 172 V320 H0 Z" fill="#A9CBCA" />
			<path d="M0 244 C150 206 260 210 380 230 S600 194 760 220 S1000 190 1180 214 S1360 200 1440 210 V320 H0 Z" fill="#6E9897" />
			<g fill="#3F6B6A">
				{TREES.map(([x, y, dur, delay, big]) => (
					<g key={x} transform={`translate(${x} ${y})`}>
						<g className="pdlf-tree" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
							{big ? <><rect x="10" y="30" width="4" height="16" fill="#2F4F4F" /><ellipse cx="12" cy="24" rx="12" ry="14" /><ellipse cx="12" cy="10" rx="8" ry="10" /></>
								: <><rect x="8" y="24" width="4" height="14" fill="#2F4F4F" /><ellipse cx="10" cy="19" rx="10" ry="12" /><ellipse cx="10" cy="7" rx="6" ry="8" /></>}
						</g>
					</g>
				))}
			</g>
			<path d="M0 264 C200 238 360 246 520 256 C620 262 660 234 720 234 C780 234 820 262 920 256 C1080 246 1240 238 1440 260 V320 H0 Z" fill="#2F4F4F" />
			<path d="M0 296 C200 282 380 306 560 294 S900 288 1080 300 S1320 290 1440 298" fill="none" stroke="#4E8A89" strokeWidth="10" strokeLinecap="round" />
			<path className="pdlf-flow" d="M0 296 C200 282 380 306 560 294 S900 288 1080 300 S1320 290 1440 298" fill="none" stroke="#8FD3D2" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="18 26" />
			<g transform="translate(720 240)">
				<g className="pdlf-page"><path d="M-2 4 C-30 -22 -70 -26 -98 -16 L-106 2 C-72 -4 -32 0 -2 10 Z" fill="#F4E9D8" /></g>
				<g className="pdlf-page"><path d="M2 4 C30 -22 70 -26 98 -16 L106 2 C72 -4 32 0 2 10 Z" fill="#F4E9D8" /></g>
				<path d="M-110 4 L0 16 L110 4" fill="none" stroke="#FED700" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
				<g fontFamily="'Noto Sans Devanagari', 'Philosopher', sans-serif" fontWeight="700" textAnchor="middle">
					{LETTERS.map(([x, y, size, fill, ch], i) => (
						<g key={ch} className="pdlf-letter" style={{ animationDelay: `${i * 1.1}s` }}><text x={x} y={y} fontSize={size} fill={fill}>{ch}</text></g>
					))}
				</g>
				{[[-120, -26, 3, "#FED700", 0], [128, -34, 2.5, "#FED700", 1], [-150, -6, 2, "#F4E9D8", 1.8], [160, -4, 2, "#F4E9D8", 0.6]].map(([cx, cy, r, fill, d]) => (
					<circle key={cx} className="pdlf-spark" style={{ animationDelay: `${d}s` }} cx={cx} cy={cy} r={r} fill={fill} />
				))}
			</g>
		</svg>
	);
}

const footLink = { color: "#E3ECEC", textDecoration: "none", padding: "6px 0" };
const footHead = { fontSize: 13, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: YELLOW, marginBottom: 6 };

export function SiteFooter({ compact = false, lastUpdated }) {
	const [paused, setPaused] = useState(false);
	useEffect(() => {
		try {
			if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPaused(true);
		} catch {
			// older browsers: keep the animation
		}
	}, []);
	return (
		<footer className={`pdlf-root ${paused ? "pdlf-paused" : ""}`} style={{ fontFamily: "'Karla', sans-serif", color: "#E3ECEC", background: "#2F4F4F" }}>
			<style>{FOOTER_CSS}</style>
			<div style={{ background: "#F5F7F7", lineHeight: 0 }}><Scene compact={compact} /></div>
			<div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 20px", display: "flex", flexWrap: "wrap", gap: "28px 48px" }}>
				<div style={{ flex: "2 1 300px", display: "flex", flexDirection: "column", gap: 12 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
						<img src={mark} alt="" width="88" height="47" style={{ display: "block" }} />
						<div style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 22, lineHeight: 1.1, color: "#ffffff" }}>Padhe Dantewada<br />Likhe Dantewada</div>
					</div>
					<p lang="hi" style={{ margin: 0, fontFamily: "'Noto Sans Devanagari', sans-serif", color: YELLOW, fontSize: 16 }}>पढ़े दंतेवाड़ा, लिखे दंतेवाड़ा</p>
					<p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, maxWidth: 380 }}>Helping every child in Dantewada read, write and do maths at their class level.</p>
				</div>
				<nav aria-label="Report" style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 4 }}>
					<div style={footHead}>Report</div>
					<Link to="/learning-progress" style={footLink}>Class tests</Link>
					<Link to="/learning-progress?view=fln" style={footLink}>Reading and maths levels</Link>
					<Link to="/#grades" style={footLink}>How grades work</Link>
				</nav>
				<nav aria-label="Programme" style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 4 }}>
					<div style={footHead}>Programme</div>
					<Link to="/#about" style={footLink}>About PDLD</Link>
					<Link to="/login" style={footLink}>Staff login</Link>
					<Link to="/privacy-policy" style={footLink}>Privacy policy</Link>
				</nav>
				<div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
					<div style={footHead}>Data</div>
					{lastUpdated && <span>Figures as of {new Date(lastUpdated).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>}
					<span>No child’s name or marks are shown. Groups under 10 children are hidden.</span>
				</div>
			</div>
			<div style={{ borderTop: "1px solid #4A6B6B" }}>
				<div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#C5D4D4" }}>
					<span>A programme of the district administration, Dantewada</span>
					<button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", gap: 8, padding: "0 16px", border: "1px solid #6E9897", background: "transparent", color: "#E3ECEC", borderRadius: 22, font: "inherit", fontSize: 13, cursor: "pointer" }}>
						{paused
							? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
							: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>}
						{paused ? "Play animation" : "Pause animation"}
					</button>
				</div>
			</div>
		</footer>
	);
}
