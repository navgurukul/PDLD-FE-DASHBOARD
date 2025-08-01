import { useState, useMemo, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import StudentReportSubjectWise from "./StudentReportSubjectWise";

//  Create theme matching the TestListTable styling
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
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          color: "#2F4F4F",
          "&.custom-cell": {
            width: "0px",
          },
        },
        head: {
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "left",
          textTransform: "none",
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

const StudentAcademics = ({
  studentId,
  schoolId,
  academicData,
  onTabChange, // Add this prop to communicate with parent
}) => {
  // State for filter selections
  const [syllabusMonth, setSyllabusMonth] = useState("All");
  const [maxMarks, setMaxMarks] = useState("All");
  const [status, setStatus] = useState("All");
  const [syllabusSubject, setSyllabusSubject] = useState("All"); // New subject filter for subjectwise
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
  const [syllabusSubjectOptions, setSyllabusSubjectOptions] = useState([]); // Separate for syllabus
  const [remedialSubjectOptions, setRemedialSubjectOptions] = useState([]); // Separate for remedial
  const [testTypeOptions, setTestTypeOptions] = useState([]);

  // Function to determine grade based on percentage
  const getGrade = (percentage) => {
    if (percentage >= 85) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 45) return "C";
    if (percentage >= 33) return "D";
    return "E";
  };
  // Format percentage without % sign for display
  const formatPercentage = (percentage) => {
    return Math.round(percentage);
  };

  // Organize data when academicData changes
  useEffect(() => {
    if (!academicData || !academicData.months) return;

    // Arrays to hold our processed data
    const processedSyllabusData = [];
    const processedRemedialData = [];

    // Sets to collect unique values for filters
    const months = new Set();
    const syllabusSubjects = new Set(); // Separate for syllabus subjects
    const remedialSubjects = new Set(); // Separate for remedial subjects
    const maxMarks = new Set();
    const statusValues = new Set(); // Collect actual status values
    const testTypes = new Set();

    // Track test numbers to create sequential test names (Test - 1, Test - 2, etc.)
    let testNumber = 1;

    // Process data for each month
    academicData.months.forEach((monthData, monthIndex) => {
      // Extract month names from tests for filter options
      monthData.tests.forEach((test) => {
        const testDate = new Date(test.testDate);
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        months.add(monthNames[testDate.getMonth()]);

        // Add subject to appropriate set based on test type
        if (test.subject) {
          const subjectName = test.subject === "Maths" ? "Mathematics" : test.subject;
          if (test.testType === "SYLLABUS") {
            syllabusSubjects.add(subjectName);
            
            // Collect status values from syllabus tests for dropdown options
            let testStatus = "Absent";
            if (test.score !== null) {
              testStatus = test.passStatus ? "Pass" : "Fail";
            }
            statusValues.add(testStatus);
          } else if (test.testType === "REMEDIAL") {
            remedialSubjects.add(subjectName);
          }
        }
      });

      // Group syllabus tests by month
      const syllabusTests = monthData.tests.filter((test) => test.testType === "SYLLABUS");

      if (syllabusTests.length > 0) {
        // Group tests by test tag to create aggregate entries
        const testsByTag = {};

        syllabusTests.forEach((test) => {
          const testTag = test.testTag || "Monthly";
          if (!testsByTag[testTag]) {
            testsByTag[testTag] = {
              tests: [],
              subjectScores: {},
              totalScore: 0,
              totalMaxScore: 0,
            };
          }

          testsByTag[testTag].tests.push(test);

          // Process subject scores
          const subjectName = test.subject === "Maths" ? "Mathematics" : test.subject;
          if (subjectName) {
            testsByTag[testTag].subjectScores[subjectName] = test.score;

            // Update total scores for percentage calculation
            if (test.score !== null && test.maxScore !== null) {
              testsByTag[testTag].totalScore += test.score;
              testsByTag[testTag].totalMaxScore += test.maxScore;
            }
          }

          // Add maxScore to options
          if (test.maxScore !== null) {
            maxMarks.add(test.maxScore);
          }
        });

        // Create test entries for each tag group
        Object.entries(testsByTag).forEach(([tag, data], tagIndex) => {
          // Calculate percentage and determine grade
          const percentage =
            data.totalMaxScore > 0 ? Math.round((data.totalScore / data.totalMaxScore) * 100) : 0;

          // Create a test entry
          const testEntry = {
            testType: tag,
            maxMarks: data.tests[0]?.maxScore || 100,
            overallPercentage: formatPercentage(percentage),
            grade: getGrade(percentage),
            ...data.subjectScores, // Add subject scores dynamically
          };

          processedSyllabusData.push(testEntry);
          testNumber++;
        });
      }

      // Process remedial tests
      const remedialTests = monthData.tests.filter((test) => test.testType === "REMEDIAL");

      remedialTests.forEach((test) => {
        // Extract month from test date
        const testDate = new Date(test.testDate);
        const day = testDate.getDate();
        const month = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ][testDate.getMonth()];
        const year = testDate.getFullYear().toString().substr(-2); // last 2 digits
        const formattedDate = `${day} ${month}' ${year}`;

        processedRemedialData.push({
          testName: test.testName || `Class ${test.class} ${test.subject} Remedial ${month}`,
          examDate: formattedDate,
          grade: test.grade || "N/A",
        });
      });
    });

    // Update state with processed data
    setSyllabusData(processedSyllabusData);
    setRemedialData(processedRemedialData);
    setMonthOptions([...months]);
    setMaxMarksOptions([...maxMarks].filter((mark) => mark !== null));
    setSyllabusSubjectOptions([...syllabusSubjects]); // Set syllabus subjects
    setRemedialSubjectOptions([...remedialSubjects]); // Set remedial subjects
    setTestTypeOptions([...testTypes]);
    setStatusOptions([...statusValues]); // Set actual status values (Pass, Fail, Absent)
  }, [academicData]);

  // Filter data based on selections
  const filteredSyllabusData = useMemo(() => {
    return syllabusData.filter(
      (item) =>
        (maxMarks === "All" || item.maxMarks === parseInt(maxMarks)) &&
        (status === "All" || item.status === status)
    );
  }, [syllabusData, maxMarks, status]);

  // Filter data based on selections
  const filteredRemedialData = useMemo(() => {
    return remedialData.filter(
      (item) => {
        // For month filtering, convert full month name to short form
        let monthMatch = true;
        if (remedialMonth !== "All") {
          const shortMonthMap = {
            "January": "Jan",
            "February": "Feb", 
            "March": "Mar",
            "April": "Apr",
            "May": "May",
            "June": "Jun",
            "July": "Jul",
            "August": "Aug",
            "September": "Sep",
            "October": "Oct",
            "November": "Nov",
            "December": "Dec"
          };
          const shortMonth = shortMonthMap[remedialMonth];
          monthMatch = shortMonth ? item.examDate.includes(shortMonth) : false;
        }

        return monthMatch && 
               (subject === "All" || item.testName.toLowerCase().includes(subject.toLowerCase()));
      }
    );
  }, [remedialData, remedialMonth, subject]);

  // NEW: Get current page count for each view
  const getCurrentPageCount = () => {
    if (syllabusView === "aggregate") {
      return Math.min(10, filteredSyllabusData.length); // Assuming 10 items per page
    } else {
      // For subjectwise, we need to calculate based on the StudentReportSubjectWise component
      // This might need adjustment based on how StudentReportSubjectWise works
      return Math.min(10, syllabusData.length);
    }
  };

  const getTotalRecords = () => {
    if (syllabusView === "aggregate") {
      return filteredSyllabusData.length;
    } else {
      return syllabusData.length; // For subjectwise view
    }
  };

  // NEW: Notify parent component when tab changes or data updates
  useEffect(() => {
    if (onTabChange) {
      const tableType = syllabusView === "aggregate" ? "aggregate" : "subjectwise";
      onTabChange(tableType, {
        count: getCurrentPageCount(),
        data: syllabusView === "aggregate" ? filteredSyllabusData : syllabusData,
      });
    }
  }, [syllabusView, filteredSyllabusData, syllabusData, onTabChange]);

  // Reset all filters
  const resetSyllabusFilters = () => {
    setSyllabusMonth("All");
    setMaxMarks("All");
    setStatus("All");
    setSyllabusSubject("All"); // Reset subject filter
  };
  const isAnySyllabusFilterActive =
    syllabusMonth !== "All" || maxMarks !== "All" || status !== "All" || syllabusSubject !== "All";

  const resetRemedialFilters = () => {
    setRemedialMonth("All");
    setSubject("All");
  };

  const isAnyRemedialFilterActive = remedialMonth !== "All" || subject !== "All";

  const defaultCustomHeadLabelRender = (columnMeta) => (
    <span
      style={{
        color: "#2F4F4F",
        fontFamily: "'Work Sans'",
        fontWeight: 600,
        fontSize: "14px",
        fontStyle: "normal",
        textAlign: "left",
        display: "flex",
        justifyContent: "flex-start",
        textTransform: "none",
      }}
    >
      {columnMeta.label}
    </span>
  );

  // Dynamically generate columns for syllabus table based on available subjects
  const getSubjectColumns = () => {
    return Array.from(syllabusSubjectOptions).map((subject) => ({
      name: subject,
      label: subject,
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: { textAlign: "center" },
        }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "right", width: "30%" }}>
            {value === undefined ||
            value === null ||
            value === "" ||
            (typeof value === "number" && isNaN(value))
              ? "-"
              : value}
          </span>
        ),
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    }));
  };

  // Basic columns for the syllabus table
  const baseColumns = [
    {
      name: "testType",
      label: "Test Type",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "left", width: "100%" }}>{value}</span>
        ),
      },
    },
    {
      name: "maxMarks",
      label: "Max Marks",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
        setCellProps: () => ({ style: { textAlign: "right" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "center", width: "50%" }}>{value}</span>
        ),
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
        setCellProps: () => ({
          style: {
            textAlign: "left",
            paddingLeft: "26px",
          },
        }),
        customBodyRender: (value) => {
          // Display the percentage value
          const percentage = parseInt(value);
          const style = {
            display: "block",
            textAlign: "center",
            width: "50%",
          };

          if (percentage < 40) {
            return (
              <span className="text-red-500 font-medium" style={style}>
                {value}%
              </span>
            );
          }
          return <span style={style}>{value}%</span>;
        },
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "grade",
      label: "Grade",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span
            style={{
              display: "block",
              textAlign: "left",
              width: "100%",
              color: "#2F4F4F",
              fontWeight: 400, // normal
            }}
          >
            {value}
          </span>
        ),
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
  ];

  // Column definitions for Remedial MUIDataTable
  const remedialColumns = [
    {
      name: "testName",
      label: "Name of Test",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "left", width: "100%" }}>{value}</span>
        ),
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "examDate",
      label: "Date Of Exam",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "left", width: "100%" }}>{value}</span>
        ),
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "grade",
      label: "Grade",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => {
          // Format the grade to proper title case
          const formattedGrade = value ? value.replace(/_/g, " ") : "-";
          const titleCaseGrade = formattedGrade.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <span
              className="px-3 py-1 bg-[#E9F3E9] text-[#228B22]"
              style={{
                display: "block",
                textAlign: "center",
                minWidth: 80,
                maxWidth: 120,
                width: "auto",
                fontSize: "12px",
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 400,
              }}
            >
              {titleCaseGrade}
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
    tableBodyHeight: "100%",
    tableBodyMaxHeight: "100%",
    setTableProps: () => ({
      style: {
        tableLayout: "auto",
        marginRight: "16px", // Add right margin to align with Figma design
      },
    }),
    customTableBodyCellStyle: () => ({
      textAlign: "left",
    }),
  };

  // NEW: Updated handleToggleChange to notify parent
  const handleToggleChange = (event, newView) => {
    if (newView !== null) {
      setSyllabusView(newView);

      // Immediately notify parent of the change
      if (onTabChange) {
        const tableType = newView === "aggregate" ? "aggregate" : "subjectwise";
        onTabChange(tableType, {
          count:
            newView === "aggregate"
              ? Math.min(10, filteredSyllabusData.length)
              : Math.min(10, syllabusData.length),
          data: newView === "aggregate" ? filteredSyllabusData : syllabusData,
        });
      }
    }
  };

  // Override MUI styles for cells
  const overrideStyles = `
    .MuiTableCell-root {
      text-align: left !important;
    }
    .MuiTableCell-body > div {
      text-align: center !important;
      justify-content: flex-start !important;
    }
      .MuiTable-root .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root {
    border-bottom: none !important;
  }
  `;

  return (
    <ThemeProvider theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: overrideStyles }} />
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
            syllabusData.length === 0 ? (
              <div
                className="text-[#2F4F4F]"
                style={{
                  fontFamily: "Work Sans",
                  fontWeight: 400,
                  fontSize: "18px",
                  textAlign: "left",
                }}
              >
                No syllabus assessments have been conducted for this student yet.
              </div>
            ) : (
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
            )
          ) : syllabusView === "subjectwise" ? (
            syllabusData.length === 0 ? (
              <div
                className="text-[#2F4F4F]"
                style={{
                  fontFamily: "Work Sans",
                  fontWeight: 400,
                  fontSize: "18px",
                  textAlign: "left",
                }}
              >
                No syllabus assessments have been conducted for this student yet.
              </div>
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

                  {/* Subject Dropdown */}
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel id="syllabus-subject-select-label">Subject</InputLabel>
                    <Select
                      labelId="syllabus-subject-select-label"
                      id="syllabus-subject-select"
                      value={syllabusSubject}
                      label="Subject"
                      onChange={(e) => setSyllabusSubject(e.target.value)}
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
                      {syllabusSubjectOptions.map((subjectOption) => (
                        <MenuItem key={subjectOption} value={subjectOption}>
                          {subjectOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/*  Clear Filters  for the Syllabus*/}
                  {isAnySyllabusFilterActive && (
                    <Button
                      variant="text"
                      onClick={resetSyllabusFilters}
                      sx={{
                        color: "#2F4F4F",
                        fontWeight: 600,
                        fontSize: 16,
                        textTransform: "none",
                        height: "40px",
                        padding: "0 12px",
                        background: "transparent",
                        "&:hover": {
                          background: "#f5f5f5",
                        },
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Subject-wise view using the StudentReportSubjectWise component */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <StudentReportSubjectWise
                    academicData={academicData}
                    syllabusMonth={syllabusMonth}
                    maxMarks={maxMarks}
                    status={status}
                    subject={syllabusSubject}
                  />
                </div>
              </>
            )
          ) : null}
        </div>

        {/* Remedial Test Section */}
        <div>
          <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Remedial Test</h5>

          {filteredRemedialData.length === 0 ? (
            <div
              className="text-[#2F4F4F]"
              style={{
                fontFamily: "Work Sans",
                fontWeight: 400,
                fontSize: "18px",
                textAlign: "left",
              }}
            >
              No remedial assessments have been conducted for this student yet
            </div>
          ) : (
            <>
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
                    {remedialSubjectOptions.map((subjectOption) => (
                      <MenuItem key={subjectOption} value={subjectOption}>
                        {subjectOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Clear Filters */}
                {isAnyRemedialFilterActive && (
                  <Button
                    variant="text"
                    onClick={resetRemedialFilters}
                    sx={{
                      color: "#2F4F4F",
                      fontWeight: 600,
                      fontSize: 16,
                      textTransform: "none",
                      height: "40px",
                      padding: "0 12px",
                      background: "transparent",
                      "&:hover": {
                        background: "#f5f5f5",
                      },
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Remedial Test MUIDataTable */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <MUIDataTable
                  data={filteredRemedialData}
                  columns={remedialColumns}
                  options={options}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default StudentAcademics;
