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
        const syllabusClasses = (data.syllabusTests || []).map(
          (test) => test.class
        );
        const remedialClasses = (data.remedialTests || []).map(
          (test) => test.class
        );
        const uniqueClasses = [
          ...new Set([...syllabusClasses, ...remedialClasses]),
        ]
          .filter((cls) => cls)
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
  const filteredSyllabusTests =
    selectedClass === ""
      ? syllabusTests // Show all if no class selected
      : syllabusTests.filter(
          (test) => String(test.class) === String(selectedClass)
        );

  const filteredRemedialTests =
    selectedClass === ""
      ? remedialTests // Show all if no class selected
      : remedialTests.filter(
          (test) => String(test.class) === String(selectedClass)
        );

  // Get all unique subjects from filtered tests
  const syllabusSubjects = [
    ...new Set(
      filteredSyllabusTests.flatMap((test) =>
        Object.keys(test.subjectAverages || {})
      )
    ),
  ];

  const remedialSubjects = [
    ...new Set(
      filteredRemedialTests.flatMap((test) =>
        Object.keys(test.subjectAverages || {})
      )
    ),
  ];

  // Combine all subjects for download purposes
  const allSubjects = [...new Set([...syllabusSubjects, ...remedialSubjects])];

  // Transform data for download
  const transformDataForDownload = () => {
    const syllabusData = [];
    const remedialData = [];

    // Add syllabus tests data
    filteredSyllabusTests.forEach((classTest) => {
      if (classTest.tests && classTest.tests.length > 0) {
        classTest.tests.forEach((test) => {
          syllabusData.push({
            testName: test.testName ? test.testName.split(" — ")[0] : "-",
            testTag: test.testTag || "-",
            class: classTest.class,
            totalStudents: classTest.totalStudents || 0,
            maxMarks: test.maxScore || 0,
            subject: test.subject || "-", // ✅ Individual test subject
            averageScore: test.averageScore ?? "-", // ✅ Individual test average
          });
        });
      }
    });
    // Add remedial tests data
    filteredRemedialTests.forEach((classTest) => {
      if (classTest.subjects && classTest.subjects.length > 0) {
        classTest.subjects.forEach((subjectTest) => {
          remedialData.push({
            testName: subjectTest.testName || "-",
            testTag: subjectTest.testTag || "-",
            class: classTest.class,
            subject: subjectTest.subject || "-",
            sentence:
              subjectTest.gradeCounts?.SENTENCE ??
              subjectTest.gradeCounts?.कहानी ??
              subjectTest.gradeCounts?.भाग ??
              "-",
            word:
              subjectTest.gradeCounts?.WORD ??
              subjectTest.gradeCounts?.अनुच्छेद ??
              subjectTest.gradeCounts?.घटाव ??
              "-",
            smallLetter:
              subjectTest.gradeCounts?.SMALL_LETTER ??
              subjectTest.gradeCounts?.शब्द ??
              subjectTest.gradeCounts?.संख्या_पहचान ??
              "-",
            capitalLetter:
              subjectTest.gradeCounts?.CAPITAL_LETTER ??
              subjectTest.gradeCounts?.अक्षर ??
              subjectTest.gradeCounts?.अंक_पहचान ??
              "-",
            beginner:
              subjectTest.gradeCounts?.Beginner ??
              subjectTest.gradeCounts?.प्रारंभिक ??
              "-",
            presentStudents: subjectTest.studentsPresent || 0,
            absentStudents: subjectTest.studentsAbsent || 0,
            totalStudents: subjectTest.totalStudents || 0,
            overallGrade: subjectTest.overallGrade || "-",
          });
        });
      }
    });

    return { syllabusData, remedialData };
  };
  // Handle download confirmation from modal
  const handleDownloadConfirm = async (downloadOptions) => {
    const { format, rows } = downloadOptions;

    try {
      setIsLoading(true);
      const classInfo =
        selectedClass === "" ? "All_Classes" : `Class_${selectedClass}`;
      toast.info(
        `Generating ${format.toUpperCase()} report for ${
          selectedClass === "" ? "All Classes" : `Class ${selectedClass}`
        }...`
      );

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
  const handleDownloadCSV = ({ syllabusData, remedialData }) => {
    let csvContent = "";

    // Add extra information as a header section
    csvContent = `School:,${schoolData?.schoolName || schoolName || "N/A"}\n`;
    csvContent += `UDISE Code:,${schoolData?.udiseCode || "N/A"}\n`;
    csvContent += `Academic Year:,${
      schoolData?.academicYear || academicYear || "N/A"
    }\n`;
    csvContent += `Class:,${
      selectedClass === "" ? "All Classes" : selectedClass
    }\n`;
    csvContent += `Total Tests:,${
      syllabusData.length + remedialData.length
    }\n\n`;
    //     // Add table headers
    //     csvContent += headers.join(",") + "\n";

    //     // Add rows for each report
    //     data.forEach((report) => {
    //       const rowData = [
    //   report.testName || "-",                                    // Test Name
    //   report.testTag || "-",                                      // Test Tag
    //   report.class || "-",                                        // Class
    //   report.testType === "Syllabus" ? (report.maxMarks || "-") : "-", // Max Marks (only for syllabus)
    //   ...allSubjects.map((subject) => report[subject] || "-"),   // Subjects
    // ];
    //       csvContent +=
    //         rowData
    //           .map((cell) => {
    //             if (cell && cell.toString().includes(",")) {
    //               return `"${cell}"`;
    //             }
    //             return cell;
    //           })
    //           .join(",") + "\n";
    //     });
    // SYLLABUS TEST SECTION
    // SYLLABUS TEST SECTION
    if (syllabusData.length > 0) {
      csvContent += "=== SYLLABUS TESTS ===\n";
      // csvContent += "Test Name,Test Tag,Class,Total Students,Max Marks,Average Score\n";

      // Dynamic headers based on syllabusSubjects
      const syllabusHeaders = [
        "Test Name",
        "Test Tag",
        "Class",
        "Total Students",
        "Max Marks",
        ...syllabusSubjects,
      ];
      csvContent += syllabusHeaders.join(",") + "\n";

      syllabusData.forEach((test) => {
        const rowData = [
          test.testName,
          test.testTag,
          test.class,
          test.totalStudents,
          test.maxMarks,
          // Add subject averages dynamically
          ...syllabusSubjects.map((subject) =>
            test.subject === subject ? test.averageScore : "-"
          ),
        ];
        csvContent += rowData.join(",") + "\n";
      });

      csvContent += "\n\n";
    }
    // REMEDIAL TEST SECTION
    if (remedialData.length > 0) {
      csvContent += "=== REMEDIAL TESTS ===\n";
      csvContent +=
        "Test Name,Test Tag,Class,Subject,SENTENCE/कहानी/भाग,WORD/अनुच्छेद/घटाव,SMALL_LETTER/शब्द/संख्या पहचान,CAPITAL_LETTER/अक्षर/अंक पहचान,Beginner/प्रारंभिक,Present Students,Absent Students,Total Students,Overall Grade\n";

      remedialData.forEach((test) => {
        csvContent += `${test.testName},${test.testTag},${test.class},${test.subject},${test.sentence},${test.word},${test.smallLetter},${test.capitalLetter},${test.beginner},${test.presentStudents},${test.absentStudents},${test.totalStudents},${test.overallGrade}\n`;
      });
    }

    // Create and download blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const classInfo =
      selectedClass === "" ? "All_Classes" : `Class_${selectedClass}`;
    link.setAttribute(
      "download",
      `${classInfo}_Report_${
        schoolData?.schoolName || schoolName || "School"
      }_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(
        `CSV report downloaded for ${
          selectedClass === "" ? "All Classes" : `Class ${selectedClass}`
        }`
      );
    }, 100);
  };

  // Download report as PDF
  const handleDownloadPDF = ({ syllabusData, remedialData }) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    // Calculate statistics
    // ✅ FIXED: Define all required variables
    const classTitle =
      selectedClass === "" ? "All Classes" : `Class ${selectedClass}`;
    const totalTests = syllabusData.length + remedialData.length;
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    // Generate HTML content for the PDF
    // Syllabus table HTML

    // Syllabus table HTML
    const syllabusTableHTML =
      syllabusData.length > 0
        ? `
    <h2 style="color: #2F4F4F; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #2F4F4F; padding-bottom: 8px;">Syllabus Tests</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Test Tag</th>
          <th>Class</th>
          <th>Total Students</th>
          <th>Max Marks</th>
           ${syllabusSubjects.map((subject) => `<th>${subject}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${syllabusData
          .map(
            (test) => `
          <tr>
            <td class="exam-name">${test.testName}</td>
            <td>${test.testTag}</td>
            <td>${test.class}</td>
            <td>${test.totalStudents}</td>
            <td>${test.maxMarks}</td>
           ${syllabusSubjects
             .map(
               (subject) =>
                 `<td>${
                   test.subject === subject ? test.averageScore : "-"
                 }</td>`
             )
             .join("")}
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `
        : "";

    // Remedial table HTML
    const remedialTableHTML =
      remedialData.length > 0
        ? `
    <h2 style="color: #2F4F4F; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #2F4F4F; padding-bottom: 8px;">Remedial Tests</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Test Tag</th>
          <th>Class</th>
          <th>Subject</th>
          <th>SENTENCE/कहानी/भाग</th>
          <th>WORD/अनुच्छेद/घटाव</th>
          <th>SMALL_LETTER/शब्द/संख्या पहचान</th>
          <th>CAPITAL_LETTER/अक्षर/अंक पहचान</th>
          <th>Beginner/प्रारंभिक</th>
          <th>Present</th>
          <th>Absent</th>
          <th>Total</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        ${remedialData
          .map(
            (test) => `
          <tr>
            <td class="exam-name">${test.testName}</td>
            <td>${test.testTag}</td>
            <td>${test.class}</td>
            <td>${test.subject}</td>
            <td>${test.sentence}</td>
            <td>${test.word}</td>
            <td>${test.smallLetter}</td>
            <td>${test.capitalLetter}</td>
            <td>${test.beginner}</td>
            <td>${test.presentStudents}</td>
            <td>${test.absentStudents}</td>
            <td>${test.totalStudents}</td>
            <td>${test.overallGrade}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `
        : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${classTitle} Test Report - ${
      schoolData?.schoolName || schoolName || "School"
    }</title>
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
          <div class="subtitle">${
            schoolData?.schoolName || schoolName || "School Report"
          }</div>
          <div class="date">Generated on: ${currentDate}</div>
        </div>
        
        <div class="school-info">
          <h3>Report Information:</h3>
          <div class="info-item"><strong>School:</strong> ${
            schoolData?.schoolName || schoolName || "N/A"
          }</div>
          <div class="info-item"><strong>UDISE Code:</strong> ${
            schoolData?.udiseCode || "N/A"
          }</div>
          <div class="info-item"><strong>Academic Year:</strong> ${
            schoolData?.academicYear || academicYear || "N/A"
          }</div>
          <div class="info-item"><strong>Class:</strong> ${
            selectedClass === "" ? "All Classes" : selectedClass
          }</div>
          <div class="info-item"><strong>Total Tests:</strong> ${totalTests}</div>
        </div>
        
        ${syllabusTableHTML}
        ${remedialTableHTML}
        
        <div class="note">
          <strong>Note:</strong> These marks represent the subject-wise average score of the class, calculated as: (Total Marks Obtained in the Subject ÷ Number of Students Appeared). Red values indicate scores below the passing threshold.
        </div>
        
        <div class="footer">
          <p>This report is generated automatically from the School Performance System</p>
          <p>© ${
            academicYear || "2024-25"
          } Academic Performance Tracking System</p>
        </div>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        toast.success(
          `PDF report ready for ${
            selectedClass === "" ? "All Classes" : `Class ${selectedClass}`
          }`
        );
      }, 250);
    };
  };

  const headerStyle = {
    fontWeight: "bold",
    color: "#2F4F4F",
    fontFamily: "Karla, sans-serif",
    fontSize: "14px",
  };

  // Base columns for SYLLABUS tests (with Max Marks)
  const syllabusBaseColumns = [
    {
      name: "Test Tag", // NEW COLUMN
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
        customBodyRender: (value) => value || "-",
      },
    },
    {
      name: "Class",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Total Students",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Max Marks",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
  ];

  // Base columns for REMEDIAL tests (WITHOUT Max Marks)
  const remedialBaseColumns = [
    {
      name: "Test Name",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
        customBodyRender: (value) => {
          // Remove " — " from test name
          return value ? value.split(" — ")[0] : "-";
        },
      },
    },
    {
      name: "Test Tag", // NEW COLUMN
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
        customBodyRender: (value) => value || "-",
      },
    },
    {
      name: "Class",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Subject",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "SENTENCE/कहानी/भाग",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "WORD/अनुच्छेद/घटाव",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "SMALL_LETTER/शब्द/संख्या पहचान",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "CAPITAL_LETTER/अक्षर/अंक पहचान",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Beginner/प्रारंभिक",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Present Students",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Absent Students",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Total Students",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
    {
      name: "Overall Grade",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: ({ label }) => (
          <span style={headerStyle}>{label}</span>
        ),
      },
    },
  ];

  // Dynamic subject columns for syllabus tests
  const syllabusSubjectColumns = syllabusSubjects.map((subject) => ({
    name: subject,
    options: {
      filter: false,
      sort: true,
      customHeadLabelRender: ({ label }) => (
        <span style={headerStyle}>{label}</span>
      ),
      customBodyRender: (value) => {
        const numValue = parseFloat(value);
        const passingMark = 15; // Default threshold

        return (
          <div
            style={
              !isNaN(numValue) && numValue < passingMark
                ? styles.lowScore
                : null
            }
          >
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
      customHeadLabelRender: ({ label }) => (
        <span style={headerStyle}>{label}</span>
      ),
      customBodyRender: (value) => {
        const numValue = parseFloat(value);
        const passingMark = 15; // Default threshold

        return (
          <div
            style={
              !isNaN(numValue) && numValue < passingMark
                ? styles.lowScore
                : null
            }
          >
            {!isNaN(numValue) ? numValue : "-"}
          </div>
        );
      },
    },
  }));

  // Combine base columns with subject columns for each test type
  const syllabusColumns = [...syllabusBaseColumns, ...syllabusSubjectColumns];
  const remedialColumns = [...remedialBaseColumns, ...remedialSubjectColumns];

  // Format the data for MUIDataTable - Syllabus Tests
  const syllabusTableData = [];

  filteredSyllabusTests.forEach((classTest) => {
    // Each class has an array of tests
    if (classTest.tests && classTest.tests.length > 0) {
      classTest.tests.forEach((test) => {
        const rowData = [
          test.testTag || "-", // Test Tag
          classTest.class, // Class
          classTest.totalStudents || 0, // Total Students
          test.maxScore || 0, // Max Marks
          ...syllabusSubjects.map((subject) =>
            test.subject === subject ? test.averageScore ?? "-" : "-"
          ),
        ];

        syllabusTableData.push(rowData);
      });
    }
  });

  // Format the data for MUIDataTable - Remedial Tests
  const remedialTableData = [];

  filteredRemedialTests.forEach((classTest) => {
    // Each class has an array of subjects
    if (classTest.subjects && classTest.subjects.length > 0) {
      classTest.subjects.forEach((subjectTest) => {
        const rowData = [
          subjectTest.testName || "-", // Test Name
          subjectTest.testTag || "-", // Test Tag
          classTest.class, // Class
          subjectTest.subject || "-", // Subject
          subjectTest.gradeCounts?.SENTENCE ??
            subjectTest.gradeCounts?.कहानी ??
            subjectTest.gradeCounts?.भाग ??
            "-", // SENTENCE/कहानी/भाग
          subjectTest.gradeCounts?.WORD ??
            subjectTest.gradeCounts?.अनुच्छेद ??
            subjectTest.gradeCounts?.घटाव ??
            "-", // WORD/अनुच्छेद/घटाव
          subjectTest.gradeCounts?.SMALL_LETTER ??
            subjectTest.gradeCounts?.शब्द ??
            subjectTest.gradeCounts?.संख्या_पहचान ??
            "-", // SMALL_LETTER/शब्द/संख्या पहचान
          subjectTest.gradeCounts?.CAPITAL_LETTER ??
            subjectTest.gradeCounts?.अक्षर ??
            subjectTest.gradeCounts?.अंक_पहचान ??
            "-", // CAPITAL_LETTER/अक्षर/अंक पहचान
          subjectTest.gradeCounts?.Beginner ??
            subjectTest.gradeCounts?.प्रारंभिक ??
            "-", // Beginner/प्रारंभिक
          subjectTest.studentsPresent || 0, // Present Students
          subjectTest.studentsAbsent || 0, // Absent Students
          subjectTest.totalStudents || 0, // Total Students
          subjectTest.overallGrade || "-", // Overall Grade
        ];

        remedialTableData.push(rowData);
      });
    }
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
          <ButtonCustom
            text={"Download Report"}
            onClick={handleDownloadClick}
            btnWidth={200}
          />
        </div>

        {/* Data Tables with Headings */}
        {/* Syllabus Test Reports Section */}
        <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Syllabus Test</h5>
        {filteredSyllabusTests.length > 0 ? (
          <div className="overflow-x-auto" style={styles.tableContainer}>
            <MUIDataTable
              data={syllabusTableData}
              columns={syllabusColumns}
              options={options}
            />
          </div>
        ) : (
          <div
            style={{
              fontFamily: "Work Sans, sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              color: "#2F4F4F",
              textAlign: "left",
              marginBottom: "16px",
            }}
          >
            No syllabus test reports available for this class/school.
          </div>
        )}

        {/* Remedial Test Reports Section */}
        <h5 className="text-lg font-bold text-[#2F4F4F] mb-4">Remedial Test</h5>
        {filteredRemedialTests.length > 0 ? (
          <div className="overflow-x-auto" style={styles.tableContainer}>
            <MUIDataTable
              data={remedialTableData}
              columns={remedialColumns}
              options={options}
            />
          </div>
        ) : (
          <div
            style={{
              fontFamily: "Work Sans, sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              color: "#2F4F4F",
              textAlign: "left",
              marginBottom: "16px",
            }}
          >
            No remedial test reports available for this school.
          </div>
        )}

        {/* Note text */}
        <div style={styles.noteText}>
          <span
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#2F4F4F",
            }}
          >
            Note:
          </span>
          <span
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "#2F4F4F",
            }}
          >
            {" "}
            These marks represent the subject-wise average score of the class,
            calculated as: (Total Marks Obtained in the Subject ÷ Number of
            Students Appeared)
          </span>
        </div>

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          onConfirm={handleDownloadConfirm}
          currentPageCount={
            filteredSyllabusTests.length + filteredRemedialTests.length
          }
          totalRecords={
            filteredSyllabusTests.length + filteredRemedialTests.length
          }
          subject={
            selectedClass === "" ? "All Classes" : `Class ${selectedClass}`
          }
          hideRowOptions={true} // Since we only have current data
          reportName="School Report"
          reportLevel="school"
          reportDetails={{
            class: selectedClass === "" ? "All Classes" : selectedClass,
          }}
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
