import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import badge from "../assets/pdld-badge.svg";
import ReportView from "../components/learningProgress/ReportView";
import { HEADING_FONT, INK, PAGE_BG, YELLOW, titleCase } from "../components/learningProgress/lpTheme";

// A headmaster's own school: the API pins a school login to its school, so this page only shows
// that school's classes, subjects, reading levels and downloads
export default function MySchoolReport() {
	const { user, logout } = useContext(AuthContext);
	const [data, setData] = useState(null);
	const place = data?.place;
	return (
		// Own scroll area: the app locks page scrolling (index.css) for the dashboard layout
		<div style={{ fontFamily: "'Karla', sans-serif", color: INK, background: PAGE_BG, height: "100vh", overflowY: "auto" }}>
			<header style={{ background: INK, color: "#ffffff" }}>
				<div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
					<Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "#ffffff", textDecoration: "none" }}>
						<img src={badge} alt="" width="44" height="44" style={{ borderRadius: 10, border: "1px solid #4A6B6B" }} />
						<span style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 18 }}>PDLD · My school</span>
					</Link>
					<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ fontSize: 14, color: "#C5D4D4" }}>Signed in as headmaster</span>
						<button type="button" onClick={logout} style={{ minHeight: 40, padding: "0 16px", borderRadius: 20, border: "1px solid #ffffff", background: "transparent", color: "#ffffff", font: "inherit", cursor: "pointer" }}>Sign out</button>
					</div>
				</div>
			</header>
			<section style={{ maxWidth: 1240, margin: "0 auto", padding: "22px 24px 0", boxSizing: "border-box" }}>
				<div style={{ background: INK, color: "#ffffff", borderRadius: 20, padding: 22, position: "relative", overflow: "hidden", marginBottom: 12 }}>
					<div aria-hidden="true" style={{ position: "absolute", right: -60, top: -90, width: 260, height: 260, borderRadius: "50%", background: `repeating-linear-gradient(180deg, ${YELLOW} 0 5px, transparent 5px 10px)`, opacity: 0.16 }} />
					<div style={{ position: "relative" }}>
						<div style={{ fontSize: 14, color: "#C5D4D4" }}>{place ? `${titleCase(place.block)} block › ${titleCase(place.cluster)} cluster` : " "}</div>
						<h1 style={{ fontFamily: HEADING_FONT, fontSize: 32, margin: "2px 0" }}>{place?.school?.name || user?.schoolName || "My school"}</h1>
						<div style={{ fontSize: 15, color: "#E3ECEC" }}>UDISE {place?.school?.udise || user?.udiseCode || ""}</div>
					</div>
				</div>
				<p style={{ margin: "0 0 14px", fontSize: 15, color: "#597272" }}>You see your own school only: each class and subject, every test, with grades. Children’s names stay in the app, not in this report.</p>
			</section>
			<main style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px 48px", boxSizing: "border-box" }}>
				<ReportView audience="staff" schoolMode onData={setData} />
			</main>
		</div>
	);
}
