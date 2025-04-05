import React, { useState } from "react";
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

const SampleCSVModal = ({ open, onClose, entityType = "student" }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample CSV data based on entity type
  const getSampleData = () => {
    if (entityType === "student") {
      return {
        headers: ["name", "fatherName", "motherName", "dob", "class", "gender", "schoolUdiseCode", "aparId", "hostel"],
        rows: [
          {
            name: "Rahul Sharma",
            fatherName: "Vikram Sharma",
            motherName: "Sunita Sharma",
            dob: "2010-05-15",
            class: "8",
            gender: "Male",
            schoolUdiseCode: "24100123456",
            aparId: "AP12345678",
            hostel: "No"
          },
          {
            name: "Priya Patel",
            fatherName: "Rajesh Patel",
            motherName: "Meena Patel",
            dob: "2011-02-20",
            class: "7",
            gender: "Female",
            schoolUdiseCode: "24100123456",
            aparId: "AP87654321",
            hostel: "Yes"
          },
          {
            name: "Amit Kumar",
            fatherName: "Suresh Kumar",
            motherName: "Reena Kumar",
            dob: "2009-11-10",
            class: "9",
            gender: "Male",
            schoolUdiseCode: "24100123456",
            aparId: "AP98765432",
            hostel: "No"
          }
        ]
      };
    } else if (entityType === "teacher") {
      return {
        headers: ["name", "qualification", "subject", "joiningDate", "gender", "schoolUdiseCode", "teacherId", "isClassTeacher"],
        rows: [
          {
            name: "Anita Desai",
            qualification: "M.Sc, B.Ed",
            subject: "Mathematics",
            joiningDate: "2015-06-10",
            gender: "Female",
            schoolUdiseCode: "24100123456",
            teacherId: "TCHR123456",
            isClassTeacher: "Yes"
          },
          {
            name: "Sunil Verma",
            qualification: "M.A, B.Ed",
            subject: "Hindi",
            joiningDate: "2018-07-15",
            gender: "Male",
            schoolUdiseCode: "24100123456",
            teacherId: "TCHR789012",
            isClassTeacher: "No"
          }
        ]
      };
    } else {
      // Default fallback
      return {
        headers: ["column1", "column2", "column3"],
        rows: [
          { column1: "Sample1", column2: "Value1", column3: "Data1" },
          { column1: "Sample2", column2: "Value2", column3: "Data2" }
        ]
      };
    }
  };

  const sampleData = getSampleData();

  // Format the data as CSV text
  const getCSVText = () => {
    const headers = sampleData.headers.join(",");
    const rows = sampleData.rows.map(row => 
      sampleData.headers.map(header => {
        const value = row[header] || "";
        // Escape commas and quotes
        if (value.includes(",") || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    );
    
    return [headers, ...rows].join("\n");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDownloadCSV = () => {
    setIsDownloading(true);
    
    try {
      const csvContent = getCSVText();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `sample_${entityType}_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Sample ${entityType} CSV downloaded successfully`);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Error downloading CSV file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCSV = () => {
    const csvContent = getCSVText();
    
    navigator.clipboard.writeText(csvContent)
      .then(() => {
        toast.success("CSV content copied to clipboard");
      })
      .catch(err => {
        console.error("Error copying to clipboard:", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  // Filter rows based on search term
  const filteredRows = sampleData.rows.filter(row => 
    Object.values(row).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Field descriptions for help
  const getFieldDescriptions = () => {
    if (entityType === "student") {
      return [
        { field: "name", description: "Full name of the student", required: true },
        { field: "fatherName", description: "Full name of student's father", required: true },
        { field: "motherName", description: "Full name of student's mother", required: true },
        { field: "dob", description: "Date of birth in YYYY-MM-DD format", required: true },
        { field: "class", description: "Class/grade of the student (1-12)", required: true },
        { field: "gender", description: "Gender of the student (Male/Female/Other)", required: true },
        { field: "schoolUdiseCode", description: "UDISE code of the school", required: true },
        { field: "aparId", description: "APAR ID of the student if available", required: false },
        { field: "hostel", description: "Whether student is in hostel (Yes/No)", required: false }
      ];
    } else if (entityType === "teacher") {
      return [
        { field: "name", description: "Full name of the teacher", required: true },
        { field: "qualification", description: "Educational qualifications", required: true },
        { field: "subject", description: "Subject specialization", required: true },
        { field: "joiningDate", description: "Date of joining in YYYY-MM-DD format", required: true },
        { field: "gender", description: "Gender of the teacher (Male/Female/Other)", required: true },
        { field: "schoolUdiseCode", description: "UDISE code of the school", required: true },
        { field: "teacherId", description: "Unique teacher identification number", required: false },
        { field: "isClassTeacher", description: "Whether they are a class teacher (Yes/No)", required: false }
      ];
    } else {
      return [];
    }
  };

  const fieldDescriptions = getFieldDescriptions();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Sample {entityType.charAt(0).toUpperCase() + entityType.slice(1)} CSV Format
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Use this sample CSV format as a template for your {entityType} data import. 
            You can download the sample file or copy its contents.
          </Typography>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Preview" />
            <Tab label="CSV Text" />
            <Tab label="Field Descriptions" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && (
          <Box>
            {sampleData.rows.length > 5 && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="Search in sample data..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: 300 }}
                />
              </Box>
            )}
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {sampleData.headers.map((header, index) => (
                      <TableCell key={`header-${index}`}>
                        <Typography variant="subtitle2">
                          {header}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`}>
                      {sampleData.headers.map((header, cellIndex) => (
                        <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                          {row[header] || ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={sampleData.headers.length} align="center" sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          No matching data found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Box
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: '300px',
                whiteSpace: 'pre',
                mb: 2
              }}
            >
              {getCSVText()}
            </Box>
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell width="20%">Field</TableCell>
                    <TableCell width="60%">Description</TableCell>
                    <TableCell width="20%">Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fieldDescriptions.map((field, index) => (
                    <TableRow key={`field-${index}`}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {field.field}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {field.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={field.required ? "error" : "text.secondary"}>
                          {field.required ? "Yes" : "No"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
              <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Required fields must be included in your CSV file. Optional fields can be left blank.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyCSV}
        >
          Copy CSV
        </Button>
        
        <Button
          variant="contained"
          startIcon={isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadCSV}
          disabled={isDownloading}
        >
          Download Sample CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SampleCSVModal;