import { useState, useMemo } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";


// Create theme matching the TestListTable styling
const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiTableCell: {
			styleOverrides: {
				root: {
					backgroundColor: "none",
					fontFamily: "Karla !important",
					textAlign: "left",
					"&.custom-cell": {
						width: "0px",
					},
				},
				head: {
					fontSize: "14px",
					fontWeight: 500,
					textAlign: "left",
				},
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					"&:hover": {
						backgroundColor: "rgba(47, 79, 79, 0.1) !important",
						cursor: "pointer",
					},
				},
			},
		},
		MuiToolbar: {
			styleOverrides: {
				regular: {
					minHeight: "8px",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					boxShadow: "none",
				},
			},
		},
	},
});

const StudentAcademics = () => {
	// State for filter selections
	const [syllabusMonth, setSyllabusMonth] = useState("All");
	const [maxMarks, setMaxMarks] = useState("All");
	const [status, setStatus] = useState("All");
	const [remedialMonth, setRemedialMonth] = useState("All");
	const [subject, setSubject] = useState("All");

	// Data for Syllabus Test
	const syllabusData = [
		{
			month: "April",
			maxMarks: 30,
			hindi: 21,
			english: 24,
			mathematics: 23,
			science: 25,
			socialStudies: 27,
			sanskrit: 29,
			overallPercentage: "96%",
			status: "Satisfactory",
		},
		{
			month: "May",
			maxMarks: 30,
			hindi: 21,
			english: 24,
			mathematics: 23,
			science: 25,
			socialStudies: 27,
			sanskrit: 29,
			overallPercentage: "96%",
			status: "Satisfactory",
		},
		{
			month: "June",
			maxMarks: 30,
			hindi: "03",
			english: "03",
			mathematics: "03",
			science: "03",
			socialStudies: 12,
			sanskrit: 14,
			overallPercentage: "20%",
			status: "Needs Improvement",
		},
		{
			month: "July",
			maxMarks: 30,
			hindi: 21,
			english: 24,
			mathematics: 23,
			science: 25,
			socialStudies: 27,
			sanskrit: 29,
			overallPercentage: "96%",
			status: "Satisfactory",
		},
		{
			month: "August",
			maxMarks: 30,
			hindi: 21,
			english: 24,
			mathematics: 23,
			science: 25,
			socialStudies: 27,
			sanskrit: 29,
			overallPercentage: "96%",
			status: "Satisfactory",
		},
		{
			month: "September",
			maxMarks: 30,
			hindi: 21,
			english: 24,
			mathematics: 23,
			science: 25,
			socialStudies: 27,
			sanskrit: 29,
			overallPercentage: "96%",
			status: "Satisfactory",
		},
	];

	// Data for Remedial Test
	const remedialData = [
		{ month: "April", subject: "Hindi", testType: "Baseline", grade: "Beginner" },
		{ month: "April", subject: "Mathematics", testType: "Baseline", grade: "Beginner" },
		{ month: "June", subject: "Hindi", testType: "Baseline", grade: "Letters" },
		{ month: "August", subject: "Hindi", testType: "Midline", grade: "Words" },
	];

	// Filter data based on selections
	const filteredSyllabusData = useMemo(() => {
		return syllabusData.filter(
			(item) =>
				(syllabusMonth === "All" || item.month === syllabusMonth) &&
				(maxMarks === "All" || item.maxMarks.toString() === maxMarks) &&
				(status === "All" || item.status === status)
		);
	}, [syllabusData, syllabusMonth, maxMarks, status]);

	const filteredRemedialData = useMemo(() => {
		return remedialData.filter(
			(item) =>
				(remedialMonth === "All" || item.month === remedialMonth) && 
				(subject === "All" || item.subject === subject)
		);
	}, [remedialData, remedialMonth, subject]);

	// Reset all filters
	const resetSyllabusFilters = () => {
		setSyllabusMonth("All");
		setMaxMarks("All");
		setStatus("All");
	};

	const resetRemedialFilters = () => {
		setRemedialMonth("All");
		setSubject("All");
	};

	// Unique values for dropdown options
	const monthOptions = [...new Set(syllabusData.map(item => item.month))];
	const maxMarksOptions = [...new Set(syllabusData.map(item => item.maxMarks))];
	const statusOptions = [...new Set(syllabusData.map(item => item.status))];
	const subjectOptions = [...new Set(remedialData.map(item => item.subject))];

	// Column definitions for Syllabus MUIDataTable
	const syllabusColumns = [
		{
			name: "month",
			label: "Month",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "maxMarks",
			label: "Max Marks",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "hindi",
			label: "Hindi",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <span className={value === "03" ? "text-red-500 font-medium" : ""}>{value}</span>;
				},
			},
		},
		{
			name: "english",
			label: "English",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <span className={value === "03" ? "text-red-500 font-medium" : ""}>{value}</span>;
				},
			},
		},
		{
			name: "mathematics",
			label: "Mathematics",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <span className={value === "03" ? "text-red-500 font-medium" : ""}>{value}</span>;
				},
			},
		},
		{
			name: "science",
			label: "Science",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <span className={value === "03" ? "text-red-500 font-medium" : ""}>{value}</span>;
				},
			},
		},
		{
			name: "socialStudies",
			label: "Social Studies",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "sanskrit",
			label: "Sanskrit",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "overallPercentage",
			label: "Overall %",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "status",
			label: "Status",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return (
						<span
							className={`px-2 py-1 text-xs font-medium rounded-full ${
								value === "Satisfactory"
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{value}
						</span>
					);
				},
			},
		},
	];

	// Column definitions for Remedial MUIDataTable
	const remedialColumns = [
		{
			name: "month",
			label: "Month",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "subject",
			label: "Subject",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "testType",
			label: "Test Type",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "grade",
			label: "Grade",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return (
						<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
							{value}
						</span>
					);
				},
			},
		},
	];

	// Options for MUIDataTable
	const options = {
		filter: false,
		search: false,
		download: false,
		print: false,
		viewColumns: false,
		selectableRows: "none",
		elevation: 0,
		pagination: false,
		responsive: "standard",
	};

	return (
		<ThemeProvider theme={theme}>
			<div className="w-full mx-auto font-sans">
				{/* Syllabus Test Section */}
				<div className="mb-8">
					<h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Syllabus Test</h5>

					{/* Filters */}
					<div className="flex flex-wrap gap-4 mb-4">
						{/* Month Dropdown */}
						<FormControl sx={{ minWidth: 120 }} size="small">
							<InputLabel id="month-select-label">Month</InputLabel>
							<Select
								labelId="month-select-label"
								id="month-select"
								value={syllabusMonth}
								label="Month"
								onChange={(e) => setSyllabusMonth(e.target.value)}
								sx={{
									borderRadius: "8px",
									backgroundColor: "#fff",
									height: "40px",
									"& .MuiOutlinedInput-notchedOutline": {
										borderRadius: "8px",
									},
								}}
							>
								<MenuItem value="All"> Months</MenuItem>
								{monthOptions.map((month) => (
									<MenuItem key={month} value={month}>
										{month}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Max Marks Dropdown */}
						<FormControl sx={{ minWidth: 120 }} size="small">
							<InputLabel id="marks-select-label">Max Marks</InputLabel>
							<Select
								labelId="marks-select-label"
								id="marks-select"
								value={maxMarks}
								label="Max Marks"
								onChange={(e) => setMaxMarks(e.target.value)}
								sx={{
									borderRadius: "8px",
									backgroundColor: "#fff",
									height: "40px",
									"& .MuiOutlinedInput-notchedOutline": {
										borderRadius: "8px",
									},
								}}
							>
								<MenuItem value="All">Marks</MenuItem>
								{maxMarksOptions.map((marks) => (
									<MenuItem key={marks} value={marks.toString()}>
										{marks}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Status Dropdown */}
						<FormControl sx={{ minWidth: 120 }} size="small">
							<InputLabel id="status-select-label">Status</InputLabel>
							<Select
								labelId="status-select-label"
								id="status-select"
								value={status}
								label="Status"
								onChange={(e) => setStatus(e.target.value)}
								sx={{
									borderRadius: "8px",
									backgroundColor: "#fff",
									height: "40px",
									"& .MuiOutlinedInput-notchedOutline": {
										borderRadius: "8px",
									},
								}}
							>
								<MenuItem value="All"> Status</MenuItem>
								{statusOptions.map((statusOption) => (
									<MenuItem key={statusOption} value={statusOption}>
										{statusOption}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Reset Button */}
						<Button
							variant="outlined"
							onClick={resetSyllabusFilters}
							sx={{
								borderRadius: "8px",
								height: "40px",
								borderColor: "#2F4F4F",
								color: "#2F4F4F",
								'&:hover': {
									borderColor: "#2F4F4F",
									backgroundColor: "rgba(47, 79, 79, 0.1)",
								}
							}}
						>
							Reset
						</Button>
					</div>

					{/* Syllabus Test MUIDataTable */}
					<div className="border border-gray-200 rounded-lg overflow-hidden">
						<MUIDataTable
							data={filteredSyllabusData}
							columns={syllabusColumns}
							options={options}
						/>
					</div>
				</div>

				{/* Remedial Test Section */}
				<div>
					<h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Remedial Test</h5>

					{/* Filters */}
					<div className="flex flex-wrap gap-4 mb-4">
						{/* Month Dropdown */}
						<FormControl sx={{ minWidth: 120 }} size="small">
							<InputLabel id="remedial-month-select-label">Month</InputLabel>
							<Select
								labelId="remedial-month-select-label"
								id="remedial-month-select"
								value={remedialMonth}
								label="Month"
								onChange={(e) => setRemedialMonth(e.target.value)}
								sx={{
									borderRadius: "8px",
									backgroundColor: "#fff",
									height: "40px",
									"& .MuiOutlinedInput-notchedOutline": {
										borderRadius: "8px",
									},
								}}
							>
								<MenuItem value="All">Months</MenuItem>
								{monthOptions.map((month) => (
									<MenuItem key={month} value={month}>
										{month}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Subject Dropdown */}
						<FormControl sx={{ minWidth: 120 }} size="small">
							<InputLabel id="subject-select-label">Subject</InputLabel>
							<Select
								labelId="subject-select-label"
								id="subject-select"
								value={subject}
								label="Subject"
								onChange={(e) => setSubject(e.target.value)}
								sx={{
									borderRadius: "8px",
									backgroundColor: "#fff",
									height: "40px",
									"& .MuiOutlinedInput-notchedOutline": {
										borderRadius: "8px",
									},
								}}
							>
								<MenuItem value="All"> Subjects</MenuItem>
								{subjectOptions.map((subjectOption) => (
									<MenuItem key={subjectOption} value={subjectOption}>
										{subjectOption}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Reset Button */}
						<Button
							variant="outlined"
							onClick={resetRemedialFilters}
							sx={{
								borderRadius: "8px",
								height: "40px",
								borderColor: "#2F4F4F",
								color: "#2F4F4F",
								'&:hover': {
									borderColor: "#2F4F4F",
									backgroundColor: "rgba(47, 79, 79, 0.1)",
								}
							}}
						>
							Reset
						</Button>
					</div>

					{/* Remedial Test MUIDataTable */}
					<div className="border border-gray-200 rounded-lg overflow-hidden">
						<MUIDataTable
							data={filteredRemedialData}
							columns={remedialColumns}
							options={options}
						/>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default StudentAcademics;