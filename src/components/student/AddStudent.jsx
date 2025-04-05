import { useState, useEffect } from "react";
import {
	TextField,
	Button,
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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import apiInstance from "../../../api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "../../components/ButtonCustom";
import { toast, ToastContainer } from "react-toastify";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

export default function AddStudent() {
	const navigate = useNavigate();
	const { studentId } = useParams(); // Get studentId if it exists for edit mode
	const location = useLocation();

	// Extract schoolId from query params or location state
	const queryParams = new URLSearchParams(location.search);
	const schoolId = queryParams.get("schoolId") || location.state?.schoolId;
	const schoolName = location.state?.schoolName || "School";

	// Check if we're in edit mode
	const isEditMode = !!studentId;
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
		udiseCode: "",
		class: "1",
	});

	const [errors, setErrors] = useState({
		name: "",
		fatherName: "",
		motherName: "",
		dateOfBirth: "",
		udiseCode: "",
	});

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
			// Format date to DD-MM-YYYY
			const formattedDate = formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "dd-MM-yyyy") : "";

			// Prepare data for API
			const studentData = {
				name: formData.name,
				gender: formData.gender,
				fatherName: formData.fatherName,
				motherName: formData.motherName,
				dateOfBirth: formattedDate,
				uniqueId: formData.uniqueId || undefined, // Only include if provided
				hostel: formData.hostel || undefined, // Only include if provided
				udiseCode: formData.udiseCode,
				class: formData.class,
				schoolId: schoolId, // Include schoolId for association
			};

			if (isEditMode) {
				// Update existing student
				// Simulating API call success since we don't have an actual API
				// await apiInstance.put(`/api/students/${studentId}`, studentData);
				setTimeout(() => {
					toast.success("Student updated successfully!");
					setIsSubmitting(false);
					navigate(`/schools/${schoolId}`, { state: { tabIndex: 1 } });
				}, 1000);
			} else {
				// Create new student
				// Simulating API call success since we don't have an actual API
				// await apiInstance.post('/api/students', studentData);
				setTimeout(() => {
					toast.success("Student added successfully!");
					setIsSubmitting(false);
					navigate(`/schools/${schoolId}`, { state: { tabIndex: 1 } });
				}, 1000);
			}
		} catch (error) {
			console.error("Error saving student data:", error);
			toast.error(error.response?.data?.message || "Failed to save student data");
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
	];

	// Handle back navigation
	const handleBack = () => {
		navigate(`/schools/${schoolId}`, { state: { tabIndex: 1 } });
	};

	return (
		<ThemeProvider theme={theme}>
			{isLoading && <SpinnerPageOverlay />}
			<div className="p-6 mx-auto   w-[800px]">
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
								<DatePicker
									label="Date of Birth *"
									value={formData.dateOfBirth}
									onChange={handleDateChange}
									renderInput={(params) => (
										<TextField
											{...params}
											fullWidth
											error={!!errors.dateOfBirth}
											helperText={errors.dateOfBirth}
											sx={{
												"& .MuiOutlinedInput-root": {
													height: "48px",
												},
											}}
										/>
									)}
								/>
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
									label="Unique ID (Optional)"
									name="uniqueId"
									value={formData.uniqueId}
									onChange={handleInputChange}
									fullWidth
									placeholder="Enter student's unique ID if available"
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
