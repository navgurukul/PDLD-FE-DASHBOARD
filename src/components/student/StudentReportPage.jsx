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
import ButtonCustom from "../ButtonCustom"
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
	const getScoreColor = (score) => {
		if (score >= 90) return "rgba(76, 175, 80, 0.2)"; // Green
		if (score >= 80) return "rgba(139, 195, 74, 0.2)"; // Light Green
		if (score >= 70) return "rgba(255, 193, 7, 0.2)"; // Amber
		if (score >= 60) return "rgba(255, 152, 0, 0.2)"; // Orange
		return "rgba(244, 67, 54, 0.2)"; // Red
	};

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

	// Function to format scores with color coding
	const formatScore = (score) => {
		let color;

		if (score >= 90) {
			color = "#4caf50"; // Green
		} else if (score >= 80) {
			color = "#8bc34a"; // Light Green
		} else if (score >= 70) {
			color = "#ffc107"; // Amber
		} else if (score >= 60) {
			color = "#ff9800"; // Orange
		} else {
			color = "#f44336"; // Red
		}

		return (
			<Typography
				component="span"
				sx={{
					color: color,
					fontWeight: "bold",
				}}
			>
				{score}%
			</Typography>
		);
	};

	// Handle going back to student list
	const handleBack = () => {
		navigate(`/schools/schoolDetail/${schoolId}`);
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
									<Typography variant="h6" gutterBottom>
										Performance Overview
									</Typography>
									<Grid container spacing={3}>
										{/* Progress Trend */}
										<Grid item xs={12}>
											<Divider sx={{ my: 2 }} />
											<Typography variant="subtitle1" gutterBottom>
												Performance Progression
											</Typography>
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
															formatter={(value, name) => [`${value}%`, name]}
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
										{/* Monthly Performance Chart */}
										<Grid item xs={12}>
											<Divider sx={{ my: 2 }} />
											<Typography variant="subtitle1" gutterBottom>
												Monthly Performance ({selectedYear})
											</Typography>
											<Box sx={{ height: 300, width: "100%" }}>
												<ResponsiveContainer>
													<AreaChart data={getMonthlyPerformance()}>
														<defs>
															<linearGradient
																id="colorGradient"
																x1="0"
																y1="0"
																x2="0"
																y2="1"
															>
																<stop
																	offset="5%"
																	stopColor="#2F4F4F"
																	stopOpacity={0.8}
																/>
																<stop
																	offset="95%"
																	stopColor="#2F4F4F"
																	stopOpacity={0.1}
																/>
															</linearGradient>
														</defs>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="month" />
														<YAxis domain={[0, 100]} />
														<Tooltip />
														<Legend />
														{selectedSubject ? (
															<Area
																type="monotone"
																dataKey={selectedSubject}
																name={selectedSubject}
																fill="url(#colorGradient)"
																stroke="#2F4F4F"
																activeDot={{ r: 8 }}
															/>
														) : (
															<Area
																type="monotone"
																dataKey="overall"
																name="Overall Average"
																fill="url(#colorGradient)"
																stroke="#2F4F4F"
																activeDot={{ r: 8 }}
															/>
														)}
													</AreaChart>
												</ResponsiveContainer>
											</Box>
										</Grid>
									</Grid>
								</CardContent>
							</Card>
						</>
					)}

					{activeTab === 1 && (
						<Card sx={{ mb: 4, borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
							<CardContent>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 2,
									}}
								>
									<Typography variant="h6">Detailed Test Results</Typography>
									<Box sx={{ display: "flex", gap: 2 }}>
										<OutlinedButton onClick={() => window.print()} text="Print" />

										<ButtonCustom text="Export" />
									</Box>
								</Box>

								{getFilteredPerformance().length === 0 ? (
									<Typography
										variant="body1"
										sx={{ textAlign: "center", my: 3, color: "text.secondary" }}
									>
										No test data available for the selected filters.
									</Typography>
								) : (
									<Box sx={{ overflowX: "auto" }}>
										<table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
											<thead>
												<tr style={{ backgroundColor: "#f5f5f5" }}>
													<th
														style={{
															padding: "12px 16px",
															textAlign: "left",
															borderBottom: "1px solid #e0e0e0",
														}}
													>
														Test
													</th>
													<th
														style={{
															padding: "12px 16px",
															textAlign: "left",
															borderBottom: "1px solid #e0e0e0",
														}}
													>
														Date
													</th>
													{SUBJECTS.map((subject) => (
														<th
															key={subject}
															style={{
																padding: "12px 16px",
																textAlign: "center",
																borderBottom: "1px solid #e0e0e0",
															}}
														>
															{subject}
														</th>
													))}
													<th
														style={{
															padding: "12px 16px",
															textAlign: "center",
															borderBottom: "1px solid #e0e0e0",
														}}
													>
														Average
													</th>
												</tr>
											</thead>
											<tbody>
												{getFilteredPerformance()
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
														if (a.month !== b.month)
															return monthOrder[b.month] - monthOrder[a.month];
														return a.testName.localeCompare(b.testName);
													})
													.map((test, index) => (
														<tr
															key={index}
															style={{
																backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9",
															}}
														>
															<td
																style={{
																	padding: "12px 16px",
																	borderBottom: "1px solid #e0e0e0",
																}}
															>
																{test.testName}
															</td>
															<td
																style={{
																	padding: "12px 16px",
																	borderBottom: "1px solid #e0e0e0",
																}}
															>{`${test.month} ${test.year}`}</td>
															{SUBJECTS.map((subject) => {
																// Color coding for scores
																let bgColor;
																const score = test[subject];

																if (score >= 90)
																	bgColor = "rgba(76, 175, 80, 0.2)"; // Green
																else if (score >= 80)
																	bgColor = "rgba(139, 195, 74, 0.2)"; // Light Green
																else if (score >= 70)
																	bgColor = "rgba(255, 193, 7, 0.2)"; // Amber
																else if (score >= 60)
																	bgColor = "rgba(255, 152, 0, 0.2)"; // Orange
																else bgColor = "rgba(244, 67, 54, 0.2)"; // Red

																return (
																	<td
																		key={subject}
																		style={{
																			padding: "12px 16px",
																			textAlign: "center",
																			borderBottom: "1px solid #e0e0e0",
																			backgroundColor: bgColor,
																		}}
																	>
																		{score}%
																	</td>
																);
															})}
															<td
																style={{
																	padding: "12px 16px",
																	textAlign: "center",
																	fontWeight: "bold",
																	borderBottom: "1px solid #e0e0e0",
																}}
															>
																{test.overallAvg}%
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</Box>
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
