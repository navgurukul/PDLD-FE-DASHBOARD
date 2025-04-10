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
import GetAppIcon from "@mui/icons-material/GetApp";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { toast } from "react-toastify";

// Sample data for school uploads
const SCHOOL_SAMPLE_DATA = [
  {
    "School Name": "Govt. Model School",
    "UDISE Code": "12345678901",
    "Cluster Name": "Central Cluster",
    "Block Name": "South Block",
    "Address": "123 Education St",
    "Pincode": "110001",
    "District": "Central",
    "State": "Delhi"
  },
  {
    "School Name": "Public High School",
    "UDISE Code": "12345678902",
    "Cluster Name": "North Cluster",
    "Block Name": "North Block",
    "Address": "456 Learning Ave",
    "Pincode": "110002",
    "District": "North",
    "State": "Delhi"
  }
];

// Sample data for student uploads (for future use)
const STUDENT_SAMPLE_DATA = [
  {
    "Student Name": "Rahul Kumar",
    "Enrollment ID": "ST2025001",
    "Grade": "5",
    "School ID": "SCH001"
  },
  {
    "Student Name": "Priya Singh",
    "Enrollment ID": "ST2025002",
    "Grade": "6",
    "School ID": "SCH001"
  }
];

export default function SampleCSVModal({ open, onClose, entityType = "school" }) {
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

  const getSampleData = () => {
    return entityType === "school" ? SCHOOL_SAMPLE_DATA : STUDENT_SAMPLE_DATA;
  };

  const getHeaders = () => {
    const data = getSampleData();
    return data.length > 0 ? Object.keys(data[0]) : [];
  };

  const downloadCSV = () => {
    const data = getSampleData();
    const headers = getHeaders();
    
    let csvContent = headers.join(",") + "\n";
    
    data.forEach(row => {
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
    link.setAttribute("download", `sample_${entityType}_upload.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Sample ${entityType} CSV downloaded successfully`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="sample-csv-modal-title"
    >
      <Box sx={modalStyle}>
        <Typography id="sample-csv-modal-title" variant="h6" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Sample CSV File Format
        </Typography>
        
        {entityType === "school" && (
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            {/* <Tab label="Required Fields" /> */}
            <Tab label="All Fields" />
          </Tabs>
        )}
        
        <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
          {entityType === "school" 
            ? "This is a sample school upload CSV. You can download this template and fill it with your data."
            : "This is a sample student upload CSV. You can download this template and fill it with your data."}
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {getHeaders()
                  // Filter headers based on the active tab
                  .filter(header => activeTab === 1 || 
                    (entityType === "school" && ["School Name", "UDISE Code", "Cluster Name", "Block Name"].includes(header)) ||
                    (entityType === "student" && ["Student Name", "Enrollment ID", "Grade", "School ID"].includes(header)))
                  .map((header) => (
                    <TableCell key={header}>
                      <Typography variant="body2" fontWeight="bold">
                        {header}
                        {(entityType === "school" && ["School Name", "UDISE Code", "Cluster Name", "Block Name"].includes(header)) ||
                         (entityType === "student" && ["Student Name", "Enrollment ID", "Grade", "School ID"].includes(header))
                          ? " *" : ""}
                      </Typography>
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {getSampleData().map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {getHeaders()
                    // Filter cells based on the active tab
                    .filter(header => activeTab === 1 || 
                      (entityType === "school" && ["School Name", "UDISE Code", "Cluster Name", "Block Name"].includes(header)) ||
                      (entityType === "student" && ["Student Name", "Enrollment ID", "Grade", "School ID"].includes(header)))
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
              Download CSV Template AA
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}