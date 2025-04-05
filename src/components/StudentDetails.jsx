import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Typography,
	Box,
	FormControl,
	Select,
	MenuItem,
	TextField,
	CircularProgress,
	Button, 
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import SearchIcon from "@mui/icons-material/Search"; 
import { toast, ToastContainer } from "react-toastify";
import ButtonCustom from "../components/ButtonCustom";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";

const StudentDetails = ({ schoolId, schoolName }) => {
	const navigate = useNavigate();
	const [selectedClass, setSelectedClass] = useState("2");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoadingStudents, setIsLoadingStudents] = useState(false);
	const [students, setStudents] = useState([]);

	// Handle class change
	const handleClassChange = (event) => {
		setSelectedClass(event.target.value);
		fetchStudents(event.target.value);
	};

	// Handle search query change
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// Generate dummy student data based on class
	const generateDummyStudents = (classValue) => {
		const studentCount = 10;
		const genders = ["Male", "Female"];
		const firstNames = [
			"John",
			"Jane",
			"David",
			"Sarah",
			"Michael",
			"Emily",
			"Robert",
			"Olivia",
			"William",
			"Sophia",
			"James",
			"Emma",
			"Daniel",
			"Ava",
			"Matthew",
			"Mia",
			"Joseph",
			"Charlotte",
			"Andrew",
			"Amelia",
		];
		const lastNames = [
			"Smith",
			"Johnson",
			"Williams",
			"Jones",
			"Brown",
			"Davis",
			"Miller",
			"Wilson",
			"Moore",
			"Taylor",
			"Anderson",
			"Thomas",
			"Jackson",
			"White",
			"Harris",
			"Martin",
			"Thompson",
			"Garcia",
			"Martinez",
			"Robinson",
		];

		const dummyStudents = [];

		for (let i = 0; i < studentCount; i++) {
			const gender = genders[Math.floor(Math.random() * genders.length)];
			const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
			const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

			dummyStudents.push({
				id: i + 1,
				rollNumber: `${classValue}${String(i + 1).padStart(3, "0")}`,
				name: `${firstName} ${lastName}`,
				gender: gender,
				class: classValue,
				dob: `${2010 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(
					2,
					"0"
				)}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
				fatherName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
				motherName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
				address: `${Math.floor(Math.random() * 999) + 1} Main St, City`,
			});
		}

		return dummyStudents;
	};

	// Simulate fetching students for this school (without API)
	const fetchStudents = async (classValue = selectedClass) => {
		setIsLoadingStudents(true);

		// Simulate API delay
		setTimeout(() => {
			// Generate dummy data for the selected class
			const dummyStudents = generateDummyStudents(classValue);
			setStudents(dummyStudents);
			setIsLoadingStudents(false);
		}, 1000);
	};

	useEffect(() => {
		// Load students when component mounts
		fetchStudents();
	}, [schoolId]);

	// Function to handle editing a student
	const handleEditStudent = (studentId) => {
		navigate(`/students/edit/${studentId}`, {
			state: {
				schoolId: schoolId,
				studentId: studentId,
			},
		});
	};

	// Function to handle deleting a student
	const handleDeleteStudent = (studentId, studentName) => {
		// In a real implementation, this would show a confirmation modal
		// and then make an API call to delete the student
		if (window.confirm(`Are you sure you want to delete ${studentName}?`)) {
			// Simulate API call success
			toast.success(`Student ${studentName} has been deleted successfully!`);
			// Remove student from the list
			setStudents(students.filter((student) => student.id !== studentId));
		}
	};

	// Filter students based on search query
	const filteredStudents = students.filter(
		(student) =>
			student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Prepare data for MUIDataTable
	const tableData = filteredStudents.map((student) => [
		student.rollNumber,
		student.name,
		student.gender,
		`Class ${student.class}`,
		student.dob,
		student.fatherName,
		student.motherName,
		student.id, // Hidden column for ID reference
	]);

	// Define columns for MUIDataTable
	const columns = [
		{
			name: "Roll Number",
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: "Name",
			options: {
				filter: false,
				sort: true,
				setCellProps: () => ({
					style: {
						minWidth: "150px",
					},
				}),
			},
		},
		{
			name: "Gender",
			options: {
				filter: true,
				sort: true,
			},
		},
		{
			name: "Class",
			options: {
				filter: true,
				sort: true,
			},
		},
		{
			name: "Date of Birth",
			options: {
				filter: false,
				sort: true,
				setCellProps: () => ({
					style: {
						minWidth: "120px",
					},
				}),
			},
		},
		{
			name: "Father's Name",
			options: {
				filter: false,
				sort: true,
				setCellProps: () => ({
					style: {
						minWidth: "150px",
					},
				}),
			},
		},
		{
			name: "Mother's Name",
			options: {
				filter: false,
				sort: true,
				setCellProps: () => ({
					style: {
						minWidth: "150px",
					},
				}),
			},
		},
		{
			name: "ID",
			options: {
				display: false,
				filter: false,
			},
		},
		{
			name: "Actions",
			options: {
				filter: false,
				sort: false,
				empty: true,
				customBodyRenderLite: (dataIndex) => {
					const student = filteredStudents[dataIndex];
					return (
						<div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
							<Button
								variant="text"
								size="small"
								sx={{
									color: "#1976d2",
									"&:hover": { backgroundColor: "transparent" },
									padding: "2px",
									minWidth: "unset",
								}}
								onClick={() => handleEditStudent(student.id)}
							>
								<img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
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
								onClick={() => handleDeleteStudent(student.id, student.name)}
							>
								<img src={trash} alt="Delete" style={{ width: "20px", height: "20px" }} />
							</Button>
						</div>
					);
				},
			},
		},
	];

	// MUIDataTable options
	const options = {
		filter: false,
		search: false,
		download: false,
		print: false,
		viewColumns: false,
		pagination: false,
		selectableRows: "none",
		responsive: "standard",
		textLabels: {
			body: {
				noMatch: "No students found",
			},
		},
	};

	return (
		<Box>
			<div className="flex justify-between items-center mb-2">
				<Typography variant="h6" className="text-xl font-bold">
					Students List
				</Typography>
			</div>

			<div className="flex justify-between sm:flex-row mb-2">
				<div className="flex gap-2">
					{/* Search Field */}
					<TextField
						placeholder="Search students..."
						fullWidth
						variant="outlined"
						value={searchQuery}
						onChange={handleSearchChange}
						InputProps={{
							startAdornment: (
								<Box sx={{ mr: 1, color: "grey.500" }}>
									<SearchIcon />
								</Box>
							),
							sx: {
								borderRadius: "8px",
								height: "48px",
								backgroundColor: "#fff",
								minWidth: "250px",
								width: "360px",
							},
						}}
					/>

					{/* Class Dropdown */}
					<FormControl
						sx={{
							minWidth: 240,
							"& .MuiOutlinedInput-root": {
								borderRadius: "8px",
								height: "48px",
							},
						}}
					>
						<Select
							value={selectedClass}
							onChange={handleClassChange}
							displayEmpty
							renderValue={(value) => `Class ${value}`}
						>
							<MenuItem value="1">Class 1</MenuItem>
							<MenuItem value="2">Class 2</MenuItem>
							<MenuItem value="3">Class 3</MenuItem>
							<MenuItem value="4">Class 4</MenuItem>
							<MenuItem value="5">Class 5</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div>
					<ButtonCustom
						imageName={addSymbolBtn}
						text={"Add Student"}
						// onClick={() => navigate(`/students/add?schoolId=${schoolId}`)}
						onClick={() => navigate(`/schools/schoolDetail/addStudents`)}
					/>
				</div>
			</div>

			{isLoadingStudents ? (
				<Box sx={{ display: "flex", justifyContent: "center" }}>
					<CircularProgress sx={{ color: "#2F4F4F" }} />
				</Box>
			) : (
				<div
					style={{
						borderRadius: "8px",
						position: "relative",
						minHeight: "300px",
						marginTop: "16px",
					}}
					className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
				>
					<MUIDataTable data={tableData} columns={columns} options={options} />
				</div>
			)}

			{filteredStudents.length === 0 && !isLoadingStudents && (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "200px",
						textAlign: "center",
						py: 6,
					}}
				>
					<Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
						No students found in Class {selectedClass}.
					</Typography>
					<Typography variant="body1">Click "Add Student" to register a new student.</Typography>
				</Box>
			)}

			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
		</Box>
	);
};

export default StudentDetails;
