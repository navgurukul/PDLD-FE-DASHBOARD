import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, Grid, Paper, Tabs, Tab, Button, IconButton } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import {
	EditPencilIcon,
	bloodImage,
	heightImageStudent,
	weightScale,
	person,
	house,
	fingerprint,
	calendar_today,
} from "../../utils/imagePath";
import ButtonCustom from "../../components/ButtonCustom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import StudentAcademics from "./StudentAcademics";

// Tab panel component
function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box>{children}</Box>}
		</div>
	);
}

// Dummy student data for when no data is passed through location state
const dummyStudent = {
	id: "123456",
	fullName: "Raj Kumar",
	gender: "Male",
	class: "8",
	dob: "1994-12-11",
	fatherName: "Raja Kumar",
	motherName: "Rajshri Kumari",
	aparId: "123456782",
	hostel: "Hostel C",
	healthMetrics: {
		lastUpdated: "03rd March 2025",
		hemoglobin: "8.9",
		height: "152",
		weight: "55",
	},
};

const dummySchoolName = "Government Higher Secondary School";
const dummyUdiseCode = "12345678901";

const StudentProfileView = () => {
	const theme = useTheme();
	const { schoolId, studentId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [student, setStudent] = useState(null);
	const [tabValue, setTabValue] = useState(0);
	const [schoolName, setSchoolName] = useState("");
	const [udiseCode, setUdiseCode] = useState("");

	const iconStyle = { width: "24px", height: "24px" };
	const labelBoxStyle = { width: "269px", color: "#666", display: "flex", gap: 1, marginRight: "48px" };

	// Format date helper function
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";

		try {
			const date = new Date(dateString);

			// Check if date is valid
			if (isNaN(date.getTime())) return dateString;

			// Format to dd-mm-yyyy
			const day = date.getDate().toString().padStart(2, "0");
			const month = (date.getMonth() + 1).toString().padStart(2, "0");
			const year = date.getFullYear();

			return `${day}-${month}-${year}`;
		} catch (error) {
			console.error("Error formatting date:", error);
			return dateString;
		}
	};

	// Handle tab change
	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	useEffect(() => {
		// Short timeout to simulate API call
		const timer = setTimeout(() => {
			// Check if we have student data from location state
			if (location.state?.studentData) {
				setStudent(location.state.studentData);
				setSchoolName(location.state.schoolName || dummySchoolName);
				setUdiseCode(location.state.udiseCode || dummyUdiseCode);
			} else {
				// Use dummy data if no state was passed
				setStudent(dummyStudent);
				setSchoolName(dummySchoolName);
				setUdiseCode(dummyUdiseCode);
			}
			setIsLoading(false);
		}, 800);

		return () => clearTimeout(timer);
	}, [studentId, location.state]);

	// Handle edit student
	const handleEditStudent = () => {
		navigate(`/schools/schoolDetail/${schoolId}/updateStudent`, {
			state: {
				schoolId: schoolId,
				studentId: studentId,
				udiseCode: udiseCode,
				isEditMode: true,
				studentData: student,
			},
		});
	};

	// Handle view student report
	const handleViewStudentReport = () => {
		navigate(`/student-report/${schoolId}/${studentId}`, {
			state: {
				studentData: student,
				schoolName: schoolName,
				udiseCode: udiseCode,
			},
		});
	};

	// Go back to student list
	const handleGoBack = () => {
		navigate(`/schools/schoolDetail/${schoolId}`);
	};

	if (isLoading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
				<CircularProgress sx={{ color: "#2F4F4F" }} />
			</Box>
		);
	}

	if (!student) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="h6" color="error">
					Student not found
				</Typography>
				<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mt: 2 }}>
					Back to Students
				</Button>
			</Box>
		);
	}

	const lastUpdated = student.healthMetrics?.lastUpdated || "N/A";

	return (
		<Box className="main-page-wrapper">
			{/* Student Badge - Name and gender */}
			<Box sx={{ display: "flex",justifyContent:"space-between", alignItems: "center" }}>
				<Box sx={{display: "flex"}} >
					<h5 className="text-lg font-bold text-[#2F4F4F] mr-4">{student.fullName}</h5>
					<Box
						sx={{ 
							padding: "4px 8px",
							bgcolor: "#EAEDED",
							borderRadius: "8px",
							color: "#2E7D32",
							height: "48px",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Typography variant="body1" sx={{ }} >
							{student.gender === "M"
								? "Male"
								: student.gender === "F"
								? "Female"
								: student.gender || "N/A"}
						</Typography>
					</Box>
				</Box>

				<ButtonCustom
					onClick={handleEditStudent}
					startIcon={<img src={EditPencilIcon} alt="Edit" style={{ width: "18px", height: "18px" }} />}
					text={"Edit Student"}
				/>
			</Box>

			{/* Tabs for navigation */}
			<Box sx={{ borderBottom: 1, borderColor: "#E0E0E0", mb: 3 }}>
				<Tabs value={tabValue} onChange={handleTabChange}>
					<Tab label="Overview" />
					<Tab label="Academics" />
				</Tabs>
			</Box>

			{/* Overview tab content */}
			<TabPanel value={tabValue} index={0} sx={{ padding: 0 }}>
				<Grid container spacing={4}>
					{/* Personal Details Section */}
					<Grid item xs={12} md={6}>
						<Paper
							elevation={0}
							sx={{
								p: 3,
								borderRadius: "8px",
								border: "1px solid #e0e0e0",
								height: "100%",
							}}
						>
							<h5 className="mb-4">Personal Details</h5>

							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								<Box sx={{ display: "flex", alignItems: "start" }}>
									<Box sx={labelBoxStyle}>
										<img src={person} alt="person" style={iconStyle} />
										<Typography variant="body1">Father's Name</Typography>
									</Box>
									<Typography variant="subtitle1"> {student.fatherName || "N/A"}</Typography>
								</Box>

								<Box sx={{ display: "flex", alignItems: "start" }}>
									<Box sx={labelBoxStyle}>
										<img src={person} alt="person" style={iconStyle} />
										<Typography variant="body1">Mother's Name</Typography>
									</Box>
									<Typography variant="subtitle1">{student.motherName || "N/A"}</Typography>
								</Box>

								<Box sx={{ display: "flex", alignItems: "start" }}>
									<Box sx={labelBoxStyle}>
										<img src={calendar_today} alt="calendar_today" style={iconStyle} />
										<Typography variant="body1">Date of Birth</Typography>
									</Box>
									<Typography variant="subtitle1">{formatDate(student.dob)}</Typography>
								</Box>

								<Box sx={{ display: "flex", alignItems: "start" }}>
									<Box sx={labelBoxStyle}>
										<img src={house} alt="person" style={iconStyle} />
										<Typography variant="body1">Hostel</Typography>
									</Box>
									<Typography variant="subtitle1">{student.hostel || "N/A"}</Typography>
								</Box>

								<Box sx={{ display: "flex", alignItems: "start" }}>
									<Box sx={labelBoxStyle}>
										<img src={fingerprint} alt="person" style={iconStyle} />
										<Typography variant="body1">Apar ID</Typography>
									</Box>
									<Typography variant="subtitle1">{student.aparId || "N/A"}</Typography>
								</Box>
							</Box>
						</Paper>
					</Grid>

					{/* Health Metrics Section */}
					<Grid item xs={12} md={6}>
						<Paper
							elevation={0}
							sx={{
								p: 3,
								borderRadius: "8px",
								border: "1px solid #e0e0e0",
							}}
						>
							<Box sx={{ mb: 4 }}>
								<h5 className="mb-4">Health Metrics</h5>
								<Typography variant="body2" color="text.secondary">
									Last Updated
									<Typography
										component="span"
										variant="subtitle2"
										display="inline"
										sx={{
											fontWeight: "bold",
											color: theme.palette.primary.main,
											ml: 1,
										}}
									>
										28th March 2025
									</Typography>
								</Typography>
							</Box>

							<Grid container spacing={3}>
								{/* Hemoglobin */}
								<Grid item xs={12} sm={4}>
									<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
										<Box
											sx={{
												width: "48px",
												height: "48px",
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
												mb: 1,
											}}
										>
											<img src={bloodImage} alt="bloodImage" />
										</Box>
										<Typography variant="body1" color="text.secondary" sx={{ gap: 1 }}>
											Hemoglobin
										</Typography>
										<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
											{"8.9 g/dL"}
										</Typography>
									</Box>
								</Grid>

								{/* Height */}
								<Grid item xs={12} sm={4}>
									<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
										<Box
											sx={{
												width: "48px",
												height: "48px",
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
												mb: 1,
											}}
										>
											<img src={heightImageStudent} alt="heightImageStudent" />
										</Box>
										<Typography variant="body1" color="text.secondary" sx={{ gap: 1 }}>
											Height
										</Typography>
										<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
											{"152 cm"}
										</Typography>
									</Box>
								</Grid>

								{/* Weight */}
								<Grid item xs={12} sm={4}>
									<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
										<Box
											sx={{
												width: "48px",
												height: "48px",
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
												mb: 1,
											}}
										>
											<img src={weightScale} alt="weightScale" />
										</Box>
										<Typography variant="body1" color="text.secondary" sx={{ gap: 1 }}>
											Weight
										</Typography>
										<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
											{"55 Kg"}
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				</Grid>
			</TabPanel>

			{/* Academics tab content */}
			<TabPanel value={tabValue} index={1}>
				<StudentAcademics studentId={studentId} schoolId={schoolId} />
			</TabPanel>

			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
		</Box>
	);
};

export default StudentProfileView;
