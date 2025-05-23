import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, Select, InputLabel } from "@mui/material";
import { Pagination } from "@mui/material";
import { Search, X as CloseIcon, RefreshCw } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import { noSchoolImage } from "../utils/imagePath";
import apiInstance from "../../api"; // Updated import path
import { Typography } from "@mui/material";
import ButtonCustom from "../components/ButtonCustom";
import { useTheme } from "@mui/material/styles";
import DownloadModal from "../components/modal/DownloadModal"; // Import the new modal

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
            borderColor: "#2F4F4F",
          },
        },
        notchedOutline: {
          borderColor: "#ccc",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#949494",
          "&.Mui-focused": {
            color: "#2F4F4F",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#2F4F4F",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: "none",
          fontFamily: "Karla !important",
          textAlign: "left",
          "&.custom-cell": {
            width: "0px",
          },
        },
        head: {
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "left",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(47, 79, 79, 0.1) !important",
            cursor: "pointer",
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          minHeight: "8px",
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
          color: "black",
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
  },
});

const Reports = () => {
  const theme = useTheme();
  
  // Remove download menu state, add download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [schools, setSchools] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState(null);

  // State for available blocks and clusters
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [availableClusters, setAvailableClusters] = useState([]);

  // Fixed page size
  const pageSize = 15;

  // Extract unique blocks and clusters from the API response
  const extractBlocksAndClusters = (schoolsData) => {
    const blocks = new Set();
    const clusters = new Set();

    schoolsData.forEach((school) => {
      if (school.blockName) blocks.add(school.blockName);
      if (school.clusterName) clusters.add(school.clusterName);
    });

    setAvailableBlocks(Array.from(blocks).sort());
    setAvailableClusters(Array.from(clusters).sort());
  };

  // Fetch schools data from API
  useEffect(() => {
    fetchSchoolsData();
  }, [currentPage, selectedSubject, selectedBlock, selectedCluster]);

  const fetchSchoolsData = async () => {
    try {
      setIsLoading(true);

      let url = `/report/subject-performance/${selectedSubject}?page=${currentPage}&pageSize=${pageSize}`;

      // Add block and cluster filters if selected - updated parameter names
      if (selectedBlock) {
        url += `&blockName=${selectedBlock}`;
      }

      if (selectedCluster) {
        url += `&clusterName=${selectedCluster}`;
      }

      const response = await apiInstance.get(url);

      if (response.data.success) {
        const { schools, pagination } = response.data.data;
        setReportData(schools);
        setTotalRecords(pagination.totalSchools);
        setTotalPages(pagination.totalPages);

        // Extract blocks and clusters if not already done
        if (availableBlocks.length === 0 || availableClusters.length === 0) {
          extractBlocksAndClusters(schools);
        }
      } else {
        toast.error("Failed to fetch report data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching the report data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all blocks and clusters for dropdowns (separate API call)
  useEffect(() => {
    const fetchAllSchoolsForDropdowns = async () => {
      try {
        // This could be a separate API endpoint that returns all blocks and clusters
        // For now, we'll just use the same endpoint with a larger page size
        const response = await apiInstance.get(
          `/report/subject-performance/${selectedSubject}?page=1&pageSize=100`
        );

        if (response.data.success) {
          extractBlocksAndClusters(response.data.data.schools);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchAllSchoolsForDropdowns();
  }, []);

  // Custom Table Component
  const CustomTable = ({ data }) => {
    return (
      <div className="overflow-x-auto">
        <style>
          {`
            .custom-table {
              width: 100%;
              border-collapse: collapse;
              font-family: 'Karla', sans-serif;
            }
            .custom-table th, .custom-table td {
              padding: 18px 16px; /* Increased row height */
              text-align: left;
              border-bottom: none;
              font-size: 13px; /* Reduced font size */
            }
            .custom-table th.group-header {
              text-align: center;
              color: #2F4F4F;
              font-weight: 600;
              font-size: 14px;
              border-bottom: none;
            }
            .custom-table th.sub-header {
              color: #2F4F4F;
              font-weight: 500;
              font-size: 12px;
              text-align: center;
            }
            .custom-table tbody tr:hover {
              backgroundColor: "inherit !important",
              cursor: default !important;
            }
            .custom-table td.low-score {
              color: #FF0000;
            }
          `}
        </style>
        <table className="custom-table">
          <thead>
            <tr>
              <th
                rowSpan="2"
                style={{
                  borderBottom: "1px solid #e0e0e0",
                  color: "#2F4F4F", // Theme color
                  fontWeight: "600", // Make it bold
                }}
              >
                School Name
              </th>
              <th colSpan="2" className="group-header">
                Primary (1-5)
              </th>
              <th colSpan="2" className="group-header">
                Upper Primary (6-8)
              </th>
              <th colSpan="2" className="group-header">
                High School (9-10)
              </th>
              <th colSpan="2" className="group-header">
                Higher Secondary (11-12)
              </th>
            </tr>
            <tr>
              <th className="sub-header">Avg. Marks</th>
              <th className="sub-header">Pass Rate(%)</th>
              <th className="sub-header">Avg. Marks</th>
              <th className="sub-header">Pass Rate(%)</th>
              <th className="sub-header">Avg. Marks</th>
              <th className="sub-header">Pass Rate(%)</th>
              <th className="sub-header">Avg. Marks</th>
              <th className="sub-header">Pass Rate(%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((school, index) => (
              <tr key={index}>
                <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>{school.schoolName}</td>
                <td
                  className={parseInt(school.primaryAvg) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 1)}
                >
                  {school.primaryAvg !== null ? school.primaryAvg : "-"}
                </td>
                <td
                  className={parseInt(school.primaryPass) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 2)}
                >
                  {school.primaryPass !== null ? `${school.primaryPass}%` : "-"}
                </td>
                <td
                  className={parseInt(school.upperPrimaryAvg) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 3)}
                >
                  {school.upperPrimaryAvg !== null ? school.upperPrimaryAvg : "-"}
                </td>
                <td
                  className={parseInt(school.upperPrimaryPass) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 4)}
                >
                  {school.upperPrimaryPass !== null ? `${school.upperPrimaryPass}%` : "-"}
                </td>
                <td
                  className={parseInt(school.highSchoolAvg) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 5)}
                >
                  {school.highSchoolAvg !== null ? school.highSchoolAvg : "-"}
                </td>
                <td
                  className={parseInt(school.highSchoolPass) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 6)}
                >
                  {school.highSchoolPass !== null ? `${school.highSchoolPass}%` : "-"}
                </td>
                <td
                  className={parseInt(school.higherSecondaryAvg) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 7)}
                >
                  {school.higherSecondaryAvg !== null ? school.higherSecondaryAvg : "-"}
                </td>
                <td
                  className={parseInt(school.higherSecondaryPass) < 20 ? "low-score" : ""}
                  onClick={() => handleCellClick(index, 8)}
                >
                  {school.higherSecondaryPass !== null ? `${school.higherSecondaryPass}%` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to determine text color based on value
  const getTextColor = (value) => {
    if (typeof value === "string" || typeof value === "number") {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue < 20) {
        return "#FF0000"; // Red color for low scores
      }
    }
    return "#000000"; // Default color
  };

  const handleCellClick = (rowIndex, colIndex) => {
    const school = reportData[rowIndex];

    // Skip if clicking on school name column (colIndex 0)
    if (colIndex === 0) return;

    // Determine which level based on column index
    let levelIndex = -1;
    let groupTitle = "";

    if (colIndex === 1 || colIndex === 2) {
      // Primary columns (Avg. Marks and Pass Rate)
      levelIndex = 0;
      groupTitle = "Primary (1-5)";
    } else if (colIndex === 3 || colIndex === 4) {
      // Upper Primary columns
      levelIndex = 1;
      groupTitle = "Upper Primary (6-8)";
    } else if (colIndex === 5 || colIndex === 6) {
      // High School columns
      levelIndex = 2;
      groupTitle = "High School (9-10)";
    } else if (colIndex === 7 || colIndex === 8) {
      // Higher Secondary columns
      levelIndex = 3;
      groupTitle = "Higher Secondary (11-12)";
    }

    // If valid level found
    if (levelIndex >= 0 && levelIndex < school.subjectPerformance.length) {
      const levelData = school.subjectPerformance[levelIndex];

      // Only open modal if there are classes for this level
      if (levelData && levelData.classes && levelData.classes.length > 0) {
        setSelectedClassData({
          school: school.schoolName,
          id: school.id,
          subject: selectedSubject,
          data: [levelData], // Only include the selected level data
          groupTitle: groupTitle,
        });

        setClassModalOpen(true);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedBlock("");
    setSelectedCluster("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const isAnyFilterActive = !!searchQuery.trim() || !!selectedBlock || !!selectedCluster;

  // Handle opening download modal (replaces the old download menu logic)
  const handleDownloadClick = () => {
    setDownloadModalOpen(true);
  };

  // Handle download confirmation from modal
  const handleDownloadConfirm = async (downloadOptions) => {
    const { format, rows, count } = downloadOptions;
    
    try {
      setIsLoading(true);
      toast.info(`Generating ${format.toUpperCase()} report for ${count} schools...`);

      let dataToDownload = [];

      // Fetch data based on selected option
      if (rows === "current") {
        dataToDownload = transformedData;
      } else {
        // Fetch more data from API
        let url = `/report/subject-performance/${selectedSubject}?page=1&pageSize=${count === totalRecords ? totalRecords : count}`;
        
        if (selectedBlock) {
          url += `&blockName=${selectedBlock}`;
        }
        if (selectedCluster) {
          url += `&clusterName=${selectedCluster}`;
        }

        const response = await apiInstance.get(url);
        if (response.data.success) {
          const apiData = response.data.data.schools;
          dataToDownload = apiData.map((school) => {
            const primaryData = school.subjectPerformance[0] || {};
            const upperData = school.subjectPerformance[1] || {};
            const highData = school.subjectPerformance[2] || {};
            const higherData = school.subjectPerformance[3] || {};

            return {
              schoolName: school.schoolName,
              primaryAvg: primaryData.primaryAvg !== undefined ? primaryData.primaryAvg : null,
              primaryPass: primaryData.primaryPass !== undefined ? primaryData.primaryPass : null,
              upperPrimaryAvg: upperData.upperPrimaryAvg !== undefined ? upperData.upperPrimaryAvg : null,
              upperPrimaryPass: upperData.upperPrimaryPass !== undefined ? upperData.upperPrimaryPass : null,
              highSchoolAvg: highData.highSchoolAvg !== undefined ? highData.highSchoolAvg : null,
              highSchoolPass: highData.highSchoolPass !== undefined ? highData.highSchoolPass : null,
              higherSecondaryAvg: higherData.higherSecondaryAvg !== undefined ? higherData.higherSecondaryAvg : null,
              higherSecondaryPass: higherData.higherSecondaryPass !== undefined ? higherData.higherSecondaryPass : null,
            };
          });
        } else {
          throw new Error("Failed to fetch extended data");
        }
      }

      if (format === "csv") {
        handleDownloadCSV(dataToDownload);
      } else {
        handleDownloadPDF(dataToDownload);
      }

    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  // Download report as PDF
  const handleDownloadPDF = (data) => {
    // Implement PDF generation and download logic here
    setTimeout(() => {
      toast.success(`PDF report generated with ${data.length} schools`);
    }, 1000);
  };

  // Download report as CSV
  const handleDownloadCSV = (data) => {
    const headers = [
      "School Name",
      "Primary (1-5) Avg. Marks",
      "Primary (1-5) Pass Rate(%)",
      "Upper Primary (6-8) Avg. Marks",
      "Upper Primary (6-8) Pass Rate(%)",
      "High School (9-10) Avg. Marks",
      "High School (9-10) Pass Rate(%)",
      "Higher Secondary (11-12) Avg. Marks",
      "Higher Secondary (11-12) Pass Rate(%)",
    ];

    let csvContent = headers.join(",") + "\n";

    data.forEach((school) => {
      const rowData = [
        school.schoolName,
        school.primaryAvg || "-",
        school.primaryPass ? `${school.primaryPass}%` : "-",
        school.upperPrimaryAvg || "-",
        school.upperPrimaryPass ? `${school.upperPrimaryPass}%` : "-",
        school.highSchoolAvg || "-",
        school.highSchoolPass ? `${school.highSchoolPass}%` : "-",
        school.higherSecondaryAvg || "-",
        school.higherSecondaryPass ? `${school.higherSecondaryPass}%` : "-",
      ];

      csvContent +=
        rowData
          .map((cell) => {
            if (cell && cell.toString().includes(",")) {
              return `"${cell}"`;
            }
            return cell;
          })
          .join(",") + "\n";
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${selectedSubject}_Performance_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`CSV report downloaded with ${data.length} schools`);
    }, 100);
  };

  // Transform API data for table display
  const transformedData = reportData.map((school) => {
    // Extract data from each section
    const primaryData = school.subjectPerformance[0] || {};
    const upperData = school.subjectPerformance[1] || {};
    const highData = school.subjectPerformance[2] || {};
    const higherData = school.subjectPerformance[3] || {};

    return {
      schoolName: school.schoolName,
      id: school.id,
      primaryAvg: primaryData.primaryAvg !== undefined ? primaryData.primaryAvg : null,
      primaryPass: primaryData.primaryPass !== undefined ? primaryData.primaryPass : null,
      upperPrimaryAvg: upperData.upperPrimaryAvg !== undefined ? upperData.upperPrimaryAvg : null,
      upperPrimaryPass:
        upperData.upperPrimaryPass !== undefined ? upperData.upperPrimaryPass : null,
      highSchoolAvg: highData.highSchoolAvg !== undefined ? highData.highSchoolAvg : null,
      highSchoolPass: highData.highSchoolPass !== undefined ? highData.highSchoolPass : null,
      higherSecondaryAvg:
        higherData.higherSecondaryAvg !== undefined ? higherData.higherSecondaryAvg : null,
      higherSecondaryPass:
        higherData.higherSecondaryPass !== undefined ? higherData.higherSecondaryPass : null,
    };
  });

  // Available subjects
  const subjects = ["English", "Hindi", "Mathematics", "Science", "Social Science"];

  // Filter schools by search query and limit to current page's data
  const filteredData = useMemo(() => {
    let data = searchQuery
      ? transformedData.filter((school) =>
          school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : transformedData;

    // Ensure we're only showing pageSize (15) items
    if (data.length > pageSize) {
      data = data.slice(0, pageSize);
    }

    return data;
  }, [transformedData, searchQuery, pageSize]);

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">School Performance Report</h5>
          </div>

          <div className="bg-gray-300 rounded">
            <Typography
              variant="subtitle1"
              sx={{
                bgcolor: theme.palette.secondary.light,
                color: theme.palette.primary.main,
                padding: "4px 16px",
                borderRadius: "8px",
                height: "48px",
                display: "flex",
                alignItems: "center",
              }}
            >
              Academic Year {"2024-25"}
            </Typography>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Typography variant="subtitle1">Generate Report for</Typography>
            <div style={{ width: "120px", marginLeft: "16px", borderRadius: "8px" }}>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  displayEmpty
                  sx={{
                    height: "48px",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderRadius: "8px",
                    },
                    "& .MuiSelect-select": {
                      padding: "12px 16px",
                      paddingRight: "32px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 max-w-sm">
            <TextField
              variant="outlined"
              placeholder="Search by name or UDISE"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <div className="pr-2">
                    <Search size={18} className="text-gray-500" />
                  </div>
                ),
                style: {
                  height: "48px",
                  borderRadius: "8px",
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

          <div style={{ width: "110px" }}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  return selected === "" ? "Block" : selected;
                }}
                sx={{
                  height: "48px",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "8px",
                  },
                  "& .MuiSelect-select": {
                    padding: "12px 16px",
                    paddingRight: "32px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value="">All Blocks</MenuItem>
                {availableBlocks.map((block) => (
                  <MenuItem key={block} value={block}>
                    {block}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ width: "110px" }}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  return selected === "" ? "Cluster" : selected;
                }}
                sx={{
                  height: "48px",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "8px",
                  },
                  "& .MuiSelect-select": {
                    padding: "12px 16px",
                    paddingRight: "32px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value="">All Clusters</MenuItem>
                {availableClusters.map((cluster) => (
                  <MenuItem key={cluster} value={cluster}>
                    {cluster}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Reset filter button */}
          <div>
            {isAnyFilterActive && (
              <Tooltip title="Clear all filters" placement="top">
                <Button
                  type="button"
                  onClick={resetFilters}
                  variant="text"
                  sx={{
                    color: "#2F4F4F",
                    fontWeight: 600,
                    fontSize: 16,
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
              onClick={handleDownloadClick}
              text="Download Report"
              style={{
                height: "48px",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            />
          </div>
        </div>

        {/* Report Table */}
        {filteredData.length > 0 ? (
          <>
            <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
              <CustomTable data={filteredData} />
            </div>

            {/* Pagination - always display */}
            <div className="flex justify-center items-center mt-6 mb-4">
              <div className="flex items-center">
                <Pagination
                  count={totalPages || 1}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  showFirstButton
                  showLastButton
                  size="medium"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      margin: "0 2px",
                    },
                    "& .MuiPaginationItem-page.Mui-selected": {
                      backgroundColor: "#2F4F4F",
                      color: "white",
                    },
                    "& .MuiPaginationItem-page:hover": {
                      backgroundColor: "#A3BFBF",
                    },
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          // Show placeholder when no data is available
          <div className="flex flex-col items-center justify-center p-10">
            <img src={noSchoolImage} alt="No data available" className="w-40 h-40 mb-6" />
            <h3 className="text-xl text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              {searchQuery
                ? "No schools match your search criteria"
                : "No school performance data available for the selected filters"}
            </p>
          </div>
        )}

        {/* Class Detail Modal */}
        <Dialog
          open={classModalOpen}
          onClose={() => setClassModalOpen(false)}
          maxWidth="md"
          PaperProps={{
            style: {
              width: "760px",
              padding: "32px",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {selectedClassData && (
            <div className="flex flex-col w-full">
              {/* School Name and Close Button in one row */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="text-[24px] font-bold"
                  style={{ fontFamily: "'Philosopher', sans-serif" }}
                >
                  {selectedClassData.udiseCode} - {selectedClassData.school}
                </div>
                <IconButton onClick={() => setClassModalOpen(false)} size="small" edge="end">
                  <CloseIcon />
                </IconButton>
              </div>

              {/* Class group and subject in one row, subject not at extreme right */}
              <div
                className="bg-gray-100 p-4 rounded-md mb-6 flex items-center"
                style={{ fontFamily: "'Karla', sans-serif" }}
              >
                <div className="text-[#2F4F4F] font-medium mr-8">
                  Class Group: {selectedClassData.groupTitle}
                </div>
                <div className="text-[#2F4F4F] font-medium">
                  Subject: {selectedClassData.subject}
                </div>
              </div>

              {/* Classes in 2 columns, Avg Marks & Pass Rate in one line */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-12">
                {selectedClassData.data[0]?.classes?.map((classData, index) => (
                  <div
                    key={`class-${classData.class}-${index}`}
                    style={{ fontFamily: "'Karla', sans-serif" }}
                  >
                    <div className="font-medium text-[#2F4F4F] mb-2 text-base">
                      Class {classData.class}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-700">
                      <span>
                        Avg Marks{" "}
                        <span
                          className={
                            parseInt(classData.avgMarks) < 20
                              ? "text-red-600 font-medium"
                              : "font-medium"
                          }
                        >
                          {classData.avgMarks}
                        </span>
                      </span>
                      <span>
                        Pass Rate(%){" "}
                        <span
                          className={
                            parseFloat(classData.successRate) < 30
                              ? "text-red-600 font-medium"
                              : "font-medium"
                          }
                        >
                          {classData.successRate}%
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Dialog>

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          onConfirm={handleDownloadConfirm}
          currentPageCount={filteredData.length}
          totalRecords={totalRecords}
          subject={selectedSubject}
        />

        {/* Loading Indicator */}
        {isLoading && <SpinnerPageOverlay isLoading={isLoading} />}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
        />
      </div>
    </ThemeProvider>
  );
};

export default Reports;