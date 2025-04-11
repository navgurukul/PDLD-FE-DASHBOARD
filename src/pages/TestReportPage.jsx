import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TestOverview from "../components/testReport/TestOverview";
import SchoolSubmissionStatus from "../components/testReport/SchoolSubmissionStatus";
import SchoolPerformanceTable from "../components/testReport/SchoolPerformanceTable";
import apiInstance from "../../api";
import theme from "../theme/theme";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";

// Import mock data and helper functions
import { MOCK_TESTS, formatDate } from "../data/testReportData";

// Flag to toggle between mock data and API calls
const USE_MOCK_DATA = true;

const TestReportPage = () => {
	const { testId } = useParams();
	const navigate = useNavigate();

	const [testData, setTestData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch test details and school performance data
	useEffect(() => {
		const fetchTestReport = async () => {
			try {
				setIsLoading(true);

				// For mock data, always show the first test regardless of ID
				if (USE_MOCK_DATA) {
					// Simulate API delay
					setTimeout(() => {
						// Always use the first test from mock data regardless of ID
						const mockTest = MOCK_TESTS[0];
						if (mockTest) {
							setTestData(mockTest);
						} else {
							setError("Mock data not available");
						}
						setIsLoading(false);
					}, 500);
					return;
				}

				// For API, use the actual ID
				const response = await apiInstance.get(`/dev/test/${testId}/report`);

				if (response.data && response.data.data) {
					setTestData(response.data.data);
				} else {
					setError("Invalid data format received from the server");
				}
				setIsLoading(false);
			} catch (err) {
				console.error("Error fetching test report:", err);
				setError("Failed to load test report. Please try again later.");
				toast.error("Failed to load test report. Please try again later.");
				setIsLoading(false);
			}
		};

		fetchTestReport();
	}, [testId]);

	const handleBackToTests = () => {
		navigate("/allTest");
	};

	// In TestReportPage.jsx
	const handleSchoolSelect = (schoolId) => {
		navigate(`/allTest/test-report/${testId}/school/${schoolId}`);
	};

	if (isLoading) {
		return <SpinnerPageOverlay isLoading={true} />;
	}

	if (error) {
		return (
			<div className="p-4 text-center">
				<h3 className="text-red-500">{error}</h3>
				<button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleBackToTests}>
					Back to Tests
				</button>
			</div>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper px-3 sm:px-4">
				{testData && (
					<>
						{/* Test Header */}
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-[#2F4F4F]">{testData.testName}</h2>
							<div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
								<span>{testData.subject}</span>
								<span>•</span>
								<span>Class {testData.testClass}</span>
								<span>•</span>
								<span>Test Date: {formatDate(testData.testDate)}</span>
							</div>
						</div>

						{/* Test Overview Component */}
						<TestOverview
							totalSchools={testData.totalSchools}
							schoolsSubmitted={testData.schoolsSubmitted}
							submissionRate={(testData.schoolsSubmitted / testData.totalSchools) * 100}
							overallPassRate={testData.overallPassRate}
						/>

						{/* School Submission Status Component */}
						<SchoolSubmissionStatus
							schoolsSubmitted={testData.schoolsSubmitted}
							totalSchools={testData.totalSchools}
							pendingSchools={testData.schools.filter((school) => !school.submitted)}
						/>

						{/* School Performance Table Component */}
						<SchoolPerformanceTable schools={testData.schools} onSchoolSelect={handleSchoolSelect} />
					</>
				)}

				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</div>
		</ThemeProvider>
	);
};

export default TestReportPage;
