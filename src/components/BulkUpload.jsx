import { useState, useRef } from "react";
import {
	Button,
	Box,
	Typography,
	Paper,
	Modal,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "./ButtonCustom";
import apiInstance from "../../api";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 800,
	maxWidth: "90%",
	maxHeight: "90vh",
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
	overflow: "auto",
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
	open,
	onClose,
	onConfirm,
	title,
	confirmText = "Confirm",
	cancelText = "Cancel",
	message,
	entityName,
	isProcessing = false,
}) => {
	const modalStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: 400,
		maxWidth: "90%",
		bgcolor: "background.paper",
		boxShadow: 24,
		borderRadius: 2,
		p: 4,
	};

	return (
		<Modal
			open={open}
			onClose={isProcessing ? null : onClose}
			aria-labelledby="confirmation-modal-title"
			aria-describedby="confirmation-modal-description"
		>
			<Box sx={modalStyle}>
				<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
					<Typography
						id="confirmation-modal-title"
						variant="h6"
						component="h2"
						sx={{ fontWeight: "bold", color: "#2F4F4F" }}
					>
						{title}
					</Typography>
				</Box>

				<Typography id="confirmation-modal-description" sx={{ mb: 3, color: "#555" }}>
					{message}
					{entityName && <strong>{entityName}</strong>}?
				</Typography>

				<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
					<Button
						variant="outlined"
						onClick={onClose}
						disabled={isProcessing}
						sx={{
							borderColor: "#ccc",
							color: "#555",
							"&:hover": {
								borderColor: "#999",
								bgcolor: "#f5f5f5",
							},
						}}
					>
						{cancelText}
					</Button>

					<ButtonCustom
						text={isProcessing ? "Removing..." : confirmText}
						onClick={onConfirm}
						disabled={isProcessing}
						btnWidth="120"
						customStyle={{
							backgroundColor: "#d32f2f",
							color: "white",
							"&:hover": {
								backgroundColor: "#b71c1c",
							},
						}}
					/>
				</Box>
			</Box>
		</Modal>
	);
};

export default function BulkUploadSchools() {
	const [file, setFile] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [uploadResult, setUploadResult] = useState(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	const handleFileChange = (event) => {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) {
			toast.error("Please select a CSV file first");
			return;
		}

		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await apiInstance.post("/dev/admin/bulk/schools", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setUploadResult(response.data);

			// Show success toast
			toast.success(`Upload completed: ${response.data.data.successCount} schools added successfully`);

			// If there are errors, show the modal with details
			if (response.data.data.errorCount > 0) {
				setOpenModal(true);
			}
		} catch (error) {
			console.error("Error uploading file:", error);
			toast.error(error.response?.data?.message || "Error uploading file");

			if (error.response?.data) {
				setUploadResult(error.response.data);
				setOpenModal(true);
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleGoBack = () => {
		navigate("/schools");
	};

	const handleCloseModal = () => {
		setOpenModal(false);
	};

	const handleRemoveFile = () => {
		setIsDeleting(true);
		// Small timeout to show the removing state
		setTimeout(() => {
			setFile(null);
			setIsDeleting(false);
			setDeleteModalOpen(false);

			// Reset the file input so the same file can be selected again
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}, 500);
	};

	const confirmFileRemoval = () => {
		setDeleteModalOpen(true);
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ p: 2, maxWidth: "800px", margin: "0 auto" }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
					<Typography variant="h4" fontWeight="bold" sx={{ color: "#2F4F4F" }}>
						Bulk Upload Schools
					</Typography>
				</Box>

				<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
					Upload a CSV file with multiple schools to add them at once
				</Typography>

				<Paper sx={{ p: 3, borderRadius: 2 }}>
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
							<input
								accept=".csv"
								style={{ display: "none" }}
								id="upload-file-button"
								type="file"
								onChange={handleFileChange}
								ref={fileInputRef}
							/>
							<label htmlFor="upload-file-button">
								<Box
									sx={{
										backgroundColor: "#e6f2ff",
										borderRadius: "50%",
										width: 80,
										height: 80,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										"&:hover": {
											backgroundColor: "#d1e7ff",
											boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
										},
										transition: "all 0.3s ease",
									}}
								>
									<CloudUploadIcon sx={{ fontSize: 40, color: "#0d6efd" }} />
								</Box>
							</label>
						</Box>

						<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
							{file
								? "File Selected - Click Upload to Continue"
								: "Click the Cloud Icon to Select a CSV File"}
						</Typography>

						<Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
							Upload a CSV file with school data. The file should contain School Name, UDISE Code, Cluster
							Name, and Block Name.
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
							}}
						>
							<CheckCircleOutlineIcon sx={{ color: "#2F4F4F", mr: 2, flexShrink: 0 }} />
							<Box textAlign="center">
								<Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
									CSV Format
								</Typography>
								<Typography variant="body2" sx={{ color: "#555" }}>
									The CSV should include: School Name, UDISE Code, Cluster Name, Block Name
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								justifyContent: "center",
								gap: 2,
							}}
						>
							{file && (
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										p: 1.2,
										mb: 3,
										border: "1px solid #e0e0e0",
										borderRadius: 1,
										backgroundColor: "#f5f5f5",
									}}
								>
									<Typography>{file.name}</Typography>
									<CloseIcon
										size="small"
										onClick={confirmFileRemoval}
										sx={{
											cursor: "pointer",
											fontSize: "20px", // Makes the icon smaller
											backgroundColor: "#e0e0e0", // Light grey background
											borderRadius: "50%", // Makes the background circular
											padding: "4px", // Adds some space around the icon
											marginLeft: "10px", // Adds margin to the left
										}}
									/>
								</Box>
							)}

							<ButtonCustom
								text={isUploading ? "Uploading..." : "Upload Schools"}
								btnWidth="200"
								onClick={handleUpload}
								disabled={!file || isUploading}
							/>
						</Box>

						{isUploading && (
							<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
								<CircularProgress size={24} />
							</Box>
						)}
					</Box>
				</Paper>

				{/* Results Modal */}
				<Modal open={openModal} onClose={handleCloseModal} aria-labelledby="upload-results-modal">
					<Box sx={modalStyle}>
						<Typography
							id="upload-results-modal"
							variant="h5"
							fontWeight="bold"
							sx={{ mb: 2, color: "#2F4F4F" }}
						>
							Upload Results
						</Typography>

						{uploadResult && (
							<>
								<Box sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
									<Typography variant="body1">
										Successfully added:{" "}
										<span style={{ fontWeight: "bold", color: "green" }}>
											{uploadResult.data.successCount}
										</span>{" "}
										schools
									</Typography>
									{uploadResult.data.errorCount > 0 && (
										<Typography variant="body1">
											Errors encountered:{" "}
											<span style={{ fontWeight: "bold", color: "red" }}>
												{uploadResult.data.errorCount}
											</span>{" "}
											schools
										</Typography>
									)}
								</Box>

								{uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
									<>
										<Typography variant="h6" sx={{ color: "red", mb: 1 }}>
											Error Details:
										</Typography>
										<TableContainer component={Paper} sx={{ mb: 2 }}>
											<Table size="small">
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
														<TableRow key={index} sx={{ backgroundColor: "#fff0f0" }}>
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

								<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
									<ButtonCustom text="Close" btnWidth="120" onClick={handleCloseModal} />
								</Box>
							</>
						)}
					</Box>
				</Modal>

				{/* Delete Confirmation Modal */}
				<DeleteConfirmationModal
					open={deleteModalOpen}
					onClose={() => setDeleteModalOpen(false)}
					onConfirm={handleRemoveFile}
					title="Remove File"
					message="Are you sure you want to remove the selected file "
					entityName={file ? file.name : ""}
					isProcessing={isDeleting}
					confirmText="Remove"
					cancelText="Cancel"
				/>
			</Box>
		</ThemeProvider>
	);
}
