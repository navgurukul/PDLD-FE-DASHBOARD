import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Pagination } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import { toast } from "react-toastify";

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
    // Implementation for downloading errors as CSV
    // ...
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
        {/* Error dialog content */}
        {/* ... */}
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

export default ErrorDetailsDialog;