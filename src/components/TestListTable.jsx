import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import editPencil from "../assets/edit.svg";
import viewReports from "../assets/document_scanner.svg";
import { Button, TextField, MenuItem } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import apiInstance from "../../api";
import {
  CLASS_OPTIONS,
  SUBJECT_OPTIONS,
  STATUS_LABELS,
} from "../data/testData";

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
  },
});

export default function TestListTable() {
  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Track dropdown selections
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  // Keeping this for placeholder only; no changes to date-range logic
  const [selectedDateRange, setSelectedDateRange] = useState("");

  // Fetch data from API
  const fetchData = async () => {
    try {
      let url = "/dev/test/filter?startDate=01-02-2020&endDate=01-02-2026";
      if (selectedClass) {
        url += `&testClass=${selectedClass}`;
      }
      if (selectedSubject) {
        url += `&subject=${selectedSubject}`;
      }
      if (selectedStatus) { 
        url += `&status=${selectedStatus}`;
      }

      const response = await apiInstance.get(url);
      if (response.data && response.data.data) {
        setTests(response.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Re-fetch data whenever class, subject, or status changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSubject, selectedStatus]);

  // Filter tests based on search query (local filter for "testName")
  const filteredTests = tests?.filter((test) =>
    test.testName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map API data to match UI structure
  const tableData = filteredTests?.map((test) => ({
    testName: test.testName,
    subject: test.subject || "N/A",
    class: `Class ${test.testClass || "N/A"}`,
    dateOfTest: new Date(test.testDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    schoolsSubmitted: 30,
    status: getStatus(test.deadline),
    actions: "View Report",
  }));

  // Function to determine status
  function getStatus(deadline) {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    return deadlineDate < currentDate ? "Deadline Missed" : "Submitted";
  }

  // MUI DataTable columns
  const columns = [
    {
      name: "testName",
      label: "Test Name",
      options: { filter: false, sort: true },
    },
    {
      name: "subject",
      label: "Subject",
      options: { filter: true, sort: true },
    },
    {
      name: "class",
      label: "Class",
      options: { filter: true, sort: true },
    },
    {
      name: "dateOfTest",
      label: "Date of Test",
      options: { filter: true, sort: true },
    },
    {
      name: "schoolsSubmitted",
      label: "Schools Submitted (100)",
      options: { filter: false, sort: true },
    },
    {
      name: "status",
      label: "Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              color: value === "Deadline Missed" ? "#D9534F" : "#28A745",
              backgroundColor:
                value === "Deadline Missed" ? "#FADBD8" : "#D4EDDA",
              fontWeight: "bold",
            }}
          >
            {value}
          </span>
        ),
      },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRender: () => (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              sx={{
                borderColor: "transparent",
                "&:hover": { borderColor: "transparent" },
              }}
            >
              <img
                src={editPencil}
                alt="Edit"
                style={{ width: "20px", height: "20px" }}
              />
              &nbsp;
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              sx={{
                borderColor: "transparent",
                "&:hover": { borderColor: "transparent" },
              }}
            >
              <img
                src={viewReports}
                alt="View Report"
                style={{ width: "20px", height: "20px" }}
              />
              &nbsp; View Report
            </Button>
          </div>
        ),
      },
    },
  ];

  // MUI DataTable options
  const options = {
    filterType: "dropdown",
    responsive: "standard",
    selectableRows: "none",
    download: false,
    print: false,
    viewColumns: false,
    searchPlaceholder: "Search by Test Name",
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 30],
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper">
        <h5 className="text-lg font-bold text-[#2F4F4F]">All Tests</h5>

        {/* Search Bar */}
        <TextField
          variant="outlined"
          placeholder="Search by Test Name"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            style: {
              backgroundColor: "#fff",
              borderRadius: "8px",
              width: "420px",
              height: "48px",
            },
          }}
          sx={{ marginBottom: "10px" }}
        />

        {/* Filters */}
        <div className="flex gap-2 my-[10px] mx-0">
          {/* Class Dropdown */}
          <TextField
            select
            size="small"
            variant="outlined"
            label="Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            sx={{
              width: 150,
              "& .MuiSelect-select": {
                color: "#2F4F4F",
                fontWeight: "600",
                padding: "12px 16px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
              },
            }}
          >
            <MenuItem value="">Class</MenuItem>
            {CLASS_OPTIONS.map((option) => (
              <MenuItem
                key={option}
                value={parseInt(option.replace("Class ", ""), 10)}
              >
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Subject Dropdown */}
          <TextField
            select
            size="small"
            variant="outlined"
            label="Subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            sx={{
              width: 150,
              "& .MuiSelect-select": {
                color: "#2F4F4F",
                fontWeight: "600",
                padding: "12px 16px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
              },
            }}
          >
            <MenuItem value="">Subject</MenuItem>
            {SUBJECT_OPTIONS.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </TextField>

          {/* Status Dropdown */}
          <TextField
            select
            size="small"
            variant="outlined"
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            sx={{
              width: 150,
              "& .MuiSelect-select": {
                color: "#2F4F4F",
                fontWeight: "600",
                padding: "12px 16px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
              },
            }}
          >
            <MenuItem value="">Status</MenuItem>
            {Object.keys(STATUS_LABELS).map((status) => (
              <MenuItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Range Dropdown (placeholder) */}
          <TextField
            select
            size="small"
            variant="outlined"
            label="Date Range"
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            sx={{
              width: 150,
              "& .MuiSelect-select": {
                color: "#2F4F4F",
                fontWeight: "600",
                padding: "12px 16px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
              },
            }}
          >
            <MenuItem value="">Date Range</MenuItem>
            <MenuItem value="Option1">Option 1</MenuItem>
            <MenuItem value="Option2">Option 2</MenuItem>
          </TextField>
        </div>

        {/* Data Table */}
        <div style={{ borderRadius: "8px" }}>
          <MUIDataTable
            data={tableData}
            columns={columns}
            options={options}
            sx={{
              "& .MuiPaper-root": {
                boxShadow: "none",
              },
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
