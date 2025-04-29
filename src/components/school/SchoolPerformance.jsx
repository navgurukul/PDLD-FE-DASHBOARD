import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Typography, Box, Paper } from "@mui/material";
import SpinnerPageOverlay from "../SpinnerPageOverlay";

// Mock data - months of the year
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SUBJECTS = ["Hindi", "English", "Sanskrit", "Science", "SocialScience", "Math"];

// Colors for the chart lines
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

const SchoolPerformance = () => {
	const { testId } = useParams();
	const location = useLocation();
	const [performanceData, setPerformanceData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [schoolInfo, setSchoolInfo] = useState({
		name: "School Name",
		udiseCode: "UDISE Code",
	});

	useEffect(() => {
		// Get school info from location state if available
		if (location.state?.schoolName) {
			setSchoolInfo({
				name: location.state.schoolName,
				udiseCode: location.state.udiseCode || "N/A",
			});
		}

		// Simulate API call to fetch performance data
		const timer = setTimeout(() => {
			// Generate mock data for monthly performance
			const mockData = MONTHS.map((month) => {
				const result = { month };

				// Generate random data for each subject
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

			setPerformanceData(mockData);
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, [testId, location.state]);

	if (isLoading) {
		return <SpinnerPageOverlay isLoading={isLoading} />;
	}

	return (
		<Box className="main-page-wrapper p-4">
			<h5 className="text-lg font-bold text-[#2F4F4F] mb-2">School Performance Report</h5>

			<Paper
				variant="outlined"
				sx={{
					p: 3,
					mb: 4,
					borderRadius: 2,
					boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				}}
			>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body1" color="text.secondary">
						School Name: {schoolInfo.name}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						UDISE: {schoolInfo.udiseCode}
					</Typography>
				</Box>

				<Typography variant="h6" sx={{ fontWeight: "600", mb: 2, textAlign: "left" }}>
					Monthly Performance (2025)
				</Typography>

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
								name="Overall Average (in %)"
								stroke="#000000"
								strokeWidth={2}
								activeDot={{ r: 8 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</Box>
			</Paper>
		</Box>
	);
};

export default SchoolPerformance;
