import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon } from "../utils/imagePath";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiInstance from "../../api";
import ButtonCustom from "../components/ButtonCustom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; // Make sure to import this

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
	const location = useLocation();
	const navigate = useNavigate();
	const pageSize = 20;

	useEffect(() => {
		if (location.state?.successMessage) {
			toast.success(location.state.successMessage);
			navigate(location.pathname, { replace: true });
		}
	}, [location, navigate]);

	const handleCreateUser = () => {
		navigate("/users/userCreationForm");
	};

	// Function to format role names for better display
	const formatRoleName = (role) => {
		if (!role) return '';
		
		const roleMap = {
			'DISTRICT_OFFICER': 'District Officer',
			'BLOCK_OFFICER': 'Block Officer',
			'CLUSTER_PRINCIPAL': 'Cluster Principal',
			'CLUSTER_ACADEMIC_COORDINATOR': 'Cluster Academic Coordinator'
		};
		
		return roleMap[role] || role.replace(/_/g, ' ');
	};

	const fetchData = async () => {
		try {
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
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentPage]);

	// Handle delete user
	const handleDeleteUser = (userId) => {
		// Confirm before deleting
		if (window.confirm("Are you sure you want to delete this user?")) {
			// Add your delete API call here
			// apiInstance.delete(`/dev/user/${userId}`)
			// .then(() => {
			//   fetchData(); // Refresh the list
			//   toast.success("User deleted successfully");
			// })
			// .catch(error => {
			//   console.error("Error deleting user:", error);
			//   toast.error("Failed to delete user");
			// });
			
			// For now, just show a toast
			toast.info("Delete functionality will be implemented here");
		}
	};

	const tableData = users.map((user) => ({
		id: user.userId || user.id,
		name: user.name || 'N/A',
		username: user.username || 'N/A',
		role: formatRoleName(user.role) || 'N/A',
		dateJoined: new Date(user.createdAt).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		schoolsMapped: (user.managedSchoolIds?.length || user.assignedSchools?.length || "0") + " Schools",
		password: user.password || 'default123',
		status: user.isActive ? 'Active' : 'Inactive',
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
							borderBottom: "1px solid lightgray",
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
								onClick={() => navigate(`/edit/user/${userId}`)}
							>
								<img src={EditPencilIcon} alt="Edit" className="w-5 h-5" />
							</button>
							<button
								className="p-1 hover:bg-gray-100 rounded text-red-500"
								onClick={() => handleDeleteUser(userId)}
							>
								<DeleteOutlineIcon style={{ width: "20px", height: "20px" }} />
							</button>
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
				<div className="flex justify-between items-center mb-6">
					<h5 className="text-lg font-bold text-[#2F4F4F]">All Users</h5>
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
		</ThemeProvider>
	);
}