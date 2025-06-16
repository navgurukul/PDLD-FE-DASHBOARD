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
  Card,
  CardContent,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme/theme";

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
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <ThemeProvider theme={theme}>
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
                        <span style={{ fontWeight: 400, marginLeft: 4, color: "#F45050" }}>
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
          Match your CSV columns to our System Fields. All fields marked with a{" "}
          <span style={{ color: "#F45050", fontWeight: "bold" }}>*</span> must be mapped. The "Data
          Preview" column shows the first data entry from your file for that CSV column.
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
                            {systemFields
                              .filter(
                                (field) =>
                                  // Show if not already mapped OR is the current value for this header
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
                      {/* 3.  Data Preview (first row only) */}
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
