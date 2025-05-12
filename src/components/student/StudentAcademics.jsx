import { useState, useMemo, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import StudentReportSubjectWise from "./StudentReportSubjectWise";

// Create theme matching the TestListTable styling
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
  },
});

const StudentAcademics = ({ studentId, schoolId, academicData }) => {
  // State for filter selections
  const [syllabusMonth, setSyllabusMonth] = useState("All");
  const [maxMarks, setMaxMarks] = useState("All");
  const [status, setStatus] = useState("All");
  const [remedialMonth, setRemedialMonth] = useState("All");
  const [subject, setSubject] = useState("All");

  // Toggle state for syllabus test view
  const [syllabusView, setSyllabusView] = useState("aggregate");

  // Transform the academic data into usable formats for our tables
  const [syllabusData, setSyllabusData] = useState([]);
  const [remedialData, setRemedialData] = useState([]);
  const [monthOptions, setMonthOptions] = useState([]);
  const [maxMarksOptions, setMaxMarksOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);

  // Organize data when academicData changes
  useEffect(() => {
    if (!academicData || !academicData.months) return;

    // Extract all months for filter options
    const months = academicData.months.map((month) => month.month);
    setMonthOptions([...new Set(months)]);

    const processedSyllabusData = [];
    const processedRemedialData = [];
    const allSubjects = new Set();
    const allMaxMarks = new Set();

    // Process data for each month
    academicData.months.forEach((monthData) => {
      // Group syllabus tests by subject for this month
      const syllabusTests = monthData.tests.filter((test) => test.testType === "SYLLABUS");
      const remedialTests = monthData.tests.filter((test) => test.testType === "REMEDIAL");

      // If we have syllabus tests for this month, add them to the table data
      if (syllabusTests.length > 0) {
        // Collect unique subjects and max scores
        const subjectScores = {};
        let totalScore = 0;
        let totalMaxScore = 0;
        let maxScoreForMonth = 0;

        syllabusTests.forEach((test) => {
          if (!subjectScores[test.subject]) {
            subjectScores[test.subject] = test.score;
            allSubjects.add(test.subject);
            allMaxMarks.add(test.maxScore);
            if (test.maxScore > maxScoreForMonth) {
              maxScoreForMonth = test.maxScore;
            }
          }
          totalScore += test.score || 0;
          totalMaxScore += test.maxScore || 0;
        });

        // Calculate overall percentage
        const overallPercentage =
          totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

        // Determine status based on percentage
        let status = "Needs Improvement";
        if (overallPercentage >= 75) {
          status = "Excellent";
        } else if (overallPercentage >= 60) {
          status = "Satisfactory";
        }

        // Create a row for the syllabus table
        const syllabusRow = {
          month: monthData.month,
          maxMarks: maxScoreForMonth,
          ...subjectScores,
          overallPercentage: `${overallPercentage}%`,
          status: status,
        };

        processedSyllabusData.push(syllabusRow);
      }

      // Process remedial tests
      remedialTests.forEach((test) => {
        allSubjects.add(test.subject);
        processedRemedialData.push({
          month: monthData.month,
          subject: test.subject,
          testType: "Assessment",
          grade: test.grade,
        });
      });
    });

    // Update state with processed data
    setSyllabusData(processedSyllabusData);
    setRemedialData(processedRemedialData);
    setMaxMarksOptions([...allMaxMarks]);
    setSubjectOptions([...allSubjects]);
    setStatusOptions(["Excellent", "Satisfactory", "Needs Improvement"]);
  }, [academicData]);

  // Filter data based on selections
  const filteredSyllabusData = useMemo(() => {
    return syllabusData.filter(
      (item) =>
        (syllabusMonth === "All" || item.month === syllabusMonth) &&
        (maxMarks === "All" || item.maxMarks === parseInt(maxMarks)) &&
        (status === "All" || item.status === status)
    );
  }, [syllabusData, syllabusMonth, maxMarks, status]);

  const filteredRemedialData = useMemo(() => {
    return remedialData.filter(
      (item) =>
        (remedialMonth === "All" || item.month === remedialMonth) &&
        (subject === "All" || item.subject === subject)
    );
  }, [remedialData, remedialMonth, subject]);

  // Reset all filters
  const resetSyllabusFilters = () => {
    setSyllabusMonth("All");
    setMaxMarks("All");
    setStatus("All");
  };

  const resetRemedialFilters = () => {
    setRemedialMonth("All");
    setSubject("All");
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

  // Dynamically generate columns for syllabus table based on available subjects
  const getSubjectColumns = () => {
    return Array.from(subjectOptions).map((subject) => ({
      name: subject,
      label: subject,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          // Highlight low scores (less than 40% of max marks)
          const isLowScore = value && value < 40;
          return (
            <span className={isLowScore ? "text-red-500 font-medium" : ""}>{value || "-"}</span>
          );
        },
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    }));
  };

  // Basic columns for the syllabus table
  const baseColumns = [
    {
      name: "month",
      label: "Month",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "maxMarks",
      label: "Max Marks",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
  ];

  // Append subject columns dynamically
  const subjectColumns = getSubjectColumns();

  // Final columns for the syllabus table
  const syllabusColumns = [
    ...baseColumns,
    ...subjectColumns,
    {
      name: "overallPercentage",
      label: "Overall %",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "status",
      label: "Status",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                value === "Excellent"
                  ? "bg-green-100 text-green-800"
                  : value === "Satisfactory"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value}
            </span>
          );
        },
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
  ];

  // Column definitions for Remedial MUIDataTable
  const remedialColumns = [
    {
      name: "month",
      label: "Month",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "subject",
      label: "Subject",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "testType",
      label: "Test Type",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "grade",
      label: "Grade",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {value ? value.replace(/_/g, " ") : "-"}
            </span>
          );
        },
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
  ];

  // Options for MUIDataTable
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    elevation: 0,
    pagination: false,
    responsive: "standard",
  };

  const handleToggleChange = (event, newView) => {
    if (newView !== null) {
      setSyllabusView(newView);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="w-full mx-auto font-sans">
        {/* Syllabus Test Section */}
        <div className="mb-8">
          <h5 className="text-lg font-bold text-[#2F4F4F] mb-2">Syllabus Test</h5>

          {/* Toggle Button Group for Syllabus Test Views */}
          <div className="mb-6">
            <ToggleButtonGroup
              value={syllabusView}
              exclusive
              onChange={handleToggleChange}
              aria-label="syllabus test view"
              sx={{
                width: "100%", // Make the group take full width
                height: "40px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #E0E5E5",
              }}
            >
              <ToggleButton
                value="aggregate"
                aria-label="aggregate view"
                sx={{
                  width: "50%", // Make each button take exactly half the width
                  textTransform: "none",
                  fontFamily: "Karla, sans-serif",
                  fontSize: "14px",
                  fontWeight: (theme) => (syllabusView === "aggregate" ? 600 : 400),
                  backgroundColor: (theme) => (syllabusView === "aggregate" ? "#E0E5E5" : "white"),
                }}
              >
                Aggregate
              </ToggleButton>
              <ToggleButton
                value="subjectwise"
                aria-label="subjectwise view"
                sx={{
                  width: "50%", // Make each button take exactly half the width
                  textTransform: "none",
                  fontFamily: "Karla, sans-serif",
                  fontSize: "14px",
                  fontWeight: (theme) => (syllabusView === "subjectwise" ? 600 : 400),
                  backgroundColor: (theme) =>
                    syllabusView === "subjectwise" ? "#E0E5E5" : "white",
                }}
              >
                Subjectwise
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {syllabusView === "aggregate" ? (
            <>
              {/* Syllabus Test MUIDataTable */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <MUIDataTable
                  data={filteredSyllabusData}
                  columns={syllabusColumns}
                  options={options}
                />
              </div>
            </>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                {/* Month Dropdown */}
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="month-select-label">Month</InputLabel>
                  <Select
                    labelId="month-select-label"
                    id="month-select"
                    value={syllabusMonth}
                    label="Month"
                    onChange={(e) => setSyllabusMonth(e.target.value)}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      height: "40px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <MenuItem value="All">All Months</MenuItem>
                    {monthOptions.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Max Marks Dropdown */}
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="marks-select-label">Max Marks</InputLabel>
                  <Select
                    labelId="marks-select-label"
                    id="marks-select"
                    value={maxMarks}
                    label="Max Marks"
                    onChange={(e) => setMaxMarks(e.target.value)}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      height: "40px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <MenuItem value="All">All Marks</MenuItem>
                    {maxMarksOptions.map((marks) => (
                      <MenuItem key={marks} value={marks.toString()}>
                        {marks}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Status Dropdown */}
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      height: "40px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    {statusOptions.map((statusOption) => (
                      <MenuItem key={statusOption} value={statusOption}>
                        {statusOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Reset Button */}
                <Button
                  variant="outlined"
                  onClick={resetSyllabusFilters}
                  sx={{
                    borderRadius: "8px",
                    height: "40px",
                    borderColor: "#2F4F4F",
                    color: "#2F4F4F",
                    "&:hover": {
                      borderColor: "#2F4F4F",
                      backgroundColor: "rgba(47, 79, 79, 0.1)",
                    },
                  }}
                >
                  Reset
                </Button>
              </div>

              {/* Syllabus Test MUIDataTable */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <StudentReportSubjectWise />
              </div>
            </>
          )}
        </div>

        {/* Remedial Test Section */}
        <div>
          <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Remedial Test</h5>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Month Dropdown */}
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="remedial-month-select-label">Month</InputLabel>
              <Select
                labelId="remedial-month-select-label"
                id="remedial-month-select"
                value={remedialMonth}
                label="Month"
                onChange={(e) => setRemedialMonth(e.target.value)}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  height: "40px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "8px",
                  },
                }}
              >
                <MenuItem value="All">All Months</MenuItem>
                {monthOptions.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subject Dropdown */}
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                id="subject-select"
                value={subject}
                label="Subject"
                onChange={(e) => setSubject(e.target.value)}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  height: "40px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "8px",
                  },
                }}
              >
                <MenuItem value="All">All Subjects</MenuItem>
                {subjectOptions.map((subjectOption) => (
                  <MenuItem key={subjectOption} value={subjectOption}>
                    {subjectOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Reset Button */}
            <Button
              variant="outlined"
              onClick={resetRemedialFilters}
              sx={{
                borderRadius: "8px",
                height: "40px",
                borderColor: "#2F4F4F",
                color: "#2F4F4F",
                "&:hover": {
                  borderColor: "#2F4F4F",
                  backgroundColor: "rgba(47, 79, 79, 0.1)",
                },
              }}
            >
              Reset
            </Button>
          </div>

          {/* Remedial Test MUIDataTable */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <MUIDataTable data={filteredRemedialData} columns={remedialColumns} options={options} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default StudentAcademics;
