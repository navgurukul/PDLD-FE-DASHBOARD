import { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  FormHelperText 
} from "@mui/material";
import { toast } from "react-toastify";

export default function AddSchool() {
  const [formData, setFormData] = useState({
    schoolName: "",
    udiseCode: "",
    clusterName: "",
    blockName: ""
  });

  const [errors, setErrors] = useState({
    schoolName: false,
    udiseCode: false,
    clusterName: false,
    blockName: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (value.trim()) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      schoolName: !formData.schoolName.trim(),
      udiseCode: !formData.udiseCode.trim(),
      clusterName: !formData.clusterName.trim(),
      blockName: !formData.blockName.trim()
    };
    
    setErrors(newErrors);
    
    // Return true if no errors (all fields filled)
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Process form submission
      toast.success("School created successfully!");
      onSave(formData);
      onClose();
    } else {
      toast.error("Please fill all required fields");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: "800px", margin: "0 auto" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: "#2F4F4F", mb: 1 }}>
        Add New School
      </Typography>
      <Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
        Create a school by filling in the details below
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#2F4F4F", mb: 3 }}>
          Add New School
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", mb: 4 }}>
          Create a school by filling in the details below
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <Box>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
              School Name *
            </Typography>
            <TextField
              fullWidth
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              error={errors.schoolName}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            {errors.schoolName && (
              <FormHelperText error>School name is required</FormHelperText>
            )}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
              UDISE Code *
            </Typography>
            <TextField
              fullWidth
               size="small"
              name="udiseCode"
              value={formData.udiseCode}
              onChange={handleChange}
              placeholder="Enter UDISE code"
              error={errors.udiseCode}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            {errors.udiseCode && (
              <FormHelperText error>UDISE code is required</FormHelperText>
            )}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
              Cluster Name *
            </Typography>
            <TextField
              fullWidth
               size="small"
              name="clusterName"
              value={formData.clusterName}
              onChange={handleChange}
              placeholder="Enter cluster name"
              error={errors.clusterName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            {errors.clusterName && (
              <FormHelperText error>Cluster name is required</FormHelperText>
            )}
          </Box>

          <Box>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
              Block Name *
            </Typography>
            <TextField
              fullWidth
               size="small"
              name="blockName"
              value={formData.blockName}
              onChange={handleChange}
              placeholder="Enter block name"
              error={errors.blockName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            {errors.blockName && (
              <FormHelperText error>Block name is required</FormHelperText>
            )}
          </Box>
        </Box>

        <div style={{display:"flex", justifyContent:"center"}} >
        <Button
          variant="contained"
           size="small"
          onClick={handleSubmit}
          sx={{
            bgcolor: "#FFD700",
            color: "black",
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'medium',
            boxShadow: 'md',
            '&:hover': {
              bgcolor: "#E6C200",
            }
          }}
        >
          Create School
        </Button>
        </div>
      </Paper>
    </Box>
  );
}