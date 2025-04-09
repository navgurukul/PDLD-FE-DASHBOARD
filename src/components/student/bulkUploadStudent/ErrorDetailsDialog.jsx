import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { toast } from "react-toastify";

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

const StudentErrorDetailsDialog = ({ open, onClose, errorData, headers }) => {
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
    link.setAttribute("download", `student_error_rows_${loginDetails.name}_${new Date().toISOString().slice(0,10)}.csv`);
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
              Student Records with Errors
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
            {errorData.length} student record(s) could not be processed due to errors. Review and fix these issues.
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
                    <Typography variant="subtitle2">Student Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Enrollment ID</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Grade</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">School ID</Typography>
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
                    <TableCell>{row.studentName || ""}</TableCell>
                    <TableCell>{row.enrollmentId || ""}</TableCell>
                    <TableCell>{row.grade || ""}</TableCell>
                    <TableCell>{row.schoolId || ""}</TableCell>
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

export default StudentErrorDetailsDialog;