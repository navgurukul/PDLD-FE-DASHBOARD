import { useState } from "react";
import { Link } from "react-router-dom";
import ReportView from "../../components/learningProgress/ReportView";
import { SiteFooter, SiteHeader } from "../../components/learningProgress/SiteChrome";
import { HEADING_FONT, INK, PAGE_BG, YELLOW, placeName, titleCase } from "../../components/learningProgress/lpTheme";

// Public Learning Progress report: no login, district/block/cluster totals only
export default function PublicLearningProgress() {
	const [data, setData] = useState(null);
	const place = data?.place;
	return (
		// Own scroll area: the app locks page scrolling (index.css) for the dashboard layout
		<div style={{ fontFamily: "'Karla', sans-serif", color: INK, background: PAGE_BG, height: "100vh", overflowY: "auto" }}>
			<SiteHeader active="report" />
			<section style={{ background: INK, color: "#ffffff" }}>
				<div style={{ maxWidth: 1240, margin: "0 auto", padding: "26px 24px 28px" }}>
					<nav aria-label="Breadcrumb" style={{ fontSize: 15, color: "#C5D4D4", marginBottom: 6 }}>
						<Link to="/learning-progress" style={{ color: YELLOW }}>Dantewada district</Link>
						{place?.block && <> › <Link to={`/learning-progress?block=${encodeURIComponent(place.block)}`} style={{ color: place.cluster ? YELLOW : "#ffffff" }}>{titleCase(place.block)} block</Link></>}
						{place?.cluster && <> › <b style={{ color: "#ffffff" }}>{titleCase(place.cluster)} cluster</b></>}
					</nav>
					<h1 style={{ fontFamily: HEADING_FONT, fontSize: 40, margin: "0 0 4px" }}>Learning Progress{place && place.level !== "district" ? `: ${placeName(place)}` : ""}</h1>
					<p style={{ margin: 0, color: "#E3ECEC", fontSize: 17 }}>How children are doing in each class and subject, and how that changes from test to test.</p>
				</div>
			</section>
			<main style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 24px 56px", boxSizing: "border-box" }}>
				<ReportView audience="public" onData={setData} />
			</main>
			<SiteFooter lastUpdated={data?.dataAsOf} />
		</div>
	);
}
