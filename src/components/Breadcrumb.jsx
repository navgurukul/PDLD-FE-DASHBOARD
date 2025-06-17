import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const Breadcrumb = () => {
  const location = useLocation();
  if (location.pathname === "/reports") return null;
  const pathnames = location.pathname.split("/").filter((x) => x);
  
 const schoolName =
    location.state?.schoolData?.schoolName ||
    location.state?.schoolName ||
    localStorage.getItem("currentSchoolName") ||
    "School Detail";


  // Define path to label mapping
  const pathMap = {
    schools: "Schools",
    "add-school": "Add School",
    upload: "Bulk Upload",
    users: "Users",
    userCreationForm: "Add User",
    reports: "Reports",
    allTest: "Tests", // made changes
    testCreationForm: "Create Test",
    edit: "Edit Test", // made changes
    testCreation: "Test",
    help: "Help & Support",
    schoolDetail: "School Detail",
    addStudents: "Add Students",
    studentBulkUpload: "Student Bulk Upload",
    schoolSubmission: "School Submission",
    testDetails: "Test Details",
    schoolPerformance: "School Performance",

    // "school-performance": "School Performance",
    school: "School Management",
    studentReport: "Student Report",
    "student-profile": "Student Profile",
  };

  // Check if a string is a UUID
  const isUUID = (str) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  // Check if a string is numeric (for testDetails ID)
  const isNumeric = (str) => {
    return /^\d+$/.test(str);
  };

  // Create breadcrumb items with proper path handling
  const breadcrumbItems = [];
  let currentPath = "";
  let schoolDetailPath = "";

  // Add Home link as the first item
  // breadcrumbItems.push(
  //   <Typography
  //     key="home"
  //     variant="subtitle2"
  //     color="text.primary"
  //     component={Link}
  //     to="/"
  //     sx={{
  //       textDecoration: "none",
  //       fontFamily: "Work Sans",
  //       fontSize: "18px",
  //     }}
  //   >
  //     Home
  //   </Typography>
  // );

  // Special handling for schoolSubmission path
  let schoolSubmissionPath = "";

  // Process each pathname segment
  for (let i = 0; i < pathnames.length; i++) {
    const value = pathnames[i];
    currentPath += `/${value}`;

    // Handle Create Test breadcrumb
    if (value === "testCreationForm") {
      breadcrumbItems.push(
        <Typography
          key="/allTest"
          variant="subtitle2"
          color="text.primary"
          component={Link}
          to="/allTest"
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
          }}
        >
          Tests
        </Typography>
      );
      breadcrumbItems.push(
        <Typography
          key="/testCreationForm"
          variant="body2"
          color="text.disabled"
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
            fontWeight: 400,
          }}
        >
          Create Test
        </Typography>
      );
      continue;
    }
    // Handle testDetails breadcrumb
    if (value === "testDetails") {
      breadcrumbItems.push(
        <Typography
          key={currentPath}
          variant="body2"
          color="text.disabled"
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
            fontWeight: 400,
          }}
        >
          {(schoolName ? `${schoolName} ` : "") + "Test Details"}
        </Typography>
      );
      continue;
    }

    // if (
    //   value === "schoolDetail" &&
    //   i + 2 < pathnames.length &&
    //   pathnames[i + 1] &&
    //   pathnames[i + 2] === "student-profile"
    // ) {
    //   const schoolDetailLink = `/schools/schoolDetail/${pathnames[i + 1]}`;
    //   breadcrumbItems.push(
    //     <Typography
    //       key={currentPath}
    //       variant="subtitle2"
    //       color="text.primary"
    //       component={Link}
    //       to={schoolDetailLink}
    //       sx={{
    //         textDecoration: "none",
    //         fontFamily: "Work Sans",
    //         fontSize: "18px",
    //       }}
    //     >
    //       Students
    //     </Typography>
    //   );
    //   continue; // skip default schoolDetail
    // }
    // Handle Edit Test breadcrumb
    if (value === "editTest") {
      breadcrumbItems.push(
        <Typography
          key="/allTest"
          variant="subtitle2"
          color="text.primary"
          component={Link}
          to="/allTest"
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
          }}
        >
          Tests
        </Typography>
      );
      breadcrumbItems.push(
        <Typography
          key="/editTest"
          variant="body2"
          color="text.disabled"
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
            fontWeight: 400,
          }}
        >
          Edit Test
        </Typography>
      );
      continue;
    }

    // Save schoolDetail path with its UUID
    if (value === "schoolDetail" && i + 1 < pathnames.length && isUUID(pathnames[i + 1])) {
      schoolDetailPath = `/schools/schoolDetail/${pathnames[i + 1]}`;
    }

    // Save the path to schoolSubmission including its UUID
    if (value === "schoolSubmission" && i + 1 < pathnames.length && isUUID(pathnames[i + 1])) {
      schoolSubmissionPath = `/allTest/schoolSubmission/${pathnames[i + 1]}`;
    }
    if (value === "student-profile") continue;
    // Skip UUIDs and numeric IDs in breadcrumb display
    if (isUUID(value)) {
      // Check if it's the last segment and part of student-profile
      const isStudentProfile =
        i > 0 && pathnames[i - 1] === "student-profile" && location.state?.studentName;

      if (isStudentProfile) {
        breadcrumbItems.push(
          <Typography
            key={currentPath}
            variant="body2"
            color="text.disabled"
            sx={{
              textDecoration: "none",
              fontFamily: "Work Sans",
              fontSize: "18px",
              fontWeight: 400,
            }}
          >
            {location.state.studentName}
          </Typography>
        );
      }

      continue;
    }

    // Check if this is testDetails (which should be highlighted)
    const isTestDetails = value === "testDetails";

    // Determine if this is the last visible item or testDetails (which should always be highlighted)
    const isLast =
      isTestDetails ||
      i === pathnames.length - 1 ||
      (i < pathnames.length - 1 &&
        (isUUID(pathnames[i + 1]) || isNumeric(pathnames[i + 1])) &&
        i + 1 === pathnames.length - 1);

    // Use the path map to get a friendly name, or capitalize the first letter
     const displayName =
  value === "schoolDetail"
    ? schoolName
    : pathMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

    if (isLast) {
      breadcrumbItems.push(
        <Typography
          key={currentPath}
          variant="body2"
          color="text.disabled"
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
            fontWeight: 400,
          }}
        >
          {displayName}
        </Typography>
      );
    } else {
      // Determine the correct link path
      let linkTo = currentPath;

      // Use the stored paths for special cases
      if (value === "schoolSubmission") {
        linkTo = schoolSubmissionPath;
      } else if (value === "schoolDetail") {
        linkTo = schoolDetailPath;
      }

      breadcrumbItems.push(
        <Typography
          key={currentPath}
          variant="subtitle2"
          color="text.primary"
          component={Link}
          to={linkTo}
          sx={{
            textDecoration: "none",
            fontFamily: "Work Sans",
            fontSize: "18px",
          }}
        >
          {displayName}
        </Typography>
      );
    }
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon sx={{ width: "24px", height: "24px" }} />}
      aria-label="breadcrumb"
      sx={{
        mb: 1,
        pl: 10,
        mt: 5,
        fontFamily: "'Work Sans', sans-serif", // changed
        fontSize: "18px",
        "& .MuiBreadcrumbs-separator": {
          mx: "4px", // This reduces margin between items and separator
        },
      }}
    >
      {breadcrumbItems}
    </Breadcrumbs>
  );
};

export default Breadcrumb;






