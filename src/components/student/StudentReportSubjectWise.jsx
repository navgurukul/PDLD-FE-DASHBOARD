import { useState } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";

const StudentReportSubjectWise = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Create custom theme for the table
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

  // Define the data for the table
  const testData = [
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 1",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 1",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 1",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 1",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 12,
      status: "Fail",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 1",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 1",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 2",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 12,
      status: "Fail",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 2",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 2",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 0,
      status: "Absent",
    },
    {
      name: "Class 8 Hindi Syllabus Mar",
      type: "Test - 2",
      date: "17 April' 25",
      maxMarks: 30,
      marksSecured: 24,
      status: "Pass",
    },
  ];

  // Custom head label render function - identical to the one in StudentAcademics
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

  // Define the columns for the table
  const columns = [
    {
      name: "name",
      label: "Name of Test",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "type",
      label: "Test Type",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "date",
      label: "Date of Test",
      options: {
        filter: true,
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
    {
      name: "marksSecured",
      label: "Marks Secured",
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
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          let statusClass = "";
          
          if (value === "Pass") {
            statusClass = "bg-green-100 text-green-800";
          } else if (value === "Fail") {
            statusClass = "bg-red-100 text-red-800";
          } else if (value === "Absent") {
            statusClass = "bg-blue-100 text-blue-800";
          }
          
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
              {value}
            </span>
          );
        },
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
  ];

  // Define options for the table
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    pagination: false,
    responsive: "standard",
    rowsPerPage: 10,
    rowsPerPageOptions: [],
    elevation: 0,
  };

  // Calculate total pages (assuming 10 items per page)
  const totalPages = Math.ceil(testData.length / 10);

  return (
    <ThemeProvider theme={theme}>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <MUIDataTable 
          data={testData} 
          columns={columns} 
          options={options} 
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          showFirstButton
          showLastButton
          shape="rounded"
          variant="outlined"
        />
      </div>
    </ThemeProvider>
  );
};

export default StudentReportSubjectWise;