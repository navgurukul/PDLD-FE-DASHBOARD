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
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "../ButtonCustom";
import { useNavigate } from "react-router-dom";
import DownloadModal from "../modal/DownloadModal";

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
          fontFamily: "Karla !important",
          textAlign: "left",
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
          color: "black",
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

const StudentPerformanceTable = ({ students, classAvg, onViewProfile, onExport }) => {
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

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const studentName = student.studentName || student.name;
      const nameMatch = studentName.toLowerCase().includes(searchQuery.toLowerCase());
      const isAbsent = student.isAbsent === true;
      const score = isAbsent ? 0 : student.score;

      if (!filterStatus) {
        return nameMatch;
      } else if (filterStatus === "pass") {
        return nameMatch && !isAbsent && score >= 35;
      } else if (filterStatus === "fail") {
        return nameMatch && !isAbsent && score < 35;
      } else if (filterStatus === "absent") {
        return nameMatch && isAbsent;
      }
      return nameMatch;
    });
  }, [students, searchQuery, filterStatus]);

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
        const aScore = aIsAbsent ? -1 : a.score;
        const bScore = bIsAbsent ? -1 : b.score;
        return sortConfig.direction === "asc" ? aScore - bScore : bScore - aScore;
      }
      if (sortConfig.key === "vsClassAvg") {
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
  }, [filteredStudents, sortConfig, classAvg]);

  // Table data
  const tableData = sortedStudents.map((student) => {
    const isAbsent = student.isAbsent === true;
    const scoreDisplay = isAbsent ? "Absent" : `${student.score}/100`;
    let resultStatus;
    if (isAbsent) {
      resultStatus = "Absent";
    } else {
      resultStatus = student.score >= 35 ? "Meets Standard" : "Needs Improvement";
    }
    let vsClassAvgDisplay;
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
    return {
      id: student.studentId || student.id,
      name: student.studentName || student.name,
      score: scoreDisplay,
      result: resultStatus,
      vsClassAvg: vsClassAvgDisplay,
      isPass: !isAbsent && student.score >= 35,
      isAbsent: isAbsent,
      originalScore: isAbsent ? null : student.score,
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
    const csvRows = [
      ["Student Name", "Score", "Result", "VS Class Avg"],
      ...data.map((student) => [student.name, student.score, student.result, student.vsClassAvg]),
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_performance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (data) => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate HTML table rows
    const tableRows = data
      .map(
        (student) => `
    <tr>
      <td style="padding:6px;border:1px solid #ddd;text-align:left;">${student.name}</td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center;">${student.score}</td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center;">${student.result}</td>
      <td style="padding:6px;border:1px solid #ddd;text-align:center;color:${
        student.vsClassAvg === "0.0"
          ? "#c62828"
          : student.vsClassAvg.startsWith("+")
          ? "#2e7d32"
          : "#c62828"
      };">${student.vsClassAvg}</td>
    </tr>
  `
      )
      .join("");

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
        .header .date { color: #666; font-size: 12px; }
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
        <div class="date">Generated on: ${currentDate}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="text-align:left;">Student Name</th>
            <th>Score</th>
            <th>Result</th>
            <th>VS Class Avg</th>
          </tr>
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
      }, 250);
    };
  };

  const handleDownloadConfirm = ({ format, rows }) => {
    const dataToDownload =
      rows === "all"
        ? sortedStudents.map((student) => {
            const isAbsent = student.isAbsent === true;
            const scoreDisplay = isAbsent ? "Absent" : `${student.score}/100`;
            let resultStatus;
            if (isAbsent) {
              resultStatus = "Absent";
            } else {
              resultStatus = student.score >= 35 ? "Meets Standard" : "Needs Improvement";
            }
            let vsClassAvgDisplay;
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
            return {
              name: student.studentName || student.name,
              score: scoreDisplay,
              result: resultStatus,
              vsClassAvg: vsClassAvgDisplay,
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
    {
      name: "name",
      label: "Student Name",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
      },
    },
    {
      name: "score",
      label: "Score",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        setCellHeaderProps: () => ({
          style: { textAlign: "center" },
        }),
        customBodyRenderLite: (dataIndex) => {
          const student = paginatedTableData[dataIndex];
          return (
            <div>
              {student.isAbsent ? <span style={{ color: "#949494" }}>Absent</span> : student.score}
            </div>
          );
        },
      },
    },
    {
      name: "result",
      label: "Result",
      options: {
        filter: true,
        sort: false,
        setCellHeaderProps: () => ({
          style: { textAlign: "center" },
        }),
        customBodyRenderLite: (dataIndex) => {
          const student = paginatedTableData[dataIndex];
          if (student.isAbsent) {
            return (
              <div>
                <div
                  className="inline-block px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: "#e0e0e0",
                    color: "#757575",
                  }}
                >
                  Absent
                </div>
              </div>
            );
          }
          const isPass = student.isPass;
          return (
            <div>
              <div
                className="inline-block px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: isPass ? "#e8f5e9" : "#ffebee",
                  color: isPass ? "#2e7d32" : "#c62828",
                }}
              >
                {student.result}
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "vsClassAvg",
      label: "VS Class Avg",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        customBodyRenderLite: (dataIndex) => {
          const student = paginatedTableData[dataIndex];
          if (student.isAbsent) {
            return <span style={{ color: "#949494" }}>N/A</span>;
          }
          const value = student.vsClassAvg;
          const isPositive = value && value.startsWith("+");
          if (value === "0.0") {
            return <span style={{ color: "#c62828" }}>0.0</span>;
          }
          return <div style={{ color: isPositive ? "#2e7d32" : "#c62828" }}>{value}</div>;
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
        <h3 className="text-lg font-semibold text-[#2F4F4F]">Student Performance</h3>
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
                        transform: "translate(14px, 14px) scale(1)",
                        "&.Mui-focused, &.MuiFormLabel-filled": {
                          transform: "translate(14px, -9px) scale(0.75)",
                        },
                      }}
                    >
                      Result
                    </InputLabel>
                    <Select
                      labelId="result-select-label"
                      id="result-select"
                      value={filterStatus}
                      label="Result"
                      onChange={(e) => setFilterStatus(e.target.value)}
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
                      <MenuItem value="">All Results</MenuItem>
                      <MenuItem value="pass">Meets Standard</MenuItem>
                      <MenuItem value="fail">Needs Improvement</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
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
                </div>
                {/* Download Reports Button */}
                <div>
                  <ButtonCustom
                    text={"Download Reports"}
                    onClick={() => setShowDownloadModal(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Data Table */}
        <div
          style={{ borderRadius: "8px" }}
          className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
        >
          <MUIDataTable data={paginatedTableData} columns={columns} options={options} />
        </div>
        <div style={{ width: "max-content", margin: "25px auto" }}>
          <Pagination
            count={Math.ceil(tableData.length / pageSize)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            showFirstButton
            showLastButton
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
      isAbsent: PropTypes.bool,
    })
  ).isRequired,
  classAvg: PropTypes.number.isRequired,
  onViewProfile: PropTypes.func,
  onExport: PropTypes.func,
  schoolId: PropTypes.string,
};

StudentPerformanceTable.defaultProps = {
  students: [],
  classAvg: 0,
};

export default StudentPerformanceTable;
