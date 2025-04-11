import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { 
  Button, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Tooltip 
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import ButtonCustom from "../ButtonCustom"; // Adjust the import path as needed

// Create MUI theme to match TestListTable
const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
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

/**
 * Component to display student performance data - styled like TestListTable
 * 
 * @param {Object} props - Component props
 * @param {Array} props.students - Array of student objects with performance data
 * @param {number} props.classAvg - The class average score
 * @param {Function} props.onViewProfile - Callback when "View Profile" is clicked for a student
 * @param {Function} props.onExport - Optional callback when "Export" is clicked 
 */
const StudentPerformanceTable = ({ students, classAvg, onViewProfile, onExport }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  });

  // Filter students based on search query and status
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!filterStatus) {
        return nameMatch;
      } else if (filterStatus === "pass") {
        return nameMatch && student.score >= 40; // Assuming 40 is the pass mark
      } else { // 'fail'
        return nameMatch && student.score < 40;
      }
    });
  }, [students, searchQuery, filterStatus]);

  // Apply sorting based on which column is being sorted
  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return filteredStudents;

    return [...filteredStudents].sort((a, b) => {
      // Special case for comparing vs class avg
      if (sortConfig.key === 'vsClassAvg') {
        const aVsAvg = a.score - classAvg;
        const bVsAvg = b.score - classAvg;
        return sortConfig.direction === "asc" ? aVsAvg - bVsAvg : bVsAvg - aVsAvg;
      }
      
      // Handle other fields
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [filteredStudents, sortConfig, classAvg]);

  // Format table data for MUIDataTable
  const tableData = sortedStudents.map(student => ({
    id: student.id,
    name: student.name,
    score: `${student.score}/100`,
    result: student.score >= 40 ? 'Pass' : 'Fail',
    vsClassAvg: `${student.score > classAvg ? '+' : ''}${(student.score - classAvg).toFixed(1)}`,
    isPass: student.score >= 40,
    originalScore: student.score
  }));

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setSortConfig({ key: null, direction: "asc" });
  };

  // MUI DataTable columns configuration
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false } // Keep the ID hidden in the table
    },
    {
      name: "name",
      label: "Student Name",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
      }
    },
    {
      name: "score",
      label: "Score",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        customBodyRenderLite: (dataIndex) => {
          return <div className="text-center">{tableData[dataIndex].score}</div>;
        }
      }
    },
    {
      name: "result",
      label: "Result",
      options: {
        filter: true,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const isPass = tableData[dataIndex].isPass;
          return (
            <div className="flex justify-center">
              <div
                className="inline-block px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: isPass ? "#e8f5e9" : "#ffebee",
                  color: isPass ? "#2e7d32" : "#c62828",
                }}
              >
                {tableData[dataIndex].result}
              </div>
            </div>
          );
        }
      }
    },
    {
      name: "vsClassAvg",
      label: "vs Class Avg",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        customBodyRenderLite: (dataIndex) => {
          const value = tableData[dataIndex].vsClassAvg;
          const isPositive = value && value.startsWith('+');
          
          return (
            <div className="text-center" style={{ color: isPositive ? "#2e7d32" : "#c62828" }}>
              {value}
            </div>
          );
        }
      }
    },
    {
      name: "id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const studentId = tableData[dataIndex].id;
          
          return (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onViewProfile && onViewProfile(studentId)}
                sx={{
                  borderColor: "transparent",
                  color: "#2F4F4F",
                  "&:hover": { borderColor: "transparent" }
                }}
              >
                <PersonIcon style={{ width: "20px", height: "20px" }} />
                &nbsp; View Profile
              </Button>
            </div>
          );
        }
      }
    }
  ];

  // MUI DataTable options
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    responsive: "standard",
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 30],
    pagination: false
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="">
        <h5 className="text-lg font-bold text-[#2F4F4F]">Student Performance</h5>

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
                      <MenuItem value="pass">Pass</MenuItem>
                      <MenuItem value="fail">Fail</MenuItem>
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
          <MUIDataTable data={tableData} columns={columns} options={options} />
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
      score: PropTypes.number.isRequired
    })
  ).isRequired,
  classAvg: PropTypes.number.isRequired,
  onViewProfile: PropTypes.func,
  onExport: PropTypes.func
};

StudentPerformanceTable.defaultProps = {
  students: [],
  classAvg: 0
};

export default StudentPerformanceTable;