import { useState, useEffect } from "react";
import { useDebounce } from "../customHook/useDebounce";
import MUIDataTable from "mui-datatables";
import { Button, TextField, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination, PaginationItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip";
import ButtonCustom from "../components/ButtonCustom";
import GenericConfirmationModal from "../components/DeleteConfirmationModal";
import { addSymbolBtn, DocScanner, EditPencilIcon, trash } from "../utils/imagePath";
import apiInstance from "../../api";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import { MenuItem } from "@mui/material";
import { useLocation } from "react-router-dom";
import { FormControl } from "@mui/material";
import { Select } from "@mui/material";
import { InputLabel } from "@mui/material";
import { Typography } from "@mui/material";
import { Search } from "lucide-react";
const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    // Change the highlight color from blue to “Text Primary” color style.
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
          color: "#2F4F4F", //  Dropdown arrow icon color
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
          fontSize: "14px",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 400,
          color: "#2F4F4F",
        },
      },
    },
  },
});

export default function SchoolList() {
  // Then in your component
  const location = useLocation();
  const [schools, setSchools] = useState([]);
  const [academicYear, setAcademicYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Separate loading state for search
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageSize, setPageSize] = useState(15);

  const navigate = useNavigate();

  // New state for filters
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [clusters, setClusters] = useState([]);
  const [blocks, setBlocks] = useState([]);

  // Fetch schools from API (uses /schools/search for searchQuery, /school/all otherwise)
  const fetchSchools = async () => {
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
      if (debouncedSearchQuery.trim() !== "" || selectedBlock || selectedCluster) {
        url = `/schools/search?page=${currentPage}&pageSize=${pageSize}`;

        // Add search query if present
        if (debouncedSearchQuery.trim() !== "") {
          url += `&query=${encodeURIComponent(debouncedSearchQuery)}`;
        }

        // Add block and cluster filters if selected
        if (selectedBlock) {
          url += `&block=${encodeURIComponent(selectedBlock)}`;
        }
        if (selectedCluster) {
          url += `&cluster=${encodeURIComponent(selectedCluster)}`;
        }
      } else {
        // Default listing API
        url = `/school/all?page=${currentPage}&pageSize=${pageSize}`;
      }

      const response = await apiInstance.get(url);

      if (response.data.success) {
        const schoolsArr = response.data.data.schools || [];
        setSchools(schoolsArr);
        
        // Handle pagination data from API
        if (response.data.data.pagination) {
          const apiPagination = response.data.data.pagination;
          
          // Process pagination data from API response
          
          // Calculate totalPages if not provided or if it's coming as 1 when hasNextPage is true
          let calculatedTotalPages = apiPagination.totalPages || Math.ceil((apiPagination.totalCount || schoolsArr.length) / pageSize);
          
          // If API says hasNextPage is true but totalPages is 1, we need to ensure it's at least 2
          if (apiPagination.hasNextPage && calculatedTotalPages <= 1) {
            calculatedTotalPages = currentPage + 1; // At minimum, we have the next page
          }
          
          setPagination({
            currentPage: apiPagination.currentPage || 1,
            pageSize: apiPagination.pageSize || pageSize,
            totalCount: apiPagination.totalCount || schoolsArr.length,
            totalPages: calculatedTotalPages,
            hasNextPage: apiPagination.hasNextPage || false,
            hasPreviousPage: apiPagination.hasPreviousPage || false
          });
        } else {
          // Fallback if pagination data is not provided
          setPagination({
            currentPage: 1,
            pageSize: pageSize,
            totalCount: schoolsArr.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          });
        }
        
        if (response.data.data.academicYear) {
          setAcademicYear(response.data.data.academicYear);
        }
      } else {
        toast.error("Failed to fetch schools");
      }
    } catch (error) {
      // Error handling via toast
      toast.error(error.response?.data?.message || "Error fetching schools");
    } finally {
      setIsLoading(false);
      setIsSearchLoading(false);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Load schools on component mount and when page/search changes
  useEffect(() => {
    fetchSchools();
  }, [currentPage, pageSize, debouncedSearchQuery, selectedBlock, selectedCluster]);

  // Add this in your SchoolList component, in the useEffect section
  useEffect(() => {
    // Check for success message in location state
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);

      // Clear the message from location state to prevent showing it again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  //  Add a new function to fetch global blocks and clusters
  const fetchGlobalBlocksAndClusters = async () => {
    try {
      const response = await apiInstance.get("/user/dropdown-data");
      if (response.data && response.data.success) {
        const blocksData = response.data.data;

        // Extract unique blocks
        const uniqueBlocks = blocksData.map((block) => block.blockName).filter(Boolean).sort();
        setBlocks(uniqueBlocks);

        // Extract unique clusters
        const allClusterNames = blocksData.flatMap((block) =>
          block.clusters.map((cluster) => cluster.name)
        );
        const uniqueClusters = [...new Set(allClusterNames)].filter(Boolean).sort();
        setClusters(uniqueClusters);
      } else {
        // Error handled via toast
      }
    } catch (error) {
      // Error handling via toast
      toast.error("Failed to load blocks and clusters data");
    }
  };

  // Call the function on component mount
  useEffect(() => {
    fetchGlobalBlocksAndClusters();
  }, []);

  const handleAddSchool = () => {
    navigate("/schools/add-school");
  };

  const handleBulkUpload = () => {
    navigate("/schools/bulk-upload");
  };

  const handleSchoolReport = (schoolId, schoolObj) => {
    navigate(`/schools/schoolDetail/${schoolId}/schoolPerformance`, {
      // "/schools/schoolDetail/:schoolId/schoolPerformance"
      state: {
        schoolName: schoolObj.schoolName,
        udiseCode: schoolObj.udiseCode,
      },
    });
  };

  // Handle copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.info(`${type} copied to clipboard`);
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCluster("");
    setSelectedBlock("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Function to capitalize only the first letter and make rest lowercase
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Filter schools based on cluster/block only (search handled by backend)
  const filteredSchools = schools.filter((school) => {
    // Cluster filter
    const matchesCluster = selectedCluster === "" || school.clusterName === selectedCluster;
    // Block filter
    const matchesBlock = selectedBlock === "" || school.blockName === selectedBlock;
    return matchesCluster && matchesBlock;
  });

  // Schools are filtered based on selected filters

  // Open delete confirmation modal
  const openDeleteModal = (school) => {
    setSchoolToDelete(school);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSchoolToDelete(null);
  };

  // Delete school handler
  const confirmDeleteSchool = async () => {
    if (!schoolToDelete) return;

    setIsDeleting(true);
    try {
      // Call the API to delete the school
      await apiInstance.delete(`/school/delete/${schoolToDelete.id}`);

      // Remove the school from the local state
      const updatedSchools = schools.filter((school) => school.id !== schoolToDelete.id);
      setSchools(updatedSchools);

      // Show success message and update pagination if needed
      toast.success(`"${schoolToDelete.schoolName}" has been deleted successfully!`);

      if (updatedSchools.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // If we're on the last page and it's now empty, go back one page
        const totalPages = Math.ceil((pagination.totalCount - 1) / pagination.pageSize);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else {
          // Otherwise, just refresh the current page
          fetchSchools();
        }
      }
    } catch (error) {
      // Error handling via toast
      toast.error(error.response?.data?.message || "Error deleting school");
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Generate username from schoolName and udiseCode
  const generateUsername = (schoolName) => {
    const schoolPrefix = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `admin_${schoolPrefix}${randomNum}`;
  };

  // Make sure we're only showing the proper number of schools in the table
  // This is a safeguard if the API isn't respecting the limit parameter
  // We're now using the server-side pagination, so we should show all received schools
  const limitedFilteredSchools = filteredSchools;


  const tableData = limitedFilteredSchools.map((school) => ({
    id: school.id,
    schoolName: capitalizeFirstLetter(school.schoolName),
    udiseCode: school.udiseCode,
    cluster: capitalizeFirstLetter(school.clusterName),
    block: capitalizeFirstLetter(school.blockName),
    // crcCode: school.crcCode || "-",
    studentsEnrolled:
    school.totalStudents === undefined || school.totalStudents === null
    ? "-"
    : school.totalStudents, // Show '-' if value missing, else show actual value (including 0)
    username: generateUsername(school.schoolName), // Generate username from school name
    actions: "Actions",
    schoolObj: school, // Pass the entire school object for the delete modal
  }));

  const isAnyFilterActive = selectedCluster !== "" || selectedBlock !== "" || searchQuery !== "";

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
  // MUI DataTable columns
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false }, // Keep the ID hidden in the table
    },
    {
      name: "schoolName",
      label: "School Name",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: {
            minWidth: "300px",
            maxWidth: "300px",
            overflow: "hidden",
          },
        }),
        customBodyRender: (value, tableMeta) => {
          const schoolId = tableMeta.rowData[0]; // Get the ID from the first column
          const schoolObj = tableMeta.rowData[6]; // Get the full school object (updated index after adding student count column)

          return (
            <div
              onClick={() =>
                navigate(`/schools/schoolDetail/${schoolId}`, {
                  state: { 
                    schoolData: schoolObj,
                    academicYear: academicYear 
                  },
                })
              }
              style={{
                cursor: "pointer",
                color: "#1976d2",
                fontWeight: "500",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "udiseCode",
      label: "UDISE Code",
      options: { 
        filter: false, 
        sort: true,
        customBodyRender: (value) => {
          return (
            <div
              style={{
                display: "flex",
                width: "120px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{value}</span>
              <Button
                variant="text"
                size="small"
                sx={{ minWidth: "30px", marginRight: "14px" }}
                onClick={() =>
                  handleCopy(`UDISE: ${value} (use as password)`, "UDISE Code")
                }
              >
                <ContentCopyIcon style={{ fontSize: "18px", color: "#2F4F4F" }} />
              </Button>
            </div>
          );
        }
      },
    },
    {
      name: "block",
      label: "Block",
      options: { filter: false, sort: true },
    },
    {
      name: "cluster",
      label: "Cluster",
      options: { filter: false, sort: true },
    },
    {
      name: "studentsEnrolled",
      label: "Students Enrolled",
      options: { 
        filter: false, 
        sort: true,
        customBodyRender: (value) => {
          return (
            <div style={{
              textAlign: "center",
              color: "#2F4F4F",
              fontWeight: "400"
            }}>
              {value || 0}
            </div>
          );
        }
      },
    },
    {
      name: "schoolObj", // This is the hidden column that holds the full school object
      options: { display: false },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customHeadRender: (columnMeta) => {
          return (
            <th
              style={{
                textAlign: "center",
                // borderBottom: "1px solid lightgray",
                borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
              }}
              scope="col"
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#2F4F4F",
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: 600,
                  fontStyle: "normal",
                }}
              >
                {columnMeta.label}
              </div>
            </th>
          );
        },
        customBodyRender: (value, tableMeta) => {
          const schoolId = tableMeta.rowData[0];
          const schoolObj = tableMeta.rowData[6]; // Index of schoolObj in the rowData array (updated after adding student count column)

          return (
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#1976d2",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => {

                  navigate(`/schools/update/${schoolId}`, {
                    state: { schoolData: schoolObj }, // Pass the entire school object
                  });
                }}
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
                &nbsp;
              </Button>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#d32f2f",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => openDeleteModal(schoolObj)}
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

              {/* View Report Button */}
              {/* <Button
                variant="text"
                size="small"
                sx={{
                  color: "#4caf50",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => handleSchoolReport(schoolId, schoolObj)}
                title="View Report"
              >
                <img src={DocScanner} alt="View Report" style={{ width: "20px", height: "20px" }} />
              </Button> */}
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

  // MUI DataTable options
  const options = {
    filter: false,
    search: false,
    responsive: "standard",
    selectableRows: "none",
    download: false,
    print: false,
    viewColumns: false,
    pagination: false,
  };

  // Default view - List of schools
  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper px-3 sm:px-4" style={{ position: "relative" }}>
        <div className="header-container mb-1">
          <h5 className="text-lg font-bold text-[#2F4F4F]">School Management</h5>
        </div>

        <div className="school-list-container mt-1 bg-white rounded-lg">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
            <div className="w-full lg:flex-1">
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
                <div className="flex justify-between w-full flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    <TextField
                      variant="outlined"
                      placeholder="Search by School name, UDISE, Block Name.."
                      size="small"
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
                          minWidth: "150px",
                          width: "385px",
                        },
                      }}
                      sx={{
                        width: { xs: "100%", md: "385px" },
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    />

                    {/* Block Dropdown */}
                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "100px",
                        marginBottom: { xs: "8px", md: "0" },
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
                        onChange={(e) => setSelectedBlock(e.target.value)}
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
                        {blocks.map((block) => (
                          <MenuItem key={block} value={block}>
                            {capitalizeFirstLetter(block)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Cluster Dropdown */}
                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "100px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
                        id="cluster-select-label"
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
                        Cluster
                      </InputLabel>
                      <Select
                        labelId="cluster-select-label"
                        id="cluster-select"
                        value={selectedCluster}
                        label="Cluster"
                        onChange={(e) => setSelectedCluster(e.target.value)}
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
                        <MenuItem value="">All Clusters</MenuItem>
                        {clusters.map((cluster) => (
                          <MenuItem key={cluster} value={cluster}>
                            {capitalizeFirstLetter(cluster)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Reset Button */}
                    {isAnyFilterActive && (
                      <div className="flex justify-start w-full sm:w-auto mr-13">
                        <Tooltip title="Clear Filters" placement="top">
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
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ButtonCustom
                      imageName={addSymbolBtn}
                      text={"Add School"}
                      onClick={handleAddSchool}
                    />
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "#2F4F4F",
                        color: "#2F4F4F",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "18px",
                        "&:hover": {
                          borderColor: "#1E3535",
                          backgroundColor: "rgba(47, 79, 79, 0.1)",
                        },
                        width: { xs: "100%", sm: "auto" },
                      }}
                      onClick={handleBulkUpload}
                    >
                      <UploadFileIcon sx={{ mr: 1 }} />
                      Bulk Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div
            style={{
              borderRadius: "8px",
              position: "relative",
              minHeight: "300px",
            }}
            className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
          >
            <MUIDataTable data={tableData} columns={columns} options={options} />
          </div>

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
            <div style={{ display: "flex", justifyContent: "center" }}>
              {/* Centered pagination */}
              <Pagination
                count={pagination.totalPages || 1}
                page={currentPage}
                onChange={handlePageChange}
                showFirstButton={pagination.totalPages > 1 || pagination.hasNextPage}
                showLastButton={pagination.totalPages > 1 || pagination.hasNextPage}
                disabled={isLoading || isSearchLoading}
                siblingCount={1}
                boundaryCount={1}
                renderItem={(item) => {
                  const isNextNumberPage = item.page === currentPage + 1 && item.type === "page";
                  
                  // Special case for "next" button - force enable if API says hasNextPage
                  if (item.type === 'next' && pagination.hasNextPage) {
                    return (
                      <PaginationItem
                        {...item}
                        disabled={false}
                        sx={{
                          color: "#2F4F4F",
                          "&.Mui-selected": {
                            backgroundColor: "#2F4F4F",
                            color: "white",
                          },
                        }}
                      />
                    );
                  }

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

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            style={{ zIndex: 99999999 }}
          />

          {/* Delete Confirmation Modal */}
          <GenericConfirmationModal
            open={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDeleteSchool}
            title="Delete School"
            message="Are you sure you want to delete this school: "
            entityName={schoolToDelete ? schoolToDelete.schoolName : ""}
            isProcessing={isDeleting}
            confirmText="Delete"
            cancelText="Cancel"
            confirmButtonColor="error"
            icon={<DeleteOutlineIcon fontSize="large" />}
            sx={{ zIndex: 12000 }}
          />
        </div>

        {/* Overlay Loader */}
        {/* Only show full-page spinner for non-search operations */}
        {isLoading && !isSearchLoading && <SpinnerPageOverlay isLoading={isLoading} />}
      </div>
    </ThemeProvider>
  );
}
