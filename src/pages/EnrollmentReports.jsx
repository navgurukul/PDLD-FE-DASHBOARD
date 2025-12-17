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
import DownloadModal from "../components/modal/DownloadModal";
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
        head: {
          fontWeight: "600 !important", // Force bold
          fontFamily: "'Work Sans', sans-serif",
          fontSize: "14px",
          color: "#2F4F4F",
          textTransform: "none !important", 
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "inherit !important", 
            cursor: "default",
          },
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
  const [downloadModalOpen, setDownloadModalOpen] = useState(false); // Add download modal state
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
  const [blockClusterData, setBlockClusterData] = useState([]); 
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

  // Helper function to get dynamic search placeholder based on selected grouping level
  const getSearchPlaceholder = () => {
    switch (selectedGrouping) {
      case "block":
        return "Search by Block Name..";
      case "cluster": 
        return "Search by Block, Cluster Name..";
      case "school":
        return "Search by Block, Cluster, School Name..";
      default:
        return "Search..";
    }
  };

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

      // Smart parameter handling - detect search intent and use appropriate parameter
      if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
        const searchLower = debouncedSearchQuery.toLowerCase().trim();
        
        // Check if search matches any block (case-insensitive, partial match)
        const matchingBlock = blocks.find(block => 
          block.toLowerCase().includes(searchLower)
        );
        
        // Check if search matches any cluster (case-insensitive, partial match)
        const matchingCluster = clusters.find(cluster => 
          cluster.toLowerCase().includes(searchLower)
        );
        
        // Use specific parameter based on what was found
        if (matchingBlock) {
          params.append("block", matchingBlock);
        } else if (matchingCluster) {
          params.append("cluster", matchingCluster);
        } else {
          params.append("query", debouncedSearchQuery);
        }
      }

      // Add dropdown-selected filters (these work independently of search)
      if (selectedBlock) params.append("block", selectedBlock);
      if (selectedCluster) params.append("cluster", selectedCluster);

      const response = await apiInstance.get(`/report/enrollment?${params.toString()}`);
      
      if (response.data.success) {
        const responseData = response.data.data;
        const { enrollmentData, reportType, academicYear, pagination: responsePagination, lastUpdatedOn } = responseData;
        const responseMetadata = responseData.metadata;
      
        // Store raw data from API (processing will be done by useMemo)
        setData(enrollmentData || []);
        setMetadata({ 
          ...(responseMetadata || {}),
          reportType,
          academicYear,
          lastUpdatedOn
        });
        
        // Update pagination with server response
        setPagination(prev => ({
          ...prev,
          totalItems: responsePagination?.totalItems || responseMetadata?.totalRecords || (enrollmentData || []).length,
          totalPages: responsePagination?.totalPages || responseMetadata?.totalPages || Math.ceil((responseMetadata?.totalRecords || (enrollmentData || []).length) / prev.pageSize),
        }));
        
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

  // Fetch blocks and clusters for filter dropdowns using the same approach as SchoolList.jsx
  const fetchGlobalBlocksAndClusters = async () => {
    try {
      const response = await apiInstance.get("/user/dropdown-data");
      if (response.data && response.data.success) {
        const blocksData = response.data.data;

        // Store the full data structure for block-cluster relationship
        setBlockClusterData(blocksData);

        // Extract unique blocks
        const uniqueBlocks = blocksData.map((block) => block.blockName).filter(Boolean).sort();
        setBlocks(uniqueBlocks);

        // Extract unique clusters - show all initially
        const allClusterNames = blocksData.flatMap((block) =>
          block.clusters.map((cluster) => cluster.name)
        );
        const uniqueClusters = [...new Set(allClusterNames)].filter(Boolean).sort();
        setClusters(uniqueClusters);
      } else {
        console.error("Failed to fetch blocks and clusters:", response.data?.message);
      }
    } catch (error) {
      console.error("Error fetching blocks and clusters:", error);
      toast.error("Failed to load blocks and clusters data");
    }
  };

  useEffect(() => {
    // Fetch global blocks and clusters on component mount
    fetchGlobalBlocksAndClusters();
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

  useEffect(() => {
    // Clear cluster filter when level changes to "block"
    if (selectedGrouping === "block" && selectedCluster !== "") {
      setSelectedCluster("");
    }
  }, [selectedGrouping]);

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

  const defaultCustomHeadLabelRender = (columnMeta) => (
    <div
      style={{
        display: "flex",
        justifyContent: columnMeta.name === "actions" ? "center" : "flex-start",
        fontWeight: 600,
        fontSize: "14px",
        color: "#2F4F4F",
        textTransform: "none",
        fontFamily: "'Work Sans'",
        fontStyle: "normal",
      }}
    >
      {columnMeta.label}
    </div>
  );

  // Add customHeadLabelRender to all columns
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
    pagination: false,
  };

  const isAnyFilterActive = selectedBlock !== "" || selectedCluster !== "" || searchQuery !== "" || selectedGrouping !== "school" || selectedClassGroup !== "all";

  const resetFilters = () => {
    setSelectedBlock("");
    setSelectedCluster("");
    setSearchQuery("");
    setSelectedGrouping("school");
    setSelectedClassGroup("all");
    
    // Reset clusters to show all available clusters
    if (blockClusterData.length > 0) {
      const allClusterNames = blockClusterData.flatMap((block) =>
        block.clusters.map((cluster) => cluster.name)
      );
      const uniqueClusters = [...new Set(allClusterNames)].filter(Boolean).sort();
      setClusters(uniqueClusters);
    }
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

  // Handle opening download modal
  const handleDownloadClick = () => {
    setDownloadModalOpen(true);
  };

  // Handle download confirmation from modal
  const handleDownloadConfirm = async (downloadOptions) => {
    const { format, rows, count } = downloadOptions;

    try {
      setIsLoading(true);
      toast.info(`Generating ${format.toUpperCase()} report for ${count} records...`);

      let dataToDownload = [];

      // Fetch data based on selected option
      if (rows === "current") {
        // Use current page data (processedData)
        dataToDownload = processedData;
        
        // Additional safety check - ensure we don't exceed expected count
        if (dataToDownload.length !== count) {
          // Update the toast message to reflect actual count
          toast.info(`Generating ${format.toUpperCase()} report for ${dataToDownload.length} records (current page)...`);
        }
      } else {
        // For "all" option, fetch all data from API
        const params = new URLSearchParams({
          level: selectedGrouping,
          page: 1,
          sortBy: "totalStudents"
        });

        // For all records, use mode=download instead of large pageSize
        if (count === pagination.totalItems) {
          params.append("mode", "download");
        } else {
          params.append("pageSize", Math.min(count, 100).toString()); // Cap pageSize at 100
        }

        // Important: Include the same filters as current view using smart parameter detection
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          const searchLower = debouncedSearchQuery.toLowerCase().trim();
          
          // Check if search matches any block (case-insensitive, partial match)
          const matchingBlock = blocks.find(block => 
            block.toLowerCase().includes(searchLower)
          );
          
          // Check if search matches any cluster (case-insensitive, partial match) 
          const matchingCluster = clusters.find(cluster => 
            cluster.toLowerCase().includes(searchLower)
          );
          
          // Use specific parameter based on what was found
          if (matchingBlock) {
            params.append("block", matchingBlock);
          } else if (matchingCluster) {
            params.append("cluster", matchingCluster);
          } else {
            params.append("query", debouncedSearchQuery);
          }
        }
        
        // Add dropdown-selected filters
        if (selectedBlock) params.append("block", selectedBlock);
        if (selectedCluster) params.append("cluster", selectedCluster);

        const response = await apiInstance.get(`/report/enrollment?${params.toString()}`);
        
        if (response.data.success) {
          const responseData = response.data.data;
          const { enrollmentData } = responseData;
          
          // Additional safety check for API response
          let apiData = enrollmentData || [];
          
          // Only slice if we're not downloading all records and got more than expected
          if (count !== pagination.totalItems && apiData.length > count) {
            apiData = apiData.slice(0, count);
          }
          
          // Process the data the same way as processedData
          dataToDownload = apiData.map(item => {
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

  // Helper function to format class group label
  const getClassGroupLabel = () => {
    switch (selectedClassGroup) {
      case "primary": return "Classes 1-8";
      case "secondary": return "Classes 9-12";
      default: return "Classes 1-12";
    }
  };

  // Helper function to format grouping label
  const getGroupingLabel = () => {
    switch (selectedGrouping) {
      case "block": return "Block Level";
      case "cluster": return "Cluster Level";
      default: return "School Level";
    }
  };

  // Download report as PDF
  const handleDownloadPDF = (data) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    // Calculate statistics for the report
    const totalRecords = data.length;
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate column headers based on current settings
    const getColumns = () => {
      let cols = [
        { key: "block", label: "Block" }
      ];
      
      if (selectedGrouping !== "block") {
        cols.push({ key: "cluster", label: "Cluster" });
      }
      
      if (selectedGrouping === "school") {
        cols.push(
          { key: "schoolName", label: "School Name" },
          { key: "udiseCode", label: "UDISE Code" }
        );
      }
      
      cols.push({ key: "totalStudents", label: "Total Students" });
      
      // Add class columns based on class group
      if (selectedClassGroup === "all" || selectedClassGroup === "primary") {
        for (let i = 1; i <= 8; i++) {
          cols.push({ key: `class${i}`, label: `Class ${i}` });
        }
      }
      
      if (selectedClassGroup === "all" || selectedClassGroup === "secondary") {
        for (let i = 9; i <= 12; i++) {
          cols.push({ key: `class${i}`, label: `Class ${i}` });
        }
      }
      
      return cols;
    };

    const columnHeaders = getColumns();

    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Enrollment Report</title>
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
          
          th.text-left {
            text-align: left;
            padding-left: 10px;
          }
          
          td {
            padding: 6px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
          }
          
          td.text-left {
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
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Student Enrollment Analytics</h1>
            <div class="subtitle">Academic Year ${metadata.academicYear || new Date().getFullYear()}</div>
            <div class="date">Generated on: ${currentDate}</div>
            ${metadata.lastUpdatedOn ? `<div class="date">Last Updated: ${new Date(metadata.lastUpdatedOn).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Kolkata'
            })}</div>` : ''}
          </div>
          
          <div class="filter-info">
            <h3>Report Configuration:</h3>
            <div class="filter-item"><strong>Grouping Level:</strong> ${getGroupingLabel()}</div>
            <div class="filter-item"><strong>Class Group:</strong> ${getClassGroupLabel()}</div>
            ${selectedBlock ? `<div class="filter-item"><strong>Block:</strong> ${selectedBlock}</div>` : ""}
            ${selectedCluster ? `<div class="filter-item"><strong>Cluster:</strong> ${selectedCluster}</div>` : ""}
          </div>
          
          <table>
            <thead>
              <tr>
                ${columnHeaders.map(col => 
                  `<th class="${col.key === 'schoolName' ? 'text-left' : ''}">${col.label}</th>`
                ).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.map(record => `
                <tr>
                  ${columnHeaders.map(col => {
                    const value = record[col.key];
                    const displayValue = value !== undefined && value !== null ? value : "-";
                    return `<td class="${col.key === 'schoolName' ? 'text-left' : ''}">${displayValue}</td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Report Summary</h3>
            <div class="summary-item"><strong>Total Records:</strong> ${totalRecords}</div>
            <div class="summary-item"><strong>Grouping Level:</strong> ${getGroupingLabel()}</div>
            <div class="summary-item"><strong>Class Group:</strong> ${getClassGroupLabel()}</div>
            <div class="summary-item"><strong>Report Type:</strong> Student Enrollment Analytics</div>
            ${metadata.lastUpdatedOn ? `<div class="summary-item"><strong>Last Updated:</strong> ${new Date(metadata.lastUpdatedOn).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Kolkata'
            })}</div>` : ''}
          </div>
          
          <div class="footer">
            <p>This report is generated automatically from the Student Enrollment System</p>
            <p>© ${metadata.academicYear || new Date().getFullYear()} Academic Performance Tracking System</p>
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
        toast.success(`PDF report ready with ${data.length} records`);
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

    // Generate column headers based on current settings
    const getColumns = () => {
      let cols = [
        { key: "block", label: "Block" }
      ];
      
      if (selectedGrouping !== "block") {
        cols.push({ key: "cluster", label: "Cluster" });
      }
      
      if (selectedGrouping === "school") {
        cols.push(
          { key: "schoolName", label: "School Name" },
          { key: "udiseCode", label: "UDISE Code" }
        );
      }
      
      cols.push({ key: "totalStudents", label: "Total Students" });
      
      // Add class columns based on class group
      if (selectedClassGroup === "all" || selectedClassGroup === "primary") {
        for (let i = 1; i <= 8; i++) {
          cols.push({ key: `class${i}`, label: `Class ${i}` });
        }
      }
      
      if (selectedClassGroup === "all" || selectedClassGroup === "secondary") {
        for (let i = 9; i <= 12; i++) {
          cols.push({ key: `class${i}`, label: `Class ${i}` });
        }
      }
      
      return cols;
    };

    const columnHeaders = getColumns();

    // Build CSV content with comprehensive information
    let csvContent = "";

    // Header Information
    csvContent += `"Student Enrollment Analytics"\n`;
    csvContent += `"Academic Year ${metadata.academicYear || new Date().getFullYear()}"\n`;
    csvContent += `"Generated on: ${currentDate}"\n`;
    if (metadata.lastUpdatedOn) {
      csvContent += `"Last Updated: ${new Date(metadata.lastUpdatedOn).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}"\n`;
    }
    csvContent += "\n"; // Blank line

    // Filter Information
    csvContent += `"Report Configuration:"\n`;
    csvContent += `"Grouping Level: ${getGroupingLabel()}"\n`;
    csvContent += `"Class Group: ${getClassGroupLabel()}"\n`;
    if (selectedBlock) {
      csvContent += `"Block: ${selectedBlock}"\n`;
    }
    if (selectedCluster) {
      csvContent += `"Cluster: ${selectedCluster}"\n`;
    }
    csvContent += "\n"; // Blank line

    // Table Headers
    const headers = columnHeaders.map(col => col.label);
    csvContent += headers.join(",") + "\n";

    // Table Data
    data.forEach((record) => {
      const rowData = columnHeaders.map(col => {
        const value = record[col.key];
        let displayValue = value !== undefined && value !== null ? value.toString() : "-";
        
        // Quote values that contain commas
        if (displayValue.includes(",")) {
          displayValue = `"${displayValue}"`;
        }
        
        return displayValue;
      });

      csvContent += rowData.join(",") + "\n";
    });

    // Report Summary at the bottom
    csvContent += "\n"; // Blank line
    csvContent += `"Report Summary:"\n`;
    csvContent += `"Total Records: ${data.length}"\n`;
    csvContent += `"Grouping Level: ${getGroupingLabel()}"\n`;
    csvContent += `"Class Group: ${getClassGroupLabel()}"\n`;
    csvContent += `"Report Type: Student Enrollment Analytics"\n`;

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Enrollment_Report_${selectedGrouping}_${selectedClassGroup}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`CSV report downloaded with ${data.length} records`);
    }, 100);
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
                  {metadata.lastUpdatedOn && (
                    <span className="ml-2">
                      | Last Updated: {new Date(metadata.lastUpdatedOn).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  )}
                </p>
              )}
            </div>
            {/* {processedData.length > 0 && (
              <div className="text-right">
                <p className="text-sm font-semibold text-[#2F4F4F]">
                  Total Records: {pagination.totalItems || processedData.length}
                </p>
                <p className="text-xs text-gray-500">
                  Showing {processedData.length} of {pagination.totalItems || processedData.length}
                </p>
              </div>
            )} */}
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
                      placeholder={getSearchPlaceholder()}
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
                        Level
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
                        onChange={(e) => {
                          const newBlockValue = e.target.value;
                          setSelectedBlock(newBlockValue);
                          setSelectedCluster(""); // Reset cluster when block changes
                          
                          // Update clusters based on selected block
                          if (newBlockValue === "") {
                            // If "All Blocks" is selected, show all clusters
                            const allClusterNames = blockClusterData.flatMap((block) =>
                              block.clusters.map((cluster) => cluster.name)
                            );
                            const uniqueClusters = [...new Set(allClusterNames)].filter(Boolean).sort();
                            setClusters(uniqueClusters);
                          } else {
                            // Otherwise, filter clusters by selected block
                            const selectedBlockData = blockClusterData.find(
                              (block) => block.blockName === newBlockValue
                            );
                            const blockClusters = selectedBlockData 
                              ? selectedBlockData.clusters.map((cluster) => cluster.name).filter(Boolean).sort()
                              : [];
                            setClusters(blockClusters);
                          }
                        }}
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
                            {block}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Only show Cluster dropdown when level is not "block" */}
                    {selectedGrouping !== "block" && (
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
                              {cluster}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

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
                      onClick={handleDownloadClick}
                      text="Download Report"
                      disabled={isLoading || processedData.length === 0}
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
            }}
            className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
          >
            <MUIDataTable data={processedData} columns={columns} options={options} />
          </div>

          {/* Updated Pagination with Rows Per Page - Same layout as SchoolList */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // This spreads items to the edges
              width: "100%",
              margin: "20px 0",
              padding: "0 24px",
            }}
          >
            {/* Empty div for left spacing to help with centering */}
            <div style={{ width: "180px" }}></div>

            {/* Centered pagination */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Pagination
                count={pagination.totalPages || 1}
                page={pagination.currentPage}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
                size="medium"
                renderItem={(item) => {
                  const isNextPage = item.type === "page" && item.page === pagination.currentPage + 1;
                  const isCurrentPage = item.type === "page" && item.page === pagination.currentPage;

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
        </div>

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          onConfirm={handleDownloadConfirm}
          currentPageCount={processedData.length}
          totalRecords={pagination.totalItems}
          subject="Data Analysis"
          tableType="report"
          reportName="Enrollment Report"
          reportLevel={selectedGrouping || 'school'}
        />

        {/* Page level loading overlay - only for non-search operations */}
        {isLoading && !isSearchLoading && <SpinnerPageOverlay isLoading={isLoading} />}
      </div>
    </ThemeProvider>
  );
}