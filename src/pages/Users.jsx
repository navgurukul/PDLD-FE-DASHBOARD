import { useState, useEffect } from "react";
import { useDebounce } from "../customHook/useDebounce";
import QRCode from "react-qr-code";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  PaginationItem,
  Modal,
  Box,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiInstance from "../../api";
import ButtonCustom from "../components/ButtonCustom";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import GenericConfirmationModal from "../components/DeleteConfirmationModal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { Search } from "lucide-react";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    // Change the highlight color from blue to "Text Primary" color style.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2F4F4F", // Use text.primary color on focus
          },
        },
        notchedOutline: {
          borderColor: "#ccc", // default border color
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#949494", // Default label color
          "&.Mui-focused": {
            color: "#2F4F4F", // Focused label color
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#2F4F4F", // Dropdown arrow icon color
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#2F4F4F",
          backgroundColor: "white",
          "&.Mui-selected": {
            backgroundColor: "#2F4F4F",
            color: "white",
          },
          "&:hover": {
            backgroundColor: "#A3BFBF",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "inherit !important",
            cursor: "default !important",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "none",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          color: "#2F4F4F",
        },
      },
    },
  },
});

export default function Users() {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Separate loading state for search
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalUsers: 0,
    totalPages: 1,
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Changed from fixed pageSize to state
  const [pageSize, setPageSize] = useState(15);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUser, setQrUser] = useState(null);
  const [qrCodeRef, setQrCodeRef] = useState(null);

  // Add page size change handler
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Helper function to capitalize first letter and make the rest lowercase
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Fetch global blocks and roles data for filters
  const fetchGlobalBlocksAndRoles = async () => {
    try {
      const response = await apiInstance.get("/user/dropdown-data");
      if (response.data && response.data.success) {
        const blocksData = response.data.data;

        // Extract unique blocks
        const uniqueBlocks = blocksData.map((block) => block.blockName).filter(Boolean).sort();
        setAvailableBlocks(uniqueBlocks);

        // You can also set available roles here if the API provides them
        // For now, keeping the existing role extraction logic
      } else {
        console.error("Failed to fetch blocks and roles:", response.data?.message);
      }
    } catch (error) {
      console.error("Error fetching blocks and roles:", error);
      toast.error("Failed to load blocks and roles data");
    }
  };

  // Extract unique roles from users (keeping existing logic for backward compatibility)
  useEffect(() => {
    if (users.length > 0) {
      const roles = [...new Set(users.map((user) => user.role))].filter(Boolean);
      setAvailableRoles(roles);

      // If blocks weren't loaded from global API, extract from users as fallback
      if (availableBlocks.length === 0) {
        const blocks = new Set();
        users.forEach((user) => {
          const blocksList = user.assignedBlocks || user.assignedBlock;
          if (blocksList && Array.isArray(blocksList)) {
            blocksList.forEach((block) => {
              if (block) blocks.add(capitalizeFirstLetter(block));
            });
          }
        });
        setAvailableBlocks([...blocks].sort());
      }
    }
  }, [users, availableBlocks.length]);

  // Call the function on component mount
  useEffect(() => {
    fetchGlobalBlocksAndRoles();
  }, []);

  const handleCreateUser = () => {
    navigate("/users/userCreationForm");
  };

  // Function to format role names for better display
  const formatRoleName = (role) => {
    if (!role) return "";

    const roleMap = {
      DISTRICT_OFFICER: "District Officer",
      BLOCK_OFFICER: "Block Officer",
      CLUSTER_PRINCIPAL: "Cluster Principal",
      CLUSTER_ACADEMIC_COORDINATOR: "Cluster Academic Coordinator",
      CAC: "Cluster Academic Coordinator",
    };

    return roleMap[role] || role.replace(/_/g, " ");
  };

  // Function to get short form of role names for dropdown
  const getRoleShortForm = (role) => {
    if (!role) return "";

    const roleShortFormMap = {
      DISTRICT_OFFICER: "District Officer",
      BLOCK_OFFICER: "Block Officer",
      CLUSTER_PRINCIPAL: "Cluster Principal",
      CLUSTER_ACADEMIC_COORDINATOR: "CAC",
    };

    return roleShortFormMap[role] || role.replace(/_/g, " ");
  };

  // Updated fetchData function with global search implementation
  const fetchData = async () => {
    const isSearching = debouncedSearchQuery && debouncedSearchQuery.trim() !== "";
    
    // Use different loading states for search vs other operations
    if (isSearching) {
      setIsSearchLoading(true);
    } else {
      setIsLoading(true);
    }

    try {
      let url;

      // Determine which API to call based on filters and search query
      if (debouncedSearchQuery.trim() !== "" || selectedRole || selectedBlock) {
        url = `/users/search?page=${currentPage}&pageSize=${pageSize}`;

        // Add search query if present
        if (debouncedSearchQuery.trim() !== "") {
          url += `&query=${encodeURIComponent(debouncedSearchQuery)}`;
        }

        // Add role and block filters if selected
        if (selectedRole) {
          url += `&role=${encodeURIComponent(selectedRole)}`;
        }
        if (selectedBlock) {
          url += `&block=${encodeURIComponent(selectedBlock)}`;
        }
      } else {
        // Default listing API
        url = `/users?page=${currentPage}&pageSize=${pageSize}`;
      }

      const response = await apiInstance.get(url);

      if (response.data?.success && response.data?.data) {
        // Extract users array from response
        const usersData = response.data.data.users || [];
        setUsers(usersData);

        // Extract pagination info
        const paginationData = response.data.data.pagination || {};
        setPagination(paginationData || {
          currentPage: 1,
          pageSize: pageSize,
          totalUsers: usersData.length,
          totalPages: 1,
        });
        setTotalRecords(paginationData.totalUsers || usersData.length);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      setIsLoading(false);
      setIsSearchLoading(false);
    }
  };

  // Updated useEffect to use the new fetchData function
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, debouncedSearchQuery, selectedRole, selectedBlock]);

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Delete user handler
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Call the API to delete the user
      await apiInstance.delete(`/user/delete/${userToDelete.userId || userToDelete.id}`);

      // Remove the user from the local state
      const updatedUsers = users.filter(
        (user) => (user.userId || user.id) !== (userToDelete.userId || userToDelete.id)
      );
      setUsers(updatedUsers);

      // Show success message and update pagination if needed
      toast.success(`"${userToDelete.name}" has been deleted successfully!`);

      if (updatedUsers.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // If we're on the last page and it's now empty, go back one page
        const totalPages = Math.ceil((totalRecords - 1) / pageSize);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else {
          // Otherwise, just refresh the current page
          fetchData();
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Error deleting user");
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Function to handle copying username and password
  const handleCopyCredentials = (user) => {
    const text = `Username: ${user.username}\nPassword: ${user.password}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Username and password copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
        toast.error("Failed to copy to clipboard");
      });
  };

  const getSchoolCount = (user) => {
    // First check if schoolsMapped is directly provided
    if (typeof user.schoolsMapped === "number") {
      return user.schoolsMapped;
    }

    // Otherwise check various arrays that might contain school info
    const managedCount = user.managedSchoolIds?.length || 0;
    const assignedCount = user.assignedSchools?.length || 0;

    return managedCount + assignedCount;
  };

  const resetFilters = () => {
    setSelectedRole("");
    setSelectedBlock("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const isAnyFilterActive = !!searchQuery.trim() || !!selectedRole || !!selectedBlock;

  const tableData = users.map((user) => ({
    id: user.userId || user.id,
    name: user.name || "N/A",
    username: user.username || "N/A",
    role: getRoleShortForm(user.role) || "N/A", // Use short form for role
    dateJoined: new Date(user.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    schoolsMapped: `${
      user.role === "DISTRICT_OFFICER" || user.role === "district_officer"
        ? "All"
        : getSchoolCount(user)
    } Schools`,
    password: user.password || "default123",
    status: user.isActive ? "Active" : "Inactive",
    blockName: `${
      user.role === "DISTRICT_OFFICER" || user.role === "district_officer"
        ? "All Blocks"
        : (user.assignedBlocks || user.assignedBlock)
            ?.map((b) => capitalizeFirstLetter(b))
            .join(", ") || "N/A"
    }`,
    assignedCluster: `${
      user.role === "DISTRICT_OFFICER" || user.role === "district_officer"
        ? "All Clusters"
        : user.assignedClusters?.map((c) => capitalizeFirstLetter(c)).join(", ") || "N/A"
    }`,
    actions: "Manage User",
    userObj: user, // Pass the entire user object for the delete modal
  }));

  const defaultCustomHeadLabelRender = (columnMeta) => (
    <span
      style={{
        color: "#2F4F4F",
        fontFamily: "'Work Sans'",
        fontWeight: 600,
        fontSize: "14px",
        fontStyle: "normal",
        textTransform: "none",
      }}
    >
      {columnMeta.label}
    </span>
  );
  // Add new columns for Block Name and Assigned Cluster
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false },
    },
    {
      name: "name",
      label: "Name",
      options: { sort: true },
    },

    {
      name: "role",
      label: "Role",
      options: { sort: true },
    },

    {
      name: "blockName", // New column for Block Name
      label: "Block",
      options: { sort: true },
    },
    {
      name: "assignedCluster", // New column for Assigned Cluster
      label: "Cluster",
      options: { sort: true },
    },
    {
      name: "schoolsMapped",
      label: "Schools Mapped",
      options: { sort: true },
    },
    {
      name: "username",
      label: "Username",
      options: {
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const userIndex = tableMeta.rowIndex;
          const user = users[userIndex];

          return (
            <div
              className="flex items-center gap-2"
              style={{
                justifyContent: "flex-start",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span style={{ textAlign: "left" }}>{value}</span>
              <Tooltip title="Copy username and password" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleCopyCredentials(user)}
                  sx={{ color: "#2F4F4F", padding: "2px" }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
        setCellHeaderProps: () => ({
          style: { textAlign: "left", paddingLeft: "16px" },
        }),
        setCellProps: () => ({
          style: { textAlign: "left", paddingLeft: "16px" },
        }),
      },
    },
    {
      name: "password",
      label: "Password",
      options: {
        display: false, // Hide the password column
      },
    },
    {
      name: "dateJoined",
      label: "Joined Date",
      options: { sort: true },
    },
    {
      name: "userObj", // Hidden column to store user object
      options: { display: false },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        customHeadRender: (columnMeta) => (
          <th
            style={{
              textAlign: "center",
              borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
            }}
            scope="col"
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#2F4F4F",
                fontFamily: "'Work Sans'",
                fontWeight: 600,
              }}
            >
              {columnMeta.label}
            </div>
          </th>
        ),
        customBodyRender: (value, tableMeta) => {
          const userId = tableMeta.rowData[0];
          const userIndex = tableMeta.rowIndex;
          const user = users[userIndex];

          return (
            <div className="flex gap-2 justify-center">
              {/* <Button
                variant="text"
                size="small"
                sx={{
                  color: "#2F4F4F",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => openQrModal(user)}
                title="Generate QR and Share"
              >
                <QrCode2Icon fontSize="small" />
              </Button> */}
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() =>
                  navigate(`/users/update-user/${userId}`, {
                    state: { userData: user },
                  })
                }
              >
                <img
                  src={EditPencilIcon}
                  alt="Edit"
                  style={{
                    width: 18,
                    height: 18,
                    minWidth: 20,
                    minHeight: 20,
                    objectFit: "contain",
                  }}
                />
              </button>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#d32f2f",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => openDeleteModal(user)}
              >
                <img
                  src={trash}
                  alt="Delete"
                  style={{
                    width: 18,
                    height: 18,
                    minWidth: 20,
                    minHeight: 20,
                    objectFit: "contain",
                  }}
                />
                &nbsp;
              </Button>
            </div>
          );
        },
      },
    },
  ];

  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadLabelRender = defaultCustomHeadLabelRender;
  });

  const options = {
    filter: false,
    search: false,
    responsive: "standard",
    selectableRows: "none",
    download: false,
    print: false,
    viewColumns: false,
    rowsPerPage: 10,
    pagination: false,
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleBlockChange = (e) => {
    setSelectedBlock(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const openQrModal = (user) => {
    setQrUser(user);
    setQrModalOpen(true);
  };

  const closeQrModal = () => {
    setQrModalOpen(false);
    setQrUser(null);
    setQrCodeRef(null);
  };

  // Function to convert QR code to blob and download
  const downloadQRCode = () => {
    if (!qrCodeRef || !qrUser) return;

    const svg = qrCodeRef.querySelector('svg');
    if (!svg) return;

    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const DOMURL = window.URL || window.webkitURL || window;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      // Download the image
      canvas.toBlob(function (blob) {
        const link = document.createElement('a');
        link.download = `${qrUser.name}_QR_Code.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    };

    img.src = url;
  };

  // Function to share QR code image via WhatsApp
  const handleShareWhatsapp = () => {
    if (!qrCodeRef || !qrUser) return;

    const svg = qrCodeRef.querySelector('svg');
    if (!svg) return;

    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const DOMURL = window.URL || window.webkitURL || window;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      // Convert canvas to blob
      canvas.toBlob(function (blob) {
        const fileName = `${qrUser.name}_QR_Code.png`;
        
        // Try to use Web Share API with file
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], fileName, { type: 'image/png' });
          
          // Check if files can be shared
          if (navigator.canShare({ files: [file] })) {
            navigator.share({
              title: `QR Code for ${qrUser.name}`,
              text: `QR Code for user: ${qrUser.name} (${qrUser.username})`,
              files: [file]
            }).catch((error) => {
              console.log('Error sharing via Web Share API:', error);
              // Fallback to download
              fallbackDownload(blob, fileName);
            });
            return;
          }
        }
        
        // If Web Share API is not available or doesn't support files, try WhatsApp Web
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64Data = e.target.result;
          
          // Try to copy image to clipboard and open WhatsApp
          if (navigator.clipboard && navigator.clipboard.write) {
            const clipboardItem = new ClipboardItem({
              'image/png': blob
            });
            
            navigator.clipboard.write([clipboardItem]).then(() => {
              // Show success message
              toast.success('QR Code copied to clipboard! You can now paste it in WhatsApp.');
              
              // Open WhatsApp Web
              const message = `QR Code for user: ${qrUser.name} (${qrUser.username})`;
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }).catch(() => {
              // If clipboard fails, just download the file
              fallbackDownload(blob, fileName);
            });
          } else {
            // Fallback: just download the file and open WhatsApp
            fallbackDownload(blob, fileName);
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/png');
    };

    img.src = url;
  };

  // Fallback function to download file and open WhatsApp
  const fallbackDownload = (blob, fileName) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    
    // Show message to user
    toast.info('QR Code downloaded! You can now share it manually on WhatsApp.');
    
    // Open WhatsApp
    const message = `QR Code for user: ${qrUser.name} (${qrUser.username})`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h5 className="text-lg font-bold text-[#2F4F4F]">All Users</h5>
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-2">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="w-full lg:w-[360px]">
              <TextField
                variant="outlined"
                placeholder="Search by Name or Role..."
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <div className="pr-2">
                      {isSearchLoading ? (
                        <CircularProgress size={18} sx={{ color: "#2F4F4F" }} />
                      ) : (
                        <Search size={18} className="text-gray-500" />
                      )}
                    </div>
                  ),
                  style: {
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    height: "48px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    height: "48px",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "12px 16px",
                    paddingLeft: "0",
                  },
                }}
              />
            </div>

            {/* Role Dropdown with Shortform */}
            <FormControl
              sx={{
                height: "48px",
                display: "flex",
                width: "auto", // Reduced width for more compact layout
                minWidth: "120px",
              }}
            >
              <InputLabel
                id="role-select-label"
                sx={{
                  color: "#2F4F4F",
                  fontFamily: "'Work Sans'",
                  fontWeight: 400,
                  fontSize: "14px",
                  transform: "translate(14px, 14px) scale(1)",
                  "&.Mui-focused, &.MuiFormLabel-filled": {
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
                }}
              >
                Role
              </InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={selectedRole}
                label="Role"
                onChange={handleRoleChange}
                sx={{
                  height: "100%",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "8px",
                  },
                  "& .MuiSelect-select": {
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    color: "#2F4F4F",
                    fontWeight: "600",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "5px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#B0B0B0",
                        borderRadius: "5px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#F0F0F0",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">All Roles</MenuItem>
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {getRoleShortForm(role)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Block Filter Dropdown */}
            <FormControl
              sx={{
                height: "48px",
                display: "flex",
                width: "auto",
                minWidth: "120px",
              }}
            >
              <InputLabel
                id="block-select-label"
                sx={{
                  color: "#2F4F4F",
                  fontFamily: "'Work Sans'",
                  fontWeight: 400,
                  fontSize: "14px",
                  transform: "translate(14px, 14px) scale(1)",
                  "&.Mui-focused, &.MuiFormLabel-filled": {
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
                }}
              >
                Block
              </InputLabel>
              <Select
                labelId="block-select-label"
                id="block-select"
                value={selectedBlock}
                label="Block"
                onChange={handleBlockChange}
                sx={{
                  height: "100%",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "8px",
                  },
                  "& .MuiSelect-select": {
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    color: "#2F4F4F",
                    fontWeight: "600",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": {
                        width: "5px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#B0B0B0",
                        borderRadius: "5px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#F0F0F0",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">All Blocks</MenuItem>
                {availableBlocks.map((block) => (
                  <MenuItem key={block} value={block}>
                    {capitalizeFirstLetter(block)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Reset Filters Button */}
            {isAnyFilterActive && (
              <Tooltip title="Clear all filters" placement="top">
                <Button
                  type="button"
                  onClick={resetFilters}
                  variant="text"
                  sx={{
                    color: "#2F4F4F",
                    fontFamily: "Work Sans",
                    fontWeight: 600,
                    fontSize: "14px",
                    textTransform: "none",
                    height: "48px",
                    padding: "0 12px",
                    background: "transparent",
                    "&:hover": {
                      background: "#f5f5f5",
                    },
                  }}
                >
                  Clear Filters
                </Button>
              </Tooltip>
            )}
          </div>
          <div className="flex justify-end lg:justify-start mt-2 lg:mt-0">
            <ButtonCustom imageName={addSymbolBtn} text="Create User" onClick={handleCreateUser} />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200">
          <MUIDataTable data={tableData} columns={columns} options={options} />
        </div>

        {/* Updated Pagination with Rows Per Page - Same layout as SchoolList */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // This spreads items to the edges
            width: "100%",
            margin: "20px 0",
            padding: "0 24px", // Add some padding on the sides
          }}
        >
          {/* Empty div for left spacing to help with centering */}
          <div style={{ width: "180px" }}></div>

          {/* Centered pagination */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              className="[&_.Mui-selected]:bg-[#2F4F4F] [&_.Mui-selected]:text-white"
              renderItem={(item) => {
                const isNextNumberPage = item.page === currentPage + 1 && item.type === "page";

                return (
                  <PaginationItem
                    {...item}
                    sx={{
                      ...(isNextNumberPage && {
                        border: "1px solid #2F4F4F",
                        borderRadius: "100%",
                      }),
                    }}
                  />
                );
              }}
            />
          </div>

          {/* Right-aligned compact rows selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "180px",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#2F4F4F",
                mr: 1,
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Rows per page:
            </Typography>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              variant="standard" // More compact variant
              disableUnderline
              sx={{
                height: "32px",
                minWidth: "60px",
                "& .MuiSelect-select": {
                  color: "#2F4F4F",
                  fontWeight: "600",
                  py: 0,
                  pl: 1,
                },
              }}
              MenuProps={{
                PaperProps: {
                  elevation: 2,
                  sx: {
                    borderRadius: "8px",
                    mt: 0.5,
                  },
                },
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </div>
        </div>

        {/*  Delete Confirmation Modal */}
        <GenericConfirmationModal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteUser}
          title="Delete User"
          message="Are you sure you want to delete this user:"
          entityName={userToDelete ? userToDelete.name : ""}
          isProcessing={isDeleting}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonColor="error"
          icon={<DeleteOutlineIcon fontSize="large" />}
          sx={{ zIndex: 12000 }}
        />

        <ToastContainer style={{ zIndex: 99999999 }} position="top-right" autoClose={3000} />

        {/* QR Code Modal */}
        <Modal
          open={qrModalOpen}
          onClose={closeQrModal}
          aria-labelledby="qr-modal-title"
          aria-describedby="qr-modal-description"
          sx={{ zIndex: 12000 }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 450,
              maxWidth: "90%",
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 2,
              p: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                id="qr-modal-title"
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", color: "#2F4F4F" }}
              >
                QR Code for User
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center", mb: 3 }}>
              {qrUser && (
                <>
                  <div ref={setQrCodeRef}>
                    <QRCode
                      value={JSON.stringify({ username: qrUser.username, userId: qrUser.userId || qrUser.id })}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <Typography variant="subtitle1" sx={{ mt: 2, color: "#555" }}>
                    {qrUser.name} ({qrUser.username})
                  </Typography>
                </>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <ButtonCustom
                text="Download"
                onClick={downloadQRCode}
                customStyle={{
                  backgroundColor: "#2F4F4F",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1e3333",
                  },
                }}
              />

              <ButtonCustom
                text="Share on WhatsApp"
                onClick={handleShareWhatsapp}
                customStyle={{
                  backgroundColor: "#25D366",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1DA851",
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={closeQrModal}
                sx={{
                  borderRadius: "8px",
                  borderColor: "#ccc",
                  color: "#555",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  "&:hover": {
                    borderColor: "#999",
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
      {/* Only show full-page spinner for non-search operations */}
      {isLoading && !isSearchLoading && <SpinnerPageOverlay />}
    </ThemeProvider>
  );
}