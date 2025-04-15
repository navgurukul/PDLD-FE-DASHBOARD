import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Tooltip } from "@mui/material";
import MUIDataTable from "mui-datatables";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DocScannerIcon from "@mui/icons-material/DocumentScanner";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

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

 
const SchoolPerformanceTable = ({ schools, onSchoolSelect, onSendReminder }) => {
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
		// {
		// 	name: "vsPrev",
		// 	label: "vs Prev",
		// 	options: {
		// 		filter: false,
		// 		sort: true,
		// 		sortThirdClickReset: true,
		// 		customBodyRenderLite: (dataIndex) => {
		// 			const value = tableData[dataIndex].vsPrev;
		// 			const isPositive = value && value.startsWith("+");

		// 			return <div style={{ color: isPositive ? "#2e7d32" : "#c62828" }}>{value}</div>;
		// 		},
		// 	},
		// },
		// Updated actions column to show different buttons based on submission status
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

	return (
		<ThemeProvider theme={theme}>
			<div className=" ">
				<h5 className="text-lg font-bold text-[#2F4F4F]">School Submission</h5>

				{/* Filters - Exact match to TestListTable */}
				<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
					<div className="w-full lg:flex-1">
						<div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
							<div className="flex justify-between w-full gap-2">
								<div className="flex flex-wrap gap-2">
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
									<div className="flex justify-end sm:justify-start w-full sm:w-auto">
										<Tooltip title="Reset Filters" placement="top">
											<div
												onClick={resetFilters}
												style={{
													cursor: "pointer",
													display: "flex",
													alignItems: "center",
													backgroundColor: "#f5f5f5",
													padding: "6px 12px",
													borderRadius: "4px",
													height: "48px",
												}}
											>
												<RestartAltIcon color="action" />
											</div>
										</Tooltip>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Data Table */}
				<div
					style={{ borderRadius: "8px" }}
					className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
				>
					<MUIDataTable data={tableData} columns={columns} options={options} />
				</div>
			</div>
		</ThemeProvider>
	);
};

SchoolPerformanceTable.propTypes = {
	schools: PropTypes.array.isRequired,
	onSchoolSelect: PropTypes.func.isRequired,
	onSendReminder: PropTypes.func,
};

SchoolPerformanceTable.defaultProps = {
	schools: [],
	onSendReminder: () => {},
};

export default SchoolPerformanceTable;
