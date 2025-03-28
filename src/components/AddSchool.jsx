import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, FormHelperText } from "@mui/material";
import { toast } from "react-toastify";
import apiInstance from "../../api"; // Import the custom axios instance
import ButtonCustom from "./ButtonCustom";

export default function AddSchool({ onClose, onSave }) {
	const [formData, setFormData] = useState({
		schoolName: "",
		udiseCode: "",
		clusterName: "",
		blockName: "",
	});

	const [loading, setLoading] = useState(false); // Add loading state

	const [errors, setErrors] = useState({
		schoolName: false,
		udiseCode: false,
		clusterName: false,
		blockName: false,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});

		// Clear error when user types
		if (value.trim()) {
			setErrors({
				...errors,
				[name]: false,
			});
		}
	};

	const validateForm = () => {
		const newErrors = {
			schoolName: !formData.schoolName.trim(),
			udiseCode: !formData.udiseCode.trim(),
			clusterName: !formData.clusterName.trim(),
			blockName: !formData.blockName.trim(),
		};

		setErrors(newErrors);

		// Return true if no errors (all fields filled)
		return !Object.values(newErrors).some((error) => error);
	};

	const handleSubmit = async () => {
		if (validateForm()) {
			try {
				setLoading(true);

				// Prepare payload based on the expected structure
				const payload = {
					schoolName: formData.schoolName,
					udiseCode: formData.udiseCode,
					blockName: formData.blockName,
					clusterName: formData.clusterName,
				};

				// Make POST request to create school
				const response = await apiInstance.post("/dev/school/add", payload);

				// Check response status and show appropriate message
				if (response.status === 200 || response.status === 201) {
					toast.success("School created successfully!");

					// Call onSave with the created school data if needed
					if (onSave && typeof onSave === "function") {
						onSave(response.data?.data || formData);
					}

					// Close the form or navigate away
					if (onClose && typeof onClose === "function") {
						onClose();
					}
				} else {
					// Handle unexpected success responses
					toast.warning(
						"Request succeeded but with an unexpected response. Please verify the school was created."
					);
				}
			} catch (error) {
				// Handle error cases
				console.error("Error creating school:", error);

				// Show appropriate error message based on the error response
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					const errorMessage = error.response.data?.message || "Failed to create school. Please try again.";
					toast.error(errorMessage);
				} else if (error.request) {
					// The request was made but no response was received
					toast.error("Server did not respond. Please check your connection and try again.");
				} else {
					// Something happened in setting up the request that triggered an Error
					toast.error("An error occurred while creating the school. Please try again.");
				}
			} finally {
				setLoading(false);
			}
		} else {
			toast.error("Please fill all required fields");
		}
	};

	return (
		<Box sx={{ p: 3, maxWidth: "800px", margin: "0 auto" }}>
			<h5 className="text-lg font-bold text-[#2F4F4F]">Add New School</h5>
			<Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
				Create a school by filling in the details below
			</Typography>

			<Paper sx={{ p: 4, borderRadius: 2 }}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
					<Box>
						<Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
							School Name *
						</Typography>
						<TextField
							fullWidth
							name="schoolName"
							value={formData.schoolName}
							onChange={handleChange}
							placeholder="Enter school name"
							error={errors.schoolName}
							size="small"
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
								},
							}}
						/>
						{errors.schoolName && <FormHelperText error>School name is required</FormHelperText>}
					</Box>

					<Box>
						<Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
							UDISE Code *
						</Typography>
						<TextField
							fullWidth
							size="small"
							name="udiseCode"
							value={formData.udiseCode}
							onChange={handleChange}
							placeholder="Enter UDISE code"
							error={errors.udiseCode}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
								},
							}}
						/>
						{errors.udiseCode && <FormHelperText error>UDISE code is required</FormHelperText>}
					</Box>

					<Box>
						<Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
							Cluster Name *
						</Typography>
						<TextField
							fullWidth
							size="small"
							name="clusterName"
							value={formData.clusterName}
							onChange={handleChange}
							placeholder="Enter cluster name"
							error={errors.clusterName}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
								},
							}}
						/>
						{errors.clusterName && <FormHelperText error>Cluster name is required</FormHelperText>}
					</Box>

					<Box>
						<Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
							Block Name *
						</Typography>
						<TextField
							fullWidth
							size="small"
							name="blockName"
							value={formData.blockName}
							onChange={handleChange}
							placeholder="Enter block name"
							error={errors.blockName}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
								},
							}}
						/>
						{errors.blockName && <FormHelperText error>Block name is required</FormHelperText>}
					</Box>
				</Box>

				<div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonCustom text={loading ? "Creating..." : "Create School"}  	onClick={handleSubmit}/>
				</div>
			</Paper>
		</Box>
	);
}
