import   { useState } from "react";
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Divider, 
  Tooltip, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Card, 
  CardContent 
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ButtonCustom from "../../../components/ButtonCustom";
import ErrorDetailsDialog from "./ErrorDetailsDialog";

// Function to get login details (reused from your existing code)
const getLoginDetails = () => {
  // Default values as fallback
  let defaultDetails = {
    username: "User-Name",
    currentDateTime: new Date().toLocaleString()
  };
  
  try {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData?.username || userData?.name || userData?.email) {
        defaultDetails.username = userData.username || userData.name || userData.email;
      }
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }
  
  return defaultDetails;
};

const UploadConfirmationStep = ({
  file,
  mappingConfig,
  totalUploadCount,
  isUploading,
  uploadResult,
  errorData,
  handleUpload,
  handleBackStep,
  handleDoneUpload
}) => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const loginDetails = getLoginDetails();
  
  const getUploadStatusColor = () => {
    if (!uploadResult) return "info";
    
    const successCount = uploadResult?.data?.successCount || 0;
    const errorCount = errorData?.length || uploadResult?.data?.errorCount || 0;
    
    if (errorCount === 0) return "success";
    if (successCount === 0) return "error";
    return "warning";
  };

  const handleViewErrorData = () => {
    setShowErrorDialog(true);
  };

  return (
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
                      (errorData?.length > 0 || uploadResult?.data?.errorCount > 0) ? (
                        `${uploadResult.data.successCount} of ${uploadResult.data.totalRecords || totalUploadCount} students uploaded successfully. ${errorData?.length || uploadResult?.data?.errorCount} students had errors.`
                      ) : (
                        `All ${uploadResult.data.successCount} students uploaded successfully!`
                      )
                    ) : (errorData?.length > 0 || uploadResult?.data?.errorCount > 0) ? (
                      `Upload completed with ${errorData?.length || uploadResult?.data?.errorCount} errors. No new students were added.`
                    ) : (
                      `All students already exist in the database.`
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
                      {uploadResult?.data?.totalRecords || totalUploadCount}
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
                    <Typography variant="h5" sx={{ mt: 1, color: (errorData?.length > 0 || uploadResult?.data?.errorCount > 0) ? 'error.main' : 'text.disabled' }}>
                      {errorData?.length || uploadResult?.data?.errorCount || 0}
                    </Typography>
                  </Box>
                  
                  {(errorData?.length > 0 || uploadResult?.data?.errorCount > 0) && (
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
              {errorData?.length > 0 && (
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
                          <TableCell width="40%">Student Name</TableCell>
                          <TableCell width="15%">Class</TableCell>
                          <TableCell width="15%">School UDISE</TableCell>
                          <TableCell width="30%">Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errorData.slice(0, 3).map((error, index) => (
                          <TableRow key={`preview-error-${index}`}>
                            <TableCell>{error.data?.name || ""}</TableCell>
                            <TableCell>{error.data?.class || ""}</TableCell>
                            <TableCell>{error.data?.schoolUdiseCode || ""}</TableCell>
                            <TableCell>
                              <Tooltip title={error.error || "Unknown error"}>
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
                                  {error.error || "Unknown error"}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                        {errorData.length > 3 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
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
                  Uploaded by {loginDetails.username} at {loginDetails.currentDateTime}
                </Typography>
                
                <Box sx={{ display: "flex", gap: 2 }}>
                  {errorData?.length > 0 && (
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
            <Button
              variant="outlined"
              onClick={handleBackStep}
            >
              Back to Mapping
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

      {/* Using your existing ErrorDetailsDialog component */}
      {errorData?.length > 0 && (
        <ErrorDetailsDialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          apiResponse={uploadResult}
          uploadFileName={file?.name}
        />
      )}
    </Box>
  );
};

export default UploadConfirmationStep;