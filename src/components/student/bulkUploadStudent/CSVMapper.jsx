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
import { toast, ToastContainer } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { addSymbolBtn, EditPencilIcon, trash } from "../../../utils/imagePath";
import ButtonCustom from "../../../components/ButtonCustom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import OutlinedButton from "../../../components/button/OutlinedButton";

// Function to get login details from localStorage with fallback
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

export default function StudentCSVMapper({ file, onMappingComplete }) {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
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

  // States for deletion functionality
  const [deletingRowIndex, setDeletingRowIndex] = useState(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [deletedRow, setDeletedRow] = useState(null);
  const [deletedRowIndex, setDeletedRowIndex] = useState(null);

  // At the top of your component, add these states:
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [snackbarAction, setSnackbarAction] = useState(null);

  // Set up student system fields
  useEffect(() => {
    // Updated with the correct required fields for student upload
    setSystemFields([
      { id: "fullName", label: "Full Name", required: true },
      { id: "fatherName", label: "Father Name", required: true },
      { id: "motherName", label: "Mother Name", required: true },
      { id: "dob", label: "DOB", required: false },
      { id: "class", label: "Class", required: true },
      { id: "gender", label: "Gender", required: true },
      // { id: "schoolUdiseCode", label: "School UDISE Code", required: true },
      { id: "aparId", label: "APAR ID", required: false },
      { id: "hostel", label: "Hostel", required: false },
      // Add any other fields that might be optional
    ]);
  }, []);

  // Validate a single row against required fields
  const validateRow = (rowData) => {
    // For partial edits, we should check only the fields that have been changed
    // or if we're creating a new row
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

	// Add this function to show notifications consistently
	const showNotification = (message, severity = "info", action = null) => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarAction(action);
		setSnackbarOpen(true);
	};

  // Parse CSV file when it's selected
  useEffect(() => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const rows = content.split("\n");

      // Parse headers (first row) with duplicate handling
      const headerRow = rows[0].split(",").map((h) => h.trim());

      // Create a map to track duplicate headers
      const headerCounts = {};
      const uniqueHeaders = [];

      // Process each header to identify duplicates
      headerRow.forEach((header) => {
        if (!headerCounts[header]) {
          headerCounts[header] = 1;
          uniqueHeaders.push(header);
        } else {
          // If duplicate, append a number to make it unique
          const newHeader = `${header} (${headerCounts[header]})`;
          headerCounts[header]++;
          uniqueHeaders.push(newHeader);
        }
      });

      // Use uniqueHeaders for the component state
      setHeaders(uniqueHeaders);

      // Create initial mapping - attempt to match headers to system fields
      const initialMapping = {};
      uniqueHeaders.forEach((header) => {
        // Get the base header name without any duplicate counter
        const baseHeader = header.includes(" (")
          ? header.substring(0, header.indexOf(" ("))
          : header;

        // Try to find a matching system field by normalizing and comparing the names
        const normalizedHeader = baseHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
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

      // Parse all data rows using the uniqueHeaders
      const dataRows = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim()) {
          const rowData = rows[i].split(",").map((cell) => cell.trim());
          const rowObj = {};

          // Handle potential mismatch in column count
          uniqueHeaders.forEach((header, index) => {
            rowObj[header] = index < rowData.length ? rowData[index] : "";
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

	// Save edited row with improved error handling
	const saveEditedRow = () => {
		try {
			// Get the existing data for this row
			const originalRow = csvData[editingRowIndex];

      // Create a merged version with just the edited fields
      const mergedData = { ...originalRow };

      // Only check fields that the user has actually modified
      const modifiedFields = {};
      let hasEmptyRequired = false;

      // Check edited fields
      Object.keys(editingValues).forEach((header) => {
        // Only consider fields that have been modified
        if (editingValues[header] !== originalRow[header]) {
          modifiedFields[header] = editingValues[header];

          // Check if it's a required field and is empty
          const systemFieldId = mapping[header];
          const field = systemFields.find((f) => f.id === systemFieldId);
          if (
            field &&
            field.required &&
            (!editingValues[header] || editingValues[header].trim() === "")
          ) {
            hasEmptyRequired = true;
            editingErrors[header] = `${field.label} is required`;
          }
        }
      });

      // If any of the modified required fields are empty, show error
      if (hasEmptyRequired) {
        setEditingErrors(editingErrors);
        showNotification("Please fill all required fields", "error");
        return;
      }

      // Merge changes with original row
      Object.assign(mergedData, editingValues);

      // Update the row
      const newData = [...csvData];
      newData[editingRowIndex] = mergedData;
      setCsvData(newData);
      setEditingRowIndex(null);
      setEditingValues({});
      setEditingErrors({});
      showNotification("Row updated successfully", "success");
    } catch (error) {
      console.error("Error saving edited row:", error);
      showNotification("Please fill all required fields", "error");
    }
  };

  // Similar pattern for saveNewRow

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
    showNotification("Row updated successfully", "success");
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

  // Delete row with animation and snackbar
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

  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
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
        <Box sx={{ mt: 3, mb: 3 }}>
          {/* Mapping Configuration at the top */}
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
              {" "}
              File: <span style={{ fontWeight: 400 }}>{file.name}</span>
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
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Student Data Preview and Editing
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Showing {csvData.length} rows
              </Typography>
            </Box>

            {/* Right side: Confirm button */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <ButtonCustom
                text={"Add Row"}
                onClick={startAddRow}
                disabled={addingNewRow}
                size="small"
                imageName={addSymbolBtn}
              />
              <OutlinedButton
                variant="contained"
                btnWidth={220}
                text={"Confirm Mapping"}
                onClick={isButtonDisabled ? handleDisabledButtonClick : completeMapping}
                disabled={isButtonDisabled}
                fullWidth
                sx={{
                  backgroundColor: isButtonDisabled ? "#cccccc" : "#0d6efd",
                  "&:hover": { backgroundColor: isButtonDisabled ? "#cccccc" : "#0b5ed7" },
                  "&.Mui-disabled": {
                    backgroundColor: "#cccccc",
                    color: "#666666",
                    cursor: "pointer", // Keep pointer cursor for disabled button
                    pointerEvents: "auto", // Allow clicks on disabled button
                  },
                }}
              />
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontFamily: "Work Sans",
                        color: "#2F4F4F",
                        fontSize: "16px",
                      }}
                    >
                      Your CSV Column Header
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontFamily: "Work Sans",
                        color: "#2F4F4F",
                        fontSize: "16px",
                      }}
                    >
                      Map to System Field
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontFamily: "Work Sans",
                        color: "#2F4F4F",
                        fontSize: "16px",
                      }}
                    >
                      Data Preview (from your file)
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {headers.map((header) => (
                  <TableRow
                    key={`preview-header-${header}`}
                    sx={{
                      height: 48,
                      "& td, & th": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {/* 1. CSV Column Header */}
                    <TableCell align="center">
                      <Typography
                        sx={{
                          fontFamily: "Work Sans",
                          fontWeight: 400,
                          fontSize: "15px",
                          color: "#2F4F4F",
                        }}
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
                          {systemFields
                            .filter(
                              (field) =>
                                !Object.entries(mapping).some(
                                  ([otherHeader, mappedId]) =>
                                    otherHeader !== header && mappedId === field.id
                                )
                            )
                            .map((field) => (
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
                        sx={{
                          fontFamily: "Work Sans",
                          fontWeight: 400,
                          fontStyle: "italic",
                          fontSize: "15px",
                          color: "#597272",
                        }}
                      >
                        {csvData[0]?.[header] || ""}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Snackbar for all notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
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
