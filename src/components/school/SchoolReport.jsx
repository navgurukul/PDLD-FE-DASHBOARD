import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../components/ButtonCustom";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";

// Internal styles
const styles = {
  lowScore: {
    color: "#ff0000",
    fontWeight: "bold",
  },
  noteText: {
    marginTop: "16px",
    fontSize: "14px",
  },
  tableContainer: {
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  },
};

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
          padding: "16px 12px !important",
        },
        head: {
          fontSize: "14px",
          textAlign: "left",
          backgroundColor: "#f9f9f9 !important",
          fontWeight: "bold !important",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(47, 79, 79, 0.1) !important",
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

export default function SchoolReport() {
  const [reports, setReports] = useState([]);
  const [selectedClass, setSelectedClass] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Class options for the dropdown
  const CLASS_OPTIONS = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

  // Mock data to simulate the API response
  const mockData = {
    "Class 1": [
      {
        name: "Test - 1",
        students: 38,
        maxMarks: 30,
        subjects: {
          hindi: 24,
          english: 23,
          mathematics: 25,
          science: 27,
          socialStudies: 29,
          healthCare: 29,
          it: 29,
        },
      },
      {
        name: "Test - 1",
        students: 38,
        maxMarks: 30,
        subjects: {
          hindi: 24,
          english: 23,
          mathematics: 25,
          science: 27,
          socialStudies: 29,
          healthCare: 29,
          it: 29,
        },
      },
      {
        name: "Test - 1",
        students: 38,
        maxMarks: 50,
        subjects: {
          hindi: 24,
          english: 9,
          mathematics: 25,
          science: 12,
          socialStudies: 29,
          healthCare: 29,
          it: 29,
        },
      },
      {
        name: "Test - 1",
        students: 38,
        maxMarks: 30,
        subjects: {
          hindi: 24,
          english: 23,
          mathematics: 25,
          science: 27,
          socialStudies: 29,
          healthCare: 29,
          it: 29,
        },
      },
      {
        name: "Test - 1",
        students: 38,
        maxMarks: 30,
        subjects: {
          hindi: 24,
          english: 23,
          mathematics: 25,
          science: 27,
          socialStudies: 28,
          healthCare: 29,
          it: 29,
        },
      },
    ],
    "Class 2": [],
    "Class 3": [],
    "Class 4": [],
    "Class 5": [],
  };

  // Function to fetch report data (simulated)
  const fetchReportData = async (classVal) => {
    setIsLoading(true);
    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReports(mockData[classVal] || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data when selected class changes
  useEffect(() => {
    fetchReportData(`Class ${selectedClass}`);
  }, [selectedClass]);

  // Handle class change
  const handleClassChange = (e) => {
    setSelectedClass(parseInt(e.target.value, 10));
  };

  // Handle report download
  const handleDownloadReport = () => {
    // This would typically trigger a download API call
    // For now we'll just log a message
    console.log(`Downloading report for Class ${selectedClass}`);
    alert(`Report for Class ${selectedClass} will be downloaded`);
  };

  // Format the data for MUIDataTable
  const tableData = reports.map((report) => [
    report.name,
    report.students,
    report.maxMarks,
    report.subjects.hindi,
    report.subjects.english,
    report.subjects.mathematics,
    report.subjects.science,
    report.subjects.socialStudies,
    report.subjects.healthCare,
    report.subjects.it,
  ]);

  const defaultCustomHeadRender = (columnMeta) => {
    return (
      <th
        style={{
          color: "#2F4F4F",
          fontFamily: "'Work Sans'",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        {columnMeta.label}
      </th>
    );
  };

  // Define columns for MUIDataTable
  const columns = [
    {
      name: "Name of Exam",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "No. Of Students",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "Max Marks",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "Hindi",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return (
            <div style={parseInt(value) < 15 ? styles.lowScore : null}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "English",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return (
            <div style={parseInt(value) < 15 ? styles.lowScore : null}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "Mathematics",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "Science",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return (
            <div style={parseInt(value) < 15 ? styles.lowScore : null}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "Social Studies",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "Health Care",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "IT",
      options: {
        filter: false,
        sort: true,
      },
    },
  ];

  // Apply default customHeadLabelRender to all columns
  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadRender = defaultCustomHeadRender;
  });

  // MUIDataTable options
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    pagination: false,
    responsive: "standard",
    fixedHeader: true,
    tableBodyHeight: "100%",
    tableBodyMaxHeight: "100%",
    setTableProps: () => ({
      style: {
        width: "100%",
      },
    }),
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        {/* Filters and Action Button Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          {/* Class Dropdown */}
          <div className="w-full sm:w-auto mb-3 sm:mb-0">
            <FormControl
              sx={{
                height: "48px",
                display: "flex",
                width: { xs: "100%", sm: "150px" },
                minWidth: "120px",
              }}
            >
              <InputLabel
                id="class-select-label"
                sx={{
                  transform: "translate(14px, 14px) scale(1)",
                  "&.Mui-focused, &.MuiFormLabel-filled": {
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
                }}
              >
                Class
              </InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                label="Class"
                onChange={handleClassChange}
                sx={{
                  height: "100%",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
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
                {CLASS_OPTIONS.map((option, index) => (
                  <MenuItem key={option} value={index + 1}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Download Report Button */}
          <ButtonCustom
            text={"Download Report"}
            onClick={handleDownloadReport}
            btnWidth={200}
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto" style={styles.tableContainer}>
          <MUIDataTable data={tableData} columns={columns} options={options} />
        </div>

        {/* Note text */}
        <div style={styles.noteText}>
          <span className="font-bold">Note:</span> These marks represent the
          subject-wise average score of the class, calculated as: (Total Marks
          Obtained in the Subject + Number of Students Appeared)
        </div>

        {/* Loading Overlay */}
        {isLoading && <SpinnerPageOverlay isLoading={isLoading} />}
      </div>
    </ThemeProvider>
  );
}
