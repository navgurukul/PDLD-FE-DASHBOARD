//student profile page inside school flow
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, Grid, Paper, Tabs, Tab, Button, Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import StudentAcademics from "./StudentAcademics";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import ButtonCustom from "../../components/ButtonCustom";
import DownloadModal from "../../components/modal/DownloadModal";
import apiInstance from "../../../api";
import AcademicOverviewGraph from "../graph/AcademicOverviewGraph";
import { Tooltip } from "@mui/material";

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const StudentProfileView = () => {
  const theme = useTheme();
  const { schoolId, studentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [schoolName, setSchoolName] = useState("");
  const [udiseCode, setUdiseCode] = useState("");
  const [error, setError] = useState(null);

  // Download modal states
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [activeAcademicTab, setActiveAcademicTab] = useState("aggregate"); // Track which academic sub-tab is active
  

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;

      // Format to dd-mm-yyyy
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle academic sub-tab change from StudentAcademics component
  const handleAcademicTabChange = (activeTab, data) => {
    setActiveAcademicTab(activeTab);
  };

  // Fetch student profile data
  const fetchStudentProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get contextual school information from location state if available
      if (location.state) {
        setSchoolName(location.state.schoolName || "");
        setUdiseCode(location.state.udiseCode || "");
      }

      // Fetch student profile data using the API
      const response = await apiInstance.get(`/student/profile/${studentId}`);

      if (response.data && response.data.success) {
        const profileData = response.data.data;
        console.log("Student profile data:", profileData);

        // Set student data with the API response
        setStudent({
          id: profileData.studentId,
          fullName: profileData.fullName,
          fatherName: profileData.fatherName,
          motherName: profileData.motherName,
          dob: profileData.dob,
          gender: profileData.gender,
          class: profileData.class,
          // Include academic data if available
          academic: profileData.academic || { year: "2025-2026", months: [] },
          // Any missing fields that the UI might expect
          aparId: profileData.aparId || "N/A",
          aadharId: profileData.aadharId || "N/A",
          hostel: profileData.hostel || "N/A",
          schoolName: schoolName,
          stream: profileData.stream || "",
          extraSubjects: profileData.extraSubjects || [],
        });

        // Fetch academic data after getting student profile
        
      } else {
        toast.error("Failed to load student profile. Please try again.");
        setError("Unable to fetch student data. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast.error("Failed to load student profile. Please try again later.");
      setError("Error fetching student data: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    } else {
      setIsLoading(false);
      setError("No student ID provided. Unable to fetch student information.");
    }
  }, [studentId]); // Re-fetch when studentId changes

  useEffect(() => {
    if (student?.fullName) {
      const locationState = location.state || {};
      navigate(location.pathname, {
        replace: true,
        state: { ...locationState, studentName: student.fullName },
      });
    }
  }, [student?.fullName]);

  // Handle opening download modal
  const handleDownloadClick = () => {
    setDownloadModalOpen(true);
  };

  // Handle download confirmation from modal
  const handleDownloadConfirm = async (downloadOptions) => {
    const { format, reportType = "comprehensive" } = downloadOptions;

    try {
      setIsLoading(true);
      toast.info(`Generating ${format.toUpperCase()} report for ${student.fullName}...`);

      // Determine actual report type based on current tab and user selection
      let actualReportType = reportType;
      
      // If user selected comprehensive, use current academic tab to determine what to include
      if (reportType === "comprehensive") {
        // When on academics tab (tabValue 1), use the active academic sub-tab
        if (tabValue === 1) {
          // Include the active academic tab + remedial data
          actualReportType = `${activeAcademicTab}+remedial`;
        } else {
          // If on overview tab, include all data (keep comprehensive)
          actualReportType = "comprehensive";
        }
      }

      if (format === "csv") {
        handleDownloadCSV(actualReportType);
      } else {
        handleDownloadPDF(actualReportType);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to process academic data similar to StudentAcademics component
  const processAcademicData = () => {
    if (!student?.academic?.months) return { aggregate: [], subjectwise: [], remedial: [] };

    const aggregateData = [];
    const subjectwiseData = [];
    const remedialData = [];

    // Get all unique subjects from syllabus tests
    const allSubjects = new Set();
    student.academic.months.forEach((monthData) => {
      monthData.tests.forEach((test) => {
        if (test.testType === "SYLLABUS" && test.subject) {
          allSubjects.add(test.subject === "Maths" ? "Mathematics" : test.subject);
        }
      });
    });

    student.academic.months.forEach((monthData) => {
      // Group syllabus tests by test tag for aggregate view
      const syllabusTests = monthData.tests.filter((test) => test.testType === "SYLLABUS");
      
      if (syllabusTests.length > 0) {
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
          
          const subjectName = test.subject === "Maths" ? "Mathematics" : test.subject;
          if (subjectName && test.score !== null) {
            testsByTag[testTag].subjectScores[subjectName] = test.score;
            testsByTag[testTag].totalScore += test.score;
            testsByTag[testTag].totalMaxScore += test.maxScore;
          }
        });

        // Create aggregate entries
        Object.entries(testsByTag).forEach(([tag, data]) => {
          const percentage = data.totalMaxScore > 0 ? Math.round((data.totalScore / data.totalMaxScore) * 100) : 0;
          const grade = percentage >= 85 ? "A" : percentage >= 60 ? "B" : percentage >= 45 ? "C" : percentage >= 33 ? "D" : "E";
          
          aggregateData.push({
            testType: tag,
            maxMarks: data.tests[0]?.maxScore || 100,
            overallPercentage: percentage,
            grade: grade,
            ...data.subjectScores
          });
        });
      }

      // Process individual tests for subjectwise view
      syllabusTests.forEach((test) => {
        const testDate = new Date(test.testDate);
        const day = testDate.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[testDate.getMonth()];
        const year = testDate.getFullYear().toString().substr(-2);
        const formattedDate = `${day} ${month}' ${year}`;
        
        let testStatus = "Absent";
        if (test.score !== null) {
          testStatus = test.passStatus ? "Pass" : "Fail";
        }

        subjectwiseData.push({
          name: test.testName,
          type: test.testTag,
          date: formattedDate,
          maxMarks: test.maxScore,
          marksSecured: test.score !== null ? test.score : 0,
          status: testStatus
        });
      });

      // Process remedial tests
      const remedialTests = monthData.tests.filter((test) => test.testType === "REMEDIAL");
      remedialTests.forEach((test) => {
        const testDate = new Date(test.testDate);
        const day = testDate.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[testDate.getMonth()];
        const year = testDate.getFullYear().toString().substr(-2);
        const formattedDate = `${day} ${month}' ${year}`;

        remedialData.push({
          testName: test.testName || `${test.subject} Remedial`,
          subject: test.subject,
          examDate: formattedDate,
          grade: test.grade || "N/A"
        });
      });
    });

    return { 
      aggregate: aggregateData, 
      subjectwise: subjectwiseData, 
      remedial: remedialData,
      allSubjects: Array.from(allSubjects)
    };
  };

  // Download report as CSV
  const handleDownloadCSV = (reportType) => {
    let csvContent = "";
    let filename = "";
    
    const academicData = processAcademicData();

    // Add student info header
    csvContent += `STUDENT INFORMATION\n`;
    csvContent += `Student Name,${student.fullName}\n`;
    csvContent += `Class,${student.class}\n`;
    csvContent += `School,${schoolName || "N/A"}\n`;
    csvContent += `Father's Name,${student.fatherName || "N/A"}\n`;
    csvContent += `Mother's Name,${student.motherName || "N/A"}\n`;
    csvContent += `Date of Birth,${formatDate(student.dob)}\n`;
    csvContent += `Academic Year,${student.academic?.year || "2024-25"}\n\n`;

    // Handle different report types
    const includeAggregate = reportType === "aggregate" || reportType === "comprehensive" || reportType === "aggregate+remedial";
    const includeSubjectwise = reportType === "subjectwise" || reportType === "comprehensive" || reportType === "subjectwise+remedial";
    const includeRemedial = reportType === "remedial" || reportType === "comprehensive" || reportType.includes("+remedial");

    if (includeAggregate) {
      // Create dynamic headers based on available subjects - subjects after Max Marks
      const subjectHeaders = academicData.allSubjects || [];
      const aggregateHeaders = ["Test Type", "Max Marks", ...subjectHeaders, "Overall %", "Grade"];
      
      csvContent += "AGGREGATE PERFORMANCE REPORT\n";
      csvContent += aggregateHeaders.join(",") + "\n";
      
      academicData.aggregate.forEach((test) => {
        const rowData = [
          test.testType || "N/A",
          test.maxMarks || "N/A"
        ];
        
        // Add subject scores after Max Marks
        subjectHeaders.forEach(subject => {
          rowData.push(test[subject] || "N/A");
        });
        
        // Add Overall % and Grade at the end
        rowData.push(test.overallPercentage + "%");
        rowData.push(test.grade || "N/A");
        
        csvContent += rowData.map((cell) => (cell && cell.toString().includes(",") ? `"${cell}"` : cell)).join(",") + "\n";
      });
    }

    if (includeSubjectwise) {
      if (csvContent && !csvContent.endsWith("\n\n")) csvContent += "\n\n";
      const subjectwiseHeaders = [
        "Test Name",
        "Test Type", 
        "Date of Test",
        "Maximum Marks",
        "Marks Secured",
        "Status"
      ];
      csvContent += "SUBJECT-WISE PERFORMANCE REPORT\n";
      csvContent += subjectwiseHeaders.join(",") + "\n";
      
      academicData.subjectwise.forEach((test) => {
        const rowData = [
          test.name || "N/A",
          test.type || "N/A",
          test.date || "N/A",
          test.maxMarks || "N/A",
          test.marksSecured || "N/A",
          test.status || "N/A"
        ];
        csvContent += rowData.map((cell) => (cell && cell.toString().includes(",") ? `"${cell}"` : cell)).join(",") + "\n";
      });
    }

    if (includeRemedial) {
      if (csvContent && !csvContent.endsWith("\n\n")) csvContent += "\n\n";
      const remedialHeaders = ["Test Name", "Exam Date", "Grade"];
      csvContent += "REMEDIAL RECOMMENDATIONS\n";
      csvContent += remedialHeaders.join(",") + "\n";
      
      academicData.remedial.forEach((item) => {
        const rowData = [
          item.testName || "N/A",
          // item.subject || "N/A", Remove subject column 
          item.examDate || "N/A",
          item.grade || "N/A"
        ];
        csvContent += rowData.map((cell) => (cell && cell.toString().includes(",") ? `"${cell}"` : cell)).join(",") + "\n";
      });
    }

    // Set filename based on what's included
    let reportTypeText = "Comprehensive";
    if (reportType === "aggregate+remedial") {
      reportTypeText = "Aggregate_with_Remedial";
    } else if (reportType === "subjectwise+remedial") {
      reportTypeText = "Subjectwise_with_Remedial";
    } else if (reportType === "aggregate") {
      reportTypeText = "Aggregate";
    } else if (reportType === "subjectwise") {
      reportTypeText = "Subjectwise";
    } else if (reportType === "remedial") {
      reportTypeText = "Remedial";
    }
    
    filename = `${student.fullName}_${reportTypeText}_Report_${new Date().toISOString().split("T")[0]}.csv`;

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`CSV report downloaded for ${student.fullName}`);
    }, 100);
  };

  // Download report as PDF
  const handleDownloadPDF = (reportType) => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    // Handle different report types
    const includeAggregate = reportType === "aggregate" || reportType === "comprehensive" || reportType === "aggregate+remedial";
    const includeSubjectwise = reportType === "subjectwise" || reportType === "comprehensive" || reportType === "subjectwise+remedial";
    const includeRemedial = reportType === "remedial" || reportType === "comprehensive" || reportType.includes("+remedial");

    let reportTypeText = "Comprehensive Academic";
    if (reportType === "aggregate+remedial") {
      reportTypeText = "Aggregate Performance with Remedial";
    } else if (reportType === "subjectwise+remedial") {
      reportTypeText = "Subject-wise Performance with Remedial";
    } else if (reportType === "aggregate") {
      reportTypeText = "Aggregate Performance";
    } else if (reportType === "subjectwise") {
      reportTypeText = "Subject-wise Performance";
    } else if (reportType === "remedial") {
      reportTypeText = "Remedial Recommendations";
    }

    const academicData = processAcademicData();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTypeText} Report - ${student.fullName}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.5;
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
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2F4F4F;
          }
          
          .header h1 {
            color: #2F4F4F;
            font-size: 24px;
            margin-bottom: 10px;
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
          
          .student-info {
            background-color: #f8f9fa;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          
          .student-info h3 {
            color: #2F4F4F;
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .info-item {
            color: #666;
            font-size: 13px;
          }
          
          .info-item strong {
            color: #2F4F4F;
            display: block;
            margin-bottom: 3px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section h2 {
            color: #2F4F4F;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #2F4F4F;
            padding-bottom: 5px;
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
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            border: 1px solid #2F4F4F;
          }
          
          td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .low-score {
            color: #FF0000;
            font-weight: 600;
          }
          
          .high-score {
            color: #4CAF50;
            font-weight: 600;
          }
          
          .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          
          .summary h3 {
            color: #2F4F4F;
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
          }
          
          .summary-item {
            font-size: 12px;
          }
          
          .summary-item strong {
            color: #2F4F4F;
            display: block;
            margin-bottom: 3px;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          
          .remedial-item {
            margin-bottom: 15px;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
          }
          
          .remedial-item h4 {
            color: #856404;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .remedial-item p {
            color: #856404;
            font-size: 12px;
            margin-bottom: 5px;
          }
          
          @media print {
            .no-print {
              display: none;
            }
            
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${reportTypeText} Report</h1>
            <div class="subtitle">${student.fullName}</div>
            <div class="date">Generated on: ${currentDate}</div>
          </div>
          
          <div class="student-info">
            <h3>Student Information</h3>
            <div class="info-grid">
              <div class="info-item"><strong>Full Name:</strong>${student.fullName}</div>
              <div class="info-item"><strong>Class:</strong>Class ${student.class}</div>
              <div class="info-item"><strong>Father's Name:</strong>${student.fatherName || "N/A"}</div>
              <div class="info-item"><strong>Mother's Name:</strong>${student.motherName || "N/A"}</div>
              <div class="info-item"><strong>Date of Birth:</strong>${formatDate(student.dob)}</div>
              <div class="info-item"><strong>School:</strong>${schoolName || "N/A"}</div>
            </div>
          </div>
          ${
  includeAggregate && academicData.aggregate.length > 0
    ? `
            <div class="section">
              <h2>Aggregate Performance</h2>
              <table>
                <thead>
                  <tr>
                    <th>Test Type</th>
                    <th>Max Marks</th>
                    ${academicData.allSubjects.map(subject => `<th>${subject}</th>`).join("")}
                    <th>Overall %</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${academicData.aggregate
                    .map(
                      (test) => `
                        <tr>
                          <td>${test.testType || "N/A"}</td>
                          <td>${test.maxMarks || "N/A"}</td>
                          ${academicData.allSubjects.map(subject => `<td>${test[subject] || "N/A"}</td>`).join("")}
                          <td class="${test.overallPercentage < 40 ? 'low-score' : test.overallPercentage > 80 ? 'high-score' : ''}">${test.overallPercentage}%</td>
                          <td>${test.grade || "N/A"}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            `
    : ""
}
          ${
  includeSubjectwise && academicData.subjectwise.length > 0
    ? `
            <div class="section">
              <h2>Subject-wise Performance</h2>
              <table>
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Test Type</th>
                    <th>Date of Test</th>
                    <th>Maximum Marks</th>
                    <th>Marks Secured</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${academicData.subjectwise
                    .map(
                      (test) => `
                        <tr>
                          <td>${test.name || "N/A"}</td>
                          <td>${test.type || "N/A"}</td>
                          <td>${test.date || "N/A"}</td>
                          <td>${test.maxMarks || "N/A"}</td>
                          <td class="${test.marksSecured < (test.maxMarks * 0.4) ? 'low-score' : test.marksSecured > (test.maxMarks * 0.8) ? 'high-score' : ''}">${test.marksSecured || "N/A"}</td>
                          <td><span style="color: ${test.status === 'Pass' ? '#4CAF50' : test.status === 'Fail' ? '#FF0000' : '#666'}">${test.status || "N/A"}</span></td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            `
    : ""
}
          ${
  includeRemedial && academicData.remedial.length > 0
    ? `
            <div class="section">
              <h2>Remedial Recommendations</h2>
              ${academicData.remedial
                .map(
                  (item) => `
                <div class="remedial-item">
                  <h4>${item.subject || "General"} - ${item.testName || "N/A"}</h4>
                  <p><strong>Exam Date:</strong> ${item.examDate || "N/A"}</p>
                  <p><strong>Grade:</strong> ${item.grade || "N/A"}</p>
                </div>
              `
                )
                .join("")}
            </div>
            `
    : ""
}
          <div class="summary">
            <h3>Report Summary</h3>
            <div class="summary-grid">
              <div class="summary-item"><strong>Report Type:</strong>${reportTypeText}</div>
              <div class="summary-item"><strong>Academic Year:</strong>${student.academic?.year || "2024-25"}</div>
              <div class="summary-item"><strong>Generated:</strong>${currentDate}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This report is generated automatically from the School Performance System</p>
            <p>© ${student.academic?.year || "2024-25"} Academic Performance Tracking System</p>
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
        toast.success(`PDF report ready for ${student.fullName}`);
      }, 250);
    };
  };

  // Handle edit student
  const handleEditStudent = () => {
    navigate(`/schools/schoolDetail/${schoolId}/updateStudent`, {
      state: {
        schoolId: schoolId,
        studentId: studentId,
        udiseCode: udiseCode,
        isEditMode: true,
        studentData: student,
      },
    });
  };

  // Handle view student report
  const handleViewStudentReport = () => {
    navigate(`/student-report/${schoolId}/${studentId}`, {
      state: {
        studentData: student,
        schoolName: schoolName,
        udiseCode: udiseCode,
      },
    });
  };

  // Go back to student list
  const handleGoBack = () => {
    navigate(`/schools/schoolDetail/${schoolId}`);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <SpinnerPageOverlay isLoading={isLoading} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Information not available. Unable to fetch student details.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Box>
    );
  }

  return (
    <Box className="main-page-wrapper">
      {/* Student Badge - Name and gender */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 2, md: 0 },
          marginTop: "24px 0px",
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          <h5 className="text-lg font-bold text-[#2F4F4F] mr-4">{student.fullName}</h5>
          <Box
            sx={{
              padding: "4px 8px",
              bgcolor: "#EAEDED",
              borderRadius: "8px",
              color: "#2E7D32",
              height: "48px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="body1" sx={{}}>
              {student.gender === "M"
                ? "Male"
                : student.gender === "F"
                ? "Female"
                : student.gender || "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Show Academic Year and Download Report button based on tab */}
        {student.academic && (
          <div className="flex" style={{ flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <Typography
              variant="subtitle1"
              sx={{
                bgcolor: theme.palette.secondary.light,
                color: theme.palette.primary,
                padding: "4px 16px",
                borderRadius: "8px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                marginRight: { xs: 0, md: tabValue === 1 ? "16px" : 0 },
                marginBottom: { xs: tabValue === 1 ? "8px" : 0, md: 0 }
              }}
            >
              Academic Year {student.academic.year || "2024-25"}
            </Typography>
            {tabValue === 1 && (
              <ButtonCustom text={"Download Report"} onClick={handleDownloadClick} btnWidth={200} />
            )}
          </div>
        )}
      </Box>

      {/* Tabs for navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "#E0E0E0", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Academics" />
        </Tabs>
      </Box>

      {/* Overview tab content */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          {/* Personal Details Section - Matching Figma with exact spacing */}
          <Grid item xs={12}>
            {/* Personal Details Card */}
            <Paper
              sx={{
                p: 4, // 32px padding
                borderRadius: "8px",
                background: "#FFF",
                boxShadow:
                  "0px 1px 2px 0px rgba(47, 79, 79, 0.06), 0px 2px 1px 0px rgba(47, 79, 79, 0.04), 0px 1px 5px 0px rgba(47, 79, 79, 0.08)",
              }}
            >
              {/* Header with Edit Button */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 2, sm: 0 },
                  mb: 4, // 32px bottom margin
                }}
              >
                <h5
                  className="text-[#2F4F4F]"
                  style={{ fontSize: "24px", fontWeight: "700", fontFamily: "Philosopher" }}
                >
                  Personal Details
                </h5>

                <ButtonCustom text={"Edit Profile"} onClick={handleEditStudent} />
              </Box>

              {/* First Row */}
              <Box 
                sx={{ 
                  display: { xs: "grid", md: "flex" },
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: { xs: 2, sm: 3, md: 0 },
                  mb: 3 
                }}
              >
                {/* Father's Name */}
                <Box sx={{ width: { md: "25%" }, pr: { md: 2 } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Father's Name
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.fatherName || "N/A"}
                  </Typography>
                </Box>

                {/* Mother's Name */}
                <Box sx={{ width: { md: "25%" }, pr: { md: 2 } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Mother's Name
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.motherName || "N/A"}
                  </Typography>
                </Box>

                {/* Date of Birth */}
                <Box sx={{ width: { md: "25%" }, pr: { md: 2 } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {formatDate(student.dob)}
                  </Typography>
                </Box>

                {/* Hostel */}
                <Box sx={{ width: { md: "25%" } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Hostel
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.hostel || "N/A"}
                  </Typography>
                </Box>
              </Box>

              {/* Second Row */}
              <Box 
                sx={{ 
                  display: { xs: "grid", md: "flex" },
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: { xs: 2, sm: 3, md: 0 }
                }}
              >
                {/* Aadhar Id */}
                <Box sx={{ width: { md: "25%" }, pr: { md: 2 } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Aadhar Id
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.aadharId || "N/A"}
                  </Typography>
                </Box>

                {/* Class */}
                <Box sx={{ width: { md: "25%" }, pr: { md: 2 } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Class
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    Class {student.class || "N/A"}
                  </Typography>
                </Box>

                {(student.class === "11" || student.class === "12") && (
                  <Box sx={{ width: { md: "25%" }, pr: { md: 2 } }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Stream
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                      {student.stream || "N/A"}
                    </Typography>
                  </Box>
                )}
                {/* Optional Subjects for class 9-12 */}
                {["9", "10", "11", "12"].includes(student.class) && (
                  <Box sx={{ width: { md: "50%" }, pr: { md: 2 } }}>
                    {" "}
                    {/* Increased width to 50% */}
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Vocational Subjects
                    </Typography>
                    <Tooltip
                      title={
                        student.extraSubjects && student.extraSubjects.length > 0
                          ? student.extraSubjects.join(", ")
                          : "No vocational subjects"
                      }
                      arrow
                      placement="top"
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "500",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2, // Allow 2 lines
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.4,
                          maxHeight: "2.8em", // 2 lines * 1.4 line-height
                          cursor: "pointer",
                        }}
                      >
                        {student.extraSubjects && student.extraSubjects.length > 0
                          ? student.extraSubjects.join(", ")
                          : "N/A"}
                      </Typography>
                    </Tooltip>
                  </Box>
                )}
                {/* School Name */}
                <Box sx={{ width: { md: "50%" } }}> 
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    School Name
                  </Typography>
                  <Tooltip title={schoolName || "N/A"} arrow placement="top">
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2, // Allow 2 lines
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.4,
                        maxHeight: "2.8em", // 2 lines * 1.4 line-height
                        cursor: "pointer",
                      }}
                    >
                      {schoolName || "N/A"}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <AcademicOverviewGraph studentData={student} />
      </TabPanel>

      {/* Academics tab content */}
      <TabPanel value={tabValue} index={1}>
        <StudentAcademics
          studentId={studentId}
          schoolId={schoolId}
          academicData={student.academic}
          onTabChange={handleAcademicTabChange}
        />
      </TabPanel>

      {/* Download Modal - Enhanced for Student Reports */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onConfirm={handleDownloadConfirm}
        currentPageCount={1} // Always 1 for student reports
        totalRecords={1}
        subject={student.fullName}
        hideRowOptions={true} // Hide row selection for student reports
        reportTypes={[
          { value: "comprehensive", label: "Comprehensive Report (All Data)" },
          { value: "aggregate", label: "Aggregate Performance" },
          { value: "subjectwise", label: "Subject-wise Performance" },
          { value: "remedial", label: "Remedial Recommendations" },
        ]}
        showReportTypes={true} // Enable report type selection
        reportName="Student Profile Report"
        reportLevel="student"
      />

      <ToastContainer
        style={{ zIndex: 99999999 }}
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
      />
    </Box>
  );
};

export default StudentProfileView;
