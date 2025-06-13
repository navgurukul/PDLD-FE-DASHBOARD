import { useState, useRef } from "react";
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
  Alert,
  Divider,
  Chip,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../ButtonCustom";
import apiInstance from "../../../../api";
import { toast } from "react-toastify";
import StudentUploadStepper from "./StudentUploadStepper";
import StudentCSVMapper from "./CSVMapper";
import StudentSampleCSVModal from "./SampleCSVModal";
import StudentDeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import StudentErrorDetailsDialog from "./ErrorDetailsDialog";
import { useParams } from "react-router-dom";
import OutlinedButton from "../../button/OutlinedButton";
import FileDownloadSvg from "../../../assets/file_download.svg";
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

// Create theme for consistent styling
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

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

export default function BulkUploadStudents() {
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
  const { schoolId } = useParams();
  const [uploadDateTime, setUploadDateTime] = useState(null);

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

    console.log("School ID:", schoolId);

    const formData = new FormData();

    // Add schoolId to each CSV record (but remove UDISE requirement)
    if (editedCsvData) {
      const enhancedData = editedCsvData.map((student) => {
        // Create a new student object without the schoolUdiseCode field
        const { schoolUdiseCode, ...studentWithoutUdise } = student;

        // Add schoolId to the student record
        return {
          ...studentWithoutUdise,
          schoolId: schoolId,
        };
      });

      // Convert to CSV format
      const headers = Object.keys(enhancedData[0]).join(",");
      const rows = enhancedData.map((row) =>
        Object.values(row)
          .map((val) => {
            if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      );
      const csvContent = [headers, ...rows].join("\n");

      const csvBlob = new Blob([csvContent], { type: "text/csv" });
      formData.append("file", csvBlob, file.name);
    } else {
      formData.append("file", file);
    }

    // Add schoolId to mapping config
    const enhancedMapping = {
      ...mappingConfig,
    };

    formData.append("mapping", JSON.stringify(enhancedMapping));
    formData.append("schoolId", schoolId);

    try {
      // Use apiInstance for API call (no need for apiUrl or fetch)
      const response = await apiInstance.post(`/admin/bulk/students/${schoolId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Authorization header automatic lag jayega interceptor se
        },
      });

      const responseData = response.data;
      setUploadResult(responseData);

      // Error data process karo (same as before)
      if (responseData?.data?.errors?.length > 0) {
        setErrorData(transformErrorData(responseData.data.errors));
      } else if (responseData?.errors?.length > 0) {
        setErrorData(transformErrorData(responseData.errors));
      } else {
        setErrorData([]);
      }

      // Show success toast based on the actual response structure
      const successCount = responseData?.data?.successCount || 0;
      const totalCount = responseData?.data?.totalCount || totalUploadCount;
      const existingCount = totalCount - successCount - (responseData?.data?.errorCount || 0);

      if (successCount > 0) {
        toast.success(`Upload completed: ${successCount} students added successfully`);
      } else if (existingCount > 0) {
        toast.info(`All students already exist in the database`);
      } else {
        toast.warning(`Upload completed with no new students added`);
      }
    } catch (error) {
      // Axios error handling
      let errorMessage = "Error uploading file";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      setErrorData([
        {
          studentName: "Error",
          enrollmentId: "",
          grade: "",
          schoolId: "",
          reason: errorMessage || "Failed to process upload",
        },
      ]);
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
    navigate(`/schools/schoolDetail/${schoolId}`, {
      state: { selectedTab: 1 }, // Set to Students tab
    });
  };

  const getUploadStatusColor = () => {
    if (!uploadResult) return "info";

    const successCount = uploadResult?.data?.successCount || 0;
    const errorCount = errorData.length;

    if (errorCount === 0) return "success";
    if (successCount === 0) return "error";
    return "warning";
  };

  const transformErrorData = (apiErrors) => {
    if (!apiErrors || !Array.isArray(apiErrors)) {
      return [];
    }

    return apiErrors.map((errorItem, index) => {
      const studentData = errorItem.data || {};

      // Return a clean object without duplication
      return {
        // All original data from the API response
        ...studentData,
        // Error details
        error: errorItem.error || "Unknown error",
        row: errorItem.row || index + 1,
      };
    });
  };

  // Add this function to your BulkUploadStudents component
  const downloadErrorsCSV = () => {
    // Define headers for the CSV (removing schoolUdiseCode)
    const csvHeaders = [
      { id: "name", label: "fullName" },
      { id: "fatherName", label: "fatherName" },
      { id: "motherName", label: "motherName" },
      { id: "dob", label: "dob" },
      { id: "gender", label: "gender" },
      { id: "class", label: "class" },
      { id: "aparID", label: "aparID" },
      { id: "hostel", label: "hostel" },
      { id: "error", label: "Error" },
    ];

    // Rest of the function remains the same...
    // Create CSV header row
    const csvHeader = csvHeaders.map((header) => header.label).join(",");

    // Create CSV rows from error data
    const csvRows = errorData.map((error) => {
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
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, px: 2, maxWidth: "90%", margin: "0 auto" }}>
        <div className="flex justify-between">
          <h5 className="text-lg font-bold text-[#2F4F4F]">Bulk Upload Students</h5>
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
          Upload a CSV file with multiple students to add them at once
        </Typography>

        {/* Add stepper to show current stage of the process */}
        <StudentUploadStepper activeStep={activeStep} />

        {activeStep === 0 && (
          <>
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  width: "70%",
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
                startIcon={<ErrorOutlineIcon />}
                onClick={confirmFileRemoval}
                size="small"
              >
                Remove
              </Button>
            </Box>

            {/* Student CSV Mapper Component */}
            <StudentCSVMapper file={file} onMappingComplete={handleMappingComplete} />

            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
              <OutlinedButton text={"Back"} onClick={handleBackStep} />
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
                    borderColor:
                      getUploadStatusColor() === "success"
                        ? "success.light"
                        : getUploadStatusColor() === "error"
                        ? "error.light"
                        : "warning.light",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getUploadStatusColor() === "success" ? (
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 28, mr: 1 }} />
                      ) : getUploadStatusColor() === "error" ? (
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
                        icon={getUploadStatusColor() === "warning" ? <WarningIcon /> : undefined}
                      >
                        <Typography variant="body1">
                          {uploadResult?.data?.successCount > 0
                            ? errorData.length > 0
                              ? `${uploadResult.data.successCount} of ${totalUploadCount} students uploaded successfully. ${errorData.length} students had errors.`
                              : `All ${uploadResult.data.successCount} students uploaded successfully!`
                            : errorData.length > 0
                            ? `Upload completed with ${errorData.length} errors. No new students were added.`
                            : `All students already exist in the database.`}
                        </Typography>
                      </Alert>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 3,
                          mb: 3,
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: alpha("#f5f5f5", 0.7),
                        }}
                      >
                        <Box sx={{ textAlign: "center", minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Records
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: "text.primary" }}>
                            {totalUploadCount}
                          </Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem />

                        <Box sx={{ textAlign: "center", minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">
                            Successful
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 1, color: "success.main" }}>
                            {uploadResult?.data?.successCount || 0}
                          </Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem />

                        <Box sx={{ textAlign: "center", minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">
                            Failed
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              mt: 1,
                              color: errorData.length > 0 ? "error.main" : "text.disabled",
                            }}
                          >
                            {errorData.length || uploadResult?.data?.errorCount || 0}
                          </Typography>
                        </Box>

                        {errorData.length > 0 && (
                          <>
                            <Divider orientation="vertical" flexItem />

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 150,
                              }}
                            ></Box>
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
                                <TableCell>Name</TableCell>
                                <TableCell>Apar ID</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Father Name</TableCell>
                                <TableCell>Mother Name</TableCell>
                                <TableCell>Gender</TableCell>
                                <TableCell>Hostel</TableCell>
                                <TableCell>Error</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {errorData.slice(0, 3).map((error, index) => (
                                <TableRow key={`preview-error-${index}`}>
                                  <TableCell>{error.name || ""}</TableCell>
                                  <TableCell>{error.aparID || ""}</TableCell>
                                  <TableCell>{error.class ? `Class ${error.class}` : ""}</TableCell>

                                  <TableCell>{error.fatherName || ""}</TableCell>
                                  <TableCell>{error.motherName || ""}</TableCell>
                                  <TableCell>{error.gender || ""}</TableCell>
                                  <TableCell>{error.hostel || ""}</TableCell>
                                  <TableCell>
                                    <Tooltip title={error.error || "Unknown error"}>
                                      <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: 150,
                                        }}
                                      >
                                        {error.error || "Unknown error"}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {errorData.length > 3 && (
                                <TableRow>
                                  <TableCell colSpan={8} align="center">
                                    <Button
                                      size="small"
                                      onClick={handleViewErrorData}
                                      startIcon={<InfoIcon />}
                                      color="primary"
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

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Uploaded by {loginDetails.name} at{" "}
                        {uploadDateTime ? formatDateTime(uploadDateTime) : "-"}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        {errorData.length > 0 && (
                          <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={downloadErrorsCSV}
                            color="error"
                            sx={{ borderRadius: "8px", height: "48px" }}
                          >
                            Download Errors
                          </Button>
                        )}

                        <ButtonCustom text="Done" btnWidth="120" onClick={handleDoneUpload} />
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
                    {totalUploadCount} students will be uploaded
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
                  <OutlinedButton text={"Back to Mapping"} onClick={handleBackStep} />

                  <ButtonCustom
                    text={isUploading ? "Uploading..." : "Upload Students"}
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

        {/* Modals and Dialogs */}
        <StudentDeleteConfirmationModal
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

        <StudentSampleCSVModal open={sampleModalOpen} onClose={() => setSampleModalOpen(false)} />

        {errorData.length > 0 && (
          <StudentErrorDetailsDialog
            open={errorDialogOpen}
            onClose={() => setErrorDialogOpen(false)}
            errorData={errorData}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
