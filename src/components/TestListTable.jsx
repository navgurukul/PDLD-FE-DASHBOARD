import { useState, useEffect, useMemo } from "react";
import MUIDataTable from "mui-datatables";
import { addSymbolBtn, EditPencilIcon, DocScanner } from "../utils/imagePath";
import { Button, TextField, MenuItem, CircularProgress, Typography, Select } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Pagination, PaginationItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./TestListTable.css";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Tooltip from "@mui/material/Tooltip";

import apiInstance from "../../api";
import { CLASS_OPTIONS, SUBJECT_OPTIONS, STATUS_LABELS } from "../data/testData";
import ButtonCustom from "./ButtonCustom";
import SpinnerPageOverlay from "./SpinnerPageOverlay";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Paper from "@mui/material/Paper";
import { Search } from "lucide-react";

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
          borderBottom: "none",
          fontWeight: 400,
          color: "#2F4F4F",
          fontSize: "14px",
          textAlign: (props) => (props.name === "actions" ? "center" : "left"),
          "&.custom-cell": {
            width: "0px",
          },
        },
        head: {
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "center",
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
          color: "#2F4F4F", // Change default text color
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

export default function TestListTable() {
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Track dropdown selections
  const [selectedClass, setSelectedClass] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState([]); // Array for multi-select
  const [selectedStatus, setSelectedStatus] = useState("");
  // Keeping this for placeholder only; no changes to date-range logic
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  // Changed from fixed pageSize to state
  const [pageSize, setPageSize] = useState(15);

  const location = useLocation();
  const navigate = useNavigate();

  const [classOpen, setClassOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  // API-based dropdown options
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classWiseSubjects, setClassWiseSubjects] = useState({});

  // Add page size change handler
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Fetch class-wise subjects from API
  const fetchClassWiseSubjects = async () => {
    try {
      const response = await apiInstance.get("/report/class-wise-subjects");
      if (response.data && response.data.data) {
        const data = response.data.data;
        // Check if data is an array (new format) or object (old format)
        if (Array.isArray(data)) {
          // New format: array of objects with class and subjects
          const subjectsMap = {};
          const allSubjects = new Set();
          const classes = [];
          data.forEach((classData) => {
            const classNum = classData.class;
            classes.push(`Class ${classNum}`);
            const classSubjects = {
              academicSubjects: classData.subjects || [],
              vocationalSubjects: classData.vocationalSubjects || []
            };
            subjectsMap[classNum] = classSubjects;
            // Add all subjects to the set
            if (classSubjects.academicSubjects) {
              classSubjects.academicSubjects.forEach(subject => allSubjects.add(subject));
            }
            if (classSubjects.vocationalSubjects) {
              classSubjects.vocationalSubjects.forEach(subject => allSubjects.add(subject));
            }
          });
          setClassWiseSubjects(subjectsMap);
          const sortedClasses = classes.sort((a, b) => {
            const numA = parseInt(a.replace('Class ', ''));
            const numB = parseInt(b.replace('Class ', ''));
            return numA - numB;
          });
          const sortedSubjects = Array.from(allSubjects).sort();
          setClassOptions(sortedClasses);
          setSubjectOptions(sortedSubjects);
        } else {
          // Old format: object with class keys
          const classKeys = Object.keys(data);
          const classes = classKeys.map(classKey => {
            const classNumber = parseInt(classKey);
            // Check if API uses 0-based (0-11) or 1-based (1-12) indexing
            if (classNumber >= 0 && classNumber <= 11 && !classKeys.includes('12')) {
              // 0-based indexing (0-11), convert to 1-12
              return `Class ${classNumber + 1}`;
            } else {
              // 1-based indexing (1-12), use as is
              return `Class ${classNumber}`;
            }
          }).sort((a, b) => {
            const numA = parseInt(a.replace('Class ', ''));
            const numB = parseInt(b.replace('Class ', ''));
            return numA - numB;
          });
          const allSubjects = new Set();
          Object.values(data).forEach(classData => {
            if (classData.academicSubjects && Array.isArray(classData.academicSubjects)) {
              classData.academicSubjects.forEach(subject => allSubjects.add(subject));
            }
            if (classData.vocationalSubjects && Array.isArray(classData.vocationalSubjects)) {
              classData.vocationalSubjects.forEach(subject => allSubjects.add(subject));
            }
          });
          setClassWiseSubjects(data);
          setClassOptions(classes);
          setSubjectOptions(Array.from(allSubjects).sort());
        }
      }
    } catch (error) {
      // Fallback to static data if API fails
      setClassOptions(CLASS_OPTIONS);
      setSubjectOptions(SUBJECT_OPTIONS);
    }
  };

  // Get filtered subject options based on selected classes
  const getFilteredSubjectOptions = () => {
    if (selectedClass.length === 0) {
      return subjectOptions; // Show all subjects if no class selected
    }
    const filteredSubjects = new Set();
    const classKeys = Object.keys(classWiseSubjects);
    selectedClass.forEach(classOption => {
      const classNumber = parseInt(classOption.replace("Class ", ""));
      // Try different key formats
      let classKey = null;
      if (classKeys.includes(classNumber.toString())) {
        // Direct match (1-12)
        classKey = classNumber.toString();
      } else if (classKeys.includes((classNumber - 1).toString())) {
        // 0-based indexing (0-11)
        classKey = (classNumber - 1).toString();
      }
      const classData = classWiseSubjects[classKey];
      if (classData) {
        // Handle both old and new format
        if (classData.academicSubjects && Array.isArray(classData.academicSubjects)) {
          classData.academicSubjects.forEach(subject => filteredSubjects.add(subject));
        }
        if (classData.vocationalSubjects && Array.isArray(classData.vocationalSubjects)) {
          classData.vocationalSubjects.forEach(subject => filteredSubjects.add(subject));
        }
        // Handle subjects array directly (new format)
        if (classData.subjects && Array.isArray(classData.subjects)) {
          classData.subjects.forEach(subject => filteredSubjects.add(subject));
        }
      }
    });
    const result = Array.from(filteredSubjects).sort();
    return result;
  };

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      // Remove state after showing the toast to prevent duplicate toasts
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    try {
      const rawData = localStorage.getItem("userData");
      if (!rawData) {
        setUserRole("");
        return;
      }
      const userData = JSON.parse(rawData);
      setUserRole(userData.role || "");
    } catch (error) {
      setUserRole("");
    }
  }, []);

  // Fetch class-wise subjects on component mount
  useEffect(() => {
    fetchClassWiseSubjects();
  }, []);

  const handleCreateTest = () => {
    navigate("/testCreationForm"); // Replace with your target route
  };

  function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return null; // Guard if date is invalid
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // e.g. "01-02-2020"
  }

  // Fetch data from API (switches to /tests/search for test name search)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // If searchQuery is present, use /tests/search (global, paginated search)
      if (searchQuery && searchQuery.trim() !== "") {
        // Only test name search, ignore other filters for now (can be combined if backend supports)
        let url = `/tests/search?page=${currentPage}&pageSize=${pageSize}&query=${encodeURIComponent(searchQuery)}`;
        const response = await apiInstance.get(url);
        if (response.data && response.data.data) {
          setTests(response.data.data.tests); // Corrected to access 'tests' instead of 'data.data'
          setTotalRecords(response.data.data.pagination.totalCount); // Corrected to access 'pagination.totalCount'
        }
        return;
      }

      // Otherwise, use /test/filter for all other filters
      let startDateFormatted;
      let endDateFormatted;
      if (startDate && endDate) {
        startDateFormatted = formatDate(startDate);
        endDateFormatted = formatDate(endDate);
      } else {
        startDateFormatted = "01-02-2020";
        endDateFormatted = "01-02-2026";
      }
      let url = `/test/filter?startDate=${startDateFormatted}&endDate=${endDateFormatted}&pageSize=${pageSize}`;
      if (selectedClass.length > 0) {
        selectedClass.forEach((c) => {
          url += `&testClass=${encodeURIComponent(c.replace("Class ", ""))}`;
        });
      }
      if (selectedSubject.length > 0) {
        selectedSubject.forEach((s) => {
          let apiSubjectName = s;
          if (s === "Industrial Organization") {
            apiSubjectName = "Industrial_organization";
          }
          url += `&subject=${encodeURIComponent(apiSubjectName)}`;
        });
      }
      if (selectedStatus) {
        url += `&testStatus=${selectedStatus}`;
      }
      url += `&page=${currentPage}`;
      const response = await apiInstance.get(url);
      if (response.data && response.data.data) {
        setTests(response.data.data.data);
        setTotalRecords(response.data.data.pagination.totalRecords);
      }
    } catch (error) {
      // Error fetching data, do nothing (no debug log)
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data whenever any filter or search changes
  useEffect(() => {
    if ((startDate && endDate) || (!startDate && !endDate) || (searchQuery && searchQuery.trim() !== "")) {
      fetchData();
    }
  }, [selectedClass, selectedSubject, selectedStatus, startDate, endDate, currentPage, pageSize, searchQuery]);

  // Remove local filtering: tests are already filtered by backend
  const filteredTests = tests;

  // State to track sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Then proceed with mapping to tableData as before
  const tableData = filteredTests?.map((test) => ({
    id: test.id,
    testName: test.testName,
    testTag: test.testTag || "N/A",
    subject: test.subject || "N/A",
    class: `Class ${test.testClass || "N/A"}`,
    dateOfTest: new Date(test.testDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    schoolsSubmitted: test.totalSubmittedSchools || 0,
    status: test.testStatus,
    actions: "View Report",
  }));

  const isAnyFilterActive =
    selectedClass.length > 0 ||
    selectedSubject.length > 0 ||
    selectedStatus ||
    (startDate && endDate) ||
    searchQuery;

  const [classFocused, setClassFocused] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);

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

  // In the customBodyRender function of the actions column
  const handleEditClick = (event, testId) => {
    event.stopPropagation();

    // Find the test object with matching ID
    const testToEdit = tests.find((test) => test.id === testId);

    // Navigate to test creation form with the test data
    navigate(`/editTest/${testId}`, {
      state: {
        isEditMode: true,
        testData: testToEdit,
      },
    });
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // MUI DataTable columns
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false },
    },
    {
      name: "testName",
      label: "Test Name",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "testTag", // New column for Test Tag
      label: "Test Tag",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                value === "Important" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {value || "N/A"} {/* Display "N/A" if no value is provided */}
            </span>
          );
        },
      },
    },
    {
      name: "subject",
      label: "Subject",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "class",
      label: "Class",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return <div>{value}</div>;
        },
      },
    },
    {
      name: "dateOfTest",
      label: "Date of Test",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return <div style={{ whiteSpace: "nowrap" }}>{value}</div>;
        },
      },
    },
    {
      name: "schoolsSubmitted",
      label: "Submissions",
      options: {
        filter: false,
        sort: true,
        customCellClass: "custom-cell",
        setCellProps: () => ({
          style: {
            width: "120px",
            maxWidth: "120px",
            textAlign: "center",
          },
        }),
        setCellHeaderProps: () => ({
          style: {
            width: "120px",
            maxWidth: "120px",
          },
        }),
        customBodyRender: (value) => <div style={{ textAlign: "center" }}>{value}</div>,
      },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({
          style: {
            width: "250px",
            maxWidth: "250px",
          },
        }),
        setCellHeaderProps: () => ({
          style: {
            width: "250px",
            maxWidth: "250px",
            textAlign: "center",
          },
        }),
        customBodyRender: (value, tableMeta) => {
          const testId = tableMeta.rowData[0];
          const testDateObj = tableMeta.rowData[5];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const isPast = testDateObj && new Date(testDateObj) < today;

          return (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {userRole === "DISTRICT_OFFICER" && (
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  sx={{
                    borderColor: "transparent",
                    "&:hover": { borderColor: "transparent" },
                    opacity: isPast ? 0.5 : 1,
                    pointerEvents: isPast ? "none" : "auto",
                  }}
                  disabled={isPast}
                  onClick={(event) => !isPast && handleEditClick(event, testId)}
                  title={isPast ? "You can't edit past tests" : "Edit Test"}
                >
                  <img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
                  &nbsp;
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "transparent",
                  textTransform: "none",
                  color: "#2F4F4F",
                  fontWeight: 600,
                  fontFamily: "'Work Sans'",
                  "&:hover": { borderColor: "transparent" },
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  const testId = tableMeta.rowData[0];
                  const testName = tableMeta.rowData[1];
                  navigate(`/allTest/schoolSubmission/${testId}`, {
                    state: { testName: testName },
                  });
                }}
              >
                <img src={DocScanner} alt="View Report" style={{ width: "20px", height: "20px" }} />
                &nbsp; View Report
              </Button>
            </div>
          );
        },
      },
    },
  ];

  // Apply default customHeadLabelRender to all columns
  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadLabelRender = defaultCustomHeadLabelRender;
  });
  // MUI DataTable options
  const options = {
    filter: false,
    search: false,
    filterType: "dropdown",
    responsive: "standard",
    selectableRows: "none",
    download: false,
    print: false,
    viewColumns: false,
    searchPlaceholder: "Search by Test Name",
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 30],
    pagination: false,
    onColumnSortChange: (column, direction) => {
      let key = null;
      if (column === "class") key = "class";
      else if (column === "dateOfTest") key = "date";

      if (key) {
        setSortConfig({
          key: key,
          direction: direction,
        });
      }
    },
  };

  const resetFilters = () => {
    setSelectedClass([]);
    setSelectedSubject([]);
    setSelectedStatus("");
    setDateRange([null, null]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Main container with responsive adjustments */}
      <div className="main-page-wrapper px-3 sm:px-4">
        <h5 className="text-lg font-bold text-[#2F4F4F] mt-5">All Tests</h5>

        {/* Filters and Action Button - Responsive Row */}
        <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap mb-4 mt-6">
          {/* Filters Group */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search bar */}
            <div className="w-full lg:w-[360px]">
              <TextField
                variant="outlined"
                placeholder="Search by Test Name"
                size="small"
                fullWidth
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
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    height: "48px",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "12px 16px",
                  },
                }}
              />
            </div>

            {/* Class Dropdown */}
            <div style={{ width: 150 }}>
              <Autocomplete
                open={classOpen}
                onOpen={() => setClassOpen(true)}
                onClose={() => setClassOpen(false)}
                multiple
                disableCloseOnSelect
                id="class-multi-select"
                options={classOptions}
                value={selectedClass}
                onChange={(event, newValue) => {
                  setSelectedClass(newValue);
                  // Clear subject selection when class changes
                  setSelectedSubject([]);
                }}
                getOptionLabel={(option) => option}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      sx={{
                        color: "#2F4F4F",
                        "&.Mui-checked": {
                          color: "#2F4F4F",
                        },
                        padding: "2px",
                      }}
                    />
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <div
                    ref={params.InputProps.ref}
                    className="custom-class-input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "48px",
                      border: classFocused ? "2px solid #2F4F4F" : "1px solid #ccc",
                      borderRadius: "8px",
                      background: "#fff",
                      padding: "0 12px",
                      width: "100%",
                      minWidth: "100px",
                      maxWidth: "150px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "border-color 0.2s",
                    }}
                    onClick={(e) => {
                      if (e.target.classList.contains("class-clear")) return;
                      setClassOpen(true);
                    }}
                    tabIndex={0}
                    onFocus={() => setClassFocused(true)}
                    onBlur={() => setClassFocused(false)}
                  >
                    <span
                      style={{
                        color: "#2F4F4F",
                        fontWeight: 400,
                        fontSize: "14px",
                        fontFamily: "Work Sans",
                      }}
                    >
                      Class
                    </span>
                    {selectedClass.length > 0 && (
                      <span className="class-count-badge">{selectedClass.length}</span>
                    )}
                    {selectedClass.length > 0 && (
                      <span
                        className="class-clear"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass([]);
                          setSelectedSubject([]); // Clear subjects when class is cleared
                          setClassOpen(false);
                        }}
                        style={{
                          marginLeft: 8,
                          color: "#999",
                          fontSize: 18,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        title="Clear"
                      >
                        &#10005;
                      </span>
                    )}
                    <span style={{ marginLeft: "auto", color: "#2F4F4F", fontSize: 15 }}>
                      &#9662;
                    </span>
                    <input
                      type="text"
                      {...params.inputProps}
                      style={{
                        border: "none",
                        outline: "none",
                        width: 0,
                        padding: 0,
                        height: 0,
                        background: "transparent",
                        position: "absolute",
                      }}
                      tabIndex={-1}
                      readOnly
                    />
                  </div>
                )}
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-inputRoot": {
                    padding: "0 !important",
                  },
                  "& .MuiAutocomplete-tag": {
                    display: "none",
                  },
                }}
                PaperComponent={(props) => (
                  <Paper
                    {...props}
                    sx={{
                      border: "1px solid #ccc",
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.12)",
                      borderRadius: "8px",
                      width: "260px",
                      minWidth: "220px",
                      maxWidth: "420px",
                      margin: "14px 0",
                    }}
                  />
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: "none",
                    "& .MuiAutocomplete-option[aria-selected='true'], & .MuiAutocomplete-option:hover":
                      {
                        backgroundColor: "transparent !important",
                        color: "#2F4F4F",
                      },
                    "&": {
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    },
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  },
                }}
              />
            </div>

            {/* Subject Dropdown */}
            <div style={{ width: 150 }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                id="subject-multi-select"
                options={getFilteredSubjectOptions()}
                value={selectedSubject}
                onChange={(event, newValue) => setSelectedSubject(newValue)}
                getOptionLabel={(option) => option}
                open={subjectOpen}
                onOpen={() => setSubjectOpen(true)}
                onClose={() => setSubjectOpen(false)}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      sx={{
                        color: "#2F4F4F",
                        "&.Mui-checked": {
                          color: "#2F4F4F",
                        },
                        padding: "2px",
                      }}
                    />
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <div
                    ref={params.InputProps.ref}
                    className="custom-subject-input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "48px",
                      border: subjectFocused ? "2px solid #2F4F4F" : "1px solid #ccc",
                      borderRadius: "8px",
                      background: "#fff",
                      padding: "0 12px",
                      width: "100%",
                      minWidth: "100px",
                      maxWidth: "150px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "border-color 0.2s",
                    }}
                    onClick={(e) => {
                      if (e.target.classList.contains("subject-clear")) return;
                      setSubjectOpen(true);
                    }}
                    tabIndex={0}
                    onFocus={() => setSubjectFocused(true)}
                    onBlur={() => setSubjectFocused(false)}
                  >
                    <span
                      style={{
                        color: "#2F4F4F",
                        fontWeight: 400,
                        fontSize: "14px",
                        fontFamily: "Work Sans",
                      }}
                    >
                      Subject
                    </span>
                    {selectedSubject.length > 0 && (
                      <span className="subject-count-badge">{selectedSubject.length}</span>
                    )}
                    {selectedSubject.length > 0 && (
                      <span
                        className="subject-clear"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubject([]);
                          setSubjectOpen(false); // <-- yahi main fix hai
                        }}
                        style={{
                          marginLeft: 8,
                          color: "#999",
                          fontSize: 18,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        title="Clear"
                      >
                        &#10005;
                      </span>
                    )}
                    <span style={{ marginLeft: "auto", color: "#2F4F4F", fontSize: 15 }}>
                      &#9662;
                    </span>
                    <input
                      type="text"
                      {...params.inputProps}
                      style={{
                        border: "none",
                        outline: "none",
                        width: 0,
                        padding: 0,
                        height: 0,
                        background: "transparent",
                        position: "absolute",
                      }}
                      tabIndex={-1}
                      readOnly
                    />
                  </div>
                )}
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-tag": {
                    display: "none",
                  },
                }}
                PaperComponent={(props) => (
                  <Paper
                    {...props}
                    sx={{
                      border: "1px solid #ccc",
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.12)",
                      borderRadius: "8px",
                      width: "260px",
                      minWidth: "220px",
                      maxWidth: "420px",
                      margin: "14px 0",
                    }}
                  />
                )}
                ListboxProps={{
                  sx: {
                    maxHeight: "620px",
                    overflowY: "auto",
                    "& .MuiAutocomplete-option[aria-selected='true'], & .MuiAutocomplete-option:hover":
                      {
                        backgroundColor: "transparent !important",
                        color: "#2F4F4F",
                      },
                    "&": {
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    },
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  },
                }}
              />
            </div>
            {/* Date Range Picker */}
            <div className="w-full lg:w-[280px]">
              <div
                style={{
                  border: dateFocused ? "2px solid #2F4F4F" : "1px solid lightgrey",
                  borderRadius: "7px",
                  height: "48px",
                  transition: "border-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  paddingRight: 12,
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
                tabIndex={0}
                onFocus={() => setDateFocused(true)}
                onBlur={() => setDateFocused(false)}
              >
                {/* <span style={{ color: "#2F4F4F", fontWeight: 400, fontSize: 16, marginRight: 8 }}>
                  Date
                </span> */}
                <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                  <DatePicker
                    className="my-date-picker w-full"
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    shouldCloseOnSelect={false}
                    isClearable={false}
                    onChange={(dates) => setDateRange(dates)}
                    placeholderText="Date Range"
                    dateFormat="dd/MM/yyyy"
                  />
                  {(startDate || endDate) && (
                    <span
                      className="datepicker-clear"
                      onClick={() => setDateRange([null, null])}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        zIndex: 2,
                        fontSize: "14px",
                        color: "#999",
                      }}
                    >
                      &#10005;
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {isAnyFilterActive && (
              <div>
                <Tooltip title="Clear all filters" placement="top">
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
              </div>
            )}
          </div>

          {/* Create Test Button */}
          {userRole === "DISTRICT_OFFICER" && (
            <div className="shrink-0">
              <ButtonCustom
                imageName={addSymbolBtn}
                text={"Create Test"}
                onClick={handleCreateTest}
              />
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto">
          <MUIDataTable data={tableData} columns={columns} options={options} />
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
              count={Math.ceil(totalRecords / pageSize)}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              renderItem={(item) => {
                const isNextPage = item.page === currentPage + 1 && item.type === "page";

                return (
                  <PaginationItem
                    {...item}
                    sx={{
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

        {/* Toasts and loading */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          style={{ zIndex: 99999999 }}
        />
        {isLoading && <SpinnerPageOverlay isLoading={isLoading} />}
      </div>
    </ThemeProvider>
  );
}
