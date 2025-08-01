import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Pagination,
  PaginationItem,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "../ButtonCustom";
import { useNavigate } from "react-router-dom";
import DownloadModal from "../modal/DownloadModal";
import { Search } from "lucide-react";
import { toast } from "react-toastify";

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
          backgroundColor: "none",
          fontFamily: "Work Sans !important",
          textAlign: "left",
          fontWeight: 400,
          color: "#2F4F4F",
          fontSize: "14px",
          borderBottom: "none",
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
            backgroundColor: "inherit !important",
            cursor: "default !important",
          },
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
            backgroundColor: "#A3BFBF ",
          },
        },
      },
    },
  },
});

const StudentPerformanceTable = ({
  students,
  classAvg,
  onViewProfile,
  onExport,
  testType,
  maxScore,
  passThreshold,
  subject,
  schoolName,
  testName,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const pageSize = 10;
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const navigate = useNavigate();

  // Check if this is a remedial test
  const isRemedialTest = testType && testType.toLowerCase().includes("remedial");
  const gradeLabelsBySubject = {
    english: ["BEGINNER", "LETTERS", "WORDS", "SENTENCES", "STORIES"],
    hindi: ["BEGINNER", "LETTERS", "WORDS", "SENTENCES", "STORIES"],
    mathematics: ["BEGINNER", "SINGLE_DIGIT", "DOUBLE_DIGIT", "MULTIPLICATION", "DIVISION"],
  };
  const normalizedSubject = subject?.trim().toLowerCase() || "";

  // Define grade hierarchy for remedial tests (from lowest to highest proficiency)

  const formatGradeName = (grade) => {
    if (!grade) return "";
    return grade
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const remedialOptions = useMemo(() => {
    if (!isRemedialTest) return [];

    const normalizedSubject = subject?.trim().toLowerCase() || "";

    return [
      { label: "All Grades", value: "" },
      ...(gradeLabelsBySubject[normalizedSubject] || []).map((grade) => ({
        label: formatGradeName(grade),
        value: grade,
      })),
      { label: "Absent", value: "absent" },
    ];
  }, [isRemedialTest, subject]);

  const syllabusOptions = [
    { label: "All Results", value: "" },
    { label: "Pass", value: "pass" },
    { label: "Fail", value: "fail" },
    { label: "Absent", value: "absent" },
  ];

  const gradeHierarchy = [
    "FUNDAMENTALS",
    "BASIC_OPERATIONS",
    "FRACTIONS_DECIMALS",
    "WORD_PROBLEMS",
    "ADVANCED_CONCEPTS",
  ];

  // Helper function to determine if a grade is considered "pass" for remedial tests
  const isGradePass = (grade) => {
    if (!grade) return false;
    const gradeLevel = gradeHierarchy[grade.toUpperCase()];
    // Consider grades 3 and above as "pass" (FRACTIONS_DECIMALS and higher)
    return gradeLevel >= 3;
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const studentName = student.studentName || student.name;
      const nameMatch = studentName.toLowerCase().includes(searchQuery.toLowerCase());
      const isAbsent = student.isAbsent === true;

      if (!filterStatus) {
        return nameMatch;
      }

      // 🟩 Remedial test filtering
      if (isRemedialTest) {
        if (filterStatus === "absent") {
          return nameMatch && isAbsent;
        } else if (filterStatus) {
          return (
            nameMatch &&
            !isAbsent &&
            student.grade &&
            student.grade.toUpperCase() === filterStatus.toUpperCase()
          );
        }
      }

      // 🟦 Syllabus test filtering
      if (filterStatus === "pass") {
        const score = isAbsent ? 0 : student.score;
        return nameMatch && !isAbsent && score >= (passThreshold || 35);
      } else if (filterStatus === "fail") {
        const score = isAbsent ? 0 : student.score;
        return nameMatch && !isAbsent && score < (passThreshold || 35);
      } else if (filterStatus === "absent") {
        return nameMatch && isAbsent;
      }

      return nameMatch;
    });
  }, [students, searchQuery, filterStatus, isRemedialTest, passThreshold]);

  // Sorting
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return filteredStudents;
    return [...filteredStudents].sort((a, b) => {
      const aIsAbsent = a.isAbsent === true;
      const bIsAbsent = b.isAbsent === true;

      if (sortConfig.key === "name") {
        const aName = a.studentName || a.name;
        const bName = b.studentName || b.name;
        return sortConfig.direction === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      if (sortConfig.key === "score") {
        if (isRemedialTest) {
          // Sort by grade level for remedial tests
          const aGradeLevel = aIsAbsent ? -1 : gradeHierarchy[a.grade?.toUpperCase()] || 0;
          const bGradeLevel = bIsAbsent ? -1 : gradeHierarchy[b.grade?.toUpperCase()] || 0;
          return sortConfig.direction === "asc"
            ? aGradeLevel - bGradeLevel
            : bGradeLevel - aGradeLevel;
        } else {
          const aScore = aIsAbsent ? -1 : a.score;
          const bScore = bIsAbsent ? -1 : b.score;
          return sortConfig.direction === "asc" ? aScore - bScore : bScore - aScore;
        }
      }

      if (sortConfig.key === "vsClassAvg" && !isRemedialTest) {
        const aVsAvg = aIsAbsent ? -999 : a.score - classAvg;
        const bVsAvg = bIsAbsent ? -999 : b.score - classAvg;
        return sortConfig.direction === "asc" ? aVsAvg - bVsAvg : bVsAvg - aVsAvg;
      }

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [filteredStudents, sortConfig, classAvg, isRemedialTest]);

  // Table data
  const tableData = sortedStudents.map((student) => {
    const isAbsent = student.isAbsent === true;

    let scoreDisplay, resultStatus, vsClassAvgDisplay;

    if (isRemedialTest) {
      // For remedial tests, show grade instead of numerical score
      scoreDisplay = isAbsent ? "Absent" : formatGradeName(student.grade);
      if (isAbsent) {
        resultStatus = "Absent";
      } else {
        resultStatus = isGradePass(student.grade) ? "Pass" : "Fail";
      }
      vsClassAvgDisplay = "N/A"; // Not applicable for remedial tests
    } else {
      // For regular tests, show numerical scores
      scoreDisplay = isAbsent ? "Absent" : `${student.score}/${maxScore || 100}`;
      if (isAbsent) {
        resultStatus = "Absent";
      } else {
        resultStatus = student.score >= (passThreshold || 35) ? "Pass" : "Fail";
      }

      if (isAbsent) {
        vsClassAvgDisplay = "N/A";
      } else {
        const diff = student.score - classAvg;
        if (isNaN(diff) || classAvg === 0) {
          vsClassAvgDisplay = "0.0";
        } else {
          vsClassAvgDisplay = `${student.score > classAvg ? "+" : ""}${diff.toFixed(1)}`;
        }
      }
    }

    return {
      id: student.studentId || student.id,
      name: student.studentName || student.name,
      marks: isAbsent ? null : isRemedialTest ? student.grade : student.score,
      result: resultStatus,
      vsClassAvg: vsClassAvgDisplay,
      isPass: isAbsent
        ? false
        : isRemedialTest
        ? isGradePass(student.grade)
        : student.score >= (passThreshold || 35),
      isAbsent: isAbsent,
      originalScore: isAbsent ? null : isRemedialTest ? student.grade : student.score,
      grade: student.grade,
    };
  });

  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tableData.slice(startIndex, endIndex);
  }, [tableData, currentPage, pageSize]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setSortConfig({ key: null, direction: "asc" });
  };
  const isAnyFilterActive = !!searchQuery.trim() || !!filterStatus;

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

  // Download logic
  const handleDownloadCSV = (data) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Headers according to test type (same as UI columns)
    const headers = isRemedialTest
      ? ["Student Name", "Grade"]
      : ["Student Name", "Marks", "Status"];

    // Create CSV content with school name at top
    const csvLines = [];
    
    // Add school name and report info if available
    if (schoolName) {
      csvLines.push(`Student Performance Report`);
      csvLines.push(``); // Empty line
      
      // Report Information in single line format
      let reportInfo = `Report Information: School: ${schoolName}`;
      if (testName) {
        reportInfo += `, Test: ${testName}`;
      }
      if (subject) {
        reportInfo += `, Subject: ${subject}`;
      }
      if (maxScore) {
        reportInfo += `, Maximum Marks: ${maxScore}`;
      }
      reportInfo += `, Generated on: ${currentDate}`;
      csvLines.push(reportInfo);
      csvLines.push(""); // Empty line
    }
    
    // Add headers
    csvLines.push(headers.join(","));
    
    // Add data rows
    data.forEach((student) => {
      if (isRemedialTest) {
        // For remedial test - show formatted grade name
        const gradeDisplay = student.isAbsent ? "Absent" : formatGradeName(student.grade || student.originalScore);
        csvLines.push([
          student.name,
          gradeDisplay
        ].join(","));
      } else {
        // For syllabus test - show marks exactly like UI
        const marksDisplay = student.isAbsent ? "Absent" : student.originalScore;
        csvLines.push([
          student.name,
          marksDisplay,
          student.result
        ].join(","));
      }
    });

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_performance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    
    // Show success message
    toast.success("CSV report downloaded successfully!");
  };

  const handleDownloadPDF = (data) => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate HTML table rows according to test type
    const tableRows = data
      .map((student) => {
        if (isRemedialTest) {
          // For remedial test - show formatted grade name
          const gradeDisplay = student.isAbsent ? "Absent" : formatGradeName(student.grade || student.originalScore);
          return `
            <tr>
              <td style="padding:6px;border:1px solid #ddd;text-align:left;">${student.name}</td>
              <td style="padding:6px;border:1px solid #ddd;text-align:center;">${gradeDisplay}</td>
            </tr>
          `;
        } else {
          // For syllabus test - show marks exactly like UI
          const marksDisplay = student.isAbsent ? "Absent" : student.originalScore;
          return `
            <tr>
              <td style="padding:6px;border:1px solid #ddd;text-align:left;">${student.name}</td>
              <td style="padding:6px;border:1px solid #ddd;text-align:center;">${marksDisplay}</td>
              <td style="padding:6px;border:1px solid #ddd;text-align:center;">${student.result}</td>
            </tr>
          `;
        }
      })
      .join("");

    // Header row according to test type (same as UI columns)
    const headerRow = isRemedialTest
      ? `
        <tr>
          <th style="text-align:left;">Student Name</th>
          <th style="text-align:center;">Grade</th>
        </tr>
      `
      : `
        <tr>
          <th style="text-align:left;">Student Name</th>
          <th style="text-align:center;">Marks</th>
          <th style="text-align:center;">Status</th>
        </tr>
      `;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Performance Report</title>
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
        <h1>Student Performance Report</h1>
      </div>
      
      <div class="report-info">
        <h3>Report Information</h3>
        <div class="info-item">
          ${schoolName ? `<strong>School:</strong> ${schoolName}, ` : ''}${testName ? `<strong>Test:</strong> ${testName}, ` : ''}${subject ? `<strong>Subject:</strong> ${subject}, ` : ''}${maxScore ? `<strong>Maximum Marks:</strong> ${maxScore}, ` : ''}<strong>Generated on:</strong> ${currentDate}
        </div>
      </div>
      <table>
        <thead>
          ${headerRow}
        </thead>
        <tbody>
          ${tableRows}
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
        // Show success message after print dialog opens
        toast.success("PDF report generated successfully!");
      }, 250);
    };
  };

  const handleDownloadConfirm = ({ format, rows }) => {
    const dataToDownload =
      rows === "all"
        ? sortedStudents.map((student) => {
            const isAbsent = student.isAbsent === true;
            let resultStatus;

            if (isAbsent) {
              resultStatus = "Absent";
            } else if (isRemedialTest) {
              resultStatus = isGradePass(student.grade) ? "Pass" : "Fail";
            } else {
              resultStatus = student.score >= (passThreshold || 35) ? "Pass" : "Fail";
            }

            let vsClassAvgDisplay = "N/A";
            if (!isRemedialTest && !isAbsent) {
              const diff = student.score - classAvg;
              if (!isNaN(diff) && classAvg !== 0) {
                vsClassAvgDisplay = `${student.score > classAvg ? "+" : ""}${diff.toFixed(1)}`;
              } else {
                vsClassAvgDisplay = "0.0";
              }
            }

            return {
              name: student.studentName || student.name,
              result: resultStatus,
              grade: student.grade,
              isAbsent: isAbsent,
              originalScore: student.score,
            };
          })
        : paginatedTableData;

    if (format === "csv") {
      handleDownloadCSV(dataToDownload);
    } else if (format === "pdf") {
      handleDownloadPDF(dataToDownload);
    }
    setShowDownloadModal(false);
  };

  // Table columns
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false },
    },

    ...(isRemedialTest
      ? [
          {
            name: "name",
            label: "Student Name",
            options: {
              filter: false,
              sort: true,
              sortThirdClickReset: true,
              setCellHeaderProps: () => ({
                style: { textAlign: "left", width: "100%" },
              }),
              setCellProps: () => ({
                style: { textAlign: "left", width: "100%" },
              }),
            },
          },
          {
            name: "grade",
            label: "Grade",
            options: {
              filter: true,
              sort: false,
              setCellHeaderProps: () => ({
                style: { textAlign: "right", minWidth: 250, width: 250 },
              }),
              setCellProps: () => ({
                style: { textAlign: "right", minWidth: 250, width: 250 },
              }),
              customBodyRenderLite: (dataIndex) => {
                const student = paginatedTableData[dataIndex];
                if (student.isAbsent) {
                  return (
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: "#EAEDED",
                        color: "#2F4F4F",
                      }}
                    >
                      Absent
                    </span>
                  );
                }
                const grade = (student.grade || "").toString().toLowerCase();
                let bg = "#EAEDED";
                let color = "#2F4F4F";

                if (grade === "beginner") {
                  bg = "#FDDCDC";
                  color = "#F45050";
                } else if (grade === "stories" || grade === "division") {
                  bg = "#E9F3E9";
                  color = "#228B22";
                }

                return (
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: bg,
                      color: color,
                      textTransform: "capitalize",
                      fontFamily: "Work Sans",
                      fontWeight: 400,
                      fontSize: "12px",
                    }}
                  >
                    {formatGradeName(student.grade)}
                  </span>
                );
              },
            },
          },
        ]
      : [
          {
            name: "name",
            label: "Student Name",
            options: {
              filter: false,
              sort: true,
              sortThirdClickReset: true,
              setCellHeaderProps: () => ({
                style: { textAlign: "left", minWidth: 220, width: 260, maxWidth: 320 },
              }),
              setCellProps: () => ({
                style: { textAlign: "left", minWidth: 220, width: 260, maxWidth: 320 },
              }),
            },
          },
          {
            name: "marks",
            label: "Marks",
            options: {
              filter: false,
              sort: true,
              sortThirdClickReset: true,
              setCellHeaderProps: () => ({
                style: { textAlign: "center", width: 90, minWidth: 70, maxWidth: 100 },
              }),
              setCellProps: () => ({
                style: { textAlign: "center", width: 90, minWidth: 70, maxWidth: 100 },
              }),
              customBodyRenderLite: (dataIndex) => {
                const student = paginatedTableData[dataIndex];
                return student.isAbsent ? (
                  <span style={{ color: "#949494" }}> - </span>
                ) : (
                  student.originalScore
                );
              },
            },
          },
          // {
          //   name: "vsClassAvg",
          //   label: "Change from Class Avg.(80)",
          //   options: {
          //     filter: false,
          //     sort: true,
          //     sortThirdClickReset: true,
          //     setCellHeaderProps: () => ({
          //       style: { textAlign: "center", width: 90, minWidth: 70, maxWidth: 100 },
          //     }),
          //     setCellProps: () => ({
          //       style: { textAlign: "center", width: 90, minWidth: 70, maxWidth: 100 },
          //     }),
          //     customBodyRenderLite: (dataIndex) => {
          //       const student = paginatedTableData[dataIndex];
          //       if (student.isAbsent) {
          //         return <span style={{ color: "#949494" }}>-</span>;
          //       }

          //       let value = student.vsClassAvg;
          //       if (typeof value === "string" && value.startsWith("+")) {
          //         value = value.slice(1);
          //       }

          //       const num = Number(value);
          //       const display =
          //         !isNaN(num) && Number.isFinite(num) ? (Number.isInteger(num) ? num : num) : value;

          //       return <span style={{ color: "#2F4F4F" }}>{display}</span>;
          //     },
          //   },
          // },
          {
            name: "result",
            label: "Status",
            options: {
              filter: true,
              sort: false,
              setCellHeaderProps: () => ({
                style: { textAlign: "center", width: 90, minWidth: 70, maxWidth: 100 },
              }),
              setCellProps: () => ({
                style: { textAlign: "center", width: 90, minWidth: 70, maxWidth: 100 },
              }),
              customBodyRenderLite: (dataIndex) => {
                const student = paginatedTableData[dataIndex];
                if (student.isAbsent) {
                  return (
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: "#e0e0e0",
                        color: "#757575",
                      }}
                    >
                      Absent
                    </span>
                  );
                }

                return (
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: student.isPass ? "#e8f5e9" : "#ffebee",
                      color: student.isPass ? "#2e7d32" : "#c62828",
                      fontFamily: "Work Sans",
                      fontWeight: 400,
                      fontSize: "12px",
                    }}
                  >
                    {student.result}
                  </span>
                );
              },
            },
          },
        ]),
  ];

  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadLabelRender = defaultCustomHeadLabelRender;
  });

  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    responsive: "standard",
    rowsPerPage: pageSize,
    rowsPerPageOptions: [pageSize],
    pagination: false,
    count: tableData.length,
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <div className="w-full lg:flex-1">
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
              <div className="flex justify-between w-full gap-2">
                <div className="flex flex-wrap gap-2">
                  {/* Search field */}
                  <TextField
                    variant="outlined"
                    placeholder="Search by Student Name"
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
                  {/* Status Dropdown */}
                  <FormControl
                    sx={{
                      height: "48px",
                      display: "flex",
                      width: "150px",
                    }}
                  >
                    <InputLabel
                      id="result-select-label"
                      sx={{
                        color: "#2F4F4F",
                        fontFamily: "Work Sans",
                        fontWeight: 400,
                        fontSize: "14px",
                        transform: "translate(14px, 14px) scale(1)",
                        "&.Mui-focused, &.MuiFormLabel-filled": {
                          transform: "translate(14px, -9px) scale(0.75)",
                        },
                      }}
                    >
                      {isRemedialTest ? "Grade" : "Status"}
                    </InputLabel>
                    <Select
                      labelId="result-select-label"
                      id="result-select"
                      value={filterStatus}
                      label={isRemedialTest ? "Grade" : "Status"}
                      onChange={(e) => {
                        setCurrentPage(1);
                        setFilterStatus(e.target.value);
                      }}
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
                      {(isRemedialTest ? remedialOptions : syllabusOptions).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {/*  Clear Filters */}
                  <div className="flex justify-end sm:justify-start w-full sm:w-auto">
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
                </div>
                {/* Download Reports Button */}
                <div>
                  <ButtonCustom
                    text={"Download Report"}
                    onClick={() => setShowDownloadModal(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-2 mb-1"
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            color: "#2F4F4F",
          }}
        >
          {/* {isRemedialTest
            ? ""
            : `Maximum Marks: ${maxScore || 100} (Pass Percentage ≥ ${Math.round(
                ((passThreshold || 35) / (maxScore || 100)) * 100
              )}%)`} */}
          {isRemedialTest ? "" : `Maximum Marks: ${maxScore || 100}`}
        </div>
        {/* Data Table */}
        <div
          style={{ borderRadius: "8px" }}
          className="rounded-lg overflow-hidden border mt-4 border-gray-200 overflow-x-auto"
        >
          <MUIDataTable
            data={paginatedTableData}
            columns={columns}
            options={{
              ...options,
              setTableProps: () => ({
                style: { tableLayout: "fixed", width: "100%" },
              }),
            }}
          />
        </div>
        <div style={{ width: "max-content", margin: "25px auto" }}>
          <Pagination
            count={Math.ceil(tableData.length / pageSize)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            showFirstButton
            showLastButton
            renderItem={(item) => {
              const isNextPage = item.page === currentPage + 1 && item.type === "page";
              const isCurrentPage = item.page === currentPage && item.type === "page";

              return (
                <PaginationItem
                  {...item}
                  sx={{
                    ...(isNextPage && {
                      border: "1px solid #2F4F4F",
                      borderRadius: "9999px", // fully rounded
                      color: "#2F4F4F",
                    }),
                  }}
                />
              );
            }}
          />
        </div>
        {/* Download Modal */}
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          onConfirm={handleDownloadConfirm}
          totalRows={sortedStudents.length}
          defaultRows="all"
          formats={["csv", "pdf"]}
        />
      </div>
    </ThemeProvider>
  );
};

StudentPerformanceTable.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      studentId: PropTypes.string,
      name: PropTypes.string,
      studentName: PropTypes.string,
      score: PropTypes.number,
      grade: PropTypes.string,
      isAbsent: PropTypes.bool,
    })
  ).isRequired,
  classAvg: PropTypes.number.isRequired,
  maxScore: PropTypes.number,
  passThreshold: PropTypes.number,
  onViewProfile: PropTypes.func,
  onExport: PropTypes.func,
  testType: PropTypes.string,
  subject: PropTypes.string,
  schoolName: PropTypes.string,
  testName: PropTypes.string,
};

StudentPerformanceTable.defaultProps = {
  students: [],
  classAvg: 0,
};

export default StudentPerformanceTable;
