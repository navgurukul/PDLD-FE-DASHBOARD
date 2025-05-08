import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import {
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, Select, InputLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { Search } from "lucide-react";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import { noSchoolImage } from "../utils/imagePath";

// Create theme for consistent styling
const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
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
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [schools, setSchools] = useState([]);

  const pageSize = 10;

  // Mock data for schools - in real implementation, this would come from an API
  useEffect(() => {
    // This would be an API call in a real implementation
    const mockSchools = [
      { id: "111223456", name: "Govt. Primary School Raiganj" },
      { id: "111223457", name: "Govt. Primary School Manjhipadar" },
      { id: "111223458", name: "Govt. Primary School Bhilaigarh" },
      { id: "111223459", name: "Govt. Primary School Patrapali" },
    ];
    setSchools(mockSchools);
  }, []);

  // Filter schools based on search query
  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.id.includes(searchQuery)
  );

  // Mock report data - in real implementation, this would come from an API
  useEffect(() => {
    if (selectedSchool) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const mockReportData = [
          {
            name: "Test - 1",
            noOfStudents: 38,
            maxMarks: 30,
            hindi: 24,
            english: 23,
            mathematics: 25,
            science: 27,
            socialScience: 29,
            healthCare: 29,
            it: 29,
          },
          {
            name: "Test - 1",
            noOfStudents: 38,
            maxMarks: 30,
            hindi: 24,
            english: 23,
            mathematics: 25,
            science: 27,
            socialScience: 29,
            healthCare: 29,
            it: 29,
          },
          {
            name: "Test - 1",
            noOfStudents: 38,
            maxMarks: 50,
            hindi: 24,
            english: 23,
            mathematics: 12,
            science: 11,
            socialScience: 29,
            healthCare: 7,
            it: 29,
          },
          {
            name: "Test - 1",
            noOfStudents: 38,
            maxMarks: 30,
            hindi: 24,
            english: 23,
            mathematics: 25,
            science: 27,
            socialScience: 29,
            healthCare: 29,
            it: 29,
          },
          {
            name: "Test - 1",
            noOfStudents: 38,
            maxMarks: 30,
            hindi: 24,
            english: "03",
            mathematics: 25,
            science: 27,
            socialScience: 29,
            healthCare: 29,
            it: 29,
          },
        ];

        setReportData(mockReportData);
        setTotalRecords(mockReportData.length);
        setIsLoading(false);
      }, 800);
    } else {
      setReportData([]);
    }
  }, [selectedSchool, selectedClass, currentPage]);

  // Handle school selection
  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSearchQuery(`${school.id} - ${school.name}`);
    setShowDropdown(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedSchool(null);
    }
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

  // Reset filters
  const resetFilters = () => {
    setSelectedClass("");
    setSearchQuery("");
    setSelectedSchool(null);
    setCurrentPage(1);
  };

  // Download report
  const handleDownloadReport = () => {
    toast.info("Downloading report...");
    // Implement download logic here
  };
  const defaultCustomHeadLabelRender = (columnMeta) => (
    <span
      style={{
        color: "#2F4F4F",
        fontFamily: "'Work Sans'",
        fontSize: "14px",
        lineHeight: "28px",
        fontWeight: 600,
      }}
    >
      {columnMeta.label}
    </span>
  );
  // Table columns
  const columns = [
    {
      name: "name",
      label: "Name of Exam",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "noOfStudents",
      label: "No. of Students",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "maxMarks",
      label: "Max Marks",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "hindi",
      label: "Hindi",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
    {
      name: "english",
      label: "English",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
    {
      name: "mathematics",
      label: "Mathematics",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
    {
      name: "science",
      label: "Science",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
    {
      name: "socialScience",
      label: "Social Science",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
    {
      name: "healthCare",
      label: "Health Care",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
    {
      name: "it",
      label: "IT",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ color: getTextColor(value) }}>{value}</div>;
        },
      },
    },
  ];
  // Apply default customHeadLabelRender to all columns
  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadLabelRender = defaultCustomHeadLabelRender;
  });
  // Table options
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    pagination: false,
    responsive: "standard",
    rowsPerPage: pageSize,
    rowsPerPageOptions: [10],
    tableBodyHeight: "auto",
    tableBodyMaxHeight: "auto",
    customFooter: () => {
      return null; // Remove default footer
    },
  };

  // Classes available for selection
  const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper">
        <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">
          School Performance Report
        </h5>

        {/* Search Bar and School Selection */}
        <div className="mb-6">
          <div className="relative">
            <TextField
              variant="outlined"
              placeholder="Search by school name or ID"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              InputProps={{
                style: {
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  height: "48px",
                  minWidth: "636px",
                  width: "636px",
                },
                startAdornment: (
                  <div className="pr-2">
                    <Search size={20} className="text-gray-500" />
                  </div>
                ),
              }}
              sx={{
                marginBottom: { xs: "10px", md: "0" },
                "& .MuiOutlinedInput-root": {
                  paddingLeft: "10px",
                },
              }}
            />

            {/* Search dropdown with fixed width */}
            {showDropdown && searchQuery && (
              <div
                className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                style={{ width: "636px" }}
              >
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSchoolSelect(school)}
                  >
                    <span className="font-semibold">{school.id}</span> -{" "}
                    {school.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedSchool ? (
          <>
            {selectedSchool && (
              <div className="  mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* <h2 className="text-xl text-blue-600">{selectedSchool.id} - {selectedSchool.name}</h2> */}

                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-4">
                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "150px",
                      }}
                    >
                      <InputLabel id="class-select-label">Class</InputLabel>
                      <Select
                        labelId="class-select-label"
                        id="class-select"
                        value={selectedClass}
                        label="Class"
                        onChange={(e) => setSelectedClass(e.target.value)}
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
                        <MenuItem value="">All Classes</MenuItem>
                        {classes.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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

                  <Button
                    variant="contained"
                    onClick={handleDownloadReport}
                    sx={{
                      backgroundColor: "#f3c22c",
                      color: "#000",
                      fontWeight: "medium",
                      "&:hover": {
                        backgroundColor: "#e0b424",
                      },
                      height: "40px",
                    }}
                  >
                    Download Report
                  </Button>
                </div>
              </div>
            )}

            {/* Report Table */}
            {selectedSchool && (
              <>
                <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <MUIDataTable
                    data={reportData}
                    columns={columns}
                    options={options}
                  />

                  {/* Note */}
                  <div className="p-4 bg-gray-50 text-sm text-gray-600">
                    <span className="font-semibold">Note:</span> These marks
                    represent the subject-wise average score of the class,
                    calculated as: (Total Marks Obtained in the Subject ÷ Number
                    of Students Appeared)
                  </div>
                </div>

                {/* Pagination */}
                {totalRecords > pageSize && (
                  <div style={{ width: "max-content", margin: "25px auto" }}>
                    <Pagination
                      count={Math.ceil(totalRecords / pageSize)}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      showFirstButton
                      showLastButton
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // Show placeholder image when no school is selected (user first lands on page)
          <div className="flex flex-col items-center justify-center p-10">
            <img
              src={noSchoolImage}
              alt="Search for a school"
              className="w-40 h-40 mb-6"
            />
            <h3 className="text-xl text-gray-600 mb-2">No School Selected</h3>
            <p className="text-gray-500">
              Please search and select a school to view performance reports
            </p>
          </div>
        )}

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
