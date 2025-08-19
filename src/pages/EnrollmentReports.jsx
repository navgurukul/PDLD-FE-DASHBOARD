import { useState, useEffect } from "react";
import { useDebounce } from "../customHook/useDebounce";
import MUIDataTable from "mui-datatables";
import { Button, TextField, CircularProgress, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination, PaginationItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search } from "lucide-react";
import "../components/TestListTable.css"; // Import the CSS for consistent table styles
import ButtonCustom from "../components/ButtonCustom";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
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
          fontSize: "14px",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 400,
          color: "#2F4F4F",
          borderBottom: "none", 
        },
      },
    },
  },
});

export default function EnrollmentReport() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalItems: data.length,
    totalPages: Math.ceil(data.length / 15),
  });
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedGrouping, setSelectedGrouping] = useState("school"); // New grouping state
  const [selectedClassGroup, setSelectedClassGroup] = useState("all"); // New class group state
  const [blocks, setBlocks] = useState(["Geedam", "Katekalyan", "Kuakonda"]);
  const [clusters, setClusters] = useState(["Aalnar", "Bacheli", "Fulnar", "Hiroli", "Karli"]);
  const [groupingOptions] = useState([
    { value: "block", label: "Block Level" },
    { value: "cluster", label: "Block + Cluster Level" },
    { value: "school", label: "Block + Cluster + School Level" }
  ]);
  const [classGroupOptions] = useState([
    { value: "all", label: "All Classes (1-12)" },
    { value: "primary", label: "Classes 1-8" },
    { value: "secondary", label: "Classes 9-12" }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dummy data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Realistic school names for different areas
        const schoolNames = [
          "Government Primary School Aalnar",
          "Kendriya Vidyalaya Bacheli",
          "Saraswati Shishu Mandir Geedam",
          "Government High School Fulnar",
          "Jawahar Navodaya Vidyalaya Hiroli",
          "Government Girls School Karli",
          "St. Mary's Convent School Katekalyan",
          "Government Middle School Kuakonda",
          "Bal Bharati Public School Geedam",
          "Government Tribal School Aalnar",
          "DAV Public School Bacheli",
          "Government Secondary School Fulnar",
          "Little Angels School Hiroli",
          "Government Primary School Karli",
          "Christ Church School Katekalyan",
          "Government Higher Secondary School Kuakonda",
          "Maharishi Vidya Mandir Geedam",
          "Government Primary School Bacheli",
          "Holy Cross School Aalnar",
          "Government Middle School Fulnar",
          "Vidya Bharti School Hiroli",
          "Government Girls High School Karli",
          "Delhi Public School Katekalyan",
          "Government Tribal High School Kuakonda",
          "Ramakrishna Mission School Geedam",
          "Government Primary School Bacheli North",
          "Sharda Vidyalaya Aalnar",
          "Government High School Fulnar East",
          "Modern Public School Hiroli",
          "Government Secondary School Karli",
          "Cambridge School Katekalyan",
          "Government Tribal Middle School Kuakonda",
          "Vivekananda Kendra Vidyalaya Geedam",
          "Government Girls Primary School Bacheli",
          "Sunrise Public School Aalnar",
          "Government Higher Secondary School Fulnar",
          "Army Public School Hiroli",
          "Government High School Karli West",
          "Mount Carmel School Katekalyan",
          "Government Ashram School Kuakonda",
          "Bharatiya Vidya Bhavan Geedam",
          "Government Primary School Bacheli South",
          "Green Valley School Aalnar",
          "Government Middle School Fulnar West",
          "Railway Higher Secondary School Hiroli",
          "Government Tribal Primary School Karli",
          "St. Joseph's School Katekalyan",
          "Government Secondary School Kuakonda East",
          "Kendriya Vidyalaya Geedam No. 2",
          "Government High School Bacheli Central"
        ];

        const realBlocks = ["Geedam", "Katekalyan", "Kuakonda"];
        const realClusters = ["Aalnar", "Bacheli", "Fulnar", "Hiroli", "Karli"];

        const dummyData = Array.from({ length: 50 }, (_, index) => {
          const classes = {};
          let totalStudents = 0;
          for (let i = 1; i <= 12; i++) {
            const students = Math.floor(Math.random() * 100);
            classes[`class${i}`] = students;
            totalStudents += students;
          }
          return {
            block: realBlocks[index % realBlocks.length],
            cluster: realClusters[index % realClusters.length],
            schoolName: schoolNames[index] || `Government School ${index + 1}`,
            totalStudents,
            ...classes,
          };
        });
        setData(dummyData);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [debouncedSearchQuery, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    // Recalculate totalPages whenever data or grouping changes
    const currentData = getGroupedData();
    setPagination((prev) => ({
      ...prev,
      totalItems: currentData.length,
      totalPages: Math.ceil(currentData.length / prev.pageSize),
      currentPage: 1, // Reset to first page when data changes
    }));
  }, [data, selectedGrouping, selectedClassGroup, selectedBlock, selectedCluster, searchQuery]);

  const filteredData = data.filter(
    (item) =>
      (selectedBlock === "" || item.block === selectedBlock) &&
      (selectedCluster === "" || item.cluster === selectedCluster) &&
      (searchQuery === "" || 
        item.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Group data based on selected grouping level
  const getGroupedData = () => {
    let groupedData = [];
    
    if (selectedGrouping === "block") {
      // Group by Block only
      const blockGroups = {};
      filteredData.forEach(item => {
        if (!blockGroups[item.block]) {
          blockGroups[item.block] = {
            block: item.block,
            cluster: "All Clusters",
            schoolName: `${item.block} (Total)`,
            totalStudents: 0,
            ...Array.from({length: 12}, (_, i) => ({[`class${i+1}`]: 0})).reduce((acc, curr) => ({...acc, ...curr}), {})
          };
        }
        
        // Calculate total based on class group selection
        let itemTotal = 0;
        if (selectedClassGroup === "all") {
          itemTotal = item.totalStudents;
        } else if (selectedClassGroup === "primary") {
          for (let i = 1; i <= 8; i++) {
            itemTotal += item[`class${i}`];
          }
        } else if (selectedClassGroup === "secondary") {
          for (let i = 9; i <= 12; i++) {
            itemTotal += item[`class${i}`];
          }
        }
        
        blockGroups[item.block].totalStudents += itemTotal;
        for (let i = 1; i <= 12; i++) {
          blockGroups[item.block][`class${i}`] += item[`class${i}`];
        }
      });
      groupedData = Object.values(blockGroups);
      
    } else if (selectedGrouping === "cluster") {
      // Group by Block + Cluster
      const clusterGroups = {};
      filteredData.forEach(item => {
        const key = `${item.block}_${item.cluster}`;
        if (!clusterGroups[key]) {
          clusterGroups[key] = {
            block: item.block,
            cluster: item.cluster,
            schoolName: `${item.block} - ${item.cluster} (Total)`,
            totalStudents: 0,
            ...Array.from({length: 12}, (_, i) => ({[`class${i+1}`]: 0})).reduce((acc, curr) => ({...acc, ...curr}), {})
          };
        }
        
        // Calculate total based on class group selection
        let itemTotal = 0;
        if (selectedClassGroup === "all") {
          itemTotal = item.totalStudents;
        } else if (selectedClassGroup === "primary") {
          for (let i = 1; i <= 8; i++) {
            itemTotal += item[`class${i}`];
          }
        } else if (selectedClassGroup === "secondary") {
          for (let i = 9; i <= 12; i++) {
            itemTotal += item[`class${i}`];
          }
        }
        
        clusterGroups[key].totalStudents += itemTotal;
        for (let i = 1; i <= 12; i++) {
          clusterGroups[key][`class${i}`] += item[`class${i}`];
        }
      });
      groupedData = Object.values(clusterGroups);
      
    } else {
      // School level (Block + Cluster + School) - recalculate totals based on class group
      groupedData = filteredData.map(item => {
        let recalculatedTotal = 0;
        if (selectedClassGroup === "all") {
          recalculatedTotal = item.totalStudents;
        } else if (selectedClassGroup === "primary") {
          for (let i = 1; i <= 8; i++) {
            recalculatedTotal += item[`class${i}`];
          }
        } else if (selectedClassGroup === "secondary") {
          for (let i = 9; i <= 12; i++) {
            recalculatedTotal += item[`class${i}`];
          }
        }
        
        return {
          ...item,
          totalStudents: recalculatedTotal
        };
      });
    }
    
    return groupedData;
  };

  const processedData = getGroupedData();

  const columns = [
    { name: "block", label: "Block" },
    ...(selectedGrouping !== "block" ? [{ name: "cluster", label: "Cluster" }] : []),
    ...(selectedGrouping === "school" ? [{ name: "schoolName", label: "School Name" }] : []),
    { name: "totalStudents", label: "Total Students" },
    ...(selectedClassGroup === "all" || selectedClassGroup === "primary" 
      ? Array.from({ length: 8 }, (_, i) => ({
          name: `class${i + 1}`,
          label: `Class ${i + 1}`,
        }))
      : []
    ),
    ...(selectedClassGroup === "all" || selectedClassGroup === "secondary"
      ? Array.from({ length: 4 }, (_, i) => ({
          name: `class${i + 9}`,
          label: `Class ${i + 9}`,
        }))
      : []
    ),
  ];

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

  const isAnyFilterActive = selectedBlock !== "" || selectedCluster !== "" || searchQuery !== "" || selectedGrouping !== "school" || selectedClassGroup !== "all";

  const resetFilters = () => {
    setSelectedBlock("");
    setSelectedCluster("");
    setSearchQuery("");
    setSelectedGrouping("school");
    setSelectedClassGroup("all");
  };

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      totalPages: Math.ceil(processedData.length / newPageSize),
      currentPage: 1, // Reset to first page
    }));
  };

  const paginatedData = processedData.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  return (
    <ThemeProvider theme={theme}>
      <div className="main-page-wrapper px-3 sm:px-4" style={{ position: "relative" }}>
        <div className="header-container mb-1">
          <h5 className="text-lg font-bold text-[#2F4F4F]">Student Enrollment Analytics</h5>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive enrollment data with flexible grouping by Block, Cluster, and School levels for Classes 1-8 and 9-12
          </p>
        </div>

        <div className="school-list-container mt-1 bg-white rounded-lg">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
            <div className="w-full lg:flex-1">
              <div className="flex flex-col md:flex-row md:flex-wrap gap-2 my-[10px] mx-0">
                <div className="flex justify-between w-full flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    <TextField
                      variant="outlined"
                      placeholder="Search by Block, Cluster, School Name.."
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <div className="pr-2">
                            {isLoading ? (
                              <CircularProgress size={18} sx={{ color: "#2F4F4F" }} />
                            ) : (
                              <Search size={18} className="text-gray-500" />
                            )}
                          </div>
                        ),
                        style: {
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          height: "48px",
                          minWidth: "150px",
                          width: "385px",
                        },
                      }}
                      sx={{
                        width: { xs: "100%", md: "385px" },
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    />

                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "120px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
                        sx={{
                          color: "#2F4F4F",
                          fontFamily: "'Work Sans'",
                          fontWeight: 400,
                          fontSize: "14px",
                          transform: "translate(14px, 14px) scale(1)",
                          "&.Mui-focused, &.MuiFormLabel-filled": {
                            transform: "translate(14px, -9px) scale(0.75)",
                          },
                        }}
                      >
                        Grouping
                      </InputLabel>
                      <Select
                        value={selectedGrouping}
                        onChange={(e) => setSelectedGrouping(e.target.value)}
                        sx={{
                          height: "100%",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "8px",
                          },
                          "& .MuiSelect-select": {
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            color: "#2F4F4F",
                            fontWeight: "600",
                          },
                        }}
                      >
                        {groupingOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "120px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
                        sx={{
                          color: "#2F4F4F",
                          fontFamily: "'Work Sans'",
                          fontWeight: 400,
                          fontSize: "14px",
                          transform: "translate(14px, 14px) scale(1)",
                          "&.Mui-focused, &.MuiFormLabel-filled": {
                            transform: "translate(14px, -9px) scale(0.75)",
                          },
                        }}
                      >
                        Class Group
                      </InputLabel>
                      <Select
                        value={selectedClassGroup}
                        onChange={(e) => setSelectedClassGroup(e.target.value)}
                        sx={{
                          height: "100%",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "8px",
                          },
                          "& .MuiSelect-select": {
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            color: "#2F4F4F",
                            fontWeight: "600",
                          },
                        }}
                      >
                        {classGroupOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "100px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
                        sx={{
                          color: "#2F4F4F",
                          fontFamily: "'Work Sans'",
                          fontWeight: 400,
                          fontSize: "14px",
                          transform: "translate(14px, 14px) scale(1)",
                          "&.Mui-focused, &.MuiFormLabel-filled": {
                            transform: "translate(14px, -9px) scale(0.75)",
                          },
                        }}
                      >
                        Block
                      </InputLabel>
                      <Select
                        value={selectedBlock}
                        onChange={(e) => setSelectedBlock(e.target.value)}
                        sx={{
                          height: "100%",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "8px",
                          },
                          "& .MuiSelect-select": {
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            color: "#2F4F4F",
                            fontWeight: "600",
                          },
                        }}
                      >
                        <MenuItem value="">All Blocks</MenuItem>
                        {blocks.map((block) => (
                          <MenuItem key={block} value={block}>
                            {block}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      sx={{
                        height: "48px",
                        display: "flex",
                        width: "auto",
                        minWidth: "100px",
                        marginBottom: { xs: "8px", md: "0" },
                      }}
                    >
                      <InputLabel
                        sx={{
                          color: "#2F4F4F",
                          fontFamily: "'Work Sans'",
                          fontWeight: 400,
                          fontSize: "14px",
                          transform: "translate(14px, 14px) scale(1)",
                          "&.Mui-focused, &.MuiFormLabel-filled": {
                            transform: "translate(14px, -9px) scale(0.75)",
                          },
                        }}
                      >
                        Cluster
                      </InputLabel>
                      <Select
                        value={selectedCluster}
                        onChange={(e) => setSelectedCluster(e.target.value)}
                        sx={{
                          height: "100%",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderRadius: "8px",
                          },
                          "& .MuiSelect-select": {
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            color: "#2F4F4F",
                            fontWeight: "600",
                          },
                        }}
                      >
                        <MenuItem value="">All Clusters</MenuItem>
                        {clusters.map((cluster) => (
                          <MenuItem key={cluster} value={cluster}>
                            {cluster}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Clear Filters Button */}
                    {isAnyFilterActive && (
                      <Tooltip title="Clear Filters" placement="top">
                        <Button
                          type="button"
                          onClick={resetFilters}
                          variant="text"
                          sx={{
                            color: "#2F4F4F",
                            fontFamily: "Work Sans",
                            fontWeight: 600,
                            fontSize: "14px",
                            textTransform: "none",
                            height: "48px",
                            padding: "0 12px",
                            background: "transparent",
                            "&:hover": {
                              background: "#f5f5f5",
                            },
                          }}
                        >
                          Clear Filters
                        </Button>
                      </Tooltip>
                    )}
                  </div>

                  <div className="ml-auto">
                    <ButtonCustom
                      onClick={() => toast.info("Download Report functionality coming soon!")}
                      text="Download Report"
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        padding: "12px 16px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: "8px",
              position: "relative",
              minHeight: "300px",
            }}
            className="rounded-lg overflow-hidden border border-gray-200 overflow-x-auto"
          >
            <MUIDataTable data={paginatedData} columns={columns} options={options} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              margin: "20px 0",
              padding: "0 24px",
            }}
          >
            <div style={{ width: "180px" }}></div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "180px",
                justifyContent: "flex-end",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#2F4F4F",
                  mr: 1,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Rows per page:
              </Typography>
              <Select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                variant="standard"
                disableUnderline
                sx={{
                  height: "32px",
                  minWidth: "60px",
                  "& .MuiSelect-select": {
                    color: "#2F4F4F",
                    fontWeight: "600",
                    py: 0,
                    pl: 1,
                  },
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </div>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            style={{ zIndex: 99999999 }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}