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
  Alert,
  Divider,
  Chip,
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
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "./ButtonCustom";
import apiInstance from "../../api";
import { toast } from "react-toastify";
import Modal from "@mui/material/Modal";
import CSVMapper from "./CSVMapper";
import SampleCSVModal from "./SampleCSVModal";

// Function to get login details from localStorage with fallback
const getLoginDetails = () => {
  // Default values as specified
  let defaultDetails = {
    username: "mahendra-shah",
    currentDateTime: "2025-04-03 06:25:18"
  };
  
  try {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('userData');
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

// Enhanced Error Details Dialog Component
const ErrorDetailsDialog = ({ open, onClose, errorData, headers }) => {
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const rowsPerPage = 5;
  
  // Group errors by reason if available
  const errorTypes = {};
  errorData.forEach(row => {
    if (row.reason) {
      const errorType = row.reason.startsWith("Duplicate") ? "Duplicate" : "Validation";
      errorTypes[errorType] = errorTypes[errorType] || [];
      errorTypes[errorType].push(row);
    } else {
      errorTypes['General'] = errorTypes['General'] || [];
      errorTypes['General'].push(row);
    }
  });

  const errorCategories = Object.keys(errorTypes);
  
  // Filter data based on selected tab
  const filteredData = tabValue === 0 
    ? errorData 
    : errorTypes[errorCategories[tabValue - 1]] || [];
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  
  // Get current page data
  const currentData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
    
    dataToExport.forEach(row => {
      const values = headers.map(header => {
        // Handle values that contain commas or quotes
        const value = row[header] || "";
        if (typeof value === 'string' && (value.includes(",") || value.includes("\""))) {
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
    link.setAttribute("download", `error_rows_${loginDetails.name}_${new Date().toISOString().slice(0,10)}.csv`);
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
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            {errorData.length} record(s) could not be processed due to errors. Review and fix these issues.
          </Typography>
          
          {/* Tabs for filtering errors by type */}
          {errorCategories.length > 1 && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
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
                    <Typography variant="subtitle2">Row</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">School Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">UDISE Code</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Block Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Cluster Name</Typography>
                  </TableCell>
                  <TableCell width="250">
                    <Typography variant="subtitle2">Error Reason</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((row, index) => (
                  <TableRow 
                    key={`error-row-${index}`}
                    sx={{ backgroundColor: alpha('#f44336', 0.03) }}
                  >
                    <TableCell>
                      {(page - 1) * rowsPerPage + index + 1}
                    </TableCell>
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
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Close
        </Button>
        
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={downloadErrorsCSV}
          color="primary"
        >
          Download Errors CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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

  // Define steps for the upload process
  const steps = ['Upload CSV', 'Map Columns', 'Upload Data'];

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
      const headers = Object.keys(editedCsvData[0]).join(',');
      const rows = editedCsvData.map(row => 
        Object.values(row).map(val => {
          // Handle values with commas or quotes
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      // Create a new blob with the edited CSV data
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      formData.append("file", csvBlob, file.name);
    } else {
      formData.append("file", file);
    }
    
    formData.append("mapping", JSON.stringify(mappingConfig));
    
    try {
      // Make the actual API call with proper endpoint
      const response = await apiInstance.post("/dev/admin/bulk/schools", formData, {
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
        toast.info(`All schools already exist in the database`);
      } else {
        toast.warning(`Upload completed with no new schools added`);
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
        setErrorData([{
          schoolName: "Error",
          udiseCode: "",
          blockName: "",
          clusterName: "",
          reason: error.response?.data?.message || "Failed to process upload"
        }]);
      }
      
      // Set error result from API
      setUploadResult(error.response?.data || { error: "Upload failed" });
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

  const getUploadStatusColor = () => {
    if (!uploadResult) return "info";
    
    const successCount = uploadResult?.data?.successCount || 0;
    const errorCount = errorData.length;
    
    if (errorCount === 0) return "success";
    if (successCount === 0) return "error";
    return "warning";
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, px:2, maxWidth: "75rem", margin: "0 auto",   }}>
        <div className="flex justify-between">
          <h5 className="text-lg font-bold text-[#2F4F4F]">Bulk Upload Schools</h5>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={openSampleCSVModal}
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
            Sample CSV
          </Button>
        </div>

        <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
          Upload a CSV file with multiple schools to add them at once
        </Typography>

        {/* Add stepper to show current stage of the process */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                border: "2px dashed #ccc",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                mb: 1,
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
                  if (droppedFile.name.endsWith('.csv')) {
                    // We'll create a synthetic event object that mimics the structure
                    // expected by the handleFileChange function
                    const syntheticEvent = {
                      target: {
                        files: [droppedFile]
                      }
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
              
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: "#e6f2ff",
                    borderRadius: "50%",
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

              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Click anywhere in this box or drag a CSV file here
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
				  justifyContent: "center", 
				  width: "100%"
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                    CSV Format
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Upload a CSV file with school data. The file should contain School Name, UDISE Code,
                    Cluster Name, and Block Name. Download Sample CSV for reference.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
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
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography>
                {file.name} {totalUploadCount > 0 && `(${totalUploadCount} rows)`}
              </Typography>
              <Button
                variant="text"
                color="error"
                startIcon={<CloseIcon />}
                onClick={confirmFileRemoval}
                size="small"
              >
                Remove
              </Button>
            </Box>

            {/* CSV Mapper Component */}
            <CSVMapper 
              file={file} 
              onMappingComplete={handleMappingComplete}
              entityType="school"
            />

            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBackStep}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && file && mappingConfig && (
          <Box sx={{ p: 2 }}>
            {uploadResult ? (
              // Enhanced Upload Results View
              <Box>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3, 
                    borderColor: getUploadStatusColor() === 'success' 
                      ? 'success.light' 
                      : getUploadStatusColor() === 'error' 
                        ? 'error.light' 
                        : 'warning.light'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getUploadStatusColor() === 'success' ? (
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 28, mr: 1 }} />
                      ) : getUploadStatusColor() === 'error' ? (
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 28, mr: 1 }} />
                      ) : (
                        <WarningIcon color="warning" sx={{ fontSize: 28, mr: 1 }} />
                      )}
                      <Typography variant="h6" fontWeight="bold">
                        Upload Results
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Alert 
                        severity={getUploadStatusColor()} 
                        sx={{ mb: 2 }}
                        icon={getUploadStatusColor() === 'warning' ? <WarningIcon /> : undefined}
                      >
                        <Typography variant="body1">
                          {uploadResult?.data?.successCount > 0 ? (
                            errorData.length > 0 ? (
                              `${uploadResult.data.successCount} of ${totalUploadCount} schools uploaded successfully. ${errorData.length} schools had errors.`
                            ) : (
                              `All ${uploadResult.data.successCount} schools uploaded successfully!`
                            )
                          ) : errorData.length > 0 ? (
                            `Upload completed with ${errorData.length} errors. No new schools were added.`
                          ) : (
                            `All schools already exist in the database.`
                          )}
                        </Typography>
                      </Alert>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 3, 
                        mb: 3,
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: alpha('#f5f5f5', 0.7)
                      }}>
                        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">Total Records</Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: 'text.primary' }}>
                            {totalUploadCount}
                          </Typography>
                        </Box>
                        
                        <Divider orientation="vertical" flexItem />
                        
                        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">Successful</Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: 'success.main' }}>
                            {uploadResult?.data?.successCount || 0}
                          </Typography>
                        </Box>
                        
                        <Divider orientation="vertical" flexItem />
                        
                        <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">Failed</Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: errorData.length > 0 ? 'error.main' : 'text.disabled' }}>
                            {errorData.length || uploadResult?.data?.errorCount || 0}
                          </Typography>
                        </Box>
                        
                        {errorData.length > 0 && (
                          <>
                            <Divider orientation="vertical" flexItem />
                            
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              minWidth: 150 
                            }}>
                              <Button
                                onClick={handleViewErrorData}
                                startIcon={<ErrorOutlineIcon />}
                                color="error"
                                variant="outlined"
                                size="small"
                              >
                                View Errors
                              </Button>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Display a small preview of errors if any */}
                    {errorData.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Error Preview
                        </Typography>
                        
                        <TableContainer 
                          component={Paper} 
                          variant="outlined" 
                          sx={{ maxHeight: 200, mb: 2 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell width="40%">School Name</TableCell>
                                <TableCell width="20%">UDISE Code</TableCell>
                                <TableCell width="40%">Error</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {errorData.slice(0, 3).map((error, index) => (
                                <TableRow key={`preview-error-${index}`}>
                                  <TableCell>{error.schoolName || ""}</TableCell>
                                  <TableCell>{error.udiseCode || ""}</TableCell>
                                  <TableCell>
                                    <Tooltip title={error.reason || "Unknown error"}>
                                      <Typography 
                                        variant="body2" 
                                        color="error"
                                        sx={{ 
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: 200
                                        }}
                                      >
                                        {error.reason || "Unknown error"}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {errorData.length > 3 && (
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
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded by {loginDetails.name} at {loginDetails.currentDateTime}
                      </Typography>
                      
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {errorData.length > 0 && (
                          <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleViewErrorData}
                            color="error"
                          >
                            Download Errors
                          </Button>
                        )}
                        
                        <ButtonCustom
                          text="Done"
                          btnWidth="120"
                          onClick={handleDoneUpload}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              // Pre-upload view
              <Box
                sx={{
                  border: "1px solid #d1e7ff",
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                  backgroundColor: "#f0f7ff",
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Ready to Upload
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    File: {file.name}
                  </Typography>
                  <Typography variant="body2">
                    {totalUploadCount} schools will be uploaded
                  </Typography>
                </Box>
                
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                  Column Mapping:
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>CSV Column</TableCell>
                        <TableCell>System Field</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(mappingConfig).map(([csvColumn, systemField]) => (
                        <TableRow key={`mapping-${csvColumn}`}>
                          <TableCell>{csvColumn}</TableCell>
                          <TableCell>{systemField}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackStep}
                  >
                    Back to Mapping
                  </Button>
                  
                  <ButtonCustom
                    text={isUploading ? "Uploading..." : "Upload Schools"}
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
    </ThemeProvider>
  );
}