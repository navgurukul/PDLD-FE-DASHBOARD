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
import DownloadModal from "../../components/modal/DownloadModal"; // Import the download modal
import apiInstance from "../../../api";
import {
  EditPencilIcon,
  bloodImage,
  heightImageStudent,
  weightScale,
  person,
  house,
  fingerprint,
  calendar_today,
} from "../../utils/imagePath";
import AcademicOverviewGraph from "../graph/AcademicOverviewGraph";

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
  const [academicData, setAcademicData] = useState({
    aggregate: [],
    subjectwise: [],
    remedial: [],
  });

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

  // Fetch academic performance data
  const fetchAcademicData = async () => {
    try {
      // Fetch aggregate data
      const aggregateResponse = await apiInstance.get(`/student/academic/aggregate/${studentId}`);

      // Fetch subjectwise data
      const subjectwiseResponse = await apiInstance.get(
        `/student/academic/subjectwise/${studentId}`
      );

      // Fetch remedial data
      const remedialResponse = await apiInstance.get(`/student/academic/remedial/${studentId}`);

      setAcademicData({
        aggregate: aggregateResponse.data?.success ? aggregateResponse.data.data || [] : [],
        subjectwise: subjectwiseResponse.data?.success ? subjectwiseResponse.data.data || [] : [],
        remedial: remedialResponse.data?.success ? remedialResponse.data.data || [] : [],
      });
    } catch (error) {
      console.error("Error fetching academic data:", error);
      // Set empty data if API calls fail
      setAcademicData({
        aggregate: [],
        subjectwise: [],
        remedial: [],
      });
    }
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
        await fetchAcademicData();
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

      if (format === "csv") {
        handleDownloadCSV(reportType);
      } else {
        handleDownloadPDF(reportType);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  // Download report as CSV
  const handleDownloadCSV = (reportType) => {
    let csvContent = "";
    let filename = "";

    if (reportType === "aggregate" || reportType === "comprehensive") {
      // Aggregate Report CSV
      const aggregateHeaders = [
        "Test Name",
        "Test Date",
        "Total Marks",
        "Obtained Marks",
        "Percentage",
        "Grade",
        "Rank",
      ];

      csvContent += "AGGREGATE PERFORMANCE REPORT\n";
      csvContent += `Student: ${student.fullName}\n`;
      csvContent += `Class: ${student.class}\n`;
      csvContent += `School: ${schoolName}\n\n`;
      csvContent += aggregateHeaders.join(",") + "\n";

      academicData.aggregate.forEach((test) => {
        const rowData = [
          test.testName || "N/A",
          formatDate(test.testDate) || "N/A",
          test.totalMarks || "N/A",
          test.obtainedMarks || "N/A",
          test.percentage || "N/A",
          test.grade || "N/A",
          test.rank || "N/A",
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
    }

    if (reportType === "subjectwise" || reportType === "comprehensive") {
      if (csvContent) csvContent += "\n\n";

      // Subjectwise Report CSV
      const subjectwiseHeaders = [
        "Subject",
        "Test Name",
        "Test Date",
        "Max Marks",
        "Obtained Marks",
        "Percentage",
        "Grade",
      ];

      csvContent += "SUBJECT-WISE PERFORMANCE REPORT\n";
      if (reportType === "subjectwise") {
        csvContent += `Student: ${student.fullName}\n`;
        csvContent += `Class: ${student.class}\n`;
        csvContent += `School: ${schoolName}\n\n`;
      }
      csvContent += subjectwiseHeaders.join(",") + "\n";

      academicData.subjectwise.forEach((subject) => {
        const rowData = [
          subject.subjectName || "N/A",
          subject.testName || "N/A",
          formatDate(subject.testDate) || "N/A",
          subject.maxMarks || "N/A",
          subject.obtainedMarks || "N/A",
          subject.percentage || "N/A",
          subject.grade || "N/A",
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
    }

    if (reportType === "remedial" || reportType === "comprehensive") {
      if (csvContent) csvContent += "\n\n";

      // Remedial Report CSV
      const remedialHeaders = ["Subject", "Topic", "Weakness Level", "Recommendation", "Priority"];

      csvContent += "REMEDIAL RECOMMENDATIONS\n";
      if (reportType === "remedial") {
        csvContent += `Student: ${student.fullName}\n`;
        csvContent += `Class: ${student.class}\n`;
        csvContent += `School: ${schoolName}\n\n`;
      }
      csvContent += remedialHeaders.join(",") + "\n";

      academicData.remedial.forEach((item) => {
        const rowData = [
          item.subject || "N/A",
          item.topic || "N/A",
          item.weaknessLevel || "N/A",
          item.recommendation || "N/A",
          item.priority || "N/A",
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
    }

    // Set filename based on report type
    const reportTypeText =
      reportType === "comprehensive"
        ? "Comprehensive"
        : reportType === "aggregate"
        ? "Aggregate"
        : reportType === "subjectwise"
        ? "SubjectWise"
        : "Remedial";

    filename = `${student.fullName}_${reportTypeText}_Report_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
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

    const reportTypeText =
      reportType === "comprehensive"
        ? "Comprehensive Academic"
        : reportType === "aggregate"
        ? "Aggregate Performance"
        : reportType === "subjectwise"
        ? "Subject-wise Performance"
        : "Remedial";

    // Generate HTML content for the PDF
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
              <div class="info-item">
                <strong>Full Name:</strong>
                ${student.fullName}
              </div>
              <div class="info-item">
                <strong>Class:</strong>
                Class ${student.class}
              </div>
              <div class="info-item">
                <strong>Father's Name:</strong>
                ${student.fatherName || "N/A"}
              </div>
              <div class="info-item">
                <strong>Mother's Name:</strong>
                ${student.motherName || "N/A"}
              </div>
              <div class="info-item">
                <strong>Date of Birth:</strong>
                ${formatDate(student.dob)}
              </div>
              <div class="info-item">
                <strong>School:</strong>
                ${schoolName || "N/A"}
              </div>
            </div>
          </div>
          
          ${
            (reportType === "aggregate" || reportType === "comprehensive") &&
            academicData.aggregate.length > 0
              ? `
          <div class="section">
            <h2>Aggregate Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Test Date</th>
                  <th>Total Marks</th>
                  <th>Obtained Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                ${academicData.aggregate
                  .map((test) => {
                    const percentage = parseFloat(test.percentage);
                    const scoreClass =
                      percentage < 40 ? "low-score" : percentage >= 80 ? "high-score" : "";

                    return `
                    <tr>
                      <td>${test.testName || "N/A"}</td>
                      <td>${formatDate(test.testDate) || "N/A"}</td>
                      <td>${test.totalMarks || "N/A"}</td>
                      <td>${test.obtainedMarks || "N/A"}</td>
                      <td class="${scoreClass}">${
                      test.percentage ? test.percentage + "%" : "N/A"
                    }</td>
                      <td>${test.grade || "N/A"}</td>
                      <td>${test.rank || "N/A"}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }
          
          ${
            (reportType === "subjectwise" || reportType === "comprehensive") &&
            academicData.subjectwise.length > 0
              ? `
          <div class="section">
            <h2>Subject-wise Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Test Name</th>
                  <th>Test Date</th>
                  <th>Max Marks</th>
                  <th>Obtained Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                ${academicData.subjectwise
                  .map((subject) => {
                    const percentage = parseFloat(subject.percentage);
                    const scoreClass =
                      percentage < 40 ? "low-score" : percentage >= 80 ? "high-score" : "";

                    return `
                    <tr>
                      <td>${subject.subjectName || "N/A"}</td>
                      <td>${subject.testName || "N/A"}</td>
                      <td>${formatDate(subject.testDate) || "N/A"}</td>
                      <td>${subject.maxMarks || "N/A"}</td>
                      <td>${subject.obtainedMarks || "N/A"}</td>
                      <td class="${scoreClass}">${
                      subject.percentage ? subject.percentage + "%" : "N/A"
                    }</td>
                      <td>${subject.grade || "N/A"}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }
          
          ${
            (reportType === "remedial" || reportType === "comprehensive") &&
            academicData.remedial.length > 0
              ? `
          <div class="section">
            <h2>Remedial Recommendations</h2>
            ${academicData.remedial
              .map(
                (item) => `
              <div class="remedial-item">
                <h4>${item.subject || "General"} - ${item.topic || "N/A"}</h4>
                <p><strong>Weakness Level:</strong> ${item.weaknessLevel || "N/A"}</p>
                <p><strong>Recommendation:</strong> ${item.recommendation || "N/A"}</p>
                <p><strong>Priority:</strong> ${item.priority || "N/A"}</p>
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
              <div class="summary-item">
                <strong>Report Type:</strong>
                ${reportTypeText}
              </div>
              <div class="summary-item">
                <strong>Academic Year:</strong>
                ${student.academic?.year || "2024-25"}
              </div>
              <div class="summary-item">
                <strong>Generated:</strong>
                ${currentDate}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This report is generated automatically from the School Performance System</p>
            <p>© 2024-25 Academic Performance Tracking System</p>
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
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "24px 0px",
        }}
      >
        <Box sx={{ display: "flex" }}>
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
          <div className="flex">
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
                marginRight: tabValue === 1 ? "16px" : 0,
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
                  justifyContent: "space-between",
                  alignItems: "center",
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
              <Box sx={{ display: "flex", mb: 3 }}>
                {/* Father's Name */}
                <Box sx={{ width: "25%", pr: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Father's Name
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.fatherName || "N/A"}
                  </Typography>
                </Box>

                {/* Mother's Name */}
                <Box sx={{ width: "25%", pr: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Mother's Name
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.motherName || "N/A"}
                  </Typography>
                </Box>

                {/* Date of Birth */}
                <Box sx={{ width: "25%", pr: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {formatDate(student.dob)}
                  </Typography>
                </Box>

                {/* Hostel */}
                <Box sx={{ width: "25%" }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Hostel
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.hostel || "N/A"}
                  </Typography>
                </Box>
              </Box>

              {/* Second Row */}
              <Box sx={{ display: "flex" }}>
                {/* Aadhar Id */}
                <Box sx={{ width: "25%", pr: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Aadhar Id
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.aadharId || "N/A"}
                  </Typography>
                </Box>

                {/* Apar Id */}
                <Box sx={{ width: "25%", pr: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Apar Id
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {student.aparId || "N/A"}
                  </Typography>
                </Box>

                {/* Class */}
                <Box sx={{ width: "25%", pr: 2 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Class
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    Class {student.class || "N/A"}
                  </Typography>
                </Box>

                {(student.class === "11" || student.class === "12") && (
                  <Box sx={{ width: "25%", pr: 2 }}>
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
                  <Box sx={{ width: "25%" }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Optional Subjects
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                      {student.extraSubjects && student.extraSubjects.length > 0
                        ? student.extraSubjects.join(", ")
                        : "N/A"}
                    </Typography>
                  </Box>
                )}
                {/* School Name */}
                <Box sx={{ width: "25%" }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    School Name
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                    {schoolName || "N/A"}
                  </Typography>
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
      />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
    </Box>
  );
};

export default StudentProfileView;
