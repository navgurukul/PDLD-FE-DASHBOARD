import React from "react";
import { Box, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CSVMapper from "./CSVMapper";

const ColumnMappingStep = ({ 
  file, 
  totalUploadCount, 
  confirmFileRemoval, 
  handleMappingComplete,
  handleBackStep
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.2,
          mb: 2,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography>
          {file.name} {totalUploadCount > 0 && `(${totalUploadCount} rows)`}
        </Typography>
        <Button
          variant="text"
          color="error"
          startIcon={<CloseIcon />}
          onClick={confirmFileRemoval}
          size="small"
        >
          Remove
        </Button>
      </Box>

      {/* CSV Mapper Component */}
      <CSVMapper 
        file={file} 
        onMappingComplete={handleMappingComplete}
        entityType="student"
      />

      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBackStep}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default ColumnMappingStep;