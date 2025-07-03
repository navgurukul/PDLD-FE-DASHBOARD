import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pagination, PaginationItem } from "@mui/material";

const StudentReportSubjectWise = ({ academicData, syllabusMonth, maxMarks, status, subject }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  // Process academic data to populate the table
  useEffect(() => {
    if (!academicData || !academicData.months) return;

    const processedTestData = [];

    // Iterate through each month in the academic data
    academicData.months.forEach((monthData) => {
      // Filter only syllabus tests
      const syllabusTests = monthData.tests.filter(
        (test) => test.testType === "SYLLABUS" && (subject === "All" || test.subject === subject)
      );

      // Process each test
      syllabusTests.forEach((test) => {
        // Extract month from test date
        const testDate = new Date(test.testDate);
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const month = monthNames[testDate.getMonth()];

        // Format the date
        const day = testDate.getDate();
        const year = testDate.getFullYear().toString().substr(-2);
        const formattedDate = `${day} ${month}' ${year}`;

        // Determine pass status
        let testStatus = "Absent";
        if (test.score !== null) {
          testStatus = test.passStatus ? "Pass" : "Fail";
        }

        // Create a row for the table
        const testRow = {
          name: test.testName,
          type: test.testTag,
          date: formattedDate,
          maxMarks: test.maxScore,
          marksSecured: test.score !== null ? test.score : 0,
          status: testStatus,
        };

        // Apply filters if set
        const passesMonthFilter = syllabusMonth === "All" || month === syllabusMonth;
        const passesMaxMarksFilter = maxMarks === "All" || test.maxScore === parseInt(maxMarks);
        const passesStatusFilter = status === "All" || testStatus === status; // Fixed: Direct status matching

        if (passesMonthFilter && passesMaxMarksFilter && passesStatusFilter) {
          processedTestData.push(testRow);
        }
      });
    });

    setTableData(processedTestData);
    setTotalPages(Math.ceil(processedTestData.length / rowsPerPage));
  }, [academicData, syllabusMonth, maxMarks, status, subject]);

  // Create custom theme for the table
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
              borderColor: "#2F4F4F",
            },
          },
          notchedOutline: {
            borderColor: "#ccc",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#949494",
            "&.Mui-focused": {
              color: "#2F4F4F",
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: "#2F4F4F",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            backgroundColor: "none",
            verticalAlign: "middle",
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            color: "#2F4F4F",
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
              cursor: "default !important",
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
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            color: "#2F4F4F",
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

  // Custom head label render function
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

  // Define the columns for the table
  const columns = [
    {
      name: "name",
      label: "Name of Test",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "left", width: "100%" }}>{value}</span>
        ),
      },
    },
    {
      name: "type",
      label: "Test Type",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "left", width: "100%" }}>{value}</span>
        ),
      },
    },
    {
      name: "date",
      label: "Date of Test",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
        setCellProps: () => ({ style: { textAlign: "left" } }),
        customBodyRender: (value) => (
          <span style={{ display: "block", textAlign: "left", width: "100%" }}>{value}</span>
        ),
      },
    },
    {
      name: "maxMarks",
      label: "Max Marks",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "marksSecured",
      label: "Marks Secured",
      options: {
        filter: false,
        sort: true,
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
    {
      name: "status",
      label: "Status",
      options: {
        filter: true,
        sort: true,
        setCellProps: () => ({
          style: {
            textAlign: "left",
            verticalAlign: "middle",
            width: "100px",
          },
        }),
        customBodyRender: (value) => {
          let statusClass = "";

          if (value === "Pass") {
            statusClass = "bg-[#E9F3E9] text-[#228B22]";
          } else if (value === "Fail") {
            statusClass = "bg-[#FDDCDC] text-[#F45050]";
          } else if (value === "Absent") {
            statusClass = "bg-[#E0E0E0] text-[#2F4F4F]";
          }

          return (
            <span
              className={`px-2 py-1 text-xs font-medium  ${statusClass}`}
              style={{ display: "inline-block", textAlign: "left", borderRadius: "4px" }}
            >
              {value}
            </span>
          );
        },
        customHeadLabelRender: defaultCustomHeadLabelRender,
      },
    },
  ];

  // Define options for the table
  const options = {
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,
    selectableRows: "none",
    pagination: false,
    responsive: "standard",
    rowsPerPage: rowsPerPage,
    rowsPerPageOptions: [],
    elevation: 0,
  };

  // Calculate page data
  const paginatedData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <ThemeProvider theme={theme}>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <MUIDataTable data={paginatedData} columns={columns} options={options} />
      </div>
      {tableData.length > rowsPerPage && (
        <div style={{ width: "max-content", margin: "25px auto" }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            showFirstButton
            showLastButton
            renderItem={(item) => {
              const isNextPage = item.page === currentPage + 1 && item.type === "page";

              return (
                <PaginationItem
                  {...item}
                  sx={{
                    ...(isNextPage && {
                      border: "1px solid #2F4F4F",
                      borderRadius: "100px", // fully rounded
                      color: "#2F4F4F",
                    }),
                  }}
                />
              );
            }}
          />
        </div>
      )}
    </ThemeProvider>
  );
};

export default StudentReportSubjectWise;
