import { useState, useEffect } from "react";
import {
	TextField,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	Box,
	Typography,
	Paper,
	FormHelperText,
	Grid,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormLabel,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import apiInstance from "../../../api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "../../components/ButtonCustom";
import { toast, ToastContainer } from "react-toastify";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import { format } from "date-fns";

const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					backgroundColor: "#007BFF",
					color: "white",
					"&:hover": {
						backgroundColor: "#0069D9",
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#2F4F4F",
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					"&.Mui-focused": {
						color: "#2F4F4F",
					},
				},
			},
		},
	},
});

export default function AddStudent({ isEditMode = false }) {
	const navigate = useNavigate();
	const location = useLocation();

	// Get data from location state
	const { studentId, schoolId, schoolName = "School", studentData } = location.state || {};

	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		gender: "M",
		fatherName: "",
		motherName: "",
		dateOfBirth: null,
		uniqueId: "",
		hostel: "",
		udiseCode: location.state?.udiseCode || "",
		class: "1",
	});

	const [errors, setErrors] = useState({
		name: "",
		fatherName: "",
		motherName: "",
		dateOfBirth: "",
		udiseCode: "",
	});

	// Fix for the AddStudent component's date handling
	// Focus on the useEffect where the date is being set

	useEffect(() => {
		if ((location.state?.isEditMode || isEditMode) && location.state?.studentData) {
			const student = location.state.studentData;

			// Improved date parsing logic
			let dob = null;
			if (student.dob) {
				try {
					// Check if the date is in "DD-MM-YYYY" format
					if (typeof student.dob === "string" && student.dob.includes("-")) {
						const parts = student.dob.split("-");
						// Make sure we have 3 parts (day, month, year)
						if (parts.length === 3) {
							const [day, month, year] = parts;
							// Create a valid date string in YYYY-MM-DD format for the Date constructor
							const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
							dob = new Date(dateStr);

							// Validate the date object
							if (isNaN(dob.getTime())) {
								console.error("Invalid date created from string:", student.dob);
								dob = null;
							}
						} else {
							console.error("Date string doesn't have 3 parts:", student.dob);
							dob = null;
						}
					} else {
						// If it's already a Date object or other format, try direct conversion
						dob = new Date(student.dob);

						// Validate the date object
						if (isNaN(dob.getTime())) {
							console.error("Invalid date created from value:", student.dob);
							dob = null;
						}
					}
				} catch (error) {
					console.error("Error parsing date:", error, student.dob);
					dob = null;
				}
			}

			// Set form data from the passed student object
			setFormData({
				name: student.fullName || student.name || "",
				fatherName: student.fatherName || "",
				motherName: student.motherName || "",
				dateOfBirth: dob, // Now this will be either a valid Date object or null
				uniqueId: student.aparId || "",
				hostel: student.hostel || "",
				udiseCode: student.schoolUdiseCode || location.state?.udiseCode || "",
				class: student.class?.toString() || "1",
				gender: student.gender || "M",
			});
		}
	}, [isEditMode, location]);

	// Updated handleEditStudent function in StudentDetails component to ensure proper data passing
	const handleEditStudent = (studentId, student) => {
		// Make sure we're not passing any problematic date formats
		const cleanStudent = { ...student };

		// If there's a date of birth, make sure it's in the expected format
		if (cleanStudent.dob) {
			// Just pass the string format to the edit page, let it handle the parsing
			// Don't try to convert it to a Date object here
		}

		navigate(`/schools/schoolDetail/updateStudent`, {
			state: {
				schoolId: schoolId,
				studentId: studentId,
				udiseCode: schoolInfo.udiseCode,
				isEditMode: true,
				studentData: cleanStudent, // Pass the cleaned student object
			},
		});
	};

	// Handle input change
	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData({
			...formData,
			[name]: value,
		});

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: "",
			});
		}
	};

	// Handle date change
	const handleDateChange = (newDate) => {
		setFormData({
			...formData,
			dateOfBirth: newDate,
		});

		// Clear date error when user selects a new date
		if (errors.dateOfBirth) {
			setErrors({
				...errors,
				dateOfBirth: "",
			});
		}
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};
		let isValid = true;

		// Validate name
		if (!formData.name.trim()) {
			newErrors.name = "Student name is required";
			isValid = false;
		} else if (formData.name.trim().length < 3) {
			newErrors.name = "Name must be at least 3 characters";
			isValid = false;
		} else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
			newErrors.name = "Name should only contain letters and spaces";
			isValid = false;
		}

		// Validate father's name
		if (!formData.fatherName.trim()) {
			newErrors.fatherName = "Father's name is required";
			isValid = false;
		} else if (!/^[a-zA-Z\s]+$/.test(formData.fatherName.trim())) {
			newErrors.fatherName = "Father's name should only contain letters and spaces";
			isValid = false;
		}

		// Validate mother's name
		if (!formData.motherName.trim()) {
			newErrors.motherName = "Mother's name is required";
			isValid = false;
		} else if (!/^[a-zA-Z\s]+$/.test(formData.motherName.trim())) {
			newErrors.motherName = "Mother's name should only contain letters and spaces";
			isValid = false;
		}

		// Validate date of birth
		if (!formData.dateOfBirth) {
			newErrors.dateOfBirth = "Date of birth is required";
			isValid = false;
		} else {
			const today = new Date();
			const birthDate = new Date(formData.dateOfBirth);
			const age = today.getFullYear() - birthDate.getFullYear();

			if (age < 5 || age > 18) {
				newErrors.dateOfBirth = "Age should be between 5 and 18 years";
				isValid = false;
			}
		}

		// Validate UDISE code
		if (!formData.udiseCode.trim()) {
			newErrors.udiseCode = "UDISE code is required";
			isValid = false;
		} else if (!/^\d{11}$/.test(formData.udiseCode.trim())) {
			newErrors.udiseCode = "UDISE code should be 11 digits";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	// Handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validateForm()) {
			toast.error("Please correct the errors in the form");
			return;
		}

		setIsSubmitting(true);

		try {
			// Format date to D-MM-YYYY format as expected by the API
			const formattedDate = formData.dateOfBirth ? `${format(new Date(formData.dateOfBirth), "d-MM-yyyy")}` : "";

			// Prepare data for API according to the required payload structure
			const studentData = {
				fullName: formData.name,
				fatherName: formData.fatherName,
				motherName: formData.motherName,
				dob: formattedDate,
				class: formData.class,
				gender: formData.gender,
				schoolUdiseCode: formData.udiseCode,
				aparId: formData.uniqueId || "",
				hostel: formData.hostel || "",
			};

			if (isEditMode && studentId) {
				// Update existing student
				await apiInstance.put(`/dev/student/update/${studentId}`, studentData);
				toast.success("Student updated successfully!");
				setTimeout(() => {
					navigate(`/schools/schoolDetail/${schoolId}`);
				}, 1200);
			} else {
				// Create new student
				const response = await apiInstance.post("/dev/student/add", studentData);

				if (response.data && response.data.success) {
					toast.success("New Student added successfully!");
					setTimeout(() => {
						navigate(`/schools/schoolDetail/${schoolId}`);
					}, 1500);
				} else {
					throw new Error(response.data?.message || "Failed to add student");
				}
			}
		} catch (error) {
			console.error("Error saving student data:", error);
			toast.error(error.response?.data?.message || error.message || "Failed to save student data");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Classes array for dropdown
	const classes = [
		{ value: "1", label: "Class 1" },
		{ value: "2", label: "Class 2" },
		{ value: "3", label: "Class 3" },
		{ value: "4", label: "Class 4" },
		{ value: "5", label: "Class 5" },
		{ value: "6", label: "Class 6" },
		{ value: "7", label: "Class 7" },
		{ value: "8", label: "Class 8" },
		{ value: "9", label: "Class 9" },
		{ value: "10", label: "Class 10" },
		{ value: "11", label: "Class 11" },
		{ value: "12", label: "Class 12" },
	];

	return (
		<ThemeProvider theme={theme}>
			{isLoading && <SpinnerPageOverlay />}
			<div className="p-6 mx-auto w-[800px]">
				<div className="ml-5">
					<h5 className="text-lg font-bold text-[#2F4F4F]">
						{isEditMode ? "Edit Student" : "Add New Student"}
					</h5>
					<Typography variant="body1" className="text-gray-600 mb-2">
						{isEditMode
							? "Update student information and details"
							: "Enter student details to add them to the school"}
					</Typography>
				</div>

				<Paper elevation={0} className="max-w-3xl mx-auto p-6 rounded-lg ">
					<form onSubmit={handleSubmit}>
						<Grid container spacing={3}>
							{/* Student Name */}
							<Grid item xs={12} md={6}>
								<TextField
									label="Student Name *"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter student's full name"
									variant="outlined"
									error={!!errors.name}
									helperText={errors.name}
									sx={{
										"& .MuiOutlinedInput-root": {
											height: "48px",
										},
									}}
								/>
							</Grid>

							{/* Class Selection */}
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required>
									<InputLabel id="class-select-label">Class</InputLabel>
									<Select
										labelId="class-select-label"
										id="class-select"
										name="class"
										value={formData.class}
										label="Class"
										onChange={handleInputChange}
										sx={{
											height: "48px",
											"& .MuiSelect-select": {
												height: "48px",
												display: "flex",
												alignItems: "center",
											},
										}}
									>
										{classes.map((cls) => (
											<MenuItem key={cls.value} value={cls.value}>
												{cls.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>

							{/* Father's Name */}
							<Grid item xs={12} md={6}>
								<TextField
									label="Father's Name *"
									name="fatherName"
									value={formData.fatherName}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter father's name"
									variant="outlined"
									error={!!errors.fatherName}
									helperText={errors.fatherName}
									sx={{
										"& .MuiOutlinedInput-root": {
											height: "48px",
										},
									}}
								/>
							</Grid>

							{/* Mother's Name */}
							<Grid item xs={12} md={6}>
								<TextField
									label="Mother's Name *"
									name="motherName"
									value={formData.motherName}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter mother's name"
									variant="outlined"
									error={!!errors.motherName}
									helperText={errors.motherName}
									sx={{
										"& .MuiOutlinedInput-root": {
											height: "48px",
										},
									}}
								/>
							</Grid>

							{/* Gender */}
							<Grid item xs={12} md={6}>
								<FormControl component="fieldset" required>
									<FormLabel component="legend">Gender</FormLabel>
									<RadioGroup row name="gender" value={formData.gender} onChange={handleInputChange}>
										<FormControlLabel value="M" control={<Radio color="primary" />} label="Male" />
										<FormControlLabel
											value="F"
											control={<Radio color="primary" />}
											label="Female"
										/>
									</RadioGroup>
								</FormControl>
							</Grid>

							{/* Date of Birth */}
							<Grid item xs={12} md={6}>
								{/* <DatePicker
									selected={formData.dateOfBirth}
									onChange={handleDateChange}
									dateFormat="dd/MM/yyyy"
									placeholderText="Select date of birth"
									className={`w-full h-[48px] rounded-lg border ${
										errors.dateOfBirth ? "border-red-500" : "border-gray-300"
									} px-3`}
								/> */}
								<DatePicker
									selected={
										formData.dateOfBirth instanceof Date && !isNaN(formData.dateOfBirth)
											? formData.dateOfBirth
											: null
									}
									onChange={handleDateChange}
									dateFormat="dd/MM/yyyy"
									placeholderText="Select date of birth"
									className={`w-full h-[48px] rounded-lg border ${
										errors.dateOfBirth ? "border-red-500" : "border-gray-300"
									} px-3`}
								/>
								{errors.dateOfBirth && <FormHelperText error>{errors.dateOfBirth}</FormHelperText>}
							</Grid>

							{/* UDISE Code */}
							<Grid item xs={12} md={6}>
								<TextField
									label="UDISE Code *"
									name="udiseCode"
									value={formData.udiseCode}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter 11-digit UDISE code"
									variant="outlined"
									error={!!errors.udiseCode}
									helperText={errors.udiseCode}
									disabled={true} // Disable the field as UDISE code should not be edited directly
									sx={{
										"& .MuiOutlinedInput-root": {
											height: "48px",
										},
									}}
								/>
							</Grid>

							{/* Unique ID (Optional) */}
							<Grid item xs={12} md={6}>
								<TextField
									label="APAR ID (Optional)"
									name="uniqueId"
									value={formData.uniqueId}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter student's APAR ID if available"
									variant="outlined"
									sx={{
										"& .MuiOutlinedInput-root": {
											height: "48px",
										},
									}}
								/>
							</Grid>

							{/* Hostel (Optional) */}
							<Grid item xs={12}>
								<TextField
									label="Hostel (Optional)"
									name="hostel"
									value={formData.hostel}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter hostel information if applicable"
									variant="outlined"
									sx={{
										"& .MuiOutlinedInput-root": {
											height: "48px",
										},
									}}
								/>
							</Grid>
						</Grid>

						<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
							<ButtonCustom
								text={
									isSubmitting
										? isEditMode
											? "Updating..."
											: "Adding..."
										: isEditMode
										? "Update Student"
										: "Add Student"
								}
								onClick={handleSubmit}
								disabled={isSubmitting}
							/>
						</Box>
					</form>
				</Paper>
			</div>
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
		</ThemeProvider>
	);
}
