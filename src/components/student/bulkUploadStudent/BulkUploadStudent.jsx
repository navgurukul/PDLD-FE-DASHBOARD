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
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../ButtonCustom";
import apiInstance from "../../../../api";
import { toast, ToastContainer } from "react-toastify";
import StudentUploadStepper from "./StudentUploadStepper";
import StudentCSVMapper from "./CSVMapper";
import StudentSampleCSVModal from "./SampleCSVModal";
import StudentDeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import StudentErrorDetailsDialog from "./ErrorDetailsDialog";
import { useParams } from "react-router-dom";
import FileDownloadSvg from "../../../assets/file_download.svg";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";

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
  // const [uploadDateTime, setUploadDateTime] = useState(null);
  const [mapping, setMapping] = useState({});
  const [csvData, setCsvData] = useState([]);

  const requiredFields = ["fullName", "fatherName", "motherName", "class", "gender"];
  const isConfirmMappingDisabled = !requiredFields.every((field) =>
    Object.values(mapping).includes(field)
  );

  const handleConfirmMapping = () => {
    if (isConfirmMappingDisabled) {
      toast.error("Please map all required fields before proceeding.");
      return;
    }
    // Step forward with mapping and csvData
    handleMappingComplete(mapping, csvData);
  };

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
        },
      });

      // Get response data (apiInstance returns data directly in response.data)
      const responseData = response.data;
      // Set the upload result
      setUploadResult(responseData);

      // Process error data from the actual API response (matching the specific format)
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
        toast.info(`${existingCount} students already exist in the database`);
      }
      if ((response.data?.data?.errorCount || 0) > 0) {
        toast.error(`${response.data.data.errorCount} records failed to upload`);
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
  // navigate in step 0
  const handleUploadAnotherFile = () => {
    setActiveStep(0);
    setFile(null);
    setMappingConfig(null);
    setUploadResult(null);
    setErrorData([]);
    setEditedCsvData(null);
    setTotalUploadCount(0);
  };
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 2, px: 2, maxWidth: "60%", margin: "0 auto" }}>
        <div className="flex justify-between">
          <h5 className="text-lg font-bold text-[#2F4F4F] mb-8">Bulk Upload Students</h5>
        </div>

        {/* Add stepper to show current stage of the process */}
        <StudentUploadStepper activeStep={activeStep} />

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

            <StudentCSVMapper
              file={file}
              mapping={mapping}
              setMapping={setMapping}
              csvData={csvData}
              setCsvData={setCsvData}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
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

                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
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
                              Students Uploaded
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
                      </Box>
                    </Box>

                    {/* Display a small preview of errors if any */}
                    {errorData.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            backgroundColor: "#fff",
                          }}
                        >
                          {/* Left: Unsuccessful Records */}
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontFamily: "Work Sans",
                              color: "#2F4F4F",
                              fontSize: "18px",
                              flex: 1,
                            }}
                          >
                            Unsuccessful Records
                          </Typography>

                          {/* Center: View all errors button */}
                          {errorData.length > 3 && (
                            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                              <Button
                                variant="outlined"
                                onClick={handleViewErrorData}
                                startIcon={<InfoIcon />}
                                color="primary"
                                sx={{
                                  borderRadius: "8px",
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
                                View all {errorData.length} errors
                              </Button>
                            </Box>
                          )}

                          {/* Right: Download Failed Records */}
                          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              variant="outlined"
                              onClick={downloadErrorsCSV}
                              startIcon={<FileDownloadIcon sx={{ color: "inherit" }} />}
                              sx={{
                                borderRadius: "8px",
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
                              Download Failed Records (.csv)
                            </Button>
                          </Box>
                        </Box>

                        <TableContainer
                          component={Paper}
                          variant="outlined"
                          sx={{ maxHeight: 200, mb: 2 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ height: 56 }}>
                                <TableCell align="right">
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Row No.
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Name
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Apar ID
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Class
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Father Name
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Mother Name
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Gender
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
                                      color: "#2F4F4F",
                                    }}
                                  >
                                    Hostel
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontFamily: "Work Sans",
                                      fontSize: "14px",
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
                                  sx={{
                                    height: 56,
                                    "& td, & th": { borderBottom: "none" },
                                  }}
                                >
                                  <TableCell align="right">{error.row || ""}</TableCell>{" "}
                                  {/* Row No. */}
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.fullName || ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.aparID || ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.class ? `Class ${error.class}` : ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.fatherName || ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.motherName || ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.gender || ""}
                                  </TableCell>
                                  <TableCell sx={{ color: "#2F4F4F" }}>
                                    {error.hostel || ""}
                                  </TableCell>
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
                              {/* {errorData.length > 3 && (
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

                        <ButtonCustom text="Go to Student List" onClick={handleDoneUpload} />
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
      <ToastContainer style={{ zIndex: 99999999 }} position="top-right" autoClose={4000} />
    </ThemeProvider>
  );
}
