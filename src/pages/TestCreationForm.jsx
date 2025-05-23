import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SUBJECT_OPTIONS, CLASS_GROUPS, SUBJECTS_BY_GRADE } from "./../data/testData";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import ButtonCustom from "../components/ButtonCustom";
import ModalSummary from "../components/SummaryModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiInstance from "../../api";
import OutlinedButton from "../components/button/OutlinedButton";
import { Autocomplete, TextField } from "@mui/material";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TestCreationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.state?.isEditMode || false;
  const testData = location.state?.testData || null;

  // State management
  const [activeClassGroupId, setActiveClassGroupId] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState({});

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

  const TEST_TAG_OPTIONS = [
    { id: "Monthly", name: "Monthly" },
    { id: "Quarterly", name: "Quarterly" },
    { id: "Half Yearly", name: "Half Yearly" },
    { id: "Pre Boards", name: "Pre Boards" },
    { id: "Annual", name: "Annual" },
  ];

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

  const filterTestTagOptions = (options, params) => {
    if (!params.inputValue) {
      return options;
    }

    const inputValue = params.inputValue.toLowerCase().trim();

    // Check for partial matches
    const partialMatches = options.filter((option) =>
      option.name.toLowerCase().includes(inputValue)
    );

    // Return matches if found
    if (partialMatches.length > 0) {
      return partialMatches;
    }

    // Check for exact match
    const exactMatch = options.some((option) => option.name.toLowerCase() === inputValue);

    // Add "Create new" option if no match found
    if (!exactMatch && inputValue) {
      return [
        {
          name: params.inputValue,
          isCreateNew: true,
        },
      ];
    }

    return [];
  };

  // Handle class group selection
  const handleGroupCardSelect = (groupId) => {
    // If clicking the same group that's already active, collapse it
    if (activeClassGroupId === groupId) {
      setActiveClassGroupId(null);
      setSelectedClasses({});
      setSubjectRows({});
      return;
    }

    // When switching to a new group, clear previous selections
    setActiveClassGroupId(groupId);
    setSelectedClasses({});
    setSubjectRows({});
  };

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

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          testTag: formData.testTag,
          testDate: firstSubjectRow.testDate,
          deadline: firstSubjectRow.submissionDeadline,
        };
      } else {
        // Complex payload for create mode
        payload = {
          testType: formData.testType === "syllabus" ? "SYLLABUS" : "REMEDIAL",
          testTag: formData.testTag,
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

  return (
    <div className="main-page-wrapper text-[#2F4F4F] font-['Work_Sans']">
      <header className="mb-4">
        {/* <h1 className="text-4xl font-bold text-[#2F4F4F] font-['Karla']">
          {editMode ? "Edit Test" : "Create New Test"}
        </h1> */}
        <h5 className="text-lg font-bold text-[#2F4F4F]">
          {editMode ? "Edit Test" : "Create New Test"}
        </h5>
        {/* 
        <p className="text-[#597272] mt-2 font-['Work_Sans']">
          {editMode
            ? "Update the test dates below. Other fields are read-only."
            : "Fill in the details below to schedule new tests."}
        </p> */}
      </header>

      <form>
        {/* Test Configuration Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-[#2F4F4F] mb-6 border-b pb-3 border-slate-200 font-['Karla']">
            Test Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block font-medium text-[#597272] mb-2 text-sm" htmlFor="testType">
                Test Type
              </label>
              <select
                id="testType"
                name="testType"
                className={`w-full p-2.5 border border-slate-300 rounded-md bg-white text-[#2F4F4F] focus:outline-none focus:border-[#049796] focus:ring-2 focus:ring-[#CDEAEA] ${
                  editMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                value={formData.testType}
                onChange={handleFormChange}
                disabled={editMode}
              >
                <option value="syllabus">Syllabus</option>
                <option value="remedial">Remedial</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#597272] mb-2 text-sm" htmlFor="testTag">
                Test Tag
              </label>
              <select
                id="testTag"
                name="testTag"
                className={`w-full p-2.5 border border-slate-300 rounded-md bg-white text-[#2F4F4F] focus:outline-none focus:border-[#049796] focus:ring-2 focus:ring-[#CDEAEA] ${
                  editMode ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                value={formData.testTag}
                onChange={handleFormChange}
                disabled={editMode}
              >
                <option value="">Select Test Tag</option>
                <option value="Monthly_1">Monthly_1</option>
                <option value="Monthly_2">Monthly_2</option>
                <option value="Monthly_3">Monthly_3</option>
                <option value="Monthly_4">Monthly_4</option>
                <option value="Quaterly">Quaterly</option>
                <option value="Half_Yearly">Half_Yearly</option>
                <option value="Pre_Board">Pre_Board</option>
              </select>
            </div>
          </div>
        </div>

        {/* Class Group Selection Section - Compressed */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <h2 className="text-lg font-semibold text-[#2F4F4F] mb-3 border-b pb-2 border-slate-200 font-['Karla']">
            {editMode ? "Target Class Group" : "Select Target Class Group"}
          </h2>
          <div className="space-y-3">
            {CLASS_GROUPS.map((group) => (
              <div
                key={group.id}
                className={`bg-white border rounded-lg p-4 ${
                  !editMode ? "cursor-pointer" : ""
                } transition-all ${
                  activeClassGroupId === group.id
                    ? "border-[#2F4F4F] shadow-sm bg-[#D4DAE8]"
                    : "border-slate-200 hover:border-slate-400"
                } ${editMode ? "opacity-75" : ""}`}
                onClick={() => !editMode && handleGroupCardSelect(group.id)}
                tabIndex={!editMode ? "0" : "-1"}
                onKeyDown={(e) => {
                  if (!editMode && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleGroupCardSelect(group.id);
                  }
                }}
              >
                <div className="text-base font-semibold text-[#2F4F4F] mb-2 flex items-center font-['Karla']">
                  {activeClassGroupId === group.id && (
                    <CheckCircle className="w-5 h-5 text-[#2F4F4F] mr-2" />
                  )}
                  {group.name}
                </div>
                {activeClassGroupId === group.id && (
                  <div className="flex flex-wrap gap-2">
                    {group.classes.map((classItem) => {
                      const className =
                        typeof classItem === "number" ? `Class ${classItem}` : classItem;
                      return (
                        <div
                          key={className}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            selectedClasses[className]
                              ? "bg-[#D4DAE8] text-[#2F4F4F] border-[#2F4F4F] font-semibold"
                              : "bg-slate-100 border-slate-200 text-[#2F4F4F] hover:bg-[#CDEAEA] hover:border-[#049796]"
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
            ))}
          </div>
        </div>

        {/* Selected Classes Details */}
        <div className="space-y-6">
          {Object.keys(selectedClasses).map((className) => (
            <div
              key={getClassId(className)}
              className="p-6 border border-[#E0E5E5] rounded-lg bg-[#F0F5F5] mt-6"
            >
              <div className="flex justify-between items-center border-b border-[#CEDADA] pb-4 mb-4">
                <h3 className="text-lg font-semibold text-[#2F4F4F] font-['Karla']">
                  {className} - Test Details
                </h3>

                {/* Only show max score field for syllabus tests */}
                {formData.testType === "syllabus" && (
                  <div className="w-1/3 min-w-32">
                    <label
                      htmlFor={`max_score_${getClassId(className)}`}
                      className="block text-xs font-medium text-[#597272] mb-1"
                    >
                      Overall Max Score:
                    </label>
                    <input
                      type="number"
                      id={`max_score_${getClassId(className)}`}
                      className={`w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-2 focus:ring-[#D4DAE8] ${
                        editMode ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      placeholder="e.g., 100"
                      value={maxScores[className] || ""}
                      onChange={(e) => !editMode && handleMaxScoreChange(className, e.target.value)}
                      disabled={editMode}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Subjects Table */}
              <div>
                <div className="grid grid-cols-4 gap-4 font-semibold text-[#2F4F4F] text-sm pb-2 border-b border-[#CEDADA] mb-2 font-['Work_Sans']">
                  <div>Subject</div>
                  <div>Test Date</div>
                  <div>Submission Deadline</div>
                  <div>Action</div>
                </div>

                {subjectRows[className]?.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-4 gap-4 items-center py-3 border-b border-[#E0E5E5]"
                  >
                    <div>
                      <select
                        className={`w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-2 focus:ring-[#D4DAE8] ${
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
                          // Extract the class number from the className (e.g., "Class 9" → 9)
                          const classNum = className.includes("Class ")
                            ? parseInt(className.replace("Class ", ""))
                            : parseInt(className);

                          // Get subjects for this class from SUBJECTS_BY_GRADE
                          const subjectsForClass = SUBJECTS_BY_GRADE[classNum] || [];

                          // Get already selected subjects in this class (excluding the current row)
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
                    {/* Test Date - EDITABLE EVEN IN EDIT MODE */}
                    <div>
                      <input
                        type="date"
                        className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-2 focus:ring-[#D4DAE8]"
                        value={row.testDate}
                        onChange={(e) =>
                          handleSubjectRowChange(className, row.id, "testDate", e.target.value)
                        }
                        required
                      />
                    </div>
                    {/* Submission Deadline - EDITABLE EVEN IN EDIT MODE */}
                    {/* Submission Deadline - EDITABLE EVEN IN EDIT MODE */}
                    <div>
                      <input
                        type="date"
                        className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#2F4F4F] focus:ring-2 focus:ring-[#D4DAE8]"
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
                    <div className="text-center">
                      <button
                        type="button"
                        className={`bg-transparent text-[#F44336] hover:text-[#C3362B] hover:bg-[#FFE5E3] p-1 rounded-md ${
                          editMode ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => !editMode && removeSubjectRow(className, row.id)}
                        disabled={editMode}
                        aria-label="Remove subject"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Subject Button - HIDE IN EDIT MODE */}
              {!editMode && (
                <div className="mt-6">
                  <OutlinedButton
                    onClick={() => addSubjectRow(className)}
                    text="Add Subject"
                    icon={true}
                  />
                </div>
              )}
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
        modalTitle={editMode ? "Test Update Summary" : "Test Creation Summary"}
        isSubmitting={isSubmitting} // Pass the isSubmitting state to the modal
      />
    </div>
  );
};

export default TestCreationForm;
