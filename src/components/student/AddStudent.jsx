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
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const { studentId, schoolId, schoolName = "School", studentData } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState(getSubjectOptions("11")); // Default to class 11 options for higher classes

  //stream (and extraSubjects, aadharId) pass only when class is 11 or 12 (if not selected then no need to show in payload)

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
    aadharId: "", // New field for Aadhar ID
    stream: "", // New field for Stream
    extraSubjects: [], // New field for Extra Subjects
  });

  const [errors, setErrors] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    udiseCode: "",
    aadharId: "", // Error for Aadhar ID
    stream: "", // Error for Stream
  });

  // Check if student is in higher class (11 or 12)
  const isHigherClass = formData.class === "11" || formData.class === "12";
  const isClass9or10 = formData.class === "9" || formData.class === "10";

  useEffect(() => {
    if ((location.state?.isEditMode || isEditMode) && location.state?.studentData) {
      const student = location.state.studentData;

      // Improved date parsing logic
      let dob = null;
      if (student.dob) {
        try {
          // First, check if it's already in YYYY-MM-DD format (like "2011-06-21")
          if (typeof student.dob === "string" && /^\d{4}-\d{2}-\d{2}$/.test(student.dob)) {
            console.log("Date is in YYYY-MM-DD format, using directly");
            dob = new Date(student.dob);
          }
          // Then check if it's in DD-MM-YYYY format
          else if (typeof student.dob === "string" && /^\d{2}-\d{2}-\d{4}$/.test(student.dob)) {
            const parts = student.dob.split("-");
            // Create a valid date string in YYYY-MM-DD format
            dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
          // Check for D-MM-YYYY format like "6-03-2003"
          else if (typeof student.dob === "string" && /^\d{1,2}-\d{2}-\d{4}$/.test(student.dob)) {
            const parts = student.dob.split("-");
            // Ensure day is two digits
            const day = parts[0].padStart(2, "0");
            dob = new Date(`${parts[2]}-${parts[1]}-${day}`);
          }
          // Fallback to direct date parsing
          else {
            console.log("Trying direct date parsing");
            dob = new Date(student.dob);
          }

          // Validate the date object
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
          // If it's a string (possibly comma-separated), convert to array
          extraSubjects = student.extraSubjects.split(",").map((s) => s.trim());
        }
      }

      // Set form data from the passed student object
      setFormData({
        name: student.fullName || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        dateOfBirth: dob, // Now this will be either a valid Date object or null
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

  // Handle input change with validation for specific fields
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Special handling for Aadhar ID - only allow numbers and limit to 12 digits
    if (name === "aadharId") {
      // Replace any non-digit characters and limit to 12 digits
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

    // Clear error when user starts typing
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

    // Clear date error when user selects a new date
    if (errors.dateOfBirth) {
      setErrors({
        ...errors,
        dateOfBirth: "",
      });
    }
  };

  useEffect(() => {
    // We'll just use vocationalOptions for classes 9-12
    if (isHigherClass || isClass9or10) {
      setSubjectOptions(vocationalOptions);
    }
  }, [formData.class, isHigherClass, isClass9or10]);

  // Validate form
  // const validateForm = () => {
  //   const newErrors = {};
  //   let isValid = true;

  //   // Validate name
  //   if (!formData.name.trim()) {
  //     newErrors.name = "Student name is required";
  //     isValid = false;
  //   } else if (formData.name.trim().length < 3) {
  //     newErrors.name = "Name must be at least 3 characters";
  //     isValid = false;
  //   } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
  //     newErrors.name = "Name should only contain letters and spaces";
  //     isValid = false;
  //   }

  //   // Validate father's name
  //   if (!formData.fatherName.trim()) {
  //     newErrors.fatherName = "Father's name is required";
  //     isValid = false;
  //   } else if (!/^[a-zA-Z\s]+$/.test(formData.fatherName.trim())) {
  //     newErrors.fatherName = "Father's name should only contain letters and spaces";
  //     isValid = false;
  //   }

  //   // Validate mother's name
  //   if (!formData.motherName.trim()) {
  //     newErrors.motherName = "Mother's name is required";
  //     isValid = false;
  //   } else if (!/^[a-zA-Z\s]+$/.test(formData.motherName.trim())) {
  //     newErrors.motherName = "Mother's name should only contain letters and spaces";
  //     isValid = false;
  //   }

  //   // Validate date of birth
  //   if (!formData.dateOfBirth) {
  //     newErrors.dateOfBirth = "Date of birth is required";
  //     isValid = false;
  //   } else {
  //     const today = new Date();
  //     const birthDate = new Date(formData.dateOfBirth);
  //     const age = today.getFullYear() - birthDate.getFullYear();

  //     if (age < 5 || age > 18) {
  //       newErrors.dateOfBirth = "Age should be between 5 and 18 years";
  //       isValid = false;
  //     }
  //   }

  //   // Validate UDISE code
  //   if (!formData.udiseCode.trim()) {
  //     newErrors.udiseCode = "UDISE code is required";
  //     isValid = false;
  //   } else if (!/^\d{11}$/.test(formData.udiseCode.trim())) {
  //     newErrors.udiseCode = "UDISE code should be 11 digits";
  //     isValid = false;
  //   }

  //   // Validate Aadhar ID if provided
  //   if (formData.aadharId && !/^\d{12}$/.test(formData.aadharId.trim())) {
  //     newErrors.aadharId = "Aadhar ID should be 12 digits";
  //     isValid = false;
  //   }

  //   setErrors(newErrors);
  //   return isValid;
  // };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate name
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

    // Validate father's name
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fatherName.trim())) {
      newErrors.fatherName = "Father's name should only contain letters and spaces";
      isValid = false;
    }

    // Validate mother's name
    if (!formData.motherName.trim()) {
      newErrors.motherName = "Mother's name is required";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.motherName.trim())) {
      newErrors.motherName = "Mother's name should only contain letters and spaces";
      isValid = false;
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
      isValid = false;
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 5 || age > 18) {
        newErrors.dateOfBirth = "Age should be between 5 and 18 years";
        isValid = false;
      }
    }

    // Validate UDISE code
    if (!formData.udiseCode.trim()) {
      newErrors.udiseCode = "UDISE code is required";
      isValid = false;
    } else if (!/^\d{11}$/.test(formData.udiseCode.trim())) {
      newErrors.udiseCode = "UDISE code should be 11 digits";
      isValid = false;
    }

    // Validate Aadhar ID if provided
    if (formData.aadharId && !/^\d{12}$/.test(formData.aadharId.trim())) {
      newErrors.aadharId = "Aadhar ID should be 12 digits";
      isValid = false;
    }

    // Note: No validation for stream or extraSubjects since they're optional

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
      // Format date to D-MM-YYYY format as expected by the API
      const formattedDate = formData.dateOfBirth
        ? `${format(new Date(formData.dateOfBirth), "d-MM-yyyy")}`
        : "";

      // Create base payload with required fields
      const studentData = {
        fullName: formData.name,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formattedDate,
        class: formData.class,
        gender: formData.gender,
        schoolUdiseCode: formData.udiseCode,
      };

      // Only add optional fields if they have values
      if (formData.uniqueId) {
        studentData.aparId = formData.uniqueId;
      }

      if (formData.hostel) {
        studentData.hostel = formData.hostel;
      }

      if (formData.aadharId) {
        studentData.aadharId = formData.aadharId;
      }

      if (formData.stream) {
        studentData.stream = formData.stream;
      }

      if (formData.extraSubjects && formData.extraSubjects.length > 0) {
        studentData.extraSubjects = formData.extraSubjects;
      }

      if (isEditMode && studentId) {
        // Update existing student
        await apiInstance.put(`/student/update/${studentId}`, studentData);
        toast.success("Student updated successfully!");
        setTimeout(() => {
          navigate(`/schools/schoolDetail/${schoolId}`, {
            state: { selectedTab: 1 }, // Set to Students tab
          });
        }, 1200);
      } else {
        // Create new student
        const response = await apiInstance.post("/student/add", studentData);

        if (response.data && response.data.success) {
          toast.success("New Student added successfully!");
          setTimeout(() => {
            navigate(`/schools/schoolDetail/${schoolId}`, {
              state: { selectedTab: 1 }, // Set to Students tab
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

        <Paper elevation={0} className="max-w-3xl mx-auto p-6 rounded-lg ">
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
                  label="Date of Birth *"
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
                  helperText={errors.dateOfBirth}
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
                  disabled={true} // Disable the field as UDISE code should not be edited directly
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

              {/* Stream - Only for Classes 11-12, placed next to APAR ID */}
              {isHigherClass && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.stream}>
                    <InputLabel id="stream-select-label">Stream</InputLabel>
                    <Select
                      labelId="stream-select-label"
                      id="stream-select"
                      name="stream"
                      value={formData.stream}
                      label="Stream"
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
    </ThemeProvider>
  );
}
