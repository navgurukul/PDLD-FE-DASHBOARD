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
  const [error, setError] = useState(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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

  const [maxScore, setMaxScore] = useState(null);
  const [requiredMarksToPass, setRequiredMarksToPass] = useState(null);

  const fetchData = async (page = 1, size = pageSize) => {
    setLoading(true);
    try {
      const response = await apiInstance.get(`/schools/results/submitted/${currentTestId}`, {
        params: {
          page: page,
          pageSize: size
        }
      });
      if (response.data && response.data.success) {
        const { 
          schools: apiSchools, 
          totalSubmittedSchools, 
          totalpendingSchools,
          totalEligibleSchools,
          pagination, 
          maxScore 
        } = response.data.data;

        // Get requiredMarksToPass from first school (assuming all same)
        const requiredMarks = apiSchools.length > 0 ? apiSchools[0].requiredMarksToPass : null;
        setMaxScore(maxScore);
        setRequiredMarksToPass(requiredMarks);

        // Transform API data to match the component's expected format
        const formattedSchools = apiSchools.map((school) => ({
          id: school.id,
          name: toTitleCase(school.schoolName),
          schoolName: toTitleCase(school.schoolName),
          blockName: school.blockName,
          clusterName: school.clusterName,
          udiseCode: school.udiseCode,
          passRate: school.successRate, // Map successRate to passRate
          submitted: school.status === "submitted",
          totalStudents: school.totalStudents,
          totalStudentsInClass: school.totalStudentsInClass, // For pending schools
          presentStudents: school.presentStudents,
          absentStudents: school.absentStudents,
          averageScore: school.averageScore,
        }));

        setSchools(formattedSchools);
        setSchoolsSubmitted(totalSubmittedSchools);
        setPendingSchools(totalpendingSchools);
        setTotalSchools(totalEligibleSchools || (totalSubmittedSchools + totalpendingSchools));
      } else {
        setError("Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
      setError(error.response?.data?.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentTestId, currentPage, pageSize]);

  // Filter schools based on search query and status
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const schoolName = toTitleCase(school.name || school.schoolName || "").toLowerCase();
      const matchesSearch = schoolName.includes(searchQuery.toLowerCase());
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "submitted" && school.submitted) ||
        (statusFilter === "pending" && !school.submitted);
      return matchesSearch && matchesStatus;
    });
  }, [schools, searchQuery, statusFilter]);

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
        // For "all", you may want to fetch all data from API if paginated.
        dataToDownload = tableData; // For now, use all loaded data
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
      setDownloadModalOpen(false);
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
    
    const headers = [
      "School Name",
      "Status",
      "No. Of Students",
      "Students Present",
      "Student Absent",
      "Average Score",
      "Pass Percentage",
    ];
    csvLines.push(headers.join(","));
    
    data.forEach((row) => {
      csvLines.push([
        toTitleCase(row.name),
        row.status,
        row.totalStudents,
        row.presentStudents,
        row.absentStudents,
        row.averageScore,
        row.passRate,
      ].join(","));
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
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>School Performance Report - ${testNameVal}</title>
      <style>
        @media print {
          @page { size: A4 landscape; margin: 15mm; }
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
        table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
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
          <tr>
            <th style="text-align:left;">School Name</th>
            <th style="text-align:center;">Status</th>
            <th style="text-align:center;">No. Of Students</th>
            <th style="text-align:center;">Students Present</th>
            <th style="text-align:center;">Student Absent</th>
            <th style="text-align:center;">Average Score</th>
            <th style="text-align:center;">Pass Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              <td style="text-align:left">${toTitleCase(row.name)}</td>
              <td style="text-align:center">${row.status}</td>
              <td style="text-align:center">${row.totalStudents}</td>
              <td style="text-align:center">${row.presentStudents}</td>
              <td style="text-align:center">${row.absentStudents}</td>
              <td style="text-align:center">${row.averageScore}</td>
              <td style="text-align:center">${row.passRate}</td>
            </tr>
          `
            )
            .join("")}
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

  // Format table data for MUIDataTable
  const tableData = sortedSchools.map((school) => {
    const isPending = !school.submitted;
    
    return {
      id: school.id,
      name: toTitleCase(school.name || school.schoolName) || "-",
      status: school.submitted ? "Submitted" : "Pending",
      totalStudents: isPending 
        ? (school.totalStudentsInClass != null ? school.totalStudentsInClass : "-")
        : (school.totalStudents === 0 ? "0" : school.totalStudents != null ? school.totalStudents : "-"),
      presentStudents: isPending 
        ? "-"
        : (school.presentStudents === 0 ? "0" : school.presentStudents != null ? school.presentStudents : "-"),
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
  });

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setSortConfig({ key: null, direction: "asc" });
  };
  const isAnyFilterActive = !!searchQuery.trim() || !!statusFilter;

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

  const isRemedialTest = testNameVal?.toLowerCase().includes("remedial");

  // MUI DataTable columns configuration
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false }, // Keep the ID hidden in the table
    },
    {
      name: "name",
      label: "School Name",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
      },
    },
    {
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
    },
    {
      name: "totalStudents",
      label: "No. Of Students",
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
      label: "Student Absent",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellProps: () => ({
          className: "center-align-cell",
        }),
      },
    },
    ...(!isRemedialTest
      ? [
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
        ]
      : []),
    {
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
            </Box>
          </div>
        </div>

        {/* Filters section */}
        {schools.length > 0 && (
          <div className="pb-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              {/* LEFT: Search, Status, Clear */}
              <div className="flex flex-wrap items-center gap-3">
                <TextField
                  variant="outlined"
                  placeholder="Search by School Name"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <div className="pr-2">
                        <Search size={18} className="text-gray-500" />
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
        )}

        {schools.length > 0 && !isRemedialTest && (
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
        {/* Data Table, Border, Pagination: Only when submissions exist */}
        {schools.length > 0 ? (
          <>
            <div className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto">
              <MUIDataTable
                data={tableData}
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
                <Pagination
                  count={Math.ceil(totalSchools / pageSize)}
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
          </>
        ) : (
          // No Data Message (no border, no pagination)
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <img
              src={FolderEmptyImg}
              alt="No Data"
              style={{ width: 80, height: 80, marginBottom: 16, opacity: 0.7 }}
            />
            <p
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 400,
                fontSize: "18px",
                color: "#2F4F4F",
                marginBottom: "16px",
              }}
            >
              No school submissions have been recorded for this test yet.
            </p>
            <Button
              variant="outlined"
              sx={{
                borderRadius: "8px",
                borderColor: "#2F4F4F",
                color: "#2F4F4F",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "18px",
                "&:hover": {
                  borderColor: "#2F4F4F",
                  backgroundColor: "rgba(47, 79, 79, 0.08)",
                },
              }}
              onClick={() => navigate("/allTest")}
            >
              Return to Tests List
            </Button>
          </div>
        )}
      </div>
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onConfirm={handleDownloadConfirm}
        currentPageCount={tableData.length}
        totalRecords={tableData.length} // Or total count if you have it
        subject={"School Performance"}
      />
      {isLoading && !loading && <SpinnerPageOverlay isLoading={isLoading} />}
      <ToastContainer
        style={{ zIndex: 99999999 }}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
      />
    </ThemeProvider>
  );
};

export default SchoolPerformanceTable;
