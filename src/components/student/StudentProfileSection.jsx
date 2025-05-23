//student profile page inside school flow
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, Grid, Paper, Tabs, Tab, Button, Alert } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import StudentAcademics from "./StudentAcademics";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import ButtonCustom from "../../components/ButtonCustom";
import DownloadModal from "../../components/modal/DownloadModal"; // Add this import
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
  
  // Add download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [currentAcademicTab, setCurrentAcademicTab] = useState("aggregate"); // Track which academic sub-tab is active
  const [academicData, setAcademicData] = useState({
    aggregate: { count: 0, data: [] },
    subjectwise: { count: 0, data: [] }
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

  // Handle download button click
  const handleDownloadClick = () => {
    // Only show modal if we're in the academics tab (tabValue === 1)
    if (tabValue === 1) {
      setShowDownloadModal(true);
    }
  };

  // Handle download modal confirm
  const handleDownloadConfirm = async (downloadOptions) => {
    try {
      const { format, rows, count } = downloadOptions;
      
      // Prepare download parameters
      const downloadParams = {
        studentId: studentId,
        schoolId: schoolId,
        format: format,
        tableType: currentAcademicTab, // aggregate or subjectwise
        rowCount: count,
        academicYear: student?.academic?.year || "2024-25"
      };

      // Make API call to download report
      const response = await apiInstance.post('/student/download-report', downloadParams, {
        responseType: 'blob' // Important for file downloads
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format and table type
      const filename = `${student.fullName}_${currentAcademicTab}_report.${format}`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${currentAcademicTab} report downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };

  // Function to receive academic tab change from StudentAcademics component
  const handleAcademicTabChange = (tabType, data) => {
    setCurrentAcademicTab(tabType);
    setAcademicData(prev => ({
      ...prev,
      [tabType]: data
    }));
  };

  // Get current page count based on active academic tab
  const getCurrentPageCount = () => {
    return academicData[currentAcademicTab]?.count || 0;
  };

  // Get total records count
  const getTotalRecords = () => {
    return academicData[currentAcademicTab]?.data?.length || 0;
  };

  // Get display name for current table type
  const getTableDisplayName = () => {
    switch (currentAcademicTab) {
      case "aggregate":
        return "Aggregate Performance";
      case "subjectwise":
        return "Subject-wise Performance";
      default:
        return "Academic Performance";
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
        });
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

        {/* Show academic year text in academic tab */}
        {tabValue === 1 && student.academic ? (
          <div
            className="
          flex
           "
          >
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
                marginRight: "16px",
              }}
            >
              Academic Year {student.academic.year || "2024-25"}
            </Typography>
            <ButtonCustom
              onClick={handleDownloadClick}
              text="Download Report"
              style={{
                height: "48px",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            />
          </div>
        ) : null}
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
                <h5 className="text-lg font-bold text-[#2F4F4F]">Personal Details</h5>

                <ButtonCustom
                  text={"Edit Profile"}
                  imageName={EditPencilIcon}
                  onClick={handleEditStudent}
                />
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
        {/* <AcademicOverviewGraph data={academicData} /> */}
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

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={handleDownloadConfirm}
        currentPageCount={getCurrentPageCount()}
        totalRecords={getTotalRecords()}
        subject={getTableDisplayName()}
        tableType={currentAcademicTab}
      />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
    </Box>
  );
};

export default StudentProfileView;