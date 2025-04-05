 
import { Button, Box, Typography, CircularProgress, Alert, Divider, Tooltip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent } from "@mui/material";
import { alpha } from "@mui/material/styles";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import ButtonCustom from "../../../components/ButtonCustom";

const UploadConfirmationStep = ({
  file,
  mappingConfig,
  totalUploadCount,
  isUploading,
  uploadResult,
  errorData,
  loginDetails,
  handleUpload,
  handleBackStep,
  handleViewErrorData,
  handleDoneUpload,
  getUploadStatusColor
}) => {
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
                      errorData.length > 0 ? (
                        `${uploadResult.data.successCount} of ${totalUploadCount} students uploaded successfully. ${errorData.length} students had errors.`
                      ) : (
                        `All ${uploadResult.data.successCount} students uploaded successfully!`
                      )
                    ) : errorData.length > 0 ? (
                      `Upload completed with ${errorData.length} errors. No new students were added.`
                    ) : (
                      `All students already exist in the database.`
                    )}
                  </Typography>
                </Alert>
                
                {/* Statistics boxes */}
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 3, 
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: alpha('#f5f5f5', 0.7)
                }}>
                  {/* Statistics content */}
                  {/* ... */}
                </Box>
              </Box>
              
              {/* Error preview section */}
              {errorData.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  {/* Error preview content */}
                  {/* ... */}
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
    </Box>
  );
};

export default UploadConfirmationStep;