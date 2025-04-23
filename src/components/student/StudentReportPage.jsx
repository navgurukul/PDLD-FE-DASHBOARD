import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
	Typography,
	Box,
	Card,
	CardContent,
	Grid,
	FormControl,
	Select,
	MenuItem,
	Button,
	CircularProgress,
	Divider,
	Breadcrumbs,
	Link,
	Tabs,
	Tab,
} from "@mui/material";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import MUIDataTable from "mui-datatables";
import ButtonCustom from "../ButtonCustom";
import OutlinedButton from "../button/OutlinedButton";

// Mock data (replace with actual API calls in production)
const YEARS = [2023, 2024, 2025];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SUBJECTS = ["Hindi", "English", "Sanskrit", "Science", "SocialScience", "Math"];

// Color palette for charts
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

const StudentReportPage = () => {
	const navigate = useNavigate();
	const { schoolId, studentId } = useParams();
	const location = useLocation();
	const studentData = location.state?.studentData;
	const schoolName = location.state?.schoolName;
	const udiseCode = location.state?.udiseCode;

	const [isLoading, setIsLoading] = useState(false);
	const [selectedYear, setSelectedYear] = useState(2025);
	const [selectedMonth, setSelectedMonth] = useState(null);
	const [selectedSubject, setSelectedSubject] = useState(null);
	const [studentPerformance, setStudentPerformance] = useState([]);
	const [activeTab, setActiveTab] = useState(0);

	// Function to get color based on score

	useEffect(() => {
		// Function to fetch student performance data
		const fetchStudentPerformance = async () => {
			setIsLoading(true);
			try {
				// In a real app, you would call your API here
				// const response = await apiInstance.get(`/dev/student/performance/${studentId}`);
				// setStudentPerformance(response.data);

				// For now, generate mock data
				const mockData = generateMockPerformanceData();
				setStudentPerformance(mockData);
			} catch (error) {
				console.error("Error fetching student performance:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStudentPerformance();
	}, [studentId]);

	// Handle tab change
	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	// Generate mock performance data for demonstration
	const generateMockPerformanceData = () => {
		const data = [];

		YEARS.forEach((year) => {
			MONTHS.forEach((month) => {
				// Generate 2-3 tests per month randomly
				const testCount = 2 + Math.floor(Math.random() * 2);

				for (let i = 1; i <= testCount; i++) {
					const testType = ["Weekly", "Monthly", "Unit"][Math.floor(Math.random() * 3)];
					const testName = `${testType} Test ${i}`;

					const testData = {
						id: `${year}-${month}-${i}`,
						year: year,
						month: month,
						testName: testName,
						testType: testType,
					};

					let overallAvg = 0;

					// Generate scores for each subject
					SUBJECTS.forEach((subject) => {
						let baseScore;

						if (year === 2023) {
							baseScore = 60 + Math.random() * 15; // Lower in 2023
						} else if (year === 2024) {
							baseScore = 70 + Math.random() * 15; // Better in 2024
						} else {
							baseScore = 75 + Math.random() * 20; // Even better in 2025
						}

						testData[subject] = Math.round(baseScore);
						overallAvg += testData[subject];
					});

					testData.overallAvg = Math.round(overallAvg / SUBJECTS.length);
					data.push(testData);
				}
			});
		});

		return data;
	};

	// Get filtered data based on selections
	const getFilteredPerformance = () => {
		return studentPerformance.filter((record) => {
			if (selectedYear && record.year !== selectedYear) return false;
			if (selectedMonth && record.month !== selectedMonth) return false;
			return true;
		});
	};

	// Format data for monthly performance chart
	const getMonthlyPerformance = () => {
		if (!selectedYear) return [];

		const yearData = studentPerformance.filter((record) => record.year === selectedYear);

		// Group by month and calculate averages
		const monthlyData = MONTHS.map((month) => {
			const monthTests = yearData.filter((test) => test.month === month);

			if (monthTests.length === 0) {
				return { month };
			}

			const result = { month };

			// Calculate average for each subject
			SUBJECTS.forEach((subject) => {
				result[subject] = Math.round(
					monthTests.reduce((sum, test) => sum + test[subject], 0) / monthTests.length
				);
			});

			// Calculate overall average
			result.overall = Math.round(
				SUBJECTS.reduce((sum, subject) => sum + (result[subject] || 0), 0) / SUBJECTS.length
			);

			return result;
		});

		return monthlyData;
	};

	// Get year-over-year comparison data
	const getYearOverYearData = () => {
		const data = [];

		YEARS.forEach((year) => {
			const yearObj = { year: year.toString() };
			const yearTests = studentPerformance.filter((test) => test.year === year);

			if (yearTests.length > 0) {
				SUBJECTS.forEach((subject) => {
					yearObj[subject] = Math.round(
						yearTests.reduce((sum, test) => sum + test[subject], 0) / yearTests.length
					);
				});

				// Add overall average
				yearObj.overall = Math.round(
					SUBJECTS.reduce((sum, subject) => sum + (yearObj[subject] || 0), 0) / SUBJECTS.length
				);
			}

			data.push(yearObj);
		});

		return data;
	};

	// Get progression data for trending chart
	const getProgressionData = () => {
		if (!selectedYear) return [];

		const yearData = studentPerformance.filter((record) => record.year === selectedYear);

		// Sort tests chronologically
		const sortedTests = yearData.sort((a, b) => {
			const monthOrder = {
				Jan: 1,
				Feb: 2,
				Mar: 3,
				Apr: 4,
				May: 5,
				Jun: 6,
				Jul: 7,
				Aug: 8,
				Sep: 9,
				Oct: 10,
				Nov: 11,
				Dec: 12,
			};
			if (a.month !== b.month) {
				return monthOrder[a.month] - monthOrder[b.month];
			}
			return a.id.localeCompare(b.id);
		});

		return sortedTests;
	};

	// Get subject distribution data for radar chart
	const getSubjectDistribution = () => {
		if (getFilteredPerformance().length === 0) return [];

		const avgScores = {};

		SUBJECTS.forEach((subject) => {
			const scores = getFilteredPerformance().map((test) => test[subject]);
			avgScores[subject] = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
		});

		return [avgScores];
	};

	// Handle going back to student list
	const handleBack = () => {
		navigate(`/schools/schoolDetail/${schoolId}`);
	};

	// Format data for MUIDataTable
	const formatTableData = () => {
		return getFilteredPerformance()
			.sort((a, b) => {
				// Sort by year, then month
				const monthOrder = {
					Jan: 1,
					Feb: 2,
					Mar: 3,
					Apr: 4,
					May: 5,
					Jun: 6,
					Jul: 7,
					Aug: 8,
					Sep: 9,
					Oct: 10,
					Nov: 11,
					Dec: 12,
				};
				if (a.year !== b.year) return b.year - a.year;
				if (a.month !== b.month) return monthOrder[b.month] - monthOrder[a.month];
				return a.testName.localeCompare(b.testName);
			})
			.map((test) => {
				// Create a new object with the necessary fields
				const row = {
					testName: test.testName,
					date: `${test.month} ${test.year}`,
				};

				// Add subject scores (without percentage signs)
				SUBJECTS.forEach((subject) => {
					row[subject] = test[subject];
				});

				// Add overall average (without percentage sign)
				row["average"] = test.overallAvg;

				return row;
			});
	};

	// Define columns for MUIDataTable
	const columns = [
		{
			name: "testName",
			label: "TEST NAME",
			options: {
				filter: false,
				sort: true,
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
								fontSize: "14px",
								textTransform: "uppercase",
								padding: "16px 8px", // Add padding to the header
							}}
						>
							{columnMeta.label}
						</th>
					);
				},
				setCellProps: () => ({
					style: {
						padding: "4px 8px", // Reduce cell padding
					},
				}),
			},
		},
		{
			name: "date",
			label: "DATE",
			options: {
				filter: true,
				sort: true,
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								cursor: "pointer",
								borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
								fontSize: "14px",
								textTransform: "uppercase",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									paddingLeft: "16px",
								}}
							>
								{columnMeta.label}
							</div>
						</th>
					);
				},
				customBodyRender: (value) => <div style={{ whiteSpace: "nowrap" }}>{value}</div>,
			},
		},
		...SUBJECTS.map((subject) => ({
			name: subject,
			label: subject.toUpperCase(),
			options: {
				filter: false,
				sort: true,
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
								fontSize: "14px",
								textTransform: "uppercase",
							}}
							scope="col"
						>
							{columnMeta.label}
						</th>
					);
				},
				customBodyRender: (value) => <div style={{ textAlign: "center" }}>{value}</div>,
			},
		})),
		{
			name: "average",
			label: "AVERAGE",
			options: {
				filter: false,
				sort: true,
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
								fontSize: "14px",
								textTransform: "uppercase",
							}}
							scope="col"
						>
							{columnMeta.label}
						</th>
					);
				},
				customBodyRender: (value) => (
					<Typography
						variant="body2"
						sx={{
							fontWeight: "bold",
							textAlign: "center",
						}}
					>
						{value}
					</Typography>
				),
			},
		},
	];

	// MUIDataTable options
	const options = {
		filter: false,
		search: false,
		filterType: "dropdown",
		responsive: "standard",
		selectableRows: "none",
		download: false,
		print: false,
		viewColumns: false,
		searchPlaceholder: "Search by Test Name",
		rowsPerPage: 10,
		rowsPerPageOptions: [10, 20, 30],
		pagination: false,
		elevation: 0,
	};

	if (!studentData) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h5">Student data not found. Please go back and try again.</Typography>
				<Button variant="contained" startIcon={<KeyboardBackspaceIcon />} onClick={handleBack} sx={{ mt: 2 }}>
					Back to Students
				</Button>
			</Box>
		);
	}

	return (
		<Box className="main-page-wrapper">
			{/* Student Information Card - Clean Design with Reduced Spacing */}
			<Card
				sx={{
					mb: 3,
					borderRadius: 2,
					boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
					border: "1px solid #eaeaea",
				}}
			>
				<CardContent sx={{ p: 2 }}>
					<Typography
						variant="h6"
						sx={{
							color: "primary.main",
							fontWeight: "600",
							textAlign: "left",
							fontSize: "1.1rem",
							pb: 1,
							mb: 1.5,
							borderBottom: "1px solid #eaeaea",
						}}
					>
						{studentData.fullName}
					</Typography>

					<Grid container spacing={1.5} alignItems="center">
						<Grid item xs={3.5} sm={2} md={1.2}>
							<Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
								Class:
							</Typography>
						</Grid>
						<Grid item xs={8.5} sm={4} md={2.8}>
							<Typography variant="body2" sx={{ fontWeight: "500" }}>
								{studentData.class}
							</Typography>
						</Grid>

						<Grid item xs={3.5} sm={2} md={1.2}>
							<Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
								APAR ID:
							</Typography>
						</Grid>
						<Grid item xs={8.5} sm={4} md={2.8}>
							<Typography variant="body2" sx={{ fontWeight: "500" }}>
								{studentData.aparId || "N/A"}
							</Typography>
						</Grid>

						<Grid item xs={3.5} sm={2} md={1.2}>
							<Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
								School:
							</Typography>
						</Grid>
						<Grid item xs={8.5} sm={4} md={2.8}>
							<Typography variant="body2" sx={{ fontWeight: "500" }}>
								{schoolName}
							</Typography>
						</Grid>

						<Grid item xs={3.5} sm={2} md={1.2}>
							<Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
								UDISE:
							</Typography>
						</Grid>
						<Grid item xs={8.5} sm={4} md={2.8}>
							<Typography variant="body2" sx={{ fontWeight: "500" }}>
								{udiseCode}
							</Typography>
						</Grid>

						<Grid item xs={3.5} sm={2} md={1.2}>
							<Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
								Gender:
							</Typography>
						</Grid>
						<Grid item xs={8.5} sm={4} md={2.8}>
							<Typography variant="body2" sx={{ fontWeight: "500" }}>
								{studentData.gender}
							</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Tabs for Graph and Table */}
			<Box sx={{ mb: 2 }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					sx={{
						borderBottom: 1,
						borderColor: "divider",
						"& .MuiTab-root": { fontSize: "16px", fontWeight: "500" },
						"& .Mui-selected": { color: "#2F4F4F" },
					}}
					TabIndicatorProps={{ sx: { backgroundColor: "#2F4F4F" } }}
				>
					<Tab label="Performance Graphs" />
					<Tab label="Detailed Results" />
				</Tabs>
			</Box>

			{isLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
					<CircularProgress />
				</Box>
			) : (
				<>
					{/* Content based on active tab */}
					{activeTab === 0 && (
						<>
							{/* Performance Summary Card */}
							<Card sx={{ mb: 4, borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
								<CardContent>
									<h6 className="text-lg font-bold text-[#2F4F4F] mb-4">Performance Progression</h6>
									<Grid container spacing={3}>
										{/* Progress Trend */}
										<Grid item xs={12}>
											<Box sx={{ height: 300, width: "100%" }}>
												<ResponsiveContainer>
													<LineChart data={getProgressionData()}>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis
															dataKey="month"
															tickFormatter={(value, index) => {
																const item = getProgressionData()[index];
																return item ? item.month : value;
															}}
														/>
														<YAxis domain={[0, 100]} />
														<Tooltip
															formatter={(value, name) => [value, name]}
															labelFormatter={(value, index) => {
																const item = getProgressionData()[index];
																return item
																	? `${item.month} - ${item.testName}`
																	: value;
															}}
														/>
														<Legend />
														{selectedSubject ? (
															<Line
																type="monotone"
																dataKey={selectedSubject}
																name={selectedSubject}
																stroke="#2F4F4F"
																strokeWidth={2}
																dot={{ r: 6 }}
																activeDot={{ r: 8 }}
															/>
														) : (
															<>
																<Line
																	type="monotone"
																	dataKey="overallAvg"
																	name="Overall Average"
																	stroke="#000000"
																	strokeWidth={2}
																	dot={{ r: 6 }}
																	activeDot={{ r: 8 }}
																/>
																{SUBJECTS.map((subject, index) => (
																	<Line
																		key={subject}
																		type="monotone"
																		dataKey={subject}
																		name={subject}
																		stroke={COLORS[index % COLORS.length]}
																		dot={{ r: 4 }}
																		activeDot={{ r: 6 }}
																	/>
																))}
															</>
														)}
													</LineChart>
												</ResponsiveContainer>
											</Box>
										</Grid>
									</Grid>
								</CardContent>
							</Card>
						</>
					)}

					{activeTab === 1 && (
						<Card sx={{ mb: 4, borderRadius: 2 }}>
							<CardContent>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 2,
									}}
								>
									<h5 className="text-lg font-bold text-[#2F4F4F]">Detailed Test Results</h5>
								</Box>

								{getFilteredPerformance().length === 0 ? (
									<Typography
										variant="body1"
										sx={{ textAlign: "center", my: 3, color: "text.secondary" }}
									>
										No test data available for the selected filters.
									</Typography>
								) : (
									<div className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto">
										<MUIDataTable
											title=""
											data={formatTableData()}
											columns={columns}
											options={options}
										/>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</>
			)}
		</Box>
	);
};

export default StudentReportPage;
