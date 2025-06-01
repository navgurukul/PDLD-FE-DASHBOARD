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
const PASS_PERCENTAGE = 35;

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

  // Calculate score distribution for the bar chart
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

          // Calculate pass threshold (35% of max score)
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
          // Process data to match component structure
          const processedStudents = apiData.resultData.map((student) => ({
            id: student.studentId,
            name: student.studentName,
            score: student.score,
            isAbsent: student.isAbsent, // Add this line to preserve the isAbsent flag
            passed: !student.isAbsent && student.score >= threshold,
            // Calculate performance relative to max score
            percentage: student.isAbsent ? 0 : Math.round((student.score / apiData.maxScore) * 100),
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
          };

          setTestData({
            testId: apiData.testId,
            testName: apiData.subject,
            testType: apiData.testType,
            createdAt: apiData.createdAt,
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

  // Component for the Visualizations Tab
  const VisualizationsTab = () => (
    <>
      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Pass/Fail ratio chart */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-4 text-[#2F4F4F] text-center">Class Performance</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              {/* Using the PieChart with single color theme */}
              <PieChart
                percentage={schoolData.passRate}
                primaryColor={THEME_COLOR}
                secondaryColor={SECONDARY_COLOR}
              />
              <div className="mt-4 flex items-center justify-center gap-4">
                {/* Passed */}
                <span
                  className="inline-block mr-1"
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
                {/* Failed */}
                <span
                  className="inline-block mr-1"
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
            </div>
          </div>
          <div
            className="mt-2 text-center font-semibold text-[#2F4F4F]"
            style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 14 }}
          >
            {passedStudents} out of {totalStudents} Students Passed
          </div>
        </div>

        {/* Score distribution chart */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-4 text-[#2F4F4F] text-center">Marks Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {/* Using the BarChart with the same theme color */}
            <BarChart data={schoolData.scoreDistribution} primaryColor={THEME_COLOR} />
          </div>
        </div>
      </div>

      {/* Line Chart - Full width */}
      <div className="bg-white p-4 rounded shadow mb-20">
        <h3
          style={{
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            color: "#2F4F4F",
            textAlign: "center",
            marginBottom: "4px",
          }}
        >
          Student Marks Analysis
        </h3>
        <div className="h-90 flex items-center justify-center">
          <LineChart
            data={schoolData.students}
            averageScore={schoolData.avgScore}
            primaryColor={THEME_COLOR}
          />
        </div>
      </div>
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
            {/* <div className="text-sm text-gray-600">
              <span>{testData?.testName || "Test Details"}</span>
              <span className="mx-1">•</span>
              <span>
                Pass Threshold: {schoolData.passThreshold} ({PASS_PERCENTAGE}% of{" "}
                {schoolData.maxScore})
              </span>
            </div> */}
          </div>

          {/* Performance Metrics */}
          <Box className="flex flex-wrap gap-3 items-center mb-6">
            <Chip
              icon={<PeopleAltIcon style={{ fontSize: "16px" }} />}
              label={`Students Tested: ${schoolData.studentsTested}`}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "8px",
                bgcolor: "#f5f5f5",
                fontWeight: 600,
                color: "#2F4F4F",
                "& .MuiChip-icon": { color: "#2F4F4F" },
              }}
            />
            <Chip
              icon={<DoneIcon style={{ fontSize: "16px" }} />}
              label={`Success Rate: ${schoolData.passRate}%`}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "8px",
                bgcolor: "#e8f5e9",
                fontWeight: 600,
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
        />
      </div>
    </ThemeProvider>
  );
};

export default SchoolReportPage;
