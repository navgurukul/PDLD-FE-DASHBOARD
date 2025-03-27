import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { Button, TextField, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import AddSchool from "../components/AddSchool"; // Make sure path is correct
import BulkUploadSchools from "../components/BulkUpload";

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

export default function Schools() {
	const [schools, setSchools] = useState([
		{
			id: 1,
			schoolName: "Government Higher Secondary School, Dantewada",
			udiseCode: "22150105601",
			cluster: "Dantewada",
			block: "Dantewada",
			username: "admin_governme8303",
			password: "r01nXewew^",
		},
		{
			id: 2,
			schoolName: "Government Middle School, Geedam",
			udiseCode: "22150205701",
			cluster: "Geedam",
			block: "Geedam",
			username: "admin_governme7295",
			password: "5e02hAXTq^",
		},
		{
			id: 3,
			schoolName: "Government Primary School, Kuakonda",
			udiseCode: "22150305402",
			cluster: "Kuakonda",
			block: "Kuakonda",
			username: "admin_governme6104",
			password: "4f18bMNRp^",
		},
		{
			id: 4,
			schoolName: "Government High School, Barsoor",
			udiseCode: "22150405103",
			cluster: "Barsoor",
			block: "Barsoor",
			username: "admin_governme5291",
			password: "9k32cLQTr^",
		},
		{
			id: 5,
			schoolName: "Government Primary School, Gidam",
			udiseCode: "22150505901",
			cluster: "Gidam",
			block: "Gidam",
			username: "admin_governme4387",
			password: "2j14dPVXs^",
		},
	]);
	const [searchQuery, setSearchQuery] = useState("");
	const [totalRecords, setTotalRecords] = useState(5);
	const [currentPage, setCurrentPage] = useState(1);
	const [currentView, setCurrentView] = useState("list"); // "list", "add", or "bulkUpload"
	const navigate = useNavigate();

	const pageSize = 10;

	useEffect(() => {
		// Simulating the total record count
		setTotalRecords(schools.length);
	}, [schools]);

	const handleAddSchool = () => {
		setCurrentView("add");
	};

	const handleBulkUpload = () => {
		setCurrentView("bulkUpload");
	};

	const handleBackToList = () => {
		setCurrentView("list");
	};

	const handleSaveSchool = (newSchool) => {
		// Generate random username and password
		const randomSuffix = Math.floor(1000 + Math.random() * 9000);
		const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < 10; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		const schoolToAdd = {
			id: schools.length + 1,
			schoolName: newSchool.schoolName,
			udiseCode: newSchool.udiseCode,
			cluster: newSchool.clusterName,
			block: newSchool.blockName,
			username: `admin_${newSchool.schoolName.toLowerCase().substring(0, 8)}${randomSuffix}`,
			password: password,
		};

		setSchools([...schools, schoolToAdd]);
		toast.success("School added successfully!");
		setCurrentView("list");
	};

	// Handle copy to clipboard
	const handleCopy = (text, type) => {
		navigator.clipboard.writeText(text);
		toast.info(`${type} copied to clipboard`);
	};

	// Filter schools based on search query
	const filteredSchools = schools.filter(
		(school) =>
			school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			school.udiseCode.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const tableData = filteredSchools.map((school) => ({
		id: school.id,
		schoolName: school.schoolName,
		udiseCode: school.udiseCode,
		cluster: school.cluster,
		block: school.block,
		username: school.username,
		password: school.password,
		actions: "Actions",
	}));

	// MUI DataTable columns
	const columns = [
		{
			name: "id",
			label: "ID",
			options: { display: false }, // Keep the ID hidden in the table
		},
		{
			name: "schoolName",
			label: "School Name",
			options: { filter: false, sort: true },
		},
		{
			name: "udiseCode",
			label: "UDISE Code",
			options: { filter: false, sort: true },
		},
		{
			name: "cluster",
			label: "Cluster",
			options: { filter: false, sort: true },
		},
		{
			name: "block",
			label: "Block",
			options: { filter: false, sort: true },
		},
		{
			name: "username",
			label: "Username",
			options: { filter: false, sort: true },
			customBodyRender: (value) => (
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<span>{value}</span>
					<Button
						variant="text"
						size="small"
						sx={{ minWidth: "30px", marginLeft: "5px" }}
						onClick={() => handleCopy(value, "Username")}
					>
						<ContentCopyIcon style={{ fontSize: "18px", color: "#1976d2" }} />
					</Button>
				</div>
			),
		},
		{
			name: "password",
			label: "Password",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value) => (
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<span>{value}</span>
						<Button
							variant="text"
							size="small"
							sx={{ minWidth: "30px", marginLeft: "5px" }}
							onClick={() => handleCopy(value, "Password")}
						>
							<ContentCopyIcon style={{ fontSize: "18px", color: "#1976d2" }} />
						</Button>
					</div>
				),
			},
		},
		{
			name: "actions",
			label: "Actions",
			options: {
				filter: false,
				sort: false,
				customHeadRender: (columnMeta) => {
					return (
						<th key={`th-${columnMeta.index}`} style={{ textAlign: "center" }} scope="col">
							<div style={{ textAlign: "center" }}>{columnMeta.label}</div>
						</th>
					);
				},
				customBodyRender: (value, tableMeta) => {
					const schoolId = tableMeta.rowData[0];
					return (
						<div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
							<Button
								variant="text"
								size="small"
								sx={{
									color: "#1976d2",
									"&:hover": { backgroundColor: "transparent" },
									padding: "2px",
									minWidth: "unset",
								}}
								onClick={() => {
									console.log("Edit School ID:", schoolId);
									navigate(`/edit-school/${schoolId}`);
								}}
							>
								EDIT
							</Button>
							<Button
								variant="text"
								size="small"
								sx={{
									color: "#9c27b0",
									"&:hover": { backgroundColor: "transparent" },
									padding: "2px",
									minWidth: "unset",
								}}
								onClick={() => {
									console.log("Delete School ID:", schoolId);
									// Add delete logic here
									const updatedSchools = schools.filter((school) => school.id !== schoolId);
									setSchools(updatedSchools);
									toast.success("School deleted successfully!");
								}}
							>
								DELETE
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
		responsive: "standard",
		selectableRows: "none",
		download: false,
		print: false,
		viewColumns: false,
		pagination: false,
	};

	// Render different views based on currentView state
	if (currentView === "add") {
		return (
			<ThemeProvider theme={theme}>
				<AddSchool onClose={handleBackToList} onSave={handleSaveSchool} />
				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</ThemeProvider>
		);
	}

	if (currentView === "bulkUpload") {
		return (
			<ThemeProvider theme={theme}>
				<BulkUploadSchools onBack={handleBackToList} />
				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</ThemeProvider>
		);
	}

	// Default view - List of schools
	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper">
				<div className="header-container">
					<div>
						<h5 className="text-lg font-bold text-[#2F4F4F]">School Management</h5>
						<p className="text-sm text-gray-600">Create and manage schools in the Dantewada district</p>
					</div>
				</div>

				<div className="school-list-container mt-8 bg-white p-6 rounded-lg shadow-sm">
					<div className="flex justify-between items-center mb-4">
						<div>
							<h2 className="text-xl font-bold text-[#2F4F4F]">School List</h2>
							<p className="text-sm text-gray-600">View and manage all schools in the system</p>
						</div>
						<div className="flex gap-3">
							<Button
								variant="contained"
								sx={{
									backgroundColor: "#FFD700", // Changed to yellow color
									color: "#2F4F4F", // Changed text to black for better contrast
									borderRadius: "8px",
									"&:hover": {
										backgroundColor: "#E6C200", // Darker yellow on hover
									},
								}}
								onClick={handleAddSchool}
							>
								<AddIcon sx={{ mr: 1 }} />
								Add School
							</Button>
							<Button
								variant="outlined"
								sx={{
									borderColor: "#2F4F4F",
									color: "#2F4F4F",
									borderRadius: "8px",
									"&:hover": {
										borderColor: "#1E3535",
										backgroundColor: "rgba(47, 79, 79, 0.1)",
									},
								}}
								onClick={handleBulkUpload}
							>
								<UploadFileIcon sx={{ mr: 1 }} />
								Bulk Upload
							</Button>
						</div>
					</div>

					{/* Search Bar */}
					<TextField
						variant="outlined"
						placeholder="Search schools..."
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
							startAdornment: <SearchIcon sx={{ mr: 1, color: "#757575" }} />,
						}}
						sx={{ marginBottom: "20px" }}
					/>

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
											paddingLeft: "16px",
											paddingRight: "16px",
										},
									}),
								},
							}))}
							options={options}
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
					<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
				</div>
			</div>
		</ThemeProvider>
	);
}
