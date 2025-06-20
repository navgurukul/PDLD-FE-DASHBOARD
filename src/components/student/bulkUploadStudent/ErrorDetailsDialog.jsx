import { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Pagination from "@mui/material/Pagination";

const StudentErrorDetailsDialog = ({ open, onClose, errorData }) => {
  const [tabValue, setTabValue] = useState(0);
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);

  // Table headers
  const displayHeaders = [
    { id: "row", label: "Row No." },
    { id: "fullName", label: "Full Name" },
    { id: "fatherName", label: "Father's Name" },
    { id: "motherName", label: "Mother's Name" },
    { id: "dob", label: "Date of Birth" },
    { id: "class", label: "Grade" },
    { id: "gender", label: "Gender" },
    { id: "schoolUdiseCode", label: "School ID" },
    { id: "aparID", label: "aparID" },
    { id: "hostel", label: "Hostel" },
    { id: "error", label: "Error" },
  ];

  // Group errors by reason
  const errorTypes = {};
  errorData.forEach((row) => {
    if (row.error) {
      const errorType = row.error.startsWith("Duplicate") ? "Duplicate" : "Validation";
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
  const currentData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ zIndex: 13010 }}>
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            pt: 3,
            pb: 2,
            borderBottom: "1px solid #e0e0e0", // School modal jaise border
          }}
        >
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
        <Typography variant="body2" color="text.secondary" sx={{ px: 3, pt: 2, pb: 1 }}>
          {errorData.length} records could not be processed due to errors. Review and fix these
          issues.
        </Typography>
      </DialogTitle>

      {/* Tabs */}
      {errorCategories.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="error view tabs">
            <Tab label={`All Errors (${errorData.length})`} />
            {errorCategories.map((category, idx) => (
              <Tab key={category} label={`${category} (${errorTypes[category].length})`} />
            ))}
          </Tabs>
        </Box>
      )}

      <DialogContent sx={{ pt: 0 }}>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {displayHeaders.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 700,
                      fontFamily: "Work Sans",
                      color: "#2F4F4F",
                      backgroundColor: "#f5f5f5 !important",
                    }}
                  >
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((error, index) => (
                  <TableRow
                    key={`error-row-${index}`}
                    sx={{
                      backgroundColor: "rgba(244,67,54,0.03)",
                      "& td, & th": { borderBottom: "none" },
                    }}
                  >
                    {displayHeaders.map((header, colIdx) => (
                      <TableCell key={`${index}-${header.id}`} sx={{ py: 2 }}>
                        {header.id === "row" ? (
                          (page - 1) * rowsPerPage + index + 1
                        ) : header.id === "class" ? (
                          error[header.id] ? (
                            `Class ${error[header.id]}`
                          ) : (
                            ""
                          )
                        ) : header.id === "error" ? (
                          <Tooltip title={error[header.id] || ""}>
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 300,
                                color: "error.main",
                              }}
                            >
                              {error[header.id] || ""}
                            </Typography>
                          </Tooltip>
                        ) : (
                          error[header.id] || ""
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={displayHeaders.length} align="center">
                    No errors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            // borderBottom: "1px solid #e0e0e0",
          }}
        >
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
      </DialogContent>
      <Box sx={{ borderTop: "1px solid #e0e0e0", mt: 2, mb: 0 }} />
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentErrorDetailsDialog;
