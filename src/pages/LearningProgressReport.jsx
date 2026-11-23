import { Link } from "react-router-dom";
import ReportView from "../components/learningProgress/ReportView";
import { HEADING_FONT, INK, MUTED } from "../components/learningProgress/lpTheme";

// Dashboard Learning Progress: the public report plus school rows, marks not entered and
// downloads, limited by the API to the officer's own blocks or clusters
export default function LearningProgressReport() {
	return (
		// Same page frame as the other reports (main-page-wrapper)
		<div className="main-page-wrapper" style={{ fontFamily: "'Karla', sans-serif", color: INK, paddingTop: 8 }}>
			<h1 style={{ fontFamily: HEADING_FONT, fontSize: 34, margin: "0 0 4px", textAlign: "left" }}>Learning Progress</h1>
			<p style={{ margin: "0 0 16px", color: MUTED, fontSize: 16 }}>
				Grades, averages and reading levels by block, cluster and school, with marks not entered and downloads.{" "}
				<Link to="/learning-progress" style={{ color: "#025B5A", fontWeight: 700 }}>Open the public page ↗</Link>
			</p>
			<ReportView audience="staff" />
		</div>
	);
}
