import React from "react";
import { Box, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";

const FileUploadStep = ({ fileInputRef, handleFileChange }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          border: "2px dashed #ccc",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          mb: 1,
          position: "relative",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "#0d6efd",
            backgroundColor: "rgba(13, 110, 253, 0.04)",
          },
        }}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = "#0d6efd";
          e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.08)";
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = "#0d6efd";
          e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.08)";
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = "#ccc";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.borderColor = "#ccc";
          e.currentTarget.style.backgroundColor = "transparent";
          
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
              const syntheticEvent = {
                target: {
                  files: [droppedFile]
                }
              };
              handleFileChange(syntheticEvent);
            } else {
              toast.error("Please upload a CSV file");
            }
          }
        }}
      >
        <input
          accept=".csv"
          style={{ display: "none" }}
          id="upload-file-button"
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: "#e6f2ff",
              borderRadius: "50%",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 40, color: "#2F4F4F" }} />
          </Box>
        </Box>

        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Click anywhere in this box or drag a CSV file here
        </Typography>

        <Box
          sx={{
            backgroundColor: "#f0f7ff",
            border: "1px solid #d1e7ff",
            borderRadius: 2,
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center", 
            width: "100%"
          }}
        >
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
              CSV Format
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              Upload a CSV file with student data. The file should contain Name, Father Name,
              Mother Name, DOB, Class, Gender, School UDISE Code, APAR ID, and Hostel information.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FileUploadStep;