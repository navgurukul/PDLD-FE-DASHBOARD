import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PieChart from "../components/testReport/charts/PieChart";
import BarChart from "../components/testReport/charts/BarChart";
import StudentPerformanceTable from "../components/testReport/StudentPerformanceTable";
import apiInstance from "../../api";
import theme from "../theme/theme";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";

// Import mock data and helper functions
import { MOCK_TESTS, formatDate, calculateScoreDistribution, PASS_THRESHOLD } from "../data/testReportData";

// Flag to toggle between mock data and API calls
const USE_MOCK_DATA = true;

// Define the theme color to use consistently across components
const THEME_COLOR = "#2F4F4F";
const SECONDARY_COLOR = "#FFEBEB";

const SchoolReportPage = () => {
	const { testId, schoolId } = useParams();
	const navigate = useNavigate();

	const [testData, setTestData] = useState(null);
	const [schoolData, setSchoolData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch school-specific performance data
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				// For mock data, always show the first test and first submitted school
				if (USE_MOCK_DATA) {
					// Simulate API delay
					setTimeout(() => {
						// Always use the first test from mock data
						const mockTest = MOCK_TESTS[0];

						// Get the first submitted school
						const mockSchool = mockTest.schools.find((school) => school.submitted === true);

						if (mockTest && mockSchool) {
							setTestData(mockTest);
							setSchoolData(mockSchool);
						} else {
							setError("Mock data not available");
						}
						setIsLoading(false);
					}, 500);
					return;
				}

				// For API, use the actual IDs
				const testResponse = await apiInstance.get(`/dev/test/${testId}`);
				const schoolResponse = await apiInstance.get(`/dev/test/${testId}/school/${schoolId}/report`);

				if (testResponse.data?.data && schoolResponse.data?.data) {
					setTestData(testResponse.data.data);
					setSchoolData(schoolResponse.data.data);
				} else {
					setError("Invalid data format received from the server");
				}
				setIsLoading(false);
			} catch (err) {
				console.error("Error fetching data:", err);
				setError("Failed to load school report. Please try again later.");
				toast.error("Failed to load school report. Please try again later.");
				setIsLoading(false);
			}
		};

		fetchData();
	}, [testId, schoolId]);

	const handleBackToTestReport = () => {
		navigate(`/test-report/${testId}`);
	};

	const handleViewProfile = (studentId) => {
		// Show a toast notification
		toast.info(`Viewing profile for student ID: ${studentId}`);
	};

	const handleExportStudentData = (format = "csv") => {
		if (!schoolData || !schoolData.students) {
			toast.error("No student data available to export");
			return;
		}

		// Create CSV content
		const headers = ["Student Name", "Score", "Performance", "vs Class Avg"];
		const csvData = schoolData.students.map((student) => [
			student.name,
			`${student.score}/100`,
			student.score >= PASS_THRESHOLD ? "Achieved Target" : "Needs Improvement",
			`${student.score > schoolData.avgScore ? "+" : ""}${(student.score - schoolData.avgScore).toFixed(1)}`,
		]);

		// Create CSV content
		const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

		// Create download link
		const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `students-${schoolId}-test-${testId}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (isLoading) {
		return <SpinnerPageOverlay isLoading={true} />;
	}

	if (error || !schoolData) {
		return (
			<div className="p-4 text-center">
				<h3 className="text-red-500">{error || "Failed to load school data"}</h3>
			</div>
		);
	}

	// Calculate score distribution for the bar chart if not provided by API
	const scoreDistribution =
		schoolData.scoreDistribution || (schoolData.students ? calculateScoreDistribution(schoolData.students) : []);

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper px-3 sm:px-4">
				{/* School Header */}
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-[#2F4F4F]">{schoolData.name || schoolData.schoolName}</h2>
					<div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
						<span>{testData?.testName || "Test Details"}</span>
						<span>•</span>
						<span>{testData?.subject || schoolData.subject}</span>
						<span>•</span>
						<span>Class {testData?.testClass || schoolData.class}</span>
					</div>
				</div>

				{/* Performance Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white p-4 rounded shadow">
						<div className="text-sm text-gray-500">Students Tested</div>
						<div className="text-2xl font-bold text-[#2F4F4F]">{schoolData.studentsTested}</div>
					</div>
					<div className="bg-white p-4 rounded shadow">
						<div className="text-sm text-gray-500">Pass Rate</div>
						<div className="text-2xl font-bold text-[#2F4F4F]">{schoolData.passRate}%</div>
					</div>
					<div className="bg-white p-4 rounded shadow">
						<div className="text-sm text-gray-500">Average Score</div>
						<div className="text-2xl font-bold text-[#2F4F4F]">{schoolData.avgScore}/100</div>
					</div>
				</div>

				{/* Visualizations */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					{/* Pass/Fail ratio chart */}
					<div className="bg-white p-4 rounded shadow">
						<h3 className="text-lg font-semibold mb-4 text-[#2F4F4F]">Performance Summary</h3>
						<div className="h-64 flex items-center justify-center">
							<div className="text-center">
								{/* Using the PieChart with single color theme */}
								<PieChart 
									percentage={schoolData.passRate} 
									primaryColor={THEME_COLOR} 
									secondaryColor={SECONDARY_COLOR}
								/>
								<div className="mt-4">
									<div className="flex items-center justify-center">
										<span className="w-4 h-4 bg-[#2F4F4F] inline-block mr-2"></span>
										<span>ACHIEVED TARGET: {schoolData.passRate}%</span>
									</div>
									<div className="flex items-center justify-center mt-1">
										<span className="w-4 h-4 bg-[#FFEBEB] inline-block mr-2"></span>
										<span>NEEDS IMPROVEMENT: {100 - schoolData.passRate}%</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Score distribution chart */}
					<div className="bg-white p-4 rounded shadow">
						<h3 className="text-lg font-semibold mb-4 text-[#2F4F4F]">Score Distribution</h3>
						<div className="h-64 flex items-center justify-center">
							{/* Using the BarChart with the same theme color */}
							<BarChart 
								data={scoreDistribution}
								primaryColor={THEME_COLOR}
							/>
						</div>
					</div>
				</div>

				{/* Student Performance Table */}
				<StudentPerformanceTable
					students={schoolData.students}
					classAvg={schoolData.avgScore}
					onViewProfile={handleViewProfile}
					onExport={handleExportStudentData}
				/>

				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</div>
		</ThemeProvider>
	);
};

export default SchoolReportPage;