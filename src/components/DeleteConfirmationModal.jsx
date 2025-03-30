import { Modal, Box, Typography, Button } from "@mui/material";
import ButtonCustom from "./ButtonCustom";

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
	confirmButtonColor = "error", // Default to error/red for delete actions
	icon,
	selectedFile,
	onRemoveFile,
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

				{/* File Display Section (if applicable) */}
				{selectedFile && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 3,
							p: 1.5,
							backgroundColor: "#f8f9fa",
							borderRadius: 1,
							border: "1px solid #e9ecef",
						}}
					>
						<Typography
							variant="body2"
							sx={{
								color: "#2F4F4F",
								maxWidth: "70%",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{selectedFile.name}
						</Typography>
						
						<Button
							variant="text"
							size="small"
							onClick={onRemoveFile}
							disabled={isProcessing}
							sx={{ color: "#d32f2f", fontSize: "0.75rem" }}
						>
							Remove
						</Button>
					</Box>
				)}

				<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
					<Button
						variant="outlined"
						onClick={onClose}
						disabled={isProcessing}
						sx={{
							borderRadius: "8px",
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
						text={isProcessing ? "Deleting..." : confirmText}
						onClick={onConfirm}
						disabled={isProcessing}
						customStyle={{
							backgroundColor: confirmButtonColor === "error" ? "#d32f2f" : "#0d6efd",
							color: "white",
							"&:hover": {
								backgroundColor: confirmButtonColor === "error" ? "#b71c1c" : "#0b5ed7",
							},
						}}
					/>
				</Box>
			</Box>
		</Modal>
	);
};

export default DeleteConfirmationModal;