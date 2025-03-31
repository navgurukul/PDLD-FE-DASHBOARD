import { useState, useRef, useEffect } from "react";
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
	CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "./ButtonCustom";
import apiInstance from "../../api";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "@mui/material/Modal";

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
		width: 450,
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
							textTransform: "none",
							fontSize: "16px",
							fontWeight: "600",
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
	const [totalUploadCount, setTotalUploadCount] = useState(0);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	const downloadSampleCSV = () => {
		// Google Drive file ID or direct download link
		const googleDriveFileUrl = "https://drive.google.com/file/d/1H-GyMkbQyt4Hv4dq5Ua7FjVB22hg7mmS/view?usp=sharing";

		// Open the Google Drive file URL in a new tab
		window.open(googleDriveFileUrl, "_blank");

		// Show success toast
		toast.success("Sample CSV download initiated");
	};

	const handleFileChange = (event) => {
		if (event.target.files && event.target.files[0]) {
			const selectedFile = event.target.files[0];
			setFile(selectedFile);

			// Count lines in the CSV file to determine total upload count
			const reader = new FileReader();
			reader.onload = function (e) {
				const content = e.target.result;
				const lines = content.split("\n").filter((line) => line.trim().length > 0);
				// Subtract 1 for the header row
				setTotalUploadCount(Math.max(0, lines.length - 1));
			};
			reader.readAsText(selectedFile);
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

			// Show success toast
			toast.success(`Upload completed: ${response.data.data.successCount} schools added successfully`);

			// Navigate to the summary page with the upload results
			navigate("/bulk-Upload-Summary", {
				state: {
					uploadResult: response.data,
					totalUploadCount: totalUploadCount,
				},
			});
		} catch (error) {
			console.error("Error uploading file:", error);
			toast.error(error.response?.data?.message || "Error uploading file");

			// Navigate to the summary page even if there are errors
			if (error.response?.data) {
				navigate("/upload-summary", {
					state: {
						uploadResult: error.response.data,
						totalUploadCount: totalUploadCount,
					},
				});
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveFile = () => {
		setIsDeleting(true);
		// Small timeout to show the removing state
		setTimeout(() => {
			setFile(null);
			setIsDeleting(false);
			setDeleteModalOpen(false);
			setTotalUploadCount(0);

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
				<div className="flex justify-between">
					<h5 className="text-lg font-bold text-[#2F4F4F]">Bulk Upload Schools</h5>
					<Button
						variant="outlined"
						startIcon={<GetAppIcon />}
						onClick={downloadSampleCSV}
						sx={{
							color: "#2F4F4F",
							borderRadius: "8px",
							border: "1px solid #2F4F4F",
							height: "44px",
							"&:hover": {
								backgroundColor: "#2F4F4F",
								color: "white",
							},
						}}
					>
						Sample csv
					</Button>
				</div>

				<Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
					Upload a CSV file with multiple schools to add them at once
				</Typography>

				<Box sx={{ p: 2 }}>
					<Box
						sx={{
							border: "2px dashed #ccc",
							borderRadius: 2,
							p: 4,
							textAlign: "center",
							mb: 1,
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
									<CloudUploadIcon sx={{ fontSize: 40, color: "#2F4F4F" }} />
								</Box>
							</label>
						</Box>

						<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
							{file
								? "File Selected - Click Upload to Continue"
								: "Click the Cloud Icon to Select a CSV File"}
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
							<Box textAlign="center">
								<Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
									CSV Format
								</Typography>
								<Typography variant="body2" sx={{ color: "#555" }}>
									Upload a CSV file with school data. The file should contain School Name, UDISE Code,
									Cluster Name, and Block Name.
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
									<Typography>
										{file.name} {totalUploadCount > 0 && `(${totalUploadCount} schools)`}
									</Typography>
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
				</Box>

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
