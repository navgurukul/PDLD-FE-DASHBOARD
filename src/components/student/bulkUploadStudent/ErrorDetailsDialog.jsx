import  { useState } from "react";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Tooltip,
	Typography,
	Box,
	Tabs,
	Tab,
	TextField,
	InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

const StudentErrorDetailsDialog = ({ open, onClose, errorData }) => {
	const [activeTab, setActiveTab] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");

	// Define display headers (what shows in the UI table) - using only API response fields
	const displayHeaders = [
		{ id: "name", label: "Full Name" },
		{ id: "fatherName", label: "Father's Name" },
		{ id: "motherName", label: "Mother's Name" },
		{ id: "dob", label: "Date of Birth" },
		{ id: "class", label: "Grade" },
		{ id: "gender", label: "Gender" },
		{ id: "schoolUdiseCode", label: "School ID" },
		{ id: "aparID", label: "aparID" },
		{ id: "hostel", label: "Hostel" },
		{ id: "error", label: "Error" },
	];

	// Define all fields to include in CSV export - using only API response fields
	const csvHeaders = [
		{ id: "fullname", label: "Full Name" },
		{ id: "fatherName", label: "Father's Name" },
		{ id: "motherName", label: "Mother's Name" },
		{ id: "dob", label: "Date of Birth" },
		{ id: "class", label: "Grade" },
		{ id: "gender", label: "Gender" },
		{ id: "schoolUdiseCode", label: "School ID" },
		{ id: "aparID", label: "aparID" },
		{ id: "hostel", label: "Hostel" },
		{ id: "error", label: "Error" },
	];

	// Filter the error data based on search term
	const filteredErrors = errorData.filter((error) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			(error.name && error.name.toLowerCase().includes(searchLower)) ||
			(error.aparID && error.aparID.toLowerCase().includes(searchLower)) ||
			(error.error && error.error.toLowerCase().includes(searchLower))
		);
	});

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const downloadErrorsCSV = () => {
		// Create CSV header row
		const csvHeader = csvHeaders.map((header) => header.label).join(",");

		// Create CSV rows from filtered data
		const csvRows = filteredErrors.map((error) => {
			return csvHeaders
				.map((header) => {
					let value = error[header.id] !== undefined ? error[header.id] : "";

					// Handle commas and quotes in CSV properly
					if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value;
				})
				.join(",");
		});

		// Combine header and rows
		const csvContent = [csvHeader, ...csvRows].join("\n");

		// Create blob and download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "student_upload_errors.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">Error Details ({filteredErrors.length} errors)</Typography>
					<IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
				<Tabs value={activeTab} onChange={handleTabChange} aria-label="error view tabs">
					<Tab label="View Errors" />
					{/* <Tab label="Raw Data" /> */}
				</Tabs>
			</Box>

			<Box sx={{ px: 3, pt: 2, pb: 1 }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
					<TextField
						placeholder="Search..."
						variant="outlined"
						size="small"
						value={searchTerm}
						onChange={handleSearchChange}
						sx={{ width: 300 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>

					{/* <Button
						variant="outlined"
						startIcon={<GetAppIcon />}
						onClick={downloadErrorsCSV}
						sx={{ borderRadius: "8px", height: "40px" }}
					>
						Download Errors as CSV
					</Button> */}
				</Box>

				<Box sx={{ mb: 1 }}>
					<Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
						<InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
						{searchTerm
							? `Showing ${filteredErrors.length} of ${errorData.length} errors`
							: `Showing all ${errorData.length} errors`}
					</Typography>
				</Box>
			</Box>

			<DialogContent sx={{ pt: 0 }}>
				{activeTab === 0 && (
					<TableContainer component={Paper} sx={{ maxHeight: 400 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
									{displayHeaders.map((header) => (
										<TableCell key={header.id} sx={{ fontWeight: "bold" }}>
											{header.label}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredErrors.length > 0 ? (
									filteredErrors.map((error, index) => (
										<TableRow key={`error-row-${index}`} hover>
											{displayHeaders.map((header) => (
												<TableCell key={`${index}-${header.id}`}>
													{header.id === "class" ? (
														error[header.id] ? (
															`Class ${error[header.id]}`
														) : (
															""
														)
													) : header.id === "error" ? (
														<Tooltip title={error[header.id] || ""}>
															<Typography
																variant="body2"
																sx={{
																	whiteSpace: "nowrap",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	maxWidth: 300,
																	color: "error.main",
																}}
															>
																{error[header.id] || ""}
															</Typography>
														</Tooltip>
													) : (
														error[header.id] || ""
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={displayHeaders.length} align="center">
											No errors found matching your search.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{activeTab === 1 && (
					<TableContainer component={Paper} sx={{ maxHeight: 400 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
									{csvHeaders.map((header) => (
										<TableCell key={header.id} sx={{ fontWeight: "bold" }}>
											{header.label}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredErrors.length > 0 ? (
									filteredErrors.map((error, index) => (
										<TableRow key={`raw-error-row-${index}`} hover>
											{csvHeaders.map((header) => (
												<TableCell key={`raw-${index}-${header.id}`}>
													{header.id === "class"
														? error[header.id]
															? `Class ${error[header.id]}`
															: ""
														: error[header.id] || ""}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={csvHeaders.length} align="center">
											No errors found matching your search.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} color="primary">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default StudentErrorDetailsDialog;
