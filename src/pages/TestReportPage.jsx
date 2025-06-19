import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SchoolPerformanceTable from "../components/testReport/SchoolPerformanceTable";
import apiInstance from "../../api";
import theme from "../theme/theme";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";

// Import mock data and helper functions
import { MOCK_TESTS, formatDate } from "../data/testReportData";

// Flag to toggle between mock data and API calls
const USE_MOCK_DATA = true;

const TestReportPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch test details and school performance data
  useEffect(() => {
    const fetchTestReport = async () => {
      try {
        setIsLoading(true);

        // For mock data, always show the first test regardless of ID
        if (USE_MOCK_DATA) {
          // Simulate API delay
          setTimeout(() => {
            // Always use the first test from mock data regardless of ID
            const mockTest = MOCK_TESTS[0];
            if (mockTest) {
              setTestData(mockTest);
            } else {
              setError("Mock data not available");
            }
            setIsLoading(false);
          }, 500);
          return;
        }

        // For API, use the actual ID
        const response = await apiInstance.get(`/test/${testId}/report`);

        if (response.data && response.data.data) {
          setTestData(response.data.data);
        } else {
          setError("Invalid data format received from the server");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching test report:", err);
        setError("Failed to load test report. Please try again later.");
        toast.error("Failed to load test report. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchTestReport();
  }, [testId]);

  const handleBackToTests = () => {
    navigate("/allTest");
  };

  const handleSendReminder = (schoolId) => {
    // Show notification
    toast.info(`Sending reminder to school ID: ${schoolId}`);

    // Call API to send reminder
    apiInstance
      .post(`/test/${testId}/school/${schoolId}/remind`)
      .then(() => {
        toast.success("Reminder sent successfully");
      })
      .catch((err) => {
        toast.error("Failed to send reminder");
        console.error(err);
      });
  };
  // In TestReportPage.jsx

  if (isLoading) {
    return <SpinnerPageOverlay isLoading={true} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-red-500">{error}</h3>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleBackToTests}
        >
          Back to Tests
        </button>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper px-3 sm:px-4">
        {testData && (
          <>
            <SchoolPerformanceTable
              totalSchools={testData.totalSchools}
              schoolsSubmitted={testData.schoolsSubmitted}
              submissionRate={(testData.schoolsSubmitted / testData.totalSchools) * 100}
              overallPassRate={testData.overallPassRate}
              pendingSchools={testData.pendingSchoolsols}
              schools={testData.schools}
              onSchoolSelect={(schoolId) =>
                navigate(`/allTest/schoolSubmission/${testId}/testDetails/${schoolId}`)
              }
              onSendReminder={handleSendReminder}
            />
          </>
        )}

        <ToastContainer
          style={{ zIndex: 99999999 }}
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
        />
      </div>
    </ThemeProvider>
  );
};

export default TestReportPage;
