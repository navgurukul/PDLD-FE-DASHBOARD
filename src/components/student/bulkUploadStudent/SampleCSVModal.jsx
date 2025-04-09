import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { toast } from "react-toastify";

// Updated sample data for student uploads with the correct fields
const STUDENT_SAMPLE_DATA = [
  {
    "fullName": "Rahul Kumar",
    "fatherName": "Suresh Kumar",
    "motherName": "Asha Devi",
    "dob": "2012-05-15",
    "class": "5",
    "gender": "Male",
    "schoolUdiseCode": "12345678901",
    "aparId": "APAR123456",
    "hostel": "Yes"
  },
  {
    "fullName": "Priya Singh",
    "fatherName": "Rajesh Singh",
    "motherName": "Sunita Singh",
    "dob": "2011-08-21",
    "class": "6",
    "gender": "Female",
    "schoolUdiseCode": "12345678902",
    "aparId": "APAR123457",
    "hostel": "No"
  },
  {
    "fullName": "Amit Patel",
    "fatherName": "Vikram Patel",
    "motherName": "Meena Patel",
    "dob": "2010-12-03",
    "class": "7",
    "gender": "Male",
    "schoolUdiseCode": "12345678901",
    "aparId": "APAR123458",
    "hostel": "Yes"
  }
];

export default function StudentSampleCSVModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 800,
    maxHeight: "90vh",
    overflow: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getHeaders = () => {
    return STUDENT_SAMPLE_DATA.length > 0 ? Object.keys(STUDENT_SAMPLE_DATA[0]) : [];
  };

  // Required fields for student data
  const requiredFields = ["fullName", "fatherName", "motherName", "dob", "class", "gender", "schoolUdiseCode"];

  const downloadCSV = () => {
    const headers = getHeaders();
    
    let csvContent = headers.join(",") + "\n";
    
    STUDENT_SAMPLE_DATA.forEach(row => {
      const values = headers.map(header => {
        // Handle values that contain commas or quotes
        const value = row[header] || "";
        if (value.includes(",") || value.includes("\"")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sample_student_upload.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Sample student CSV downloaded successfully`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="sample-student-csv-modal-title"
    >
      <Box sx={modalStyle}>
        <Typography id="sample-student-csv-modal-title" variant="h6" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Sample Student CSV File Format
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Required Fields" />
          <Tab label="All Fields" />
        </Tabs>
        
        <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
          This is a sample student upload CSV. You can download this template and fill it with your data.
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {getHeaders()
                  // Filter headers based on the active tab
                  .filter(header => activeTab === 1 || requiredFields.includes(header))
                  .map((header) => (
                    <TableCell key={header}>
                      <Typography variant="body2" fontWeight="bold">
                        {header}
                        {requiredFields.includes(header) ? " *" : ""}
                      </Typography>
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {STUDENT_SAMPLE_DATA.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {getHeaders()
                    // Filter cells based on the active tab
                    .filter(header => activeTab === 1 || requiredFields.includes(header))
                    .map((header) => (
                      <TableCell key={`${rowIndex}-${header}`}>
                        {row[header]}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#666" }}>
            * Required fields
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ borderColor: "#ccc", color: "#555" }}
            >
              Close
            </Button>
            
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={downloadCSV}
              sx={{
                backgroundColor: "#0d6efd",
                "&:hover": { backgroundColor: "#0b5ed7" },
              }}
            >
              Download CSV Template
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};