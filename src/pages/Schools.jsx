import { useState } from "react";
import SchoolList from "./SchoolList";
import BulkUpload from "../components/BulkUpload"; // The bulk upload component

export default function Schools() {
	const [view, setView] = useState("list"); // "list" or "upload"

	const switchToUpload = () => {
		setView("upload");
	};

	const switchToList = () => {
		setView("list");
	};

	return (
		<div>
			{view === "list" ? <SchoolList onBulkUploadClick={switchToUpload} /> : <BulkUpload onBack={switchToList} />}
		</div>
	);
}
