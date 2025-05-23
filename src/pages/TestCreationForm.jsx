import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CLASS_GROUPS, SUBJECTS_BY_GRADE } from "./../data/testData";
import { ChevronDown, Trash2 } from "lucide-react";
import ButtonCustom from "../components/ButtonCustom";
import ModalSummary from "../components/SummaryModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiInstance from "../../api";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ConfirmationModal from "../components/modal/ConfirmationModal";

const TestCreationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.state?.isEditMode || false;
  const testData = location.state?.testData || null;

  // State management
  const [activeClassGroupId, setActiveClassGroupId] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState({});
  // const [testSeriesNumber, setTestSeriesNumber] = useState("");
  const [testSeriesMonth, setTestSeriesMonth] = useState("");
  const [showClassGroupModal, setShowClassGroupModal] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState(null);
  const [showTestTypeModal, setShowTestTypeModal] = useState(false);
  const [pendingTestType, setPendingTestType] = useState(null);

  const [formData, setFormData] = useState({
    testType: "syllabus",
    testTag: "", // Use testCategory instead of testTag
  });
  const [subjectRows, setSubjectRows] = useState({});
  const [maxScores, setMaxScores] = useState({});

  // Modal and API states
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testTagInput, setTestTagInput] = useState("");

  // Add a state to track if we're in edit mode
  const [editMode, setEditMode] = useState(isEditMode);

  const handleTestSeriesMonthChange = (e) => {
    setTestSeriesMonth(e.target.value);
  };

  // Improve the date formatting function to handle API date format
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      // For API date format like "2025-05-04T00:00:00.000Z"
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const populateFormWithTestData = (test) => {
    setTestTagInput(test.testTag || "");
    // Set form data
    setFormData({
      testType: test.testType?.toLowerCase() === "remedial" ? "remedial" : "syllabus",
      testTag: test.testTag || "",
    });

    // Find which class group contains this class
    const classNum = test.testClass;
    let foundGroupId = null;

    // Find the group that contains this class
    for (const group of CLASS_GROUPS) {
      if (group.classes.includes(classNum)) {
        foundGroupId = group.id;
        break;
      }
    }

    if (foundGroupId) {
      setActiveClassGroupId(foundGroupId);

      // Set selected class
      const className = `Class ${classNum}`;
      const selectedClassObj = {};
      selectedClassObj[className] = true;
      setSelectedClasses(selectedClassObj);

      // Set max score
      if (test.maxScore) {
        const maxScoreObj = {};
        maxScoreObj[className] = test.maxScore;
        setMaxScores(maxScoreObj);
      }

      // Set subject rows with test date and deadline
      if (test.subject) {
        const subjectRowObj = {};
        subjectRowObj[className] = [
          {
            id: `${className}_1`,
            subject: test.subject.toLowerCase().replace(/\s+/g, "_"),
            testDate: formatDateForInput(test.testDate),
            submissionDeadline: formatDateForInput(test.deadline),
          },
        ];
        setSubjectRows(subjectRowObj);
      }
    }
  };

  // Add useEffect to populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && testData) {
      populateFormWithTestData(testData);
    }
  }, [isEditMode, testData]);

  // Toggle class selection within the active group
  const toggleClassSelection = (className) => {
    setSelectedClasses((prev) => {
      const newSelections = { ...prev };

      if (newSelections[className]) {
        delete newSelections[className];
      } else {
        newSelections[className] = true;
        // Initialize with one subject row when a class is selected
        if (!subjectRows[className]) {
          setSubjectRows((prevRows) => ({
            ...prevRows,
            [className]: [
              {
                id: `${className}_1`,
                subject: "",
                testDate: "",
                submissionDeadline: "",
              },
            ],
          }));
        }
      }

      return newSelections;
    });
  };

  // Add a new subject row for a class
  const addSubjectRow = (className) => {
    setSubjectRows((prev) => {
      const currentRows = prev[className] || [];
      const newId = `${className}_${currentRows.length + 1}`;

      return {
        ...prev,
        [className]: [
          ...currentRows,
          {
            id: newId,
            subject: "",
            testDate: "",
            submissionDeadline: "",
          },
        ],
      };
    });
  };

  // Remove a subject row
  const removeSubjectRow = (className, rowId) => {
    setSubjectRows((prev) => {
      const filteredRows = prev[className].filter((row) => row.id !== rowId);
      return {
        ...prev,
        [className]: filteredRows,
      };
    });
  };

  // 1. UPDATED SUBJECT ROW CHANGE HANDLER
  const handleSubjectRowChange = (className, rowId, field, value) => {
    // Get current row data first to compare dates
    const currentRow = subjectRows[className].find((row) => row.id === rowId);

    // Create updated row with new value
    const updatedRow = { ...currentRow, [field]: value };

    // Date validation check
    if (
      (field === "testDate" || field === "submissionDeadline") &&
      updatedRow.testDate &&
      updatedRow.submissionDeadline
    ) {
      const testDate = new Date(updatedRow.testDate);
      const submissionDate = new Date(updatedRow.submissionDeadline);

      // Reset time part for accurate date comparison
      testDate.setHours(0, 0, 0, 0);
      submissionDate.setHours(0, 0, 0, 0);

      // Check if submission date is not AFTER the test date
      if (submissionDate.getTime() <= testDate.getTime()) {
        toast.error("Submission deadline must be after the test date");
        return; // Don't update the state with invalid dates
      }
    }

    // If validation passes or isn't needed, update state
    setSubjectRows((prev) => {
      const updatedRows = prev[className].map((row) => {
        if (row.id === rowId) {
          return updatedRow;
        }
        return row;
      });

      return {
        ...prev,
        [className]: updatedRows,
      };
    });
  };

  // 2. UPDATED FORM VALIDATION FUNCTION
  const validateForm = () => {
    // Check if class group is selected
    if (!activeClassGroupId) {
      toast.error("Please select a class group");
      return false;
    }

    if (formData.testTag === "Monthly" && !testSeriesMonth) {
      toast.error("Please enter a Monthly Test Series Month");
      return false;
    }

    // Check if at least one class is selected
    if (Object.keys(selectedClasses).length === 0) {
      toast.error("Please select at least one class");
      return false;
    }

    // Check test tag/category
    if (!formData.testTag) {
      toast.error("Please select a test tag");
      return false;
    }

    // Validate each class's data
    for (const className of Object.keys(selectedClasses)) {
      // Skip max score validation for remedial tests
      if (formData.testType === "syllabus") {
        // Validate max score exists
        if (!maxScores[className]) {
          toast.error(`Please enter a max score for ${className}`);
          return false;
        }

        // Validate max score value <= 100
        if (parseInt(maxScores[className]) > 100) {
          toast.error(`Maximum score cannot exceed 100 for ${className}`);
          return false;
        }
      }

      // Check if at least one subject is added
      if (!subjectRows[className] || subjectRows[className].length === 0) {
        toast.error(`Please add at least one subject for ${className}`);
        return false;
      }

      // Validate each subject row
      for (const row of subjectRows[className]) {
        // Validate subject is selected
        if (!row.subject) {
          toast.error(`Please select a subject for ${className}`);
          return false;
        }

        // Validate test date is selected
        if (!row.testDate) {
          // Get formatted subject name for display
          const subjectDisplay = row.subject
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          toast.error(`Please select a test date for ${subjectDisplay} in ${className}`);
          return false;
        }

        // Validate submission deadline is selected
        if (!row.submissionDeadline) {
          // Get formatted subject name for display
          const subjectDisplay = row.subject
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          toast.error(`Please select a submission deadline for ${subjectDisplay} in ${className}`);
          return false;
        }

        // Validate submission date is after test date
        const testDate = new Date(row.testDate);
        const submissionDate = new Date(row.submissionDeadline);

        // Reset time part for accurate date comparison
        testDate.setHours(0, 0, 0, 0);
        submissionDate.setHours(0, 0, 0, 0);

        if (submissionDate.getTime() <= testDate.getTime()) {
          // Get formatted subject name for display
          const subjectDisplay = row.subject
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          toast.error(
            `Submission deadline must be after the test date for ${subjectDisplay} in ${className}`
          );
          return false;
        }
      }
    }

    // All validations passed
    return true;
  };

  const handleMaxScoreChange = (className, value) => {
    // Parse value to number
    const scoreValue = parseInt(value);

    // Check if score exceeds max allowed (100)
    if (scoreValue > 100) {
      toast.error("Maximum score cannot exceed 100");
      // Cap the value at 100
      setMaxScores((prev) => ({
        ...prev,
        [className]: 100,
      }));
    } else {
      // Normal case, update as usual
      setMaxScores((prev) => ({
        ...prev,
        [className]: value,
      }));
    }
  };

  // Prepare data for summary modal
  const prepareSummaryData = () => {
    // Convert data for ModalSummary
    const selectedGrades = [];
    const selectedSubjects = {};
    const testDates = {};
    const testDeadlines = {};
    const testScores = {};

    // Process each selected class
    Object.keys(selectedClasses).forEach((className) => {
      // Extract class number if in format "Class X"
      const grade = className.includes("Class ")
        ? parseInt(className.replace("Class ", ""))
        : className;

      selectedGrades.push(grade);
      selectedSubjects[grade] = [];

      // Process each subject row
      subjectRows[className]?.forEach((row) => {
        if (row.subject) {
          // Format subject for display (capitalize first letter of each word)
          const displaySubject = row.subject
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          selectedSubjects[grade].push(displaySubject);

          const key = `${grade}-${displaySubject}`;
          testDates[key] = row.testDate;
          testDeadlines[key] = row.submissionDeadline;

          // Only add maxScore for syllabus tests
          if (formData.testType === "syllabus") {
            testScores[key] = maxScores[className];
          }
        }
      });
    });

    // Base data to return
    const summaryData = {
      selectedGrades,
      selectedSubjects,
      testDates,
      testDeadlines,
      testType: formData.testType === "syllabus" ? "regular" : "remedial",
      testTag: formData.testTag,
    };

    // Only include testScores for syllabus tests
    if (formData.testType === "syllabus") {
      summaryData.testScores = testScores;
    }

    return summaryData;
  };

  const getFormattedTestTag = () => {
    if (formData.testTag === "Monthly" && testSeriesMonth) {
      return `${formData.testTag}_${testSeriesMonth}`;
    }
    return formData.testTag;
  };

  // API call to create or update test
  const handleCreateTest = async () => {
    setIsSubmitting(true);
    try {
      let payload;

      if (editMode) {
        // Simplified payload for edit mode
        // Get the first subject row from the first selected class
        const firstClassName = Object.keys(selectedClasses)[0];
        const firstSubjectRow = subjectRows[firstClassName][0];

        payload = {
          testType: formData.testType === "syllabus" ? "SYLLABUS" : "REMEDIAL",
          testTag: getFormattedTestTag(),
          testDate: firstSubjectRow.testDate,
          deadline: firstSubjectRow.submissionDeadline,
        };
      } else {
        // Complex payload for create mode
        payload = {
          testType: formData.testType === "syllabus" ? "SYLLABUS" : "REMEDIAL",
          testTag: getFormattedTestTag(),
          classes: Object.keys(selectedClasses).map((className) => {
            const classNum = className.includes("Class ")
              ? parseInt(className.replace("Class ", ""))
              : className;

            // Only include maxScore for syllabus tests
            const classData = {
              class: classNum,
              subjects: subjectRows[className]
                .filter((row) => row.subject)
                .map((row) => {
                  const subjectData = {
                    subject: row.subject
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join("_"),
                    testDate: row.testDate,
                    deadline: row.submissionDeadline,
                  };

                  // Only add maxScore for syllabus tests
                  if (formData.testType === "syllabus") {
                    subjectData.maxScore = Number(maxScores[className]) || 100;
                  }

                  return subjectData;
                }),
            };

            return classData;
          }),
        };
      }

      // Make API call - use PATCH for edit, POST for create
      const response = editMode
        ? await apiInstance.patch(`/test/${testData.id}`, payload)
        : await apiInstance.post("/test", payload);

      if (response?.data?.success) {
        toast.success(editMode ? "Test Updated Successfully" : "Test Created Successfully");
        navigate("/", {
          state: {
            successMessage: editMode ? "Test Updated Successfully" : "Test Created Successfully",
          },
        });
      } else {
        toast.error(editMode ? "Failed to update test" : "Failed to create test");
      }
    } catch (error) {
      console.error("Error =>", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
      setShowSummary(false);
    }
  };

  // Show summary modal after validation
  const handleShowSummary = (e) => {
    e.preventDefault(); // Prevent form submission

    // Validate the form
    if (!validateForm()) {
      return;
    }

    // Show summary modal
    setShowSummary(true);
  };

  // Handle modal confirmation - this triggers the API call
  const handleModalConfirm = () => {
    handleCreateTest();
  };

  // Get clean class ID for DOM IDs
  const getClassId = (className) => {
    return typeof className === "number"
      ? `class_${className}`
      : `class_${className}`.replace(/\s+/g, "_").toLowerCase();
  };

  const handleGroupCardSelect = (groupId) => {
    // If there's no active group or no subjects added yet, just select it directly
    if (
      activeClassGroupId === null ||
      !Object.keys(selectedClasses).length ||
      !Object.values(subjectRows).some((rows) => rows.length > 0)
    ) {
      setActiveClassGroupId(groupId);
      return;
    }

    // Otherwise, store the pending selection and show confirmation modal
    if (activeClassGroupId !== groupId) {
      setPendingGroupId(groupId);
      setShowClassGroupModal(true);
    } else {
      // If clicking the active group again, just collapse it as before
      setActiveClassGroupId(null);
      setSelectedClasses({});
      setSubjectRows({});
    }
  };

  // Function to get group name by ID
  const getGroupNameById = (id) => {
    const group = CLASS_GROUPS.find((g) => g.id === id);
    return group ? group.name : "";
  };

  // Confirmation handler for changing group
  const handleConfirmGroupChange = () => {
    setActiveClassGroupId(pendingGroupId);
    setSelectedClasses({});
    setSubjectRows({});
    setShowClassGroupModal(false);
  };

  const getTestTypeName = (type) => {
    if (!type) return ""; // Return empty string or some default value if type is null or undefined
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Show confirmation for test type changes if data has been entered
    if (
      name === "testType" &&
      value !== formData.testType &&
      Object.keys(selectedClasses).length > 0
    ) {
      setPendingTestType(value);
      setShowTestTypeModal(true);
      return;
    }

    // Otherwise update normally
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form field changes
  // const handleFormChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // Confirmation handler for changing test type
  const handleConfirmTestTypeChange = () => {
    setFormData((prev) => ({
      ...prev,
      testType: pendingTestType,
    }));
    setShowTestTypeModal(false);
  };

  return (
    <div className="main-page-wrapper text-[#2F4F4F] font-['Work_Sans'] w-[840px] mx-auto">
      <header className="mb-4">
        <h5 className="text-lg font-bold text-[#2F4F4F]">{editMode ? "Edit Test" : "New Test"}</h5>
        {/* 
        <p className="text-[#597272] mt-2 font-['Work_Sans']">
          {editMode
            ? "Update the test dates below. Other fields are read-only."
            : "Fill in the details below to schedule new tests."}
        </p> */}
      </header>

      <form>
        {/* Test Configuration Section */}
        <div className="bg-white   ">
          {/* Test Type with Radio Buttons */}
          <div className="mb-6">
            <label
              className="block mb-3 text-sm"
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                color: "#2F4F4F",
              }}
            >
              Test Type
            </label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  id="syllabus"
                  name="testType"
                  type="radio"
                  className="h-4 w-4 text-[#2F4F4F] border-gray-300 focus:ring-[#2F4F4F]"
                  value="syllabus"
                  checked={formData.testType === "syllabus"}
                  onChange={handleFormChange}
                  disabled={editMode}
                />
                <label
                  htmlFor="syllabus"
                  className="ml-2 block text-sm"
                  style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: formData.testType === "syllabus" ? 600 : 400,
                    fontSize: "18px",
                    color: "#2F4F4F",
                  }}
                >
                  Syllabus
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="remedial"
                  name="testType"
                  type="radio"
                  className="h-4 w-4 text-[#2F4F4F] border-gray-300 focus:ring-[#2F4F4F]"
                  value="remedial"
                  checked={formData.testType === "remedial"}
                  onChange={handleFormChange}
                  disabled={editMode}
                />
                <label
                  htmlFor="remedial"
                  className="ml-2 block text-sm"
                  style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: formData.testType === "remedial" ? 600 : 400,
                    fontSize: "18px",
                    color: "#2F4F4F",
                  }}
                >
                  Remedial
                </label>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-${formData.testTag === "Monthly" ? "2" : "1"} gap-x-6 gap-y-4`}>
  {/* Test Tag Dropdown */}
  <div className={formData.testTag === "Monthly" ? "" : "col-span-1"}>
    <label
      className="block mb-2 text-sm"
      htmlFor="testTag"
      style={{
        fontFamily: "'Work Sans', sans-serif",
        fontWeight: 600,
        fontSize: "18px",
        color: "#2F4F4F",
      }}
    >
      Test Tag
    </label>
    <div className="relative">
      <select
        id="testTag"
        name="testTag"
        className={`w-full p-2.5 border border-gray-300 rounded-md bg-white text-[#2F4F4F] focus:outline-none focus:border-[#2F4F4F] focus:ring-1 focus:ring-[#D4DAE8] appearance-none ${
          editMode ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        value={formData.testTag}
        onChange={handleFormChange}
        disabled={editMode}
      >
        <option value="">Select Test Tag</option>
        <option value="Monthly">Monthly</option>
        <option value="Quarterly">Quarterly</option>
        <option value="Half_Yearly">Half Yearly</option>
        <option value="Pre_Board">Pre Boards</option>
        <option value="Annual">Annual</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>

  {/* Test Series Month Dropdown - Only show if Monthly */}
  {formData.testTag === "Monthly" && (
    <div>
      <label
        className="block mb-2 text-sm"
        htmlFor="testSeriesMonth"
        style={{
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 600,
          fontSize: "18px",
          color: "#2F4F4F",
        }}
      >
        Test Series Month
      </label>
      <div className="relative">
        <select
          id="testSeriesMonth"
          name="testSeriesMonth"
          className={`w-full p-2.5 border border-gray-300 rounded-md bg-white text-[#2F4F4F] focus:outline-none focus:border-[#2F4F4F] focus:ring-1 focus:ring-[#D4DAE8] appearance-none ${
            editMode ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          value={testSeriesMonth}
          onChange={handleTestSeriesMonthChange}
          disabled={editMode || formData.testTag !== "Monthly"}
        >
          <option value="">Select Month</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  )}
</div>
        </div>

        {/* Class Group Selection Section - Compressed */}

        <div className="mb-8">
          <h2
            className="mb-4"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#2F4F4F",
              marginTop: "30px",
            }}
          >
            {editMode ? "Target Class Group" : "Select Target Class Group"}
          </h2>

          <div className="space-y-4">
            {/* Row 1: First 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLASS_GROUPS.slice(0, 2).map((group) => (
                <div
                  key={group.id}
                  className={`border rounded-lg ${
                    !editMode ? "cursor-pointer" : ""
                  } transition-all ${
                    activeClassGroupId === group.id
                      ? "border-[#2F4F4F] shadow-sm bg-white"
                      : "border-[#E0E5E5] bg-white hover:border-[#597272]"
                  } ${editMode ? "opacity-75" : ""}`}
                  style={{ height: activeClassGroupId === group.id ? "111px" : "63px",boxShadow: "0px 1px 5px rgba(47, 79, 79, 0.08)",}}
                  onClick={() => !editMode && handleGroupCardSelect(group.id)}
                  tabIndex={!editMode ? "0" : "-1"}
                  onKeyDown={(e) => {
                    if (!editMode && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleGroupCardSelect(group.id);
                    }
                  }}
                >
                  <div className="p-6">
                    <div
                      className="text-base mb-3"
                      style={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: "18px",
                        color: "#2F4F4F",
                      }}
                    >
                      {group.name}
                    </div>
                    {activeClassGroupId === group.id && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {group.classes.map((classItem) => {
                          const className =
                            typeof classItem === "number" ? `Class ${classItem}` : classItem;
                          return (
                            <div
                              key={className}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                selectedClasses[className]
                                  ? "bg-[#2F4F4F] text-white border-[#2F4F4F] font-medium"
                                  : "bg-[#EAEDED]  text-[#2F4F4F] hover:bg-[#F0F5F5]"
                              } ${editMode ? "pointer-events-none" : ""}`}
                              onClick={(e) => {
                                if (!editMode) {
                                  e.stopPropagation();
                                  toggleClassSelection(className);
                                }
                              }}
                              tabIndex={!editMode ? "0" : "-1"}
                              onKeyDown={(e) => {
                                if (!editMode && (e.key === "Enter" || e.key === " ")) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleClassSelection(className);
                                }
                              }}
                            >
                              {className}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Next 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLASS_GROUPS.slice(2, 4).map((group) => (
                <div
                  key={group.id}
                  className={`border rounded-lg ${
                    !editMode ? "cursor-pointer" : ""
                  } transition-all ${
                    activeClassGroupId === group.id
                      ? "border-[#2F4F4F] shadow-sm bg-white"
                      : "border-[#E0E5E5] bg-white hover:border-[#597272]"
                  } ${editMode ? "opacity-75" : ""}`}
                  style={{ height: activeClassGroupId === group.id ? "111px" : "63px", boxShadow: "0px 1px 5px rgba(47, 79, 79, 0.08)",}}
                  onClick={() => !editMode && handleGroupCardSelect(group.id)}
                  tabIndex={!editMode ? "0" : "-1"}
                  onKeyDown={(e) => {
                    if (!editMode && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleGroupCardSelect(group.id);
                    }
                  }}
                >
                  <div className="p-6">
                    <div
                      className="text-base mb-3"
                      style={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: "18px",
                        color: "#2F4F4F",
                      }}
                    >
                      {group.name}
                    </div>
                    {activeClassGroupId === group.id && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {group.classes.map((classItem) => {
                          const className =
                            typeof classItem === "number" ? `Class ${classItem}` : classItem;
                          return (
                            <div
                              key={className}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                selectedClasses[className]
                                  ? "bg-[#2F4F4F] text-white border-[#2F4F4F] font-medium"
                                  : "bg-[#EAEDED]  text-[#2F4F4F] hover:bg-[#F0F5F5]"
                              } ${editMode ? "pointer-events-none" : ""}`}
                              onClick={(e) => {
                                if (!editMode) {
                                  e.stopPropagation();
                                  toggleClassSelection(className);
                                }
                              }}
                              tabIndex={!editMode ? "0" : "-1"}
                              onKeyDown={(e) => {
                                if (!editMode && (e.key === "Enter" || e.key === " ")) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleClassSelection(className);
                                }
                              }}
                            >
                              {className}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Row 3: Last card (centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLASS_GROUPS.slice(4, 5).map((group) => (
                <div
                  key={group.id}
                  className={`border rounded-lg ${
                    !editMode ? "cursor-pointer" : ""
                  } transition-all ${
                    activeClassGroupId === group.id
                      ? "border-[#2F4F4F] shadow-sm bg-white"
                      : "border-[#E0E5E5] bg-white hover:border-[#597272]"
                  } ${editMode ? "opacity-75" : ""}`}
                    style={{ height: activeClassGroupId === group.id ? "111px" : "63px",boxShadow: "0px 1px 5px rgba(47, 79, 79, 0.08)", }}
                  onClick={() => !editMode && handleGroupCardSelect(group.id)}
                  tabIndex={!editMode ? "0" : "-1"}
                  onKeyDown={(e) => {
                    if (!editMode && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleGroupCardSelect(group.id);
                    }
                  }}
                >
                  <div className="p-6">
                    <div
                      className="text-base mb-3"
                      style={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: "18px",
                        color: "#2F4F4F",
                      }}
                    >
                      {group.name}
                    </div>
                    {activeClassGroupId === group.id && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {group.classes.map((classItem) => {
                          const className =
                            typeof classItem === "number" ? `Class ${classItem}` : classItem;
                          return (
                            <div
                              key={className}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                selectedClasses[className]
                                  ? "bg-[#2F4F4F] text-white border-[#2F4F4F] font-medium"
                                  : "bg-[#EAEDED]  text-[#2F4F4F] hover:bg-[#F0F5F5]"
                              } ${editMode ? "pointer-events-none" : ""}`}
                              onClick={(e) => {
                                if (!editMode) {
                                  e.stopPropagation();
                                  toggleClassSelection(className);
                                }
                              }}
                              tabIndex={!editMode ? "0" : "-1"}
                              onKeyDown={(e) => {
                                if (!editMode && (e.key === "Enter" || e.key === " ")) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleClassSelection(className);
                                }
                              }}
                            >
                              {className}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Add empty div to ensure proper spacing in a 2-column grid */}
              <div className="hidden md:block"></div>
            </div>
          </div>
        </div>

        {/* Selected Classes Details Section */}
        <div className="space-y-6">
          {Object.keys(selectedClasses).map((className) => (
            <div
              key={getClassId(className)}
              className="p-3 border border-gray-200 rounded-lg bg-white shadow-sm mt-6"
            >
              {/* Header */}
              <h3 className="text-lg font-semibold text-[#2F4F4F] mb-4 font-['Karla']">
                {className} - Subject and Test Details
              </h3>

              {/* Only show max score field for syllabus tests */}
              {formData.testType === "syllabus" && (
                <div className="mb-6">
                  <div className="mb-1">
                    <label
                      htmlFor={`max_score_${getClassId(className)}`}
                      className="block text-sm font-semibold text-[#2F4F4F]"
                    >
                      Overall Max Score
                    </label>
                  </div>
                  <input
                    type="number"
                    id={`max_score_${getClassId(className)}`}
                    className={`w-full p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-1 focus:ring-[#D4DAE8] ${
                      editMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="e.g., 100"
                    value={maxScores[className] || ""}
                    onChange={(e) => !editMode && handleMaxScoreChange(className, e.target.value)}
                    disabled={editMode}
                    required
                  />
                  <div className="mt-1">
                    <span className="text-sm text-purple-700">Max Score upper limit is 100</span>
                  </div>
                </div>
              )}

              {/* Subjects Table */}
              <div>
                {/* Modified grid layout with 50-20-20-10 column widths */}
                <div className="grid grid-cols-10 gap-4 text-sm text-[#2F4F4F] font-semibold py-2 border-b border-gray-200">
                  <div className="col-span-5">Subject</div>
                  <div className="col-span-2">Test Date</div>
                  <div className="col-span-2">Submission Deadline</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {subjectRows[className]?.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-10 gap-4 items-center py-3 border-b border-gray-100"
                  >
                    <div className="col-span-5">
                      <select
                        className={`w-full p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-1 focus:ring-[#D4DAE8] ${
                          editMode ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                        value={row.subject}
                        onChange={(e) =>
                          !editMode &&
                          handleSubjectRowChange(className, row.id, "subject", e.target.value)
                        }
                        disabled={editMode}
                        required
                      >
                        <option value="">Select Subject...</option>
                        {(() => {
                          const classNum = className.includes("Class ")
                            ? parseInt(className.replace("Class ", ""))
                            : parseInt(className);

                          // Get all subjects for this class from SUBJECTS_BY_GRADE
                          const subjectsForClass = SUBJECTS_BY_GRADE[classNum] || [];

                          // Get already selected subjects in this class (EXCLUDING the current row)
                          const selectedSubjects = subjectRows[className]
                            .filter((otherRow) => otherRow.id !== row.id && otherRow.subject)
                            .map((otherRow) => otherRow.subject);

                          // Filter out already selected subjects
                          const availableSubjects = subjectsForClass.filter(
                            (subject) =>
                              !selectedSubjects.includes(subject.toLowerCase().replace(/\s+/g, "_"))
                          );

                          return availableSubjects.map((subject) => (
                            <option
                              key={subject}
                              value={subject.toLowerCase().replace(/\s+/g, "_")}
                            >
                              {subject}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    {/* Test Date - EDITABLE EVEN IN EDIT MODE */}
                    <div className="col-span-2">
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full min-w-[130px] p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-1 focus:ring-[#D4DAE8]"
                          value={row.testDate}
                          onChange={(e) =>
                            handleSubjectRowChange(className, row.id, "testDate", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    {/* Submission Deadline - EDITABLE EVEN IN EDIT MODE */}
                    <div className="col-span-2">
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full min-w-[130px] p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-1 focus:ring-[#D4DAE8]"
                          value={row.submissionDeadline}
                          onChange={(e) =>
                            handleSubjectRowChange(
                              className,
                              row.id,
                              "submissionDeadline",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        className={`bg-transparent text-[#F44336] hover:text-[#C3362B] p-1 rounded-md ${
                          editMode ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => !editMode && removeSubjectRow(className, row.id)}
                        disabled={editMode}
                        aria-label="Remove subject"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Subject Button - HIDE IN EDIT MODE */}
              {/* {!editMode && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => addSubjectRow(className)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-[#2F4F4F] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F4F4F]"
                  >
                    Add Subject
                  </button>
                </div>
              )} */}
              {/* Add Subject Button - HIDE IN EDIT MODE */}
              {/* Add Subject Button - HIDE IN EDIT MODE */}
              {/* Add Subject Button - ONLY SHOW IF SUBJECTS ARE AVAILABLE */}
              {!editMode &&
                (() => {
                  // Extract the class number from className
                  const classNum = className.includes("Class ")
                    ? parseInt(className.replace("Class ", ""))
                    : parseInt(className);

                  // Get all subjects for this class
                  const subjectsForClass = SUBJECTS_BY_GRADE[classNum] || [];

                  // Get already selected subjects in this class
                  const selectedSubjects = subjectRows[className]
                    .filter((row) => row.subject)
                    .map((row) => row.subject);

                  // Check if any row exists without a subject selected
                  const hasEmptySubjectRow = subjectRows[className].some((row) => !row.subject);

                  // Filter out already selected subjects
                  const availableSubjects = subjectsForClass.filter(
                    (subject) =>
                      !selectedSubjects.includes(subject.toLowerCase().replace(/\s+/g, "_"))
                  );

                  // Handle add subject click with validation
                  const handleAddSubject = () => {
                    if (hasEmptySubjectRow) {
                      toast.error("Please select a subject in the above dropdown first");
                      return;
                    }
                    addSubjectRow(className);
                  };

                  // Only render button if there are available subjects left
                  return availableSubjects.length > 0 ? (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                          hasEmptySubjectRow
                            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                            : "border-gray-300 text-[#2F4F4F] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F4F4F]"
                        }`}
                      >
                        Add Subject
                      </button>
                    </div>
                  ) : null;
                })()}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-5">
          <ButtonCustom
            onClick={handleShowSummary}
            text={
              isSubmitting
                ? editMode
                  ? "Updating Test..."
                  : "Creating Test..."
                : editMode
                ? "Update Test"
                : "Create Test"
            }
            disabled={isSubmitting}
          />
        </div>
      </form>

      {/* Toast container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Summary Modal */}
      <ModalSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        {...prepareSummaryData()}
        handleConfirm={handleModalConfirm}
        modalTitle={editMode ? "Test Update Summary" : "Confirm Test Creation"}
        isSubmitting={isSubmitting} // Pass the isSubmitting state to the modal
      />

      <ConfirmationModal
        isOpen={showClassGroupModal}
        onClose={() => setShowClassGroupModal(false)}
        onConfirm={handleConfirmGroupChange}
        title="Target Class Group Change"
        changeType="Class Group"
        fromValue={getGroupNameById(activeClassGroupId)}
        toValue={getGroupNameById(pendingGroupId)}
      />
      <ConfirmationModal
        isOpen={showTestTypeModal}
        onClose={() => setShowTestTypeModal(false)}
        onConfirm={handleConfirmTestTypeChange}
        title="Test Type Change"
        changeType="Test Type"
        fromValue={formData.testType ? getTestTypeName(formData.testType) : ""}
        toValue={pendingTestType ? getTestTypeName(pendingTestType) : ""}
      />
    </div>
  );
};

export default TestCreationForm;
