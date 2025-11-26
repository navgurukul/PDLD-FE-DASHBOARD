//school report inside tab
import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ButtonCustom from "../../components/ButtonCustom";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import DownloadModal from "../../components/modal/DownloadModal"; // Import the download modal
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

export default function SchoolReport({ schoolName }) {
  const [syllabusTests, setSyllabusTests] = useState([]); // Store syllabus test data
  const [remedialTests, setRemedialTests] = useState([]); // Store remedial test data
  const [schoolData, setSchoolData] = useState(null); // Store school information
  const [academicYear, setAcademicYear] = useState(null);
  const [selectedClass, setSelectedClass] = useState(""); // Empty = "All Classes"
  const [isLoading, setIsLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false); // Add download modal state
  const navigate = useNavigate();

  // Extract school ID from URL
  const { schoolId } = useParams();

  // Function to fetch all reports data from API
  const fetchAllReportsData = async () => {
    setIsLoading(true);
    try {
      // Use the API instance with the schoolId from URL params
      const result = await api.get(`/report/class/${schoolId}/all`);

      if (result.data && result.data.success) {
        const data = result.data.data || {};
        
        // Store school information
        setSchoolData(data);
        
        // Store syllabus and remedial tests
        setSyllabusTests(data.syllabusTests || []);
        setRemedialTests(data.remedialTests || []);

        // Extract unique classes from both syllabus and remedial tests
        const syllabusClasses = (data.syllabusTests || []).map(test => test.class);
        const remedialClasses = (data.remedialTests || []).map(test => test.class);
        const uniqueClasses = [...new Set([...syllabusClasses, ...remedialClasses])]
          .filter(cls => cls)
          .sort((a, b) => Number(a) - Number(b));

        setAvailableClasses(uniqueClasses);
      } else {
        console.error("API Error:", result.data?.error);
        setSyllabusTests([]);
        setRemedialTests([]);
        setSchoolData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSyllabusTests([]);
      setRemedialTests([]);
      setSchoolData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all reports data when component mounts or schoolId changes
  useEffect(() => {
    if (schoolId) {
      fetchAllReportsData();
    }
  }, [schoolId]);

  // Get academic year from localStorage (but prioritize API data)
  useEffect(() => {
    if (schoolData?.academicYear) {
      setAcademicYear(schoolData.academicYear);
    } else {
      const storedAcademicYear = localStorage.getItem("currentAcademicYear");
      if (storedAcademicYear) {
        setAcademicYear(storedAcademicYear);
      }
    }
  }, [schoolData]);

  // Handle class change
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value); // Just update state, no API call
  };

  // Handle opening download modal
  const handleDownloadClick = () => {
    setDownloadModalOpen(true);
  };

  // Filter tests based on selected class
  const filteredSyllabusTests = selectedClass === "" 
    ? syllabusTests // Show all if no class selected
    : syllabusTests.filter(test => String(test.class) === String(selectedClass));

  const filteredRemedialTests = selectedClass === "" 
    ? remedialTests // Show all if no class selected  
    : remedialTests.filter(test => String(test.class) === String(selectedClass));

  // Get all unique subjects from filtered tests
  const syllabusSubjects = [
    ...new Set(filteredSyllabusTests.flatMap((test) => Object.keys(test.subjectAverages || {}))),
  ];
  
  const remedialSubjects = [
    ...new Set(filteredRemedialTests.flatMap((test) => Object.keys(test.subjectAverages || {}))),
  ];

  // Combine all subjects for download purposes
  const allSubjects = [
    ...new Set([...syllabusSubjects, ...remedialSubjects])
  ];

  // Transform data for download
  const transformDataForDownload = () => {
    const transformedData = [];
    
    // Add syllabus tests data
    filteredSyllabusTests.forEach((test) => {
      const transformedReport = {
        testTag: test.testTag || "-", // Test Name
        class: test.class, // Class value from API
        maxMarks: test.maxScore || 0, // Max Marks
        testType: "Syllabus"
      };

      // Add subject averages
      allSubjects.forEach((subject) => {
        transformedReport[subject] = test.subjectAverages?.[subject] ?? "-";
      });

      transformedData.push(transformedReport);
    });

    // Add remedial tests data
    filteredRemedialTests.forEach((test) => {
      const transformedReport = {
        testTag: test.testTag || "-", // Test Name
        class: test.class, // Class value from API
        maxMarks: test.maxScore || 0, // Max Marks
        testType: "Remedial"
      };

      // Add subject averages
      allSubjects.forEach((subject) => {
        transformedReport[subject] = test.subjectAverages?.[subject] ?? "-";
      });

      transformedData.push(transformedReport);
    });

    return transformedData;
  };

  // Handle download confirmation from modal
  const handleDownloadConfirm = async (downloadOptions) => {
    const { format, rows } = downloadOptions;

    try {
      setIsLoading(true);
      const classInfo = selectedClass === "" ? "All_Classes" : `Class_${selectedClass}`;
      toast.info(`Generating ${format.toUpperCase()} report for ${selectedClass === "" ? "All Classes" : `Class ${selectedClass}`}...`);

      const dataToDownload = transformDataForDownload();

      if (format === "csv") {
        handleDownloadCSV(dataToDownload);
      } else {
        handleDownloadPDF(dataToDownload);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  // Download report as CSV
  const handleDownloadCSV = (data) => {
    // Define headers for the CSV
    const headers = ["Test Name", "Class", "Max Marks", ...allSubjects];

    // Add extra information as a header section
    let csvContent = `School:,${schoolData?.schoolName || schoolName || "N/A"}\n`;
    csvContent += `UDISE Code:,${schoolData?.udiseCode || "N/A"}\n`;
    csvContent += `Academic Year:,${schoolData?.academicYear || academicYear || "N/A"}\n`;
    csvContent += `Class:,${selectedClass === "" ? "All Classes" : selectedClass}\n`;
    csvContent += `Total Tests:,${data.length}\n\n`;

    // Add table headers
    csvContent += headers.join(",") + "\n";

    // Add rows for each report
    data.forEach((report) => {
      const rowData = [
        report.testTag || "-", // Test Name
        report.class || "-", // Class
        report.maxMarks || report.maxScore || "-", // Max Marks
        ...allSubjects.map((subject) => report[subject] || "-"), // Subject averages
      ];
      csvContent +=
        rowData
          .map((cell) => {
            if (cell && cell.toString().includes(",")) {
              return `"${cell}"`;
            }
            return cell;
          })
          .join(",") + "\n";
    });

    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    // Create a download link
    const link = document.createElement("a");
    link.href = url;
    const classInfo = selectedClass === "" ? "All_Classes" : `Class_${selectedClass}`;
    link.setAttribute(
      "download",
      `${classInfo}_Report_${schoolData?.schoolName || schoolName || "School"}_${new Date().toISOString().split("T")[0]}.csv`
    );

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      const classText = selectedClass === "" ? "All Classes" : `Class ${selectedClass}`;
      toast.success(`CSV report downloaded for ${classText}`);
    }, 100);
  };

  // Download report as PDF
  const handleDownloadPDF = (data) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    // Calculate statistics
    const totalTests = data.length;
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate HTML content for the PDF
    const classTitle = selectedClass === "" ? "All Classes" : `Class ${selectedClass}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${classTitle} Test Report - ${schoolData?.schoolName || schoolName || "School"}</title>
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            font-size: 12px;
          }
          
          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2F4F4F;
          }
          
          .header h1 {
            color: #2F4F4F;
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 5px;
          }
          
          .header .date {
            color: #666;
            font-size: 12px;
          }
          
          .school-info {
            background-color: #f8f9fa;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          
          .school-info h3 {
            color: #2F4F4F;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .school-info .info-item {
            display: inline-block;
            margin-right: 30px;
            color: #666;
            font-size: 12px;
          }
          
          .school-info .info-item strong {
            color: #2F4F4F;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background: white;
            font-size: 11px;
          }
          
          thead {
            background-color: #2F4F4F;
            color: white;
          }
          
          th {
            padding: 10px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 12px;
            border: 1px solid #2F4F4F;
          }
          
          th.exam-header {
            text-align: left;
            padding-left: 12px;
          }
          
          td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
          }
          
          td.exam-name {
            text-align: left;
            padding-left: 12px;
            font-weight: 500;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          tbody tr:hover {
            background-color: #e8f5f9;
          }
          
          .low-score {
            color: #FF0000;
            font-weight: 600;
          }
          
          .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          
          .summary h3 {
            color: #2F4F4F;
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .summary-item {
            display: inline-block;
            margin-right: 30px;
            margin-bottom: 5px;
            font-size: 12px;
          }
          
          .summary-item strong {
            color: #2F4F4F;
          }
          
          .note {
            margin-top: 20px;
            padding: 10px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            font-size: 11px;
            color: #856404;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          
          @media print {
            .no-print {
              display: none;
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${classTitle} Test Report</h1>
            <div class="subtitle">${schoolData?.schoolName || schoolName || "School Report"}</div>
            <div class="date">Generated on: ${currentDate}</div>
          </div>
          
          <div class="school-info">
            <h3>Report Information:</h3>
            <div class="info-item"><strong>School:</strong> ${schoolData?.schoolName || schoolName || "N/A"}</div>
            <div class="info-item"><strong>UDISE Code:</strong> ${schoolData?.udiseCode || "N/A"}</div>
            <div class="info-item"><strong>Academic Year:</strong> ${schoolData?.academicYear || academicYear || "N/A"}</div>
            <div class="info-item"><strong>Class:</strong> ${selectedClass === "" ? "All Classes" : selectedClass}</div>
            <div class="info-item"><strong>Total Tests:</strong> ${totalTests}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Class</th>
                <th>Max Marks</th>
                ${allSubjects.map((subject) => `<th>${subject}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map((report) => {
                  return `
                  <tr>
                    <td>${report.testTag || "-"}</td>
                    <td>${report.class || "-"}</td>
                    <td>${report.maxMarks || report.maxScore || "-"}</td>
                    ${allSubjects
                      .map((subject) => {
                        const value = report[subject];
                        const num = parseFloat(value);
                        const isLow = !isNaN(num) && num < (report.maxMarks ? report.maxMarks / 3 : 15);
                        return `<td${isLow ? ' style=\"color:#FF0000;font-weight:600;\"' : ''}>${value}</td>`;
                      })
                      .join("")}
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
          
          <div class="note">
            <strong>Note:</strong> These marks represent the subject-wise average score of the class, calculated as: (Total Marks Obtained in the Subject ÷ Number of Students Appeared). Red values indicate scores below the passing threshold.
          </div>
          
          <div class="summary">
            <h3>Report Summary</h3>
            <div class="summary-item"><strong>Class:</strong> ${selectedClass === "" ? "All Classes" : selectedClass}</div>
            <div class="summary-item"><strong>Total Tests:</strong> ${totalTests}</div>
            <div class="summary-item"><strong>Subjects Covered:</strong> ${allSubjects.length}</div>
            <div class="summary-item"><strong>Report Type:</strong> Class Test Performance Analysis</div>
          </div>
          
          <div class="footer">
            <p>This report is generated automatically from the School Performance System</p>
            <p>© ${academicYear || "2024-25"} Academic Performance Tracking System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        const classText = selectedClass === "" ? "All Classes" : `Class ${selectedClass}`;
        toast.success(`PDF report ready for ${classText}`);
      }, 250);
    };
  };

  // Define columns for MUIDataTable
  const headerStyle = {
    fontFamily: '"Work Sans", sans-serif',
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "170%",
    color: "#2F4F4F",
    textTransform: "none",
  };

  // Base columns (always present)
  const baseColumns = [
    {
      name: "Test Name",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
        customBodyRender: (value) => value || "-",
      },
    },
    {
      name: "Class",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      },
    },
    {
      name: "Max Marks",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      },
    },
  ];

  // Dynamic subject columns for syllabus tests
  const syllabusSubjectColumns = syllabusSubjects.map((subject) => ({
    name: subject,
    options: {
      filter: false,
      sort: true,
      customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      customBodyRender: (value) => {
        const numValue = parseFloat(value);
        const passingMark = 15; // Default threshold

        return (
          <div style={!isNaN(numValue) && numValue < passingMark ? styles.lowScore : null}>
            {!isNaN(numValue) ? numValue : "-"}
          </div>
        );
      },
    },
  }));

  // Dynamic subject columns for remedial tests
  const remedialSubjectColumns = remedialSubjects.map((subject) => ({
    name: subject,
    options: {
      filter: false,
      sort: true,
      customHeadLabelRender: ({ label }) => <span style={headerStyle}>{label}</span>,
      customBodyRender: (value) => {
        const numValue = parseFloat(value);
        const passingMark = 15; // Default threshold

        return (
          <div style={!isNaN(numValue) && numValue < passingMark ? styles.lowScore : null}>
            {!isNaN(numValue) ? numValue : "-"}
          </div>
        );
      },
    },
  }));

  // Combine base columns with subject columns for each test type
  const syllabusColumns = [...baseColumns, ...syllabusSubjectColumns];
  const remedialColumns = [...baseColumns, ...remedialSubjectColumns];

  // Format the data for MUIDataTable - Syllabus Tests
  const syllabusTableData = filteredSyllabusTests.map((test) => {
    const rowData = [
      test.testTag || "-", // Test Name
      test.class,
      test.maxScore || 0,
    ];

    // Add subject data
    syllabusSubjects.forEach((subject) => {
      rowData.push(test.subjectAverages?.[subject] ?? "-");
    });

    return rowData;
  });

  // Format the data for MUIDataTable - Remedial Tests
  const remedialTableData = filteredRemedialTests.map((test) => {
    const rowData = [
      test.testTag || "-", // Test Name
      test.class,
      test.maxScore || 0,
    ];

    // Add subject data
    remedialSubjects.forEach((subject) => {
      rowData.push(test.subjectAverages?.[subject] ?? "-");
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
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                label="Class"
                onChange={handleClassChange}
                displayEmpty
                renderValue={(value) =>
                  value === "" ? "All Classes" : `Class ${value}`
                }
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
                <MenuItem value="">All Classes</MenuItem>
                {availableClasses.map((classNum) => (
                  <MenuItem key={classNum} value={classNum.toString()}>
                    Class {classNum}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Download Report Button */}
          <ButtonCustom text={"Download Report"} onClick={handleDownloadClick} btnWidth={200} />
        </div>

        {/* Data Tables with Headings */}
        {/* Syllabus Test Reports Section */}
        <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Syllabus Test</h5>
        {filteredSyllabusTests.length > 0 ? (
          <div className="overflow-x-auto" style={styles.tableContainer}>
            <MUIDataTable data={syllabusTableData} columns={syllabusColumns} options={options} />
          </div>
        ) : (
          <div style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 400, fontSize: "18px", color: "#2F4F4F", textAlign: "left", marginBottom: "16px" }}>
            No syllabus test reports available for this class/school.
          </div>
        )}

        {/* Remedial Test Reports Section */}
        <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Remedial Test</h5>
        {filteredRemedialTests.length > 0 ? (
          <div className="overflow-x-auto" style={styles.tableContainer}>
            <MUIDataTable data={remedialTableData} columns={remedialColumns} options={options} />
          </div>
        ) : (
          <div style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 400, fontSize: "18px", color: "#2F4F4F", textAlign: "left", marginBottom: "16px" }}>
            No remedial test reports available for this school.
          </div>
        )}

        {/* Note text */}
        <div style={styles.noteText}>
          <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 600, fontSize: "14px", color:"#2F4F4F" }}>Note:</span>
          <span style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 400, fontSize: "14px",color:"#2F4F4F" }}> These marks represent the subject-wise average score of the class, calculated as: (Total Marks Obtained in the Subject ÷ Number of Students Appeared)</span>
        </div>

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          onConfirm={handleDownloadConfirm}
          currentPageCount={filteredSyllabusTests.length + filteredRemedialTests.length}
          totalRecords={filteredSyllabusTests.length + filteredRemedialTests.length}
          subject={selectedClass === "" ? "All Classes" : `Class ${selectedClass}`}
          hideRowOptions={true} // Since we only have current data
          reportName="School Report"
          reportLevel="school"
          reportDetails={{ class: selectedClass === "" ? "All Classes" : selectedClass }}
        />

        {/* Loading Overlay */}
        {isLoading && <SpinnerPageOverlay isLoading={isLoading} />}

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          style={{ zIndex: 99999999 }}
        />
      </div>
    </ThemeProvider>
  );
}