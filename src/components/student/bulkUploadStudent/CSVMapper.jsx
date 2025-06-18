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
  CircularProgress,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";

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

export default function StudentCSVMapper({ file, mapping, setMapping, csvData, setCsvData }) {
  const [headers, setHeaders] = useState([]);

  const [systemFields, setSystemFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
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
                        <span style={{ fontWeight: 600, marginLeft: 4, color: "#F45050" }}>
                          {missingFields.map((f) => f.label).join(", ")}
                        </span>
                      </span>
                    )}
                  </Typography>
                </>
              );
            })()}
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
          Match your CSV columns to our System Fields. All fields marked with a{" "}
          <span style={{ color: "#F45050", fontWeight: "bold" }}>*</span> must be mapped. The "Data
          Preview" column shows the first data entry from your file for that CSV column.
        </Typography>

        {/* Data Preview with full width */}

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
                          <em>Do not import</em>
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
                              {field.label}
                              {field.required && (
                                <span style={{ color: "#F45050", marginLeft: 2 }}>*</span>
                              )}
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
