import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Typography, Box, Paper, Grid, Card, CardContent, Divider } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";

// Mock data - months of the year
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SUBJECTS = ["Hindi", "English", "Sanskrit", "Science", "SocialScience", "Math"];

// Colors for the chart lines
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

const SchoolReport = ({ schoolId, schoolName, udiseCode }) => {
	const [performanceData, setPerformanceData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [yearlyAverage, setYearlyAverage] = useState({});

	useEffect(() => {
		// Simulate API call to fetch performance data
		const timer = setTimeout(() => {
			// Generate mock data for monthly performance
			const mockData = MONTHS.map((month) => {
				const result = { month };

				// Generate random data for each subject with an upward trend
				SUBJECTS.forEach((subject) => {
					// Make the data show a general upward trend
					const baseScore =
						month === "Jan"
							? 60
							: month === "Feb"
							? 63
							: month === "Mar"
							? 65
							: month === "Apr"
							? 68
							: month === "May"
							? 70
							: month === "Jun"
							? 72
							: month === "Jul"
							? 74
							: month === "Aug"
							? 76
							: month === "Sep"
							? 78
							: month === "Oct"
							? 81
							: month === "Nov"
							? 83
							: 85;

					// Add some randomness
					result[subject] = Math.round(baseScore + (Math.random() * 10 - 5));
				});

				// Calculate overall average
				result.overall = Math.round(
					SUBJECTS.reduce((sum, subject) => sum + result[subject], 0) / SUBJECTS.length
				);

				return result;
			});

			// Calculate yearly average for each subject
			const subjectAverages = {};
			SUBJECTS.forEach((subject) => {
				subjectAverages[subject] = Math.round(
					mockData.reduce((sum, month) => sum + month[subject], 0) / mockData.length
				);
			});

			// Calculate overall yearly average
			subjectAverages.overall = Math.round(
				Object.values(subjectAverages).reduce((sum, val) => sum + val, 0) / SUBJECTS.length
			);

			setYearlyAverage(subjectAverages);
			setPerformanceData(mockData);
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, [schoolId]);

	// Function to capitalize first letter
	const capitalizeFirstLetter = (string) => {
		if (!string) return "";
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	};

	if (isLoading) {
		return <SpinnerPageOverlay isLoading={isLoading} />;
	}

	return (
		<Box className="school-report-container">
			<Grid container spacing={3}>
				{/* School Info Card */}
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ mb: 2 }}>
								School Information
							</Typography>
							<Divider sx={{ mb: 2 }} />

							<Grid container spacing={2}>
								<Grid item xs={3}>
									<Typography variant="subtitle2" color="text.secondary">
										School Name:
									</Typography>
								</Grid>
								<Grid item xs={9}>
									<Typography variant="body1">{capitalizeFirstLetter(schoolName)}</Typography>
								</Grid>

								<Grid item xs={3}>
									<Typography variant="subtitle2" color="text.secondary">
										UDISE Code:
									</Typography>
								</Grid>
								<Grid item xs={9}>
									<Typography variant="body1">{udiseCode || "N/A"}</Typography>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				{/* Performance Chart */}
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
								<TrendingUpIcon sx={{ mr: 1 }} /> Monthly Performance Trend (2025)
							</Typography>
							<Divider sx={{ mb: 3 }} />

							<Box sx={{ height: "400px", width: "100%" }}>
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={performanceData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis domain={[0, 100]} />
										<Tooltip />
										<Legend />
										{SUBJECTS.map((subject, index) => (
											<Line
												key={subject}
												type="monotone"
												dataKey={subject}
												stroke={COLORS[index % COLORS.length]}
												activeDot={{ r: 6 }}
											/>
										))}
										<Line
											type="monotone"
											dataKey="overall"
											name="Overall Average"
											stroke="#000000"
											strokeWidth={2}
											activeDot={{ r: 8 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default SchoolReport;
