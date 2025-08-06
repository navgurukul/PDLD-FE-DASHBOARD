import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormHelperText,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import apiInstance from "../../api";
import ButtonCustom from "./ButtonCustom";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function AddSchool({ onClose, onSave }) {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    schoolName: "",
    udiseCode: "",
    clusterName: "",
    blockName: "",
    crcCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingSchool, setFetchingSchool] = useState(false);
  const [blocksData, setBlocksData] = useState([]);
  const [availableClusters, setAvailableClusters] = useState([]);
  const [blockInput, setBlockInput] = useState("");
  const [clusterInput, setClusterInput] = useState("");
  const [allClusters, setAllClusters] = useState([]);

  const [errors, setErrors] = useState({
    schoolName: false,
    udiseCode: false,
    clusterName: false,
    blockName: false,
    crcCode: false,
  });

  // Fetch blocks and clusters data on component mount
  useEffect(() => {
    fetchBlocksAndClusters();
  }, []);

  // Extract all unique clusters from all blocks
  useEffect(() => {
    if (blocksData.length > 0) {
      const allClusterNames = blocksData.flatMap((block) =>
        block.clusters.map((cluster) => ({
          id: cluster.name,
          name: cluster.name,
        }))
      );

      // Remove duplicates
      const uniqueClusters = allClusterNames.filter(
        (cluster, index, self) => self.findIndex((c) => c.id === cluster.id) === index
      );

      setAllClusters(uniqueClusters);
    }
  }, [blocksData]);

  // Update available clusters when block changes
  useEffect(() => {
    if (formData.blockName && blocksData.length > 0) {
      loadAvailableClusters(formData.blockName);
    }
  }, [formData.blockName, blocksData]);

  const fetchBlocksAndClusters = async () => {
    try {
      const response = await apiInstance.get("/user/dropdown-data");
      if (response.data && response.data.success) {
        setBlocksData(response.data.data);
      } else {
        console.error("Failed to fetch blocks and clusters:", response.data?.message);
      }
    } catch (error) {
      console.error("Error fetching blocks and clusters:", error);
      toast.error("Failed to load blocks and clusters data");
    }
  };

  const loadAvailableClusters = (blockName) => {
    if (!blockName || !blocksData.length) return;

    // Find the selected block in the data
    const selectedBlock = blocksData.find(
      (block) => block.blockName.toLowerCase() === blockName.toLowerCase()
    );

    if (selectedBlock) {
      // Format clusters for the dropdown
      const clusters = selectedBlock.clusters.map((cluster) => ({
        id: cluster.name,
        name: cluster.name,
      }));
      setAvailableClusters(clusters);
    } else {
      setAvailableClusters([]);
    }
  };

  // Check for school data - either from route state or fetch from API
  useEffect(() => {
    if (schoolId) {
      // If we have school data in location state, use that
      if (location.state?.schoolData) {
        const schoolData = location.state.schoolData;
        setFormData({
          schoolName: schoolData.schoolName || "",
          udiseCode: schoolData.udiseCode || "",
          clusterName: schoolData.clusterName || "",
          blockName: schoolData.blockName || "",
          crcCode: schoolData.crcCode || "",
        });
        setBlockInput(schoolData.blockName || "");
        setClusterInput(schoolData.clusterName || "");
      } else {
        // Otherwise fetch from API
        setFetchingSchool(true);
        apiInstance
          .get(`/school/${schoolId}`)
          .then((response) => {
            if (response.data && response.data.data) {
              const schoolData = response.data.data;
              setFormData({
                schoolName: schoolData.schoolName || "",
                udiseCode: schoolData.udiseCode || "",
                clusterName: schoolData.clusterName || "",
                blockName: schoolData.blockName || "",
                crcCode: schoolData.crcCode || "",
              });
              setBlockInput(schoolData.blockName || "");
              setClusterInput(schoolData.clusterName || "");
            } else {
              toast.error("Failed to fetch school data");
              navigate("/schools");
            }
          })
          .catch((error) => {
            console.error("Error fetching school data:", error);
            toast.error("Error fetching school data");
            navigate("/schools");
          })
          .finally(() => {
            setFetchingSchool(false);
          });
      }
    }
  }, [schoolId, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For UDISE, only allow numeric input
    if (name === "udiseCode" && value !== "" && !/^\d+$/.test(value)) {
      return; // Don't update state if non-numeric characters are entered
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (value.trim()) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  // Handle creating a new block
  const handleCreateNewBlock = (newBlockName) => {
    const trimmedBlockName = newBlockName.trim();

    // Check if the block name already exists (case-insensitive)
    const isDuplicate = blocksData.some(
      (block) => block.blockName.toLowerCase() === trimmedBlockName.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`Block "${trimmedBlockName}" already exists!`);
      return; // Prevent duplicate addition
    }

    if (trimmedBlockName) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        blockName: trimmedBlockName,
        clusterName: "", // Reset cluster when block changes
      }));
      setBlockInput(trimmedBlockName);
      setClusterInput("");

      toast.success(`New block "${trimmedBlockName}" added successfully!`);

      setErrors((prevErrors) => ({
        ...prevErrors,
        blockName: false,
      }));
    }
  };

  // Handle creating a new cluster
  const handleCreateNewCluster = (newClusterName) => {
    const trimmedClusterName = newClusterName.trim();

    // Check if the cluster name already exists (case-insensitive)
    const isDuplicate = allClusters.some(
      (cluster) => cluster.name.toLowerCase() === trimmedClusterName.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`Cluster "${trimmedClusterName}" already exists!`);
      return; // Prevent duplicate addition
    }

    if (trimmedClusterName) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        clusterName: trimmedClusterName,
      }));
      setClusterInput(trimmedClusterName);

      toast.success(`New cluster "${trimmedClusterName}" added successfully!`);

      setErrors((prevErrors) => ({
        ...prevErrors,
        clusterName: false,
      }));
    }
  };

  const isValidName = (value) => {
    const nameRegex = /^[a-zA-Z][a-zA-Z\s'-]*[a-zA-Z0-9]*$/;
    return nameRegex.test(value);
  };

  const startsWithAlphabet = (value) => {
    return /^[a-zA-Z]/.test(value.trim());
  };

  // Validation function for minimum length
  const hasMinimumLength = (value, minLength = 2) => {
    return value.trim().length >= minLength;
  };

  const handleBlockChange = (event, newValue) => {
    if (typeof newValue === "string") {
      const trimmedValue = newValue.trim();

      // Check if input starts with alphabet
      if (trimmedValue && !startsWithAlphabet(trimmedValue)) {
        toast.error("Block name must start with an alphabet");
        return; // Don't update state
      }

      // Check if input follows the valid pattern
      if (trimmedValue && !isValidName(trimmedValue)) {
        toast.error("Block name can only contain letters, spaces, and numbers at the end");
        return; // Don't update state
      }

      // Check minimum length when user stops typing
      if (trimmedValue && !hasMinimumLength(trimmedValue)) {
        setErrors({
          ...errors,
          blockName: true,
        });
      } else {
        setErrors({
          ...errors,
          blockName: false,
        });
      }

      setFormData({
        ...formData,
        blockName: trimmedValue,
        clusterName: "", // Reset cluster when block changes
      });
      setBlockInput(trimmedValue);
      setClusterInput("");
    }
    // Handle "Create new" option
    else if (newValue && newValue.isCreateNew) {
      const blockName = newValue.blockName.trim();

      if (!startsWithAlphabet(blockName)) {
        toast.error("Block name must start with an alphabet");
        return;
      }

      if (!isValidName(blockName)) {
        toast.error("Block name can only contain letters, spaces, and numbers at the end");
        return;
      }

      if (!hasMinimumLength(blockName)) {
        toast.error("Block name must be at least 2 characters long");
        return;
      }

      handleCreateNewBlock(blockName);
    }
    // Handle existing block selection
    else if (newValue && newValue.blockName) {
      setFormData({
        ...formData,
        blockName: newValue.blockName,
        clusterName: "",
      });
      setBlockInput(newValue.blockName);
      setClusterInput("");
      setErrors({
        ...errors,
        blockName: false,
      });
    } else {
      setFormData({
        ...formData,
        blockName: "",
        clusterName: "",
      });
      setBlockInput("");
      setClusterInput("");
    }
  };

  // Handle cluster selection changes
  const handleClusterChange = (event, newValue) => {
    // Handle string input (direct typing)
    if (typeof newValue === "string") {
      const trimmedValue = newValue.trim();

      // Check if input starts with alphabet
      if (trimmedValue && !startsWithAlphabet(trimmedValue)) {
        toast.error("Cluster name must start with an alphabet");
        return; // Don't update state
      }

      // Check if input follows the valid pattern
      if (trimmedValue && !isValidName(trimmedValue)) {
        toast.error("Cluster name can only contain letters, spaces, and numbers at the end");
        return; // Don't update state
      }

      // Check minimum length
      if (trimmedValue && !hasMinimumLength(trimmedValue)) {
        setErrors({
          ...errors,
          clusterName: true,
        });
      } else {
        setErrors({
          ...errors,
          clusterName: false,
        });
      }

      setFormData({
        ...formData,
        clusterName: trimmedValue,
      });
      setClusterInput(trimmedValue);
    }
    // Handle "Create new" option
    else if (newValue && newValue.isCreateNew) {
      const clusterName = newValue.name.trim();

      if (!startsWithAlphabet(clusterName)) {
        toast.error("Cluster name must start with an alphabet");
        return;
      }

      if (!isValidName(clusterName)) {
        toast.error("Cluster name can only contain letters, spaces, and numbers at the end");
        return;
      }

      if (!hasMinimumLength(clusterName)) {
        toast.error("Cluster name must be at least 2 characters long");
        return;
      }

      handleCreateNewCluster(clusterName);
    }
    // Handle existing cluster selection
    else if (newValue && newValue.name) {
      setFormData({
        ...formData,
        clusterName: newValue.name,
      });
      setClusterInput(newValue.name);
      setErrors({
        ...errors,
        clusterName: false,
      });
    }
    // Handle clearing selection
    else {
      setFormData({
        ...formData,
        clusterName: "",
      });
      setClusterInput("");
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const validateForm = () => {
    const newErrors = {
      schoolName: !formData.schoolName.trim(),
      udiseCode: !formData.udiseCode.trim(),
      blockName:
        !formData.blockName.trim() ||
        !hasMinimumLength(formData.blockName) ||
        !startsWithAlphabet(formData.blockName) ||
        !isValidName(formData.blockName),
      clusterName:
        !formData.clusterName.trim() ||
        !hasMinimumLength(formData.clusterName) ||
        !startsWithAlphabet(formData.clusterName) ||
        !isValidName(formData.clusterName),
        crcCode: !formData.crcCode.trim(),
    };

    // Specific error messages for block name
    if (formData.blockName.trim()) {
      if (!startsWithAlphabet(formData.blockName)) {
        toast.error("Block name must start with an alphabet");
        return false;
      }
      if (!isValidName(formData.blockName)) {
        toast.error("Block name can only contain letters, spaces, and numbers at the end");
        return false;
      }
      if (!hasMinimumLength(formData.blockName)) {
        toast.error("Block name must be at least 2 characters long");
        return false;
      }
    }

    // Specific error messages for cluster name
    if (formData.clusterName.trim()) {
      if (!startsWithAlphabet(formData.clusterName)) {
        toast.error("Cluster name must start with an alphabet");
        return false;
      }
      if (!isValidName(formData.clusterName)) {
        toast.error("Cluster name can only contain letters, spaces, and numbers at the end");
        return false;
      }
      if (!hasMinimumLength(formData.clusterName)) {
        toast.error("Cluster name must be at least 2 characters long");
        return false;
      }
    }

    // UDISE code length validation
    if (formData.udiseCode.trim().length !== 11) {
      newErrors.udiseCode = true;
      toast.error("UDISE MUST BE 11 digits");
      return false;
    }

    // CRC code validation (10 digits, numeric only)
    if (formData.crcCode.trim().length !== 10) {
      newErrors.crcCode = true;
      toast.error("CRC Code must be exactly 10 digits");
      return false;
    }
    if (!/^\d+$/.test(formData.crcCode.trim())) {
      newErrors.crcCode = true;
      toast.error("CRC Code can only contain numbers");
      return false;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);

        // Prepare payload based on the expected structure
        const payload = {
          schoolName: formData.schoolName,
          udiseCode: formData.udiseCode,
          blockName: formData.blockName,
          clusterName: formData.clusterName,
          crcCode: formData.crcCode,
        };

        let response;

        // For the update existing school case (when schoolId exists)
        if (schoolId) {
          try {
            // Update existing school
            response = await apiInstance.put(`/school/update/${schoolId}`, payload);

            // Success message
            toast.success("School updated successfully!");

            // Call onSave if provided
            if (onSave && typeof onSave === "function") {
              onSave(response.data?.data || formData);
            }

            // Force immediate navigation
            setTimeout(() => {
              navigate("/schools", {
                state: { successMessage: "School updated successfully!" },
                replace: true, // Force navigation
              });
            }, 100);
          } catch (error) {
            console.log(error, "ERROR");
          }
        } else {
          // Create new school
          response = await apiInstance.post("/school/add", payload);

          // Check response status and show appropriate message
          if (response.status === 200 || response.status === 201) {
            toast.success("School created successfully!");

            // Call onSave with the created school data if needed
            if (onSave && typeof onSave === "function") {
              onSave(response.data?.data || formData);
            }

            // Close the form or navigate away
            if (onClose && typeof onClose === "function") {
              onClose();
            } else {
              // Navigate back to schools list
              navigate("/schools", {
                state: { successMessage: "School created successfully!" },
              });
            }
          } else {
            // Handle unexpected success responses
            toast.warning(
              "Request succeeded but with an unexpected response. Please verify the school was created."
            );
          }
        }
      } catch (error) {
        // Handle error cases
        console.error(schoolId ? "Error updating school:" : "Error creating school:", error);

        // Show appropriate error message based on the error response
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorMessage =
            error.response.data?.error ||
            (schoolId
              ? "Failed to update school. Please try again."
              : "Failed to create school. Please try again.");
          toast.error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("Server did not respond. Please check your connection and try again.");
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error(
            schoolId
              ? "An error occurred while updating the school. Please try again."
              : "An error occurred while creating the school. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please fill all required fields");
    }
  };

  if (fetchingSchool) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Filter function for autocomplete - only shows "Create new" when no partial matches exist
  const filterBlockOptions = (options, params) => {
    if (!params.inputValue) {
      return options;
    }

    const inputValue = params.inputValue.toLowerCase().trim();

    // Remove "Create new:" prefix if it exists in the input
    const cleanInputValue = inputValue.replace(/^create new:\s*/i, "").trim();

    // If the cleaned input is empty, return all options
    if (!cleanInputValue) {
      return options;
    }

    // Check for any partial matches (case-insensitive) using the cleanInput
    const partialMatches = options.filter((option) =>
      option.blockName.toLowerCase().includes(cleanInputValue)
    );

    // If we have any partial matches, just return those without adding "Create new"
    if (partialMatches.length > 0) {
      return partialMatches;
    }

    // Check if there's an exact match (case-insensitive) using the clean input
    const exactMatch = options.some((option) => option.blockName.toLowerCase() === cleanInputValue);

    // Only add "Create new" option if there are no partial matches, no exact match,
    // and the clean input is valid for creation
    if (!exactMatch && cleanInputValue && cleanInputValue.length >= 1) {
      return [
        {
          blockName: cleanInputValue, // Use clean input without "Create new:" prefix
          isCreateNew: true,
        },
      ];
    }

    return []; // Return empty array if no matches and input is not valid for creation
  };

  // Filter function for cluster autocomplete - only shows "Create new" when no partial matches exist
  const filterClusterOptions = (options, params) => {
    if (!params.inputValue) {
      return options;
    }

    const inputValue = params.inputValue.toLowerCase().trim();

    // Remove "Create new:" prefix if it exists in the input
    const cleanInputValue = inputValue.replace(/^create new:\s*/i, "").trim();

    // If the cleaned input is empty, return all options
    if (!cleanInputValue) {
      return options;
    }

    // Check for any partial matches (case-insensitive) using the clean input
    const partialMatches = options.filter((option) =>
      option.name.toLowerCase().includes(cleanInputValue)
    );

    // If we have any partial matches, just return those without adding "Create new"
    if (partialMatches.length > 0) {
      return partialMatches;
    }

    // Check if there's an exact match (case-insensitive) using the clean input
    const exactMatch = options.some((option) => option.name.toLowerCase() === cleanInputValue);

    // Only add "Create new" option if there are no partial matches, no exact match,
    // and the clean input is valid for creation
    if (!exactMatch && cleanInputValue && cleanInputValue.length >= 1) {
      return [
        {
          name: cleanInputValue, // Use clean input without "Create new:" prefix
          isCreateNew: true,
        },
      ];
    }

    return []; // Return empty array if no matches and input is not valid for creation
  };

  const getBlockOptionLabel = (option) => {
    if (typeof option === "string") {
      return option.replace(/^create new:\s*/i, "").trim();
    }
    if (option.isCreateNew) {
      return option.blockName;
    }
    return option.blockName || "";
  };

  const getClusterOptionLabel = (option) => {
    if (typeof option === "string") {
      return option.replace(/^create new:\s*/i, "").trim();
    }
    if (option.isCreateNew) {
      return option.name;
    }
    return option.name || "";
  };

  // Real-time duplicate validation for block input
  const handleBlockInputChange = (event, newInputValue) => {
    const cleanValue = newInputValue.trim();

    // Check if the user is typing (not selecting from dropdown)
    if (event && event.type === "change") {
      // Check for duplicate block name in real-time
      const isDuplicate = blocksData.some(
        (block) => block.blockName.toLowerCase() === cleanValue.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`Block "${cleanValue}" already exists!`);
        return; // Prevent further processing
      }
    }

    setBlockInput(cleanValue);
    setFormData((prevFormData) => ({
      ...prevFormData,
      blockName: cleanValue,
      clusterName: "", // Reset cluster when block changes
    }));
  };

  // Real-time duplicate validation for cluster input
  const handleClusterInputChange = (event, newInputValue) => {
    const cleanValue = newInputValue.trim();

    // Check if the user is typing (not selecting from dropdown)
    if (event && event.type === "change") {
      // Check for duplicate cluster name in real-time
      const isDuplicate = allClusters.some(
        (cluster) => cluster.name.toLowerCase() === cleanValue.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(`Cluster "${cleanValue}" already exists!`);
        return; // Prevent further processing
      }
    }

    setClusterInput(cleanValue);
    setFormData((prevFormData) => ({
      ...prevFormData,
      clusterName: cleanValue,
    }));
  };

  return (
    <Box sx={{ py: 3, px: 1, maxWidth: "700px", margin: "0 auto" }}>
      <h5 className="text-lg font-bold text-[#2F4F4F]">
        {schoolId ? "Edit School" : "Add New School"}
      </h5>
      <Typography variant="body1" sx={{ color: "#666", mb: 1 }}>
        {schoolId
          ? "Update school details below"
          : "Create a school by filling in the details below"}
      </Typography>

      <Box sx={{ py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
          <Box>
            <TextField
              fullWidth
              label="School Name"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              error={errors.schoolName}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "48px",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "16px",
                },
              }}
            />
            {errors.schoolName && <FormHelperText error>School name is required</FormHelperText>}
          </Box>

          <Box>
            <TextField
              fullWidth
              label="UDISE Code"
              name="udiseCode"
              value={formData.udiseCode}
              onChange={handleChange}
              placeholder="Enter UDISE code"
              error={errors.udiseCode}
              disabled={!!schoolId}
              type="tel"
              inputProps={{
                maxLength: 11,
                inputMode: "numeric",
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "48px",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "16px",
                },
              }}
            />
            {errors.udiseCode && <FormHelperText error>UDISE code is required</FormHelperText>}
          </Box>

          <Box className="h-full">
            <Autocomplete
              freeSolo
              options={blocksData}
              filterOptions={filterBlockOptions}
              getOptionLabel={getBlockOptionLabel} // Use the fixed function
              value={formData.blockName || null}
              inputValue={blockInput}
              onInputChange={handleBlockInputChange} // Use the new handler
              onChange={handleBlockChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Block Name"
                  placeholder="Search or add new block"
                  required
                  error={errors.blockName}
                  helperText={
                    errors.blockName
                      ? "Block name is required"
                      : "Type to search, or select 'Create new' option for a new block"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      height: "48px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "16px",
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li
                  style={{
                    fontSize: "16px",
                    fontWeight: option.isCreateNew ? "bold" : "normal",
                    color: option.isCreateNew ? "#2F4F4F" : "inherit",
                  }}
                  {...props}
                >
                  {option.isCreateNew
                    ? `Create new: ${capitalizeFirstLetter(option.blockName)}` // Show "Create new:" only in dropdown
                    : capitalizeFirstLetter(option.blockName)}
                </li>
              )}
            />
          </Box>

          <Box>
            <Autocomplete
              freeSolo
              disabled={!formData.blockName}
              options={availableClusters.length > 0 ? availableClusters : allClusters}
              filterOptions={filterClusterOptions}
              getOptionLabel={getClusterOptionLabel} // Use the fixed function
              value={formData.clusterName || null}
              inputValue={clusterInput}
              onInputChange={handleClusterInputChange} // Use the new handler
              onChange={handleClusterChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cluster Name"
                  placeholder="Search or add new cluster"
                  required
                  error={errors.clusterName}
                  helperText={
                    errors.clusterName
                      ? "Cluster name is required"
                      : "Type to search, or select 'Create new' option for a new cluster"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      height: "48px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "16px",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "16px",
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li
                  style={{
                    fontSize: "16px",
                    fontWeight: option.isCreateNew ? "bold" : "normal",
                    color: option.isCreateNew ? "#2F4F4F" : "inherit",
                  }}
                  {...props}
                >
                  {option.isCreateNew
                    ? `Create new: ${capitalizeFirstLetter(option.name)}` // Show "Create new:" only in dropdown
                    : capitalizeFirstLetter(option.name)}
                </li>
              )}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="CRC Code"
              name="crcCode"
              value={formData.crcCode}
              onChange={(e) => {
                // Only allow numbers and limit to 10 digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleChange({ target: { name: 'crcCode', value } });
              }}
              placeholder="Enter 10-digit CRC code"
              error={errors.crcCode}
              disabled={!!schoolId}
              inputProps={{
                maxLength: 10,
                pattern: "[0-9]*",
                inputMode: "numeric"
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "48px",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "16px",
                },
                "& .MuiInputBase-input": {
                  fontSize: "16px",
                },
              }}
            />
            {errors.crcCode && (
              <FormHelperText error>
                {formData.crcCode.trim() === "" 
                  ? "CRC code is required" 
                  : formData.crcCode.trim().length !== 10 
                    ? "CRC code must be exactly 10 digits" 
                    : "CRC code can only contain numbers"
                }
              </FormHelperText>
            )}
          </Box>
        </Box>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "65px" }}>
          <ButtonCustom
            text={
              loading
                ? schoolId
                  ? "Updating..."
                  : "Creating..."
                : schoolId
                ? "Update School"
                : "Add School"
            }
            onClick={handleSubmit}
          />
        </div>
      </Box>
      <ToastContainer
        style={{ zIndex: 99999999 }}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
      />
    </Box>
  );
}