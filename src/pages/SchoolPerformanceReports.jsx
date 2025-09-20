import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDebounce } from "../customHook/useDebounce";
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
  Typography,
  Select,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel } from "@mui/material";
import { Pagination, PaginationItem } from "@mui/material";
import { Search, X as CloseIcon, RefreshCw } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import apiInstance from "../../api"; // Updated import path
import ButtonCustom from "../components/ButtonCustom";
import { useTheme } from "@mui/material/styles";
import DownloadModal from "../components/modal/DownloadModal"; // Import the new modal
import { SUBJECTS_BY_GRADE } from "../data/testData"; // Import testData for curriculum mapping

// Utility function to convert text to title case
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Utility function to format numbers - remove .0 for whole numbers
const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  
  // If it's a whole number, show without decimal
  if (num % 1 === 0) {
    return num.toString();
  }
  
  // If it has decimal part, show one decimal place
  return num.toFixed(1);
};

// Utility function to check if curriculum note should be shown
const shouldShowCurriculumNote = (subject, groupTitle) => {
  // Map group titles to class ranges
  const groupClassMapping = {
    "Primary (1-5)": [1, 2, 3, 4, 5],
    "Upper Primary (6-8)": [6, 7, 8],
    "High School (9-10)": [9, 10],
    "Higher Secondary (11-12)": [11, 12]
  };

  const classesInGroup = groupClassMapping[groupTitle];
  if (!classesInGroup) return false;

  // Check how many classes in this group have this subject
  const classesWithSubject = classesInGroup.filter(classNum => 
    SUBJECTS_BY_GRADE[classNum] && SUBJECTS_BY_GRADE[classNum].includes(subject)
  );

  // Show note only if subject is present in SOME but not ALL classes of the group
  return classesWithSubject.length > 0 && classesWithSubject.length < classesInGroup.length;
};

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
          fontFamily: "'Work Sans', sans-serif !important",
          fontWeight: 400,
          fontSize: "14px",
          color: "#2F4F4F",
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
  },
});

const Reports = () => {
  const theme = useTheme();

  // Remove download menu state, add download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Separate loading state for search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [schools, setSchools] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedClassData, setSelectedClassData] = useState(null);
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [subjects, setSubjects] = useState([]); // Dynamic subjects from API
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const subjectsFetched = useRef(false); // Track if subjects have been fetched

  // State for available blocks and clusters
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [availableClusters, setAvailableClusters] = useState([]);
  
  // Changed from fixed pageSize to state
  const [pageSize, setPageSize] = useState(15);

  // Curriculum mapping for subjects
  // Dynamic function to get expected classes for a subject in a group using testData.js
  const getExpectedClassesForSubject = (subject, groupTitle) => {
    const groupClassMapping = {
      "Primary (1-5)": [1, 2, 3, 4, 5],
      "Upper Primary (6-8)": [6, 7, 8],
      "High School (9-10)": [9, 10],
      "Higher Secondary (11-12)": [11, 12]
    };

    const classesInGroup = groupClassMapping[groupTitle];
    if (!classesInGroup) return [];

    // Filter classes that have this subject according to testData.js
    return classesInGroup.filter(classNum => 
      SUBJECTS_BY_GRADE[classNum] && SUBJECTS_BY_GRADE[classNum].includes(subject)
    );
  };

  // Helper function to check curriculum availability
  const checkCurriculumAvailability = (subject, groupTitle, classesInData) => {
    const expectedClasses = getExpectedClassesForSubject(subject, groupTitle);
    const actualClasses = classesInData.map(c => c.class);
    
    // Check if ALL classes that should have this subject are represented in the data
    // If expected classes list is empty, it means subject is not taught in this group at all
    if (expectedClasses.length === 0) {
      return {
        allClassesHaveSubject: false,
        expectedClasses,
        actualClasses,
        reason: "Subject not taught in this group"
      };
    }
    
    // Check if subject is available in all classes of the group
    const groupClassMapping = {
      "Primary (1-5)": [1, 2, 3, 4, 5],
      "Upper Primary (6-8)": [6, 7, 8],
      "High School (9-10)": [9, 10],
      "Higher Secondary (11-12)": [11, 12]
    };
    
    const allClassesInGroup = groupClassMapping[groupTitle] || [];
    const allClassesHaveSubject = expectedClasses.length === allClassesInGroup.length;
    
    return {
      allClassesHaveSubject,
      expectedClasses,
      actualClasses,
      totalClassesInGroup: allClassesInGroup.length
    };
  };

  // Add page size change handler
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Fetch unique subjects from API
  const fetchSubjects = async () => {
    // Prevent multiple calls
    if (subjectsFetched.current) return;
    
    try {
      setIsLoadingSubjects(true);
      subjectsFetched.current = true; // Mark as fetching
      
      const response = await apiInstance.get('/report/unique-subjects');
    
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        const fetchedSubjects = response.data.data;
        setSubjects(fetchedSubjects);
        
        // Set default selected subject if current selection is not in the list
        if (fetchedSubjects.length > 0) {
          if (!fetchedSubjects.includes(selectedSubject)) {
            setSelectedSubject(fetchedSubjects[0]);
          }
        }
      } else {
        // Fallback to hardcoded subjects if API fails
        console.warn('Failed to fetch subjects from API, using fallback');
        const fallbackSubjects = ["English", "Hindi", "Mathematics", "Science", "Social Science"];
        setSubjects(fallbackSubjects);
        if (!fallbackSubjects.includes(selectedSubject)) {
          setSelectedSubject(fallbackSubjects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to hardcoded subjects if API fails
      const fallbackSubjects = ["English", "Hindi", "Mathematics", "Science", "Social Science"];
      setSubjects(fallbackSubjects);
      if (!fallbackSubjects.includes(selectedSubject)) {
        setSelectedSubject(fallbackSubjects[0]);
      }
      // Only show toast once and only if we haven't shown it before
      toast.error('Failed to load subjects, using default list');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

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

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch schools data from API
  useEffect(() => {
    fetchSchoolsData();
  }, [currentPage, selectedSubject, selectedBlock, selectedCluster, pageSize, debouncedSearchQuery]);

  useEffect(() => {
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchSchoolsData = async () => {
    // Set appropriate loading state based on search
    if (debouncedSearchQuery) {
      setIsSearchLoading(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Updated to use dynamic pageSize
      let url = `/report/subject-performance/${selectedSubject}?page=${currentPage}&pageSize=${pageSize}`;

      // Add block and cluster filters if selected - updated parameter names
      if (selectedBlock) {
        url += `&blockName=${selectedBlock}`;
      }

      if (selectedCluster) {
        url += `&clusterName=${selectedCluster}`;
      }

      // Add search query parameter
      if (debouncedSearchQuery) {
        url += `&query=${encodeURIComponent(debouncedSearchQuery)}`;
      }

      const response = await apiInstance.get(url);

      if (response.data.success) {
        const { schools, pagination, academicYear } = response.data.data;
        setReportData(schools);
        setTotalRecords(pagination.totalSchools);
        setTotalPages(pagination.totalPages);
        if (academicYear) setAcademicYear(academicYear);
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
      setIsSearchLoading(false);
    }
  };

  // Fetch all blocks and clusters for dropdowns (separate API call)
  useEffect(() => {
    // Only fetch if we have a selected subject and subjects are loaded
    if (selectedSubject && !isLoadingSubjects) {
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
    }
  }, [selectedSubject, isLoadingSubjects]); // Add proper dependencies

  // Custom Table Component
  const CustomTable = ({ data }) => {
    // Helper to check if a cell is clickable (i.e., value is not null/undefined/empty)
    const isCellClickable = (value) => value !== null && value !== undefined && value !== "" && value !== "-";
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
              padding: 10px 18px;
              text-align: center;
              border-bottom: none;
              font-family:  'Work Sans', sans-serif !important;
              font-weight: 400 !important;
              font-size: 14px !important;
              color: #2F4F4F;
              background: #fff !important;
            }
            .custom-table th.group-header {
              font-family: 'Work Sans', sans-serif !important;
              text-align: center;
              color: #2F4F4F;
              font-weight: 600 !important;
              font-size: 14px !important;
              border-bottom: none!important;
            }
            .custom-table th.sub-header {
              font-family: 'Noto Sans', sans-serif !important;
              color: #2F4F4F !important;
              font-weight: 600 !important;
              font-size: 14px;
              text-align: center;
            }
            .custom-table tbody tr:hover {
              background-color: inherit !important;
              cursor: default !important;
            }
            .custom-table td.low-score {
              color: #F45050;
              font-weight: 600 !important;
              font-family: "Work Sans" !important;
            }
            .custom-table th.school-header {
                font-family: 'Work Sans', sans-serif !important;
                font-weight: 600 !important;
                font-size: 14px !important;
                color: #2F4F4F;
                text-align: center;
                border-bottom: 1px solid #e0e0e0;
            }
            .custom-table thead tr:nth-child(2) th:nth-child(2n+1):not(:last-child) {
              position: relative;
            }
            .custom-table thead tr:nth-child(2) th:nth-child(2n+1):not(:last-child)::after {
              content: "";
              position: absolute;
              right: -12px;
              top: 50%;
              transform: translateY(-50%);
              height: 24px;
              width: 1px;
              background: #6D6D6D;
              display: block;
              border-radius: 1px;
              font-weight: 400 !important;
            }
            .custom-table th.school-header,
            .custom-table td:first-child {
              text-align: left;
            }
            .custom-table td {
              height: 60px;
              background: #fff !important;
            }
            .custom-table td.clickable {
              cursor: pointer !important;
              background: #fff !important;
              transition: background 0.2s;
            }
            .custom-table td.clickable:hover {
              background: #fff !important;
            }
          `}
        </style>
        <table className="custom-table">
          <thead>
            <tr>
              <th
                rowSpan="2"
                className="school-header"
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
            {data.length > 0 ? (
              data.map((school, index) => (
                <tr key={index}>
                  <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                    {school.udiseCode} - {toTitleCase(school.schoolName)}
                  </td>
                  {/* Primary Avg */}
                  {isCellClickable(school.primaryAvg) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.primaryAvg) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 1)}
                      >
                        {formatNumber(school.primaryAvg)}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.primaryAvg) < 33 ? "low-score" : ""}>
                      {formatNumber(school.primaryAvg)}
                    </td>
                  )}
                  {/* Primary Pass */}
                  {isCellClickable(school.primaryPass) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.primaryPass) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 2)}
                      >
                        {school.primaryPass !== null ? `${formatNumber(school.primaryPass)}%` : "-"}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.primaryPass) < 33 ? "low-score" : ""}>
                      {school.primaryPass !== null ? `${formatNumber(school.primaryPass)}%` : "-"}
                    </td>
                  )}
                  {/* Upper Primary Avg */}
                  {isCellClickable(school.upperPrimaryAvg) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.upperPrimaryAvg) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 3)}
                      >
                        {formatNumber(school.upperPrimaryAvg)}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.upperPrimaryAvg) < 33 ? "low-score" : ""}>
                      {formatNumber(school.upperPrimaryAvg)}
                    </td>
                  )}
                  {/* Upper Primary Pass */}
                  {isCellClickable(school.upperPrimaryPass) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.upperPrimaryPass) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 4)}
                      >
                        {school.upperPrimaryPass !== null ? `${formatNumber(school.upperPrimaryPass)}%` : "-"}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.upperPrimaryPass) < 33 ? "low-score" : ""}>
                      {school.upperPrimaryPass !== null ? `${formatNumber(school.upperPrimaryPass)}%` : "-"}
                    </td>
                  )}
                  {/* High School Avg */}
                  {isCellClickable(school.highSchoolAvg) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.highSchoolAvg) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 5)}
                      >
                        {formatNumber(school.highSchoolAvg)}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.highSchoolAvg) < 33 ? "low-score" : ""}>
                      {formatNumber(school.highSchoolAvg)}
                    </td>
                  )}
                  {/* High School Pass */}
                  {isCellClickable(school.highSchoolPass) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.highSchoolPass) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 6)}
                      >
                        {school.highSchoolPass !== null ? `${formatNumber(school.highSchoolPass)}%` : "-"}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.highSchoolPass) < 33 ? "low-score" : ""}>
                      {school.highSchoolPass !== null ? `${formatNumber(school.highSchoolPass)}%` : "-"}
                    </td>
                  )}
                  {/* Higher Secondary Avg */}
                  {isCellClickable(school.higherSecondaryAvg) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.higherSecondaryAvg) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 7)}
                      >
                        {formatNumber(school.higherSecondaryAvg)}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.higherSecondaryAvg) < 33 ? "low-score" : ""}>
                      {formatNumber(school.higherSecondaryAvg)}
                    </td>
                  )}
                  {/* Higher Secondary Pass */}
                  {isCellClickable(school.higherSecondaryPass) ? (
                    <Tooltip title="Click to view classwise reports" arrow>
                      <td
                        className={`${parseInt(school.higherSecondaryPass) < 33 ? "low-score" : ""} clickable`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCellClick(index, 8)}
                      >
                        {school.higherSecondaryPass !== null ? `${formatNumber(school.higherSecondaryPass)}%` : "-"}
                      </td>
                    </Tooltip>
                  ) : (
                    <td className={parseInt(school.higherSecondaryPass) < 33 ? "low-score" : ""}>
                      {school.higherSecondaryPass !== null ? `${formatNumber(school.higherSecondaryPass)}%` : "-"}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                  Sorry, no matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to determine text color based on value
  const getTextColor = (value) => {
    if (typeof value === "string" || typeof value === "number") {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue < 33) {
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
        // Use the utility function to check if curriculum note should be shown
        const showNote = shouldShowCurriculumNote(selectedSubject, groupTitle);
        
        setSelectedClassData({
          school: toTitleCase(school.schoolName),
          udiseCode: school.udiseCode,
          id: school.id,
          subject: selectedSubject,
          data: [levelData],
          groupTitle: groupTitle,
          showCurriculumNote: showNote
        });

        setClassModalOpen(true);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedBlock("");
    setSelectedCluster("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const isAnyFilterActive = !!searchQuery.trim() || !!selectedBlock || !!selectedCluster;

  // Handle opening download modal
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
        // Use filteredData instead of transformedData for current page
        // This ensures we download exactly what user sees on screen
        dataToDownload = filteredData;
        
        // Additional safety check - ensure we don't exceed expected count
        if (dataToDownload.length !== count) {
          // Update the toast message to reflect actual count
          toast.info(`Generating ${format.toUpperCase()} report for ${dataToDownload.length} schools (current page)...`);
        }
      } else {
        // For non-current options, fetch from API with proper parameters
        // Fetch more data from API
        let url = `/report/subject-performance/${selectedSubject}?page=1&pageSize=${
          count === totalRecords ? totalRecords : count
        }`;

        // Important: Include the same filters as current view
        if (selectedBlock) {
          url += `&blockName=${selectedBlock}`;
        }
        if (selectedCluster) {
          url += `&clusterName=${selectedCluster}`;
        }
        if (debouncedSearchQuery) {
          url += `&query=${encodeURIComponent(debouncedSearchQuery)}`;
        }

        const response = await apiInstance.get(url);
        if (response.data.success) {
          const apiData = response.data.data.schools;
          
          // Additional safety check for API response
          if (apiData.length > count && count !== totalRecords) {
            // Slice to exact count if API returned more than expected
            apiData.splice(count);
          }
          dataToDownload = apiData.map((school) => {
            const primaryData = school.subjectPerformance[0] || {};
            const upperData = school.subjectPerformance[1] || {};
            const highData = school.subjectPerformance[2] || {};
            const higherData = school.subjectPerformance[3] || {};

            return {
              schoolName: toTitleCase(school.schoolName),
              udiseCode: school.udiseCode,
              primaryAvg: primaryData.primaryAvg !== undefined ? primaryData.primaryAvg : null,
              primaryPass: primaryData.primaryPass !== undefined ? primaryData.primaryPass : null,
              upperPrimaryAvg:
                upperData.upperPrimaryAvg !== undefined ? upperData.upperPrimaryAvg : null,
              upperPrimaryPass:
                upperData.upperPrimaryPass !== undefined ? upperData.upperPrimaryPass : null,
              highSchoolAvg: highData.highSchoolAvg !== undefined ? highData.highSchoolAvg : null,
              highSchoolPass: highData.highSchoolPass !== undefined ? highData.highSchoolPass : null,
              higherSecondaryAvg:
                higherData.higherSecondaryAvg !== undefined ? higherData.higherSecondaryAvg : null,
              higherSecondaryPass:
                higherData.higherSecondaryPass !== undefined
                  ? higherData.higherSecondaryPass
                  : null,
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
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    // Calculate statistics for the report
    const totalSchools = data.length;
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedSubject} Performance Report</title>
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.9;
            color: #333;
            background: white;
            font-size: 11px;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2F4F4F;
          }
          
          .header h1 {
            color: #2F4F4F;
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .header .date {
            color: #666;
            font-size: 12px;
          }
          
          .filter-info {
            background-color: #f8f9fa;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          
          .filter-info h3 {
            color: #2F4F4F;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .filter-info .filter-item {
            display: inline-block;
            margin-right: 20px;
            color: #666;
            font-size: 12px;
          }
          
          .filter-info .filter-item strong {
            color: #2F4F4F;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background: white;
            font-size: 10px;
          }
          
          thead {
            background-color: #2F4F4F;
            color: white;
          }
          
          th {
            padding: 8px 6px;
            text-align: center;
            font-weight: 600;
            font-size: 11px;
            border: 1px solid #2F4F4F;
          }
          
          th.school-header {
            text-align: left;
            padding-left: 10px;
          }
          
          th.group-header {
            background-color: #1a3a3a;
            font-size: 12px;
          }
          
          td {
            padding: 6px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
          }
          
          td.school-name {
            text-align: left;
            padding-left: 10px;
            font-weight: 500;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          tbody tr:hover {
            background-color: #e8f5f9;
          }
          
          .low-score {
            color: #F45050;
            font-weight: 600;
          }
          
          .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          
          .summary h3 {
            color: #2F4F4F;
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .summary-item {
            display: inline-block;
            margin-right: 30px;
            margin-bottom: 5px;
            font-size: 12px;
          }
          
          .summary-item strong {
            color: #2F4F4F;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          
          @media print {
            .no-print {
              display: none;
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead tr.group-row {
            height: 72px;
            }

            thead tr.sub-row,
            tbody tr {
            height: 60px;
            }

            th, td {
            vertical-align: middle;
            }

          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${selectedSubject} Performance Report</h1>
           <div class="subtitle">Academic Year ${academicYear}</div>
            <div class="date">Generated on: ${currentDate}</div>
          </div>
          
          ${
            selectedBlock || selectedCluster
              ? `
          <div class="filter-info">
            <h3>Applied Filters:</h3>
            ${
              selectedBlock
                ? `<div class="filter-item"><strong>Block:</strong> ${selectedBlock}</div>`
                : ""
            }
            ${
              selectedCluster
                ? `<div class="filter-item"><strong>Cluster:</strong> ${selectedCluster}</div>`
                : ""
            }
          </div>
          `
              : ""
          }
          
          <table>
            <thead>
              <tr>
                <th rowspan="2" class="school-header">School Name</th>
                <th colspan="2" class="group-header">Primary (1-5)</th>
                <th colspan="2" class="group-header">Upper Primary (6-8)</th>
                <th colspan="2" class="group-header">High School (9-10)</th>
                <th colspan="2" class="group-header">Higher Secondary (11-12)</th>
              </tr>
              <tr>
                <th>Avg. Marks</th>
                <th>Pass Rate(%)</th>
                <th>Avg. Marks</th>
                <th>Pass Rate(%)</th>
                <th>Avg. Marks</th>
                <th>Pass Rate(%)</th>
                <th>Avg. Marks</th>
                <th>Pass Rate(%)</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map((school) => {
                  const isLowScore = (value) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num < 33;
                  };

                  return `
                  <tr>
                    <td class="school-name">${school.udiseCode} - ${toTitleCase(school.schoolName)}</td>
                    <td class="${isLowScore(school.primaryAvg) ? "low-score" : ""}">
                      ${formatNumber(school.primaryAvg)}
                    </td>
                    <td class="${isLowScore(school.primaryPass) ? "low-score" : ""}">
                      ${school.primaryPass !== null ? formatNumber(school.primaryPass) + "%" : "-"}
                    </td>
                    <td class="${isLowScore(school.upperPrimaryAvg) ? "low-score" : ""}">
                      ${formatNumber(school.upperPrimaryAvg)}
                    </td>
                    <td class="${isLowScore(school.upperPrimaryPass) ? "low-score" : ""}">
                      ${school.upperPrimaryPass !== null ? formatNumber(school.upperPrimaryPass) + "%" : "-"}
                    </td>
                    <td class="${isLowScore(school.highSchoolAvg) ? "low-score" : ""}">
                      ${formatNumber(school.highSchoolAvg)}
                    </td>
                    <td class="${isLowScore(school.highSchoolPass) ? "low-score" : ""}">
                      ${school.highSchoolPass !== null ? formatNumber(school.highSchoolPass) + "%" : "-"}
                    </td>
                    <td class="${isLowScore(school.higherSecondaryAvg) ? "low-score" : ""}">
                      ${formatNumber(school.higherSecondaryAvg)}
                    </td>
                    <td class="${isLowScore(school.higherSecondaryPass) ? "low-score" : ""}">
                      ${
                        school.higherSecondaryPass !== null ? formatNumber(school.higherSecondaryPass) + "%" : "-"
                      }
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Report Summary</h3>
            <div class="summary-item"><strong>Total Schools:</strong> ${totalSchools}</div>
            <div class="summary-item"><strong>Subject:</strong> ${selectedSubject}</div>
            <div class="summary-item"><strong>Report Type:</strong> School Performance Analysis</div>
          </div>
          
          <div class="footer">
            <p>This report is generated automatically from the School Performance System</p>
            <p>© ${academicYear} Academic Performance Tracking System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        toast.success(`PDF report ready with ${data.length} schools`);
      }, 250);
    };
  };

  // Download report as CSV
  const handleDownloadCSV = (data) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build CSV content with comprehensive information
    let csvContent = "";

    // Header Information
    csvContent += `"${selectedSubject} Performance Report"\n`;
    csvContent += `"Academic Year ${academicYear}"\n`;
    csvContent += `"Generated on: ${currentDate}"\n`;
    csvContent += "\n"; // Blank line

    // Filter Information (if any filters are applied)
    if (selectedBlock || selectedCluster) {
      csvContent += `"Applied Filters:"\n`;
      if (selectedBlock) {
        csvContent += `"Block: ${selectedBlock}"\n`;
      }
      if (selectedCluster) {
        csvContent += `"Cluster: ${selectedCluster}"\n`;
      }
      csvContent += "\n"; // Blank line
    }

    // Table Headers
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

    csvContent += headers.join(",") + "\n";

    // Table Data
    data.forEach((school) => {
      const rowData = [
        `"${school.udiseCode} - ${toTitleCase(school.schoolName)}"`,
        formatNumber(school.primaryAvg),
        school.primaryPass ? `${formatNumber(school.primaryPass)}%` : "-",
        formatNumber(school.upperPrimaryAvg),
        school.upperPrimaryPass ? `${formatNumber(school.upperPrimaryPass)}%` : "-",
        formatNumber(school.highSchoolAvg),
        school.highSchoolPass ? `${formatNumber(school.highSchoolPass)}%` : "-",
        formatNumber(school.higherSecondaryAvg),
        school.higherSecondaryPass ? `${formatNumber(school.higherSecondaryPass)}%` : "-",
      ];

      csvContent +=
        rowData
          .map((cell) => {
            // Already quoted school names, don't double quote
            if (cell && cell.toString().startsWith('"')) {
              return cell;
            }
            // Quote cells that contain commas
            if (cell && cell.toString().includes(",")) {
              return `"${cell}"`;
            }
            return cell;
          })
          .join(",") + "\n";
    });

    // Report Summary at the bottom (like PDF)
    csvContent += "\n"; // Blank line
    csvContent += `"Report Summary:"\n`;
    csvContent += `"Total Schools: ${data.length}"\n`;
    csvContent += `"Subject: ${selectedSubject}"\n`;
    csvContent += `"Report Type: School Performance Analysis"\n`;

    //  Create download link
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
      schoolName: toTitleCase(school.schoolName),
      udiseCode: school.udiseCode,
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

  // Since search is now handled by the API, we use transformedData directly
  const filteredData = useMemo(() => {
    let data = transformedData;

    // Ensure we're only showing pageSize items
    if (data.length > pageSize) {
      data = data.slice(0, pageSize);
    }

    return data;
  }, [transformedData, pageSize]);

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper mt-6">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: { xs: 2, md: 0 },
            mb: 4
          }}
        >
          <div>
            <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">School Performance Report</h5>
          </div>

          <Box sx={{ flexShrink: 0 }}>
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
                whiteSpace: "nowrap",
                minWidth: "fit-content"
              }}
            >
              Academic Year {academicYear}
            </Typography>
          </Box>
        </Box>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Typography variant="subtitle1">Generate Report for</Typography>
            <div style={{ width: "auto", marginLeft: "16px", borderRadius: "8px" }}>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  displayEmpty
                  disabled={isLoadingSubjects || subjects.length === 0}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300, // Maximum height for dropdown
                        overflow: 'auto', // Enable scrolling
                        borderRadius: "8px",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                      }
                    },
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null, // Prevents automatic positioning
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "8px",
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: "14px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderRadius: "8px",
                    },
                    "& .MuiSelect-select": {
                      padding: "12px 16px",
                      paddingRight: "32px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                    },
                  }}
                >
                  {isLoadingSubjects ? (
                    <MenuItem disabled>Loading subjects...</MenuItem>
                  ) : subjects.length === 0 ? (
                    <MenuItem disabled>No subjects available</MenuItem>
                  ) : (
                    subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="w-full lg:w-[385px]">
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
                  minWidth: "200px",
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
                marginBottom: { xs: "8px", md: "0" },
              }}
            />
          </div>

          <div style={{ width: "auto" }}>
            <FormControl size="small" sx={{ minWidth: 0 }}>
              <Select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return "Block";
                  return selected
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300, // Maximum height for dropdown
                      overflow: 'auto', // Enable scrolling
                      borderRadius: "8px",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                    }
                  },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null, // Prevents automatic positioning
                }}
                sx={{
                  height: "48px",
                  borderRadius: "8px",
                  minWidth: 0,
                  width: "auto",
                  fontFamily: "Work Sans",
                  fontSize: "14px",
                  "& .MuiSelect-select": {
                    minWidth: 0,
                    width: "auto",
                    display: "inline-block",
                    padding: "12px 16px",
                    paddingRight: "32px",
                  },
                }}
              >
                <MenuItem value="">All Blocks</MenuItem>
                {availableBlocks.map((block) => (
                  <MenuItem key={block} value={block}>
                    {block
                      .toLowerCase()
                      .split(" ")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ width: "auto" }}>
            <FormControl size="small" sx={{ minWidth: 0 }}>
              <Select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return "Cluster";
                  return selected
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300, // Maximum height for dropdown
                      overflow: 'auto', // Enable scrolling
                      borderRadius: "8px",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                    }
                  },
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null, // Prevents automatic positioning
                }}
                sx={{
                  height: "48px",
                  borderRadius: "8px",
                  minWidth: 0,
                  width: "auto",
                  fontFamily: "Work Sans",
                  fontSize: "14px",
                  "& .MuiSelect-select": {
                    minWidth: 0,
                    width: "auto",
                    display: "inline-block",
                    padding: "12px 16px",
                    paddingRight: "32px",
                  },
                }}
              >
                <MenuItem value="">All Clusters</MenuItem>
                {availableClusters.map((cluster) => (
                  <MenuItem key={cluster} value={cluster}>
                    {cluster
                      .toLowerCase()
                      .split(" ")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
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
                    fontFamily: "Work Sans",
                    color: "#2F4F4F",
                    fontWeight: 600,
                    fontSize: "14px",
                    textTransform: "none",
                    height: "48px",
                    padding: "0 12px",
                    background: "transparent",
                    "&:hover": {
                      background: "#f5f5f5",
                      borderRadius: 0,
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
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
          <CustomTable data={filteredData} />
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
              count={totalPages || 1}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              size="medium"
              renderItem={(item) => {
                const isNextPage = item.type === "page" && item.page === currentPage + 1;
                const isCurrentPage = item.type === "page" && item.page === currentPage;

                return (
                  <PaginationItem
                    {...item}
                    sx={{
                      margin: "0 2px",
                      ...(isNextPage && {
                        border: "1px solid #2F4F4F !important",
                        borderRadius: "9999px !important",
                        color: "#2F4F4F !important",
                        backgroundColor: "white !important",
                      }),
                      ...(isCurrentPage && {
                        backgroundColor: "#2F4F4F !important",
                        color: "white !important",
                      }),
                      "&:hover": {
                        backgroundColor: "#A3BFBF !important",
                      },
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
          sx={{ zIndex: 12000 }}
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
              <div className="bg-[#EAEDED] p-4 rounded-md mb-6 flex items-center">
                <div
                  className="text-[#2F4F4F] mr-8"
                  style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                  }}
                >
                  Class Group: {selectedClassData.groupTitle}
                </div>
                <div
                  className="text-[#2F4F4F]"
                  style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                  }}
                >
                  Subject: {selectedClassData.subject}
                </div>
              </div>

              {/* Classes in 2 columns, Avg Marks & Pass Rate in one line */}
              <div>
                {/* Group classes in pairs for 2-column layout */}
                {(() => {
                  const classes = selectedClassData.data[0]?.classes || [];
                  const pairs = [];
                  for (let i = 0; i < classes.length; i += 2) {
                    pairs.push(classes.slice(i, i + 2));
                  }
                  return pairs.map((pair, pairIndex) => {
                    const isLastPair = pairIndex === pairs.length - 1;
                    return (
                      <div key={`pair-${pairIndex}`}>
                        <div className="grid grid-cols-2 gap-x-12 py-4">
                          {pair.map((classData, index) => (
                            <div key={`class-${classData.class}-${pairIndex}-${index}`}>
                              <div
                                className="text-[#2F4F4F] mb-2 text-base"
                                style={{ fontWeight: 600, fontFamily: "Work Sans" }}
                              >
                                Class {classData.class}
                              </div>
                              <div
                                className="flex items-center gap-6 text-[#597272]"
                                style={{
                                  fontFamily: "'Work Sans', sans-serif",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                }}
                              >
                                <span>
                                  Avg Marks{" "}
                                  <span
                                    style={{
                                      fontFamily: "'Work Sans', sans-serif",
                                      fontWeight: parseInt(classData.avgMarks) < 33 ? 600 : 400,
                                      fontSize: "14px",
                                      color: parseInt(classData.avgMarks) < 33 ? "#F45050" : "#2F4F4F",
                                    }}
                                  >
                                    {formatNumber(classData.avgMarks)}
                                  </span>
                                </span>
                                <span>
                                  Pass Rate(%){" "}
                                  <span
                                    style={{
                                      fontFamily: "'Work Sans', sans-serif",
                                      fontWeight: parseFloat(classData.successRate) < 33 ? 600 : 400,
                                      fontSize: "14px",
                                      color: parseFloat(classData.successRate) < 33 ? "#F45050" : "#2F4F4F",
                                    }}
                                  >
                                    {classData.successRate ? 
                                      `${formatNumber(classData.successRate.toString().replace('%', ''))}%` : 
                                      formatNumber(classData.successRate)
                                    }
                                  </span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Full-width horizontal line under each row except the last */}
                        {!isLastPair && (
                          <hr 
                            style={{
                              margin: 0,
                              border: 'none',
                              borderTop: '1px solid #E0E0E0',
                              width: '100%'
                            }}
                          />
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Curriculum Note - Only show when not all classes have the subject */}
              {selectedClassData.showCurriculumNote && (
                <div 
                  className="mt-5"
                  style={{
                   
                  }}
                >
                  <div 
                    className="text-[#2F4F4F]"
                    style={{
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: "12px",
                    }}
                  >
                    <strong>Note:</strong> This report includes only those classes where this subject is part of the curriculum.
                  </div>
                </div>
              )}
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

        {/* Loading Indicator - only for non-search operations */}
        {isLoading && !isSearchLoading && <SpinnerPageOverlay isLoading={isLoading} />}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          style={{ zIndex: 99999999 }}
        />
      </div>
    </ThemeProvider>
  );
};

export default Reports;
