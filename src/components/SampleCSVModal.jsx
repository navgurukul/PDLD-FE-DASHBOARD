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
import ButtonCustom from "../components/ButtonCustom";
import OutlinedButton from "../components/button/OutlinedButton";
import { toast } from "react-toastify";

// Sample data for school uploads
const SCHOOL_SAMPLE_DATA = [
  {
    schoolName: "Govt. Model School",
    udiseCode: "12345678901",
    clusterName: "Central Cluster",
    blockName: "South Block",
    crcCode: "1234567890",
    Address: "123 Education St",
    Pincode: "110001",
    District: "Central",
    State: "Delhi",
  },
  {
    schoolName: "Public High School",
    udiseCode: "12345678902",
    clusterName: "North Cluster",
    blockName: "North Block",
    crcCode: "0987654321",
    Address: "456 Learning Ave",
    Pincode: "110002",
    District: "North",
    State: "Delhi",
  },
];

export default function SampleCSVModal({ open, onClose, entityType = "school" }) {
  const [activeTab, setActiveTab] = useState(0);
  const requiredFields = ["schoolName", "udiseCode", "clusterName", "blockName", "crcCode"];
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

  const getHeaders = () => [
    "schoolName",
    "udiseCode",
    "clusterName",
    "blockName",
    "crcCode",
    "Address",
    "Pincode",
    "District",
    "State",
  ];
  const downloadCSV = () => {
    const data = getSampleData();
    const headers = getHeaders();

    let csvContent = headers.join(",") + "\n";

    data.forEach((row) => {
      const values = headers.map((header) => {
        // Handle values that contain commas or quotes
        const value = row[header] || "";
        if (value.includes(",") || value.includes('"')) {
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
    <Modal open={open} onClose={onClose} aria-labelledby="sample-csv-modal-title" sx={{ zIndex: 20000 }}>
      <Box sx={modalStyle}>
        <Typography
          id="sample-csv-modal-title"
          variant="h6"
          component="h2"
          fontWeight="bold"
          sx={{ mb: 2 }}
        >
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
              <TableRow>
                {requiredFields.map((header) => (
                  <TableCell key={header}>{header} *</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {getSampleData().map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {requiredFields.map((header) => (
                    <TableCell key={header}>{row[header] || ""}</TableCell>
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
            <OutlinedButton text="Close" onClick={onClose} />

            <ButtonCustom text="Download CSV Template" onClick={downloadCSV} />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
