import { useState, useEffect, useMemo } from "react";

import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Box,
  Chip,
  CircularProgress,
  Pagination,
  PaginationItem,
  Typography,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DocScannerIcon from "@mui/icons-material/DocumentScanner";
import SchoolIcon from "@mui/icons-material/School";
import DoneIcon from "@mui/icons-material/Done";
import PendingIcon from "@mui/icons-material/Pending";
import { FileText } from "lucide-react";
import apiInstance from "../../../api";
import axios from "axios"; // Keep axios as fallback
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import OutlinedButton from "../../components/button/OutlinedButton";
import FolderEmptyImg from "../../assets/Folder Empty 1.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DownloadModal from "../../components/modal/DownloadModal";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import { Search } from "lucide-react";
import { useDebounce } from "../../customHook/useDebounce";

// Utility function to convert school names to Title Case
const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Create MUI theme to match TestListTable
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

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "inherit !important", // No highlight
            cursor: "default",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "Karla !important",
          borderBottom: "none",
          fontWeight: 400,
          color: "#2F4F4F",
          fontSize: "14px",
          textAlign: "left !important",
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
          color: "black", // Change default text color
          backgroundColor: "white", // Change the background color of all buttons
          "&.Mui-selected": {
            backgroundColor: "#2F4F4F", // Change color when selected
            color: "white",
          },
          "&:hover": {
            backgroundColor: "#A3BFBF", // Hover color
          },
        },
      },
    },
  },
});

const SchoolPerformanceTable = ({ onSchoolSelect, onSendReminder }) => {
  const navigate = useNavigate();
  
  // State for API data
  const [schools, setSchools] = useState([]);
  const [totalSchools, setTotalSchools] = useState(0);
  const [schoolsSubmitted, setSchoolsSubmitted] = useState(0);
  const [pendingSchools, setPendingSchools] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Separate loading state for search
  const [error, setError] = useState(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [level, setLevel] = useState("school"); // Add level state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [paginationData, setPaginationData] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 15
  });

  // Get test ID from URL
  const { testId } = useParams();
  const location = useLocation();
  const testName = location.state?.testName;

  const [testNameVal, setTestNameVal] = useState(
    testName || localStorage.getItem("currentTestName") || "Test"
  );

  useEffect(() => {
    if (testName) {
      localStorage.setItem("currentTestName", testName);
      setTestNameVal(testName);
    }
  }, [testName]);

  // Alternative way to get testId from URL
  const getTestIdFromUrl = () => {
    const pathParts = location.pathname.split("/");
    return testId || pathParts[pathParts.length - 1] || "b78a7596-7cd8-49e1-8c9e-7db0973fbbc0";
  };

  const currentTestId = getTestIdFromUrl();

  // Determine if this is a remedial test early
  const isRemedialTest = testNameVal?.toLowerCase().includes("remedial");
  
  // Determine if this is a syllabus test
  const isSyllabusTest = testNameVal?.toLowerCase().includes("syllabus");

  const [maxScore, setMaxScore] = useState(null);
  const [requiredMarksToPass, setRequiredMarksToPass] = useState(null);
  const [gradeDistributionData, setGradeDistributionData] = useState({});
  const [testSubject, setTestSubject] = useState(null);

  // Grade level definitions based on subject for remedial tests
  // Display format with Hindi translations (for UI display)
  const GRADE_LEVELS = {
    mathematics: ['Division (भाग)', 'Subtraction (घटाव)', 'Number Identification (संख्या पहचान)', 'Number Recognition (अंक पहचान)', 'Beginner (प्रारंभिक)'], // Reordered as requested
    english: ['Sentence', 'Word', 'Small Letter', 'Capital Letter'], // Reordered as requested
    hindi: ['Story (कहानी)', 'Paragraph (अनुच्छेद)', 'Word (शब्द)', 'Letter (अक्षर)', 'Beginner (प्रारंभिक)'] // Reordered as requested
  };
  
  // API key mappings for each grade level - for quick reference
  const GRADE_LEVEL_API_KEYS = {
    mathematics: {
      'Beginner (प्रारंभिक)': 'BEGINNER',
      'Number Recognition (अंक पहचान)': 'NUMBER_RECOGNITION',
      'Number Identification (संख्या पहचान)': 'NUMBER_IDENTIFICATION',
      'Subtraction (घटाव)': 'SUBTRACTION',
      'Division (भाग)': 'DIVISION'
    },
    english: {
      'Capital Letter': 'CAPITAL_LETTER',
      'Small Letter': 'SMALL_LETTER',
      'Word': 'WORD',
      'Sentence': 'SENTENCE'
    },
    hindi: {
      'Beginner (प्रारंभिक)': 'BEGINNER',
      'Letter (अक्षर)': 'LETTER',
      'Word (शब्द)': 'WORD',
      'Paragraph (अनुच्छेद)': 'PARAGRAPH',
      'Story (कहानी)': 'STORY'
    }
  };
  
  // Direct lookup for API response keys to handle different formats
  const API_GRADE_KEYS = [
    'CAPITAL_LETTER', 'SMALL_LETTER', 'WORD', 'SENTENCE', 
    'BEGINNER', 'NUMBER_RECOGNITION', 'NUMBER_IDENTIFICATION', 'SUBTRACTION', 'DIVISION',
    'LETTER', 'PARAGRAPH', 'STORY'
  ];

  // Syllabus grade columns for syllabus tests - single line labels for better UI
  const SYLLABUS_GRADE_COLUMNS = [
    { key: 'gradeA', label: 'A (81-100%)' },
    { key: 'gradeB', label: 'B (61-80%)' },
    { key: 'gradeC', label: 'C (41-60%)' },
    { key: 'gradeD', label: 'D (33-40%)' },
    { key: 'gradeE', label: 'E (0-32%)' }
  ];

  // Function to detect test subject from test name or subject parameter
  const detectTestSubject = (testName, apiSubject) => {
    const subject = apiSubject || testName || '';
    const lowerSubject = subject.toLowerCase();
    
    if (lowerSubject.includes('math') || lowerSubject.includes('गणित') || lowerSubject.includes('mathematics')) {
      return 'mathematics';
    } else if (lowerSubject.includes('english') || lowerSubject.includes('अंग्रेजी')) {
      return 'english';
    } else if (lowerSubject.includes('hindi') || lowerSubject.includes('हिंदी')) {
      return 'hindi';
    }
    // Default fallback
    return 'mathematics';
  };

  // Function to get grade levels based on test subject
  const getGradeLevelsForSubject = (subject) => {
    if (!subject) return [];
    const detectedSubject = detectTestSubject(testNameVal, subject);
    return GRADE_LEVELS[detectedSubject] || GRADE_LEVELS.mathematics;
  };
  
  // Function to map UI grade level labels to API gradeCounts keys
  const mapGradeLevelToApiKey = (levelLabel) => {
    if (!levelLabel) return "";
    
    // Extract base label (remove hindi part if present)
    const hindiMatch = levelLabel.match(/\((.*)\)/);
    const baseLabel = hindiMatch ? levelLabel.split('(')[0].trim() : levelLabel;
    
    // Convert to uppercase and replace spaces with underscores
    const apiKey = baseLabel.toUpperCase().replace(/\s+/g, '_');
    
    // Removed debug log
    
    return apiKey;
  };
  
  // Function to get all possible key variations for a grade level
  const getGradeLevelKeyVariations = (level, subject) => {
    // Start with API keys from our mapping
    const variations = [];
    
    // Add the predefined API key if available
    if (GRADE_LEVEL_API_KEYS[subject] && GRADE_LEVEL_API_KEYS[subject][level]) {
      variations.push(GRADE_LEVEL_API_KEYS[subject][level]);
    }
    
    // Add standard API key format
    const standardApiKey = mapGradeLevelToApiKey(level);
    if (standardApiKey && !variations.includes(standardApiKey)) {
      variations.push(standardApiKey);
    }
    
    // Add the original level name
    if (level) {
      variations.push(level);
    }
    
    // Add Hindi variations for Hindi tests
    if (subject === 'hindi') {
      // Extract Hindi label from parentheses if present
      const hindiMatch = level.match(/\((.*)\)/);
      if (hindiMatch && hindiMatch[1]) {
        const hindiLabel = hindiMatch[1].trim();
        if (!variations.includes(hindiLabel)) {
          variations.push(hindiLabel);
        }
      }
    }
    
    // Add Math variations with Hindi labels
    if (subject === 'mathematics') {
      // Extract Hindi label from parentheses if present
      const hindiMatch = level.match(/\((.*)\)/);
      if (hindiMatch && hindiMatch[1]) {
        const hindiLabel = hindiMatch[1].trim();
        if (!variations.includes(hindiLabel)) {
          variations.push(hindiLabel);
        }
      }
    }
    
    // Special handling for English which might have different formats
    if (subject === 'english') {
      const lowerLevel = level.toLowerCase();
      if (lowerLevel.includes('capital') || lowerLevel.includes('small')) {
        const letterType = lowerLevel.includes('capital') ? 'CAPITAL_LETTER' : 'SMALL_LETTER';
        if (!variations.includes(letterType)) {
          variations.push(letterType);
        }
      }
    }
    
    // Special handling for Hindi to check both with and without parentheses
    if (subject === 'hindi' && level.includes('(')) {
      const baseLabel = level.split('(')[0].trim();
      if (baseLabel) {
        variations.push(baseLabel);
        const baseApiKey = mapGradeLevelToApiKey(baseLabel);
        if (baseApiKey && !variations.includes(baseApiKey)) {
          variations.push(baseApiKey);
        }
      }
    }
    
    // Add all standard API keys - this helps when the API is inconsistent
    // but we know the general format of the keys
    API_GRADE_KEYS.forEach(key => {
      if (
        // Only add if it seems relevant to current level
        (level.toUpperCase().includes(key.replace('_', ' ')) || 
         key.includes(standardApiKey) ||
         (subject === 'english' && 
          (key === 'CAPITAL_LETTER' || key === 'SMALL_LETTER' || key === 'WORD' || key === 'SENTENCE'))) &&
        !variations.includes(key)
      ) {
        variations.push(key);
      }
    });
    
    return variations;
  };
  
  // Helper function to get grade count value, trying multiple possible keys
  const getGradeCountValue = (school, gradeLevel, subject, selectedLevel) => {
    if (!school) return "-";
    
    // For school level use gradeCounts, for block/cluster/district use gradeDistribution
    const gradeData = selectedLevel === "school" ? school.gradeCounts || {} : school.gradeDistribution || {};
    
    if (Object.keys(gradeData).length === 0) return "-";
    
    const keyVariations = getGradeLevelKeyVariations(gradeLevel, subject);
    
    // Find first matching key with data
    for (const key of keyVariations) {
      if (gradeData[key] !== undefined) {
        return gradeData[key];
      }
    }
    
    return "-";
  };

  const fetchData = async (page = 1, size = pageSize, selectedLevel = level, searchValue = searchQuery.trim(), selectedStatus = statusFilter) => {
    // Use different loading states for search vs regular data loading
    const isSearching = searchValue && searchValue.trim() !== "";
    if (isSearching) {
      setIsSearchLoading(true);
    } else {
      setLoading(true);
    }
    try {
      // Build search parameters
      const searchParams = {
        page: page,
        pageSize: size,
        level: selectedLevel
      };

      // Add search parameter if provided
      if (searchValue) {
        searchParams.query = searchValue;
      }
      
      // Add status parameter if provided (only for school level)
      if (selectedLevel === "school" && selectedStatus) {
        searchParams.status = selectedStatus;
      }

      const response = await apiInstance.get(`/schools/results/submitted/${currentTestId}`, {
        params: searchParams
      });
      if (response.data && response.data.success) {
        // Handle different response structure based on level
        let apiSchools, totalSubmittedSchools, totalpendingSchools, totalEligibleSchools, pagination, maxScore, testSubject;
        
        if (response.data.data.items) {
          // New API response structure with items
          apiSchools = response.data.data.items;
          // Extract values from metadata if available, otherwise use totalCount
          const metadata = response.data.data.metadata || {};
          totalSubmittedSchools = metadata.totalSubmittedSchools || response.data.data.totalCount || 0;
          totalpendingSchools = metadata.totalpendingSchools || 0;
          totalEligibleSchools = metadata.totalEligibleSchools || response.data.data.totalCount || 0;
          pagination = response.data.data.pagination;
          maxScore = response.data.data.maxScore || null;
          testSubject = response.data.data.testSubject || null;
        } else {
          // Original API response structure
          const data = response.data.data;
          apiSchools = data.schools || [];
          totalSubmittedSchools = data.totalSubmittedSchools || 0;
          totalpendingSchools = data.totalpendingSchools || 0;
          totalEligibleSchools = data.totalEligibleSchools || 0;
          pagination = data.pagination;
          maxScore = data.maxScore;
          testSubject = data.testSubject;
        }
        
        // Update pagination data state
        if (pagination) {
          setPaginationData({
            totalCount: pagination.totalCount || totalEligibleSchools || 0,
            totalPages: pagination.totalPages || Math.ceil(totalEligibleSchools / size) || 1,
            currentPage: pagination.currentPage || page,
            pageSize: pagination.pageSize || size
          });
         
        }

        // Get requiredMarksToPass from first school (assuming all same)
        const requiredMarks = apiSchools.length > 0 ? apiSchools[0].requiredMarksToPass : null;
        setMaxScore(maxScore);
        setRequiredMarksToPass(requiredMarks);
        setTestSubject(testSubject);          // For remedial tests, check if API provides grade distribution data
        let mockGradeData = {};
        
        // Transform API data to match the component's expected format
        const formattedSchools = apiSchools.map((school) => {
          // Handle different field names based on level
          let name = "";
          if (selectedLevel === "school") {
            name = school.schoolName;
          } else if (selectedLevel === "block") {
            name = school.blockName;
          } else if (selectedLevel === "cluster") {
            name = school.clusterName;
          } else if (selectedLevel === "district") {
            // District name could be in "districtName" or "district" field
            name = school.districtName || school.district;
          }
          
          return {
            id: school.id || `${selectedLevel}-${name}`, // Generate ID if not present
            name: toTitleCase(name),
            schoolName: toTitleCase(name), // For consistency
            blockName: school.blockName,
            clusterName: school.clusterName,
            districtName: school.districtName || school.district,
            udiseCode: school.udiseCode,
            passRate: school.successRate, // Map successRate to passRate
            submitted: school.status === "submitted" || selectedLevel !== "school", // Non-school levels don't have status
            totalStudents: school.totalStudents,
            totalStudentsInClass: school.totalStudentsInClass, // For pending schools
            presentStudents: school.presentStudents || school.submittedStudents || school.testTakenStudents, // Some levels use different field names
            absentStudents: school.absentStudents,
            averageScore: school.averageScore,
            overallGrade: school.overallGrade || school.averageGrade, // Some levels use averageGrade
            gradeDistribution: school.gradeDistribution || {},
            // For remedial tests, block/cluster/district level use gradeDistribution for grade counts
            gradeCounts: selectedLevel === "school" ? (school.gradeCounts || {}) : (school.gradeDistribution || {}), 
            scoreCounts: selectedLevel === "school" ? (school.scoreCounts || {}) : (school.gradeDistribution || {}), // For syllabus tests, use appropriate grade data source
            // For district/block/cluster level, additional fields
            totalSchools: school.totalSchools,
            submittedSchools: school.submittedSchools,
            submissionRate: school.submissionRate
          };
        });

        setSchools(formattedSchools);
        setSchoolsSubmitted(totalSubmittedSchools);
        setPendingSchools(totalpendingSchools);
        setTotalSchools(totalEligibleSchools || (totalSubmittedSchools + totalpendingSchools));
      } else {
        setError("Failed to load data");
      }
    } catch (error) {
      // Error handling is implemented via setError state
      setError(error.response?.data?.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
      setIsSearchLoading(false);
    }
  };

  // Handle search functionality with debouncing
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search for 500ms
  
  useEffect(() => {
    if (searchQuery && debouncedSearchQuery !== searchQuery) {
      return;
    }

    const effectiveSearchQuery = searchQuery ? debouncedSearchQuery : "";
    
    fetchData( currentPage, pageSize, level,  effectiveSearchQuery,  statusFilter  );
  }, [ currentTestId,currentPage, pageSize, level, debouncedSearchQuery,  statusFilter, searchQuery  ]);

  // No frontend filtering needed - all filtering is now done on the server
  const filteredSchools = useMemo(() => {
    return schools;
  }, [schools]);

  // For the Download Report
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadConfirm = async (downloadOptions) => {
    const { format, rows } = downloadOptions;
    try {
      setIsLoading(true);
      toast.info(`Generating ${format.toUpperCase()} report...`);
      let dataToDownload = [];
      
      if (rows === "current") {
        dataToDownload = tableData;
      } else {
        // For "all", fetch all data from API
        try {
          // Build search parameters for download
          const downloadParams = {
            page: 1,
            pageSize: totalSchools, // Fetch all records
            level: level // Include level parameter
          };

          // Include search query if present
          if (searchQuery.trim()) {
            downloadParams.query = searchQuery.trim();
          }

          const response = await apiInstance.get(`/schools/results/submitted/${currentTestId}`, {
            params: downloadParams
          });
          
          if (response.data && response.data.success) {
            // Handle different response structures
            const allSchools = response.data.data.schools || response.data.data.items || [];
            
            // Transform all schools data to match table format
            const formattedAllSchools = allSchools.map((school) => {
              const isPending = school.status !== "submitted" && level === "school"; // Only school level has pending status
              
              // Handle different field names based on level
              let name = "";
              if (level === "school") {
                name = school.schoolName;
              } else if (level === "block") {
                name = school.blockName;
              } else if (level === "cluster") {
                name = school.clusterName;
              } else if (level === "district") {
                // District name could be in "districtName" or "district" field
                name = school.districtName || school.district;
              }
              
              const baseData = {
                id: school.id || `${level}-${name}`,
                name: toTitleCase(name) || "-",
                status: level === "school" ? (school.status === "submitted" ? "Submitted" : "Pending") : "N/A",
                blockName: school.blockName || "-",
                clusterName: school.clusterName || "-",
                districtName: school.districtName || school.district || "-",
                totalStudents: isPending 
                  ? (school.totalStudentsInClass != null ? school.totalStudentsInClass : "-")
                  : (school.totalStudents === 0 ? "0" : school.totalStudents != null ? school.totalStudents : "-"),
                presentStudents: isPending 
                  ? "-"
                  : (school.presentStudents === 0 ? "0" : 
                     school.presentStudents != null ? school.presentStudents : 
                     school.testTakenStudents != null ? school.testTakenStudents : 
                     school.submittedStudents != null ? school.submittedStudents : "-"),
                absentStudents: isPending 
                  ? "-"
                  : (school.absentStudents === 0 ? "0" : school.absentStudents != null ? school.absentStudents : "-"),
                averageScore: isPending 
                  ? "-"
                  : (school.averageScore === 0 ? "0" : school.averageScore != null ? school.averageScore : "-"),
                passRate: isPending 
                  ? "-"
                  : (school.successRate === 0
                    ? "0%"
                    : school.successRate != null
                    ? `${school.successRate}%`
                    : "-"),
              };

              // Add grade distribution data for remedial tests
              if (isRemedialTest) {
                const subject = detectTestSubject(testSubject || testNameVal);
                const gradeLevels = getGradeLevelsForSubject(subject);
                
                // Determine which field contains grade data (school level uses gradeCounts, others use gradeDistribution)
                const gradeData = level === "school" ? (school.gradeCounts || {}) : (school.gradeDistribution || {});
                
                // Removed debug log
                
                // Direct mappings from UI labels to API keys for all subjects
                const directMappings = {
                  // English mappings
                  'Capital Letter': 'CAPITAL_LETTER',
                  'Small Letter': 'SMALL_LETTER',
                  'Word': 'WORD', 
                  'Sentence': 'SENTENCE',
                  
                  // Hindi mappings - both English API keys and Hindi API keys
                  'Story (कहानी)': ['STORY', 'कहानी'],
                  'Paragraph (अनुच्छेद)': ['PARAGRAPH', 'अनुच्छेद'],
                  'Word (शब्द)': ['WORD', 'शब्द'],
                  'Letter (अक्षर)': ['LETTER', 'अक्षर'],
                  'Beginner (प्रारंभिक)': ['BEGINNER', 'प्रारंभिक'],
                  
                  // Mathematics mappings - both English API keys and Hindi API keys
                  'Division (भाग)': ['DIVISION', 'भाग'],
                  'Subtraction (घटाव)': ['SUBTRACTION', 'घटाव'],
                  'Number Identification (संख्या पहचान)': ['NUMBER_IDENTIFICATION', 'संख्या पहचान'],
                  'Number Recognition (अंक पहचान)': ['NUMBER_RECOGNITION', 'अंक पहचान']
                  // Note: Mathematics Beginner already included in Hindi mappings above
                };
                
                gradeLevels.forEach(levelLabel => {
                  // First check direct mapping if available (works well for English remedial tests)
                  let gradeValue = "-";
                  let matchedKey = null;
                  
                  // Try direct mapping first (especially useful for English tests)
                  const mapping = directMappings[levelLabel];
                  
                  if (mapping) {
                    if (Array.isArray(mapping)) {
                      // Try each possible key in the mapping array
                      for (const key of mapping) {
                        if (gradeData[key] !== undefined) {
                          gradeValue = gradeData[key];
                          matchedKey = key;
                          break;
                        }
                      }
                    } else if (gradeData[mapping] !== undefined) {
                      gradeValue = gradeData[mapping];
                      matchedKey = mapping;
                    }
                  }
                  
                  if (!matchedKey) {
                    // Fallback to trying all variations
                    const keyVariations = getGradeLevelKeyVariations(levelLabel, subject);
                    
                    for (const key of keyVariations) {
                      if (gradeData[key] !== undefined) {
                        gradeValue = gradeData[key];
                        matchedKey = key;
                        break;
                      }
                    }
                  }
                  
                  baseData[levelLabel] = isPending ? "-" : gradeValue;
                  
                  // Removed debug log
                });
              }

              // Add syllabus grade columns for syllabus tests
              if (isSyllabusTest) {
                // For school level use scoreCounts, for block/cluster/district use gradeDistribution
                const scoreCounts = level === "school" ? (school.scoreCounts || {}) : (school.gradeDistribution || {});
                
                // Removed debug log
                
                SYLLABUS_GRADE_COLUMNS.forEach(col => {
                  if (col.key === 'gradeA') {
                    baseData[col.key] = isPending ? "-" : (scoreCounts["81_100"] !== undefined ? scoreCounts["81_100"] : "-");
                  } else if (col.key === 'gradeB') {
                    baseData[col.key] = isPending ? "-" : (scoreCounts["61_80"] !== undefined ? scoreCounts["61_80"] : "-");
                  } else if (col.key === 'gradeC') {
                    baseData[col.key] = isPending ? "-" : (scoreCounts["41_60"] !== undefined ? scoreCounts["41_60"] : "-");
                  } else if (col.key === 'gradeD') {
                    baseData[col.key] = isPending ? "-" : (scoreCounts["33_40"] !== undefined ? scoreCounts["33_40"] : "-");
                  } else if (col.key === 'gradeE') {
                    baseData[col.key] = isPending ? "-" : (scoreCounts["0_32"] !== undefined ? scoreCounts["0_32"] : "-");
                  } else {
                    baseData[col.key] = "-";
                  }
                });
              }

              baseData.overallGrade = isPending ? "-" : (school.overallGrade || school.averageGrade || school.grade || "-");
              return baseData;
            });
            
            dataToDownload = formattedAllSchools;
          } else {
            throw new Error("Failed to fetch all records");
          }
        } catch (error) {
          // Error handling is implemented via setError state
          toast.error("Failed to fetch all records. Using current page data.");
          dataToDownload = tableData;
        }
      }
      
      if (format === "csv") {
        handleDownloadCSV(dataToDownload);
      } else {
        handleDownloadPDF(dataToDownload);
      }
    } catch (error) {
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = (data) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    // Create CSV content with test information header (matching StudentPerformanceTable format)
    const csvLines = [];
    csvLines.push(`School Performance Report`);
    csvLines.push(``); // Empty line
    
    // Report Information in single line format
    let reportInfo = `Report Information: Test: ${testNameVal}`;
    if (maxScore) {
      reportInfo += `, Maximum Marks: ${maxScore}`;
    }
    reportInfo += `, Records in Report: ${data.length}, Generated on: ${currentDate}`;
    csvLines.push(reportInfo);
    csvLines.push(""); // Empty line before table data
    
    // Build headers based on test type and level
    let baseHeaders = [
      level === "school" ? "School Name" : 
      level === "block" ? "Block Name" :
      level === "cluster" ? "Cluster Name" : 
      "District Name"
    ];
    
    // Add Status only for school level
    if (level === "school") {
      baseHeaders.push("Status");
    }
    
    // Add Block column for school and cluster level
    if (level === "school" || level === "cluster") {
      baseHeaders.push("Block");
    }
    
    // Add Cluster column only for school level
    if (level === "school") {
      baseHeaders.push("Cluster");
    }

    let headers = [];
    if (isRemedialTest) {
      const gradeLevels = getGradeLevelsForSubject(testSubject || testNameVal);
      headers = [
        ...baseHeaders,
        ...gradeLevels,
        "Students Present",
        "Students Absent",
        "Total Students",
        "Overall Grade"
      ];
    } else if (isSyllabusTest) {
      headers = [
        ...baseHeaders,
        ...SYLLABUS_GRADE_COLUMNS.map(col => col.label),
        "Students Present",
        "Students Absent",
        "Total Students",
        "Overall Grade"
      ];
    } else {
      headers = [
        ...baseHeaders,
        "Students Present", 
        "Students Absent",
        "Total Students",
        "Average Score",
        "Pass Percentage",
        "Overall Grade"
      ];
    }
    
    csvLines.push(headers.join(","));
    
    data.forEach((row) => {
      let baseRowData = [toTitleCase(row.name)];
      
      // Add Status only for school level
      if (level === "school") {
        baseRowData.push(row.status);
      }
      
      // Add Block for school and cluster level
      if (level === "school" || level === "cluster") {
        baseRowData.push(row.blockName || "-");
      }
      
      // Add Cluster only for school level
      if (level === "school") {
        baseRowData.push(row.clusterName || "-");
      }

      let rowData = [];
      if (isRemedialTest) {
        const gradeLevels = getGradeLevelsForSubject(testSubject || testNameVal);
        const gradeValues = gradeLevels.map(level => row[level] || "-");
        rowData = [
          ...baseRowData,
          ...gradeValues,
          row.presentStudents,
          row.absentStudents,
          row.totalStudents,
          row.overallGrade
        ];
      } else if (isSyllabusTest) {
        const syllabusValues = SYLLABUS_GRADE_COLUMNS.map(col => row[col.key] || "-");
        rowData = [
          ...baseRowData,
          ...syllabusValues,
          row.presentStudents,
          row.absentStudents,
          row.totalStudents,
          row.overallGrade
        ];
      } else {
        rowData = [
          ...baseRowData,
          row.presentStudents,
          row.absentStudents,
          row.totalStudents,
          row.averageScore,
          row.passRate,
          row.overallGrade
        ];
      }
      
      csvLines.push(rowData.join(","));
    });
    
    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${testNameVal}_School_Performance_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`CSV report downloaded`);
    }, 100);
  };

  const handleDownloadPDF = (data) => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build table headers based on test type and level
    let baseHeaders = [
      { 
        key: "name", 
        label: level === "school" ? "School Name" : 
               level === "block" ? "Block Name" :
               level === "cluster" ? "Cluster Name" : 
               "District Name", 
        align: "left" 
      }
    ];
    
    // Add Status only for school level
    if (level === "school") {
      baseHeaders.push({ key: "status", label: "Status", align: "center" });
    }
    
    // Add Block for school and cluster level
    if (level === "school" || level === "cluster") {
      baseHeaders.push({ key: "blockName", label: "Block", align: "center" });
    }
    
    // Add Cluster only for school level
    if (level === "school") {
      baseHeaders.push({ key: "clusterName", label: "Cluster", align: "center" });
    }

    let tableHeaders = [];
    if (isRemedialTest) {
      const gradeLevels = getGradeLevelsForSubject(testSubject || testNameVal);
      const gradeHeaders = gradeLevels.map(level => ({
        key: level,
        label: level,
        align: "center"
      }));
      tableHeaders = [
        ...baseHeaders,
        ...gradeHeaders,
        { key: "presentStudents", label: "Students Present", align: "center" },
        { key: "absentStudents", label: "Students Absent", align: "center" },
        { key: "totalStudents", label: "Total Students", align: "center" },
        { key: "overallGrade", label: "Overall Grade", align: "center" }
      ];
    } else if (isSyllabusTest) {
      tableHeaders = [
        ...baseHeaders,
        ...SYLLABUS_GRADE_COLUMNS.map(col => ({ key: col.key, label: col.label, align: "center" })),
        { key: "presentStudents", label: "Students Present", align: "center" },
        { key: "absentStudents", label: "Students Absent", align: "center" },
        { key: "totalStudents", label: "Total Students", align: "center" },
        { key: "overallGrade", label: "Overall Grade", align: "center" }
      ];
    } else {
      tableHeaders = [
        ...baseHeaders,
        { key: "presentStudents", label: "Students Present", align: "center" },
        { key: "absentStudents", label: "Students Absent", align: "center" },
        { key: "totalStudents", label: "Total Students", align: "center" },
        { key: "averageScore", label: "Average Score", align: "center" },
        { key: "passRate", label: "Pass Percentage", align: "center" },
        { key: "overallGrade", label: "Overall Grade", align: "center" }
      ];
    }

    const headerRow = tableHeaders.map(header => 
      `<th style="text-align:${header.align};">${header.label}</th>`
    ).join("");

    const dataRows = data.map(row => {
      const cells = tableHeaders.map(header => {
        let cellValue = row[header.key];
        if (header.key === "name") {
          cellValue = toTitleCase(cellValue);
        } else if ((header.key === "blockName" || header.key === "clusterName") && !cellValue) {
          cellValue = "-";
        }
        return `<td style="text-align:${header.align}">${cellValue}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>School Performance Report - ${testNameVal}</title>
      <style>
        @media print {
          @page { size: A4 ${isRemedialTest || isSyllabusTest ? 'landscape' : 'portrait'}; margin: 15mm; }
        }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { color: #2F4F4F; font-size: 22px; margin-bottom: 8px; }
        .header .school-name { color: #2F4F4F; font-size: 16px; font-weight: 600; margin-bottom: 5px; }
        .header .date { color: #666; font-size: 12px; }
        .report-info { 
          background-color: #f8f9fa;
          padding: 12px;
          margin-bottom: 20px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }
        .report-info h3 { 
          color: #2F4F4F;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .info-item {
          display: inline-block;
          color: #666;
          font-size: 12px;
        }
        .info-item strong {
          color: #2F4F4F;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; font-size: ${isRemedialTest || isSyllabusTest ? '10px' : '12px'}; }
        th { background: #2F4F4F; color: #fff; padding: 8px 6px; border: 1px solid #2F4F4F; }
        td { padding: 6px; border: 1px solid #ddd; }
        tr:nth-child(even) { background: #f8f9fa; }
        tr:hover { background: #e8f5f9; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>School Performance Report</h1>
      </div>
      
      <div class="report-info">
        <h3>Report Information</h3>
        <div class="info-item">
          <strong>Test:</strong> ${testNameVal}${maxScore ? `, <strong>Maximum Marks:</strong> ${maxScore}` : ''}, <strong>Records in Report:</strong> ${data.length}, <strong>Generated on:</strong> ${currentDate}
        </div>
      </div>
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        toast.success(`PDF report ready`);
      }, 250);
    };
  };
  // Apply sorting based on which column is being sorted
  const sortedSchools = useMemo(() => {
    if (!sortConfig.key) return filteredSchools;

    return [...filteredSchools].sort((a, b) => {
      // Handle special cases for different fields
      if (sortConfig.key === "name" || sortConfig.key === "schoolName") {
        const aName = (a.name || a.schoolName || "").toLowerCase();
        const bName = (b.name || b.schoolName || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      if (sortConfig.key === "vsPrev") {
        const aValue = a.vsPrev || 0;
        const bValue = b.vsPrev || 0;
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Default comparison for numeric fields
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [filteredSchools, sortConfig]);

  // Function to assign grade to school based on performance
  const assignSchoolGrade = (school) => {
    if (!school || school.status === "pending") {
      return "-";
    }
    
    if (isRemedialTest) {
      // For remedial tests, grade based on highest grade level achieved by majority of students
      const gradeLevels = getGradeLevelsForSubject(testSubject || testNameVal);
      const gradeDistribution = school.gradeDistribution || {};
      
      // Find the highest level where significant number of students are present
      const totalStudents = school.presentStudents || 0;
      if (totalStudents === 0) return "No Data";
      
      // For all subjects, the order is now from highest to lowest level
      // So we start from the beginning of the array for all subjects
      for (let i = 0; i < gradeLevels.length; i++) {
        const level = gradeLevels[i];
        const studentsAtLevel = gradeDistribution[level] || 0;
        const percentage = (studentsAtLevel / totalStudents) * 100;
        
        if (percentage >= 25) { // If 25% or more students at this level
          return level;
        }
      }
      
      // Fallback: find level with maximum students
      let maxStudents = 0;
      // For all subjects, the highest level is now at index 0
      let dominantLevel = gradeLevels[0];
      
      gradeLevels.forEach(level => {
        const students = gradeDistribution[level] || 0;
        if (students > maxStudents) {
          maxStudents = students;
          dominantLevel = level;
        }
      });
      
      return dominantLevel;
    } else if (isSyllabusTest) {
      // For syllabus tests, use the overallGrade field for the Overall Grade column
      return school.overallGrade || "-";
    } else {
      // For regular tests, grade based on pass percentage
      const passRate = parseFloat(school.passRate) || parseFloat(school.successRate) || 0;
      if (passRate >= 90) return "A+";
      if (passRate >= 80) return "A";
      if (passRate >= 70) return "B+";
      if (passRate >= 60) return "B";
      if (passRate >= 50) return "C+";
      if (passRate >= 40) return "C";
      return "D";
    }
  };

  // Format table data for MUIDataTable
  const tableData = sortedSchools.map((school) => {
    const isPending = level === "school" ? !school.submitted : false; // Only school level has pending status
    
    const baseData = {
      id: school.id,
      name: toTitleCase(school.name || school.schoolName) || "-",
      status: level === "school" ? (school.submitted ? "Submitted" : "Pending") : "N/A",
      blockName: school.blockName || "-",
      clusterName: school.clusterName || "-",
      districtName: school.districtName || school.district || "-",
      totalStudents: isPending 
        ? (school.totalStudentsInClass != null ? school.totalStudentsInClass : "-")
        : (school.totalStudents === 0 ? "0" : school.totalStudents != null ? school.totalStudents : "-"),
      presentStudents: isPending 
        ? "-"
        : (school.presentStudents === 0 ? "0" : 
           school.presentStudents != null ? school.presentStudents : 
           school.testTakenStudents != null ? school.testTakenStudents : 
           school.submittedStudents != null ? school.submittedStudents : "-"),
      absentStudents: isPending 
        ? "-"
        : (school.absentStudents === 0 ? "0" : school.absentStudents != null ? school.absentStudents : "-"),
      averageScore: isPending 
        ? "-"
        : (school.averageScore === 0 ? "0" : school.averageScore != null ? school.averageScore : "-"),
      passRate: isPending 
        ? "-"
        : (school.passRate === 0
          ? "0%"
          : school.passRate != null
          ? `${school.passRate}%`
          : school.successRate === 0
          ? "0%"
          : school.successRate != null
          ? `${school.successRate}%`
          : "-"),
      submitted: school.submitted,
    };

    // Add grade distribution data for remedial tests
    if (isRemedialTest) {
      const subject = detectTestSubject(testSubject || testNameVal);
      const gradeLevels = getGradeLevelsForSubject(subject);
      
      // Determine which field contains grade data (school level uses gradeCounts, others use gradeDistribution)
      const gradeData = level === "school" ? (school.gradeCounts || {}) : (school.gradeDistribution || {});
      
      // Direct mappings from UI labels to API keys for all subjects
      const directMappings = {
        // English mappings
        'Capital Letter': 'CAPITAL_LETTER',
        'Small Letter': 'SMALL_LETTER',
        'Word': 'WORD', 
        'Sentence': 'SENTENCE',
        
        // Hindi mappings - both English API keys and Hindi API keys
        'Story (कहानी)': ['STORY', 'कहानी'],
        'Paragraph (अनुच्छेद)': ['PARAGRAPH', 'अनुच्छेद'],
        'Word (शब्द)': ['WORD', 'शब्द'],
        'Letter (अक्षर)': ['LETTER', 'अक्षर'],
        'Beginner (प्रारंभिक)': ['BEGINNER', 'प्रारंभिक'],
        
        // Mathematics mappings - both English API keys and Hindi API keys
        'Division (भाग)': ['DIVISION', 'भाग'],
        'Subtraction (घटाव)': ['SUBTRACTION', 'घटाव'],
        'Number Identification (संख्या पहचान)': ['NUMBER_IDENTIFICATION', 'संख्या पहचान'],
        'Number Recognition (अंक पहचान)': ['NUMBER_RECOGNITION', 'अंक पहचान'],
        // Note: Mathematics Beginner already included in Hindi mappings above
      };
      
      // Removed debug logging
      
      gradeLevels.forEach(levelLabel => {
        // First check direct mapping if available (works well for English remedial tests)
        let gradeValue = "-";
        let matchedKey = null;
        
        // Try direct mapping first (especially useful for English tests)
        const mapping = directMappings[levelLabel];
        
        if (mapping) {
          if (Array.isArray(mapping)) {
            // Try each possible key in the mapping array
            for (const key of mapping) {
              if (gradeData[key] !== undefined) {
                gradeValue = gradeData[key];
                matchedKey = key;
                break;
              }
            }
          } else if (gradeData[mapping] !== undefined) {
            gradeValue = gradeData[mapping];
            matchedKey = mapping;
          }
        }
        
        if (!matchedKey) {
          // Fallback to trying all variations
          const keyVariations = getGradeLevelKeyVariations(levelLabel, subject);
          
          for (const key of keyVariations) {
            if (gradeData[key] !== undefined) {
              gradeValue = gradeData[key];
              matchedKey = key;
              break;
            }
          }
        }
        
        baseData[levelLabel] = isPending ? "-" : gradeValue;
      });
    }

    // Add syllabus grade columns for syllabus tests
    if (isSyllabusTest) {
      // For school level use scoreCounts, for block/cluster/district use gradeDistribution
      const scoreCounts = level === "school" ? (school.scoreCounts || {}) : (school.gradeDistribution || {});
      
      // Removed debug log
      
      SYLLABUS_GRADE_COLUMNS.forEach(col => {
        if (col.key === 'gradeA') {
          // Grade A (81-100)%
          baseData[col.key] = isPending ? "-" : (scoreCounts["81_100"] !== undefined ? scoreCounts["81_100"] : "-");
        } else if (col.key === 'gradeB') {
          // Grade B (61-80)%
          baseData[col.key] = isPending ? "-" : (scoreCounts["61_80"] !== undefined ? scoreCounts["61_80"] : "-");
        } else if (col.key === 'gradeC') {
          // Grade C (41-60)%
          baseData[col.key] = isPending ? "-" : (scoreCounts["41_60"] !== undefined ? scoreCounts["41_60"] : "-");
        } else if (col.key === 'gradeD') {
          // Grade D (21-40)% - Note: backend uses "33_40" for this range
          baseData[col.key] = isPending ? "-" : (scoreCounts["33_40"] !== undefined ? scoreCounts["33_40"] : "-");
        } else if (col.key === 'gradeE') {
          // Grade E (0-32)%
          baseData[col.key] = isPending ? "-" : (scoreCounts["0_32"] !== undefined ? scoreCounts["0_32"] : "-");
        } else {
          // Fallback for any other columns
          baseData[col.key] = "-";
        }
      });
    }

    // Add overall grade from backend (not calculated)
    baseData.overallGrade = isPending ? "-" : (school.overallGrade || school.averageGrade || school.grade || "-");

    return baseData;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setLevel("school"); // Reset level to default
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1); // Reset to first page
    // Data will be fetched with default parameters
  };
  const isAnyFilterActive = !!searchQuery.trim() || (level === "school" && !!statusFilter) || level !== "school";

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

  // MUI DataTable columns configuration
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false }, // Keep the ID hidden in the table
    },
    {
      name: "name",
      label: level === "school" ? "School Name" : 
             level === "block" ? "Block Name" :
             level === "cluster" ? "Cluster Name" : 
             "District Name",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
      },
    },
    // Status column only for school level
    ...(level === "school" ? [{
      name: "status",
      label: "Status",
      options: {
        filter: true,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const status = tableData[dataIndex].status;
          return (
            <div
              className="inline-block px-2 py-1 rounded-full text-xs"
              style={{
                backgroundColor: status === "Submitted" ? "#e8f5e9" : "#FDDCDC",
                color: status === "Submitted" ? "#2e7d32" : "#F45050",
                fontWeight: 400,
                fontFamily: "Work Sans",
                fontSize: "12px",
              }}
            >
              {status}
            </div>
          );
        },
      },
    }] : []),
    // Block column only for school/cluster level (not for block/district level)
    ...(level === "school" || level === "cluster" ? [{
      name: "blockName",
      label: "Block",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
      },
    }] : []),
    // Cluster column only for school level (not for cluster/block/district level)
    ...(level === "school" ? [{
      name: "clusterName",
      label: "Cluster",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
      },
    }] : []),
    // Conditional grade columns for remedial tests
    ...(isRemedialTest 
      ? getGradeLevelsForSubject(testSubject || testNameVal).map(level => ({
          name: level,
          label: level, // Already in proper title case from the updated GRADE_LEVELS
          options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
            setCellProps: () => ({
              className: "center-align-cell",
            }),
            customHeadLabelRender: (columnMeta) => (
              <span
                style={{
                  color: "#2F4F4F",
                  fontFamily: "'Work Sans'",
                  fontWeight: 600,
                  fontSize: "12px",
                  fontStyle: "normal",
                  textTransform: "none",
                  display: "block",
                  textAlign: "center"
                }}
              >
                {columnMeta.label}
              </span>
            ),
          },
        }))
      : []),
    // Syllabus grade columns for syllabus tests
    ...(isSyllabusTest 
      ? SYLLABUS_GRADE_COLUMNS.map(col => ({
          name: col.key,
          label: col.label,
          options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
            setCellProps: () => ({
              className: "center-align-cell",
            }),
            customHeadLabelRender: (columnMeta) => (
              <span
                style={{
                  color: "#2F4F4F",
                  fontFamily: "'Work Sans'",
                  fontWeight: 600,
                  fontSize: "11px",
                  fontStyle: "normal",
                  textTransform: "none",
                  display: "block",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  padding: "4px 2px"
                }}
              >
                {columnMeta.label}
              </span>
            ),
          },
        }))
      : []),
    {
      name: "presentStudents",
      label: "Students Present",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
      },
    },
    {
      name: "absentStudents",
      label: "Students Absent",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
      },
    },
    {
      name: "totalStudents",
      label: "Total Students",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
      },
    },
    // Average Score and Pass Rate only for regular tests
    ...(isRemedialTest || isSyllabusTest
      ? []
      : [
          {
            name: "averageScore",
            label: "Average Score",
            options: {
              filter: false,
              sort: true,
              sortThirdClickReset: true,
              setCellProps: () => ({
                className: "center-align-cell",
              }),
            },
          },
          {
            name: "passRate",
            label: "Pass Percentage",
            options: {
              filter: false,
              sort: true,
              sortThirdClickReset: true,
              setCellProps: () => ({
                className: "center-align-cell",
              }),
              customBodyRenderLite: (dataIndex) => {
                const passRate = tableData[dataIndex].passRate;
                return passRate !== "-" ? `${passRate}` : "-";
              },
            },
          },
        ]),
    // Overall Grade column (from backend)
    {
      name: "overallGrade",
      label: "Overall Grade",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
        customBodyRenderLite: (dataIndex) => {
          const rowData = tableData[dataIndex];
          const isPending = rowData.status === "Pending";
          if (isPending) return "-";
          
          const gradeColor = "#2F4F4F";
          
          return (
            <span
              style={{
                color: gradeColor,
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {rowData.overallGrade}
            </span>
          );
        },
      },
    },
    // Actions column only for school level
    ...(level === "school" ? [{
      name: "submitted",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({
          style: {
            textAlign: "right",
            padding: "0px 16px",
            minWidth: "170px",
            maxWidth: "170px",
            width: "200px",
          },
        }),
        setCellHeaderProps: () => ({
          style: {
            textAlign: "center",
            minWidth: "170px",
            maxWidth: "170px",
            width: "250px",
          },
        }),
        customBodyRenderLite: (dataIndex) => {
          const rowData = tableData[dataIndex];
          const schoolId = rowData.id;
          const isPending = rowData.status === "Pending";
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 0",
              }}
            >
              <Button
                variant="text"
                size="small"
                disabled={isPending}
                onClick={() =>
                  navigate(`/allTest/schoolSubmission/${testId}/testDetails/${schoolId}`, {
                    state: {
                      schoolName: rowData.name, // Pass school name to the details page
                      testName: testNameVal, // Pass the test name
                    },
                  })
                }
                sx={{
                  color: "#2F4F4F",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "'Work Sans'",
                  padding: "6px 12px",
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: isPending ? "inherit" : "rgba(47, 79, 79, 0.08)",
                  },
                }}
              >
                <DocScannerIcon
                  style={{
                    width: "20px",
                    height: "22px",
                    marginRight: "4px",
                    color: isPending ? "#B0B0B0" : "#2F4F4F",
                  }}
                />
                View Details
              </Button>
            </div>
          );
        },
      },
    }] : []),
  ];

  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadLabelRender = defaultCustomHeadLabelRender;
  });

  // MUI DataTable options
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    responsive: "standard",
    rowsPerPage: 15,
    rowsPerPageOptions: [10, 15, 20, 50, 100],
    pagination: false,
    elevation: 0,
    setTableProps: () => ({
      style: {
        borderCollapse: "collapse",
      },
    }),
    setRowProps: () => ({
      style: {
        borderBottom: "none",
      },
    }),
  };

  // Calculate submission rate
  const submissionRate = totalSchools > 0 ? Math.round((schoolsSubmitted / totalSchools) * 100) : 0;

  // Show loading indicator while fetching data
  if (loading) {
    return <SpinnerPageOverlay isLoading={true} />;
  }

  // Show error message if data fetch failed
  if (error) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-red-500 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold">Error Loading Data</h3>
        </div>
        <p className="text-gray-600">{error}</p>
        <OutlinedButton onClick={() => window.location.reload()} text={"Retry"} />
      </div>
    );
  }

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    // Data will be fetched automatically via useEffect when currentPage changes
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // Data will be fetched automatically via useEffect when pageSize changes
  };

  return (
    <ThemeProvider theme={theme}>
      <style>
        {`
    .center-align-cell {
      text-align: center !important;
    }
    
    /* Better styling for syllabus grade column headers */
    .MuiTableHead-root .MuiTableCell-head {
      padding: 8px 6px !important;
      vertical-align: middle !important;
    }
    
    /* Ensure proper spacing for grade columns */
    .MuiTableCell-head {
      min-width: 75px !important;
      text-align: center !important;
    }
  `}
      </style>
      <div className="bg-white ">
        <div className="bg-white border-b-0 border-gray-100 mb-0">
          {/* School Submission with stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
            <div>
              <div className="mb-6">
                <h5 className="text-[#2F4F4F]">{testNameVal} - Submission </h5>
              </div>
            </div>

            <Box className="">
              {level === "school" && (
                <Box className="flex flex-wrap gap-3 md:justify-end items-center">
                  <Chip
                    icon={<SchoolIcon style={{ fontSize: "16px" }} />}
                    label={`Total: ${totalSchools}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: "100px",
                      height: "32px",
                      fontFamily: "Work Sans",
                      fontSize: "14px",
                      bgcolor: "#EAEDED",
                      border: "1.5px solid #2F4F4F",
                      fontWeight: 400,
                      color: "#2F4F4F",
                      "& .MuiChip-icon": { color: "#2F4F4F" },
                    }}
                  />
                  <Chip
                    icon={<DoneIcon style={{ fontSize: "16px" }} />}
                    label={`Submitted: ${schoolsSubmitted}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: "100px",
                      height: "32px",
                      fontFamily: "Work Sans",
                      fontSize: "14px",
                      bgcolor: "#E9F3E9",
                      fontWeight: 400,
                      color: "#2e7d32",
                      "& .MuiChip-icon": { color: "#2e7d32" },
                    }}
                  />
                  <Chip
                    icon={<PendingIcon style={{ fontSize: "16px" }} />}
                    label={`Pending: ${pendingSchools}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: "100px",
                      height: "32px",
                      bgcolor: "#FFFBE6",
                      fontFamily: "Work Sans",
                      fontSize: "14px",
                      border: "1.5px solid #FFD700",
                      fontWeight: 400,
                      color: "#2F4F4F",
                      "& .MuiChip-icon": {
                        color: "#2F4F4F",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </div>
        </div>

        {/* Filters section - always show it regardless of data presence */}
        <div className="pb-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* LEFT: Search, Status, Clear */}
            <div className="flex flex-wrap items-center gap-3">
                <TextField
                  variant="outlined"
                  placeholder={`Search by ${level === "school" ? "School" : 
                                           level === "block" ? "Block" :
                                           level === "cluster" ? "Cluster" : 
                                           "District"} Name`}
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
                      minWidth: "250px",
                      width: "360px",
                    },
                  }}
                  sx={{ marginBottom: { xs: "10px", md: "0" } }}
                />

                {/* Status filter only for school level */}
                {level === "school" && (
                  <FormControl
                    sx={{
                      height: "48px",
                      display: "flex",
                      width: "150px",
                    }}
                  >
                    <InputLabel
                      id="status-select-label"
                      sx={{
                        color: "#2F4F4F",
                        fontFamily: "Work Sans",
                        fontSize: "14px",
                        fontWeight: 400,
                        transform: "translate(14px, 14px) scale(1)",
                        "&.Mui-focused, &.MuiFormLabel-filled": {
                          transform: "translate(14px, -9px) scale(0.75)",
                        },
                      }}
                    >
                      Status
                    </InputLabel>
                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{
                        height: "100%",
                        borderRadius: "8px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderRadius: "8px",
                        },
                        "& .MuiSelect-select": {
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <FormControl
                  sx={{
                    height: "48px",
                    display: "flex",
                    width: "150px",
                  }}
                >
                  <InputLabel
                    id="level-select-label"
                    sx={{
                      color: "#2F4F4F",
                      fontFamily: "Work Sans",
                      fontSize: "14px",
                      fontWeight: 400,
                      transform: "translate(14px, 14px) scale(1)",
                      "&.Mui-focused, &.MuiFormLabel-filled": {
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    }}
                  >
                    Level
                  </InputLabel>
                  <Select
                    labelId="level-select-label"
                    id="level-select"
                    value={level}
                    label="Level"
                    onChange={(e) => setLevel(e.target.value)}
                    sx={{
                      height: "100%",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "8px",
                      },
                      "& .MuiSelect-select": {
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="school">School</MenuItem>
                    <MenuItem value="block">Block</MenuItem>
                    <MenuItem value="cluster">Cluster</MenuItem>
                    <MenuItem value="district">District</MenuItem>
                  </Select>
                </FormControl>

                {isAnyFilterActive && (
                  <Tooltip title="Clear all filters" placement="top">
                    <Button
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
              {/* RIGHT: Download Report */}
              <div>
                <Button
                  onClick={() => setDownloadModalOpen(true)}
                  sx={{
                    borderRadius: "8px",
                    bgcolor: "#FFD700",
                    color: "#2F4F4F",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "18px",
                    fontFamily: "Work Sans",
                    ml: 2,
                    height: "48px",
                    "&:hover": {
                      background: "#CCAC00 ",
                    },
                  }}
                >
                  Download Report
                </Button>
              </div>
            </div>
          </div>

        {schools.length > 0 && !isRemedialTest && !isSyllabusTest && (
          <div
            style={{
              borderRadius: "8px",
              padding: "12px 0px",
              margin: "16px 0 0 0",
              fontWeight: 600,
              color: "#2F4F4F",
              fontSize: "18px",
              fontFamily: "Work Sans",
            }}
          >
             Maximum Marks: {maxScore} 
          </div>
        )}
        {/* Data Table - Always shown regardless of data presence */}
        <div className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto">
          <MUIDataTable
            data={schools.length > 0 ? tableData : []}
            columns={columns}
            options={{
              ...options,
            }}
          />
        </div>

            {/* Pagination and Rows per Page */}
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
                {paginationData.totalPages > 0 && (
                  <Pagination
                    count={paginationData.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    showFirstButton
                    showLastButton
                    renderItem={(item) => (
                      <PaginationItem
                        {...item}
                        sx={{
                          ...(item.page === currentPage + 1 && item.type === "page"
                            ? { border: "1px solid #2F4F4F", color: "#2F4F4F" }
                            : {}),
                        }}
                      />
                    )}
                  />
                )}
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
                  value={pageSize}
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
        
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          onConfirm={handleDownloadConfirm}
          currentPageCount={tableData.length}
          totalRecords={totalSchools}
          subject={testNameVal}
          reportName={testNameVal ? `${testNameVal} Submission Report` : 'Submission Report'}
          reportLevel={level}
        />
        {isLoading && !loading && <SpinnerPageOverlay isLoading={isLoading} />}
        <ToastContainer
          style={{ zIndex: 99999999 }}
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
        />
      </div>
    </ThemeProvider>
  );
};

export default SchoolPerformanceTable;
