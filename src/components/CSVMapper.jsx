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
  Select,
  MenuItem,
  Button,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Slide,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import ButtonCustom from "./ButtonCustom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme/theme";
import OutlinedButton from "./button/OutlinedButton";

//  Function to get login details from localStorage with fallback
const getLoginDetails = () => {
  // Default values as specified
  let defaultDetails = {
    username: "mahendra-shah",
    currentDateTime: "2025-04-03 06:25:18",
  };

  try {
    // Get user data from localStorage
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData?.username || userData?.name || userData?.email) {
        defaultDetails.name = userData.name || userData.username || userData.email;
      }
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }

  return defaultDetails;
};

// Get login details
const loginDetails = getLoginDetails();

export default function CSVMapper({
  file,
  onMappingComplete,
  entityType = "school",
  mapping,
  setMapping,
  csvData,
  setCsvData,
}) {
  //   const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  //   const [mapping, setMapping] = useState({});
  const [systemFields, setSystemFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [editingErrors, setEditingErrors] = useState({});
  const [addingNewRow, setAddingNewRow] = useState(false);
  const [newRowValues, setNewRowValues] = useState({});
  const [newRowErrors, setNewRowErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // New states for improved deletion
  const [deletingRowIndex, setDeletingRowIndex] = useState(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [deletedRow, setDeletedRow] = useState(null);
  const [deletedRowIndex, setDeletedRowIndex] = useState(null);

  // At the top of your component, add these states:
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [snackbarAction, setSnackbarAction] = useState(null);

  // Add this function to show notifications consistently
  const showNotification = (message, severity = "info", action = null) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarAction(action);
    setSnackbarOpen(true);
  };

  // Load system fields based on entity type
  useEffect(() => {
    // These would ideally come from an API endpoint
    if (entityType === "school") {
      setSystemFields([
        { id: "schoolName", label: "School Name", required: true },
        { id: "udiseCode", label: "UDISE Code", required: true },
        { id: "clusterName", label: "Cluster Name", required: true },
        { id: "blockName", label: "Block Name", required: true },
        { id: "address", label: "Address", required: false },
        { id: "pincode", label: "Pincode", required: false },
        { id: "district", label: "District", required: false },
        { id: "state", label: "State", required: false },
      ]);
    } else if (entityType === "student") {
      // Future use for student upload
      setSystemFields([
        { id: "studentName", label: "Student Name", required: true },
        { id: "enrollmentId", label: "Enrollment ID", required: true },
        { id: "grade", label: "Grade", required: true },
        { id: "schoolId", label: "School ID", required: true },
        // Add more student fields as needed
      ]);
    }
  }, [entityType]);

  // Parse CSV file when it's selected - load ALL rows
  useEffect(() => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const rows = content.split("\n");

      //  Parse headers (first row)
      const headerRow = rows[0].split(",").map((h) => h.trim());
      setHeaders(headerRow);

      // Create initial mapping - attempt to match headers to system fields
      const initialMapping = {};
      headerRow.forEach((header) => {
        // Try to find a matching system field by normalizing and comparing the names
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchedField = systemFields.find((field) => {
          const normalizedField = field.label.toLowerCase().replace(/[^a-z0-9]/g, "");
          return (
            normalizedField === normalizedHeader ||
            normalizedField.includes(normalizedHeader) ||
            normalizedHeader.includes(normalizedField)
          );
        });

        if (matchedField) {
          initialMapping[header] = matchedField.id;
        }
      });
      setMapping(initialMapping);

      // Parse ALL data rows
      const dataRows = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim()) {
          const rowData = rows[i].split(",").map((cell) => cell.trim());
          const rowObj = {};
          headerRow.forEach((header, index) => {
            rowObj[header] = rowData[index] || "";
          });
          dataRows.push(rowObj);
        }
      }

      setCsvData(dataRows);
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, [file, systemFields]);

  // Update a single field mapping
  const handleMappingChange = (csvHeader, systemFieldId) => {
    setMapping((prev) => ({
      ...prev,
      [csvHeader]: systemFieldId,
    }));

    // Clear error message when user updates mapping
    if (showError) {
      setShowError(false);
    }
  };

  // Check if all required fields are mapped
  const areAllRequiredFieldsMapped = () => {
    const requiredFieldIds = systemFields
      .filter((field) => field.required)
      .map((field) => field.id);

    const mappedFieldIds = Object.values(mapping).filter(Boolean);

    return requiredFieldIds.every((fieldId) => mappedFieldIds.includes(fieldId));
  };

  // Get missing required fields
  const getMissingRequiredFields = () => {
    const requiredFieldIds = systemFields
      .filter((field) => field.required)
      .map((field) => field.id);

    const mappedFieldIds = Object.values(mapping).filter(Boolean);

    return systemFields
      .filter((field) => field.required && !mappedFieldIds.includes(field.id))
      .map((field) => field.label);
  };

  // Handle button click when disabled
  const handleDisabledButtonClick = () => {
    const missingFields = getMissingRequiredFields();
    setErrorMessage(`Missing required fields: ${missingFields.join(", ")}`);
    setShowError(true);
  };

  // Complete mapping and pass data back to parent
  const completeMapping = () => {
    if (areAllRequiredFieldsMapped()) {
      // Include the edited data in the mapping completion
      onMappingComplete(mapping, csvData);
    } else {
      const missingFields = getMissingRequiredFields();
      setErrorMessage(`Missing required fields: ${missingFields.join(", ")}`);
      setShowError(true);
    }
  };

  // Validate a single row against required fields
  const validateRow = (rowData) => {
    const errors = {};
    let hasError = false;

    // Check each required field based on mapping
    Object.entries(mapping).forEach(([csvHeader, systemFieldId]) => {
      const field = systemFields.find((f) => f.id === systemFieldId);
      if (field && field.required && (!rowData[csvHeader] || rowData[csvHeader].trim() === "")) {
        errors[csvHeader] = `${field.label} is required`;
        hasError = true;
      }
    });

    return { errors, isValid: !hasError };
  };

  // Start editing a row
  const startEditRow = (index) => {
    setEditingRowIndex(index);
    setEditingValues({ ...csvData[index] });
    setEditingErrors({});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingRowIndex(null);
    setEditingValues({});
    setEditingErrors({});
  };

  // Save edited row
  const saveEditedRow = () => {
    // Validate data before saving
    const { errors, isValid } = validateRow(editingValues);

    if (!isValid) {
      setEditingErrors(errors);
      showNotification("Please fill all required fields", "error");
      return;
    }

    const newData = [...csvData];
    newData[editingRowIndex] = { ...editingValues };
    setCsvData(newData);
    setEditingRowIndex(null);
    setEditingValues({});
    setEditingErrors({});
    // toast.success("Row updated successfully");
    showNotification("Row updated successfully", "success");
  };

  // Handle changes in editing values
  const handleEditChange = (header, value) => {
    setEditingValues((prev) => ({
      ...prev,
      [header]: value,
    }));

    // Clear error for this field if it exists
    if (editingErrors[header]) {
      setEditingErrors((prev) => {
        const updated = { ...prev };
        delete updated[header];
        return updated;
      });
    }
  };

  // Add new row
  const startAddRow = () => {
    const emptyRow = {};
    headers.forEach((header) => {
      emptyRow[header] = "";
    });
    setNewRowValues(emptyRow);
    setNewRowErrors({});
    setAddingNewRow(true);
  };

  // Cancel adding new row
  const cancelAddRow = () => {
    setAddingNewRow(false);
    setNewRowValues({});
    setNewRowErrors({});
  };

  // Save new row
  // Save new row
  const saveNewRow = () => {
    // Validate data before saving
    const { errors, isValid } = validateRow(newRowValues);

    if (!isValid) {
      setNewRowErrors(errors);
      showNotification("Please fill all required fields", "error");
      return;
    }

    const newData = [...csvData, { ...newRowValues }];
    setCsvData(newData);
    setAddingNewRow(false);
    setNewRowValues({});
    setNewRowErrors({});
    showNotification("New row added successfully", "success");
  };

  // Handle changes in new row values
  const handleNewRowChange = (header, value) => {
    setNewRowValues((prev) => ({
      ...prev,
      [header]: value,
    }));

    // Clear error for this field if it exists
    if (newRowErrors[header]) {
      setNewRowErrors((prev) => {
        const updated = { ...prev };
        delete updated[header];
        return updated;
      });
    }
  };

  // Improved delete row with animation
  const deleteRow = (index) => {
    // Set the row as being deleted to trigger animation
    setDeletingRowIndex(index);

    // Store the row for potential undo
    setDeletedRow(csvData[index]);
    setDeletedRowIndex(index);

    // Use setTimeout to allow animation to complete before removing from data
    setTimeout(() => {
      const newData = [...csvData];
      newData.splice(index, 1);
      setCsvData(newData);
      setDeletingRowIndex(null);
      setShowUndoSnackbar(true);

      // Show notification with Undo button
      showNotification(
        `Row deleted by ${loginDetails.name}`,
        "info"
        // <Button color="inherit" size="small" onClick={handleUndo}>
        // 	UNDO
        // </Button>
      );
      // Log deletion with user info
      console.log(`Row deleted by ${loginDetails.name} at ${loginDetails.currentDateTime}`);
    }, 500); // 500ms for the animation to complete
  };

  // Handle undo of deletion
  const handleUndo = () => {
    if (deletedRow && deletedRowIndex !== null) {
      const newData = [...csvData];
      // Insert the deleted row back at its original position or at the end if index is out of bounds
      if (deletedRowIndex >= newData.length) {
        newData.push(deletedRow);
      } else {
        newData.splice(deletedRowIndex, 0, deletedRow);
      }
      setCsvData(newData);
      toast.info("Deletion undone");
    }
    setShowUndoSnackbar(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress size={24} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Processing CSV file...
        </Typography>
      </Box>
    );
  }

  // Check if button should be disabled
  const isButtonDisabled = !areAllRequiredFieldsMapped();

  // Determine which fields are already mapped and which are unmapped
  const unmappedRequiredFieldLabels = getMissingRequiredFields();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3, mb: 3 }}>
        {/* Mapping Configuration at the top */}

        {/* Left Side: Required Fields Status */}
        <Box
          sx={{
            flex: 1,
            minWidth: 300,
            mb: { xs: 2, md: 0 },
            backgroundColor: "#EAEDED",
            borderRadius: 2,
            height: 56,
            display: "flex",
            alignItems: "center",
            px: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 0,
              fontSize: "16px",
              color: "#2F4F4F",
              width: "100%",
              fontFamily: "Work Sans",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {(() => {
              const requiredFields = systemFields.filter((f) => f.required);
              const mappedFieldIds = Object.values(mapping).filter(Boolean);
              const mappedRequired = requiredFields.filter((f) => mappedFieldIds.includes(f.id));
              const missingFields = requiredFields.filter((f) => !mappedFieldIds.includes(f.id));
              return (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: "16px",
                      color: "#2F4F4F",
                      width: "100%",
                      fontFamily: "Work Sans",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Required Fields Mapped:</span>
                    <span style={{ fontWeight: 400, margin: "0 4px" }}>
                      {mappedRequired.length} of {requiredFields.length}
                    </span>
                    {missingFields.length > 0 && (
                      <span style={{ fontWeight: 600 }}>
                        . Missing:
                        <span style={{ fontWeight: 400, marginLeft: 4 }}>
                          {missingFields.map((f) => f.label).join(", ")}
                        </span>
                      </span>
                    )}
                  </Typography>
                </>
              );
            })()}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "#2F4F4F",
            fontFamily: "Work Sans",
            fontWeight: 400,
            fontSize: "15px",
            borderRadius: 1,
            px: 2,
            py: 1,
            mt: 3,
          }}
        >
          Match your CSV columns to our System Fields. All fields marked with a <b>*</b> must be
          mapped. The "Data Preview" column shows the first data entry from your file for that CSV
          column.
        </Typography>
        {/* Data Preview with full width */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
            ></Box>

            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <b>Your CSV Column Header</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Map to System Field</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Data Preview (from your file)</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {headers.map((header) => (
                    <TableRow
                      key={`preview-header-${header}`}
                      sx={{
                        borderBottom: "none",
                        "& > *": { borderBottom: "none" },
                        height: 56, // gap between rows
                      }}
                    >
                      {/* 1. CSV Column Header */}
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={400}
                          fontFamily="Work Sans"
                          fontSize="14px"
                          color="#2F4F4F"
                        >
                          {header}
                        </Typography>
                      </TableCell>
                      {/* 2. Dropdown */}
                      <TableCell align="center">
                        <FormControl fullWidth size="small">
                          <Select
                            value={mapping[header] || ""}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            displayEmpty
                            size="small"
                            sx={{
                              minWidth: 150,
                              fontSize: "0.85rem",
                              "& .MuiSelect-select": {
                                padding: "6px 32px 6px 12px",
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  "& .MuiMenuItem-root": {
                                    fontSize: "0.85rem",
                                    minHeight: "32px",
                                    padding: "6px 16px",
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
                              <em>Skip</em>
                            </MenuItem>
                            {systemFields.map((field) => (
                              <MenuItem
                                key={`field-${field.id}`}
                                value={field.id}
                                sx={{ fontSize: "0.85rem" }}
                              >
                                {field.label} {field.required ? "*" : ""}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      {/* 3. Data Preview (first row only) */}
                      <TableCell align="center">
                        <Typography
                          fontFamily="Work Sans"
                          fontWeight={400}
                          fontStyle="italic"
                          fontSize="14px"
                          color="#597272"
                        >
                          {csvData[0]?.[header] || ""}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Undo Snackbar */}
        {/* <Snackbar
					open={showUndoSnackbar}
					autoHideDuration={6000}
					onClose={() => setShowUndoSnackbar(false)}
					TransitionComponent={Slide}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				>
					<MuiAlert
						elevation={6}
						variant="filled"
						severity="info"
						action={
							<Button color="inherit" size="small" onClick={handleUndo}>
								UNDO
							</Button>
						}
						onClose={() => setShowUndoSnackbar(false)}
					>
						Row deleted by {loginDetails.name}
					</MuiAlert>
				</Snackbar> */}

        {/* Snackbar for all notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            action={snackbarAction}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
