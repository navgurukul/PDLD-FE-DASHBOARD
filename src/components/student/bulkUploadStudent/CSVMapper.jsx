import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	FormControl,
	MenuItem,
	Select,
	Button,
	Alert,
	Tabs,
	Tab,
	Chip,
	IconButton,
	Tooltip,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import { alpha } from "@mui/material/styles";
import ButtonCustom from "../../../components/ButtonCustom";

const CSVMapper = ({ file, onMappingComplete, entityType = "student", apiResponse = null }) => {
	const [csvData, setCsvData] = useState([]);
	const [csvHeaders, setCsvHeaders] = useState([]);
	const [mappingConfig, setMappingConfig] = useState({});
	const [previewData, setPreviewData] = useState([]);
	const [validationErrors, setValidationErrors] = useState([]);
	const [isValidating, setIsValidating] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState([]);
	const [isDataLoading, setIsDataLoading] = useState(true);
	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [selectedError, setSelectedError] = useState(null);
	const [apiErrors, setApiErrors] = useState([]);

	// System fields based on the provided CSV headers
	const systemFields = [
		{ value: "fullName", label: "Fullname", required: true },
		{ value: "fatherName", label: "Father Name", required: true },
		{ value: "motherName", label: "Mother Name", required: true },
		{ value: "dob", label: "Date of Birth", required: true },
		{ value: "class", label: "Class", required: true },
		{ value: "gender", label: "Gender", required: true },
		{ value: "schoolUdiseCode", label: "School UDISE Code", required: true },
		{ value: "aparId", label: "APAR ID", required: false },
		{ value: "hostel", label: "Hostel", required: false },
		{ value: "", label: "-- Skip Column --", required: false },
	];

	useEffect(() => {
		if (file) {
			setIsDataLoading(true);
			// Parse CSV file using FileReader
			const reader = new FileReader();

			reader.onload = (event) => {
				const text = event.target.result;
				// Process the CSV
				processCSV(text);
			};

			reader.onerror = (error) => {
				console.error("Error reading CSV file:", error);
				setIsDataLoading(false);
			};

			reader.readAsText(file);
		}
	}, [file]);

	// Process API response if it exists
	useEffect(() => {
		if (apiResponse && apiResponse.data && apiResponse.data.errors) {
			setApiErrors(apiResponse.data.errors);

			// If there are errors, switch to the errors tab
			if (apiResponse.data.errorCount > 0) {
				setActiveTab(2); // Assuming we'll add a new tab for errors
			}
		}
	}, [apiResponse]);

	// CSV parsing function
	const processCSV = (text) => {
		try {
			// Split the text by newline
			const lines = text.split(/\r\n|\n/);
			if (lines.length === 0) {
				setIsDataLoading(false);
				return;
			}

			// Parse headers (first line)
			const headerLine = lines[0];
			// Handle standard CSV format with potential quoted values
			const headers = parseCSVLine(headerLine);
			setCsvHeaders(headers);

			// Parse data rows
			const parsedData = [];
			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim() === "") continue; // Skip empty lines

				const values = parseCSVLine(lines[i]);
				const rowData = {};

				// Create object with headers as keys
				headers.forEach((header, index) => {
					// Attempt to convert numeric values
					let value = values[index] || "";
					if (!isNaN(value) && value !== "") {
						const num = parseFloat(value);
						if (Number.isFinite(num)) {
							value = num;
						}
					}
					rowData[header] = value;
				});

				parsedData.push(rowData);
			}

			setCsvData(parsedData);
			setPreviewData(parsedData.slice(0, 5));
			setEditedData(parsedData);

			// Create initial mapping based on header names
			const initialMapping = {};
			headers.forEach((header) => {
				// Try to match CSV headers with system fields
				const matchedField = systemFields.find(
					(field) =>
						field.label.toLowerCase() === header.toLowerCase() ||
						field.value.toLowerCase() === header.toLowerCase()
				);

				initialMapping[header] = matchedField ? matchedField.value : "";
			});

			setMappingConfig(initialMapping);
			setIsDataLoading(false);
		} catch (error) {
			console.error("Error processing CSV:", error);
			setIsDataLoading(false);
		}
	};

	// Handle CSV line parsing with respect to quoted fields
	const parseCSVLine = (line) => {
		const result = [];
		let currentField = "";
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
				inQuotes = !inQuotes;
			} else if (char === "," && !inQuotes) {
				result.push(currentField.trim());
				currentField = "";
			} else {
				currentField += char;
			}
		}

		// Add the last field
		result.push(currentField.trim());

		return result.map((field) => {
			// Remove surrounding quotes if they exist
			if (field.startsWith('"') && field.endsWith('"')) {
				return field.slice(1, -1).replace(/""/g, '"');
			}
			return field;
		});
	};

	const handleMappingChange = (csvHeader, systemField) => {
		setMappingConfig((prev) => ({
			...prev,
			[csvHeader]: systemField,
		}));
	};

	const validateMapping = () => {
		// Check if all required fields are mapped
		const errors = [];

		// Get all mapped system fields
		const mappedFields = Object.values(mappingConfig);

		// Check if all required system fields are mapped
		systemFields.forEach((field) => {
			if (field.required && !mappedFields.includes(field.value)) {
				errors.push(`Required field "${field.label}" is not mapped to any CSV column`);
			}
		});

		// Check if any field is mapped more than once (duplicate mappings)
		const fieldCounts = {};
		mappedFields.forEach((field) => {
			if (field && field !== "") {
				fieldCounts[field] = (fieldCounts[field] || 0) + 1;
			}
		});

		Object.entries(fieldCounts).forEach(([field, count]) => {
			if (count > 1) {
				const fieldLabel = systemFields.find((f) => f.value === field)?.label || field;
				errors.push(`Field "${fieldLabel}" is mapped to multiple columns`);
			}
		});

		return errors;
	};

	const handleSubmitMapping = () => {
		setIsValidating(true);

		// Validate the mapping
		const validationErrors = validateMapping();
		setValidationErrors(validationErrors);

		if (validationErrors.length === 0) {
			// If there are no validation errors, proceed
			onMappingComplete(mappingConfig, isEditing ? editedData : null);
		}

		setIsValidating(false);
	};

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const handleOpenErrorDetails = (error) => {
		setSelectedError(error);
		setShowErrorDialog(true);
	};

	const handleCloseErrorDialog = () => {
		setShowErrorDialog(false);
	};

	const toggleEditMode = () => {
		setIsEditing(!isEditing);
	};

	const handleCellEdit = (rowIndex, header, value) => {
		const updatedData = [...editedData];
		updatedData[rowIndex][header] = value;
		setEditedData(updatedData);
	};

	const getMappingStatus = () => {
		// Count mapped fields
		const mappedFieldsCount = Object.values(mappingConfig).filter((field) => field && field !== "").length;
		const totalRequiredFields = systemFields.filter((field) => field.required).length;

		// Check if all required fields are mapped
		const requiredFieldsMapped = systemFields
			.filter((field) => field.required)
			.every((field) => Object.values(mappingConfig).includes(field.value));

		if (mappedFieldsCount === 0) {
			return { status: "not_started", message: "No columns mapped yet" };
		} else if (!requiredFieldsMapped) {
			return {
				status: "incomplete",
				message: `${mappedFieldsCount} of ${totalRequiredFields} required fields mapped`,
			};
		} else {
			return { status: "complete", message: "All required fields mapped" };
		}
	};

	const mappingStatus = getMappingStatus();

	return (
		<Box>
			{isDataLoading ? (
				<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
					<CircularProgress size={40} />
					<Typography variant="body1" sx={{ ml: 2 }}>
						Processing CSV data...
					</Typography>
				</Box>
			) : (
				<>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
						<Typography variant="h6">Map CSV Columns to System Fields</Typography>

						<Box>
							<Chip
								icon={
									mappingStatus.status === "complete" ? (
										<CheckCircleIcon />
									) : mappingStatus.status === "incomplete" ? (
										<InfoIcon />
									) : (
										<ErrorIcon />
									)
								}
								label={mappingStatus.message}
								color={
									mappingStatus.status === "complete"
										? "success"
										: mappingStatus.status === "incomplete"
										? "info"
										: "error"
								}
								sx={{ mr: 2 }}
							/>
						</Box>
					</Box>

					{validationErrors.length > 0 && (
						<Alert severity="error" sx={{ mb: 2 }}>
							<Typography variant="subtitle2">Please fix the following errors:</Typography>
							<ul style={{ margin: 0, paddingLeft: 20 }}>
								{validationErrors.map((error, index) => (
									<li key={`error-${index}`}>{error}</li>
								))}
							</ul>
						</Alert>
					)}

					<Box sx={{ mb: 2 }}>
						<Tabs value={activeTab} onChange={handleTabChange}>
							<Tab label="Column Mapping" />
							<Tab label="Preview Data" />
							{apiErrors.length > 0 && (
								<Tab
									label={
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<ErrorIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
											Errors ({apiErrors.length})
										</Box>
									}
								/>
							)}
						</Tabs>
					</Box>

					{activeTab === 0 && (
						// Column Mapping Tab
						<TableContainer component={Paper} sx={{ mb: 3 }}>
							<Table size="small">
								<TableHead>
									<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
										<TableCell>CSV Column</TableCell>
										<TableCell>System Field</TableCell>
										<TableCell>Preview Values</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{csvHeaders.map((header, index) => (
										<TableRow key={`header-${index}`}>
											<TableCell width="30%">
												<Typography fontWeight="medium">{header}</Typography>
											</TableCell>
											<TableCell width="30%">
												<FormControl fullWidth size="small">
													<Select
														value={mappingConfig[header] || ""}
														onChange={(e) => handleMappingChange(header, e.target.value)}
														displayEmpty
													>
														{systemFields.map((field) => (
															<MenuItem key={`field-${field.value}`} value={field.value}>
																{field.label} {field.required && " *"}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											</TableCell>
											<TableCell>
												<Box
													sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}
												>
													{previewData.slice(0, 2).map((row, rowIndex) => (
														<Typography
															key={`preview-${header}-${rowIndex}`}
															variant="body2"
															sx={{
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
																color: "#666",
																"&:not(:last-child)": { mb: 0.5 },
															}}
														>
															{row[header] || "(empty)"}
														</Typography>
													))}
												</Box>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}

					{activeTab === 1 && (
						// Preview Data Tab
						<Box>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
								<Typography variant="subtitle1">
									Data Preview {isEditing ? "(Editing Mode)" : ""}
								</Typography>

								<Tooltip title={isEditing ? "Save changes" : "Edit data"}>
									<Button
										variant={isEditing ? "contained" : "outlined"}
										size="small"
										startIcon={<EditIcon />}
										onClick={toggleEditMode}
									>
										{isEditing ? "Finish Editing" : "Edit Data"}
									</Button>
								</Tooltip>
							</Box>

							<TableContainer component={Paper} sx={{ mb: 3, maxHeight: 400 }}>
								<Table size="small" stickyHeader>
									<TableHead>
										<TableRow>
											<TableCell width="60">Row</TableCell>
											{csvHeaders.map((header, index) => (
												<TableCell key={`header-preview-${index}`}>
													<Typography variant="subtitle2">{header}</Typography>
													{mappingConfig[header] && (
														<Typography variant="caption" color="primary">
															→{" "}
															{systemFields.find((f) => f.value === mappingConfig[header])
																?.label || mappingConfig[header]}
														</Typography>
													)}
												</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{(isEditing ? editedData : csvData).slice(0, 20).map((row, rowIndex) => (
											<TableRow
												key={`row-${rowIndex}`}
												sx={
													rowIndex % 2 === 0 ? { backgroundColor: alpha("#f5f5f5", 0.3) } : {}
												}
											>
												<TableCell>{rowIndex + 1}</TableCell>
												{csvHeaders.map((header, cellIndex) => (
													<TableCell key={`cell-${rowIndex}-${cellIndex}`}>
														{isEditing ? (
															<input
																type="text"
																value={row[header] || ""}
																onChange={(e) =>
																	handleCellEdit(rowIndex, header, e.target.value)
																}
																style={{
																	width: "100%",
																	padding: "4px",
																	border: "1px solid #ddd",
																	borderRadius: "4px",
																}}
															/>
														) : (
															row[header] || ""
														)}
													</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>

							{csvData.length > 20 && (
								<Typography variant="caption" color="text.secondary">
									Showing first 20 rows of {csvData.length} total rows
								</Typography>
							)}
						</Box>
					)}

					{activeTab === 2 && apiErrors.length > 0 && (
						// Errors Tab
						<Box>
							<Box sx={{ mb: 2 }}>
								<Alert severity="error">
									<Typography variant="subtitle2">
										There were {apiErrors.length} errors in your data upload. Please review the
										details below.
									</Typography>
								</Alert>
							</Box>

							<TableContainer component={Paper} sx={{ mb: 3, maxHeight: 400 }}>
								<Table size="small" stickyHeader>
									<TableHead>
										<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
											<TableCell width="80">Row</TableCell>
											<TableCell>Error Type</TableCell>
											<TableCell>Details</TableCell>
											<TableCell width="100">Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{apiErrors.map((error, index) => (
											<TableRow
												key={`error-${index}`}
												sx={{ backgroundColor: alpha("#ffebee", 0.3) }}
											>
												<TableCell>{error.row || "N/A"}</TableCell>
												<TableCell>
													{error.error && error.error.includes("Duplicate")
														? "Duplicate Entry"
														: error.error && error.error.includes("authorized")
														? "Authorization Error"
														: "Validation Error"}
												</TableCell>
												<TableCell>
													<Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>
														{error.error || "Unknown error"}
													</Typography>
												</TableCell>
												<TableCell>
													<Button
														size="small"
														variant="outlined"
														color="primary"
														onClick={() => handleOpenErrorDetails(error)}
													>
														View
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
					)}

					<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
						<ButtonCustom
							text={isValidating ? "Validating..." : "Continue"}
							onClick={handleSubmitMapping}
							disabled={isValidating || Object.keys(mappingConfig).length === 0}
							btnWidth="140"
						/>
					</Box>

					{/* Error Details Dialog */}
					<Dialog open={showErrorDialog} onClose={handleCloseErrorDialog} maxWidth="md" fullWidth>
						<DialogTitle sx={{ backgroundColor: "#f8f8f8" }}>
							<Typography variant="h6" component="div">
								Error Details - Row {selectedError?.row || "N/A"}
							</Typography>
						</DialogTitle>
						<DialogContent dividers>
							{selectedError && (
								<>
									<Box sx={{ mb: 3 }}>
										<Typography variant="subtitle1" color="error" gutterBottom>
											Error Message:
										</Typography>
										<Paper sx={{ p: 2, backgroundColor: alpha("#ffebee", 0.3) }}>
											<Typography variant="body2">
												{selectedError.error || "Unknown error"}
											</Typography>
										</Paper>
									</Box>

									{selectedError.data && (
										<Box>
											<Typography variant="subtitle1" gutterBottom>
												Row Data:
											</Typography>
											<TableContainer component={Paper} variant="outlined">
												<Table size="small">
													<TableHead>
														<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
															<TableCell width="30%">Field</TableCell>
															<TableCell>Value</TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{Object.entries(selectedError.data).map(([key, value], idx) => (
															<TableRow
																key={`detail-${idx}`}
																sx={
																	idx % 2 === 0
																		? { backgroundColor: alpha("#f5f5f5", 0.3) }
																		: {}
																}
															>
																<TableCell>
																	<Typography variant="body2" fontWeight="medium">
																		{key}
																	</Typography>
																</TableCell>
																<TableCell>
																	<Typography variant="body2">
																		{value !== null && value !== undefined
																			? value.toString()
																			: "(empty)"}
																	</Typography>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</TableContainer>
										</Box>
									)}
								</>
							)}
						</DialogContent>
						<DialogActions>
							<Button onClick={handleCloseErrorDialog}>Close</Button>
						</DialogActions>
					</Dialog>
				</>
			)}
		</Box>
	);
};

export default CSVMapper;
