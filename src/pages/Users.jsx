import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import { Button, TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiInstance from "../../api";
import ButtonCustom from "../components/ButtonCustom";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";

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
	const location = useLocation();
	const navigate = useNavigate();
	const pageSize = 20;

	useEffect(() => {
		if (location.state?.successMessage) {
			toast.success(location.state.successMessage);
			navigate(location.pathname, { replace: true });
		}
	}, [location, navigate]);

	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredUsers(users);
			return;
		}

		const lowercaseQuery = searchQuery.toLowerCase();
		const filtered = users.filter(
			(user) =>
				user.name?.toLowerCase().includes(lowercaseQuery) ||
				formatRoleName(user.role)?.toLowerCase().includes(lowercaseQuery)
		);

		setFilteredUsers(filtered);
	}, [searchQuery, users]);

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
		};

		return roleMap[role] || role.replace(/_/g, " ");
	};

	const fetchData = async () => {
		try {
			setIsLoading(true); // Show loader when fetching data
			const response = await apiInstance.get(`/dev/users?page=${currentPage}&pageSize=${pageSize}`);

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

	const tableData = filteredUsers.map((user) => ({
		id: user.userId || user.id,
		name: user.name || "N/A",
		username: user.username || "N/A",
		role: formatRoleName(user.role) || "N/A",
		dateJoined: new Date(user.createdAt).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		schoolsMapped: (user.managedSchoolIds?.length || user.assignedSchools?.length || "0") + " Schools",
		password: user.password || "default123",
		status: user.isActive ? "Active" : "Inactive",
		actions: "Manage User",
	}));

	const columns = [
		{
			name: "id",
			label: "ID",
			options: { display: false },
		},
		{
			name: "name",
			label: "Name",
			options: { sort: true },
		},
		{
			name: "username",
			label: "Username",
			options: { sort: true },
		},
		{
			name: "role",
			label: "Role",
			options: { sort: true },
		},
		{
			name: "dateJoined",
			label: "Date Joined",
			options: { sort: true },
		},
		{
			name: "schoolsMapped",
			label: "Schools Mapped",
			options: { sort: true },
		},
		{
			name: "password",
			label: "Password",
			options: { sort: true },
		},
		{
			name: "status",
			label: "Status",
			options: {
				customBodyRender: (value) => (
					<span
						className={`px-2 py-1 rounded-full ${
							value === "Active"
								? "bg-green-100 text-green-800"
								: value === "Inactive"
								? "bg-red-100 text-red-800"
								: "bg-yellow-100 text-yellow-800"
						}`}
					>
						{value}
					</span>
				),
			},
		},
		{
			name: "actions",
			label: "ACTIONS",
			options: {
				customHeadRender: (columnMeta) => (
					<th
						style={{
							textAlign: "center",
							borderBottom: "2px solid lightgray",
						}}
						scope="col"
					>
						<div style={{ textAlign: "center", fontSize: "14px" }}>{columnMeta.label}</div>
					</th>
				),
				customBodyRender: (value, tableMeta) => {
					const userId = tableMeta.rowData[0];
					return (
						<div className="flex gap-2 justify-center">
							<button
								className="p-1 hover:bg-gray-100 rounded"
								// onClick={() => navigate(`/edit/user/${userId}`)}
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
								// onClick={() => openDeleteModal(schoolObj)}
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

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper bg-white rounded-lg shadow-sm">
				<div className="flex justify-between items-center mb-1">
					<h5 className="text-lg font-bold text-[#2F4F4F]">All Users</h5>
				</div>
				<div className="flex justify-between mb-2">
					<TextField
						variant="outlined"
						placeholder="Search by Name or Role..."
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

				<ToastContainer position="top-right" autoClose={3000} />
			</div>
			{isLoading && <SpinnerPageOverlay />}
		</ThemeProvider>
	);
}
