import { useState } from "react";
import { Button, Box, Typography, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiButton: {
			styleOverrides: {
				containedPrimary: {
					backgroundColor: "#0d6efd",
					"&:hover": {
						backgroundColor: "#0b5ed7",
					},
				},
			},
		},
	},
});

export default function BulkUploadSchools() {
	const [file, setFile] = useState(null);
	const navigate = useNavigate();

	const handleFileChange = (event) => {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
		}
	};

	const handleUpload = () => {
		// Handle the file upload logic here
		console.log("Uploading file:", file);
		// In a real app, you would send the file to your backend
	};

	const handleLoadDemo = () => {
		// Logic to load demo schools
		console.log("Loading demo schools");
		// Navigate to schools list after loading demo data
		// navigate("/schools");
	};

	const handleGoBack = () => {
		navigate("/schools");
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ p: 3, maxWidth: "800px", margin: "0 auto" }}>
				<Typography variant="h4" fontWeight="bold" sx={{ color: "#2F4F4F", mb: 1 }}>
					Bulk Upload Schools
				</Typography>
				<Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
					Upload a CSV file with multiple schools to add them at once
				</Typography>

				<Paper sx={{ p: 4, borderRadius: 2 }}>
					<Typography variant="h5" fontWeight="bold" sx={{ color: "#2F4F4F", mb: 1 }}>
						Upload Schools via CSV
					</Typography>
					<Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
						Upload a CSV file with school details to create schools and user accounts
					</Typography>

					<Box
						sx={{
							border: "2px dashed #ccc",
							borderRadius: 2,
							p: 4,
							textAlign: "center",
							mb: 3,
						}}
					>
						<Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
							<Box
								sx={{
									backgroundColor: "#e6f2ff",
									borderRadius: "50%",
									width: 80,
									height: 80,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<CloudUploadIcon sx={{ fontSize: 40, color: "#0d6efd" }} />
							</Box>
						</Box>

						<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
							Upload School Data
						</Typography>

						<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
							This is a dummy illustration. In a real app, you would be able to upload a CSV file with
							school data here.
						</Typography>

						<Box
							sx={{
								backgroundColor: "#f0f7ff",
								border: "1px solid #d1e7ff",
								borderRadius: 2,
								p: 2,
								mb: 3,
								display: "flex",
								alignItems: "center",
                justifyContent: "center",
							}}
						>
							<CheckCircleOutlineIcon sx={{ color: "#2F4F4F", mr: 2 }} />
							<Box >
								<Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
									CSV Format
								</Typography>
								<Typography variant="body2" sx={{ color: "#555" }}>
									The CSV would include: School Name, UDISE Code, Cluster Name, Block Name
								</Typography>
							</Box>
						</Box>

						<Button
							variant="contained"
							sx={{
								backgroundColor: "#FFD700", // Changed to yellow color
								color: "black", // Changed text to black for better contrast
								borderRadius: "8px",
								"&:hover": {
									backgroundColor: "#E6C200", // Darker yellow on hover
								},
							}}
							onClick={handleLoadDemo}
						>
							Load Demo Schools
						</Button>
					</Box>
				</Paper>
			</Box>
		</ThemeProvider>
	);
}
