import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip, Box, Chip, CircularProgress } from "@mui/material";
import MUIDataTable from "mui-datatables";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DocScannerIcon from "@mui/icons-material/DocumentScanner";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DoneIcon from "@mui/icons-material/Done";
import PendingIcon from "@mui/icons-material/Pending";
import PercentIcon from "@mui/icons-material/Percent";
import apiInstance from "../../../api";
import axios from "axios"; // Keep axios as fallback
import { useParams, useLocation } from "react-router-dom";

// Create MUI theme to match TestListTable
const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiPaper: {
			styleOverrides: {
				root: {
					boxShadow: "none",
				},
			},
		},
		MuiPaginationItem: {
			styleOverrides: {
				root: {
					color: "black", // Change default text color
					backgroundColor: "white", // Change the background color of all buttons
					"&.Mui-selected": {
						backgroundColor: "#2F4F4F", // Change color when selected
						color: "white",
					},
					"&:hover": {
						backgroundColor: "#A3BFBF ", // Hover color
					},
				},
			},
		},
	},
});

const SchoolPerformanceTable = ({ onSchoolSelect, onSendReminder }) => {
	 
	
	// State for API data
	const [schools, setSchools] = useState([]);
	const [totalSchools, setTotalSchools] = useState(0);
	const [schoolsSubmitted, setSchoolsSubmitted] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// UI state
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: "asc",
	});

	// Get test ID from URL
	const { testId } = useParams();
	const location = useLocation();
	const testName = location.state?.testName  

	// Alternative way to get testId from URL
	const getTestIdFromUrl = () => {
		const pathParts = location.pathname.split("/");
		return testId || pathParts[pathParts.length - 1] || "b78a7596-7cd8-49e1-8c9e-7db0973fbbc0";
	};

	const currentTestId = getTestIdFromUrl();

	// Fetch data from API
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				let response;

				// First try with the API instance (which handles auth)
				try {
					response = await apiInstance.get(`/schools/results/submitted/${currentTestId}`);
				} catch (apiInstanceError) {
					console.warn("Error with apiInstance, trying direct URL as fallback:", apiInstanceError);

					// If that fails with CORS, try with a direct URL as fallback
					// This can help if the issue is related to baseURL configuration
					const token = localStorage.getItem("authToken");

					response = await axios.get(
						`https://vjcme31onh.execute-api.ap-south-1.amazonaws.com/dev/schools/results/submitted/${currentTestId}`,
						{
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
								...(token ? { Authorization: `Bearer ${token}` } : {}),
							},
						}
					);
				}

				// Process the successful response
				if (response.data && response.data.success) {
					const { schools: apiSchools, totalSubmittedSchools, pagination } = response.data.data;

					// Transform API data to match the component's expected format
					const formattedSchools = apiSchools.map((school) => ({
						id: school.id,
						name: school.schoolName,
						schoolName: school.schoolName,
						blockName: school.blockName,
						clusterName: school.clusterName,
						udiseCode: school.udiseCode,
						passRate: school.successRate, // Map successRate to passRate
						submitted: true, // All schools in the response are submitted
						studentsTested: "-", // Not provided in API
						avgScore: "-", // Not provided in API
					}));

					setSchools(formattedSchools);
					setSchoolsSubmitted(totalSubmittedSchools);
					setTotalSchools(pagination.totalSchools || totalSubmittedSchools);
				} else {
					setError("Failed to load data");
				}
			} catch (err) {
				console.error("Error fetching school data:", err);
				if (err.message && err.message.includes("CORS")) {
					setError("CORS error: Unable to access the API. Please check network settings or try again later.");
				} else {
					setError("An error occurred while fetching data");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [currentTestId]);

	// Filter schools based on search query and status
	const filteredSchools = useMemo(() => {
		return schools.filter((school) => {
			const schoolName = (school.name || school.schoolName || "").toLowerCase();
			const matchesSearch = schoolName.includes(searchQuery.toLowerCase());
			const matchesStatus =
				!statusFilter ||
				(statusFilter === "submitted" && school.submitted) ||
				(statusFilter === "pending" && !school.submitted);
			return matchesSearch && matchesStatus;
		});
	}, [schools, searchQuery, statusFilter]);

	// Apply sorting based on which column is being sorted
	const sortedSchools = useMemo(() => {
		if (!sortConfig.key) return filteredSchools;

		return [...filteredSchools].sort((a, b) => {
			// Handle special cases for different fields
			if (sortConfig.key === "name" || sortConfig.key === "schoolName") {
				const aName = (a.name || a.schoolName || "").toLowerCase();
				const bName = (b.name || b.schoolName || "").toLowerCase();
				return sortConfig.direction === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName);
			}

			if (sortConfig.key === "vsPrev") {
				const aValue = a.vsPrev || 0;
				const bValue = b.vsPrev || 0;
				return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
			}

			// Default comparison for numeric fields
			const aValue = a[sortConfig.key] || 0;
			const bValue = b[sortConfig.key] || 0;
			return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
		});
	}, [filteredSchools, sortConfig]);

	// Format table data for MUIDataTable
	const tableData = sortedSchools.map((school) => ({
		id: school.id,
		name: school.name || school.schoolName || "",
		status: school.submitted ? "Submitted" : "Pending",
		studentsTested: school.studentsTested || "-",
		passRate: school.passRate ? `${school.passRate}%` : "-",
		avgScore: school.avgScore || "-",
		submitted: school.submitted,
	}));

	const resetFilters = () => {
		setSearchQuery("");
		setStatusFilter("");
		setSortConfig({ key: null, direction: "asc" });
	};

	// MUI DataTable columns configuration
	const columns = [
		{
			name: "id",
			label: "ID",
			options: { display: false }, // Keep the ID hidden in the table
		},
		{
			name: "name",
			label: "SCHOOL NAME",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "status",
			label: "STATUS",
			options: {
				filter: true,
				sort: false,
				customBodyRenderLite: (dataIndex) => {
					const status = tableData[dataIndex].status;
					return (
						<div
							className="inline-block px-2 py-1 rounded-full text-xs"
							style={{
								backgroundColor: status === "Submitted" ? "#e8f5e9" : "#fff8e1",
								color: status === "Submitted" ? "#2e7d32" : "#f57c00",
							}}
						>
							{status}
						</div>
					);
				},
			},
		},
		{
			name: "studentsTested",
			label: "STUDENTS TESTED",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "passRate",
			label: "SUCCESS RATE",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "avgScore",
			label: "AVG SCORE",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "submitted",
			label: "ACTIONS",
			options: {
				filter: false,
				sort: false,
				customBodyRenderLite: (dataIndex) => {
					const rowData = tableData[dataIndex];
					const schoolId = rowData.id;
					const isSubmitted = rowData.submitted;

					if (isSubmitted) {
						// Show View Details button for submitted schools
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Button
									variant="outlined"
									size="small"
									onClick={() => onSchoolSelect(schoolId)}
									sx={{
										borderColor: "transparent",
										color: "#2F4F4F",
										"&:hover": { borderColor: "transparent" },
									}}
								>
									<DocScannerIcon style={{ width: "20px", height: "20px" }} />
									&nbsp; View Details
								</Button>
							</div>
						);
					} else {
						// Show Remind button for pending schools
						return (
							<div style={{ display: "flex", justifyContent: "center" }}>
								<Button
									variant="outlined"
									size="small"
									sx={{
										borderRadius: "8px",
										borderColor: "rgba(224, 224, 224, 0.6)", // Faded border color
										color: "rgba(47, 79, 79, 0.6)", // Faded text color
										opacity: 0.7, // Faded appearance
										textTransform: "none",
										fontSize: "0.75rem",
										padding: "4px 10px",
										"&:hover": {
											borderColor: "#2F4F4F",
											backgroundColor: "rgba(47, 79, 79, 0.08)",
											opacity: 1, // Full opacity on hover
										},
									}}
								>
									<DocScannerIcon style={{ width: "20px", height: "20px" }} />
									&nbsp; View Details
								</Button>
							</div>
						);
					}
				},
			},
		},
	];

	// MUI DataTable options
	const options = {
		filter: false,
		search: false,
		download: false,
		print: false,
		viewColumns: false,
		selectableRows: "none",
		responsive: "standard",
		rowsPerPage: 10,
		rowsPerPageOptions: [10, 20, 30],
		pagination: false,
	};

	// Calculate pending schools
	const pendingSchools = totalSchools - schoolsSubmitted;
	const submissionRate = totalSchools > 0 ? Math.round((schoolsSubmitted / totalSchools) * 100) : 0;

	// Show loading indicator while fetching data
	if (loading) {
		return (
			<div className="flex justify-center items-center p-10" style={{ minHeight: "300px" }}>
				<CircularProgress size={60} thickness={4} sx={{ color: "#2F4F4F" }} />
			</div>
		);
	}

	// Show error message if data fetch failed
	if (error) {
		return (
			<div className="border border-gray-200 rounded-lg p-8 text-center">
				<div className="text-red-500 mb-3">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<h3 className="text-lg font-semibold">Error Loading Data</h3>
				</div>
				<p className="text-gray-600">{error}</p>
				<Button 
					variant="outlined" 
					onClick={() => window.location.reload()}
					sx={{ 
						mt: 3,
						color: "#2F4F4F",
						borderColor: "#2F4F4F",
						'&:hover': {
							borderColor: "#2F4F4F",
							backgroundColor: "rgba(47, 79, 79, 0.08)",
						}
					}}
				>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<div className="bg-white ">
				<div className="bg-white border-b-0 border-gray-100 mb-0">
					{/* School Submission with stats */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
						<div>
							<div>
								<h5 className="text-[#2F4F4F]">{testName} - Submission</h5>
							</div>
						</div>

						<Box className="">
							<Box className="flex flex-wrap gap-3 md:justify-end items-center">
								<Chip
									icon={<PeopleAltIcon style={{ fontSize: "16px" }} />}
									label={`Total: ${totalSchools}`}
									variant="outlined"
									size="small"
									sx={{
										borderRadius: "8px",
										bgcolor: "#f5f5f5",
										fontWeight: 600,
										color: "#2F4F4F",
										"& .MuiChip-icon": { color: "#2F4F4F" },
									}}
								/>
								<Chip
									icon={<DoneIcon style={{ fontSize: "16px" }} />}
									label={`Submitted: ${schoolsSubmitted}`}
									variant="outlined"
									size="small"
									sx={{
										borderRadius: "8px",
										bgcolor: "#e8f5e9",
										fontWeight: 600,
										color: "#2e7d32",
										"& .MuiChip-icon": { color: "#2e7d32" },
									}}
								/>
								<Chip
									icon={<PendingIcon style={{ fontSize: "16px" }} />}
									label={`Pending: ${pendingSchools}`}
									variant="outlined"
									size="small"
									sx={{
										borderRadius: "8px",
										bgcolor: pendingSchools > 0 ? "#fff8e1" : "#f5f5f5",
										fontWeight: 600,
										color: pendingSchools > 0 ? "#f57c00" : "#757575",
										"& .MuiChip-icon": { color: pendingSchools > 0 ? "#f57c00" : "#757575" },
									}}
								/>
							</Box>
						</Box>
					</div>
				</div>

				{/* Filters section */}
				<div className="pb-4 border-b border-gray-100">
					<div className="flex flex-wrap items-center gap-3">
						{/* Search field */}
						<TextField
							variant="outlined"
							placeholder="Search by School Name"
							size="small"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								style: {
									backgroundColor: "#fff",
									borderRadius: "8px",
									height: "48px",
									minWidth: "250px",
									width: "360px",
								},
							}}
							sx={{ marginBottom: { xs: "10px", md: "0" } }}
						/>

						{/* Status Dropdown */}
						<FormControl
							sx={{
								height: "48px",
								display: "flex",
								width: "150px",
							}}
						>
							<InputLabel
								id="status-select-label"
								sx={{
									transform: "translate(14px, 14px) scale(1)",
									"&.Mui-focused, &.MuiFormLabel-filled": {
										transform: "translate(14px, -9px) scale(0.75)",
									},
								}}
							>
								Status
							</InputLabel>
							<Select
								labelId="status-select-label"
								id="status-select"
								value={statusFilter}
								label="Status"
								onChange={(e) => setStatusFilter(e.target.value)}
								sx={{
									height: "100%",
									borderRadius: "8px",
									"& .MuiOutlinedInput-notchedOutline": {
										borderRadius: "8px",
									},
									"& .MuiSelect-select": {
										paddingTop: "12px",
										paddingBottom: "12px",
										display: "flex",
										alignItems: "center",
									},
								}}
							>
								<MenuItem value="">All Status</MenuItem>
								<MenuItem value="submitted">Submitted</MenuItem>
								<MenuItem value="pending">Pending</MenuItem>
							</Select>
						</FormControl>

						{/* Reset Button */}
						<Tooltip title="Reset Filters" placement="top">
							<Button
								onClick={resetFilters}
								variant="outlined"
								sx={{
									minWidth: "40px",
									width: "40px",
									height: "40px",
									padding: "8px",
									borderRadius: "8px",
									borderColor: "#f0f0f0",
									backgroundColor: "#f5f5f5",
									"&:hover": {
										backgroundColor: "#e0e0e0",
										borderColor: "#e0e0e0",
									},
								}}
							>
								<RestartAltIcon color="action" />
							</Button>
						</Tooltip>
					</div>
				</div>

				{/* Data Table */}
				<div
					style={{ borderRadius: "8px" }}
					className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
				>
					{schools.length > 0 ? (
						<MUIDataTable
							data={tableData}
							columns={columns}
							options={{
								...options,
								elevation: 0,
								tableBodyMaxHeight: "calc(100vh - 300px)",
								fixedHeader: true,
							}}
						/>
					) : (
						<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
							<h3 className="text-lg font-medium text-gray-700 mb-1">No Schools Data Available</h3>
							<p className="text-gray-500 mb-4">No school submissions have been recorded for this test yet.</p>
							<Button
								variant="outlined"
								sx={{
									borderRadius: "8px",
									borderColor: "#2F4F4F",
									color: "#2F4F4F",
									textTransform: "none",
									"&:hover": {
										borderColor: "#2F4F4F",
										backgroundColor: "rgba(47, 79, 79, 0.08)",
									},
								}}
							>
								Refresh Data
							</Button>
						</div>
					)}
				</div>
			</div>
		</ThemeProvider>
	);
};

export default SchoolPerformanceTable;