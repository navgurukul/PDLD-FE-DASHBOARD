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
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Card,
  CardContent,
  Pagination,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "./ButtonCustom";
import apiInstance from "../../api";
import { toast } from "react-toastify";
import Modal from "@mui/material/Modal";
import CSVMapper from "./CSVMapper";
import SampleCSVModal from "./SampleCSVModal";
import OutlinedButton from "./button/OutlinedButton";
import { styled } from "@mui/material/styles";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import CheckIcon from "@mui/icons-material/Check";
import FileDownloadSvg from "../assets/file_download.svg";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  palette: {
    primary: {
      main: "#2F4F4F",
    },
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

// Enhanced Error Details Dialog Component
const ErrorDetailsDialog = ({ open, onClose, errorData, headers }) => {
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const rowsPerPage = 5;

  // Group errors by reason if available
  const errorTypes = {};
  errorData.forEach((row) => {
    if (row.reason) {
      const errorType = row.reason.startsWith("Duplicate") ? "Duplicate" : "Validation";
      errorTypes[errorType] = errorTypes[errorType] || [];
      errorTypes[errorType].push(row);
    } else {
      errorTypes["General"] = errorTypes["General"] || [];
      errorTypes["General"].push(row);
    }
  });

  const errorCategories = Object.keys(errorTypes);

  // Filter data based on selected tab
  const filteredData = tabValue === 0 ? errorData : errorTypes[errorCategories[tabValue - 1]] || [];

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Get current page data
  const currentData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const downloadErrorsCSV = () => {
    // Create CSV content
    let csvContent = headers.join(",") + "\n";

    const dataToExport = tabValue === 0 ? errorData : filteredData;

    dataToExport.forEach((row) => {
      const values = headers.map((header) => {
        // Handle values that contain commas or quotes
        const value = row[header] || "";
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(",") + "\n";
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // link.setAttribute(
    //   "download",
    //   `error_rows_${loginDetails.name}_${new Date().toISOString().slice(0, 10)}.csv`
    // );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Error data downloaded as CSV");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ zIndex: 13010 }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          zIndex: 13010,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              Records with Errors
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {errorData.length} records could not be processed due to errors. Review and fix these
            issues.
          </Typography>

          {/* Tabs for filtering errors by type */}
          {errorCategories.length > 1 && (
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label={`All Errors (${errorData.length})`} />
                {errorCategories.map((category, index) => (
                  <Tab
                    key={`error-tab-${index}`}
                    label={`${category} (${errorTypes[category].length})`}
                  />
                ))}
              </Tabs>
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell width="60">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Row
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      School Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      UDISE Code
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Block Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Cluster Name
                    </Typography>
                  </TableCell>
                  <TableCell width="250">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Error Reason
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row, index) => (
                  <TableRow
                    key={`error-row-${index}`}
                    sx={{
                      backgroundColor: alpha("#f44336", 0.03),
                      "& td": {
                        borderBottom: "none",
                      },
                      height: 60,
                      "& > *": { py: 2 },
                    }}
                  >
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.schoolName || ""}</TableCell>
                    <TableCell>{row.udiseCode || ""}</TableCell>
                    <TableCell>{row.blockName || ""}</TableCell>
                    <TableCell>{row.clusterName || ""}</TableCell>
                    <TableCell>
                      <Tooltip title={row.reason || "Unknown error"}>
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {row.reason || "Unknown error"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {currentData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No errors to display
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            )}

            <Typography variant="caption" color="text.secondary">
              Showing {Math.min(filteredData.length, (page - 1) * rowsPerPage + 1)}-
              {Math.min(filteredData.length, page * rowsPerPage)} of {filteredData.length} errors
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>

        {/* <ButtonCustom
          text={"Download Errors CSV"}
          imageName={<FileDownloadIcon />}
          onClick={downloadErrorsCSV}
        /> */}
      </DialogActions>
    </Dialog>
  );
};

// Custom Step Icon for 01, 02, 03
function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  const label = icon < 10 ? `0${icon}` : icon;
  if (completed) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#2F4F4F",
          border: "2px solid #2F4F4F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon sx={{ color: "#fff", fontSize: 20 }} />
      </Box>
    );
  }
  // Active step: only border, no bg, dark text
  if (active) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: "2px solid #2F4F4F",
          color: "#2F4F4F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "16px",
          fontFamily: "Work Sans",
        }}
      >
        {label}
      </Box>
    );
  }

  // Inactive steps: only border, no bg, grey border/text
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "transparent",
        border: "2px solid #829595",
        color: "#829595",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: "16px",
        fontFamily: "Work Sans",
      }}
    >
      {label}
    </Box>
  );
}

// Custom Connector (thicker line)
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#829595",
    borderTopWidth: 8,
    borderRadius: 1,
    transition: "border-color 0.3s",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: "#2F4F4F",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: "#2F4F4F",
  },
}));

export default function BulkUploadSchools() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalUploadCount, setTotalUploadCount] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [mappingConfig, setMappingConfig] = useState(null);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [editedCsvData, setEditedCsvData] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorData, setErrorData] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [uploadDateTime, setUploadDateTime] = useState(null);
  const [mapping, setMapping] = useState({});
  const [csvData, setCsvData] = useState([]);

  const requiredFields = ["schoolName", "udiseCode", "clusterName", "blockName"];
  const isConfirmMappingDisabled = !requiredFields.every((field) =>
    Object.values(mapping).includes(field)
  );

  const handleConfirmMapping = () => {
    if (isConfirmMappingDisabled) {
      toast.error("Please map all required fields before proceeding.");
      return;
    }
    handleMappingComplete(mapping, csvData);
  };

  // Define steps for the upload process
  const steps = ["Upload CSV", "Map Columns", "Upload Data"];

  const openSampleCSVModal = () => {
    setSampleModalOpen(true);
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

      // Reset any previous upload results
      setUploadResult(null);
      setErrorData([]);

      // Move to column mapping step
      setActiveStep(1);
    }
  };

  const handleMappingComplete = (mapping, editedData) => {
    setMappingConfig(mapping);
    // If editedData is provided, update the data to be uploaded
    if (editedData) {
      setEditedCsvData(editedData);
      setTotalUploadCount(editedData.length);
    }
    setActiveStep(2);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    if (!mappingConfig) {
      toast.error("Please map CSV columns first");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    if (editedCsvData) {
      // Convert the edited data back to CSV format
      const headers = Object.keys(editedCsvData[0]).join(",");
      const rows = editedCsvData.map((row) =>
        Object.values(row)
          .map((val) => {
            // Handle values with commas or quotes
            if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      );
      const csvContent = [headers, ...rows].join("\n");

      // Create a new blob with the edited CSV data
      const csvBlob = new Blob([csvContent], { type: "text/csv" });
      formData.append("file", csvBlob, file.name);
    } else {
      formData.append("file", file);
    }

    formData.append("mapping", JSON.stringify(mappingConfig));

    try {
      // Make the actual API call with proper endpoint
      const response = await apiInstance.post("/admin/bulk/schools", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set the upload result
      setUploadResult(response.data);

      // Process error data from the actual API response (matching the specific format)
      if (response.data?.data?.errors?.length > 0) {
        setErrorData(response.data.data.errors);
      } else if (response.data?.errors?.length > 0) {
        setErrorData(response.data.errors);
      } else {
        // Clear error data if there are no errors
        setErrorData([]);
      }

      // Show success toast based on the actual response structure
      const successCount = response.data?.data?.successCount || 0;
      const totalCount = response.data?.data?.totalCount || totalUploadCount;
      const existingCount = totalCount - successCount - (response.data?.data?.errorCount || 0);

      if (successCount > 0) {
        toast.success(`Upload completed: ${successCount} schools added successfully`);
      } else if (existingCount > 0) {
        // toast.info(`All schools already exist in the database`);
        toast.info(`${existingCount} records already exist in the database`);
      } else {
        toast.warning(`Upload completed with no new schools added`);
      }
      if ((response.data?.data?.errorCount || 0) > 0) {
        toast.error(`${response.data.data.errorCount} records failed to upload`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "Error uploading file");

      // Check if the error response contains error rows in the expected format
      if (error.response?.data?.data?.errors?.length > 0) {
        setErrorData(error.response.data.data.errors);
      } else if (error.response?.data?.errors?.length > 0) {
        setErrorData(error.response.data.errors);
      } else {
        // If no structured errors are available, create a generic one
        setErrorData([
          {
            schoolName: "Error",
            udiseCode: "",
            blockName: "",
            clusterName: "",
            reason: error.response?.data?.message || "Failed to process upload",
          },
        ]);
      }

      // Set error result from API
      setUploadResult(error.response?.data || { error: "Upload failed" });
    } finally {
      setIsUploading(false);
      setUploadDateTime(new Date().toISOString());
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
      setMappingConfig(null);
      setEditedCsvData(null);
      setActiveStep(0);
      setUploadResult(null);
      setErrorData([]);

      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 500);
  };

  const confirmFileRemoval = () => {
    setDeleteModalOpen(true);
  };

  const handleBackStep = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const handleViewErrorData = () => {
    setErrorDialogOpen(true);
  };

  const handleDoneUpload = () => {
    // Reset everything and go back to step 1
    handleRemoveFile();
    navigate("/schools");
  };

  const handleUploadAnotherFile = () => {
    setActiveStep(0);
    setFile(null);
    setMappingConfig(null);
    setUploadResult(null);
    setErrorData([]);
    setEditedCsvData(null);
    setTotalUploadCount(0);
  };

  const handleDownloadFailedRecords = () => {
    if (!errorData || errorData.length === 0) {
      toast.error("No failed records to download.");
      return;
    }
    const headers = ["schoolName", "udiseCode", "blockName", "clusterName", "reason"];
    let csvContent = headers.join(",") + "\n";
    errorData.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] || "";
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "failed_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Failed records downloaded.");
  };

  const getUploadStatusColor = () => {
    if (!uploadResult) return "info";
    const totalCount = response.data?.data?.totalCount || totalUploadCount;
    const successCount = uploadResult?.data?.successCount || 0;
    const errorCount = errorData.length;

    if (errorCount === 0) return "success";
    if (successCount === 0) return "error";
    return "warning";
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, px: 2, maxWidth: "60%", margin: "0 auto" }}>
        <div className="flex justify-between">
          <h5 className="text-lg font-bold text-[#2F4F4F] mb-8">Bulk Upload Schools</h5>
        </div>

        {/* Add stepper to show current stage of the process */}

        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<CustomConnector />}
            sx={{ width: "100%", mb: 2 }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={CustomStepIcon}
                  sx={{
                    ".MuiStepLabel-label": {
                      mt: 1.5,
                      fontWeight: 600,
                      fontFamily: "Work Sans",
                      fontSize: "16px",
                      textAlign: "center",
                      width: "max-content",
                      mx: "auto",
                      color:
                        activeStep === index
                          ? "#2F4F4F"
                          : activeStep > index
                          ? "#2F4F4F"
                          : "#829595",
                    },
                  }}
                >
                  {/* Step name */}
                  <span
                    style={{
                      color:
                        activeStep === index
                          ? "#2F4F4F"
                          : activeStep > index
                          ? "#2F4F4F"
                          : "#829595",
                      fontWeight: 600,
                      fontFamily: "Work Sans",
                      fontSize: "14px",
                    }}
                  >
                    {label}
                  </span>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {activeStep === 0 && (
          <>
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  width: "100%",
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  mb: 0,
                  position: "relative", // For proper drag event handling
                  cursor: "pointer", // Show pointer cursor on the entire box
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#0d6efd",
                    backgroundColor: "rgba(13, 110, 253, 0.04)",
                  },
                }}
                onClick={() => fileInputRef.current && fileInputRef.current.click()} // Make entire box clickable
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.borderColor = "#0d6efd";
                  e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.08)";
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.borderColor = "#0d6efd";
                  e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.08)";
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.borderColor = "#ccc";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.borderColor = "#ccc";
                  e.currentTarget.style.backgroundColor = "transparent";

                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFile = e.dataTransfer.files[0];
                    // Check if the file is a CSV
                    if (droppedFile.name.endsWith(".csv")) {
                      // We'll create a synthetic event object that mimics the structure
                      // expected by the handleFileChange function
                      const syntheticEvent = {
                        target: {
                          files: [droppedFile],
                        },
                      };
                      handleFileChange(syntheticEvent);
                    } else {
                      toast.error("Please upload a CSV file");
                    }
                  }
                }}
              >
                <input
                  accept=".csv"
                  style={{ display: "none" }}
                  id="upload-file-button"
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />

                <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 7 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#2F4F4F" }} />
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
                  Select or drag and drop a CSV here
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Work Sans",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#2F4F4F",
                    textAlign: "center",
                    mb: 10,
                    display: "block",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>CSV Column Fields:</span>
                  <span style={{ fontWeight: 400, color: "#666", marginLeft: 4 }}>
                    The file should contain School Name, UDISE Code, Cluster Name, and Block Name.
                  </span>
                </Typography>
              </Box>
            </Box>

            {/* New Box: Download text + button */}
            <Box sx={{ width: "100%", mx: "auto", textAlign: "center", mt: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#2F4F4F",
                  mb: 2,
                  fontFamily: "Work Sans",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Download sample CSV for reference
              </Typography>
              <Button
                variant="outlined"
                startIcon={
                  <img
                    src={FileDownloadSvg}
                    alt="Download"
                    style={{
                      width: 22,
                      height: 22,
                      transition: "filter 0.2s",
                    }}
                    className="download-svg-icon"
                  />
                }
                onClick={openSampleCSVModal}
                sx={{
                  color: "#2F4F4F",
                  borderRadius: "8px",
                  border: "1px solid #2F4F4F",
                  textTransform: "none",
                  height: "44px",
                  fontWeight: 600,
                  fontFamily: "Work Sans",
                  fontSize: "18px",
                  "&:hover": {
                    backgroundColor: "#2F4F4F",
                    color: "white",
                    // Optionally, can invert the icon color on hover:
                    "& .download-svg-icon": {
                      filter: "invert(1)",
                    },
                  },
                }}
              >
                Sample CSV
              </Button>
            </Box>
          </>
        )}

        {activeStep === 1 && file && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.2,
                mb: 2,
                borderRadius: 1,
                backgroundColor: "#E0E0E0",
              }}
            >
              <Typography component="span">
                <span
                  style={{
                    fontWeight: 600,
                    fontFamily: "Work Sans",
                    fontSize: "14px",
                    color: "#2F4F4F",
                  }}
                >
                  File Uploaded:
                </span>
                <span
                  style={{
                    fontWeight: 400,
                    fontFamily: "Work Sans",
                    fontSize: "14px",
                    color: "#2F4F4F",
                    marginLeft: 6,
                  }}
                >
                  {file.name} {totalUploadCount > 0 && `(${totalUploadCount} rows)`}
                </span>
              </Typography>
              <IconButton
                onClick={confirmFileRemoval}
                size="small"
                sx={{
                  color: "#2F4F4F",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                    color: "#2F4F4F",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* CSV Mapper Component */}
            <CSVMapper
              file={file}
              onMappingComplete={handleMappingComplete}
              entityType="school"
              mapping={mapping}
              setMapping={setMapping}
              csvData={csvData}
              setCsvData={setCsvData}
            />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}
            >
              <Button
                variant="outlined"
                onClick={handleBackStep}
                sx={{
                  borderRadius: "8px",
                  height: "48px",
                  color: "#2F4F4F",
                  textTransform: "none",
                  fontWeight: 600,
                  fontFamily: "Work Sans",
                  fontSize: "18px",
                  "&:hover": {
                    backgroundColor: "#2F4F4F",
                    color: "#fff",
                    borderColor: "#2F4F4F",
                  },
                }}
              >
                {`< Back to Upload`}
              </Button>
              <ButtonCustom
                text="Proceed >"
                btnWidth="200"
                onClick={handleConfirmMapping}
                disabled={isConfirmMappingDisabled}
              />
            </Box>
          </Box>
        )}

        {activeStep === 2 && file && mappingConfig && (
          <Box sx={{ p: 2 }}>
            {uploadResult ? (
              // Enhanced Upload Results View
              <Box>
                <Box
                  sx={{
                    backgroundColor: "#EAEDED",
                    borderRadius: 2,
                    p: 3,
                    mb: 3,
                    mt: 2,
                    boxShadow: 0,
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#2F4F4F",
                      mb: 1,
                      fontFamily: "Work Sans",
                    }}
                  >
                    Upload Complete
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#2F4F4F",
                      fontFamily: "Work Sans",
                      fontWeight: 500,
                    }}
                  >
                    Processed {totalUploadCount} records from <b>{file?.name}</b>
                  </Typography>
                </Box>

                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 3,
                        mb: 3,
                        mt: 2,
                      }}
                    >
                      {/* Schools Uploaded Box */}

                      <Box
                        sx={{
                          flex: 1,
                          backgroundColor: "#E9F3E9",
                          borderRadius: 2,
                          p: 2,
                          minWidth: 120,
                          boxShadow: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {/* Custom CheckCircle SVG */}
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="20" fill="#228B22" />
                          <polyline
                            points="13,21 18,26 27,15"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{
                              color: "#228B22",
                              fontWeight: 700,
                              fontFamily: "Work Sans",
                              lineHeight: 1,
                              fontSize: 18,
                            }}
                          >
                            {uploadResult?.data?.successCount || 0}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: "#228B22",
                              fontWeight: 400,
                              fontFamily: "Work Sans",
                              fontSize: 12,
                            }}
                          >
                            Schools Uploaded
                          </Typography>
                        </Box>
                      </Box>
                      {/* Records Failed Box */}
                      <Box
                        sx={{
                          flex: 1,
                          backgroundColor: "#FDDCDC",
                          borderRadius: 2,
                          p: 2,
                          minWidth: 120,
                          boxShadow: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {/* Custom Warning SVG */}
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="20" fill="#F45050" />
                          <text
                            x="20"
                            y="27"
                            textAnchor="middle"
                            fontSize="28"
                            fontWeight="bold"
                            fill="#fff"
                            fontFamily="Arial"
                          >
                            !
                          </text>
                        </svg>
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{
                              color: "#F45050",
                              fontWeight: 700,
                              fontFamily: "Work Sans",
                              lineHeight: 1,
                              fontSize: 18,
                            }}
                          >
                            {uploadResult?.data?.errorCount || 0}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: "#F45050",
                              fontWeight: 400,
                              fontFamily: "Work Sans",
                              fontSize: 14,
                            }}
                          >
                            Records Failed
                          </Typography>
                        </Box>
                      </Box>
                      {errorData.length > 0 && (
                        <>
                          {/* <Divider orientation="vertical" flexItem />

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 150,
                              }}
                            >
                              <Button
                                onClick={handleViewErrorData}
                                startIcon={<ErrorOutlineIcon />}
                                color="error"
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: "8px", height: "48px" }}
                              >
                                View Errors
                              </Button>
                            </Box> */}
                        </>
                      )}
                    </Box>
                    {/* </Box> */}

                    {/* Display a small preview of errors if any */}
                    {errorData.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#fff",
                            borderRadius: 2,
                            p: 2,
                            minWidth: 120,
                            boxShadow: 0,
                            mt: 2,
                          }}
                        >
                          {/* Left: Unsuccessful Records */}
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: "#2F4F4F",
                              fontWeight: 600,
                              fontFamily: "Work Sans",
                              fontSize: "18px",
                              flex: 1,
                            }}
                          >
                            Unsuccessful Records
                          </Typography>

                          {/* Center: View all errors */}
                          {errorData.length > 3 && (
                            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                              <Button
                                variant="outlined"
                                onClick={handleViewErrorData}
                                startIcon={<InfoIcon />}
                                color="primary"
                                sx={{
                                  borderRadius: "8px",
                                  height: "auto",
                                  color: "#2F4F4F",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontFamily: "Work Sans",
                                  fontSize: "18px",
                                  whiteSpace: "nowrap",
                                  "&:hover": {
                                    backgroundColor: "#2F4F4F",
                                    color: "#fff",
                                    borderColor: "#2F4F4F",
                                    "& .MuiSvgIcon-root": {
                                      color: "#fff",
                                    },
                                  },
                                }}
                              >
                                View all {errorData.length} errors
                              </Button>
                            </Box>
                          )}

                          {/* Right: Download Failed Records */}
                          {errorData.length > 0 && (
                            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                              <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon sx={{ color: "inherit" }} />}
                                onClick={handleDownloadFailedRecords}
                                sx={{
                                  borderRadius: "8px",
                                  height: "auto",
                                  color: "#2F4F4F",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontFamily: "Work Sans",
                                  fontSize: "18px",
                                  whiteSpace: "nowrap",
                                  "&:hover": {
                                    backgroundColor: "#2F4F4F",
                                    color: "#fff",
                                    borderColor: "#2F4F4F",
                                    "& .MuiSvgIcon-root": {
                                      color: "#fff",
                                    },
                                  },
                                }}
                              >
                                Download Failed Records(.csv)
                              </Button>
                            </Box>
                          )}
                        </Box>

                        <TableContainer
                          component={Paper}
                          variant="outlined"
                          sx={{ maxHeight: 200, mb: 2 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell align="center" sx={{ py: 2 }}>
                                  {" "}
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Row No
                                  </Typography>
                                </TableCell>
                                <TableCell width="40%" sx={{ py: 2 }}>
                                  {" "}
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    School Name
                                  </Typography>
                                </TableCell>
                                {/* <TableCell width="20%">UDISE Code</TableCell> */}
                                <TableCell width="40%" sx={{ py: 2 }}>
                                  {" "}
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Error Reason
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {errorData.slice(0, 3).map((error, index) => (
                                <TableRow
                                  key={`preview-error-${index}`}
                                  sx={{ "& td": { borderBottom: "none", py: 1.5 } }}
                                >
                                  <TableCell align="center" sx={{ color: "#2F4F4F" }}>
                                    {error.rowIndex !== undefined
                                      ? error.rowIndex
                                      : error.rowNo !== undefined
                                      ? error.rowNo
                                      : ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.schoolName || ""}
                                  </TableCell>
                                  {/* <TableCell>{error.udiseCode || ""}</TableCell> */}
                                  <TableCell>
                                    <Tooltip title={error.reason || "Unknown error"}>
                                      <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: 200,
                                        }}
                                      >
                                        {error.reason || "Unknown error"}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {/* {errorData.length > 3 && (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    <Button
                                      size="small"
                                      onClick={handleViewErrorData}
                                      startIcon={<InfoIcon />}
                                    >
                                      View all {errorData.length} errors
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )} */}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          maxWidth: "100%",
                          mx: "auto",
                          mt: 3,
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={handleUploadAnotherFile}
                          startIcon={<FileUploadIcon sx={{ color: "inherit" }} />}
                          sx={{
                            borderRadius: "8px",
                            height: "48px",
                            color: "#2F4F4F",
                            textTransform: "none",
                            fontWeight: 600,
                            fontFamily: "Work Sans",
                            fontSize: "18px",
                            "&:hover": {
                              backgroundColor: "#2F4F4F",
                              color: "#fff",
                              borderColor: "#2F4F4F",
                              "& .MuiSvgIcon-root": {
                                color: "#fff",
                              },
                            },
                          }}
                        >
                          Upload Another File
                        </Button>
                        <ButtonCustom text="Go to School List >" onClick={handleDoneUpload} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              // Pre-upload view
              <Box
                sx={{
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ backgroundColor: "#EAEDED", borderRadius: 2, p: 2, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Confirm and Upload
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        fontFamily: "Work Sans",
                        color: "#2F4F4F",
                      }}
                    >
                      File: <span style={{ fontWeight: 400 }}>{file.name}</span>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#2F4F4F",
                        fontFamily: "Work Sans",
                      }}
                    >
                      Summary:{" "}
                      <span style={{ fontWeight: 400 }}>
                        <b>{totalUploadCount}</b> school record
                        {totalUploadCount !== 1 ? "s" : ""} will be processed based on the mappings
                        below.
                      </span>
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ mb: 3, fontFamily: "Work Sans", color: "#2F4F4F", fontSize: "18px" }}
                >
                  Column Mapping:
                </Typography>

                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontFamily: "Work Sans",
                              color: "#2F4F4F",
                              fontSize: "16px",
                            }}
                          >
                            Your CSV Column
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontFamily: "Work Sans",
                              color: "#2F4F4F",
                              fontSize: "16px",
                            }}
                          >
                            Mapped to System Field
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(mappingConfig).map(([csvColumn, systemField]) => (
                        <TableRow
                          key={`mapping-${csvColumn}`}
                          sx={{
                            height: 48,
                            "& td, & th": {
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Work Sans",
                                fontWeight: 400, // normal
                                color: "#2F4F4F",
                                fontSize: "15px",
                              }}
                            >
                              {csvColumn}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: "Work Sans",
                                fontWeight: 400, // normal
                                color: "#2F4F4F",
                                fontSize: "15px",
                              }}
                            >
                              {systemField}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackStep}
                    sx={{
                      borderRadius: "8px",
                      height: "48px",
                      color: "#2F4F4F",
                      textTransform: "none",
                      fontWeight: 600,
                      fontFamily: "Work Sans",
                      fontSize: "18px",
                      "&:hover": {
                        backgroundColor: "#2F4F4F",
                        color: "#fff",
                        borderColor: "#2F4F4F",
                      },
                    }}
                  >
                    {`< Back to Mapping`}
                  </Button>

                  <ButtonCustom
                    text={isUploading ? "Uploading..." : "Upload Schools "}
                    btnWidth="200"
                    onClick={handleUpload}
                    disabled={isUploading}
                  />
                </Box>

                {isUploading && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

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

        {/* Sample CSV Modal */}
        <SampleCSVModal
          open={sampleModalOpen}
          onClose={() => setSampleModalOpen(false)}
          entityType="school"
        />

        {/* Enhanced Error Details Dialog */}
        {errorData.length > 0 && (
          <ErrorDetailsDialog
            open={errorDialogOpen}
            onClose={() => setErrorDialogOpen(false)}
            errorData={errorData}
            headers={["schoolName", "udiseCode", "blockName", "clusterName"]}
          />
        )}
      </Box>
      <ToastContainer style={{ zIndex: 99999999 }} position="top-right" autoClose={4000} />
    </ThemeProvider>
  );
}
