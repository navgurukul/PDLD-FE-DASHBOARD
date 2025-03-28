import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, DocScanner } from "../utils/imagePath";
import { Button, TextField, MenuItem } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./TestListTable.css";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import apiInstance from "../../api";
import { CLASS_OPTIONS, SUBJECT_OPTIONS, STATUS_LABELS } from "../data/testData";
import ButtonCustom from "./ButtonCustom";

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
			let url = `/dev/test/filter?startDate=${startDateFormatted}&endDate=${endDateFormatted}&page=${currentPage}&pageSize=${pageSize}`;

			if (selectedClass) {
				url += `&testClass=${selectedClass}`;
			}
			if (selectedSubject) {
				url += `&subject=${selectedSubject}`;
			}
			if (selectedStatus) {
				url += `&testStatus=${selectedStatus}`;
			}

			const response = await apiInstance.get(url);
			if (response.data && response.data.data) {
				setTests(response.data.data.data);
				setTotalRecords(response.data.data.pagination.totalRecords);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	// Re-fetch data whenever any filter changes
	useEffect(() => {
		fetchData();
	}, [selectedClass, selectedSubject, selectedStatus, startDate, endDate, currentPage]);

	// Filter tests based on search query (local filter for "testName")
	const filteredTests = tests?.filter((test) => test.testName?.toLowerCase().includes(searchQuery.toLowerCase()));

	const tableData = filteredTests?.map((test) => ({
		id: test.id,
		testName: test.testName,
		subject: test.subject || "N/A",
		class: `Class ${test.testClass || "N/A"}`,
		dateOfTest: new Date(test.testDate).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		schoolsSubmitted: 30,
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
			label: "Class",
			options: { filter: true, sort: true },
		},
		{
			name: "dateOfTest",
			label: "Date of Test",
			options: { filter: true, sort: true },
			customBodyRender: (value) => <div style={{ whiteSpace: "nowrap" }}>{value}</div>,
		},
		{
			name: "schoolsSubmitted",
			label: "Schools Submitted",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ textAlign: "center" }}>{value}</div>;
				},
				setHeaderProps: () => ({
					style: {
						textAlign: "center",
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
					  textAlign: "center",
					  borderBottom: "1px solid lightgray",
					}}
					scope="col"
				  >
					<div style={{ textAlign: "center", fontSize: "14px" }}>{columnMeta.label}</div>
				  </th>
				);
			  },
		  
			  // The rest of your customBodyRender code remains the same
			  customBodyRender: (value, tableMeta) => {
				const testId = tableMeta.rowData[0];
				return (
				  <div style={{ display: "flex", gap: "8px" }}>
					<Button
					  variant="outlined"
					  size="small"
					  color="primary"
					  sx={{
						borderColor: "transparent",
						"&:hover": { borderColor: "transparent" },
					  }}
					  onClick={() => {
						console.log("Test ID:", testId);
						navigate(`/edit/testCreation/${testId}`);
					  }}
					>
					  <img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
					  &nbsp;
					</Button>
					<Button
					  variant="outlined"
					  size="small"
					  color="secondary"
					  sx={{
						borderColor: "transparent",
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
		  }
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

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper">
				<h5 className="text-lg font-bold text-[#2F4F4F]">All Tests</h5>

				{/* Search Bar */}
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
							width: "420px",
							height: "48px",
						},
					}}
					sx={{ marginBottom: "10px" }}
				/>

				{/* Filters */}
				<div className="flex justify-between items-center">
					<div className="flex gap-2 my-[10px] mx-0">
						{/* Class Dropdown */}
						<TextField
							select
							size="small"
							variant="outlined"
							label="Class"
							value={selectedClass}
							onChange={(e) => setSelectedClass(e.target.value)}
							sx={{
								width: 150,
								"& .MuiSelect-select": {
									color: "#2F4F4F",
									fontWeight: "600",
									padding: "12px 16px",
								},
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
									backgroundColor: "#fff",
								},
							}}
						>
							<MenuItem value="">Class</MenuItem>
							{CLASS_OPTIONS.map((option) => (
								<MenuItem key={option} value={parseInt(option.replace("Class ", ""), 10)}>
									{option}
								</MenuItem>
							))}
						</TextField>

						{/* Subject Dropdown */}
						<TextField
							select
							size="small"
							variant="outlined"
							label="Subject"
							value={selectedSubject}
							onChange={(e) => setSelectedSubject(e.target.value)}
							sx={{
								width: 150,
								"& .MuiSelect-select": {
									color: "#2F4F4F",
									fontWeight: "600",
									padding: "12px 16px",
								},
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
									backgroundColor: "#fff",
								},
							}}
							SelectProps={{
								MenuProps: {
									PaperProps: {
										sx: {
											maxHeight: 200, // Set the maximum height of the dropdown
											overflowY: "auto", // Add scroll functionality
											"&::-webkit-scrollbar": {
												width: "5px", // Make the scrollbar 5px wide
											},
											"&::-webkit-scrollbar-thumb": {
												backgroundColor: "#B0B0B0", // Set scrollbar thumb to grey
												borderRadius: "5px",
											},
											"&::-webkit-scrollbar-track": {
												backgroundColor: "#F0F0F0", // Optional: lighter grey for the track
											},
										},
									},
								},
							}}
						>
							<MenuItem value="">Subject</MenuItem>
							{SUBJECT_OPTIONS.map((subject) => (
								<MenuItem key={subject} value={subject}>
									{subject}
								</MenuItem>
							))}
						</TextField>

						{/* Status Dropdown */}
						<TextField
							select
							size="small"
							variant="outlined"
							label="Status"
							value={selectedStatus}
							onChange={(e) => setSelectedStatus(e.target.value)}
							sx={{
								width: 150,
								"& .MuiSelect-select": {
									color: "#2F4F4F",
									fontWeight: "600",
									padding: "12px 16px",
								},
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
									backgroundColor: "#fff",
								},
							}}
						>
							<MenuItem value="">Status</MenuItem>
							{Object.keys(STATUS_LABELS).map((status) => (
								<MenuItem key={status} value={status}>
									{STATUS_LABELS[status]}
								</MenuItem>
							))}
						</TextField>

						{/* Date Range Dropdown (placeholder) */}

						<div style={{ border: "1px solid lightgrey", borderRadius: "7px" }}>
							<DatePicker
								className="my-date-picker"
								selectsRange
								startDate={startDate}
								endDate={endDate}
								onChange={(dates) => {
									const [start, end] = dates;
									setDateRange(dates);
								}}
								placeholderText="Date Range"
								dateFormat="dd/MM/YYYY "
								style={{ width: "220px" }}
							/>
						</div>
					</div>

					<ButtonCustom imageName={addSymbolBtn} text={"Create Test"} onClick={handleCreateTest} />
				</div>

				{/* Data Table */}
				<div style={{ borderRadius: "8px" }}>
					<MUIDataTable
						data={tableData}
						columns={columns.map((column) => ({
							...column,
							options: {
								...column.options,
								setCellProps: () => ({
									style: {
										paddingLeft: "30px",
										paddingRight: "30px",
									},
								}),
							},
						}))}
						options={options}
						sx={{
							"& .MuiPaper-root": {
								boxShadow: "none",
							},
							"& .MuiTableCell-root": {
								textAlign: "center",
							},
						}}
					/>
				</div>
				<div
					style={{
						width: "max-content",
						margin: "25px auto",
					}}
				>
					<Pagination
						count={Math.ceil(totalRecords / pageSize)}
						page={currentPage}
						onChange={(e, page) => setCurrentPage(page)}
						showFirstButton
						showLastButton
					/>
				</div>
				{/* <ToastContainer /> */}
				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</div>
		</ThemeProvider>
	);
}
