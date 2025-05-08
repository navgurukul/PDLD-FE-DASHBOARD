import { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Button, TextField, MenuItem, CircularProgress, Tooltip, Menu, ListItemIcon, ListItemText } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, Select, InputLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { Search } from "lucide-react";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import {noSchoolImage} from "../utils/imagePath";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";

// Create theme for consistent styling
const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiTableCell: {
			styleOverrides: {
				root: {
					backgroundColor: "none",
					fontFamily: "Karla !important",
					textAlign: "left",
					"&.custom-cell": {
						width: "0px",
					},
				},
				head: {
					fontSize: "14px",
					fontWeight: 500,
					textAlign: "left",
				},
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					"&:hover": {
						backgroundColor: "rgba(47, 79, 79, 0.1) !important",
						cursor: "pointer",
					},
				},
			},
		},
		MuiToolbar: {
			styleOverrides: {
				regular: {
					minHeight: "8px",
				},
			},
		},
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
					color: "black",
					backgroundColor: "white",
					"&.Mui-selected": {
						backgroundColor: "#2F4F4F",
						color: "white",
					},
					"&:hover": {
						backgroundColor: "#A3BFBF",
					},
				},
			},
		},
	},
});

const Reports = () => {
	const navigate = useNavigate();

	// State management
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSchool, setSelectedSchool] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedClass, setSelectedClass] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalRecords, setTotalRecords] = useState(0);
	const [reportData, setReportData] = useState([]);
	const [schools, setSchools] = useState([]);
	
	// State for download menu
	const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);
	const downloadMenuOpen = Boolean(downloadMenuAnchorEl);

	const pageSize = 10;

	// Mock data for schools - in real implementation, this would come from an API
	useEffect(() => {
		// This would be an API call in a real implementation
		const mockSchools = [
			{ id: "111223456", name: "Govt. Primary School Raiganj" },
			{ id: "111223457", name: "Govt. Primary School Manjhipadar" },
			{ id: "111223458", name: "Govt. Primary School Bhilaigarh" },
			{ id: "111223459", name: "Govt. Primary School Patrapali" },
		];
		setSchools(mockSchools);
	}, []);

	// Filter schools based on search query
	const filteredSchools = schools.filter(
		(school) => school.name.toLowerCase().includes(searchQuery.toLowerCase()) || school.id.includes(searchQuery)
	);

	// Mock report data - in real implementation, this would come from an API
	useEffect(() => {
		if (selectedSchool) {
			setIsLoading(true);
			// Simulate API call delay
			setTimeout(() => {
				const mockReportData = [
					{
						name: "Test - 1",
						noOfStudents: 38,
						maxMarks: 30,
						hindi: 24,
						english: 23,
						mathematics: 25,
						science: 27,
						socialScience: 29,
						healthCare: 29,
						it: 29,
					},
					{
						name: "Test - 1",
						noOfStudents: 38,
						maxMarks: 30,
						hindi: 24,
						english: 23,
						mathematics: 25,
						science: 27,
						socialScience: 29,
						healthCare: 29,
						it: 29,
					},
					{
						name: "Test - 1",
						noOfStudents: 38,
						maxMarks: 50,
						hindi: 24,
						english: 23,
						mathematics: 12,
						science: 11,
						socialScience: 29,
						healthCare: 7,
						it: 29,
					},
					{
						name: "Test - 1",
						noOfStudents: 38,
						maxMarks: 30,
						hindi: 24,
						english: 23,
						mathematics: 25,
						science: 27,
						socialScience: 29,
						healthCare: 29,
						it: 29,
					},
					{
						name: "Test - 1",
						noOfStudents: 38,
						maxMarks: 30,
						hindi: 24,
						english: "03",
						mathematics: 25,
						science: 27,
						socialScience: 29,
						healthCare: 29,
						it: 29,
					},
				];

				setReportData(mockReportData);
				setTotalRecords(mockReportData.length);
				setIsLoading(false);
			}, 800);
		} else {
			setReportData([]);
		}
	}, [selectedSchool, selectedClass, currentPage]);

	// Handle school selection
	const handleSchoolSelect = (school) => {
		setSelectedSchool(school);
		setSearchQuery(`${school.id} - ${school.name}`);
		setShowDropdown(false);
	};

	// Handle search input change
	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
		setShowDropdown(true);
		if (!e.target.value) {
			setSelectedSchool(null);
		}
	};

	// Function to determine text color based on value
	const getTextColor = (value) => {
		if (typeof value === "string" || typeof value === "number") {
			const numValue = parseInt(value, 10);
			if (!isNaN(numValue) && numValue < 20) {
				return "#FF0000"; // Red color for low scores
			}
		}
		return "#000000"; // Default color
	};

	// Reset filters
	const resetFilters = () => {
		setSelectedClass("");
		setSearchQuery("");
		setSelectedSchool(null);
		setCurrentPage(1);
	};

	// Handle opening download menu
	const handleDownloadClick = (event) => {
		setDownloadMenuAnchorEl(event.currentTarget);
	};

	// Handle closing download menu
	const handleDownloadClose = () => {
		setDownloadMenuAnchorEl(null);
	};

	// Download report as PDF
	const handleDownloadPDF = () => {
		toast.info("Generating PDF report...");
		
		// In a real implementation, you would call an API endpoint to generate the PDF
		// For now, we'll simulate with a timeout and then trigger the download
		setTimeout(() => {
			// In a real implementation, this would be the actual PDF data from your backend
			// For demonstration, we'll create a simple HTML-to-PDF approach
			
			// Create a hidden HTML element with the data formatted for PDF
			const printContent = document.createElement('div');
			printContent.style.display = 'none';
			printContent.innerHTML = `
				<h2>${selectedSchool ? selectedSchool.name : 'School'} Performance Report</h2>
				<h3>${selectedClass || 'All Classes'}</h3>
				<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
					<tr>
						<th>Name of Exam</th>
						<th>No. of Students</th>
						<th>Max Marks</th>
						<th>Hindi</th>
						<th>English</th>
						<th>Mathematics</th>
						<th>Science</th>
						<th>Social Science</th>
						<th>Health Care</th>
						<th>IT</th>
					</tr>
					${reportData.map(row => `
						<tr>
							<td>${row.name}</td>
							<td>${row.noOfStudents}</td>
							<td>${row.maxMarks}</td>
							<td style="color: ${getTextColor(row.hindi)}">${row.hindi}</td>
							<td style="color: ${getTextColor(row.english)}">${row.english}</td>
							<td style="color: ${getTextColor(row.mathematics)}">${row.mathematics}</td>
							<td style="color: ${getTextColor(row.science)}">${row.science}</td>
							<td style="color: ${getTextColor(row.socialScience)}">${row.socialScience}</td>
							<td style="color: ${getTextColor(row.healthCare)}">${row.healthCare}</td>
							<td style="color: ${getTextColor(row.it)}">${row.it}</td>
						</tr>
					`).join('')}
				</table>
				<p style="margin-top: 20px; font-size: 12px;">
					<strong>Note:</strong> These marks represent the subject-wise average score of the class, 
					calculated as: (Total Marks Obtained in the Subject ÷ Number of Students Appeared)
				</p>
			`;
			document.body.appendChild(printContent);
			
			// In a real implementation, you'd use a proper PDF library like jsPDF
			// For this demo, we'll use the browser's print to PDF functionality
			const pdfWindow = window.open('', '_blank');
			pdfWindow.document.write(`
				<html>
					<head>
						<title>${selectedSchool ? selectedSchool.name : 'School'} Performance Report</title>
						<style>
							body { font-family: Arial, sans-serif; padding: 20px; }
							table { width: 100%; border-collapse: collapse; margin-top: 20px; }
							th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
							th { background-color: #f2f2f2; }
						</style>
					</head>
					<body>
						${printContent.innerHTML}
						<script>
							// Auto-print and prompt save dialog
							window.onload = function() {
								window.print();
								// Wait for print dialog to close
								setTimeout(function() {
									window.close();
								}, 500);
							};
						</script>
					</body>
				</html>
			`);
			pdfWindow.document.close();
			
			// Remove the temporary element
			document.body.removeChild(printContent);
			toast.success("PDF report generated");
		}, 1000);
		
		handleDownloadClose();
	};

	// Download report as CSV
	const handleDownloadCSV = () => {
		toast.info("Generating CSV report...");
		
		// Format the data for CSV
		const headers = [
			"Name of Exam",
			"No. of Students",
			"Max Marks",
			"Hindi",
			"English",
			"Mathematics",
			"Science",
			"Social Science",
			"Health Care",
			"IT"
		];
		
		// Convert the report data to CSV format
		let csvContent = headers.join(",") + "\n";
		
		reportData.forEach(row => {
			const rowData = [
				row.name,
				row.noOfStudents,
				row.maxMarks,
				row.hindi,
				row.english,
				row.mathematics,
				row.science,
				row.socialScience,
				row.healthCare,
				row.it
			];
			
			// Handle commas in data by wrapping in quotes if needed
			csvContent += rowData.map(cell => {
				if (cell && cell.toString().includes(',')) {
					return `"${cell}"`;
				}
				return cell;
			}).join(",") + "\n";
		});
		
		// Create a Blob from the CSV data
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
		
		// Create a download link for the CSV file
		const link = document.createElement('a');
		const fileName = `${selectedSchool ? selectedSchool.name.replace(/\s+/g, '_') : 'School'}_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`;
		
		// Create the download URL
		if (window.navigator.msSaveOrOpenBlob) {
			// For IE
			window.navigator.msSaveBlob(blob, fileName);
		} else {
			// For other browsers
			const url = window.URL.createObjectURL(blob);
			link.href = url;
			link.setAttribute('download', fileName);
			document.body.appendChild(link);
			link.click();
			
			// Cleanup
			setTimeout(() => {
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
				toast.success("CSV report downloaded");
			}, 100);
		}
		
		handleDownloadClose();
	};

	// Table columns
	const columns = [
		{
			name: "name",
			label: "Name of Exam",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "noOfStudents",
			label: "No. of Students",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "maxMarks",
			label: "Max Marks",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "hindi",
			label: "Hindi",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
		{
			name: "english",
			label: "English",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
		{
			name: "mathematics",
			label: "Mathematics",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
		{
			name: "science",
			label: "Science",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
		{
			name: "socialScience",
			label: "Social Science",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
		{
			name: "healthCare",
			label: "Health Care",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
		{
			name: "it",
			label: "IT",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => {
					return <div style={{ color: getTextColor(value) }}>{value}</div>;
				},
			},
		},
	];

	// Table options
	const options = {
		filter: false,
		search: false,
		download: false,
		print: false,
		viewColumns: false,
		selectableRows: "none",
		pagination: false,
		responsive: "standard",
		rowsPerPage: pageSize,
		rowsPerPageOptions: [10],
		tableBodyHeight: "auto",
		tableBodyMaxHeight: "auto",
		customFooter: () => {
			return null; // Remove default footer
		},
	};

	// Classes available for selection
	const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper">
				<h5 className="text-lg font-bold text-[#2F4F4F] mb-4">School Performance Report</h5>

				{/* Search Bar and School Selection */}
				<div className="mb-6">
					<div className="relative">
						<TextField
							variant="outlined"
							placeholder="Search by school name or ID"
							size="small"
							value={searchQuery}
							onChange={handleSearchChange}
							onFocus={() => setShowDropdown(true)}
							InputProps={{
								style: {
									backgroundColor: "#fff",
									borderRadius: "8px",
									height: "48px",
									minWidth: "636px",
									width: "636px",
								},
								startAdornment: (
									<div className="pr-2">
										<Search size={20} className="text-gray-500" />
									</div>
								),
							}}
							sx={{
								marginBottom: { xs: "10px", md: "0" },
								"& .MuiOutlinedInput-root": {
									paddingLeft: "10px",
								},
							}}
						/>

						{/* Search dropdown with fixed width */}
						{showDropdown && searchQuery && (
							<div
								className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
								style={{ width: "636px" }}
							>
								{filteredSchools.map((school) => (
									<div
										key={school.id}
										className="p-2 hover:bg-gray-100 cursor-pointer"
										onClick={() => handleSchoolSelect(school)}
									>
										<span className="font-semibold">{school.id}</span> - {school.name}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{selectedSchool ? (
					<>
						{selectedSchool && (
							<div className="  mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
								{/* <h2 className="text-xl text-blue-600">{selectedSchool.id} - {selectedSchool.name}</h2> */}

								<div className="flex justify-between items-center w-full">
									<div className="flex items-center gap-4">
										<FormControl
											sx={{
												height: "48px",
												display: "flex",
												width: "150px",
											}}
										>
											<InputLabel id="class-select-label">Class</InputLabel>
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
												<MenuItem value="">All Classes</MenuItem>
												{classes.map((option) => (
													<MenuItem key={option} value={option}>
														{option}
													</MenuItem>
												))}
											</Select>
										</FormControl>

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

									<Button
										variant="contained"
										onClick={handleDownloadClick}
										sx={{
											backgroundColor: "#f3c22c",
											color: "#000",
											fontWeight: "medium",
											"&:hover": {
												backgroundColor: "#e0b424",
											},
											height: "40px",
										}}
									>
										Download Report
									</Button>
									
									{/* Download Options Menu */}
									<Menu
										anchorEl={downloadMenuAnchorEl}
										open={downloadMenuOpen}
										onClose={handleDownloadClose}
										anchorOrigin={{
											vertical: 'bottom',
											horizontal: 'right',
										}}
										transformOrigin={{
											vertical: 'top',
											horizontal: 'right',
										}}
									>
										<MenuItem onClick={handleDownloadPDF}>
											<ListItemIcon>
												<PictureAsPdfIcon fontSize="small" />
											</ListItemIcon>
											<ListItemText>Download as PDF</ListItemText>
										</MenuItem>
										<MenuItem onClick={handleDownloadCSV}>
											<ListItemIcon>
												<TableChartIcon fontSize="small" />
											</ListItemIcon>
											<ListItemText>Download as CSV</ListItemText>
										</MenuItem>
									</Menu>
								</div>
							</div>
						)}

						{/* Report Table */}
						{selectedSchool && (
							<>
								<div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
									<MUIDataTable data={reportData} columns={columns} options={options} />

									{/* Note */}
									<div className="p-4 bg-gray-50 text-sm text-gray-600">
										<span className="font-semibold">Note:</span> These marks represent the
										subject-wise average score of the class, calculated as: (Total Marks Obtained in
										the Subject ÷ Number of Students Appeared)
									</div>
								</div>

								{/* Pagination */}
								{totalRecords > pageSize && (
									<div style={{ width: "max-content", margin: "25px auto" }}>
										<Pagination
											count={Math.ceil(totalRecords / pageSize)}
											page={currentPage}
											onChange={(e, page) => setCurrentPage(page)}
											showFirstButton
											showLastButton
										/>
									</div>
								)}
							</>
						)}
					</>
				) : (
					// Show placeholder image when no school is selected (user first lands on page)
					<div className="flex flex-col items-center justify-center p-10">
						<img
							src={noSchoolImage}
							alt="Search for a school"
							className="w-40 h-40 mb-6"
						/>
						<h3 className="text-xl text-gray-600 mb-2">No School Selected</h3>
						<p className="text-gray-500">Please search and select a school to view performance reports</p>
					</div>
				)}

				{/* Loading Indicator */}
				{isLoading && <SpinnerPageOverlay isLoading={isLoading} />}

				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</div>
		</ThemeProvider>
	);
};

export default Reports;