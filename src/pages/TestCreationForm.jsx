import { SUBJECTS_BY_GRADE, SUBJECT_CATEGORIES } from "../data/testData";
import { useEffect, useState, useRef } from "react";
import apiInstance from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation, useParams } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import ModalSummary from "../components/SummaryModal";

const TestCreationForm = () => {
	const [testDates, setTestDates] = useState({});
	const [testDeadlines, setTestDeadlines] = useState({});
	const [dropdownOpen, setDropdownOpen] = useState({});
	const [selectedGrades, setSelectedGrades] = useState([]);
	const [selectedSubjects, setSelectedSubjects] = useState({});
	const [testType, setTestType] = useState("regular");
	const [testScores, setTestScores] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [creatingTest, setCreatingTest] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [showSummary, setShowSummary] = useState(false);
	const { Id: testId } = useParams();
	const location = useLocation();
	const dropdownRef = useRef(null);

	const navigate = useNavigate();

	useEffect(() => {
		const authToken = localStorage.getItem("authToken");
		if (!authToken) {
			toast.error("Please login to continue");
			navigate("/login");
		}
	}, []);

	const handleScoreChange = (gradeSubject, score) => {
		const maxScore = Number(score);
		if (maxScore > 90) {
			toast.error("Max Score cannot be more than 90", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
			return;
		}
		setTestScores((prev) => ({ ...prev, [gradeSubject]: maxScore }));
	};

	const handleGradeSelection = (grade) => {
		if (!grade) return;
		const isSelected = selectedGrades.includes(grade);
		if (isSelected) {
			setSelectedGrades(selectedGrades.filter((g) => g !== grade));
			const newSelectedSubjects = { ...selectedSubjects };
			delete newSelectedSubjects[grade];
			setSelectedSubjects(newSelectedSubjects);
		} else {
			setSelectedGrades([...selectedGrades, grade].sort((a, b) => a - b));
		}
	};

	const handleSubjectSelection = (grade, subject) => {
		if (!grade || !subject) return;

		if (isEditMode) {
			// In edit mode, only ONE subject per grade

			const currentlySelected = selectedSubjects[grade] || [];

			if (currentlySelected.includes(subject)) {
				// 🔒 Prevent removal if remedial test for Class 11/12
				if (
					(testType === "remedial" && (grade === 11 || grade === 12)) ||
					(testType === "regular" && isEditMode)
				) {
					return;
				}
				// Otherwise allow removal
				setSelectedSubjects((prev) => ({
					...prev,
					[grade]: prev[grade].filter((s) => s !== subject),
				}));
				return;
			}

			// 2️⃣ If exactly one subject is already selected => we’re “switching” subjects
			if (currentlySelected.length === 1) {
				const oldSubject = currentlySelected[0];

				// Preserve old date & score
				const oldKey = `${grade}-${oldSubject}`;
				const newKey = `${grade}-${subject}`;

				// Copy date from old subject to new subject
				setTestDates((prev) => {
					const oldValue = prev[oldKey];
					// Don’t lose other fields
					const updated = { ...prev };
					if (oldValue) {
						updated[newKey] = oldValue;
					}
					// Optionally remove the old date if you don’t want leftover keys
					delete updated[oldKey];
					return updated;
				});

				// Copy maxScore from old subject to new subject
				setTestScores((prev) => {
					const oldValue = prev[oldKey];
					const updated = { ...prev };
					if (oldValue) {
						updated[newKey] = oldValue;
					}
					// Optionally remove old subject’s score
					delete updated[oldKey];
					return updated;
				});

				// Now replace the old subject with the new one in selectedSubjects
				setSelectedSubjects((prev) => ({
					...prev,
					[grade]: [subject],
				}));
			} else {
				// 3️⃣ No subject is selected yet => just add the new one
				setSelectedSubjects((prev) => ({
					...prev,
					[grade]: [subject],
				}));
			}
		} else {
			// ⏺ Create mode => allow multiple subjects
			setSelectedSubjects((prev) => ({
				...prev,
				[grade]: prev[grade]?.includes(subject)
					? prev[grade].filter((s) => s !== subject)
					: [...(prev[grade] || []), subject],
			}));
		}
	};

	const toggleDropdown = (grade) => {
		if (isEditMode) return;
		setDropdownOpen((prev) => ({
			...prev,
			[grade]: !prev[grade],
		}));
	};

	const handleCreateTest = async () => {
		setCreatingTest(true);
		try {
			let response;

			if (!isEditMode) {
				// ---------- CREATE MODE (POST) ----------
				const payload = {
					testType: testType === "regular" ? "SYLLABUS" : "REMEDIAL",
					classes: selectedGrades.map((grade) => ({
						class: grade,
						subjects: (selectedSubjects[grade] || []).map((subject) => {
							const key = `${grade}-${subject}`;
							return {
								subject,
								testDate: testDates[key] || "",
								deadline: testDeadlines[key] || "",
								maxScore: testType === "regular" && testScores[key] ? Number(testScores[key]) : 100,
							};
						}),
					})),
				};

				console.log("Create Payload => ", payload);
				response = await apiInstance.post("/dev/test", payload);
			} else {
				// ---------- EDIT MODE (PATCH) ----------
				const [grade] = selectedGrades;
				const [subject] = selectedSubjects[grade] || [];
				const key = `${grade}-${subject}`;

				const editPayload = {};

				if (testDates[key]) {
					editPayload.testDate = testDates[key];
				}

				if (testDeadlines[key]) editPayload.deadline = testDeadlines[key];

				// Add maxScore if changed
				if (testType === "regular" && testScores[key] !== undefined) {
					editPayload.maxScore = Number(testScores[key]);
				}

				if (Object.keys(editPayload).length === 0) {
					toast.warn("No changes made!");
					setCreatingTest(false);
					return;
				}

				console.log("Edit Payload =>", editPayload);
				response = await apiInstance.patch(`/dev/test/${testId}`, editPayload);
			}

			if (response?.data?.success) {
				const successMessage = isEditMode ? "Test Updated Successfully" : "Test Created Successfully";

				// Redirect to the test list page with success message
				navigate("/", { state: { successMessage } });
			} else {
				toast.error(isEditMode ? "Failed to update test" : "Failed to create test");
			}
		} catch (error) {
			console.error("Error => ", error);
			toast.error("Something went wrong");
		} finally {
			setCreatingTest(false);
		}
	};

	const isFormValid = () => {
		if (selectedGrades.length === 0) return false;

		for (const grade of selectedGrades) {
			if (!selectedSubjects[grade]?.length) return false;

			for (const subject of selectedSubjects[grade]) {
				const key = `${grade}-${subject}`;
				if (!testDates[key]) return false;

				// Only validate maxScore for "regular" test type
				if (testType === "regular" && (!testScores[key] || testScores[key] > 90)) {
					return false;
				}
			}
		}
		return true;
	};

	const fetchSingleTestData = async (id) => {
		console.log("TRIGGERED");
		setIsLoading(true);
		try {
			const response = await apiInstance.get(`/dev/test/${id}`);
			console.log(response, "RESPONSE");
			if (response?.data?.success) {
				const { subject, testDate, testClass, testType, maxScore, deadline } = response.data.data;

				// Map the fetched testType to our internal state ("SYLLABUS" => "regular", "REMEDIAL" => "remedial")
				setTestType(testType === "SYLLABUS" ? "regular" : "remedial");

				// Set the selected grade
				setSelectedGrades([testClass]);

				// Set the selected subject(s)
				setSelectedSubjects({ [testClass]: [subject] });

				// Convert testDate to YYYY-MM-DD so it can populate the date input
				const dateStr = new Date(testDate).toISOString().split("T")[0];
				setTestDates({ [`${testClass}-${subject}`]: dateStr });

				// If there's a separate 'deadline' field in the response:
				if (deadline) {
					const deadlineStr = new Date(deadline).toISOString().split("T")[0];
					setTestDeadlines({ [`${testClass}-${subject}`]: deadlineStr });
				}

				// If the test is a SYLLABUS test, we also need the maxScore
				if (testType === "SYLLABUS") {
					setTestScores({ [`${testClass}-${subject}`]: maxScore });
				}
			}
		} catch (error) {
			console.error("Error => ", error);
			toast.error("Failed to fetch test data");
		} finally {
			// Stop loader
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Check if the URL path includes '/edit/testCreation' or contains "edit" in some fashion
		if (location.pathname.includes("/editTest") && testId) {
			setIsEditMode(true);
			fetchSingleTestData(testId);
		}
	}, [testId]);

	// Close dropdown if user clicks outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest(".dropdown-container")) {
				setDropdownOpen({});
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const handleShowSummary = () => {
		// Instead of calling handleCreateTest immediately,
		// we open the modal so user can confirm:
		setShowSummary(true);
	};

	const handleModalConfirm = () => {
		// Close the modal
		setShowSummary(false);
		// Then proceed with the actual API call
		handleCreateTest();
	};

	const handleTestDateChange = (key, value) => {
		// Always update the testDates object
		setTestDates((prev) => ({ ...prev, [key]: value }));

		// If we’re editing a test, reset the deadline so the user must re-select it
		if (isEditMode) {
			setTestDeadlines((prev) => ({ ...prev, [key]: "" }));
		}
	};

	const handleDeadlineChange = (key, value) => {
		setTestDeadlines((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<>
			{isLoading && (
				<Box
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						backgroundColor: "rgba(0, 0, 0, 0.3)", // Tinted transparent background
						backdropFilter: "blur(5px)", // Optional: Adds a slight blur effect
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1300, // Ensures it appears above other elements
					}}
				>
					<CircularProgress />
				</Box>
			)}

			<div
				style={{
					width: "50%",
					height: "75vh",
					margin: "20px auto",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				<div>
					<div className="space-y-4">
						{isEditMode && <h5 className="text-lg font-bold text-[#2F4F4F] mb-8">Edit Test Details</h5>}
						<h2 className="text-xl font-semibold mb-2">Test Type</h2>
						<div className="flex space-x-4">
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="testType"
									value="regular"
									checked={testType === "regular"}
									onChange={() => setTestType("regular")}
									className="w-4 h-5 accent-gray-500"
									disabled={isEditMode}
								/>
								<span
									className={`px-2 py-2 rounded-lg ${
										testType === "regular" ? "text-gray-700 font-bold" : "text-gray-700"
									}`}
								>
									Syllabus
								</span>
							</label>
							<div className="flex items-center space-x-2">
								<label className="flex items-center space-x-2">
									<input
										type="radio"
										name="testType"
										value="remedial"
										checked={testType === "remedial"}
										onChange={() => setTestType("remedial")}
										className="w-4 h-5 accent-gray-500"
										disabled={isEditMode}
									/>
									<span
										className={`px-2 py-2 rounded-lg ${
											testType === "remedial" ? "text-gray-700 font-bold" : "text-gray-700"
										}`}
									>
										Remedial
									</span>
								</label>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						{!isEditMode && <h2 className="text-xl font-semibold mb-2">Classes</h2>}

						{!isEditMode && (
							<div className="relative">
								<div
									className="w-full bg-white text-black border border-[#BDBDBD] rounded-lg p-2 cursor-pointer flex flex-wrap items-center gap-2"
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								>
									{/* Selected Classes inside Input Box */}
									<div className="flex flex-wrap gap-2">
										{selectedGrades.map((grade) => (
											<div
												key={grade}
												className="px-3 py-2 bg-[#EAEDED] text-[#2F4F4F] rounded-lg flex items-center gap-2"
											>
												<span>Class {grade}</span>
												{!isEditMode && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleGradeSelection(grade);
														}}
														className="text-[#2F4F4F]"
													>
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												)}
											</div>
										))}
									</div>

									{/* Placeholder or Dropdown Icon */}
									{selectedGrades.length === 0 && <span className="text-gray-500">Choose class</span>}
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="ml-auto"
									>
										<path
											d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
											fill="#BDBDBD"
										/>
									</svg>
								</div>

								{/* Dropdown */}
								{isDropdownOpen && (
									<div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2">
										{Array.from({ length: 12 }, (_, i) => i + 1)
											.filter((grade) => !selectedGrades.includes(grade))
											.map((grade) => (
												<div
													key={grade}
													className="p-2 cursor-pointer hover:bg-gray-200 text-gray-700"
													onClick={() => {
														handleGradeSelection(grade);
														setIsDropdownOpen(false);
													}}
												>
													Class {grade}
												</div>
											))}
									</div>
								)}
							</div>
						)}
					</div>

					{selectedGrades.length > 0 && (
						<div className="dropdown-container space-y-4">
							{selectedGrades.map((grade) => (
								<div key={grade} className="rounded-lg py-2">
									<h3 className="text-lg font-semibold">Class {grade}</h3>

									{grade >= 1 && grade <= 10 && (
										<div
											className="w-full p-2 
										[box-shadow:0px_1px_2px_0px_rgba(47,79,79,0.06),0px_2px_1px_0px_rgba(47,79,79,0.04),0px_1px_5px_0px_rgba(47,79,79,0.08)]
										"
										>
											<div
												className="rounded-md p-2 flex justify-between items-center cursor-pointer bg-red border border-gray-300"
												onClick={() => toggleDropdown(grade)}
											>
												<div className="text-gray-500 flex flex-wrap gap-2">
													{!selectedSubjects[grade] || selectedSubjects[grade].length === 0
														? "Choose subjects"
														: selectedSubjects[grade].map((subject) => (
																<span
																	key={subject}
																	className="bg-[#2F4F4F] text-white px-4 py-1 h-10 rounded-md text-sm flex items-center"
																	style={{ fontSize: "14px" }}
																>
																	{subject}
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			handleSubjectSelection(grade, subject);
																		}}
																		className="ml-1 text-white-500"
																		disabled={isEditMode}
																	>
																		✖
																	</button>
																</span>
														  ))}
												</div>
												<div className="flex items-center">
													<svg
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
															fill="#BDBDBD"
														/>
													</svg>
												</div>
											</div>
											{dropdownOpen[grade] && (
												<div className="p-4 rounded-lg bg-white max-h-96 overflow-y-auto border border-gray-200">
													<div className="flex flex-wrap gap-2">
														{(testType === "remedial"
															? ["Maths", "Hindi"]
															: SUBJECTS_BY_GRADE[grade]
														)?.map((subject) => (
															<div
																key={subject}
																className="px-3 py-2 flex items-center cursor-pointer"
																onClick={() => handleSubjectSelection(grade, subject)}
															>
																<div className="relative w-4 h-4 border border-[#2F4F4F] rounded-sm flex items-center justify-center mr-2">
																	{selectedSubjects[grade]?.includes(subject) && (
																		<svg
																			width="16"
																			height="16"
																			viewBox="0 0 16 16"
																			fill="none"
																			xmlns="http://www.w3.org/2000/svg"
																		>
																			<path
																				d="M12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2ZM7.14 10.86C6.88 11.12 6.46 11.12 6.2 10.86L3.80667 8.46667C3.54667 8.20667 3.54667 7.78667 3.80667 7.52667C4.06667 7.26667 4.48667 7.26667 4.74667 7.52667L6.66667 9.44667L11.2533 4.86C11.5133 4.6 11.9333 4.6 12.1933 4.86C12.4533 5.12 12.4533 5.54 12.1933 5.8L7.14 10.86Z"
																				fill="#2F4F4F"
																			/>
																		</svg>
																	)}
																</div>
																{subject}
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									)}

									{(grade === 11 || grade === 12) && (
										<div
											className="w-full p-2 
										[box-shadow:0px_1px_2px_0px_rgba(47,79,79,0.06),0px_2px_1px_0px_rgba(47,79,79,0.04),0px_1px_5px_0px_rgba(47,79,79,0.08)]
										"
										>
											<div
												className="rounded-md p-2 flex justify-between items-center cursor-pointer bg-white border border-gray-400"
												onClick={() => toggleDropdown(grade)}
												ref={dropdownRef}
											>
												<div className="text-gray-500 flex flex-wrap gap-2 ">
													{!selectedSubjects[grade] || selectedSubjects[grade].length === 0
														? "Choose subjects"
														: selectedSubjects[grade].map((subject) => (
																<span
																	key={subject}
																	className="bg-[#2F4F4F] text-white px-3 py-2 rounded-md text-sm flex items-center"
																	style={{ fontSize: "14px" }}
																>
																	{subject}
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			handleSubjectSelection(grade, subject);
																		}}
																		// className="ml-1 text-gray-500"
																		className="ml-1 text-white-500"
																	>
																		✖
																	</button>
																</span>
														  ))}
												</div>
												<div className="flex items-center">
													<svg
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
															fill="#BDBDBD"
														/>
													</svg>
												</div>
											</div>
											{dropdownOpen[grade] &&
												(() => {
													// Check if it's a remedial test for Class 11 or 12
													const isRemedialFor11Or12 =
														testType === "remedial" && (grade === 11 || grade === 12);

													// Updated code section for remedial test checkboxes for Class 11 and 12
													// Replace the existing remedial test condition block with this code

													if (isRemedialFor11Or12) {
														// ✅ ONLY show Maths + Hindi, hide everything else
														return (
															<div className="p-4 rounded-lg bg-white max-h-96 overflow-y-auto border border-gray-200">
																<div className="flex flex-wrap gap-2">
																	{["Maths", "Hindi"].map((subject) => (
																		<div
																			key={subject}
																			className="px-3 py-2 flex items-center cursor-pointer"
																			onClick={() =>
																				handleSubjectSelection(grade, subject)
																			}
																		>
																			<div className="relative w-4 h-4 border border-[#2F4F4F] rounded-sm flex items-center justify-center mr-2">
																				{selectedSubjects[grade]?.includes(
																					subject
																				) && (
																					<svg
																						width="16"
																						height="16"
																						viewBox="0 0 16 16"
																						fill="none"
																						xmlns="http://www.w3.org/2000/svg"
																					>
																						<path
																							d="M12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2ZM7.14 10.86C6.88 11.12 6.46 11.12 6.2 10.86L3.80667 8.46667C3.54667 8.20667 3.54667 7.78667 3.80667 7.52667C4.06667 7.26667 4.48667 7.26667 4.74667 7.52667L6.66667 9.44667L11.2533 4.86C11.5133 4.6 11.9333 4.6 12.1933 4.86C12.4533 5.12 12.4533 5.54 12.1933 5.8L7.14 10.86Z"
																							fill="#2F4F4F"
																						/>
																					</svg>
																				)}
																			</div>
																			{subject}
																		</div>
																	))}
																</div>
															</div>
														);
													}

													// Otherwise (non-remedial, or a different grade) — show the usual categories
													return (
														<div className="p-4 rounded-lg bg-white max-h-96 overflow-y-auto border border-gray-200">
															{Object.entries(SUBJECT_CATEGORIES).map(
																([category, subjects]) => (
																	<div key={category} className="mb-3">
																		<div className="text-[#2F4F4F] text-sm font-semibold px-3 py-2">
																			{category}
																		</div>
																		<div className="flex flex-wrap gap-3 px-3">
																			{subjects
																				.filter((subject) =>
																					SUBJECTS_BY_GRADE[grade]?.includes(
																						subject
																					)
																				)
																				.map((subject) => (
																					<div
																						key={subject}
																						className="px-3 py-2 hover:bg-gray-50 flex items-center cursor-pointer"
																						onClick={(e) => {
																							e.stopPropagation();
																							handleSubjectSelection(
																								grade,
																								subject
																							);
																						}}
																					>
																						<div
																							className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
																								selectedSubjects[
																									grade
																								]?.includes(subject)
																									? "bg-[#2F4F4F] border-[#2F4F4F]"
																									: "border-[#2F4F4F] bg-white"
																							}`}
																						>
																							{selectedSubjects[
																								grade
																							]?.includes(subject) && (
																								<svg
																									className="w-4 h-4"
																									fill="none"
																									stroke="white"
																									viewBox="0 0 24 24"
																								>
																									<path
																										strokeLinecap="round"
																										strokeLinejoin="round"
																										strokeWidth="2"
																										d="M5 13l4 4L19 7"
																									/>
																								</svg>
																							)}
																						</div>
																						{subject}
																					</div>
																				))}
																		</div>
																	</div>
																)
															)}
														</div>
													);
												})()}
										</div>
									)}

									{selectedSubjects[grade]?.length > 0 && (
										<div className="space-y-2 mt-4">
											<h4 className="text-[#2F4F4F] text-lg font-semibold">
												Set Test Date {testType === "regular" && "and Max Score"}
											</h4>
											{selectedSubjects[grade].map((subject) => {
												const combinedKey = `${grade}-${subject}`;
												// 1) Min date for testDate is "today".
												const today = new Date();
												const minTestDate = today.toISOString().split("T")[0];

												// 2) Min date for deadline is "one day after" testDate (if selected).
												let minDeadline = "";
												if (testDates[combinedKey]) {
													const dt = new Date(testDates[combinedKey]); // testDate
													dt.setDate(dt.getDate() + 1); // one day later
													minDeadline = dt.toISOString().split("T")[0];
												}
												return (
													<div
														key={combinedKey}
														className=" space-x-4 p-2 bg-white rounded-lg"
													>
														<div style={{ marginBottom: "8px" }}>
															<Typography text="primary" variant="subtitle1">
																{subject}
															</Typography>
														</div>

														<div className="flex gap-4">
															<div className="w-full">
																<Typography color="primary" variant="subtitle2">
																	Test Date
																</Typography>
																<input
																	type="date"
																	className="h-12 w-full p-2 border border-[#E0E0E0] rounded-lg"
																	value={testDates[combinedKey] || ""}
																	onChange={(e) =>
																		handleTestDateChange(
																			combinedKey,
																			e.target.value
																		)
																	}
																	min={minTestDate}
																/>
															</div>
															<div className="w-full">
																<Typography color="primary" variant="subtitle2">
																	Score Submission Deadline
																</Typography>
																<input
																	type="date"
																	className="h-12 w-full p-2 border border-[#E0E0E0] rounded-lg"
																	value={testDeadlines[combinedKey] || ""}
																	onChange={(e) =>
																		handleDeadlineChange(
																			combinedKey,
																			e.target.value
																		)
																	}
																	min={minDeadline}
																/>
															</div>
															{testType === "regular" && (
																<div className="w-20">
																	<Typography color="primary" variant="subtitle2">
																		Max Score
																	</Typography>
																	<div className="w-20 h-12 px-4 py-3 rounded-lg border border-[#E0E0E0] flex items-center">
																		<input
																			type="text"
																			placeholder="90"
																			className="w-full h-full focus:outline-none text-lg"
																			value={testScores[combinedKey] || ""}
																			onChange={(e) =>
																				handleScoreChange(
																					combinedKey,
																					e.target.value
																				)
																			}
																		/>
																	</div>
																</div>
															)}
														</div>
													</div>
												);
											})}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				<div>
					<div className="py-2 bg-white mt-4">
						<div className="flex justify-center">
							<button
								onClick={handleShowSummary}
								disabled={!isFormValid() || creatingTest}
								className={`flex justify-center h-11 px-4 py-2 min-w-[120px] w-max ${
									!isFormValid() || creatingTest
										? "bg-gray-300 cursor-not-allowed"
										: "bg-[#FFD700] cursor-pointer"
								} rounded-lg items-center gap-2`}
							>
								{creatingTest ? "Saving Test Details..." : isEditMode ? "Update Test" : "Create Test"}
							</button>
						</div>
					</div>
				</div>
			</div>

			<ToastContainer newestOnTop rtl={false} pauseOnFocusLoss draggable />

			<ModalSummary
				isOpen={showSummary}
				onClose={() => setShowSummary(false)}
				selectedGrades={selectedGrades}
				selectedSubjects={selectedSubjects}
				testDates={testDates}
				testDeadlines={testDeadlines}
				testScores={testScores}
				testType={testType}
				handleConfirm={handleModalConfirm}
			/>
		</>
	);
};

export default TestCreationForm;
