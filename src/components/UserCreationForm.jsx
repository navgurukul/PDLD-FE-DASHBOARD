import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  Typography,
  Paper,
  Tooltip,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiInstance from "../../api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "./ButtonCustom";
import { toast, ToastContainer } from "react-toastify";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // backgroundColor: "#007BFF",
          color: "white",
          "&:hover": {
            backgroundColor: "#0069D9",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2F4F4F",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "#2F4F4F",
          },
        },
      },
    },
  },
});

export default function UserCreationForm() {
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId if it exists for edit mode
  const location = useLocation();
  const userData = location.state?.userData; // Get userData passed from the table

  // Check if we're in edit mode
  const isEditMode = !!userId;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    block: "",
    cluster: "",
    school: "",
    username: "",
  });

  const [blocksData, setBlocksData] = useState([]);
  const [totalSchoolsSelected, setTotalSchoolsSelected] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmAction: null,
  });

  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [availableClusters, setAvailableClusters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState({
    blocks: [],
    clusters: "",
    schools: [],
  });

  const [hierarchyFields, setHierarchyFields] = useState({
    showBlock: false,
    showCluster: false,
    showSchool: false,
  });

  const roles = [
    { value: "DO", label: "District Officer" },
    { value: "BO", label: "Block Officer" },
    { value: "CP", label: "Cluster Principal" },
    { value: "CAC", label: "Cluster Academic Coordinator" },
  ];

  useEffect(() => {
    if (isEditMode && formData.block && blocksData.length > 0) {
      loadAvailableClusters(formData.block);
    }
  }, [blocksData, isEditMode, formData.block]);

  // Fetch blocks and clusters data on component mount
  useEffect(() => {
    fetchBlocksAndClusters();

    // If in edit mode, initialize the form with user data
    if (isEditMode) {
      if (userData) {
        // Use data passed from the table
        initializeFormWithUserData(userData);
      } else {
        // Fetch user data from API if not passed via state
        fetchUserData(userId);
      }
    }
  }, [isEditMode, userId, userData]);

  // Fetch user data from API for edit mode
  const fetchUserData = async (userId) => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get(`/user/${userId}`);

      if (response.data && response.data.success) {
        initializeFormWithUserData(response.data.data);
      } else {
        toast.error("Failed to load user data");
        navigate("/users");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
      navigate("/users");
    } finally {
      setIsLoading(false);
    }
  };

  // Map API role format to form format
  const mapAPIRoleToFormFormat = (apiRole) => {
    const roleMap = {
      DISTRICT_OFFICER: "DO",
      BLOCK_OFFICER: "BO",
      CLUSTER_PRINCIPAL: "CP",
      CAC: "CAC",
    };

    return roleMap[apiRole] || apiRole;
  };

  // Update total schools when selected clusters change
  useEffect(() => {
    calculateTotalSchools();
  }, [selectedEntities.clusters, formData.block, formData.role, blocksData]);

  // Calculate total schools for selected clusters or blocks
  const calculateTotalSchools = () => {
    // If cluster is selected, calculate based on cluster
    if (selectedEntities.clusters && blocksData.length > 0) {
      let totalSchools = 0;
      const selectedBlock = blocksData.find((block) => block.blockName === formData.block);

      if (selectedBlock) {
        const cluster = selectedBlock.clusters.find((c) => c.name === selectedEntities.clusters);
        if (cluster) {
          totalSchools = cluster.totalSchool;
        }
      }

      setTotalSchoolsSelected(totalSchools);
      return;
    }

    // If only block is selected (for Block Officer role), use totalSchoolInBlock
    if (formData.block && formData.role === "BO" && blocksData.length > 0) {
      const selectedBlock = blocksData.find(
        (block) => block.blockName.toLowerCase() === formData.block.toLowerCase()
      );

      if (selectedBlock && selectedBlock.totalSchoolInBlock) {
        setTotalSchoolsSelected(selectedBlock.totalSchoolInBlock);
        return;
      }
    }

    // Default case - no schools selected
    setTotalSchoolsSelected(0);
  };

  // Update hierarchy fields based on role
  const updateHierarchyFieldsBasedOnRole = (role) => {
    switch (role) {
      case "DO":
        setHierarchyFields({
          showBlock: false,
          showCluster: false,
          showSchool: false,
        });
        break;
      case "BO":
        setHierarchyFields({
          showBlock: true,
          showCluster: false,
          showSchool: false,
        });
        break;
      case "CP":
      case "CAC":
        setHierarchyFields({
          showBlock: true,
          showCluster: true,
          showSchool: false,
        });
        break;
      default:
        setHierarchyFields({
          showBlock: false,
          showCluster: false,
          showSchool: false,
        });
    }
  };

  // Validation function - returns true if valid, false if invalid
  const validateForm = () => {
    // Validate full name
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    } else if (formData.fullName.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      toast.error("Full name should only contain letters and spaces");
      return false;
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate role
    if (!formData.role) {
      toast.error("Please select a role");
      return false;
    }

    // Validate block selection for roles that require it
    if (hierarchyFields.showBlock && !formData.block) {
      toast.error("Please select a block");
      return false;
    }

    // Validate cluster selection for roles that require it
    if (hierarchyFields.showCluster && !selectedEntities.clusters) {
      toast.error("Please select a cluster");
      return false;
    }

    return true;
  };

  // Handle role change to determine which fields to show
  const handleRoleChange = (event) => {
    const role = event.target.value;
    setFormData({ ...formData, role, block: "" });

    // Reset selections when role changes
    setSelectedEntities({
      blocks: [],
      clusters: "",
      schools: [],
    });

    // Update hierarchy fields based on role
    updateHierarchyFieldsBasedOnRole(role);
  };

  const fetchBlocksAndClusters = async () => {
    try {
      const response = await apiInstance.get("/user/dropdown-data");
      if (response.data && response.data.success) {
        const blocks = response.data.data;
        setBlocksData(blocks);

        // IMPORTANT FIX: After blocks are loaded, if we're in edit mode and have a block,
        // ensure we load available clusters for that block
        if (isEditMode && formData.block && blocks.length > 0) {
          const blockName = formData.block;
          const selectedBlock = blocks.find(
            (block) => block.blockName.toLowerCase() === blockName.toLowerCase()
          );

          if (selectedBlock) {
            const clusters = selectedBlock.clusters.map((cluster) => ({
              id: cluster.name,
              name: cluster.name,
              totalSchool: cluster.totalSchool,
              isCPAssigned: cluster.isCPAssigned,
              isCACAssigned: cluster.isCACAssigned,
            }));
            setAvailableClusters(clusters);
          }
        }
      } else {
        console.error("Failed to fetch blocks and clusters:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching blocks and clusters:", error);
      toast.error("Failed to load blocks and clusters data");
    }
  };

  const handleClusterChange = (event) => {
    // For single select, event.target.value will be a string
    const selectedCluster = event.target.value;

    setSelectedEntities({
      ...selectedEntities,
      clusters: selectedCluster,
      schools: [],
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Generate the username
  const generateUsername = (fullName, role) => {
    // Replace spaces with underscores and convert to lowercase
    const formattedName = fullName.trim().replace(/\s+/g, "_").toLowerCase();

    // Generate a random 3-digit number
    const randomDigits = Math.floor(100 + Math.random() * 900);

    // Map role values to role codes
    const roleMap = {
      DO: "DO",
      BO: "BO",
      CP: "CP",
      CAC: "CAC",
    };

    // Create the username
    return `${formattedName}_${roleMap[role]}_${randomDigits}`;
  };

  // Helper function to map role codes to API format
  const mapRoleToAPIFormat = (role) => {
    const roleMap = {
      DO: "DISTRICT_OFFICER",
      BO: "BLOCK_OFFICER",
      CP: "CLUSTER_PRINCIPAL",
      CAC: "CAC",
    };

    return roleMap[role] || role;
  };

  // Submit form data to API
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        // EDIT MODE: Prepare data for update
        const updateData = {
          username: formData.username,
          name: formData.fullName,
          role: mapRoleToAPIFormat(formData.role),

          assignedBlocks: formData.block ? [formData.block] : [],
          assignedClusters: selectedEntities.clusters ? [selectedEntities.clusters] : [],
          schoolsMapped: totalSchoolsSelected,
        };

        if (formData.email) {
          updateData.email = formData.email;
        }

        // Call update API
        const response = await apiInstance.put(`/user/update/${userId}`, updateData);
        console.log("User updated:", response.data);
        toast.success("User updated successfully!");
      } else {
        // CREATE MODE: Generate the username for new user
        const username = generateUsername(formData.fullName, formData.role);

        // Prepare data for creating new user
        const userData = {
          username: username,
          password: formData.password || "default_password", // Use provided password or default
          name: formData.fullName,
          role: mapRoleToAPIFormat(formData.role),

          assignedBlocks: formData.block ? [formData.block] : [],
          assignedClusters: selectedEntities.clusters ? [selectedEntities.clusters] : [],
          schoolsMapped: totalSchoolsSelected,
        };

        if (formData.email) {
          userData.email = formData.email;
        }

        // Call create API
        const response = await apiInstance.post("/user/add", userData);
        console.log("User created:", response.data);
        toast.success("User created successfully!");
      }

      // Navigate back to users page with success message
      navigate("/users", {
        state: {
          successMessage: isEditMode ? "User updated successfully!" : "User created successfully!",
        },
      });
    } catch (error) {
      console.error(isEditMode ? "Error updating user:" : "Error creating user:", error);
      const errorMessage =
        error.response?.data?.message ||
        (isEditMode
          ? "Failed to update user. Please try again."
          : "Failed to create user. Please try again.");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return ""; // Handle undefined/null values
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Function to check if a cluster is already assigned based on the current role
  const isClusterAlreadyAssigned = (cluster) => {
    if (formData.role === "CP") {
      return cluster.isCPAssigned;
    } else if (formData.role === "CAC") {
      return cluster.isCACAssigned;
    }
    return false;
  };

  const loadAvailableClusters = (blockName) => {
    if (!blockName || !blocksData.length) return;

    console.log(`Loading clusters for block: "${blockName}"`);
    console.log(
      "Available blocks in data:",
      blocksData.map((b) => `"${b.blockName}"`)
    );

    // Find exact match by blockName (case-sensitive for exact data match)
    const selectedBlock = blocksData.find((block) => block.blockName === blockName);

    if (selectedBlock) {
      console.log("✅ Found exact matching block:", selectedBlock.blockName);
      console.log("📊 Available clusters:", selectedBlock.clusters.length);
      console.log(
        "🏷️ Cluster names:",
        selectedBlock.clusters.map((c) => c.name)
      );

      const clusters = selectedBlock.clusters.map((cluster) => ({
        id: cluster.name,
        name: cluster.name,
        totalSchool: cluster.totalSchool || 0,
        isCPAssigned: cluster.isCPAssigned === true,
        isCACAssigned: cluster.isCACAssigned === true,
      }));

      setAvailableClusters(clusters);
    } else {
      blocksData.forEach((block, index) => {
        console.log(`  ${index + 1}. "${block.blockName}" (${block.clusters.length} clusters)`);
      });
      setAvailableClusters([]);
    }
  };

  const initializeFormWithUserData = (user) => {
    setIsLoading(true);

    // Map API role format to form role format
    const roleCode = mapAPIRoleToFormFormat(user.role);

    // IMPORTANT FIX: Check both assignedBlock and assignedBlocks arrays
    // The issue is your data has both assignedBlock and assignedBlocks fields
    const blockList =
      user.assignedBlocks && user.assignedBlocks.length > 0
        ? user.assignedBlocks
        : user.assignedBlock && user.assignedBlock.length > 0
        ? user.assignedBlock
        : [];

    const assignedBlock = blockList.length > 0 ? blockList[0] : "";

    console.log("User data:", user);
    console.log("Assigned block from user data:", assignedBlock);

    // Update hierarchy fields based on role first
    updateHierarchyFieldsBasedOnRole(roleCode);

    // Set form data with user values
    setFormData({
      fullName: user.name || "",
      email: user.email || "",
      role: roleCode,
      block: assignedBlock,
      username: user.username || "",
    });

    // Set selected entities
    setSelectedEntities({
      blocks: blockList,
      clusters:
        user.assignedClusters && user.assignedClusters.length > 0 ? user.assignedClusters[0] : "",
      schools: [],
    });

    // IMPORTANT FIX: Ensure we load available clusters for the assigned block
    if (assignedBlock && blocksData.length > 0) {
      loadAvailableClusters(assignedBlock);
    }

    setIsLoading(false);
  };

  // Updated handleBlockChange function with modal confirmation
  const handleBlockChange = (event) => {
    const selectedBlockName = event.target.value; // This should be exact blockName
    const previousBlock = formData.block;

    // Check if we have selected cluster that will be lost
    if (isEditMode && selectedEntities.clusters && previousBlock !== selectedBlockName) {
      setConfirmDialog({
        open: true,
        title: "Change Block?",
        message: `Changing the block from "${previousBlock}" to "${selectedBlockName}" will reset your cluster selection. Are you sure you want to proceed`,
        confirmAction: () => {
          setFormData({ ...formData, block: selectedBlockName });
          setSelectedEntities({
            ...selectedEntities,
            clusters: "",
            schools: [],
          });
          loadAvailableClusters(selectedBlockName);
          toast.info("Block changed. Cluster selection has been reset.");
        },
      });
    } else {
      // No confirmation needed, just make the change
      setFormData({ ...formData, block: selectedBlockName });
      setSelectedEntities({
        ...selectedEntities,
        clusters: "",
        schools: [],
      });
      loadAvailableClusters(selectedBlockName);
    }
  };

  useEffect(() => {
    if (blocksData.length > 0) {
      console.log("📋 Setting up available blocks:");

      // Use exact blockName for both id and display
      const blocks = blocksData.map((block) => {
        console.log(`  📁 "${block.blockName}" - ${block.clusters.length} clusters`);
        return {
          id: block.blockName, // Use exact blockName as ID
          name: block.blockName, // Use exact blockName for display
          clustersCount: block.clusters.length,
          schoolsCount: block.totalSchoolInBlock,
        };
      });

      setAvailableBlocks(blocks);

      // If there's a block selected, load its clusters
      if (formData.block) {
        loadAvailableClusters(formData.block);
      }
    }
  }, [blocksData, formData.block]);

  // Add this function to restore previously selected clusters
  // Improved handleRestoreClusters function
  const handleRestoreClusters = () => {
    // If in edit mode and we have user data, restore from original user data
    if (isEditMode && userData) {
      // Check if the current block matches the original user's block
      const originalBlock =
        userData.assignedBlocks && userData.assignedBlocks.length > 0
          ? userData.assignedBlocks[0]
          : userData.assignedBlock && userData.assignedBlock.length > 0
          ? userData.assignedBlock[0]
          : "";

      if (formData.block !== originalBlock) {
        // If blocks don't match, show a warning toast
        setConfirmDialog({
          open: true,
          title: "Cannot Restore Clusters",
          message: `You've changed the block from "${originalBlock}" to "${formData.block}". Clusters can only be restored for the original block.`,
          confirmAction: null,
        });
        return;
      }

      // Only restore if we have cluster to restore and it belongs to the current block
      if (userData.assignedClusters && userData.assignedClusters.length > 0) {
        // Take the first assigned cluster (since we only support single selection now)
        const originalCluster = userData.assignedClusters[0];

        // Check if the original cluster exists in the current availableClusters
        const isValidCluster = availableClusters.some(
          (cluster) => cluster.name === originalCluster
        );

        if (!isValidCluster) {
          toast.warning("The original cluster is not available in the current block");
          return;
        }

        toast.success("Original cluster restored");

        setSelectedEntities({
          ...selectedEntities,
          clusters: originalCluster,
        });
      } else {
        toast.info("No previous cluster to restore");
      }
    } else {
      // For non-edit mode, simply clear the selection
      setSelectedEntities({
        ...selectedEntities,
        clusters: "",
      });
    }
  };

  const renderBlockSelect = () => (
    <div className="mb-6">
      <FormControl fullWidth required>
        <InputLabel>Select Block</InputLabel>
        <Select
          sx={{
            height: "48px",
            "& .MuiSelect-select": {
              height: "48px",
              display: "flex",
              alignItems: "center",
            },
          }}
          value={formData.block || ""}
          onChange={handleBlockChange}
          label="Select Block"
          renderValue={(selected) => {
            // Show the exact selected blockName
            return selected || "Select a block";
          }}
        >
          {/* Map through blocksData directly to show exact blockName */}
          {blocksData.map((block) => (
            <MenuItem key={block.blockName} value={block.blockName}>
              {block.blockName} ({block.clusters.length} clusters, {block.totalSchoolInBlock}{" "}
              schools)
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      {isLoading && <SpinnerPageOverlay />}
      <Paper elevation={0} className="max-w-2xl mx-auto p-6 rounded-lg">
        <h5 className="text-lg font-bold text-[#2F4F4F]">
          {isEditMode ? "Edit User" : "Create New User"}
        </h5>
        <Typography variant="body1" className="text-gray-600 mb-6">
          {isEditMode
            ? "Update user information and role assignments"
            : "Create a new user with a specific role and map them to schools"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="Enter full name"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                },
              }}
            />
          </div>

          {isEditMode && (
            <div className="my-6">
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                disabled
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                    backgroundColor: "#f5f5f5",
                  },
                }}
              />
            </div>
          )}

          <div className="my-6">
            <TextField
              label="Email (Optional)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              placeholder="Enter email"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                },
              }}
            />
          </div>

          <div className="mb-6">
            <FormControl fullWidth required>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={formData.role}
                label="Role"
                onChange={handleRoleChange}
                sx={{
                  height: "48px",
                  "& .MuiSelect-select": {
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label} ({role.value})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {hierarchyFields.showBlock && (
            <div className="mb-6">
              <FormControl fullWidth required>
                <InputLabel>Select Block</InputLabel>
                <Select
                  sx={{
                    height: "48px",
                    "& .MuiSelect-select": {
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  value={formData.block || ""}
                  onChange={handleBlockChange}
                  label="Select Block"
                  renderValue={(selected) => selected || "Select a block"}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 180, // Even smaller - shows ~4-5 items
                        overflowY: "auto",
                      },
                    },
                  }}
                >
                  {blocksData.map((block) => (
                    <MenuItem
                      key={block.blockName}
                      value={block.blockName}
                      sx={{
                        fontSize: "14px",
                        py: 0.5, // Reduced vertical padding
                        minHeight: "40px", // Smaller item height
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <div style={{ fontWeight: 500 }}>{block.blockName}</div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {block.clusters.length} clusters • {block.totalSchoolInBlock} schools
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}

          {hierarchyFields.showCluster && formData.block && (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="subtitle1">Select Clusters in {formData.block}</Typography>
                  {isEditMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRestoreClusters}
                      sx={{
                        backgroundColor: "transparent !important",
                        borderColor: "#2F4F4F !important",
                        color: "#2F4F4F !important",
                        "&:hover": {
                          borderColor: "#2F4F4F !important",
                          backgroundColor: "#2F4F4F !important",
                          color: "white !important",
                        },
                      }}
                    >
                      Restore Previous Cluster
                    </Button>
                  )}
                </div>
                <FormControl fullWidth required>
                  <InputLabel>Select Cluster in {formData.block}</InputLabel>
                  <Select
                    sx={{
                      minHeight: "40px", // Changed from fixed height to minHeight
                      "& .MuiSelect-select": {
                        minHeight: "36px", // Changed from fixed height to minHeight
                        display: "flex",
                        alignItems: "flex-start", // Changed to flex-start for better alignment
                        paddingTop: "8px", // Add some top padding
                        paddingBottom: "1px", // Add some bottom padding
                      },
                    }}
                    value={selectedEntities.clusters}
                    onChange={handleClusterChange}
                    label={`Select Cluster in ${formData.block}`}
                    renderValue={(selected) => selected || "Select a cluster"}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {availableClusters.map((cluster) => {
                      // Check if this cluster is already assigned based on the role
                      const isAssigned = isClusterAlreadyAssigned(cluster);

                      // Need to use a different wrapper for disabled items vs. enabled items
                      // MUI doesn't allow disabled MenuItems in Tooltips directly
                      return isAssigned ? (
                        <Tooltip
                          key={cluster.id}
                          title={`This cluster already has a ${
                            formData.role === "CP"
                              ? "Cluster Principal"
                              : "Cluster Academic Coordinator"
                          } assigned`}
                          arrow
                        >
                          <div>
                            <MenuItem
                              value={cluster.id}
                              disabled={true}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                opacity: 0.5,
                                color: "#888888",
                                cursor: "not-allowed",
                              }}
                            >
                              {capitalizeFirstLetter(cluster.name)}
                              <Typography
                                variant="caption"
                                sx={{
                                  ml: 1,
                                  color: "#888",
                                  fontStyle: "italic",
                                }}
                              >
                                (Assigned)
                              </Typography>
                            </MenuItem>
                          </div>
                        </Tooltip>
                      ) : (
                        // Regular enabled item without Tooltip wrapper
                        <MenuItem
                          key={cluster.id}
                          value={cluster.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {capitalizeFirstLetter(cluster.name)}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            </>
          )}

          {(formData.block || selectedEntities.clusters) && (
            <div className="mb-6 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300 rounded-lg">
              <Typography variant="subtitle1" className="mb-4 font-semibold">
                Summary of Selected Entities
              </Typography>
              <div className="mb-2 flex">
                {formData.block && (
                  <Typography
                    variant="body2"
                    className="
									bg-gray-200 px-2 py-1 rounded-[50px] mr-2!"
                  >
                    1 Block ({formData.block})
                  </Typography>
                )}
                {selectedEntities.clusters && (
                  <Typography
                    variant="body2"
                    className="
									bg-gray-200 mx-4! px-2 py-1 rounded-[50px]"
                  >
                    1 Cluster ({selectedEntities.clusters})
                  </Typography>
                )}
                {totalSchoolsSelected > 0 && (
                  <Typography
                    variant="body2"
                    className="
									bg-gray-200 px-2 py-1 rounded-[50px]"
                  >
                    {totalSchoolsSelected} Schools
                  </Typography>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <ButtonCustom
              text={
                isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update User"
                  : "Add User"
              }
              onClick={handleSubmit}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Paper>
      <DeleteConfirmationModal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={() => {
          if (confirmDialog.confirmAction) {
            confirmDialog.confirmAction();
          }
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirm"
        cancelText="Cancel"
      />
      <ToastContainer
        style={{ zIndex: 99999999 }}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
      />
    </ThemeProvider>
  );
}
