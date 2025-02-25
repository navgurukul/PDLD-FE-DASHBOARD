import MUIDataTable from "mui-datatables";
import editPencil from "../assets/edit.svg";
import viewReports from "../assets/document_scanner.svg";
import { Button, TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { MenuItem } from "@mui/material";

// Dummy data (adjust to match your real shape)
const testData = [
  {
    testName: "Maths_Class8",
    subject: "Health & Physical Education",
    class: "Class 8",
    dateOfTest: "15 Feb 2025",
    schoolsSubmitted: 30,
    status: "Newly Created",
  },
  {
    testName: "Maths_Class8",
    subject: "Health & Physical Education",
    class: "Class 8",
    dateOfTest: "15 Feb 2025",
    schoolsSubmitted: 30,
    status: "Newly Created",
  },
  // ... More data
];

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
    options: { filter: true, sort: true },
  },
  {
    name: "actions",
    label: "Actions",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value, tableMeta) => {
        // tableMeta.rowData has access to the row’s data if needed
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              sx={{
                borderColor: "transparent", // Removes the border color
                "&:hover": {
                  borderColor: "transparent", // Ensures hover doesn't bring back the border
                },
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
                "&:hover": {
                  borderColor: "transparent",
                },
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
        );
      },
    },
  },
];

// MUI-datatable options
const options = {
  filterType: "dropdown", // Renders filter dropdowns
  responsive: "standard", // Or 'vertical', 'simple', etc.
  selectableRows: "none", // No checkboxes
  download: false, // Hide download CSV
  print: false, // Hide print
  viewColumns: false, // Hide "View Columns" option
  searchPlaceholder: "Search by name",
  rowsPerPage: 10, // Default rows per page
  rowsPerPageOptions: [10, 20, 30], // Rows per page options
};

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
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "16px",}}>
        <h5 className="text-lg font-bold text-[#2F4F4F]  ">All Tests</h5>

        <TextField
          variant="outlined"
          placeholder="Search by name"
          size="small"
          InputProps={{
            style: { backgroundColor: "#fff", borderRadius: "8px" },
          }}
        />

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
              {/* Add filter options dynamically */}
              <MenuItem value="Option1">Option 1</MenuItem>
              <MenuItem value="Option2">Option 2</MenuItem>
            </TextField>
          ))}
        </div>
       

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
          // title={"All Tests"}
          data={testData}
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
