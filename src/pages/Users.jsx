import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiInstance from "../../api";
import ButtonCustom from "../components/ButtonCustom";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import GenericConfirmationModal from "../components/DeleteConfirmationModal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

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

export default function Users() {
	const [users, setUsers] = useState([]);
	const [totalRecords, setTotalRecords] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [availableRoles, setAvailableRoles] = useState([]);
	const [selectedRole, setSelectedRole] = useState("");
	const [availableBlocks, setAvailableBlocks] = useState([]);
	const [selectedBlock, setSelectedBlock] = useState("");
	const location = useLocation();
	const navigate = useNavigate();
	const pageSize = 15;

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (location.state?.successMessage) {
			toast.success(location.state.successMessage);
			navigate(location.pathname, { replace: true });
		}
	}, [location, navigate]);

	// Helper function to capitalize first letter and make the rest lowercase
	const capitalizeFirstLetter = (string) => {
		if (!string) return "";
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	};

	// Extract unique roles from users
	useEffect(() => {
		if (users.length > 0) {
			const roles = [...new Set(users.map((user) => user.role))].filter(Boolean);
			setAvailableRoles(roles);

			// Extract unique blocks from users
			const blocks = new Set();
			users.forEach((user) => {
				// Check both assignedBlock and assignedBlocks
				const blocksList = user.assignedBlocks || user.assignedBlock;
				if (blocksList && Array.isArray(blocksList)) {
					blocksList.forEach((block) => {
						if (block) blocks.add(capitalizeFirstLetter(block));
					});
				}
			});
			setAvailableBlocks([...blocks].sort());
		}
	}, [users]);

	// Filter users based on search query, selected role and selected block
	useEffect(() => {
		let filtered = users;

		// Apply search filter
		if (searchQuery.trim()) {
			const lowercaseQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(user) =>
					user.name?.toLowerCase().includes(lowercaseQuery) ||
					formatRoleName(user.role)?.toLowerCase().includes(lowercaseQuery)
			);
		}

		// Apply role filter
		if (selectedRole) {
			filtered = filtered.filter((user) => user.role === selectedRole);
		}

		// Apply block filter
		if (selectedBlock) {
			filtered = filtered.filter(
				(user) =>
					user.role === "DISTRICT_OFFICER" ||
					user.role === "district_officer" ||
					((user.assignedBlocks || user.assignedBlock) &&
						Array.isArray(user.assignedBlocks || user.assignedBlock) &&
						(user.assignedBlocks || user.assignedBlock).some(
							(block) => block?.toLowerCase() === selectedBlock.toLowerCase()
						))
			);
		}

		setFilteredUsers(filtered);
	}, [searchQuery, selectedRole, selectedBlock, users]);

	const handleCreateUser = () => {
		navigate("/users/userCreationForm");
	};

	// Function to format role names for better display
	const formatRoleName = (role) => {
		if (!role) return "";

		const roleMap = {
			DISTRICT_OFFICER: "District Officer",
			BLOCK_OFFICER: "Block Officer",
			CLUSTER_PRINCIPAL: "Cluster Principal",
			CLUSTER_ACADEMIC_COORDINATOR: "Cluster Academic Coordinator",
			CAC: "Cluster Academic Coordinator",
		};

		return roleMap[role] || role.replace(/_/g, " ");
	};

	// Function to get short form of role names for dropdown
	const getRoleShortForm = (role) => {
		if (!role) return "";

		const roleShortFormMap = {
			DISTRICT_OFFICER: "District Officer",
			BLOCK_OFFICER: "Block Officer",
			CLUSTER_PRINCIPAL: "Cluster Principal",
			CLUSTER_ACADEMIC_COORDINATOR: "CAC",
		};

		return roleShortFormMap[role] || role.replace(/_/g, " ");
	};

	const fetchData = async () => {
		try {
			setIsLoading(true); // Show loader when fetching data
			const response = await apiInstance.get(`/users?page=${currentPage}&pageSize=${pageSize}`);

			if (response.data?.success && response.data?.data) {
				// Extract users array from response
				const usersData = response.data.data.users || [];
				setUsers(usersData);

				// Extract pagination info
				const paginationData = response.data.data.pagination || {};
				setTotalRecords(paginationData.totalUsers || usersData.length);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentPage]);

	// Open delete confirmation modal
	const openDeleteModal = (user) => {
		setUserToDelete(user);
		setDeleteModalOpen(true);
	};

	// Close delete confirmation modal
	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
		setUserToDelete(null);
	};

	// Delete user handler
	const confirmDeleteUser = async () => {
		if (!userToDelete) return;

		setIsDeleting(true);
		try {
			// Call the API to delete the user 
			await apiInstance.delete(`/user/delete/${userToDelete.userId || userToDelete.id}`);

			// Remove the user from the local state
			const updatedUsers = users.filter(
				(user) => (user.userId || user.id) !== (userToDelete.userId || userToDelete.id)
			);
			setUsers(updatedUsers);

			// Show success message and update pagination if needed
			toast.success(`"${userToDelete.name}" has been deleted successfully!`);

			if (updatedUsers.length === 0 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
			} else {
				// If we're on the last page and it's now empty, go back one page
				const totalPages = Math.ceil((totalRecords - 1) / pageSize);
				if (currentPage > totalPages && totalPages > 0) {
					setCurrentPage(totalPages);
				} else {
					// Otherwise, just refresh the current page
					fetchData();
				}
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error(error.response?.data?.message || "Error deleting user");
		} finally {
			setIsDeleting(false);
			closeDeleteModal();
		}
	};

	// Function to handle copying username and password
	const handleCopyCredentials = (user) => {
		const text = `Username: ${user.username}\nPassword: ${user.password}`;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast.success("Username and password copied to clipboard");
			})
			.catch((error) => {
				console.error("Failed to copy: ", error);
				toast.error("Failed to copy to clipboard");
			});
	};

	const getSchoolCount = (user) => {
		// First check if schoolsMapped is directly provided
		if (typeof user.schoolsMapped === "number") {
			return user.schoolsMapped;
		}

		// Otherwise check various arrays that might contain school info
		const managedCount = user.managedSchoolIds?.length || 0;
		const assignedCount = user.assignedSchools?.length || 0;

		return managedCount + assignedCount;
	};

	const resetFilters = () => {
		setSelectedRole("");
		setSelectedBlock("");
		setSearchQuery("");
		setCurrentPage(1);
	};

	const tableData = filteredUsers.map((user) => ({
		id: user.userId || user.id,
		name: user.name || "N/A",
		username: user.username || "N/A",
		role: getRoleShortForm(user.role) || "N/A", // Use short form for role
		dateJoined: new Date(user.createdAt).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		schoolsMapped: `${
			user.role === "DISTRICT_OFFICER" || user.role === "district_officer" ? "All" : getSchoolCount(user)
		} Schools`,
		password: user.password || "default123",
		status: user.isActive ? "Active" : "Inactive",
		blockName: `${
			user.role === "DISTRICT_OFFICER" || user.role === "district_officer"
				? "All Blocks"
				: (user.assignedBlocks || user.assignedBlock)?.map((b) => capitalizeFirstLetter(b)).join(", ") || "N/A"
		}`,
		assignedCluster: `${
			user.role === "DISTRICT_OFFICER" || user.role === "district_officer"
				? "All Clusters"
				: user.assignedClusters?.map((c) => capitalizeFirstLetter(c)).join(", ") || "N/A"
		}`,
		actions: "Manage User",
		userObj: user, // Pass the entire user object for the delete modal
	}));

	// Add new columns for Block Name and Assigned Cluster
	const columns = [
		{
			name: "id",
			label: "ID",
			options: { display: false },
		},
		{
			name: "name",
			label: "NAME",
			options: { sort: true },
		},

		{
			name: "role",
			label: "ROLE",
			options: { sort: true },
		},

		{
			name: "blockName", // New column for Block Name
			label: "BLOCK",
			options: { sort: true },
		},
		{
			name: "assignedCluster", // New column for Assigned Cluster
			label: "CLUSTER",
			options: { sort: true },
		},
		{
			name: "schoolsMapped",
			label: "SCHOOLS MAPPED",
			options: { sort: true },
		},
		{
			name: "username",
			label: "USERNAME",
			options: {
				sort: true,
				customBodyRender: (value, tableMeta) => {
					const userIndex = tableMeta.rowIndex;
					const user = filteredUsers[userIndex];

					return (
						<div className="flex items-center gap-2">
							<span>{value}</span>
							<Tooltip title="Copy username and password" arrow>
								<IconButton
									size="small"
									onClick={() => handleCopyCredentials(user)}
									sx={{ color: "#2F4F4F", padding: "2px" }}
								>
									<ContentCopyIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</div>
					);
				},
			},
		},
		{
			name: "password",
			label: "PASSWORD",
			options: {
				display: false, // Hide the password column
			},
		},
		{
			name: "dateJoined",
			label: "JOINED ON",
			options: { sort: true },
		},
		{
			name: "userObj", // Hidden column to store user object
			options: { display: false },
		},
		{
			name: "actions",
			label: "ACTIONS",
			options: {
				customHeadRender: (columnMeta) => (
					<th
						style={{
							textAlign: "center",
							borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
						}}
						scope="col"
					>
						<div style={{ textAlign: "center", fontSize: "14px" }}>{columnMeta.label}</div>
					</th>
				),
				customBodyRender: (value, tableMeta) => {
					const userId = tableMeta.rowData[0];
					const userIndex = tableMeta.rowIndex;
					const user = filteredUsers[userIndex];

					return (
						<div className="flex gap-2 justify-center">
							<button
								className="p-1 hover:bg-gray-100 rounded"
								onClick={() => navigate(`/users/update-user/${userId}`, { state: { userData: user } })}
							>
								<img src={EditPencilIcon} alt="Edit" className="w-5 h-5" />
							</button>
							<Button
								variant="text"
								size="small"
								sx={{
									color: "#d32f2f",
									"&:hover": { backgroundColor: "transparent" },
									padding: "2px",
									minWidth: "unset",
								}}
								onClick={() => openDeleteModal(user)}
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

	const options = {
		filter: false,
		search: false,
		responsive: "standard",
		selectableRows: "none",
		download: false,
		print: false,
		viewColumns: false,
		rowsPerPage: 10,
		pagination: false,
	};

	const handleRoleChange = (e) => {
		setSelectedRole(e.target.value);
	};

	const handleBlockChange = (e) => {
		setSelectedBlock(e.target.value);
	};

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper bg-white rounded-lg shadow-sm">
				<div className="flex justify-between items-center mb-1">
					<h5 className="text-lg font-bold text-[#2F4F4F]">All Users</h5>
				</div>
				<div className="flex justify-between mb-2">
					<div className="flex flex-wrap gap-2">
						<TextField
							variant="outlined"
							placeholder="Search by Name or Role..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								style: {
									backgroundColor: "#fff",
									borderRadius: "8px",
									width: "380px",
									height: "48px",
								},
							}}
							sx={{ marginBottom: "10px" }}
						/>

						{/* Role Dropdown with Shortform */}
						<FormControl
							sx={{
								height: "48px",
								display: "flex",
								width: "150px", // Reduced width for more compact layout
								minWidth: "120px",
							}}
						>
							<InputLabel
								id="role-select-label"
								sx={{
									transform: "translate(14px, 14px) scale(1)",
									"&.Mui-focused, &.MuiFormLabel-filled": {
										transform: "translate(14px, -9px) scale(0.75)",
									},
								}}
							>
								Role
							</InputLabel>
							<Select
								labelId="role-select-label"
								id="role-select"
								value={selectedRole}
								label="Role"
								onChange={handleRoleChange}
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
								<MenuItem value="">All Roles</MenuItem>
								{availableRoles.map((role) => (
									<MenuItem key={role} value={role}>
										{getRoleShortForm(role)}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Block Filter Dropdown */}
						<FormControl
							sx={{
								height: "48px",
								display: "flex",
								width: "150px",
								minWidth: "120px",
							}}
						>
							<InputLabel
								id="block-select-label"
								sx={{
									transform: "translate(14px, 14px) scale(1)",
									"&.Mui-focused, &.MuiFormLabel-filled": {
										transform: "translate(14px, -9px) scale(0.75)",
									},
								}}
							>
								Block
							</InputLabel>
							<Select
								labelId="block-select-label"
								id="block-select"
								value={selectedBlock}
								label="Block"
								onChange={handleBlockChange}
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
								<MenuItem value="">All Blocks</MenuItem>
								{availableBlocks.map((block) => (
									<MenuItem key={block} value={block}>
										{block}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Reset Filters Button */}
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
					<ButtonCustom imageName={addSymbolBtn} text="Create User" onClick={handleCreateUser} />
				</div>

				<div className="rounded-lg overflow-hidden border border-gray-200">
					<MUIDataTable data={tableData} columns={columns} options={options} />
				</div>

				<div className="flex justify-center mt-6">
					<Pagination
						count={Math.ceil(totalRecords / pageSize)}
						page={currentPage}
						onChange={(e, page) => setCurrentPage(page)}
						showFirstButton
						showLastButton
						className="[&_.Mui-selected]:bg-[#2F4F4F] [&_.Mui-selected]:text-white"
					/>
				</div>

				{/* Delete Confirmation Modal */}
				<GenericConfirmationModal
					open={deleteModalOpen}
					onClose={closeDeleteModal}
					onConfirm={confirmDeleteUser}
					title="Delete User"
					message="Are you sure you want to delete this user:"
					entityName={userToDelete ? userToDelete.name : ""}
					isProcessing={isDeleting}
					confirmText="Delete"
					cancelText="Cancel"
					confirmButtonColor="error"
					icon={<DeleteOutlineIcon fontSize="large" />}
				/>

				<ToastContainer position="top-right" autoClose={3000} />
			</div>
			{isLoading && <SpinnerPageOverlay />}
		</ThemeProvider>
	);
}
