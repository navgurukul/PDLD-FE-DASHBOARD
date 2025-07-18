import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PieChart from "../components/testReport/charts/PieChart";
import BarChart from "../components/testReport/charts/BarChart";
import StudentPerformanceTable from "../components/testReport/StudentPerformanceTable";
import apiInstance from "../../api";
import theme from "../theme/theme";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import LineChart from "../components/testReport/charts/LineChart";
import { Chip, Box } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DoneIcon from "@mui/icons-material/Done";

// Define the theme colors
const THEME_COLOR = "#2F4F4F";
const SECONDARY_COLOR = "#FFEBEB";

// Define pass threshold percentage (35% of max score)
const PASS_PERCENTAGE = 33;

// Define colors for remedial test grade levels
const REMEDIAL_GRADE_COLORS = [
  "#F45050", // Beginner - Red
  "#FF8A80", // Single Digit - Light Red
  "#FFCDD2", // Double Digit - Very Light Red
  "#A5D6A7", // Multiplication - Light Green
  "#228B22", // Division - Green
];

const SchoolReportPage = () => {
  const location = useLocation();
  const { schoolName, testName } = location.state || {};
  const { testId, schoolId } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("visualizations");
  const [passThreshold, setPassThreshold] = useState(0);

  // Helper function to check if test type is syllabus
  const isSyllabusTest = () => {
    return (
      testData?.testType?.toLowerCase().includes("syllabus") ||
      testName?.toLowerCase().includes("syllabus")
    );
  };

  // Helper function to check if test type is remedial
  const isRemedialTest = () => {
    return (
      testData?.testType?.toLowerCase().includes("remedial") ||
      testName?.toLowerCase().includes("remedial")
    );
  };

  // Calculate grade distribution for remedial tests - DYNAMIC
  const calculateGradeDistribution = (resultData) => {
    // First, get all unique grades from the API data (excluding null/absent students)
    const uniqueGrades = [
      ...new Set(
        resultData
          .filter((student) => !student.isAbsent && student.grade)
          .map((student) => student.grade)
      ),
    ].sort();

    // Initialize count object dynamically
    const gradeCount = {};
    uniqueGrades.forEach((grade) => {
      gradeCount[grade] = 0;
    });

    // Count students for each grade
    resultData.forEach((student) => {
      if (student.isAbsent || !student.grade) return;

      if (gradeCount.hasOwnProperty(student.grade)) {
        gradeCount[student.grade]++;
      }
    });

    // Convert to the format expected by BarChart and PieChart
    return uniqueGrades.map((grade) => ({
      label: grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase(), // Capitalize first letter
      value: gradeCount[grade],
    }));
  };

  // Calculate score distribution for the bar chart
  const calculateScoreDistribution = (students, maxScore) => {
    // Create ranges based on percentage of max score
    const ranges = [
      { label: "0-20%", value: 0 },
      { label: "21-40%", value: 0 },
      { label: "41-60%", value: 0 },
      { label: "61-80%", value: 0 },
      { label: "81-100%", value: 0 },
    ];

    students.forEach((student) => {
      // Skip absent students
      if (student.isAbsent) return;

      // Calculate percentage score relative to max score
      const percentageScore = (student.score / maxScore) * 100;

      if (percentageScore <= 20) ranges[0].value++;
      else if (percentageScore <= 40) ranges[1].value++;
      else if (percentageScore <= 60) ranges[2].value++;
      else if (percentageScore <= 80) ranges[3].value++;
      else ranges[4].value++;
    });

    return ranges;
  };

  // Get the highest achieved grade for remedial tests
  const getHighestAchievedGrade = (gradeDistribution) => {
    if (!gradeDistribution || gradeDistribution.length === 0) return { count: 0, total: 0 };

    // Define grade hierarchy (from lowest to highest)
    const gradeHierarchy = [
      "beginner",
      "single digit",
      "double digit",
      "multiplication",
      "division",
    ];

    let highestGradeIndex = -1;
    let highestGradeCount = 0;
    let totalStudents = 0;

    gradeDistribution.forEach((grade) => {
      totalStudents += grade.value;
      const gradeIndex = gradeHierarchy.findIndex((g) =>
        grade.label.toLowerCase().includes(g.toLowerCase())
      );

      if (gradeIndex > highestGradeIndex && grade.value > 0) {
        highestGradeIndex = gradeIndex;
        highestGradeCount = grade.value;
      }
    });

    return {
      count: highestGradeCount,
      total: totalStudents,
      gradeName: highestGradeIndex >= 0 ? gradeHierarchy[highestGradeIndex] : "division",
    };
  };

  // Fetch school-specific performance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get the authentication token from localStorage or wherever it's stored
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication token not found");
          setIsLoading(false);
          return;
        }

        // Set authorization header
        apiInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Use the API endpoint
        const response = await apiInstance.get(`/result/school/${schoolId}/${testId}`);

        if (response.data?.success && response.data?.data) {
          const apiData = response.data.data;

          // Calculate pass threshold (33% of max score)
          const threshold = Math.round((PASS_PERCENTAGE / 100) * apiData.maxScore);
          setPassThreshold(threshold);

          // Calculate average score
          const totalStudents = apiData.resultData.length;
          const totalScore = apiData.resultData.reduce((sum, student) => sum + student.score, 0);
          const avgScore = totalStudents ? Number((totalScore / totalStudents).toFixed(1)) : 0;

          // Count passed students
          const passedStudents = apiData.resultData.filter(
            (student) => student.score >= threshold
          ).length;
          const passRate = totalStudents ? Math.round((passedStudents / totalStudents) * 100) : 0;

          // Process data to match component structure
          const processedStudents = apiData.resultData.map((student) => ({
            id: student.studentId,
            name: student.studentName,
            score: student.score,
            isAbsent: student.isAbsent, // Add this line to preserve the isAbsent flag
            passed: !student.isAbsent && student.score >= threshold,
            // Calculate performance relative to max score
            percentage: student.isAbsent ? 0 : Math.round((student.score / apiData.maxScore) * 100),
            grade: student.grade,
          }));

          const processedData = {
            name: apiData.subject || "School Report",
            testName: apiData.testType || "Test",
            students: processedStudents,
            studentsTested: totalStudents,
            avgScore: avgScore,
            passRate: passRate,
            maxScore: apiData.maxScore,
            passThreshold: threshold,
            scoreDistribution: calculateScoreDistribution(processedStudents, apiData.maxScore),
            gradeDistribution: calculateGradeDistribution(apiData.resultData),
          };

          setTestData({
            testId: apiData.testId,
            testName: apiData.subject,
            testType: apiData.testType,
            createdAt: apiData.createdAt,
            subject: apiData.subject,
          });

          setSchoolData(processedData);
          setIsLoading(false);
        } else {
          setError("Invalid data format received from the server");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load school report. Please try again later.");
        toast.error("Failed to load school report. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [testId, schoolId]);

  const handleViewProfile = (studentId) => {
    // Show a toast notification
    toast.info(`Viewing profile for student ID: ${studentId}`);
  };

  const handleExportStudentData = (format = "csv") => {
    if (!schoolData || !schoolData.students) {
      toast.error("No student data available to export");
      return;
    }

    // Create CSV content
    const headers = ["Student Name", "Score", "Performance", "vs Class Avg"];
    const csvData = schoolData.students.map((student) => [
      student.name,
      `${student.score}/${schoolData.maxScore}`,
      student.passed ? "Achieved Target" : "Needs Improvement",
      `${student.score > schoolData.avgScore ? "+" : ""}${(
        student.score - schoolData.avgScore
      ).toFixed(1)}`,
    ]);

    // Create CSV content
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students-${schoolId}-test-${testId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <SpinnerPageOverlay isLoading={true} />;
  }

  if (error || !schoolData) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-red-500">{error || "Failed to load school data"}</h3>
      </div>
    );
  }

  const totalStudents = schoolData.students?.length || 0;
  const passedStudents = schoolData.students?.filter((s) => s.passed).length || 0;
  const failedStudents = totalStudents - passedStudents;

  // Get highest achieved grade info for remedial tests
  const highestGradeInfo = isRemedialTest()
    ? getHighestAchievedGrade(schoolData.gradeDistribution)
    : null;

  // Component for the Visualizations Tab
  const VisualizationsTab = () => (
    <>
      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Pass/Fail ratio chart or Grade Distribution chart */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-4 text-[#2F4F4F] text-center">
            {isRemedialTest() ? "Overall Proficiency" : "Class Performance"}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              {isRemedialTest() ? (
                // Multi-segment pie chart for remedial tests
                <PieChart
                  isMultiSegment={true}
                  segmentData={schoolData.gradeDistribution}
                  colors={REMEDIAL_GRADE_COLORS}
                  primaryColor={THEME_COLOR}
                  secondaryColor={SECONDARY_COLOR}
                  size={160}
                />
              ) : (
                // Regular pie chart for other tests
                <PieChart
                  percentage={schoolData.passRate}
                  primaryColor={THEME_COLOR}
                  secondaryColor={SECONDARY_COLOR}
                />
              )}

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                {isRemedialTest() ? (
                  // Legend for remedial test grades
                  schoolData.gradeDistribution.map((grade, index) => (
                    <div key={grade.label} className="flex items-center gap-1">
                      <span
                        className="inline-block"
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: REMEDIAL_GRADE_COLORS[index] || "#cccccc",
                          display: "inline-block",
                        }}
                      ></span>
                      <span
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: 12,
                          color: "#2F4F4F",
                        }}
                      >
                        {grade.label} ({Math.round((grade.value / totalStudents) * 100)}%)
                      </span>
                    </div>
                  ))
                ) : (
                  // Legend for pass/fail
                  <>
                    <div className="flex items-center gap-1">
                      <span
                        className="inline-block"
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#228B22",
                          display: "inline-block",
                        }}
                      ></span>
                      <span
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          color: "#2F4F4F",
                          marginRight: 18,
                        }}
                      >
                        Passed ({schoolData.passRate}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className="inline-block"
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#F45050",
                          display: "inline-block",
                        }}
                      ></span>
                      <span
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          color: "#2F4F4F",
                        }}
                      >
                        Failed ({100 - schoolData.passRate}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className="mt-2 text-center font-semibold text-[#2F4F4F]"
            style={{ fontFamily: "Work Sans", fontSize: 14, fontWeight: 400 }}
          >
            {isRemedialTest()
              ? `${highestGradeInfo?.count || 0} out of ${totalStudents} Students Achieved ${
                  highestGradeInfo?.gradeName?.charAt(0).toUpperCase() +
                    highestGradeInfo?.gradeName?.slice(1) || "Division"
                } Grade`
              : `${passedStudents} out of ${totalStudents} Students Passed`}
          </div>
        </div>

        {/* Score distribution chart */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-4 text-[#2F4F4F] text-center">
            {isRemedialTest() ? "Student Distribution by Grade" : "Marks Distribution"}
          </h3>
          <div className="h-64 flex items-center justify-center">
            {/* Using the BarChart with the same theme color */}
            <BarChart
              data={isRemedialTest() ? schoolData.gradeDistribution : schoolData.scoreDistribution}
              primaryColor={THEME_COLOR}
            />
          </div>
        </div>
      </div>

      {/* Line Chart - Only show for syllabus tests */}
      {isSyllabusTest() && (
        <div className="bg-white p-4 rounded shadow mb-20" >
          <h3
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#2F4F4F",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            Student Marks Analysis
          </h3>
          <div className="h-100 flex items-center justify-center">
            <LineChart
              data={schoolData.students}
              averageScore={schoolData.avgScore}
              primaryColor={THEME_COLOR}
            />
          </div>
        </div>
      )}
    </>
  );

  // Component for the Students Tab
  const StudentsTab = () => (
    <StudentPerformanceTable
      students={schoolData.students}
      classAvg={schoolData.avgScore}
      maxScore={schoolData.maxScore}
      passThreshold={schoolData.passThreshold}
      onViewProfile={handleViewProfile}
      onExport={handleExportStudentData}
      testType={testData?.testType}
      subject={testData?.subject}
      schoolName={schoolName}
      testName={testName}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper px-3 sm:px-4">
        {/* School Header */}
        <div className="mb-6 flex justify-between">
          <div>
            <h5
              className="mt-5"
              style={{ fontFamily: "'Philosopher', sans-serif", fontWeight: 700 }}
            >
              {schoolName} Test Details
            </h5>
            <div
              className="mt-6 font-bold text-[24px] text-[#2F4F4F]"
              style={{ fontFamily: "'Philosopher', sans-serif", fontWeight: 700 }}
            >
              {testName}
            </div>
          </div>

          {/* Performance Metrics */}
          <Box className="flex flex-wrap gap-3 items-center mb-6">
            <Chip
              icon={<PeopleAltIcon style={{ fontSize: "16px" }} />}
              label={`Students Tested: ${schoolData.studentsTested}`}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "100px",
                height: "32px",
                bgcolor: "#f5f5f5",
                fontWeight: 400,
                fontSize: "14px",
                fontFamily: "Work Sans",
                color: "#2F4F4F",
                "& .MuiChip-icon": { color: "#2F4F4F" },
              }}
            />
            <Chip
              icon={<DoneIcon style={{ fontSize: "16px" }} />}
              label={
                isRemedialTest()
                  ? `${
                      highestGradeInfo?.gradeName?.charAt(0).toUpperCase() +
                        highestGradeInfo?.gradeName?.slice(1) || "Division"
                    } Grade: ${Math.round(((highestGradeInfo?.count || 0) / totalStudents) * 100)}%`
                  : `Success Rate: ${schoolData.passRate}%`
              }
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "100px",
                height: "32px",
                bgcolor: "#e8f5e9",
                fontWeight: 400,
                fontSize: "14px",
                fontFamily: "Work Sans",
                color: "#2e7d32",
                "& .MuiChip-icon": { color: "#2e7d32" },
              }}
            />
          </Box>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-1 mr-4 font-medium`}
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: activeTab === "visualizations" ? 600 : 400,
              fontSize: "18px",
              color: activeTab === "visualizations" ? "#2F4F4F" : "#949494",
              borderBottom: activeTab === "visualizations" ? "2px solid #2F4F4F" : "none",
              background: "none",
              outline: "none",
            }}
            onClick={() => setActiveTab("visualizations")}
          >
            Overall Class Performance
          </button>
          <button
            className={`py-2 px-4 font-medium`}
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: activeTab === "students" ? 600 : 400,
              fontSize: "18px",
              color: activeTab === "students" ? "#2F4F4F" : "#949494",
              borderBottom: activeTab === "students" ? "2px solid #2F4F4F" : "none",
              background: "none",
              outline: "none",
            }}
            onClick={() => setActiveTab("students")}
          >
            Student Wise Performance
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "visualizations" && <VisualizationsTab />}
          {activeTab === "students" && <StudentsTab />}
        </div>

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
};

export default SchoolReportPage;
