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
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import ButtonCustom from "../ButtonCustom";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Create MUI theme to match TestListTable
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
          color: "#2F4F4F", // Dropdown arrow icon color
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
            backgroundColor: "#A3BFBF ", // Hover color
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
  const pageSize = 10; // Items per page
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const navigate = useNavigate();

  // Filter students based on search query and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!filterStatus) {
        return nameMatch;
      } else if (filterStatus === "pass") {
        return nameMatch && student.score >= 35; // Students with 35 or above pass
      } else {
        // 'fail'
        return nameMatch && student.score < 35; // Students below 35 fail
      }
    });
  }, [students, searchQuery, filterStatus]);

  // Apply sorting based on which column is being sorted
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return filteredStudents;

    return [...filteredStudents].sort((a, b) => {
      // Special case for comparing vs class avg
      if (sortConfig.key === "vsClassAvg") {
        const aVsAvg = a.score - classAvg;
        const bVsAvg = b.score - classAvg;
        return sortConfig.direction === "asc" ? aVsAvg - bVsAvg : bVsAvg - aVsAvg;
      }

      // Handle other fields
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

  // Format table data for MUIDataTable
  const tableData = sortedStudents.map((student) => ({
    id: student.id,
    name: student.name,
    score: `${student.score}/100`,
    result: student.score >= 35 ? "Meets Standard" : "Needs Improvement", // Students with 35 or above "Meet Standard"
    vsClassAvg:
      isNaN(student.score - classAvg) || classAvg === 0
        ? "N/A"
        : `${student.score > classAvg ? "+" : ""}${(student.score - classAvg).toFixed(1)}`,
    isPass: student.score >= 35, // Students with 35 or above pass
    originalScore: student.score,
  }));

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

  const defaultCustomHeadLabelRender = (columnMeta) => (
    <span
      style={{
        color: "#2F4F4F",
        fontFamily: "'Work Sans'",
        fontWeight: 600,
        fontSize: "14px",
        fontStyle: "normal",
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
          return <div className="">{paginatedTableData[dataIndex].score}</div>;
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
          const isPass = paginatedTableData[dataIndex].isPass;
          return (
            <div className="">
              <div
                className="inline-block px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: isPass ? "#e8f5e9" : "#ffebee",
                  color: isPass ? "#2e7d32" : "#c62828",
                }}
              >
                {paginatedTableData[dataIndex].result}
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
          const value = paginatedTableData[dataIndex].vsClassAvg;
          const isPositive = value && value.startsWith("+");

          return (
            <div className="" style={{ color: isPositive ? "#2e7d32" : "#c62828" }}>
              {value === "N/A" ? <span style={{ color: "#949494" }}>N/A</span> : value}
            </div>
          );
        },
      },
    },
    {
      name: "id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        setCellHeaderProps: () => ({
          style: { display: "flex", justifyContent: "center" },
        }),
        customBodyRenderLite: (dataIndex) => {
          const studentId = paginatedTableData[dataIndex].id;

          return (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Redirect using the extracted schoolId
                  // navigate(`/schools/schoolDetail/${schoolId}/student-profile/${studentId}`);
                }}
                sx={{
                  borderColor: "transparent",
                  color: "#2F4F4F",
                  "&:hover": { borderColor: "transparent" },
                }}
              >
                <PersonIcon style={{ width: "20px", height: "20px" }} />
                &nbsp; View Profile
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
    rowsPerPage: pageSize,
    rowsPerPageOptions: [pageSize],
    pagination: false, // We're handling pagination ourselves
    count: tableData.length,
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="">
        <h3 className="text-lg font-semibold text-[#2F4F4F]">Student Performance</h3>

        {/* Filters - Exact match to TestListTable */}
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
                    </Select>
                  </FormControl>

                  {/* Reset Button */}
                  <div className="flex justify-end sm:justify-start w-full sm:w-auto">
                    <Tooltip title="Reset Filters" placement="top">
                      <div
                        onClick={resetFilters}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#f5f5f5",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          height: "48px",
                        }}
                      >
                        <RestartAltIcon color="action" />
                      </div>
                    </Tooltip>
                  </div>
                </div>

                {/* ButtonCustom for Export */}
                <div>
                  {onExport && (
                    <ButtonCustom text={"Export Data"} onClick={() => onExport(sortedStudents)} />
                  )}
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
      </div>
    </ThemeProvider>
  );
};

StudentPerformanceTable.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
    })
  ).isRequired,
  classAvg: PropTypes.number.isRequired,
  onViewProfile: PropTypes.func,
  onExport: PropTypes.func,
  schoolId: PropTypes.string.isRequired, // Add schoolId prop type
};

StudentPerformanceTable.defaultProps = {
  students: [],
  classAvg: 0,
};

export default StudentPerformanceTable;
