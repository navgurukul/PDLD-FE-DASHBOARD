import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, DocScanner } from "../utils/imagePath";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import apiInstance from "../../api";
import ButtonCustom from "../components/ButtonCustom";

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

const USER_STATUS_LABELS = {
	active: "Active",
	inactive: "Inactive",
	pending: "Pending",
};

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

	const fetchData = async () => {
		try {
			const response = await apiInstance.get(`/dev/users/filter?page=${currentPage}&pageSize=${pageSize}`);
			if (response.data?.data) {
				setUsers(response.data.data.data);
				setTotalRecords(response.data.data.pagination.totalRecords);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentPage]);

	const tableData = users?.map((user) => ({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		dateJoined: new Date(user.createdAt).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		status: user.status,
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
			name: "email",
			label: "Email",
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
			name: "status",
			label: "Status",
			options: {
				customBodyRender: (value) => (
					<span
						className={`px-2 py-1 rounded-full ${
							value === "active"
								? "bg-green-100 text-green-800"
								: value === "inactive"
								? "bg-red-100 text-red-800"
								: "bg-yellow-100 text-yellow-800"
						}`}
					>
						{USER_STATUS_LABELS[value] || value}
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
						<div className="flex gap-2">
							<button
								className="p-1 hover:bg-gray-100 rounded"
								onClick={() => navigate(`/edit/user/${userId}`)}
							>
								<img src={EditPencilIcon} alt="Edit" className="w-5 h-5" />
							</button>
							<button
								className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
								onClick={() => navigate(`/user/${userId}/details`)}
							>
								<img src={DocScanner} alt="Details" className="w-5 h-5" />
								View Details
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
