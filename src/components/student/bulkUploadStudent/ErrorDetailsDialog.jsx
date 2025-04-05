import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  IconButton, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Tooltip, 
  Pagination,
  Chip,
  Alert,
  LinearProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import BugReportIcon from "@mui/icons-material/BugReport";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const ErrorDetailsDialog = ({ open, onClose, apiResponse, uploadFileName }) => {
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [errorData, setErrorData] = useState([]);
  const [errorSummary, setErrorSummary] = useState({
    total: 0,
    duplicates: 0,
    authorization: 0,
    validation: 0,
    other: 0
  });
  const [isProcessing, setIsProcessing] = useState(true);
  const rowsPerPage = 10;
  
  useEffect(() => {
    if (apiResponse && apiResponse.data) {
      setIsProcessing(true);
      
      // Extract errors from API response
      const errors = apiResponse.data.errors || [];
      setErrorData(errors);
      
      // Process error categories
      const summary = {
        total: errors.length,
        duplicates: 0,
        authorization: 0,
        validation: 0,
        other: 0
      };
      
      errors.forEach(error => {
        const errorMsg = error.error || "";
        if (errorMsg.includes("Duplicate")) {
          summary.duplicates++;
        } else if (errorMsg.includes("authorized")) {
          summary.authorization++;
        } else if (errorMsg.includes("validation") || errorMsg.includes("required") || errorMsg.includes("invalid")) {
          summary.validation++;
        } else {
          summary.other++;
        }
      });
      
      setErrorSummary(summary);
      setIsProcessing(false);
    }
  }, [apiResponse]);
  
  // Group errors by type
  const getFilteredErrors = () => {
    if (tabValue === 0) return errorData;
    
    return errorData.filter(error => {
      const errorMsg = error.error || "";
      
      switch(tabValue) {
        case 1: // Duplicates
          return errorMsg.includes("Duplicate");
        case 2: // Authorization
          return errorMsg.includes("authorized");
        case 3: // Validation
          return errorMsg.includes("validation") || errorMsg.includes("required") || errorMsg.includes("invalid");
        case 4: // Other
          return !errorMsg.includes("Duplicate") && 
                 !errorMsg.includes("authorized") && 
                 !errorMsg.includes("validation") && 
                 !errorMsg.includes("required") && 
                 !errorMsg.includes("invalid");
        default:
          return true;
      }
    });
  };
  
  const filteredData = getFilteredErrors();
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
  
  const getErrorTypeLabel = (error) => {
    const errorMsg = error.error || "";
    
    if (errorMsg.includes("Duplicate")) {
      return { label: "Duplicate Entry", color: "warning", icon: <ContentCopyIcon fontSize="small" /> };
    } else if (errorMsg.includes("authorized")) {
      return { label: "Authorization Error", color: "error", icon: <CancelIcon fontSize="small" /> };
    } else if (errorMsg.includes("validation") || errorMsg.includes("required") || errorMsg.includes("invalid")) {
      return { label: "Validation Error", color: "info", icon: <InfoIcon fontSize="small" /> };
    } else {
      return { label: "Other Error", color: "default", icon: <BugReportIcon fontSize="small" /> };
    }
  };

  const downloadErrorsCSV = () => {
    try {
      // Create headers
      let csvContent = "Row,Error Type,Error Message\n";
      
      // Add error data
      errorData.forEach(error => {
        const errorType = getErrorTypeLabel(error).label;
        const errorMsg = error.error || "Unknown error";
        const sanitizedErrorMsg = errorMsg.replace(/,/g, ";").replace(/"/g, "'").replace(/\n/g, " ");
        
        csvContent += `${error.row || "N/A"},"${errorType}","${sanitizedErrorMsg}"\n`;
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${uploadFileName || "upload"}_errors.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };
  
  const copyErrorDetails = (error) => {
    try {
      const textToCopy = JSON.stringify(error, null, 2);
      navigator.clipboard.writeText(textToCopy);
      // You would typically show a toast notification here
      console.log("Error details copied to clipboard");
    } catch (err) {
      console.error("Failed to copy error details", err);
    }
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
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              Upload Errors
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {isProcessing ? (
          <Box sx={{ width: '100%', py: 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Processing error data...</Typography>
          </Box>
        ) : (
          <>
            {/* Error Summary */}
            <Box sx={{ mb: 3 }}>
              <Alert 
                severity="error" 
                icon={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  Upload completed with {errorSummary.total} errors. No new records were added.
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip 
                  label={`Total Errors: ${errorSummary.total}`} 
                  color="error" 
                  icon={<ErrorOutlineIcon />} 
                  variant="outlined"
                />
                {errorSummary.duplicates > 0 && (
                  <Chip 
                    label={`Duplicates: ${errorSummary.duplicates}`} 
                    color="warning" 
                    icon={<ContentCopyIcon />} 
                    variant="outlined"
                  />
                )}
                {errorSummary.authorization > 0 && (
                  <Chip 
                    label={`Authorization: ${errorSummary.authorization}`} 
                    color="error" 
                    icon={<CancelIcon />} 
                    variant="outlined"
                  />
                )}
                {errorSummary.validation > 0 && (
                  <Chip 
                    label={`Validation: ${errorSummary.validation}`} 
                    color="info" 
                    icon={<InfoIcon />} 
                    variant="outlined"
                  />
                )}
                {errorSummary.other > 0 && (
                  <Chip 
                    label={`Other: ${errorSummary.other}`} 
                    color="default" 
                    icon={<BugReportIcon />} 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            {/* Error Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="All Errors" />
                {errorSummary.duplicates > 0 && <Tab label={`Duplicate Entries (${errorSummary.duplicates})`} />}
                {errorSummary.authorization > 0 && <Tab label={`Authorization Errors (${errorSummary.authorization})`} />}
                {errorSummary.validation > 0 && <Tab label={`Validation Errors (${errorSummary.validation})`} />}
                {errorSummary.other > 0 && <Tab label={`Other Errors (${errorSummary.other})`} />}
              </Tabs>
            </Box>
            
            {/* Error Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha('#f5f5f5', 0.7) }}>
                    <TableCell width="80">Row</TableCell>
                    <TableCell width="180">Error Type</TableCell>
                    <TableCell>Error Message</TableCell>
                    <TableCell width="80" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData.length > 0 ? (
                    currentData.map((error, index) => {
                      const errorType = getErrorTypeLabel(error);
                      
                      return (
                        <TableRow key={`error-${index}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha('#f5f5f5', 0.3) } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {error.row || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={errorType.label}
                              color={errorType.color}
                              size="small"
                              icon={errorType.icon}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              maxHeight: '80px', 
                              overflow: 'auto',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {error.error || "Unknown error"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Copy error details">
                              <IconButton 
                                size="small" 
                                onClick={() => copyErrorDetails(error)}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No errors found in this category
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Data Preview for the first error */}
            {currentData.length > 0 && currentData[0].data && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                  Data Preview - Row {currentData[0].row || "N/A"}
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha('#f5f5f5', 0.7) }}>
                        <TableCell width="30%">Field</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(currentData[0].data).map(([key, value], idx) => (
                        <TableRow key={`field-${idx}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha('#f5f5f5', 0.3) } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {value !== null && value !== undefined ? value.toString() : '(empty)'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  showFirstButton 
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Showing errors from upload: {uploadFileName || "Unknown file"}
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Close
          </Button>
          
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={downloadErrorsCSV}
            color="primary"
            disabled={isProcessing || errorData.length === 0}
          >
            Download Errors CSV
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDetailsDialog;