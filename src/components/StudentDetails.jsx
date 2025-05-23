import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Button,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import MUIDataTable from "mui-datatables";
import SearchIcon from "@mui/icons-material/Search";
import { toast, ToastContainer } from "react-toastify";
import ButtonCustom from "../components/ButtonCustom";
import { addSymbolBtn, EditPencilIcon, trash, DocScanner } from "../utils/imagePath";
import apiInstance from "../../api";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AssessmentIcon from "@mui/icons-material/Assessment";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SpinnerPageOverlay from "./SpinnerPageOverlay";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    // Change the highlight color from blue to "Text Primary" color style.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2F4F4F", // Use text.primary color on focus
          },
        },
        notchedOutline: {
          borderColor: "#ccc", // default border color
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#949494", // Default label color
          "&.Mui-focused": {
            color: "#2F4F4F", // Focused label color
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#2F4F4F", // Dropdown arrow icon color
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: "none",
          fontFamily: "Karla !important",
          textAlign: "left",
            borderBottom: "none",
          "&.custom-cell": {
            width: "0px",
          },
        },
        head: {
          fontSize: "14px",
          fontWeight: 500,
          textAlign: "left",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "inherit !important",
            cursor: "default",
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          minHeight: "8px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },
});

const StudentDetails = ({ schoolId, schoolName }) => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(""); // Empty string for "All Classes"
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [allStudents, setAllStudents] = useState([]); // Store all students
  const [availableClasses, setAvailableClasses] = useState([]); // Store unique classes
  const [schoolInfo, setSchoolInfo] = useState({
    udiseCode: "",
    blockName: "",
    clusterName: "",
    totalStudentsInSchool: 0,
    assignedCAC: { name: "" },
    assignedCP: "NA",
  });

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle class change
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Fetch all students from the API
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      // Fetch all students without pagination
      const response = await apiInstance.get(`/student/school/${schoolId}`);
      const result = response.data;

      if (result.success && result.data && result.data.data) {
        const schoolData = result.data.data;

        // Set school information
        setSchoolInfo({
          udiseCode: schoolData.udiseCode || "",
          blockName: schoolData.blockName || "",
          clusterName: schoolData.clusterName || "",
          totalStudentsInSchool: schoolData.totalStudentsInSchool || 0,
          assignedCAC: schoolData.assignedCAC || { name: "" },
          assignedCP: schoolData.assignedCP || "NA",
        });

        // Extract all students from all classes
        let students = [];
        let classSet = new Set();
        
        if (schoolData.classes && Array.isArray(schoolData.classes)) {
          schoolData.classes.forEach((classData) => {
            if (classData.students && Array.isArray(classData.students)) {
              // Add class information to each student
              const studentsWithClass = classData.students.map(student => ({
                ...student,
                class: classData.class
              }));
              students = [...students, ...studentsWithClass];
              classSet.add(classData.class);
            }
          });
        }

        // Set all students
        setAllStudents(students);
        
        // Set available classes sorted numerically
        const sortedClasses = Array.from(classSet).sort((a, b) => Number(a) - Number(b));
        setAvailableClasses(sortedClasses);

      } else {
        console.error("API response format unexpected:", result);
        setAllStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students. Please try again later.");
      setAllStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchStudents();
    }
  }, [schoolId, location.key]);

  const handleEditStudent = (studentId, student) => {
    // Create a copy of the student object to avoid modifying the original
    const studentForEdit = { ...student };
    navigate(`/schools/schoolDetail/${schoolId}/updateStudent`, {
      state: {
        schoolId: schoolId,
        studentId: studentId,
        udiseCode: schoolInfo.udiseCode,
        isEditMode: true,
        studentData: studentForEdit,
      },
    });
  };

  const handleViewStudentReport = (studentId, student) => {
    navigate(`/schools/schoolDetail/${schoolId}/studentReport/${studentId}`, {
      state: {
        studentData: student,
        schoolName: schoolName,
        udiseCode: schoolInfo.udiseCode,
      },
    });
  };

  // Open delete confirmation modal
  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  // Function to handle deleting a student
  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);

     
    try {
      // Try multiple possible ID property names
      const studentId = studentToDelete.id || studentToDelete._id || studentToDelete.studentId;

      console.log("Student ID being used:", studentId);

      if (!studentId) {
        toast.error("Student ID not found. Cannot delete student.");
        setIsDeleting(false);
        closeDeleteModal();
        return;
      }

      const response = await apiInstance.delete(`/student/delete/${studentId}`);

      if (response.data && response.data.success) {
        toast.success(`Student ${studentToDelete.fullName} has been deleted successfully!`);
        // Refresh data instead of just updating local state
        fetchStudents();
      } else {
        toast.error(response.data?.message || "Failed to delete student. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student. Please try again later.");
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Filter students based on search query and selected class
  const filteredStudents = allStudents.filter((student) => {
    // First filter by search query
    const matchesSearch = student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student?.aparId && student.aparId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Then filter by class if a class is selected
    const matchesClass = selectedClass === "" || student.class?.toString() === selectedClass;
    
    return matchesSearch && matchesClass;
  });

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

  // Fix the order in tableData mapping - swap aparId and aadharId
  const tableData = filteredStudents.map((student) => [
    student.fullName || "N/A",
    student.gender || "N/A",
    `Class ${student.class}` || "N/A",
    formatDate(student.dob),
    student.fatherName || "N/A",
    student.motherName || "N/A",
    student.aadharId || "N/A", // Aadhar ID first (index 6)
    student.aparId || "N/A", // APAR ID second (index 7)
    student.id,
    student, // Full student object now at index 9
  ]);

  const defaultCustomHeadLabelRender = (columnMeta) => (
    <span
      style={{
        color: "#2F4F4F",
        fontFamily: "'Work Sans'",
        fontWeight: 600,
        fontSize: "14px",
        fontStyle: "normal",
        textTransform: "none",
      }}
    >
      {columnMeta.label}
    </span>
  );

  // Define columns for MUIDataTable
  const columns = [
    {
      name: "Name",
      options: {
        filter: false,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const studentName = tableData[dataIndex][0]; // Name is at index 0
          const studentId = tableData[dataIndex][8]; // Update index (was 7)
          const student = tableData[dataIndex][9];

          return (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleStudentNameClick(studentId, student);
              }}
              style={{
                cursor: "pointer",
                color: "#1976d2",
                fontWeight: "500",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {studentName}
            </div>
          );
        },
      },
    },
    {
      name: "Gender",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "Class",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "Date of Birth",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: {
            minWidth: "120px",
          },
        }),
      },
    },
    {
      name: "Father's Name",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: {
            minWidth: "150px",
          },
        }),
      },
    },
    {
      name: "Mother's Name",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: {
            minWidth: "150px",
          },
        }),
      },
    },
    {
      name: "Aadhar ID",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "APAR ID",
      options: {
        filter: false,
        sort: true,
        setCellProps: () => ({
          style: {
            display: "flex",
            justifyContent: "flex-start",
            paddingBottom: "22px",
          },
        }),
      },
    },

    {
      name: "ID",
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "studentObj", // Hidden column for full student object
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "Actions",
      options: {
        filter: false,
        sort: false,
        empty: true,

        setCellHeaderProps: () => ({
          style: {
            display: "flex",
            justifyContent: "center",
          },
        }),
        customBodyRenderLite: (dataIndex) => {
          const student = tableData[dataIndex][9]; // Rename to student for consistency
          const studentId = tableData[dataIndex][8];

          return (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#1976d2",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => handleEditStudent(studentId, student)}
                title="Edit Student"
              >
                <img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
              </Button>

              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#d32f2f",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => openDeleteModal(student)} // Now student is defined
                title="Delete Student"
              >
                <img src={trash} alt="Delete" style={{ width: "20px", height: "20px" }} />
              </Button>
            </div>
          );
        },
      },
    },
  ];

  columns.forEach((column) => {
    if (!column.options) column.options = {};
    column.options.customHeadLabelRender = defaultCustomHeadLabelRender;
  });

  const handleStudentNameClick = (studentId, student) => {
    navigate(`/schools/schoolDetail/${schoolId}/student-profile/${studentId}`, {
      state: {
        studentData: student,
        schoolName: schoolName,
        udiseCode: schoolInfo.udiseCode,
      },
    });
  };

  // MUIDataTable options
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    pagination: false,
    selectableRows: "none",
    responsive: "standard",
    textLabels: {
      body: {
        noMatch: "No students found",
      },
    },
  };

  const handleBulkUploadStudent = () => {
    navigate(`/schools/schoolDetail/${schoolId}/studentBulkUpload`, {
      state: { schoolId: schoolId },
    });
  };

  const handleAddStudent = () => {
    navigate(`/schools/schoolDetail/${schoolId}/addStudents`, {
      state: {
        schoolId: schoolId,
        udiseCode: schoolInfo.udiseCode,
      },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <div className="flex justify-between items-center mb-2">
          <Typography variant="h6" className="text-xl font-bold">
            <span>Total Student Count ({schoolInfo.totalStudentsInSchool})</span>
          </Typography>
        </div>

        <div
          className="flex flex-wrap
			 justify-between   sm:flex-row mb-2 
			 "
        >
          <div className="flex gap-2">
            {/* Search Field */}
            <TextField
              placeholder="Search students..."
              fullWidth
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: "grey.500" }}>
                    <SearchIcon />
                  </Box>
                ),
                sx: {
                  borderRadius: "8px",
                  height: "48px",
                  backgroundColor: "#fff",
                  minWidth: "250px",
                  width: "360px",
                },
              }}
            />

            {/* Class Dropdown */}
            <FormControl
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "48px",
                },
              }}
            >
              <Select
                value={selectedClass}
                onChange={handleClassChange}
                displayEmpty
                renderValue={(value) => value === "" ? "All Classes" : `Class ${value}`}
              >
                <MenuItem value="">
                  <em>All Classes</em>
                </MenuItem>
                {availableClasses.map((classNum) => (
                  <MenuItem key={classNum} value={classNum.toString()}>
                    Class {classNum}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex gap-2 xl:mt-0 mt-5 ">
            <ButtonCustom
              imageName={addSymbolBtn}
              text={"Add Student"}
              onClick={handleAddStudent}
            />
            <Button
              variant="outlined"
              sx={{
                borderColor: "#2F4F4F",
                color: "#2F4F4F",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "18px",
                "&:hover": {
                  borderColor: "#1E3535",
                  backgroundColor: "rgba(47, 79, 79, 0.1)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
              onClick={handleBulkUploadStudent}
            >
              <UploadFileIcon sx={{ mr: 1 }} />
              Bulk Upload
            </Button>
          </div>
        </div>

        {isLoadingStudents ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <SpinnerPageOverlay isLoading={isLoadingStudents} />
          </Box>
        ) : (
          <div
            style={{
              borderRadius: "8px",
              position: "relative",
              minHeight: "300px",
              marginTop: "16px",
            }}
            className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
          >
            <MUIDataTable data={tableData} columns={columns} options={options} />
          </div>
        )}

        {filteredStudents.length === 0 && !isLoadingStudents && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
              textAlign: "center",
              py: 6,
            }}
          >
            <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
              {selectedClass ? 
                `No students found in Class ${selectedClass}.` : 
                "No students found."
              }
            </Typography>
            <Typography variant="body1">Click "Add Student" to register a new student.</Typography>
          </Box>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteStudent}
          title="Delete Student"
          confirmText="Delete"
          cancelText="Cancel"
          message="Are you sure you want to delete this student: "
          entityName={studentToDelete ? studentToDelete.fullName : ""}
          isProcessing={isDeleting}
          confirmButtonColor="error"
          icon={<DeleteOutlineIcon fontSize="large" />}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
        />
      </Box>
    </ThemeProvider>
  );
};

export default StudentDetails;