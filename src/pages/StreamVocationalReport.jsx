import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDebounce } from "../customHook/useDebounce";
import MUIDataTable from "mui-datatables";
import { Button, TextField, CircularProgress, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography, Chip } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination, PaginationItem } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Download } from "lucide-react";
import "../components/TestListTable.css";
import ButtonCustom from "../components/ButtonCustom";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import DownloadModal from "../components/modal/DownloadModal";
import apiInstance from "../../api";
import mixpanel from '../utils/mixpanel';

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

export default function StreamVocationalReport() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 400);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
    });
    const [selectedBlock, setSelectedBlock] = useState("");
    const [selectedCluster, setSelectedCluster] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedStreamFilter, setSelectedStreamFilter] = useState("all");
    const [blocks, setBlocks] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [metadata, setMetadata] = useState({});

    // Ref to prevent double API calls
    const hasFetchedOnMount = useRef(false);

    // Class options - only 11 and 12
    const classOptions = [
        { value: "all", label: "All Classes (11-12)" },
        { value: "11", label: "Class 11" },
        { value: "12", label: "Class 12" }
    ];

    // Stream filter options
    const streamFilterOptions = [
        { value: "all", label: "All Students" },
        { value: "with_stream", label: "With Stream" },
        { value: "without_stream", label: "Without Stream" }
    ];

    // Dummy data for testing
    const dummyData = [
        {
            studentName: "Rajesh Kumar",
            udiseCode: "27250100101",
            schoolName: "Government Senior Secondary School, Panvel",
            block: "Panvel",
            cluster: "Panvel Urban",
            class: "11",
            stream: "Science",
            vocationalSubject: ["Information Technology", "Web Design"]
        },
        {
            studentName: "Priya Sharma",
            udiseCode: "27250100102",
            schoolName: "Zilla Parishad High School, Kharghar",
            block: "Panvel",
            cluster: "Kharghar",
            class: "12",
            stream: "Commerce",
            vocationalSubject: ["Banking & Finance"]
        },
        {
            studentName: "Amit Patel",
            udiseCode: "27250200201",
            schoolName: "District High School, Uran",
            block: "Uran",
            cluster: "Uran Central",
            class: "11",
            stream: null, // No stream assigned
            vocationalSubject: ["Retail Management", "Marketing"]
        },
        {
            studentName: "Sneha Desai",
            udiseCode: "27250200202",
            schoolName: "Government Secondary School, Karjat",
            block: "Karjat",
            cluster: "Karjat East",
            class: "12",
            stream: "Arts",
            vocationalSubject: null // No vocational subject
        },
        {
            studentName: "Vikram Singh",
            udiseCode: "27250300301",
            schoolName: "Municipal High School, Alibag",
            block: "Alibag",
            cluster: "Alibag North",
            class: "11",
            stream: null, // No stream assigned
            vocationalSubject: null // No vocational subject
        }
    ];

    // Fetch stream and vocational data from API
    const fetchStreamData = useCallback(async () => {
        // Only show search loading if there's actual search query text
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
            setIsSearchLoading(true);
        } else {
            setIsLoading(true);
        }

        try {
            const params = new URLSearchParams({
                page: pagination.currentPage.toString(),
                pageSize: pagination.pageSize.toString(),
            });

            // Add filters
            if (selectedBlock) params.append("block", selectedBlock);
            if (selectedCluster) params.append("cluster", selectedCluster);
            if (selectedClass && selectedClass !== "all") params.append("class", selectedClass);
            if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
                params.append("query", debouncedSearchQuery.trim());
            }

            // TODO: Replace with actual API endpoint when backend is ready
            try {
                const response = await apiInstance.get(`/report/stream-vocational?${params.toString()}`);

                if (response.data.success) {
                    const responseData = response.data.data;
                    const { students, reportType, academicYear, pagination: responsePagination, lastUpdatedOn } = responseData;
                    const responseMetadata = responseData.metadata;

                    setData(students || []);
                    setMetadata({
                        ...(responseMetadata || {}),
                        reportType,
                        academicYear,
                        lastUpdatedOn
                    });

                    setPagination(prev => ({
                        ...prev,
                        totalItems: responsePagination?.totalItems || responseMetadata?.totalRecords || (students || []).length,
                        totalPages: responsePagination?.totalPages || responseMetadata?.totalPages || Math.ceil((responseMetadata?.totalRecords || (students || []).length) / prev.pageSize),
                    }));
                } else {
                    toast.error(response.data.message || "Failed to fetch stream data");
                    setData([]);
                    setMetadata({});
                }
            } catch (apiError) {
                // If API is not available, use dummy data for testing
                console.warn("API not available, using dummy data for testing:", apiError);

                // Apply filters to dummy data
                let filteredData = [...dummyData];

                if (selectedBlock) {
                    filteredData = filteredData.filter(s => s.block === selectedBlock);
                }
                if (selectedCluster) {
                    filteredData = filteredData.filter(s => s.cluster === selectedCluster);
                }
                if (selectedClass && selectedClass !== "all") {
                    filteredData = filteredData.filter(s => s.class === selectedClass);
                }
                if (selectedStreamFilter === "with_stream") {
                    filteredData = filteredData.filter(s => s.stream && s.stream !== "-" && s.stream.toLowerCase() !== "not assigned");
                } else if (selectedStreamFilter === "without_stream") {
                    filteredData = filteredData.filter(s => !s.stream || s.stream === "-" || s.stream.toLowerCase() === "not assigned");
                }
                if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
                    const query = debouncedSearchQuery.toLowerCase();
                    filteredData = filteredData.filter(s =>
                        s.studentName.toLowerCase().includes(query) ||
                        s.udiseCode.includes(query) ||
                        s.schoolName.toLowerCase().includes(query)
                    );
                }

                setData(filteredData);
                setMetadata({
                    reportType: "Stream & Vocational Tracking",
                    academicYear: "2024-25",
                    lastUpdatedOn: new Date().toISOString(),
                    totalRecords: filteredData.length
                });

                setPagination(prev => ({
                    ...prev,
                    totalItems: filteredData.length,
                    totalPages: Math.ceil(filteredData.length / prev.pageSize),
                }));

                toast.info("Using sample data for testing. Connect to backend for live data.");
            }
        } catch (error) {
            console.error("Error fetching stream data:", error);
            toast.error("Failed to fetch stream data. Please try again.");
            setData([]);
            setMetadata({});
        } finally {
            setIsLoading(false);
            setIsSearchLoading(false);
        }
    }, [debouncedSearchQuery, pagination.currentPage, pagination.pageSize, selectedBlock, selectedCluster, selectedClass, selectedStreamFilter]);

    // Fetch blocks and clusters for filter dropdowns
    const fetchGlobalBlocksAndClusters = async () => {
        try {
            const response = await apiInstance.get("/user/dropdown-data");
            if (response.data && response.data.success) {
                const blocksData = response.data.data;

                const uniqueBlocks = blocksData.map((block) => block.blockName).filter(Boolean).sort();
                setBlocks(uniqueBlocks);

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

    // Mount effect - load dropdowns and track analytics
    useEffect(() => {
        if (!hasFetchedOnMount.current) {
            hasFetchedOnMount.current = true;
            fetchGlobalBlocksAndClusters();

            // Track page view
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            mixpanel.track('Stream Vocational Report Viewed', {
                userId: userData.id,
                userName: userData.name,
                userRole: userData.role,
                timestamp: new Date().toISOString(),
            });
        }
    }, []);

    // Fetch data when filters, search, or pagination changes
    useEffect(() => {
        if (hasFetchedOnMount.current) {
            fetchStreamData();
        }
    }, [fetchStreamData]);

    // Reset to page 1 when filters or search changes (but not pagination itself)
    useEffect(() => {
        // Only reset the page if we're not already on page 1
        if (pagination.currentPage !== 1) {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, selectedBlock, selectedCluster, selectedClass, selectedStreamFilter]);

    // Column definitions for the table
    const columns = [
        {
            name: "studentName",
            label: "Student Name",
            options: {
                customBodyRender: (value) => (
                    <div style={{ fontWeight: 500, color: "#2F4F4F" }}>{value || "-"}</div>
                ),
            },
        },
        {
            name: "udiseCode",
            label: "UDISE Code",
            options: {
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "schoolName",
            label: "School Name",
            options: {
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "block",
            label: "Block",
            options: {
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "cluster",
            label: "Cluster",
            options: {
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "class",
            label: "Class",
            options: {
                customBodyRender: (value) => value || "-",
            },
        },
        {
            name: "stream",
            label: "Stream",
            options: {
                customBodyRender: (value) => {
                    if (!value || value === "-" || value.toLowerCase() === "not assigned") {
                        return (
                            <Chip
                                label="Not Assigned"
                                size="small"
                                sx={{
                                    bgcolor: "#ffebee",
                                    color: "#c62828",
                                    fontWeight: 500
                                }}
                            />
                        );
                    }
                    return (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                bgcolor: "#e8f5e9",
                                color: "#2e7d32",
                                fontWeight: 500
                            }}
                        />
                    );
                },
            },
        },
        {
            name: "vocationalSubject",
            label: "Vocational Subject",
            options: {
                customBodyRender: (value) => {
                    if (!value || (Array.isArray(value) && value.length === 0) || value === "-" || (typeof value === 'string' && value.toLowerCase() === "not assigned")) {
                        return (
                            <Chip
                                label="Not Assigned"
                                size="small"
                                sx={{
                                    bgcolor: "#fff3e0",
                                    color: "#e65100",
                                    fontWeight: 500
                                }}
                            />
                        );
                    }

                    // Handle array of vocational subjects
                    if (Array.isArray(value)) {
                        return (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {value.map((subject, index) => (
                                    <Chip
                                        key={index}
                                        label={subject}
                                        size="small"
                                        sx={{
                                            bgcolor: "#e3f2fd",
                                            color: "#1565c0",
                                            fontWeight: 500,
                                            fontSize: "11px"
                                        }}
                                    />
                                ))}
                            </div>
                        );
                    }

                    // Handle single vocational subject string
                    return (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                bgcolor: "#e3f2fd",
                                color: "#1565c0",
                                fontWeight: 500
                            }}
                        />
                    );
                },
            },
        },
    ];

    const options = {
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        selectableRows: "none",
        responsive: "standard",
        pagination: false,
        elevation: 0,
        rowsPerPage: pagination.pageSize,
        textLabels: {
            body: {
                noMatch: isSearchLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <CircularProgress style={{ color: "#2F4F4F" }} />
                        <Typography variant="body2" style={{ marginTop: "10px", color: "#666" }}>
                            Searching...
                        </Typography>
                    </div>
                ) : (
                    "No students found matching your criteria"
                ),
            },
        },
        customTableBodyFooterRender: () => null,
        setRowProps: (row, dataIndex) => {
            // Highlight rows where student doesn't have a stream
            const student = data[dataIndex];
            const hasNoStream = !student?.stream || student.stream === "-" || student.stream.toLowerCase() === "not assigned";

            return {
                style: {
                    backgroundColor: hasNoStream ? "#fff3e0" : "inherit", // Light orange background for no stream
                    borderLeft: hasNoStream ? "4px solid #ff9800" : "none", // Orange left border
                },
            };
        },
    };

    const handlePageChange = (event, value) => {
        setPagination((prev) => ({ ...prev, currentPage: value }));
    };

    const handleClearFilters = () => {
        setSelectedBlock("");
        setSelectedCluster("");
        setSelectedClass("all");
        setSelectedStreamFilter("all");
        setSearchQuery("");
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
    };

    const handleDownload = async ({ format, rows, count }) => {
        setIsLoading(true);
        try {
            let dataToDownload = data;

            if (rows !== "current") {
                const params = new URLSearchParams({
                    page: "1",
                    pageSize: count.toString(),
                });

                if (selectedBlock) params.append("block", selectedBlock);
                if (selectedCluster) params.append("cluster", selectedCluster);
                if (selectedClass && selectedClass !== "all") params.append("class", selectedClass);
                if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
                    params.append("query", debouncedSearchQuery.trim());
                }

                const response = await apiInstance.get(`/report/stream-vocational?${params.toString()}`);

                if (response.data.success) {
                    const responseData = response.data.data;
                    const { students } = responseData;
                    dataToDownload = students || [];

                    if (count !== pagination.totalItems && dataToDownload.length > count) {
                        dataToDownload = dataToDownload.slice(0, count);
                    }
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

    const handleDownloadCSV = (downloadData) => {
        const headers = [
            "Student Name",
            "UDISE Code",
            "School Name",
            "Block",
            "Cluster",
            "Class",
            "Stream",
            "Vocational Subject"
        ];

        const csvContent = [
            headers.join(","),
            ...downloadData.map((row) =>
                [
                    `"${row.studentName || "-"}"`,
                    `"${row.udiseCode || "-"}"`,
                    `"${row.schoolName || "-"}"`,
                    `"${row.block || "-"}"`,
                    `"${row.cluster || "-"}"`,
                    `"${row.class || "-"}"`,
                    `"${row.stream || "Not Assigned"}"`,
                    `"${Array.isArray(row.vocationalSubject) ? row.vocationalSubject.join(', ') : (row.vocationalSubject || "Not Assigned")}"`
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `stream_vocational_report_${new Date().getTime()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV downloaded successfully!");
    };

    const handleDownloadPDF = (downloadData) => {
        const printWindow = window.open("", "_blank");

        const totalRecords = downloadData.length;
        const currentDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        const studentsWithStream = downloadData.filter(s => s.stream && s.stream !== "-" && s.stream.toLowerCase() !== "not assigned").length;
        const studentsWithVocational = downloadData.filter(s => {
            if (Array.isArray(s.vocationalSubject)) {
                return s.vocationalSubject.length > 0;
            }
            return s.vocationalSubject && s.vocationalSubject !== "-" && s.vocationalSubject.toLowerCase() !== "not assigned";
        }).length;
        const studentsWithoutStream = totalRecords - studentsWithStream;
        const studentsWithoutVocational = totalRecords - studentsWithVocational;

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stream & Vocational Report</title>
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
            line-height: 1.6;
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
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            border: 1px solid #2F4F4F;
          }
          
          td {
            padding: 6px;
            border: 1px solid #ddd;
            text-align: left;
            font-size: 10px;
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
          
          .chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 500;
          }
          
          .chip-assigned {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          
          .chip-not-assigned {
            background-color: #ffebee;
            color: #c62828;
          }
          
          .chip-vocational {
            background-color: #e3f2fd;
            color: #1565c0;
          }
          
          .chip-vocational-na {
            background-color: #fff3e0;
            color: #e65100;
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
            <h1>Stream & Vocational Report</h1>
            <p class="subtitle">Academic Year: ${metadata.academicYear || "2024-25"}</p>
            <p class="date">Generated on: ${currentDate}</p>
          </div>
          
          <div class="filter-info">
            <h3>Applied Filters</h3>
            <div class="filter-item"><strong>Block:</strong> ${selectedBlock || "All"}</div>
            <div class="filter-item"><strong>Cluster:</strong> ${selectedCluster || "All"}</div>
            <div class="filter-item"><strong>Class:</strong> ${selectedClass === "all" ? "All (11-12)" : "Class " + selectedClass}</div>
            ${searchQuery ? `<div class="filter-item"><strong>Search:</strong> ${searchQuery}</div>` : ""}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>UDISE Code</th>
                <th>School Name</th>
                <th>Block</th>
                <th>Cluster</th>
                <th>Class</th>
                <th>Stream</th>
                <th>Vocational Subject</th>
              </tr>
            </thead>
            <tbody>
              ${downloadData
                .map(
                    (row) => `
                <tr>
                  <td>${row.studentName || "-"}</td>
                  <td>${row.udiseCode || "-"}</td>
                  <td>${row.schoolName || "-"}</td>
                  <td>${row.block || "-"}</td>
                  <td>${row.cluster || "-"}</td>
                  <td>${row.class || "-"}</td>
                  <td>
                    ${row.stream && row.stream !== "-" && row.stream.toLowerCase() !== "not assigned"
                            ? `<span class="chip chip-assigned">${row.stream}</span>`
                            : `<span class="chip chip-not-assigned">Not Assigned</span>`
                        }
                  </td>
                  <td>
                    ${Array.isArray(row.vocationalSubject) && row.vocationalSubject.length > 0
                            ? row.vocationalSubject.map(subj => `<span class="chip chip-vocational">${subj}</span>`).join(' ')
                            : (row.vocationalSubject && row.vocationalSubject !== "-" && row.vocationalSubject.toLowerCase() !== "not assigned"
                                ? `<span class="chip chip-vocational">${row.vocationalSubject}</span>`
                                : `<span class="chip chip-vocational-na">Not Assigned</span>`
                            )
                        }
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Report Summary</h3>
            <div class="summary-item"><strong>Total Students:</strong> ${totalRecords}</div>
            <div class="summary-item"><strong>Students with Stream:</strong> ${studentsWithStream}</div>
            <div class="summary-item"><strong>Students without Stream:</strong> ${studentsWithoutStream}</div>
            <div class="summary-item"><strong>Students with Vocational Subject:</strong> ${studentsWithVocational}</div>
            <div class="summary-item"><strong>Students without Vocational Subject:</strong> ${studentsWithoutVocational}</div>
          </div>
          
          <div class="footer">
            <p>© 2024-25 PDLD Dashboard - Stream & Vocational Tracking Report</p>
            <p>This report is generated electronically and contains confidential information.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            toast.success("PDF download initiated!");
        }, 250);
    };

    return (
        <ThemeProvider theme={theme}>
            <div style={{ padding: "20px", backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
                <ToastContainer position="top-right" autoClose={3000} />
                {isLoading && !isSearchLoading && <SpinnerPageOverlay />}

                {/* Header - Compact */}
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <Typography
                            variant="h5"
                            style={{
                                fontFamily: "'Philosopher', sans-serif",
                                fontWeight: 700,
                                color: "#2F4F4F",
                            }}
                        >
                            Stream & Vocational Report
                        </Typography>
                        {/* Metadata - Inline with title */}
                        {metadata && (
                            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                                {metadata.academicYear && (
                                    <Typography variant="caption" style={{ color: "#666" }}>
                                        <strong>Academic Year:</strong> {metadata.academicYear}
                                    </Typography>
                                )}
                                {/* {metadata.lastUpdatedOn && (
                                    <Typography variant="caption" style={{ color: "#666" }}>
                                        <strong>Last Updated:</strong> {new Date(metadata.lastUpdatedOn).toLocaleDateString()}
                                    </Typography>
                                )} */}
                            </div>
                        )}
                    </div>
                    <Typography variant="body2" style={{ color: "#666", fontSize: "13px" }}>
                        Track stream allocation and vocational subjects for students in Classes 11 & 12
                    </Typography>
                </div>

                {/* Filters Section */}
                <div
                    style={{
                        backgroundColor: "white",
                        padding: "16px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Search Box - First Row - Full width */}
                    {/* <div style={{ marginBottom: "16px" }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by name or UDISE"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: isSearchLoading ? (
                                    <CircularProgress size={20} style={{ marginRight: 8, color: "#2F4F4F" }} />
                                ) : (
                                    <Search size={20} style={{ marginRight: 8, color: "#666" }} />
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '40px',
                                }
                            }}
                        />
                    </div> */}

                    {/* Filters and Actions Row */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <FormControl size="small" sx={{ minWidth: 300, flexGrow: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by student name, UDISE code"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: isSearchLoading ? (
                                        <CircularProgress size={20} style={{ marginRight: 8, color: "#2F4F4F" }} />
                                    ) : (
                                        <Search size={20} style={{ marginRight: 8, color: "#666" }} />
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '40px',
                                    }
                                }}
                            />
                        </FormControl>
                        {/* Block Filter */}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Block</InputLabel>
                            <Select
                                value={selectedBlock}
                                label="Block"
                                onChange={(e) => setSelectedBlock(e.target.value)}
                            >
                                <MenuItem value="">All Blocks</MenuItem>
                                {blocks.map((block) => (
                                    <MenuItem key={block} value={block}>
                                        {block}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Cluster Filter */}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Cluster</InputLabel>
                            <Select
                                value={selectedCluster}
                                label="Cluster"
                                onChange={(e) => setSelectedCluster(e.target.value)}
                            >
                                <MenuItem value="">All Clusters</MenuItem>
                                {clusters.map((cluster) => (
                                    <MenuItem key={cluster} value={cluster}>
                                        {cluster}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Class Filter */}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Class</InputLabel>
                            <Select
                                value={selectedClass}
                                label="Class"
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Stream Filter */}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Stream Status</InputLabel>
                            <Select
                                value={selectedStreamFilter}
                                label="Stream Status"
                                onChange={(e) => setSelectedStreamFilter(e.target.value)}
                            >
                                {streamFilterOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Clear Filters Button */}
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleClearFilters}
                            style={{
                                color: "#2F4F4F",
                                borderColor: "#2F4F4F",
                                textTransform: "none",
                                height: "40px",
                                minWidth: "110px",
                            }}
                        >
                            Clear Filters
                        </Button>

                        {/* Spacer to push Download button to the right */}
                        <div style={{ flexGrow: 1 }} />

                        {/* Download Button - Right aligned */}
                        <Button
                            variant="contained"
                            onClick={() => setDownloadModalOpen(true)}
                            disabled={!data || data.length === 0}
                            startIcon={<Download size={18} />}
                            sx={{
                                backgroundColor: "#FFD700",
                                color: "white",
                                textTransform: "none",
                                height: "40px",
                                minWidth: "170px",
                                fontSize: "14px",
                                fontWeight: 500,
                                "&:hover": {
                                    backgroundColor: "#FFD700",
                                },
                                "&:disabled": {
                                    backgroundColor: "#ccc",
                                    color: "#666",
                                },
                            }}
                        >
                            Download Report
                        </Button>
                    </div>

                    {/* Legend - Compact */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "12px",
                        padding: "6px 12px",
                        backgroundColor: "#fff9f0",
                        borderRadius: "4px",
                        fontSize: "11px"
                    }}>
                        <Typography variant="caption" style={{ fontWeight: 600, color: "#2F4F4F", fontSize: "11px" }}>
                            Note: Students without stream (highlighted rows)
                        </Typography>
                    </div>
                </div>                {/* Summary Card - Single Compact Card */}
                {data && data.length > 0 && (
                    <div style={{
                        backgroundColor: "white",
                        padding: "16px 20px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        border: "1px solid #e0e0e0"
                    }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "20px",
                            alignItems: "center"
                        }}>
                            {/* Total Students */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: "#E8F4F8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    <Typography style={{ fontSize: "18px" }}>👥</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" style={{ color: "#666", fontSize: "12px", display: "block" }}>
                                        Total Students
                                    </Typography>
                                    <Typography variant="h6" style={{ color: "#2F4F4F", fontWeight: 700, fontSize: "22px", lineHeight: 1.2 }}>
                                        {pagination.totalItems}
                                    </Typography>
                                </div>
                            </div>

                            {/* With Stream */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: "#E8F5E9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    <Typography style={{ fontSize: "18px" }}>✅</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" style={{ color: "#666", fontSize: "12px", display: "block" }}>
                                        With Stream
                                    </Typography>
                                    <Typography variant="h6" style={{ color: "#2e7d32", fontWeight: 700, fontSize: "22px", lineHeight: 1.2 }}>
                                        {data.filter(s => s.stream && s.stream !== "-" && s.stream.toLowerCase() !== "not assigned").length}
                                    </Typography>
                                </div>
                            </div>

                            {/* Without Stream */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: "#FFEBEE",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    <Typography style={{ fontSize: "18px" }}>⚠️</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" style={{ color: "#666", fontSize: "12px", display: "block" }}>
                                        Without Stream
                                    </Typography>
                                    <Typography variant="h6" style={{ color: "#c62828", fontWeight: 700, fontSize: "22px", lineHeight: 1.2 }}>
                                        {data.filter(s => !s.stream || s.stream === "-" || s.stream.toLowerCase() === "not assigned").length}
                                    </Typography>
                                </div>
                            </div>

                            {/* With Vocational Subject */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: "#E3F2FD",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    <Typography style={{ fontSize: "18px" }}>🎓</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" style={{ color: "#666", fontSize: "12px", display: "block" }}>
                                        With Vocational Subject
                                    </Typography>
                                    <Typography variant="h6" style={{ color: "#1565c0", fontWeight: 700, fontSize: "22px", lineHeight: 1.2 }}>
                                        {data.filter(s => {
                                            if (Array.isArray(s.vocationalSubject)) {
                                                return s.vocationalSubject.length > 0;
                                            }
                                            return s.vocationalSubject && s.vocationalSubject !== "-" && s.vocationalSubject.toLowerCase() !== "not assigned";
                                        }).length}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <MUIDataTable data={data} columns={columns} options={options} />

                    {/* Pagination with Rows Per Page */}
                    {pagination.totalPages > 0 && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "20px 24px",
                                borderTop: "1px solid #e0e0e0",
                            }}
                        >
                            {/* Empty div for left spacing to help with centering */}
                            <div style={{ width: "180px" }}></div>

                            {/* Centered pagination */}
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={pagination.currentPage}
                                    onChange={handlePageChange}
                                    showFirstButton
                                    showLastButton
                                    shape="circular"
                                    renderItem={(item) => {
                                        const isNextPage = item.page === pagination.currentPage + 1 && item.type === "page";

                                        return (
                                            <PaginationItem
                                                {...item}
                                                sx={{
                                                    "&.Mui-selected": {
                                                        backgroundColor: "#2F4F4F",
                                                        color: "white",
                                                        "&:hover": {
                                                            backgroundColor: "#1e3333",
                                                        },
                                                    },
                                                    ...(isNextPage && {
                                                        border: "1px solid #2F4F4F",
                                                        color: "#2F4F4F",
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
                                    value={pagination.pageSize}
                                    onChange={(e) => {
                                        setPagination((prev) => ({
                                            ...prev,
                                            pageSize: e.target.value,
                                            currentPage: 1, // Reset to first page when changing page size
                                        }));
                                    }}
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
                    )}
                </div>

                {/* Download Modal */}
                <DownloadModal
                    isOpen={downloadModalOpen}
                    onClose={() => setDownloadModalOpen(false)}
                    onConfirm={handleDownload}
                    currentPageCount={data.length}
                    totalRecords={pagination.totalItems}
                    tableType="stream-vocational"
                    reportName="Stream & Vocational Report"
                />
            </div>
        </ThemeProvider>
    );
}
