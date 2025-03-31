import { useState, useEffect } from "react";
import {
	Button,
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useNavigate, useLocation } from "react-router-dom";
import ButtonCustom from "./ButtonCustom";
import { toast } from "react-toastify";

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

export default function UploadSummary() {
	const navigate = useNavigate();
	const location = useLocation();
	const [uploadResult, setUploadResult] = useState(null);
	const [totalUploadCount, setTotalUploadCount] = useState(0);

	useEffect(() => {
		// Get the upload result from the location state
		if (location.state?.uploadResult) {
			setUploadResult(location.state.uploadResult);
		} else {
			// If no data is available, redirect to the upload page
			toast.error("No upload data available");
			navigate("/bulk-upload-schools");
		}

		if (location.state?.totalUploadCount) {
			setTotalUploadCount(location.state.totalUploadCount);
		}
	}, [location, navigate]);

	const handleGoToSchoolList = () => {
		navigate("/schools");
	};

	const downloadErrorsCSV = () => {
		if (!uploadResult || !uploadResult.data || !uploadResult.data.errors || uploadResult.data.errors.length === 0) {
			toast.error("No errors to download");
			return;
		}

		// Create CSV content
		const headers = ["UDISE Code", "School Name", "Block Name", "Cluster Name", "Error"];
		const csvContent = [
			headers.join(","),
			...uploadResult.data.errors.map((error) => {
				return [
					error.udiseCode || "",
					error.schoolName || "",
					error.blockName || "",
					error.clusterName || "",
					(error.reason || error.error || "Unknown error").replace(/,/g, ";"), // Replace commas in error text
				]
					.map((value) => `"${value}"`)
					.join(",");
			}),
		].join("\n");

		// Create a Blob and download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "upload_errors.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ p: 2, maxWidth: "1200px", margin: "0 auto" }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
					{/* <Typography variant="h5" fontWeight="bold" sx={{ color: "#2F4F4F" }}>
						School Upload Results
					</Typography> */}
					<h5 className="text-lg font-bold text-[#2F4F4F]">School Upload Results</h5>

					{uploadResult && uploadResult.data?.errors && uploadResult.data.errors.length > 0 && (
						<Button
							variant="outlined"
							startIcon={<GetAppIcon />}
							onClick={downloadErrorsCSV}
							sx={{
								color: "#2F4F4F",
								border: "1px solid #2F4F4F",
								height: "44px",
								borderRadius: "8px",
								"&:hover": {
									backgroundColor: "#2F4F4F",
									color: "white",
								},
							}}
						>
							Status Report
						</Button>
					)}
				</Box>

				{uploadResult && (
					<>
						<Box
							sx={{
								mb: 4,
								p: 3,
								backgroundColor: "#f8f9fa",
								borderRadius: 2,
								boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
							}}
						>
							<Typography variant="body1" sx={{ mb: 2 }}>
								Total schools in CSV: <span style={{ fontWeight: "bold" }}>{totalUploadCount}</span>
							</Typography>
							<Typography variant="body1" sx={{ mb: 2 }}>
								Successfully added:{" "}
								<span style={{ fontWeight: "bold", color: "green" }}>
									{uploadResult.data?.successCount || 0}
								</span>{" "}
								schools
							</Typography>
							{uploadResult.data?.errorCount > 0 && (
								<Typography variant="body1">
									Errors encountered:{" "}
									<span style={{ fontWeight: "bold", color: "red" }}>
										{uploadResult.data.errorCount}
									</span>{" "}
									schools
								</Typography>
							)}
						</Box>

						{uploadResult.data?.errors && uploadResult.data.errors.length > 0 && (
							<>
								<Typography variant="h6" sx={{ color: "red", mb: 2 }}>
									CSV Error Details:
								</Typography>
								<TableContainer
									component={Paper}
									sx={{ mb: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
								>
									<Table>
										<TableHead>
											<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
												<TableCell>UDISE Code</TableCell>
												<TableCell>School Name</TableCell>
												<TableCell>Block</TableCell>
												<TableCell>Cluster</TableCell>
												<TableCell>Error</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{uploadResult.data.errors.map((error, index) => (
												<TableRow
													key={index}
													sx={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fff0f0" }}
												>
													<TableCell>{error.udiseCode || "-"}</TableCell>
													<TableCell>{error.schoolName || "-"}</TableCell>
													<TableCell>{error.blockName || "-"}</TableCell>
													<TableCell>{error.clusterName || "-"}</TableCell>
													<TableCell sx={{ color: "red" }}>
														{error.reason || error.error || "Unknown error"}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</>
						)}

						<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
							<ButtonCustom text="Go to School List" btnWidth="180" onClick={handleGoToSchoolList} />
						</Box>
					</>
				)}
			</Box>
		</ThemeProvider>
	);
}
