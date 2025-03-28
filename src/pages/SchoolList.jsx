import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { Button, TextField, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; 
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ButtonCustom from "../components/ButtonCustom";
import GenericConfirmationModal from "../components/DeleteConfirmationModal";
import { addSymbolBtn, EditPencilIcon, trash } from "../utils/imagePath";
import apiInstance from "../../api";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "black",
          backgroundColor: "white",
          "&.Mui-selected": {
            backgroundColor: "#2F4F4F",
            color: "white",
          },
          "&:hover": {
            backgroundColor: "#A3BFBF",
          },
        },
      },
    },
  },
});

export default function SchoolList() {
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 30,
    totalSchools: 0,
    totalPages: 1
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch schools from API
  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const response = await apiInstance.get(`/dev/school/all?page=${currentPage}`);
      if (response.data.success) {
        setSchools(response.data.data.schools);
        setPagination(response.data.data.pagination);
      } else {
        toast.error("Failed to fetch schools");
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error(error.response?.data?.message || "Error fetching schools");
    } finally {
      setIsLoading(false);
    }
  };

  // Load schools on component mount and when page changes
  useEffect(() => {
    fetchSchools();
  }, [currentPage]);

  const handleAddSchool = () => {
    navigate("/schools/add-school");
  };

  const handleBulkUpload = () => {
    navigate("/schools/bulk-upload");
  };

  // Handle copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.info(`${type} copied to clipboard`);
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Filter schools based on search query
  const filteredSchools = schools.filter(
    (school) =>
      school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.udiseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.blockName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.clusterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open delete confirmation modal
  const openDeleteModal = (school) => {
    setSchoolToDelete(school);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSchoolToDelete(null);
  };

  // Delete school handler
  const confirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    
    setIsDeleting(true);
    try {
      // Call the API to delete the school
      await apiInstance.delete(`/dev/school/delete/${schoolToDelete.id}`);
      
      // Remove the school from the local state
      const updatedSchools = schools.filter((school) => school.id !== schoolToDelete.id);
      setSchools(updatedSchools);
      
      // Show success message and update pagination if needed
      toast.success(`"${schoolToDelete.schoolName}" has been deleted successfully!`);
      
      if (updatedSchools.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // If we're on the last page and it's now empty, go back one page
        const totalPages = Math.ceil((pagination.totalSchools - 1) / pagination.pageSize);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        } else {
          // Otherwise, just refresh the current page
          fetchSchools();
        }
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      toast.error(error.response?.data?.message || "Error deleting school");
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Generate username from schoolName and udiseCode
  const generateUsername = (schoolName) => {
    const schoolPrefix = schoolName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `admin_${schoolPrefix}${randomNum}`;
  };

  const tableData = filteredSchools.map((school) => ({
    id: school.id,
    schoolName: school.schoolName,
    udiseCode: school.udiseCode,
    cluster: school.clusterName,
    block: school.blockName,
    username: generateUsername(school.schoolName), // Generate username from school name
    password: school.passwordHash,
    actions: "Actions",
    schoolObj: school, // Pass the entire school object for the delete modal
  }));

  // MUI DataTable columns
  const columns = [
    {
      name: "id",
      label: "ID",
      options: { display: false }, // Keep the ID hidden in the table
    },
    {
      name: "schoolName",
      label: "School Name",
      options: { filter: false, sort: true },
    },
    {
      name: "udiseCode",
      label: "UDISE Code",
      options: { filter: false, sort: true },
    },
    {
      name: "cluster",
      label: "Cluster",
      options: { filter: false, sort: true },
    },
    {
      name: "block",
      label: "Block",
      options: { filter: false, sort: true },
    },
    {
      name: "username",
      label: "Username",
      options: { filter: false, sort: true },
      customBodyRender: (value) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{value}</span>
          <Button
            variant="text"
            size="small"
            sx={{ minWidth: "30px", marginLeft: "5px" }}
            onClick={() => handleCopy(value, "Username")}
          >
            <ContentCopyIcon style={{ fontSize: "18px", color: "#1976d2" }} />
          </Button>
        </div>
      ),
    },
    {
      name: "password",
      label: "Password",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{value}</span>
            <Button
              variant="text"
              size="small"
              sx={{ minWidth: "30px", marginLeft: "5px" }}
              onClick={() => handleCopy(value, "Password")}
            >
              <ContentCopyIcon style={{ fontSize: "18px", color: "#1976d2" }} />
            </Button>
          </div>
        ),
      },
    },
    {
      name: "schoolObj", // This is the hidden column that holds the full school object
      options: { display: false },
    },
    {
      name: "actions",
      label: "ACTIONS",
      options: {
        filter: false,
        sort: false,
        customHeadRender: (columnMeta) => {
          return (
            <th
              style={{
                textAlign: "center",
                borderBottom: "1px solid lightgray",
              }}
              scope="col"
            >
              <div style={{ textAlign: "center", fontSize: "14px" }}>{columnMeta.label}</div>
            </th>
          );
        },
        customBodyRender: (value, tableMeta) => {
          const schoolId = tableMeta.rowData[0];
          const schoolObj = tableMeta.rowData[7]; // Index of schoolObj in the rowData array
          
          return (
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#1976d2",
                  "&:hover": { backgroundColor: "transparent" },
                  padding: "2px",
                  minWidth: "unset",
                }}
                onClick={() => {
                  console.log("Edit School ID:", schoolId);
                  navigate(`/schools/edit/${schoolId}`);
                }}
              >
                <img src={EditPencilIcon} alt="Edit" style={{ width: "20px", height: "20px" }} />
                &nbsp;
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
                onClick={() => openDeleteModal(schoolObj)}
              >
                <img src={trash} alt="Delete" style={{ width: "20px", height: "20px" }} />
                &nbsp;
              </Button>
            </div>
          );
        },
      },
    },
  ];

  // MUI DataTable options
  const options = {
    filter: false,
    search: false,
    responsive: "standard",
    selectableRows: "none",
    download: false,
    print: false,
    viewColumns: false,
    pagination: false,
  };

  // Default view - List of schools
  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper">
        <div className="header-container">
          <div>
            <h5 className="text-lg font-bold text-[#2F4F4F]">School Management</h5>
            <p className="text-sm text-gray-600">Create and manage schools in the Dantewada district</p>
          </div>
        </div>

        <div className="school-list-container mt-4 bg-white p-6 rounded-lg shadow-sm">
           
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-2">
            <TextField
              variant="outlined"
              placeholder="Search schools..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  width: "420px",
                  height: "48px",
                },
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#757575" }} />,
              }}
            />

            <div className="flex gap-3">
              <ButtonCustom imageName={addSymbolBtn} text={"Add School"} onClick={handleAddSchool} />
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#2F4F4F",
                  color: "#2F4F4F",
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#1E3535",
                    backgroundColor: "rgba(47, 79, 79, 0.1)",
                  },
                }}
                onClick={handleBulkUpload}
              >
                <UploadFileIcon sx={{ mr: 1 }} />
                Bulk Upload
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div style={{ borderRadius: "8px", position: "relative", minHeight: "300px" }}>
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
                <CircularProgress />
              </div>
            ) : (
              <MUIDataTable
                data={tableData}
                columns={columns.map((column) => ({
                  ...column,
                  options: {
                    ...column.options,
                    setCellProps: () => ({
                      style: {
                        paddingLeft: "16px",
                        paddingRight: "16px",
                      },
                    }),
                  },
                }))}
                options={options}
              />
            )}
          </div>

          <div
            style={{
              width: "max-content",
              margin: "25px auto",
            }}
          >
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
            />
          </div>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
          
          {/* Delete Confirmation Modal */}
          <GenericConfirmationModal
            open={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDeleteSchool}
            title="Delete School"
            message="Are you sure you want to delete this school: "
            entityName={schoolToDelete ? schoolToDelete.schoolName : ""}
            isProcessing={isDeleting}
            confirmText="Delete"
            cancelText="Cancel"
            confirmButtonColor="error"
            icon={<DeleteOutlineIcon fontSize="large" />}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}