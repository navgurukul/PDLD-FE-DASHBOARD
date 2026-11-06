import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "react-toastify/dist/ReactToastify.css";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import StudentDetails from "./StudentDetails";
import SchoolReport from "../components/school/SchoolReport";
import ButtonCustom from "./ButtonCustom";
import { useTheme } from "@mui/material/styles";
import { getCurrentAcademicYear } from "../utils/academicYear";
import apiInstance from "../../api";
import { getErrorMessage } from "../utils/apiError";
import LoadError from "./LoadError";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#2F4F4F",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          "&.Mui-selected": {
            color: "#2F4F4F",
          },
        },
      },
    },
  },
});

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`school-tabpanel-${index}`}
      aria-labelledby={`school-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// The school's login password must never be kept in the browser
const withoutPassword = (school) => {
  const copy = { ...(school || {}) };
  delete copy.passwordHash;
  delete copy.password;
  return copy;
};

// Saved data belongs to the school in the address bar. Data passed with a click may have no id (trusted then).
const isSameSchool = (school, schoolId, trustMissingId) => {
  const id = school?.id ?? school?.schoolId;
  if (id === undefined || id === null || id === "") return trustMissingId;
  return String(id) === String(schoolId);
};

// The school's details when the page was not opened from the school list
async function loadSchoolFromServer(schoolId) {
  const res = await apiInstance.get(`/student/school/${schoolId}`);
  const summary = res.data?.data?.data;
  if (!summary?.udiseCode) throw new Error("This school was not found. It may have been deleted.");
  let full = {};
  try {
    const byUdise = await apiInstance.get(`/school/udise/${encodeURIComponent(summary.udiseCode)}`);
    full = byUdise.data?.data || {};
  } catch (error) {
    console.error("Could not load the full school record; showing the summary", error);
  }
  const schoolData = {
    ...full,
    id: schoolId,
    schoolName: summary.schoolName ?? full.schoolName,
    udiseCode: summary.udiseCode,
    blockName: summary.blockName ?? full.blockName,
    clusterName: summary.clusterName ?? full.clusterName,
    assignedCAC: summary.assignedCAC ?? full.assignedCAC,
    assignedCP: summary.assignedCP ?? full.assignedCP,
  };
  return { schoolData, academicYear: summary.academicYear };
}

export default function SchoolDetailView() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { state } = useLocation();
  const [tabValue, setTabValue] = useState(state?.selectedTab || 0); // Default to Schoool Details tab if no state provided

  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    const show = (schoolData, apiAcademicYear) => {
      if (cancelled) return;
      const safe = withoutPassword(schoolData);
      setSchool(safe);
      setAcademicYear(apiAcademicYear || null);
      setLoadError(null);
      setIsLoading(false);
      // Kept for a page reload; only ever used again for this same school
      localStorage.setItem("currentSchoolData", JSON.stringify(safe));
      if (safe.schoolName) localStorage.setItem("currentSchoolName", safe.schoolName);
      if (apiAcademicYear) {
        localStorage.setItem("currentAcademicYear", apiAcademicYear);
      } else {
        localStorage.removeItem("currentAcademicYear");
      }
    };

    // 1. Opened from the school list: the school came with the click
    if (state?.schoolData && isSameSchool(state.schoolData, schoolId, true)) {
      show(state.schoolData, state.academicYear);
    } else {
      // 2. A reload of the same school
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem("currentSchoolData") || "null");
      } catch (e) {
        console.error("Error parsing stored school data", e);
      }
      if (stored && isSameSchool(stored, schoolId, false)) {
        show(stored, localStorage.getItem("currentAcademicYear"));
      } else {
        // 3. A link, a new tab, or back from a student page: ask the server, never show the last school viewed
        setIsLoading(true);
        loadSchoolFromServer(schoolId)
          .then(({ schoolData, academicYear: year }) => show(schoolData, year))
          .catch((error) => {
            if (cancelled) return;
            console.error("Error loading school", error);
            setSchool(null);
            setLoadError(getErrorMessage(error, "Could not load this school. Please try again."));
            setIsLoading(false);
          });
      }
    }

    // Store the schoolId in localStorage for breadcrumb use
    if (schoolId) {
      localStorage.setItem("lastSchoolId", schoolId);
    }
    return () => {
      cancelled = true;
    };
  }, [state, schoolId, reloadKey]);

  useEffect(() => {
    // Agar schoolData ya schoolName state me ho to localStorage me save karo
    if (state?.schoolData?.schoolName) {
      localStorage.setItem("currentSchoolName", state.schoolData.schoolName);
    } else if (state?.schoolName) {
      localStorage.setItem("currentSchoolName", state.schoolName);
    }
  }, [state]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to capitalize only the first letter and make rest lowercase
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Navigate back to school list
  const handleBack = () => {
    navigate("/schools");
  };

  // Navigate to edit school page
  const handleEditSchool = () => {
    navigate(`/schools/update/${schoolId}`, {
      state: { schoolData: school },
    });
  };

  // Get CAC name from school data
  const getCACName = () => {
    if (school.assignedCAC && school.assignedCAC.name) {
      return school.assignedCAC.name;
    }
    return "Not Assigned";
  };

  // Get CP name from school data
  const getCPName = () => {
    if (
      school.assignedCP &&
      typeof school.assignedCP === "object" &&
      school.assignedCP.name
    ) {
      return school.assignedCP.name;
    }
    return "Not Assigned";
  };

  // Render loading state
  if (isLoading) {
    return <SpinnerPageOverlay isLoading={isLoading} />;
  }

  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <LoadError
          title="Could not load this school"
          message={loadError}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
        <ButtonCustom text={"Back to Schools"} startIcon={<ArrowBackIcon />} variant="contained" onClick={handleBack} />
      </Box>
    );
  }

  // Render error state if school not found
  if (!school) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5">School not found</Typography>
        <ButtonCustom
          text={"Back to Schools"}
          startIcon={<ArrowBackIcon />}
          variant="contained"
          onClick={handleBack}
        />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper sm:px-4">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: { xs: 2, md: 0 },
            mb: 1,
            mt: { xs: 2, md: 0 },
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
            <h5 className="text-lg font-bold text-[#2F4F4F]">
              {school.udiseCode} - {capitalizeFirstLetter(school.schoolName)}
            </h5>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              mt: { xs: 1, md: 0 },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                bgcolor: theme.palette.secondary.light,
                color: theme.palette.primary.main,
                padding: "4px 16px",
                borderRadius: "8px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                whiteSpace: "nowrap",
                width: { xs: "100%", md: "auto" },
              }}
            >
              Academic Year {academicYear || school.academicYear || getCurrentAcademicYear()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, mt: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="school detail tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: "48px",
              "& .MuiTab-root": {
                fontFamily: "Work Sans",
                fontSize: "18px",
                fontStyle: "normal",
                lineHeight: "170%",
                textTransform: "none",
                color: "#597272",
                fontWeight: 400,
                minWidth: "unset",
                padding: "12px 0px",
                marginRight: "24px",
                minHeight: "48px",
              },
              "& .Mui-selected": {
                color: "#2F4F4F",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#2F4F4F",
              },
            }}
          >
            <Tab label="School Details" />
            <Tab label="Students" />
            <Tab label="Report" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Philosopher', sans-serif",
                      fontWeight: 700,
                      fontSize: "24px",
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    Basic Information
                  </Typography>
                  {/* <Divider sx={{ mb: 2 }} /> */}

                  <Grid container spacing={2}>
                    {/* School Name label */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        School Name
                      </Typography>
                    </Grid>
                    {/* School Name value */}
                    <Grid item xs={12}>
                      <Typography
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {capitalizeFirstLetter(school.schoolName)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        UDISE Code
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {school.udiseCode}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        Created On
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {new Date(school.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Philosopher', sans-serif",
                      fontWeight: 700,
                      fontSize: "24px",
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    Location Details
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Labels row */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        Cluster
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {capitalizeFirstLetter(school.clusterName)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        Block
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {capitalizeFirstLetter(school.blockName)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Philosopher', sans-serif",
                      fontWeight: 700,
                      fontSize: "24px",
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    Administrative Staff
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Labels row */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        Cluster Academic Coordinator
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {getCACName()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "18px",
                        }}
                      >
                        Cluster Principal
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "18px",
                          color: "#2F4F4F",
                        }}
                      >
                        {getCPName()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Use the StudentDetails component here */}
          <StudentDetails schoolId={schoolId} schoolName={school.schoolName} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Use the SchoolReport component here */}
          <SchoolReport schoolId={schoolId} schoolName={school.schoolName} />
        </TabPanel>

      </div>
    </ThemeProvider>
  );
}
