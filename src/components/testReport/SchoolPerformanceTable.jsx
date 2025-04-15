import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip, Box, Chip } from "@mui/material";
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

const SchoolPerformanceTable = ({
	schools,
	onSchoolSelect,
	onSendReminder,
	totalSchools,
	schoolsSubmitted,
	submissionRate,
	overallPassRate,
	pendingSchools,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: "asc",
	});

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
		vsPrev: school.vsPrev !== undefined ? `${school.vsPrev > 0 ? "+" : ""}${school.vsPrev}%` : "-",
		submitted: school.submitted,
	}));

	const resetFilters = () => {
		setSearchQuery("");
		setStatusFilter("");
		setSortConfig({ key: null, direction: "asc" });
	};

	// Handler for sending reminder
	const handleSendReminder = (schoolId) => {
		if (onSendReminder) {
			onSendReminder(schoolId);
		}
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
			label: "School Name",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "status",
			label: "Status",
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
			label: "Students Tested",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "passRate",
			label: "Success Rate",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "avgScore",
			label: "Avg Score",
			options: {
				filter: false,
				sort: true,
				sortThirdClickReset: true,
			},
		},
		{
			name: "submitted",
			label: "Actions",
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

	// Calculate pending schools if not provided directly
	const pendingCount = pendingSchools !== undefined ? pendingSchools : totalSchools - schoolsSubmitted;

	return (
		<ThemeProvider theme={theme}>
			<div className="bg-white ">
				<div className="bg-white border-b-0 border-gray-100 mb-0">
					{/* School Submission with stats */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
						<div>
							<div>
								{/* <p className="text-2xl font-bold text-[#2F4F4F] mb-0 md:mb-0">School Submission f</p> */}
								<h5 className="text-[#2F4F4F]">Class 1 English Syllabus Test - Submission</h5>
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
									label={`Pending: ${pendingCount}`}
									variant="outlined"
									size="small"
									sx={{
										borderRadius: "8px",
										bgcolor: pendingCount > 0 ? "#fff8e1" : "#f5f5f5",
										fontWeight: 600,
										color: pendingCount > 0 ? "#f57c00" : "#757575",
										"& .MuiChip-icon": { color: pendingCount > 0 ? "#f57c00" : "#757575" },
									}}
								/>
							</Box>
							{/* <div>
								<p style={{ fontSize: "14px" }}>Class 1 English Syllabus Test </p>
								<span className="text-gray-600 text-sm">Test Date: 19 Apr 2025</span>
							</div> */}
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
				{/* <div className="overflow-hidden border border-grey-500 rounded-lg"> */}
				<div
					style={{ borderRadius: "8px" }}
					className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
				>
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
				</div>
			</div>
		</ThemeProvider>
	);
};

SchoolPerformanceTable.propTypes = {
	schools: PropTypes.array.isRequired,
	onSchoolSelect: PropTypes.func.isRequired,
	onSendReminder: PropTypes.func,
	totalSchools: PropTypes.number,
	schoolsSubmitted: PropTypes.number,
	submissionRate: PropTypes.number,
	overallPassRate: PropTypes.number,
	pendingSchools: PropTypes.number,
};

SchoolPerformanceTable.defaultProps = {
	schools: [],
	onSendReminder: () => {},
	totalSchools: 0,
	schoolsSubmitted: 0,
	submissionRate: 0,
	overallPassRate: 0,
};

export default SchoolPerformanceTable;
