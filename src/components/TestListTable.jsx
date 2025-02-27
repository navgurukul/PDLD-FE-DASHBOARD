import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import editPencil from "../assets/edit.svg";
import viewReports from "../assets/document_scanner.svg";
import { Button, TextField, MenuItem } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import apiInstance from "../../api"; // Import API instance

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

  // Default API payload
  const payload = {
    startDate: "2021-12-13",
    endDate: "12-03-2025",
    page: 1,
    pageSize: 20,
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiInstance.post("/dev/test/filter", payload);
        if (response.data && response.data.data) {
          setTests(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter tests based on search query
  const filteredTests = tests.filter((test) =>
    test.testName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map API data to match UI structure
  const tableData = filteredTests.map((test) => ({
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

  // Columns for mui-datatables
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
              backgroundColor: value === "Deadline Missed" ? "#FADBD8" : "#D4EDDA",
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
              <img src={editPencil} alt="Edit" style={{ width: "20px", height: "20px" }} />
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
              <img src={viewReports} alt="View Report" style={{ width: "20px", height: "20px" }} />
              &nbsp; View Report
            </Button>
          </div>
        ),
      },
    },
  ];

  // Datatable options
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
      <div style={{ padding: "16px" }}>
        <h5 className="text-lg font-bold text-[#2F4F4F]">All Tests</h5>

        {/* Search Bar */}
        <TextField
          variant="outlined"
          placeholder="Search by Test Name"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            style: { backgroundColor: "#fff", borderRadius: "8px", width: "250px" },
          }}
          sx={{ marginBottom: "10px" }}
        />

        {/* Filters */}
        <div className="flex gap-2 my-[10px] mx-0">
          {["Class", "Subject", "Status", "Date Range"].map((label) => (
            <TextField
              key={label}
              select
              size="small"
              variant="outlined"
              defaultValue=""
              InputProps={{
                style: { backgroundColor: "#fff", borderRadius: "8px" },
              }}
              sx={{ width: 120 }}
            >
              <MenuItem value="">{label}</MenuItem>
              <MenuItem value="Option1">Option 1</MenuItem>
              <MenuItem value="Option2">Option 2</MenuItem>
            </TextField>
          ))}
        </div>

        {/* Data Table */}
        {/* <Button
        variant="contained"
        sx={{
          backgroundColor: "#FFD700", // Yellow color
          color: "#000",
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: "600",
          "&:hover": {
            backgroundColor: "#FFC107",
          },
        }}
        // startIcon={<AddIcon />}
      >
        Create Test
      </Button> */}
        <div style={{ borderRadius: "8px" }}>
          <MUIDataTable
            //title={"Test List"}
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
