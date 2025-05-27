import { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Paper,
  FormHelperText,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import apiInstance from "../../../api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "../../components/ButtonCustom";
import { toast, ToastContainer } from "react-toastify";
import SpinnerPageOverlay from "../../components/SpinnerPageOverlay";
import { format } from "date-fns";
import ConfirmationModal from "../modal/ConfirmationModal";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#007BFF",
          color: "white",
          "&:hover": {
            backgroundColor: "#0069D9",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2F4F4F",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "#2F4F4F",
          },
        },
      },
    },
  },
});

// Define stream options
const streamOptions = [
  { value: "MATHS", label: "MATHS" },
  { value: "BIO", label: "BIO" },
  { value: "COMMERCE", label: "COMMERCE" },
  { value: "ARTS", label: "ARTS" },
  { value: "AGRICULTURE", label: "AGRICULTURE" },
];

const vocationalOptions = [
  { value: "IT", label: "IT" },
  { value: "HEALTH CARE", label: "HEALTH CARE" },
  { value: "AUTOMOBILE", label: "AUTOMOBILE" },
  { value: "RETAIL", label: "RETAIL" },
  { value: "MEDIA", label: "MEDIA" },
  { value: "AGRICULTURE", label: "AGRICULTURE" },
];

// Define subject options based on class
const getSubjectOptions = (classLevel) => {
  const classNum = parseInt(classLevel);

  if (classNum >= 1 && classNum <= 3) {
    return [
      { value: "MATH", label: "Math" },
      { value: "HINDI", label: "Hindi" },
      { value: "ENGLISH", label: "English" },
    ];
  } else if (classNum >= 4 && classNum <= 5) {
    return [
      { value: "MATH", label: "Math" },
      { value: "HINDI", label: "Hindi" },
      { value: "ENGLISH", label: "English" },
      { value: "EVS", label: "Social Science (EVS)" },
    ];
  } else if (classNum >= 6 && classNum <= 10) {
    return [
      { value: "MATH", label: "Math" },
      { value: "HINDI", label: "Hindi" },
      { value: "ENGLISH", label: "English" },
      { value: "SCIENCE", label: "Science" },
      { value: "SO_SCIENCE", label: "Social Science" },
      { value: "SANSKRIT", label: "Sanskrit" },
    ];
  } else if (classNum >= 11 && classNum <= 12) {
    return [
      { value: "COMPUTER_SCIENCE", label: "Computer Science" },
      { value: "BUSINESS_STUDIES", label: "Business Studies" },
      { value: "PSYCHOLOGY", label: "Psychology" },
      { value: "SOCIOLOGY", label: "Sociology" },
      { value: "POLITICAL_SCIENCE", label: "Political Science" },
      { value: "AGRICULTURE", label: "Agriculture" },
      { value: "HOME_SCIENCE", label: "Home Science" },
    ];
  }

  // Default case
  return [];
};

export default function AddStudent({ isEditMode = false }) {
  const originalNavigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const { studentId, schoolId, schoolName = "School", studentData } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState(getSubjectOptions("11"));

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    gender: "M",
    fatherName: "",
    motherName: "",
    dateOfBirth: null,
    uniqueId: "",
    hostel: "",
    udiseCode: location.state?.udiseCode || "",
    class: "1",
    aadharId: "",
    stream: "",
    extraSubjects: [],
  });

  const [errors, setErrors] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    udiseCode: "",
    aadharId: "",
    stream: "",
  });

  // Check if student is in higher class (11 or 12)
  const isHigherClass = formData.class === "11" || formData.class === "12";
  const isClass9or10 = formData.class === "9" || formData.class === "10";

  // Clean up localStorage when component mounts in edit mode
  useEffect(() => {
    if (isEditMode) {
      localStorage.removeItem('initialStudentData');
    }
    // Cleanup when component unmounts
    return () => {
      localStorage.removeItem('initialStudentData');
    };
  }, [isEditMode]);

  // Navigation history interception
  useEffect(() => {
    if (hasUnsavedChanges) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function (state, title, url) {
        console.log("🚨 Intercepted pushState navigation to:", url);
        setPendingRoute(url);
        setShowConfirmModal(true);
        return; // Prevent navigation
      };

      window.history.replaceState = function (state, title, url) {
        console.log("🚨 Intercepted replaceState navigation to:", url);
        setPendingRoute(url);
        setShowConfirmModal(true);
        return; // Prevent navigation
      };

      // Cleanup - restore original methods
      return () => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }
  }, [hasUnsavedChanges]);

  // Link click interception
  useEffect(() => {
    if (hasUnsavedChanges) {
      const handleClickCapture = (event) => {
        const clickedElement = event.target;
        const isNavigationLink = clickedElement.closest(
          "a[href], [data-navigate], .sidebar-link, nav a"
        );

        if (isNavigationLink) {
          event.preventDefault();
          event.stopPropagation();

          const href =
            isNavigationLink.getAttribute("href") ||
            isNavigationLink.getAttribute("data-navigate") ||
            "Unknown route";

          console.log("🚨 Intercepted link click to:", href);
          setPendingRoute(href);
          setShowConfirmModal(true);
        }
      };

      document.addEventListener("click", handleClickCapture, true);
      return () => {
        document.removeEventListener("click", handleClickCapture, true);
      };
    }
  }, [hasUnsavedChanges]);

  // Form data population
  useEffect(() => {
    if ((location.state?.isEditMode || isEditMode) && location.state?.studentData) {
      const student = location.state.studentData;

      // Improved date parsing logic
      let dob = null;
      if (student.dob) {
        try {
          if (typeof student.dob === "string" && /^\d{4}-\d{2}-\d{2}$/.test(student.dob)) {
            console.log("Date is in YYYY-MM-DD format, using directly");
            dob = new Date(student.dob);
          }
          else if (typeof student.dob === "string" && /^\d{2}-\d{2}-\d{4}$/.test(student.dob)) {
            const parts = student.dob.split("-");
            dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
          else if (typeof student.dob === "string" && /^\d{1,2}-\d{2}-\d{4}$/.test(student.dob)) {
            const parts = student.dob.split("-");
            const day = parts[0].padStart(2, "0");
            dob = new Date(`${parts[2]}-${parts[1]}-${day}`);
          }
          else {
            console.log("Trying direct date parsing");
            dob = new Date(student.dob);
          }

          if (isNaN(dob.getTime())) {
            console.error("Invalid date created:", student.dob);
            dob = null;
          } else {
            console.log("Successfully parsed date:", dob);
          }
        } catch (error) {
          console.error("Error parsing date:", error, student.dob);
          dob = null;
        }
      }

      // Process extraSubjects - ensure it's an array
      let extraSubjects = [];
      if (student.extraSubjects) {
        if (Array.isArray(student.extraSubjects)) {
          extraSubjects = student.extraSubjects;
        } else if (typeof student.extraSubjects === "string") {
          extraSubjects = student.extraSubjects.split(",").map((s) => s.trim());
        }
      }

      // Set form data from the passed student object
      setFormData({
        name: student.fullName || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        dateOfBirth: dob,
        uniqueId: student.aparId || "",
        hostel: student.hostel || "",
        udiseCode: student.schoolUdiseCode || location.state?.udiseCode || "",
        class: student.class?.toString() || "1",
        gender: student.gender || "M",
        aadharId: student.aadharId || "",
        stream: student.stream || "",
        extraSubjects: extraSubjects,
      });
    }
  }, [isEditMode, location]);

  // Save initial data ONLY ONCE when form is first populated
  useEffect(() => {
    if (
      (location.state?.isEditMode || isEditMode) &&
      location.state?.studentData &&
      formData.name &&
      !localStorage.getItem('initialStudentData')
    ) {
      const initialData = {
        name: formData.name,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        uniqueId: formData.uniqueId,
        hostel: formData.hostel,
        udiseCode: formData.udiseCode,
        class: formData.class,
        gender: formData.gender,
        aadharId: formData.aadharId,
        stream: formData.stream,
        extraSubjects: formData.extraSubjects,
      };

      localStorage.setItem('initialStudentData', JSON.stringify(initialData));
      console.log("✅ Initial data saved to localStorage (ONCE):", initialData);
    }
  }, [formData.name, isEditMode, location.state]);

  // Change detection
  useEffect(() => {
    if (isEditMode && window.location.pathname.includes("updateStudent")) {
      const initialDataString = localStorage.getItem("initialStudentData");

      if (initialDataString) {
        const initialData = JSON.parse(initialDataString);

        const currentData = {
          name: formData.name,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
          uniqueId: formData.uniqueId,
          hostel: formData.hostel,
          udiseCode: formData.udiseCode,
          class: formData.class,
          gender: formData.gender,
          aadharId: formData.aadharId,
          stream: formData.stream,
          extraSubjects: JSON.stringify(formData.extraSubjects),
        };

        const initialDataForComparison = {
          ...initialData,
          extraSubjects: JSON.stringify(initialData.extraSubjects),
        };

        const changes = {};
        let hasChanges = false;

        Object.keys(currentData).forEach((key) => {
          if (currentData[key] !== initialDataForComparison[key]) {
            changes[key] = {
              from: initialDataForComparison[key],
              to: currentData[key],
            };
            hasChanges = true;
          }
        });

        setHasUnsavedChanges(hasChanges);

        if (hasChanges) {
          console.log("🔄 CHANGES DETECTED:");
          console.log(changes);
          Object.keys(changes).forEach((key) => {
            console.log(`📝 ${key}: "${changes[key].from}" → "${changes[key].to}"`);
          });
        } else {
          console.log("✅ No changes detected");
        }
      }
    }
  }, [formData, isEditMode]);

  // Subject options based on class
  useEffect(() => {
    if (isHigherClass || isClass9or10) {
      setSubjectOptions(vocationalOptions);
    }
  }, [formData.class, isHigherClass, isClass9or10]);

  // Custom navigate function
  const navigate = (to, options) => {
    if (hasUnsavedChanges && !options?.force) {
      console.log("🚨 Attempted programmatic navigation to:", to);
      setPendingRoute(to);
      setShowConfirmModal(true);
    } else {
      originalNavigate(to, options);
    }
  };

  // Modal handlers
  const handleModalConfirm = () => {
    console.log("✅ User confirmed navigation to:", pendingRoute);
    setHasUnsavedChanges(false);
    setShowConfirmModal(false);

    setTimeout(() => {
      if (pendingRoute) {
        if (pendingRoute.startsWith("http") || pendingRoute.startsWith("/")) {
          window.location.href = pendingRoute;
        } else {
          originalNavigate(pendingRoute, { replace: true });
        }
      }
      setPendingRoute(null);
    }, 100);
  };

  const handleModalClose = () => {
    console.log("❌ User cancelled navigation to:", pendingRoute);
    setShowConfirmModal(false);
    setPendingRoute(null);
  };

  // Handle input change with validation for specific fields
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "aadharId") {
      const numericValue = value.replace(/\D/g, "").slice(0, 12);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle multi-select change for extra subjects
  const handleExtraSubjectsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      extraSubjects: typeof value === "string" ? value.split(",") : value,
    });
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      dateOfBirth: newDate,
    });

    if (errors.dateOfBirth) {
      setErrors({
        ...errors,
        dateOfBirth: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name should only contain letters and spaces";
      isValid = false;
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fatherName.trim())) {
      newErrors.fatherName = "Father's name should only contain letters and spaces";
      isValid = false;
    }

    if (!formData.motherName.trim()) {
      newErrors.motherName = "Mother's name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.motherName.trim())) {
      newErrors.motherName = "Mother's name should only contain letters and spaces";
      isValid = false;
    }

    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 4) {
        newErrors.dateOfBirth = "Age should be 4 years or above";
        isValid = false;
      }
    }

    if (!formData.udiseCode.trim()) {
      newErrors.udiseCode = "UDISE code is required";
      isValid = false;
    } else if (!/^\d{11}$/.test(formData.udiseCode.trim())) {
      newErrors.udiseCode = "UDISE code should be 11 digits";
      isValid = false;
    }

    if (formData.aadharId && !/^\d{12}$/.test(formData.aadharId.trim())) {
      newErrors.aadharId = "Aadhar ID should be 12 digits";
      isValid = false;
    }

    if ((formData.class === "11" || formData.class === "12") && !formData.stream) {
      newErrors.stream = "Stream is required for Class 11 and 12";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = formData.dateOfBirth
        ? `${format(new Date(formData.dateOfBirth), "d-MM-yyyy")}`
        : "";

      const studentDataPayload = {
        fullName: formData.name,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        class: formData.class,
        gender: formData.gender,
        schoolUdiseCode: formData.udiseCode,
      };

      if (formData.uniqueId) {
        studentDataPayload.aparId = formData.uniqueId;
      }
      if (formattedDate) {
        studentDataPayload.dob = formattedDate;
      }
      if (formData.hostel) {
        studentDataPayload.hostel = formData.hostel;
      }
      if (formData.aadharId) {
        studentDataPayload.aadharId = formData.aadharId;
      }
      if (formData.stream) {
        studentDataPayload.stream = formData.stream;
      }
      if (formData.extraSubjects && formData.extraSubjects.length > 0) {
        studentDataPayload.extraSubjects = formData.extraSubjects;
      }

      if (isEditMode && studentId) {
        await apiInstance.put(`/student/update/${studentId}`, studentDataPayload);
        toast.success("Student updated successfully!");
        setHasUnsavedChanges(false); // Clear the flag after successful save
        setTimeout(() => {
          originalNavigate(`/schools/schoolDetail/${schoolId}`, {
            state: { selectedTab: 1 },
          });
        }, 1200);
      } else {
        const response = await apiInstance.post("/student/add", studentDataPayload);

        if (response.data && response.data.success) {
          toast.success("New Student added successfully!");
          setTimeout(() => {
            originalNavigate(`/schools/schoolDetail/${schoolId}`, {
              state: { selectedTab: 1 },
            });
          }, 1200);
        } else {
          throw new Error(response.data?.message || "Failed to add student");
        }
      }
    } catch (error) {
      console.error("Error saving student data:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save student data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Classes array for dropdown
  const classes = [
    { value: "1", label: "Class 1" },
    { value: "2", label: "Class 2" },
    { value: "3", label: "Class 3" },
    { value: "4", label: "Class 4" },
    { value: "5", label: "Class 5" },
    { value: "6", label: "Class 6" },
    { value: "7", label: "Class 7" },
    { value: "8", label: "Class 8" },
    { value: "9", label: "Class 9" },
    { value: "10", label: "Class 10" },
    { value: "11", label: "Class 11" },
    { value: "12", label: "Class 12" },
  ];

  return (
    <ThemeProvider theme={theme}>
      {isLoading && <SpinnerPageOverlay />}
      <div className="p-6 mx-auto w-[800px]">
        <div className="ml-5">
          <h5 className="text-lg font-bold text-[#2F4F4F]">
            {isEditMode ? "Edit Student" : "Add New Student"}
          </h5>
          <Typography variant="body1" className="text-gray-600 mb-2">
            {isEditMode
              ? "Update student information and details"
              : "Enter student details to add them to the school"}
          </Typography>
        </div>

        <Paper elevation={0} className="max-w-3xl mx-auto p-6 rounded-lg">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Student Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Student Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter student's full name"
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* Class Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="class-select-label">Class</InputLabel>
                  <Select
                    labelId="class-select-label"
                    id="class-select"
                    name="class"
                    value={formData.class}
                    label="Class"
                    onChange={handleInputChange}
                    sx={{
                      height: "48px",
                      "& .MuiSelect-select": {
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.value} value={cls.value}>
                        {cls.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Father's Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Father's Name *"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter father's name"
                  variant="outlined"
                  error={!!errors.fatherName}
                  helperText={errors.fatherName}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* Mother's Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mother's Name *"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter mother's name"
                  variant="outlined"
                  error={!!errors.motherName}
                  helperText={errors.motherName}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" required>
                  <FormLabel component="legend">Gender</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="M" control={<Radio color="primary" />} label="Male" />
                    <FormControlLabel
                      value="F"
                      control={<Radio color="primary" />}
                      label="Female"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Date of Birth */}
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={
                    formData.dateOfBirth instanceof Date && !isNaN(formData.dateOfBirth)
                      ? formData.dateOfBirth.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    handleDateChange(newDate);
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth || "Optional"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* UDISE Code */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="UDISE Code *"
                  name="udiseCode"
                  value={formData.udiseCode}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter 11-digit UDISE code"
                  variant="outlined"
                  error={!!errors.udiseCode}
                  helperText={errors.udiseCode}
                  disabled={true}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* Aadhar ID (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Aadhar ID (Optional)"
                  name="aadharId"
                  value={formData.aadharId}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter 12-digit Aadhar ID"
                  variant="outlined"
                  error={!!errors.aadharId}
                  helperText={errors.aadharId || "Numbers only - 12 digits"}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 12,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* Unique ID (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="APAR ID (Optional)"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter student's APAR ID if available"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>

              {/* Stream - Only for Classes 11-12 */}
              {isHigherClass && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.stream} required>
                    <InputLabel id="stream-select-label">Stream</InputLabel>
                    <Select
                      labelId="stream-select-label"
                      id="stream-select"
                      name="stream"
                      value={formData.stream}
                      label="Stream *"
                      onChange={handleInputChange}
                      sx={{
                        height: "48px",
                        "& .MuiSelect-select": {
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      {streamOptions.map((stream) => (
                        <MenuItem key={stream.value} value={stream.value}>
                          {stream.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.stream && <FormHelperText>{errors.stream}</FormHelperText>}
                  </FormControl>
                </Grid>
              )}

              {/* Optional padding Grid item if no Stream is shown */}
              {!isHigherClass && <Grid item xs={12} md={6}></Grid>}

              {/* Optional Subjects - For Classes 9-10 */}
              {isClass9or10 && (
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth>
                    <InputLabel id="extra-subjects-label">Optional Subjects</InputLabel>
                    <Select
                      labelId="extra-subjects-label"
                      id="extra-subjects"
                      multiple
                      value={formData.extraSubjects}
                      onChange={handleExtraSubjectsChange}
                      input={<OutlinedInput label="Optional Subjects" />}
                      renderValue={(selected) => selected.join(", ")}
                      sx={{
                        height: "48px",
                        "& .MuiSelect-select": {
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      {vocationalOptions.map((subject) => (
                        <MenuItem key={subject.value} value={subject.value}>
                          <Checkbox checked={formData.extraSubjects.indexOf(subject.value) > -1} />
                          <ListItemText primary={subject.label} />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select optional vocational subjects</FormHelperText>
                  </FormControl>
                </Grid>
              )}

              {/* Optional Subjects - For Classes 11-12 */}
              {isHigherClass && (
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth>
                    <InputLabel id="extra-subjects-label">Optional Subjects</InputLabel>
                    <Select
                      labelId="extra-subjects-label"
                      id="extra-subjects"
                      multiple
                      value={formData.extraSubjects}
                      onChange={handleExtraSubjectsChange}
                      input={<OutlinedInput label="Optional Subjects" />}
                      renderValue={(selected) => selected.join(", ")}
                      sx={{
                        height: "48px",
                        "& .MuiSelect-select": {
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      {vocationalOptions.map((subject) => (
                        <MenuItem key={subject.value} value={subject.value}>
                          <Checkbox checked={formData.extraSubjects.indexOf(subject.value) > -1} />
                          <ListItemText primary={subject.label} />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select optional vocational subjects</FormHelperText>
                  </FormControl>
                </Grid>
              )}

              {/* Hostel (Optional) */}
              <Grid item xs={12}>
                <TextField
                  label="Hostel (Optional)"
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter hostel information if applicable"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "48px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <ButtonCustom
                text={
                  isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Adding..."
                    : isEditMode
                    ? "Update Student"
                    : "Add Student"
                }
                onClick={handleSubmit}
                disabled={isSubmitting}
              />
            </Box>
          </form>
        </Paper>
      </div>

      {showConfirmModal && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          title="Unsaved Changes"
          changeType="Page"
          fromValue="Current page with unsaved changes"
          toValue={pendingRoute || "New page"}
          message="You have unsaved changes that will be lost if you leave this page."
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
    </ThemeProvider>
  );
}