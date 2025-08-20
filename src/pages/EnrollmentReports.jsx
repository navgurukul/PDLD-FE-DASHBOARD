import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "../customHook/useDebounce";
import MUIDataTable from "mui-datatables";
import { Button, TextField, CircularProgress, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination, PaginationItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search } from "lucide-react";
import "../components/TestListTable.css"; // Import the CSS for consistent table styles
import ButtonCustom from "../components/ButtonCustom";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import apiInstance from "../../api";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
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
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 400,
          color: "#2F4F4F",
          borderBottom: "none", 
        },
      },
    },
  },
});

export default function EnrollmentReport() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Separate loading state for search
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalItems: 0,
    totalPages: 1,
  });
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedGrouping, setSelectedGrouping] = useState("school"); // New grouping state
  const [selectedClassGroup, setSelectedClassGroup] = useState("all"); // New class group state
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [groupingOptions] = useState([
    { value: "block", label: "Block Level" },
    { value: "cluster", label: "Block + Cluster Level" },
    { value: "school", label: "Block + Cluster + School Level" }
  ]);
  const [classGroupOptions] = useState([
    { value: "all", label: "All Classes (1-12)" },
    { value: "primary", label: "Classes 1-8" },
    { value: "secondary", label: "Classes 9-12" }
  ]);
  const navigate = useNavigate();

  // Fetch enrollment data from API
  const fetchEnrollmentData = async () => {
    // Set appropriate loading state based on search
    if (debouncedSearchQuery) {
      setIsSearchLoading(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const params = new URLSearchParams({
        level: selectedGrouping,
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: "totalStudents"
      });

      // Add filters if they exist
      if (selectedBlock) params.append("block", selectedBlock);
      if (selectedCluster) params.append("cluster", selectedCluster);
      if (debouncedSearchQuery) params.append("query", debouncedSearchQuery);

      const response = await apiInstance.get(`/report/enrollment?${params.toString()}`);
      
      console.log("Full API Response:", response); // Debug log
      console.log("Response Data:", response.data); // Debug log
      
      if (response.data.success) {
        const responseData = response.data.data;
        const { enrollmentData, reportType, academicYear } = responseData.data;
        const responseMetadata = response.data.data.metadata;
      
        // Store raw data from API (processing will be done by useMemo)
        setData(enrollmentData || []);
        setMetadata({ 
          ...(responseMetadata || {}),
          reportType,
          academicYear
        });
        

        
        // Update pagination with server response
        setPagination(prev => ({
          ...prev,
          totalItems: responseMetadata?.totalRecords || (enrollmentData || []).length,
          totalPages: responseMetadata?.totalPages || Math.ceil((responseMetadata?.totalRecords || (enrollmentData || []).length) / prev.pageSize),
        }));

        // Extract unique blocks and clusters for filter options
        const uniqueBlocks = [...new Set((enrollmentData || []).map(item => item?.block).filter(Boolean))].sort();
        const uniqueClusters = [...new Set((enrollmentData || []).map(item => item?.cluster).filter(Boolean))].sort();
        
        if (blocks.length === 0) setBlocks(uniqueBlocks);
        if (clusters.length === 0) setClusters(uniqueClusters);
        
      } else {
        toast.error(response.data.message || "Failed to fetch enrollment data");
        setData([]);
        setMetadata({});
      }
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
      toast.error("Failed to fetch enrollment data. Please try again.");
      setData([]);
      setMetadata({});
    } finally {
      setIsLoading(false);
      setIsSearchLoading(false);
    }
  };

  // Fetch blocks and clusters for filter dropdowns
  const fetchFilterOptions = async () => {
    try {
      // Fetch all data at school level to get unique blocks and clusters
      const response = await apiInstance.get(`/report/enrollment?level=school&pageSize=10`);
      
      if (response.data.success) {
        const { enrollmentData } = response.data.data.data;
        const uniqueBlocks = [...new Set((enrollmentData || []).map(item => item.block))].sort();
        const uniqueClusters = [...new Set((enrollmentData || []).map(item => item.cluster))].sort();
        
        setBlocks(uniqueBlocks);
        setClusters(uniqueClusters);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  useEffect(() => {
    // Fetch filter options on component mount
    if (blocks.length === 0) {
      fetchFilterOptions();
    }
  }, []);

  useEffect(() => {
    fetchEnrollmentData();
  }, [
    debouncedSearchQuery, 
    pagination.currentPage, 
    pagination.pageSize, 
    selectedBlock, 
    selectedCluster, 
    selectedGrouping
  ]);

  useEffect(() => {
    // Reset to first page when filters or class group changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [selectedClassGroup, selectedBlock, selectedCluster, searchQuery, selectedGrouping]);

  // Since API handles grouping by level, we just need to filter by class group
  const processedData = useMemo(() => {
    const processed = data.map(item => {
      let recalculatedTotal = 0;
      if (selectedClassGroup === "all") {
        recalculatedTotal = item.totalStudents;
      } else if (selectedClassGroup === "primary") {
        for (let i = 1; i <= 8; i++) {
          recalculatedTotal += item[`class${i}`] || 0;
        }
      } else if (selectedClassGroup === "secondary") {
        for (let i = 9; i <= 12; i++) {
          recalculatedTotal += item[`class${i}`] || 0;
        }
      }
      
      return {
        ...item,
        totalStudents: recalculatedTotal
      };
    });
    return processed;
  }, [data, selectedClassGroup]);

  const columns = [
    { name: "block", label: "Block" },
    ...(selectedGrouping !== "block" ? [{ name: "cluster", label: "Cluster" }] : []),
    ...(selectedGrouping === "school" ? [
      { name: "schoolName", label: "School Name" },
      { name: "udiseCode", label: "UDISE Code" }
    ] : []),
    { name: "totalStudents", label: "Total Students" },
    ...(selectedClassGroup === "all" || selectedClassGroup === "primary" 
      ? Array.from({ length: 8 }, (_, i) => ({
          name: `class${i + 1}`,
          label: `Class ${i + 1}`,
        }))
      : []
    ),
    ...(selectedClassGroup === "all" || selectedClassGroup === "secondary"
      ? Array.from({ length: 4 }, (_, i) => ({
          name: `class${i + 9}`,
          label: `Class ${i + 9}`,
        }))
      : []
    ),
  ];

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

  const isAnyFilterActive = selectedBlock !== "" || selectedCluster !== "" || searchQuery !== "" || selectedGrouping !== "school" || selectedClassGroup !== "all";

  const resetFilters = () => {
    setSelectedBlock("");
    setSelectedCluster("");
    setSearchQuery("");
    setSelectedGrouping("school");
    setSelectedClassGroup("all");
  };

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1, // Reset to first page
    }));
  };

  // Handle download report
  const handleDownloadReport = async () => {
    try {
      const params = new URLSearchParams({
        level: selectedGrouping,
        mode: "download",
        sortBy: "totalStudents"
      });

      // Add filters if they exist
      if (selectedBlock) params.append("block", selectedBlock);
      if (selectedCluster) params.append("cluster", selectedCluster);
      if (debouncedSearchQuery) params.append("query", debouncedSearchQuery);

      const response = await apiInstance.get(`/report/enrollment?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `enrollment-report-${selectedGrouping}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

  // Since data is already paginated from API, we use it directly

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper px-3 sm:px-4" style={{ position: "relative" }}>
        <div className="header-container mb-1">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="text-lg font-bold text-[#2F4F4F]">Student Enrollment Analytics</h5>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive enrollment data with flexible grouping by Block, Cluster, and School levels for Classes 1-8 and 9-12
              </p>
              {metadata.academicYear && (
                <p className="text-xs text-gray-500 mt-1">
                  Academic Year: {metadata.academicYear} | Report Type: {metadata.reportType || selectedGrouping}
                </p>
              )}
            </div>
            {processedData.length > 0 && (
              <div className="text-right">
                <p className="text-sm font-semibold text-[#2F4F4F]">
                  Total Records: {pagination.totalItems || processedData.length}
                </p>
                <p className="text-xs text-gray-500">
                  Showing {processedData.length} of {pagination.totalItems || processedData.length}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="school-list-container mt-1 bg-white rounded-lg">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
            <div className="w-full lg:flex-1">
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
                <div className="flex justify-between w-full flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    <TextField
                      variant="outlined"
                      placeholder="Search by Block, Cluster, School Name.."
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

                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "120px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
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
                        Grouping
                      </InputLabel>
                      <Select
                        value={selectedGrouping}
                        onChange={(e) => setSelectedGrouping(e.target.value)}
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
                      >
                        {groupingOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "120px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
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
                        Class Group
                      </InputLabel>
                      <Select
                        value={selectedClassGroup}
                        onChange={(e) => setSelectedClassGroup(e.target.value)}
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
                      >
                        {classGroupOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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
                        value={selectedBlock}
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
                      >
                        <MenuItem value="">All Blocks</MenuItem>
                        {blocks.map((block) => (
                          <MenuItem key={block} value={block}>
                            {block}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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
                        value={selectedCluster}
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
                      >
                        <MenuItem value="">All Clusters</MenuItem>
                        {clusters.map((cluster) => (
                          <MenuItem key={cluster} value={cluster}>
                            {cluster}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Clear Filters Button */}
                    {isAnyFilterActive && (
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
                    )}
                  </div>

                  <div className="ml-auto">
                    <ButtonCustom
                      onClick={() => handleDownloadReport()}
                      text="Download Report"
                      disabled={isLoading}
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        padding: "12px 16px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: "8px",
              position: "relative",
              minHeight: "300px",
            }}
            className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
          >
            <MUIDataTable data={processedData} columns={columns} options={options} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              margin: "20px 0",
              padding: "0 24px",
            }}
          >
            <div style={{ width: "180px" }}></div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
              />
            </div>
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
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                variant="standard"
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
        </div>

        {/* Page level loading overlay - only for non-search operations */}
        {isLoading && !isSearchLoading && <SpinnerPageOverlay isLoading={isLoading} />}
      </div>
    </ThemeProvider>
  );
}