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
  Tooltip,
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
import ButtonCustom from "../../../components/ButtonCustom";
import apiInstance from "../../../../api";
import { toast } from "react-toastify";
import Modal from "@mui/material/Modal";
import CSVMapper from "./CSVMapper";
import SampleCSVModal from "./SampleCSVModal";
import FileUploadStep from "./FileUploadStep";
import ColumnMappingStep from "./ColumnMappingStep";
import UploadConfirmationStep from "./UploadConfirmationStep";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import ErrorDetailsDialog from "./ErrorDetailsDialog";

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

  // Define steps for the upload process
  const steps = ['Upload CSV', 'Map Columns', 'Upload Data'];

  // Get login details
  const loginDetails = getLoginDetails();

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
      // Make the actual API call with student bulk upload endpoint
      const response = await apiInstance.post("/dev/admin/bulk/students", formData, {
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
        toast.success(`Upload completed: ${successCount} students added successfully`);
      } else if (existingCount > 0) {
        toast.info(`All students already exist in the database`);
      } else {
        toast.warning(`Upload completed with no new students added`);
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
          studentName: "Error",
          admissionId: "",
          className: "",
          section: "",
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
    navigate("/students");
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
      <Box sx={{ p: 2, maxWidth: "1100px", margin: "0 auto" }}>
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
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <FileUploadStep 
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
          />
        )}

        {activeStep === 1 && file && (
          <ColumnMappingStep
            file={file}
            totalUploadCount={totalUploadCount}
            confirmFileRemoval={confirmFileRemoval}
            handleMappingComplete={handleMappingComplete}
            handleBackStep={handleBackStep}
          />
        )}

        {activeStep === 2 && file && mappingConfig && (
          <UploadConfirmationStep
            file={file}
            mappingConfig={mappingConfig}
            totalUploadCount={totalUploadCount}
            isUploading={isUploading}
            uploadResult={uploadResult}
            errorData={errorData}
            loginDetails={loginDetails}
            handleUpload={handleUpload}
            handleBackStep={handleBackStep}
            handleViewErrorData={handleViewErrorData}
            handleDoneUpload={handleDoneUpload}
            getUploadStatusColor={getUploadStatusColor}
          />
        )}

        {/* Modals */}
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

        <SampleCSVModal 
          open={sampleModalOpen}
          onClose={() => setSampleModalOpen(false)}
          entityType="student"
        />

        {errorData.length > 0 && (
          <ErrorDetailsDialog
            open={errorDialogOpen}
            onClose={() => setErrorDialogOpen(false)}
            errorData={errorData}
            headers={["name", "fatherName", "motherName", "dob", "class", "gender", "schoolUdiseCode", "aparId", "hostel"]}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}