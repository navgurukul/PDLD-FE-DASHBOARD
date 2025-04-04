import { useState, useEffect, useMemo } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, DocScanner } from "../utils/imagePath";
import { Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./TestListTable.css";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip";

import apiInstance from "../../api";
import { CLASS_OPTIONS, SUBJECT_OPTIONS, STATUS_LABELS } from "../data/testData";
import ButtonCustom from "./ButtonCustom";
import SpinnerPageOverlay from "./SpinnerPageOverlay";
import { FormControl } from "@mui/material";
import { Select } from "@mui/material";
import { InputLabel } from "@mui/material";

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

export default function TestListTable() {
	const [tests, setTests] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [dateRange, setDateRange] = useState([null, null]);
	const [startDate, endDate] = dateRange;
	const [isLoading, setIsLoading] = useState(false);

	// Track dropdown selections
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedSubject, setSelectedSubject] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	// Keeping this for placeholder only; no changes to date-range logic
	const [selectedDateRange, setSelectedDateRange] = useState("");
	const [totalRecords, setTotalRecords] = useState(0);

	const [currentPage, setCurrentPage] = useState(1);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (location.state?.successMessage) {
			toast.success(location.state.successMessage);
			// Remove state after showing the toast to prevent duplicate toasts
			navigate(location.pathname, { replace: true });
		}
	}, [location, navigate]);

	const pageSize = 20; // The fixed page size

	const handleCreateTest = () => {
		navigate("/testCreationForm"); // Replace with your target route
	};

	function formatDate(date) {
		if (!(date instanceof Date) || isNaN(date)) return null; // Guard if date is invalid
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}-${month}-${year}`; // e.g. "01-02-2020"
	}

	// Fetch data from API
	const fetchData = async () => {
		setIsLoading(true);
		try {
			let startDateFormatted;
			let endDateFormatted;

			// If user has selected both dates, use them; otherwise default
			if (startDate && endDate) {
				startDateFormatted = formatDate(startDate);
				endDateFormatted = formatDate(endDate);
			} else {
				startDateFormatted = "01-02-2020";
				endDateFormatted = "01-02-2026";
			}

			// Build your URL with all applicable filters, including status
			// let url = `/dev/test/filter?startDate=${startDateFormatted}&endDate=${endDateFormatted}&page=${currentPage}&pageSize=${pageSize}`;
			let url = `/dev/test/filter?startDate=${startDateFormatted}&endDate=${endDateFormatted}&pageSize=${pageSize}`;

			if (!selectedClass && !selectedSubject && !selectedStatus) {
				url += `&page=${currentPage}`;
			}

			if (selectedClass) {
				url += `&testClass=${selectedClass}`;
				url += `&page=1`;
			}
			if (selectedSubject) {
				url += `&subject=${selectedSubject}`;
				url += `&page=1`;
			}
			if (selectedStatus) {
				url += `&testStatus=${selectedStatus}`;
				url += `&page=1`;
			}

			const response = await apiInstance.get(url);
			if (response.data && response.data.data) {
				setTests(response.data.data.data);
				setTotalRecords(response.data.data.pagination.totalRecords);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Re-fetch data whenever any filter changes
	useEffect(() => {
		fetchData();
	}, [selectedClass, selectedSubject, selectedStatus, startDate, endDate, currentPage]);

	// Filter tests based on search query (local filter for "testName")
	const filteredTests = tests?.filter((test) => test.testName?.toLowerCase().includes(searchQuery.toLowerCase()));

	// Add this sort function at the component level
	// Sort function
	const sortByClassNumber = (data, order = "asc") => {
		return [...data].sort((a, b) => {
			const aClassNum = parseInt(a.testClass || 0, 10);
			const bClassNum = parseInt(b.testClass || 0, 10);
			return order === "asc" ? aClassNum - bClassNum : bClassNum - aClassNum;
		});
	};

	// State to track sorting
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: "asc",
	});

	// Add this sort function for dates
	const sortByDateTimestamp = (data, order = "asc") => {
		return [...data].sort((a, b) => {
			// Use the timestamp for proper date sorting
			const aTimestamp = new Date(a.testDate).getTime();
			const bTimestamp = new Date(b.testDate).getTime();

			return order === "asc" ? aTimestamp - bTimestamp : bTimestamp - aTimestamp;
		});
	};

	// Apply sorting based on which column is being sorted
	const sortedTests = useMemo(() => {
		if (!sortConfig.key) return filteredTests;

		switch (sortConfig.key) {
			case "class":
				return sortByClassNumber(filteredTests, sortConfig.direction);
			case "date":
				return sortByDateTimestamp(filteredTests, sortConfig.direction);
			default:
				return filteredTests;
		}
	}, [filteredTests, sortConfig]);

	// Then proceed with mapping to tableData as before
	const tableData = sortedTests?.map((test) => ({
		id: test.id,
		testName: test.testName,
		subject: test.subject || "N/A",
		class: `Class ${test.testClass || "N/A"}`,
		dateOfTest: new Date(test.testDate).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		schoolsSubmitted: test.totalSubmittedSchools || 0,
		// <-- Use testStatus directly instead of getStatus
		status: test.testStatus,
		actions: "View Report",
	}));

	// MUI DataTable columns
	const columns = [
		{
			name: "id",
			label: "ID",
			options: { display: false }, // Keep the ID hidden in the table
		},
		{
			name: "testName",
			label: "Test Name",
			options: { filter: false, sort: true },
		},
		{
			name: "subject",
			label: "Subject",
			options: { filter: true, sort: true },
		},
		{
			name: "class",
			label: "CLASS",
			options: {
				filter: true,
				sort: false, // Disable built-in sorting
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								cursor: "pointer",
								borderBottom: "1px solid lightgray",
								fontSize: "14px",
								textTransform: "uppercase", // Keep it capitalized
							}}
							onClick={() => {
								// Toggle sort direction if already sorting by class
								setSortConfig({
									key: "class",
									direction:
										sortConfig.key === "class" && sortConfig.direction === "asc" ? "desc" : "asc",
								});
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									// justifyContent: "center",
									paddingLeft: "16px",
								}}
							>
								{columnMeta.label}
								<span style={{ marginLeft: "5px" }}>
									{sortConfig.key === "class" ? (sortConfig.direction === "asc" ? "" : "") : ""}
								</span>
							</div>
						</th>
					);
				},
			},
		},
		{
			name: "dateOfTest",
			label: "DATE OF TEST",
			options: {
				filter: true,
				sort: false, // Disable built-in sorting
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								// textAlign: "center",
								cursor: "pointer",
								borderBottom: "1px solid lightgray",
								fontSize: "14px", // Smaller font size for this specific header
								textTransform: "uppercase", // Keep it capitalized
							}}
							onClick={() => {
								// Toggle sort direction if already sorting by date
								setSortConfig({
									key: "date",
									direction:
										sortConfig.key === "date" && sortConfig.direction === "asc" ? "desc" : "asc",
								});
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									// justifyContent: "center",
									paddingLeft: "16px",
								}}
							>
								{columnMeta.label}
								<span style={{ marginLeft: "5px" }}>
									{sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "" : "") : ""}
								</span>
							</div>
						</th>
					);
				},
				customBodyRender: (value) => <div style={{ whiteSpace: "nowrap" }}>{value}</div>,
			},
		},
		{
			name: "schoolsSubmitted",
			label: "SCHOOLS SUBMITTED",
			options: {
				filter: false,
				sort: true,
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								borderBottom: "1px solid lightgray",
								fontSize: "14px",
								width: "120px",
								maxWidth: "120px",
							}}
							scope="col"
						>
							{columnMeta.label}
						</th>
					);
				},
				customBodyRender: (value) => {
					return (
						<div
							style={{
								textAlign: "center",
								paddingLeft: "0px",
								width: "120px",
								maxWidth: "120px",
							}}
						>
							{value}
						</div>
					);
				},
				setCellProps: () => ({
					style: {
						width: "100px",
						maxWidth: "100px",
					},
				}),
			},
		},
		{
			name: "actions",
			label: "ACTIONS",
			options: {
				filter: false,
				sort: false,

				// Center the header text using customHeadRender with small font size
				customHeadRender: (columnMeta) => {
					return (
						<th
							style={{
								// textAlign: "center",
								borderBottom: "1px solid lightgray",
							}}
							scope="col"
						>
							<div
								style={{
									// textAlign: "center",
									fontSize: "14px",
								}}
							>
								{columnMeta.label}
							</div>
						</th>
					);
				},

				// The rest of your customBodyRender code remains the same
				customBodyRender: (value, tableMeta) => {
					const testId = tableMeta.rowData[0];
					return (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
							}}
						>
							<Button
								variant="outlined"
								size="small"
								color="primary"
								sx={{
									borderColor: "transparent",
									"&:hover": { borderColor: "transparent" },
								}}
								onClick={() => {
									navigate(`/editTest/${testId}`);
								}}
							>
								<img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
								&nbsp;
							</Button>
							<Button
								variant="outlined"
								size="small"
								sx={{
									borderColor: "transparent",
									color: "#2F4F4F",
									"&:hover": { borderColor: "transparent" },
								}}
							>
								<img src={DocScanner} alt="View Report" style={{ width: "20px", height: "20px" }} />
								&nbsp; View Report
							</Button>
						</div>
					);
				},
			},
		},
	];

	// MUI DataTable options
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
	};

	const resetFilters = () => {
		setSelectedClass("");
		setSelectedSubject("");
		setSelectedStatus("");
		setDateRange([null, null]);
		setSearchQuery("");
		setCurrentPage(1);
	};

	return (
		<ThemeProvider theme={theme}>
			{/* Main container with responsive adjustments */}
			<div className="main-page-wrapper px-3 sm:px-4">
				<h5 className="text-lg font-bold text-[#2F4F4F]">All Tests</h5>

				{/* Filters and Action Button - Stack on mobile */}
				<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
					{/* Search and Filters - Takes full width on mobile */}
					<div className="w-full lg:flex-1">
						<div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
							{/* Filter Container - Wrap on mobile */}
							<div className="flex justify-between w-full   gap-2">
								<div className="flex   w-full flex-wrap gap-2">
									<TextField
										variant="outlined"
										placeholder="Search by Test Name"
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
									{/* Class Dropdown */}
									<FormControl
										sx={{
											height: "48px",
											display: "flex",
											width: "150px",
										}}
									>
										<InputLabel
											id="class-select-label"
											sx={{
												transform: "translate(14px, 14px) scale(1)",
												"&.Mui-focused, &.MuiFormLabel-filled": {
													transform: "translate(14px, -9px) scale(0.75)",
												},
											}}
										>
											Class
										</InputLabel>
										<Select
											labelId="class-select-label"
											id="class-select"
											value={selectedClass}
											label="Class"
											onChange={(e) => setSelectedClass(e.target.value)}
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
											<MenuItem value="">Class</MenuItem>
											{CLASS_OPTIONS.map((option) => (
												<MenuItem
													key={option}
													value={parseInt(option.replace("Class ", ""), 10)}
												>
													{option}
												</MenuItem>
											))}
										</Select>
									</FormControl>

									{/* Subject Dropdown */}
									<FormControl
										sx={{
											height: "48px",
											display: "flex",
											width: { xs: "calc(50% - 4px)", sm: "150px" },
											minWidth: "120px",
											marginBottom: { xs: "8px", md: "0" },
										}}
									>
										<InputLabel
											id="subject-select-label"
											sx={{
												transform: "translate(14px, 14px) scale(1)",
												"&.Mui-focused, &.MuiFormLabel-filled": {
													transform: "translate(14px, -9px) scale(0.75)",
												},
											}}
										>
											Subject
										</InputLabel>
										<Select
											labelId="subject-select-label"
											id="subject-select"
											value={selectedSubject}
											label="Subject"
											onChange={(e) => setSelectedSubject(e.target.value)}
											sx={{
												height: "100%",
												borderRadius: "8px",
												backgroundColor: "#fff",
												"& .MuiOutlinedInput-notchedOutline": {
													borderRadius: "8px",
												},
												"& .MuiSelect-select": {
													paddingTop: "12px",
													paddingBottom: "12px",
													display: "flex",
													alignItems: "center",
													color: "#2F4F4F",
													fontWeight: "600",
												},
											}}
											MenuProps={{
												PaperProps: {
													sx: {
														maxHeight: 200,
														overflowY: "auto",
														"&::-webkit-scrollbar": {
															width: "5px",
														},
														"&::-webkit-scrollbar-thumb": {
															backgroundColor: "#B0B0B0",
															borderRadius: "5px",
														},
														"&::-webkit-scrollbar-track": {
															backgroundColor: "#F0F0F0",
														},
													},
												},
											}}
										>
											<MenuItem value="">All Subjects</MenuItem>
											{SUBJECT_OPTIONS.map((subject) => (
												<MenuItem key={subject} value={subject}>
													{subject}
												</MenuItem>
											))}
										</Select>
									</FormControl>

									{/* Date Range Picker */}
									<div
										style={{
											border: "1px solid lightgrey",
											borderRadius: "7px",
											height: "48px",
										}}
										className="w-full sm:w-auto min-w-[120px] mb-2 sm:mb-0"
									>
										<DatePicker
											className="my-date-picker w-full"
											selectsRange
											startDate={startDate}
											endDate={endDate}
											onChange={(dates) => {
												setDateRange(dates);
											}}
											placeholderText="Date Range"
											dateFormat="dd/MM/YYYY"
										/>
									</div>

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

								<div className="  ">
									<ButtonCustom
										imageName={addSymbolBtn}
										text={"Create Test"}
										onClick={handleCreateTest}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Data Table (rest of the code remains the same) */}
				<div
					style={{ borderRadius: "8px" }}
					className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
				>
					<MUIDataTable data={tableData} columns={columns} options={options} />
				</div>

				{/* Pagination - centered */}
				<div style={{ width: "max-content", margin: "25px auto" }}>
					<Pagination
						count={Math.ceil(totalRecords / pageSize)}
						page={currentPage}
						onChange={(e, page) => setCurrentPage(page)}
						showFirstButton
						showLastButton
					/>
				</div>

				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />

				{/* Loading Overlay */}
				{isLoading && <SpinnerPageOverlay isLoading={isLoading} />}
			</div>
		</ThemeProvider>
	);
}
