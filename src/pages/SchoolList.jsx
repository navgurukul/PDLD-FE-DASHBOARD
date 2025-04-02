import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { Button, TextField, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip";
import ButtonCustom from "../components/ButtonCustom";
import GenericConfirmationModal from "../components/DeleteConfirmationModal";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import apiInstance from "../../api";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import { MenuItem } from "@mui/material";
import { useLocation } from "react-router-dom";

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

export default function SchoolList() {
	// Then in your component
	const location = useLocation();
	const [schools, setSchools] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		pageSize: 30,
		totalSchools: 0,
		totalPages: 1,
	});
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [schoolToDelete, setSchoolToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();

	// New state for filters
	const [selectedCluster, setSelectedCluster] = useState("");
	const [selectedBlock, setSelectedBlock] = useState("");
	const [clusters, setClusters] = useState([]);
	const [blocks, setBlocks] = useState([]);

	// Fetch schools from API
	const fetchSchools = async () => {
		setIsLoading(true);
		try {
			const response = await apiInstance.get(`/dev/school/all?page=${currentPage}`);
			if (response.data.success) {
				setSchools(response.data.data.schools);
				setPagination(response.data.data.pagination);
			} else {
				toast.error("Failed to fetch schools");
			}
		} catch (error) {
			console.error("Error fetching schools:", error);
			toast.error(error.response?.data?.message || "Error fetching schools");
		} finally {
			setIsLoading(false);
		}
	};

	// Load schools on component mount and when page changes
	useEffect(() => {
		fetchSchools();
	}, [currentPage]);

	// Add this in your SchoolList component, in the useEffect section
	useEffect(() => {
		// Check for success message in location state
		if (location.state?.successMessage) {
			toast.success(location.state.successMessage);

			// Clear the message from location state to prevent showing it again on refresh
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location]);

	// Extract unique clusters and blocks for filter dropdowns
	useEffect(() => {
		if (schools.length > 0) {
			// Extract unique clusters
			const uniqueClusters = [...new Set(schools.map((school) => school.clusterName))].filter(Boolean).sort();
			setClusters(uniqueClusters);

			// Extract unique blocks
			const uniqueBlocks = [...new Set(schools.map((school) => school.blockName))].filter(Boolean).sort();
			setBlocks(uniqueBlocks);
		}
	}, [schools]);

	const handleAddSchool = () => {
		navigate("/schools/add-school");
	};

	const handleBulkUpload = () => {
		navigate("/schools/bulk-upload");
	};

	// Handle copy to clipboard
	const handleCopy = (text, type) => {
		navigator.clipboard.writeText(text);
		toast.info(`${type} copied to clipboard`);
	};

	// Handle page change
	const handlePageChange = (event, page) => {
		setCurrentPage(page);
	};

	// Reset all filters
	const resetFilters = () => {
		setSelectedCluster("");
		setSelectedBlock("");
		setSearchQuery("");
		setCurrentPage(1);
	};

	// Function to capitalize only the first letter and make rest lowercase
	const capitalizeFirstLetter = (string) => {
		if (!string) return "";
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	};

	// Filter schools based on all criteria
	const filteredSchools = schools.filter((school) => {
		// Search query filter
		const matchesSearch =
			searchQuery === "" ||
			school.schoolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			school.udiseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			school.blockName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			school.clusterName?.toLowerCase().includes(searchQuery.toLowerCase());

		// Cluster filter
		const matchesCluster = selectedCluster === "" || school.clusterName === selectedCluster;

		// Block filter
		const matchesBlock = selectedBlock === "" || school.blockName === selectedBlock;

		return matchesSearch && matchesCluster && matchesBlock;
	});

	// Open delete confirmation modal
	const openDeleteModal = (school) => {
		setSchoolToDelete(school);
		setDeleteModalOpen(true);
	};

	// Close delete confirmation modal
	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
		setSchoolToDelete(null);
	};

	// Delete school handler
	const confirmDeleteSchool = async () => {
		if (!schoolToDelete) return;

		setIsDeleting(true);
		try {
			// Call the API to delete the school
			await apiInstance.delete(`/dev/school/delete/${schoolToDelete.id}`);

			// Remove the school from the local state
			const updatedSchools = schools.filter((school) => school.id !== schoolToDelete.id);
			setSchools(updatedSchools);

			// Show success message and update pagination if needed
			toast.success(`"${schoolToDelete.schoolName}" has been deleted successfully!`);

			if (updatedSchools.length === 0 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
			} else {
				// If we're on the last page and it's now empty, go back one page
				const totalPages = Math.ceil((pagination.totalSchools - 1) / pagination.pageSize);
				if (currentPage > totalPages && totalPages > 0) {
					setCurrentPage(totalPages);
				} else {
					// Otherwise, just refresh the current page
					fetchSchools();
				}
			}
		} catch (error) {
			console.error("Error deleting school:", error);
			toast.error(error.response?.data?.message || "Error deleting school");
		} finally {
			setIsDeleting(false);
			closeDeleteModal();
		}
	};

	// Generate username from schoolName and udiseCode
	const generateUsername = (schoolName) => {
		const schoolPrefix = schoolName
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "")
			.substring(0, 10);
		const randomNum = Math.floor(1000 + Math.random() * 9000);
		return `admin_${schoolPrefix}${randomNum}`;
	};

	const tableData = filteredSchools.map((school) => ({
		id: school.id,
		schoolName: capitalizeFirstLetter(school.schoolName),
		udiseCode: school.udiseCode,
		cluster: capitalizeFirstLetter(school.clusterName),
		block: capitalizeFirstLetter(school.blockName),
		username: generateUsername(school.schoolName), // Generate username from school name
		password: school.passwordHash, // Keep password as is
		actions: "Actions",
		schoolObj: school, // Pass the entire school object for the delete modal
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
			options: {
				filter: false,
				sort: true,
				setCellProps: () => ({
					style: {
						minWidth: "300px",
						maxWidth: "300px",
						overflow: "hidden",
					},
				}),
			},
		},
		{
			name: "udiseCode",
			label: "UDISE Code",
			options: { filter: false, sort: true },
		},
		{
			name: "block",
			label: "Block",
			options: { filter: false, sort: true },
		},
		{
			name: "cluster",
			label: "Cluster",
			options: { filter: false, sort: true },
		},
		{
			name: "password",
			label: "Password",
			options: {
				filter: false,
				sort: true,
				customBodyRender: (value, tableMeta) => {
					// Get the UDISE code from the same row
					const udiseCode = tableMeta.rowData[2]; // Index 2 is the udiseCode column

					return (
						<div
							style={{
								display: "flex",
								width: "120px",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<span>{value}</span>
							<Button
								variant="text"
								size="small"
								sx={{ minWidth: "30px", marginRight: "14px" }}
								onClick={() =>
									handleCopy(`UDISE: ${udiseCode}, Password: ${value}`, "UDISE and Password")
								}
							>
								<ContentCopyIcon style={{ fontSize: "18px", color: "#2F4F4F" }} />
							</Button>
						</div>
					);
				},
			},
		},
		{
			name: "schoolObj", // This is the hidden column that holds the full school object
			options: { display: false },
		},
		{
			name: "actions",
			label: "ACTIONS",
			options: {
				filter: false,
				sort: false,
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
				customBodyRender: (value, tableMeta) => {
					const schoolId = tableMeta.rowData[0];
					const schoolObj = tableMeta.rowData[6]; // Index of schoolObj in the rowData array

					return (
						<div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
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
									navigate(`/schools/update/${schoolId}`, {
										state: { schoolData: schoolObj }, // Pass the entire school object
									});
								}}
							>
								<img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
								&nbsp;
							</Button>
							<Button
								variant="text"
								size="small"
								sx={{
									color: "#d32f2f",
									"&:hover": { backgroundColor: "transparent" },
									padding: "2px",
									minWidth: "unset",
								}}
								onClick={() => openDeleteModal(schoolObj)}
							>
								<img src={trash} alt="Delete" style={{ width: "20px", height: "20px" }} />
								&nbsp;
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

	// Default view - List of schools
	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper px-3 sm:px-4" style={{ position: "relative" }}>
				<div className="header-container">
					<h5 className="text-lg font-bold text-[#2F4F4F]">School Management</h5>
				</div>

				<div className="school-list-container mt-1 bg-white rounded-lg">
					<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
						<div className="w-full lg:flex-1">
							<div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
								<div className="flex w-full flex-wrap gap-2">
									<TextField
										variant="outlined"
										placeholder="Search by School name, UDISE, Cluster, Block Name..."
										size="small"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										InputProps={{
											style: {
												backgroundColor: "#fff",
												borderRadius: "8px",
												height: "48px",
												minWidth: "150px",
												width: "385px",
											},
											startAdornment: <SearchIcon sx={{ mr: 1, color: "#757575" }} />,
										}}
										sx={{
											width: { xs: "100%", md: "385px" },
											marginBottom: { xs: "8px", md: "0" },
										}}
									/>

									{/* Cluster Dropdown */}
									<TextField
										select
										size="small"
										variant="outlined"
										label="Cluster"
										value={selectedCluster}
										onChange={(e) => setSelectedCluster(e.target.value)}
										sx={{
											width: { xs: "calc(50% - 4px)", md: "150px" },
											minWidth: "100px",
											"& .MuiSelect-select": {
												color: "#2F4F4F",
												fontWeight: "600",
												padding: "12px 16px",
											},
											"& .MuiOutlinedInput-root": {
												borderRadius: "8px",
												backgroundColor: "#fff",
											},
											marginBottom: { xs: "8px", md: "0" },
										}}
										SelectProps={{
											MenuProps: {
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
											},
										}}
									>
										<MenuItem value="">All Clusters</MenuItem>
										{clusters.map((cluster) => (
											<MenuItem key={cluster} value={cluster}>
												{capitalizeFirstLetter(cluster)}
											</MenuItem>
										))}
									</TextField>

									{/* Block Dropdown */}
									<TextField
										select
										size="small"
										variant="outlined"
										label="Block"
										value={selectedBlock}
										onChange={(e) => setSelectedBlock(e.target.value)}
										sx={{
											width: { xs: "calc(50% - 4px)", md: "150px" },
											minWidth: "100px",
											"& .MuiSelect-select": {
												color: "#2F4F4F",
												fontWeight: "600",
												padding: "12px 16px",
											},
											"& .MuiOutlinedInput-root": {
												borderRadius: "8px",
												backgroundColor: "#fff",
											},
											marginBottom: { xs: "8px", md: "0" },
										}}
										SelectProps={{
											MenuProps: {
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
											},
										}}
									>
										<MenuItem value="">All Blocks</MenuItem>
										{blocks.map((block) => (
											<MenuItem key={block} value={block}>
												{capitalizeFirstLetter(block)}
											</MenuItem>
										))}
									</TextField>

									{/* Reset Button */}
									<div className="flex justify-start w-full sm:w-auto mr-13">
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

									<ButtonCustom
										imageName={addSymbolBtn}
										text={"Add School"}
										onClick={handleAddSchool}
									/>
									<Button
										variant="outlined"
										sx={{
											borderColor: "#2F4F4F",
											color: "#2F4F4F",
											borderRadius: "8px",
											textTransform: "none",
											fontSize: "18px",
											"&:hover": {
												borderColor: "#1E3535",
												backgroundColor: "rgba(47, 79, 79, 0.1)",
											},
											width: { xs: "100%", sm: "auto" },
										}}
										onClick={handleBulkUpload}
									>
										<UploadFileIcon sx={{ mr: 1 }} />
										Bulk Upload
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Data Table */}
					<div
						style={{ borderRadius: "8px", position: "relative", minHeight: "300px" }}
						className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
					>
						<MUIDataTable data={tableData} columns={columns} options={options} />
					</div>

					<div
						style={{
							width: "max-content",
							margin: "25px auto",
						}}
					>
						<Pagination
							count={pagination.totalPages}
							page={currentPage}
							onChange={handlePageChange}
							showFirstButton
							showLastButton
						/>
					</div>
					<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />

					{/* Delete Confirmation Modal */}
					<GenericConfirmationModal
						open={deleteModalOpen}
						onClose={closeDeleteModal}
						onConfirm={confirmDeleteSchool}
						title="Delete School"
						message="Are you sure you want to delete this school: "
						entityName={schoolToDelete ? schoolToDelete.schoolName : ""}
						isProcessing={isDeleting}
						confirmText="Delete"
						cancelText="Cancel"
						confirmButtonColor="error"
						icon={<DeleteOutlineIcon fontSize="large" />}
					/>
				</div>

				{/* Overlay Loader */}
				{isLoading && <SpinnerPageOverlay isLoading={isLoading} />}
			</div>
		</ThemeProvider>
	);
}
