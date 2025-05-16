//school report inside tab
import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ButtonCustom from "../../components/ButtonCustom";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import api from "../../../api"; 

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
    // Change the highlight color from blue to "Text Primary" color style.
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
          padding: "16px 12px !important",
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
  const [availableClasses, setAvailableClasses] = useState([]);
  const navigate = useNavigate();

  // Extract school ID from URL
  const { schoolId } = useParams();

  // Function to fetch all classes for the school
  const fetchAvailableClasses = async () => {
    try {
      // Get all available classes from the API data
      const result = await api.get(`/report/classes/${schoolId}`);
      
      if (result.data && result.data.success) {
        // Extract unique class values and format for dropdown
        const classes = result.data.data || [];
        const uniqueClasses = [...new Set(classes.map(item => item.testClass))];
        
        // Format classes for dropdown
        const formattedClasses = uniqueClasses
          .filter(cls => cls) // Filter out any null/undefined values
          .sort((a, b) => parseInt(a) - parseInt(b)) // Sort numerically
          .map(cls => ({
            value: cls,
            label: `Class ${cls}`
          }));
        
        setAvailableClasses(formattedClasses);
        
        // Set first class as default if available
        if (formattedClasses.length > 0 && !selectedClass) {
          setSelectedClass(parseInt(formattedClasses[0].value, 10));
        }
      } else {
        console.error("API Error:", result.data?.error);
        setAvailableClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setAvailableClasses([]);
    }
  };

  // Function to fetch report data from API
  const fetchReportData = async (classNumber) => {
    setIsLoading(true);
    try {
      // Use the API instance with the schoolId from URL params
      const result = await api.get(`/report/class/${schoolId}/${classNumber}`);

      if (result.data && result.data.success) {
        setReports(result.data.data || []);
        
        // If we don't have available classes yet, extract them from this response
        if (availableClasses.length === 0) {
          const uniqueClasses = [...new Set(result.data.data.map(item => item.testClass))];
          const formattedClasses = uniqueClasses
            .filter(cls => cls)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(cls => ({
              value: cls,
              label: `Class ${cls}`
            }));
            
          if (formattedClasses.length > 0) {
            setAvailableClasses(formattedClasses);
          }
        }
      } else {
        console.error("API Error:", result.data?.error);
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available classes when component mounts
  useEffect(() => {
    if (schoolId) {
      fetchAvailableClasses();
    }
  }, [schoolId]);

  // Re-fetch data when selected class changes or when schoolId changes
  useEffect(() => {
    if (schoolId) {
      fetchReportData(selectedClass);
    }
  }, [selectedClass, schoolId]);

  // Handle class change
  const handleClassChange = (e) => {
    setSelectedClass(parseInt(e.target.value, 10));
  };

  // Handle report download
  const handleDownloadReport = () => {
    // This would typically trigger a download API call
    console.log(`Downloading report for Class ${selectedClass}`);
    alert(`Report for Class ${selectedClass} will be downloaded`);
  };

  // Get all unique subjects from the reports
  const allSubjects = [
    ...new Set(reports.flatMap((report) => Object.keys(report.subjectAverages || {}))),
  ];

  // Define columns for MUIDataTable
  const headerStyle = {
    fontFamily: '"Work Sans", sans-serif',
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "170%",
    color: "#2F4F4F",
  };

  // Base columns (always present)
  const baseColumns = [
    {
      name: "Name of Exam",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      },
    },
    // {
    //   name: "No. Of Students ss",
    //   options: {
    //     filter: false,
    //     sort: true,
    //     customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
    //   },
    // },
    {
      name: "Max Marks",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      },
    },
  ];

  // Dynamic subject columns based on the available subjects in the data
  const subjectColumns = allSubjects.map((subject) => ({
    name: subject,
    options: {
      filter: false,
      sort: true,
      customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      customBodyRender: (value) => {
        // Check if value is a valid number and below the passing threshold
        const numValue = parseFloat(value);
        const report = reports.find(
          (r) => r.subjectAverages && r.subjectAverages[subject] === numValue
        );
        const passingMark = report ? report.requiredMarksToPass / 3 : 15; // Default threshold if not specified

        return (
          <div style={!isNaN(numValue) && numValue < passingMark ? styles.lowScore : null}>
            {!isNaN(numValue) ? numValue : "-"}
          </div>
        );
      },
    },
  }));

  // Combine base columns with subject columns
  const columns = [...baseColumns, ...subjectColumns];

  // Format the data for MUIDataTable
  const tableData = reports.map((report) => {
    // Start with base data
    const rowData = [
      report.testTag === "null" ? "Untitled Test" : report.testTag,
      report.totalStudents || 0,
      report.maxScore || 0,
    ];

    // Add subject data
    allSubjects.forEach((subject) => {
      rowData.push(report.subjectAverages?.[subject] ?? "-");
    });

    return rowData;
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
                {availableClasses.length > 0 ? (
                  availableClasses.map((classOption) => (
                    <MenuItem 
                      key={classOption.value} 
                      value={parseInt(classOption.value, 10)}
                    >
                      {classOption.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={1}>Class 1</MenuItem>
                )}
              </Select>
            </FormControl>
          </div>

          {/* Download Report Button */}
          <ButtonCustom text={"Download Report"} onClick={handleDownloadReport} btnWidth={200} />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto" style={styles.tableContainer}>
          <MUIDataTable data={tableData} columns={columns} options={options} />
        </div>

        {/* Note text */}
        <div style={styles.noteText}>
          <span className="font-bold">Note:</span> These marks represent the subject-wise average
          score of the class, calculated as: (Total Marks Obtained in the Subject ÷ Number of
          Students Appeared)
        </div>

        {/* Loading Overlay */}
        {isLoading && <SpinnerPageOverlay isLoading={isLoading} />}
      </div>
    </ThemeProvider>
  );
}