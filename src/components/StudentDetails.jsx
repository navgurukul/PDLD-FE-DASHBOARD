import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, FormControl, Select, MenuItem, TextField, CircularProgress, Button } from "@mui/material";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import MUIDataTable from "mui-datatables";
import SearchIcon from "@mui/icons-material/Search";
import { toast, ToastContainer } from "react-toastify";
import ButtonCustom from "../components/ButtonCustom";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import apiInstance from "../../api";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import UploadFileIcon from "@mui/icons-material/UploadFile";

const StudentDetails = ({ schoolId, schoolName }) => {
	const navigate = useNavigate();
	const [selectedClass, setSelectedClass] = useState("1");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoadingStudents, setIsLoadingStudents] = useState(false);
	const [students, setStudents] = useState([]);
	const [classes, setClasses] = useState([]);
	const [schoolInfo, setSchoolInfo] = useState({
		udiseCode: "",
		blockName: "",
		clusterName: "",
		totalStudentsInSchool: 0,
		assignedCAC: { name: "" },
		assignedCP: "NA",
	});

	// Delete confirmation modal state - separated like SchoolList
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [studentToDelete, setStudentToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Handle class change
	const handleClassChange = (event) => {
		setSelectedClass(event.target.value);
		// Filter students based on class
		filterStudentsByClass(event.target.value);
	};

	// Handle search query change
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	// Filter students by selected class
	const filterStudentsByClass = (classValue) => {
		const selectedClassData = classes.find((classData) => classData.class.toString() === classValue);
		if (selectedClassData) {
			setStudents(selectedClassData.students || []);
		} else {
			setStudents([]);
		}
	};

	// Fetch students from the API
	const fetchStudents = async () => {
		setIsLoadingStudents(true);
		try {
			const response = await apiInstance.get(`/dev/student/school/${schoolId}`);
			const result = response.data;

			if (result.success && result.data && result.data.data) {
				const schoolData = result.data.data;

				// Set school information
				setSchoolInfo({
					udiseCode: schoolData.udiseCode || "",
					blockName: schoolData.blockName || "",
					clusterName: schoolData.clusterName || "",
					totalStudentsInSchool: schoolData.totalStudentsInSchool || 0,
					assignedCAC: schoolData.assignedCAC || { name: "" },
					assignedCP: schoolData.assignedCP || "NA",
				});

				// Store the list of classes
				setClasses(schoolData.classes || []);

				// Initialize with class 1 if available, else first available class
				const class1Data = schoolData.classes.find((classData) => classData.class.toString() === "1");

				if (class1Data) {
					setStudents(class1Data.students || []);
				} else if (schoolData.classes.length > 0) {
					// If class 1 doesn't exist, default to first available class
					setSelectedClass(schoolData.classes[0].class.toString());
					setStudents(schoolData.classes[0].students || []);
				}
			} else {
				console.error("API response format unexpected:", result);
				setStudents([]);
			}
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to load students. Please try again later.");
			setStudents([]);
		} finally {
			setIsLoadingStudents(false);
		}
	};

	useEffect(() => {
		if (schoolId) {
			fetchStudents();
		}
	}, [schoolId]);

	const handleEditStudent = (studentId, student) => {
		navigate(`/schools/schoolDetail/${schoolId}/updateStudent/${studentId}`, {
			state: {
				schoolId: schoolId,
				studentId: studentId,
				udiseCode: schoolInfo.udiseCode,
				isEditMode: true,
				studentData: student, // Pass the complete student object
			},
		});
	};

	// Open delete confirmation modal - similar to SchoolList
	const openDeleteModal = (student) => {
		setStudentToDelete(student);
		setDeleteModalOpen(true);
	};

	// Close delete confirmation modal - similar to SchoolList
	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
		setStudentToDelete(null);
	};

	// Function to handle deleting a student - similar to SchoolList's confirmDeleteSchool
	const confirmDeleteStudent = async () => {
		if (!studentToDelete) return;

		setIsDeleting(true);
		try {
			// Call the delete API endpoint
			const response = await apiInstance.delete(`/dev/student/delete/${studentToDelete.id}`);

			if (response.data && response.data.success) {
				// Remove student from the list
				setStudents(students.filter((student) => student.id !== studentToDelete.id));
				
				// Show success toast
				toast.success(`Student ${studentToDelete.fullName} has been deleted successfully!`);
			} else {
				// Show error toast if the API returns an error message
				toast.error(response.data?.message || "Failed to delete student. Please try again.");
			}
		} catch (error) {
			console.error("Error deleting student:", error);
			toast.error("Failed to delete student. Please try again later.");
		} finally {
			setIsDeleting(false);
			closeDeleteModal(); // Close modal after operation completes
		}
	};

	// Filter students based on search query
	const filteredStudents = students.filter(
		(student) =>
			student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(student?.aparId && student.aparId.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Prepare data for MUIDataTable, with aparId as the last column before actions
	const tableData = filteredStudents.map((student) => [
		student.fullName || "N/A",
		student.gender || "N/A",
		`Class ${student.class}` || "N/A",
		student.dob || "N/A",
		student.fatherName || "N/A",
		student.motherName || "N/A",
		student.aparId || "N/A", // AparId shown as the last visible column
		student.id, // Hidden column for ID reference
		student, // Add the full student object for actions
	]);

	// Define columns for MUIDataTable
	const columns = [
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
			name: "Apar ID",
			options: {
				filter: false,
				sort: true,
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
			name: "studentObj", // Hidden column for full student object
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
					const studentId = tableData[dataIndex][7]; // Get ID from tableData
					const student = tableData[dataIndex][8]; // Get full student object

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
								onClick={() => handleEditStudent(studentId, student)} 
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
								onClick={() => openDeleteModal(student)}
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

	const handleBulkUploadStudent = () => {
		navigate("/schools/schoolDetail/studentBulkUpload");
	};

	const handleAddStudent = () => {
		// () => navigate(`/schools/schoolDetail/addStudents`)
		navigate(`/schools/schoolDetail/${schoolId}/addStudents`, {
			state: {
				schoolId: schoolId,
				udiseCode: schoolInfo.udiseCode,
			},
		});
	};

	return (
		<Box>
			<div className="flex justify-between items-center mb-2">
				<Typography variant="h6" className="text-xl font-bold">
					<span>Total Student Count ({schoolInfo.totalStudentsInSchool})</span>
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
							{classes.map((classData) => (
								<MenuItem key={classData.class} value={classData.class.toString()}>
									Class {classData.class}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				<div className="flex gap-2 sm:mt-0">
					<ButtonCustom imageName={addSymbolBtn} text={"Add Student"} onClick={handleAddStudent} />
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
						onClick={handleBulkUploadStudent}
					>
						<UploadFileIcon sx={{ mr: 1 }} />
						Bulk Upload
					</Button>
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

			{/* Delete Confirmation Modal - Following SchoolList approach exactly */}
			<DeleteConfirmationModal
				open={deleteModalOpen}
				onClose={closeDeleteModal}
				onConfirm={confirmDeleteStudent}
				title="Delete Student"
				confirmText="Delete"
				cancelText="Cancel"
				message="Are you sure you want to delete this student: "
				entityName={studentToDelete ? studentToDelete.fullName : ""}
				isProcessing={isDeleting}
				confirmButtonColor="error"
				icon={<DeleteOutlineIcon fontSize="large" />}
			/>

			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
		</Box>
	);
};

export default StudentDetails;
