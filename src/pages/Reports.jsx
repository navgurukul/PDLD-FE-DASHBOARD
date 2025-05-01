import { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
	AreaChart,
	Area,
	ComposedChart,
	Scatter,
} from "recharts";
import { SubjectTestAnalytics } from "../components/graph/SubjectTestAnalytics ";
import ButtonCustom from "../components/ButtonCustom";
import { studentPerformanceDataq, performanceData, schoolsData, studentsData } from "../data/testData";
import {
	STUDENT_PERFORMANCE_DATA,
	getAllStudentPerformanceData,
	generateStudentMonthlyAverages,
	formatNumber,
} from "../data/testData";

// Mock data for demonstration - in a real app, this would come from API/database
const YEARS = [2023, 2024, 2025];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SUBJECTS = ["Hindi", "English", "Sanskrit", "Science", "SocialScience", "Math"];
const TEST_TYPES = ["Weekly", "Monthly", "Unit Test", "Mid Term", "Final Term"];

// Generate mock data for school tests
const generateSchoolTestData = () => {
	const data = [];

	// Generate 80 tests per year as mentioned
	YEARS.forEach((year) => {
		// Distribute 80 tests across months (unevenly to be more realistic)
		const monthDistribution = {
			Jan: 7,
			Feb: 8,
			Mar: 9,
			Apr: 6,
			May: 4,
			Jun: 3,
			Jul: 5,
			Aug: 9,
			Sep: 8,
			Oct: 8,
			Nov: 7,
			Dec: 6,
		};

		MONTHS.forEach((month) => {
			const testCount = monthDistribution[month];

			for (let i = 1; i <= testCount; i++) {
				// Randomly select a test type
				const testType = TEST_TYPES[Math.floor(Math.random() * TEST_TYPES.length)];

				// Generate a unique test ID
				const testId = `${year}-${month}-${testType}-${i}`;

				// Generate subject averages for this test
				const subjectData = {};
				// In the generateSchoolTestData function in Reports.jsx
				SUBJECTS.forEach((subject) => {
					// Instead of random values between 60-90
					let baseScore;

					if (year === 2023) {
						baseScore = 60 + Math.random() * 15; // Lower baseline for 2023
					} else if (year === 2024) {
						// Different progression rates for different subjects
						if (subject === "Math" || subject === "Science") {
							baseScore = 75 + Math.random() * 10; // Big jump in Math/Science
						} else if (subject === "Hindi") {
							baseScore = 65 + Math.random() * 10; // Modest improvement in Hindi
						} else {
							baseScore = 67 + Math.random() * 8; // Small improvement in others
						}
					} else {
						// 2025
						if (subject === "Hindi" || subject === "English") {
							baseScore = 82 + Math.random() * 10; // Big jump in languages
						} else if (subject === "Math" || subject === "Science") {
							baseScore = 85 + Math.random() * 10; // Continued strong in Math/Science
						} else {
							baseScore = 73 + Math.random() * 12; // Moderate improvement in others
						}
					}

					subjectData[subject] = Math.floor(baseScore);
				});

				data.push({
					id: testId,
					year: year,
					month: month,
					testNumber: i,
					testType: testType,
					testName: `${testType} ${i}`,
					...subjectData,
					overallAvg: SUBJECTS.reduce((sum, subject) => sum + subjectData[subject], 0) / SUBJECTS.length,
				});
			}
		});
	});

	return data;
};

// Calculate growth rate between years

// Get previous year's value for comparison

const Reports = () => {
	// State variables
	const [viewMode, setViewMode] = useState("school"); // school, student

	// School view filters
	const [selectedSchool, setSelectedSchool] = useState(null);
	const [selectedYear, setSelectedYear] = useState(2025);
	const [selectedMonth, setSelectedMonth] = useState(null);
	const [selectedTest, setSelectedTest] = useState(null);
	const [selectedSubject, setSelectedSubject] = useState(null);
	const [selectedStudentYear, setSelectedStudentYear] = useState(2025);
	const [selectedStudentMonth, setSelectedStudentMonth] = useState(null);
	const [selectedStudentSubject, setSelectedStudentSubject] = useState(null);

	// Search functionality
	const [searchQuery, setSearchQuery] = useState("");
	const [searchType, setSearchType] = useState("school"); // school or student
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [searchResults, setSearchResults] = useState([]);

	// Selected class (can be used in both flows)
	const [selectedClass, setSelectedClass] = useState(null);

	const [selectedStudent, setSelectedStudent] = useState(null);

	// Chart colors
	const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

	// Handle selection of student
	const handleSelectStudent = (student) => {
		setSelectedStudent(student);
		setSelectedStudentYear(2025);
		setSelectedStudentMonth(null);
		setSelectedStudentSubject(null);
		setSelectedSchool(schoolsData.find((s) => s.udiseCode === student.schoolUdise));
		setSelectedClass(student.class);
		setShowSearchResults(false);
		setViewMode("student");
		setSearchQuery("");
	};

	// Handle selection of class
	const handleSelectClass = (className) => {
		console.log("Selected class:", className);
		console.log("Type of className:", typeof className);
		setSelectedClass(className);
		setSelectedStudent(null);

		// Immediately check what students should match this selection
		const schoolStudents = studentsData.filter((s) => s.schoolUdise === selectedSchool.udiseCode);
		console.log("All students in this school:", schoolStudents);

		const matchingStudents = schoolStudents.filter((s) => s.class === className);
		console.log("Students matching this class:", matchingStudents);
	};

	// 4. Finally, modify your school selection code to reset everything properly
	const handleSelectSchool = (school) => {
		console.log("Selected school:", school);

		// Reset all filters when selecting a new school
		setSelectedSchool(school);
		setSelectedYear(2025);
		setSelectedMonth(null);
		setSelectedTest(null);
		setSelectedSubject(null);

		// Set Class 6 as default if available, otherwise set first class in list
		if (school.classes && school.classes.length > 0) {
			const hasClass6 = school.classes.includes("Class 6");
			setSelectedClass(hasClass6 ? "Class 6" : school.classes[0]);
		} else {
			setSelectedClass(null);
		}

		setSelectedStudent(null);
		setShowSearchResults(false);
		setViewMode("school");
		setSearchQuery("");

		// Log available classes and students for this school
		const availableStudents = studentsData.filter((s) => s.schoolUdise === school.udiseCode);
		console.log("Available students for this school:", availableStudents);

		const availableClasses = [...new Set(availableStudents.map((s) => s.class))];
		console.log("Available classes for this school:", availableClasses);
	};

	// Get student performance data filtered by current selections

	// Format data for monthly performance chart (school view)
	const getMonthlySchoolPerformance = () => {
		if (!selectedSchool || !selectedYear) return [];

		const filteredTests = schoolTestsData.filter((test) => test.year === selectedYear);

		// Group by month and calculate averages
		const monthlyData = MONTHS.map((month) => {
			const monthTests = filteredTests.filter((test) => test.month === month);

			if (monthTests.length === 0) {
				return { month };
			}

			const result = { month };

			// Calculate average for each subject
			SUBJECTS.forEach((subject) => {
				result[subject] = Math.round(
					monthTests.reduce((sum, test) => sum + test[subject], 0) / monthTests.length
				);
			});

			// Calculate overall average
			result.overall = Math.round(
				SUBJECTS.reduce((sum, subject) => sum + (result[subject] || 0), 0) / SUBJECTS.length
			);

			return result;
		});

		return monthlyData;
	};

	// Get year-over-year comparison data
	const getYearOverYearData = () => {
		if (viewMode === "school" && !selectedSchool) return [];
		if (viewMode === "student" && !selectedStudent) return [];

		const data = [];

		if (viewMode === "school") {
			YEARS.forEach((year) => {
				const yearObj = { year: year.toString() };
				const yearTests = schoolTestsData.filter((test) => test.year === year);

				if (yearTests.length > 0) {
					SUBJECTS.forEach((subject) => {
						yearObj[subject] = Math.round(
							yearTests.reduce((sum, test) => sum + test[subject], 0) / yearTests.length
						);
					});
				}
				data.push(yearObj);
			});
		} else {
			// Student view - use the dedicated student YOY function
			return getStudentYearOverYearData();
		}

		return data;
	};

	// Get test count statistics
	const getTestCountStats = () => {
		if (!selectedSchool || !selectedYear) return { total: 0, byMonth: [] };

		const yearTests = schoolTestsData.filter((test) => test.year === selectedYear);

		const byMonth = MONTHS.map((month) => {
			const monthTests = yearTests.filter((test) => test.month === month);
			return {
				month,
				count: monthTests.length,
			};
		});

		return {
			total: yearTests.length,
			byMonth,
		};
	};

	const handleSearch = () => {
		console.log("Search button clicked, query:", searchQuery); // Debug

		// Add this line to see what actually exists in schoolsData
		console.log("Available schools:", schoolsData);
		console.log(
			"Available UDISE codes:",
			schoolsData.map((s) => s.udiseCode)
		);

		if (searchQuery.trim() === "") {
			setSearchResults([]);
			setShowSearchResults(false);
			return;
		}

		const query = searchQuery.trim().toUpperCase(); // Convert to uppercase for comparison

		if (searchType === "school") {
			console.log("Searching for schools with query:", query); // Debug

			// Make case-insensitive search using toUpperCase()
			const results = schoolsData.filter(
				(school) => school.name.toUpperCase().includes(query) || school.udiseCode.toUpperCase().includes(query)
			);

			console.log("School search results:", results); // Debug
			setSearchResults(results);
			setShowSearchResults(true);

			// If only one result and it's an exact match on UDISE, select it automatically
			if (results.length === 1 && results[0].udiseCode.toUpperCase() === query) {
				handleSelectSchool(results[0]);
			}
		} else {
			console.log("Searching for students with query:", query); // Debug

			// Make case-insensitive search using toUpperCase()
			const results = studentsData.filter(
				(student) =>
					student.name.toUpperCase().includes(query) || student.studentId.toUpperCase().includes(query)
			);

			console.log("Student search results:", results); // Debug
			setSearchResults(results);
			setShowSearchResults(true);

			// If only one result and it's an exact match on student ID, select it automatically
			if (results.length === 1 && results[0].studentId.toUpperCase() === query) {
				handleSelectStudent(results[0]);
			}
		}
	};
	const studentPerformanceData = getAllStudentPerformanceData();
	const schoolTestsData = generateSchoolTestData();

	// Updated functions to work with the constant data approach

	// Get student performance data filtered by current selections
	const getFilteredStudentPerformance = () => {
		if (!selectedStudent) return [];

		console.log(`Filtering performance data for student: ${selectedStudent.studentId}`);

		// Get all the data for this student
		const studentData = STUDENT_PERFORMANCE_DATA[selectedStudent.studentId] || [];
		console.log(`Total records for student: ${studentData.length}`);

		// Filter by the selected criteria
		const filtered = studentData.filter((record) => {
			// Apply year filter if set
			if (selectedStudentYear && record.year !== selectedStudentYear) return false;

			// Apply month filter if set
			if (selectedStudentMonth && record.month !== selectedStudentMonth) return false;

			return true;
		});

		console.log(`Filtered records: ${filtered.length}`);

		// If no records were found, ensure we return an empty array rather than undefined
		return filtered || [];
	};

	// Format data for student monthly performance chart
	const getStudentMonthlyPerformance = () => {
		if (!selectedStudent || !selectedStudentYear) return [];

		const studentId = selectedStudent.studentId;
		const monthlyAverages = generateStudentMonthlyAverages();

		// Get this student's data for the selected year
		const studentYearData = monthlyAverages[studentId]?.[selectedStudentYear] || {};

		// Convert to array format for the chart
		const monthlyData = MONTHS.map((month) => {
			const monthData = studentYearData[month] || { month };

			// Ensure we have a valid month property
			return {
				month,
				...monthData,
			};
		});

		return monthlyData;
	};

	// Get year-over-year comparison data for student
	const getStudentYearOverYearData = () => {
		if (!selectedStudent) return [];

		const studentId = selectedStudent.studentId;
		const monthlyAverages = generateStudentMonthlyAverages();

		const data = [];

		YEARS.forEach((year) => {
			// Get this student's data for each year
			const yearData = monthlyAverages[studentId]?.[year] || {};

			// Calculate yearly averages for each subject
			const yearAvgs = { year: year.toString() };
			let hasData = false;

			SUBJECTS.forEach((subject) => {
				// Get all months that have data for this subject
				const monthsWithData = Object.values(yearData).filter(
					(m) => m[subject] !== null && m[subject] !== undefined
				);

				if (monthsWithData.length > 0) {
					// Calculate average across all months
					yearAvgs[subject] = Math.round(
						monthsWithData.reduce((sum, m) => sum + m[subject], 0) / monthsWithData.length
					);
					hasData = true;
				}
			});

			// Only add the year if it has any data
			if (hasData) {
				data.push(yearAvgs);
			}
		});

		return data;
	};

	// First, update your handler function to accept a parameter
	const handleSearchTypeChange = (type) => {
		setSearchType(type);
		setViewMode(type);
	};

	return (
		<div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 main-page-wrapper">
			<div className="max-w-7xl mx-auto">
				{/* Header with view mode selection */}
				<div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
					<h5 className="text-lg font-bold text-[#2F4F4F]">School Performance Analytics</h5>
				</div>

				{/* Search Card */}
				{/* <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
					<h2 className="text-xl font-bold mb-4">
						Search for {viewMode === "school" ? "School" : "Student"}
					</h2>

					<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex items-center space-x-4 md:w-1/4">
							<label className="inline-flex items-center">
								<input
									type="radio"
									name="searchType"
									value="school"
									checked={searchType === "school"}
									onChange={() => handleSearchTypeChange("school")}
									className="form-radio h-5 w-5 text-blue-500"
								/>
								<span className="ml-2">School</span>
							</label>
							<label className="inline-flex items-center">
								<input
									type="radio"
									name="searchType"
									value="student"
									checked={searchType === "student"}
									onChange={() => handleSearchTypeChange("student")}
									className="form-radio h-5 w-5 text-blue-500"
								/>
								<span className="ml-2">Student</span>
							</label>
						</div>

						<div className="flex-grow relative">
							<input
								type="text"
								placeholder={`Search by ${
									searchType === "school" ? "School Name or UDISE Code" : "Student Name or ID"
								}`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-4 py-2 rounded-lg h-[48px] bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
								onKeyUp={(e) => e.key === "Enter" && handleSearch()}
							/>
							{searchQuery && (
								<button
									onClick={() => {
										setSearchQuery("");
										setSearchResults([]);
										setShowSearchResults(false);
									}}
									className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									✕
								</button>
							)}
						</div>

						<ButtonCustom text="Search" onClick={handleSearch} />
					</div>

					{/* Search Results */}
					{/* {showSearchResults && (
						<div className="mt-4 bg-white rounded-xl p-4 border border-gray-200 max-h-80 overflow-y-auto">
							<h3 className="text-lg font-bold mb-2">Search Results</h3>

							{searchResults.length === 0 ? (
								<div className="py-4 text-center text-red-500">
									No {searchType === "school" ? "schools" : "students"} found matching {searchQuery}.
									Please try a different search term.
								</div>
							) : (
								<ul className="divide-y divide-gray-200">
									{searchType === "school"
										? searchResults.map((school) => (
												<li
													key={school.udiseCode}
													className="py-3 flex items-center justify-between hover:bg-gray-100 rounded px-2"
												>
													<div>
														<p className="font-medium">{school.name}</p>
														<p className="text-sm text-gray-600">
															UDISE: {school.udiseCode}
														</p>
													</div>
													<button
														onClick={() => handleSelectSchool(school)}
														className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
													>
														Select
													</button>
												</li>
										  ))
										: searchResults.map((student) => (
												<li
													key={student.studentId}
													className="py-3 flex items-center justify-between hover:bg-gray-100 rounded px-2"
												>
													<div>
														<p className="font-medium">{student.name}</p>
														<p className="text-sm text-gray-600">
															ID: {student.studentId} | Class: {student.class} | School:{" "}
															{
																schoolsData.find(
																	(s) => s.udiseCode === student.schoolUdise
																)?.name
															}
														</p>
													</div>
													<button
														onClick={() => handleSelectStudent(student)}
														className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
													>
														Select
													</button>
												</li>
										  ))}
								</ul>
							)}
						</div>
					)} */}
				{/* </div>  */}  

				{/* Selection Path Display */}
				{(selectedSchool || selectedStudent) && (
					<div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
						<div className="flex flex-wrap items-center gap-2">
							{selectedSchool && (
								<div className="flex items-center">
									<span className="font-medium text-gray-700">School:</span>
									<span className="ml-2 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-300 rounded-lg shadow-sm font-medium transition-all hover:shadow-md">
										{selectedSchool.name} ({selectedSchool.udiseCode})
									</span>
								</div>
							)}

							{viewMode === "school" && selectedYear && (
								<>
									<span className="mx-1 text-gray-400">→</span>
									<div className="flex items-center">
										<span className="font-medium text-gray-700">Year:</span>
										<span className="ml-2 px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-300 rounded-lg shadow-sm font-medium transition-all hover:shadow-md">
											{selectedYear}
										</span>
									</div>
								</>
							)}

							{selectedMonth && (
								<>
									<span className="mx-1 text-gray-400">→</span>
									<div className="flex items-center">
										<span className="font-medium text-gray-700">Month:</span>
										<span className="ml-2 px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-300 rounded-lg shadow-sm font-medium transition-all hover:shadow-md">
											{selectedMonth}
										</span>
									</div>
								</>
							)}

							{viewMode === "school" && selectedClass && (
								<>
									<span className="mx-1 text-gray-400">→</span>
									<div className="flex items-center">
										<span className="font-medium text-gray-700">Class:</span>
										<span className="ml-2 px-3 py-1.5 bg-green-50 text-green-800 border border-green-300 rounded-lg shadow-sm font-medium transition-all hover:shadow-md">
											{selectedClass}
										</span>
									</div>
								</>
							)}

							{selectedStudent && (
								<>
									<span className="mx-1 text-gray-400">→</span>
									<div className="flex items-center">
										<span className="font-medium text-gray-700">Student:</span>
										<span className="ml-2 px-3 py-1.5 bg-red-50 text-red-800 border border-red-300 rounded-lg shadow-sm font-medium transition-all hover:shadow-md">
											{selectedStudent.name} ({selectedStudent.studentId})
										</span>
									</div>
								</>
							)}

							{viewMode === "student" && selectedStudentYear && (
								<>
									<span className="mx-1 text-gray-400">→</span>
									<div className="flex items-center">
										<span className="font-medium text-gray-700">Year:</span>
										<span className="ml-2 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg shadow-sm font-medium transition-all hover:shadow-md">
											{selectedStudentYear}
										</span>
									</div>
								</>
							)}
						</div>
					</div>
				)}

				{/* Filters Section */}
				{(selectedSchool || selectedStudent) && (
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
						<h2 className="text-xl font-bold mb-4">Filters</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
							{/* Year Selection */}
							<div>
								<label className="block font-medium mb-2">Year:</label>
								<select
									className="w-full px-3 py-2 rounded-md bg-white border border-gray-200"
									value={viewMode === "school" ? selectedYear : selectedStudentYear}
									onChange={(e) => {
										if (viewMode === "school") {
											setSelectedYear(parseInt(e.target.value));
											setSelectedMonth(null);
											setSelectedTest(null);
										} else {
											setSelectedStudentYear(parseInt(e.target.value));
											setSelectedStudentMonth(null);
										}
									}}
								>
									{YEARS.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</div>

							{/* Month Selection */}
							<div>
								<label className="block font-medium mb-2">Month:</label>
								<select
									className="w-full px-3 py-2 rounded-md bg-white border border-gray-200"
									value={viewMode === "school" ? selectedMonth || "" : selectedStudentMonth || ""}
									onChange={(e) => {
										const value = e.target.value || null;
										if (viewMode === "school") {
											setSelectedMonth(value);
											setSelectedTest(null);
										} else {
											setSelectedStudentMonth(value);
										}
									}}
								>
									<option value="">All Months</option>
									{MONTHS.map((month) => (
										<option key={month} value={month}>
											{month}
										</option>
									))}
								</select>
							</div>

							{/* Class Selection - Only for school view */}
							{viewMode === "school" && selectedSchool && (
								<div>
									<label className="block font-medium mb-2">Class:</label>
									<select
										className="w-full px-3 py-2 rounded-md bg-white border border-gray-200"
										value={selectedClass || ""}
										onChange={(e) => handleSelectClass(e.target.value || null)}
									>
										<option value="">All Classes</option>
										{selectedSchool.classes.map((cls) => (
											<option key={cls} value={cls}>
												{cls}
											</option>
										))}
									</select>
								</div>
							)}

							<div>
								<label className="block font-medium mb-2">Subject:</label>
								<select
									className="w-full px-3 py-2 rounded-md bg-white border border-gray-200"
									value={viewMode === "school" ? selectedSubject || "" : selectedStudentSubject || ""}
									onChange={(e) => {
										const value = e.target.value || null;
										if (viewMode === "school") {
											setSelectedSubject(value);
										} else {
											setSelectedStudentSubject(value);
										}
									}}
								>
									<option value="">All Subjects</option>
									{SUBJECTS.map((subject) => (
										<option key={subject} value={subject}>
											{subject}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}

				{/* Performance Charts */}
				{selectedSchool && (
					<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
						<h2 className="text-xl font-bold mb-4">
							{viewMode === "student"
								? `Student Performance - ${selectedStudent?.name}`
								: `School Performance - ${selectedSchool?.name}`}
							{selectedYear && ` (${viewMode === "school" ? selectedYear : selectedStudentYear})`}
						</h2>

						{/* Year-over-Year Comparison */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold mb-4">Year-over-Year Performance</h3>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={getYearOverYearData()}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="year" />
										<YAxis domain={[0, 100]} />
										<Tooltip />
										<Legend />
										{SUBJECTS.map((subject, index) => (
											<Line
												key={subject}
												type="monotone"
												dataKey={subject}
												stroke={COLORS[index % COLORS.length]}
												activeDot={{ r: 8 }}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Test Count Card - Only for School View */}
						{viewMode === "school" && (
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4">Test Statistics</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="md:col-span-1">
										<div className="grid grid-cols-1 gap-4">
											<div className="p-5 rounded-lg bg-gray-100 flex items-center">
												<div>
													<h4 className="font-medium text-sm text-gray-600">
														Total Tests in {selectedYear}
													</h4>
													<p className="text-3xl font-bold text-gray-800">
														{getTestCountStats().total}
													</p>
												</div>
											</div>

											<div className="p-5 rounded-lg bg-gray-100">
												<h4 className="font-medium text-sm text-gray-600 mb-2">
													Top Testing Months
												</h4>
												{getTestCountStats()
													.byMonth.sort((a, b) => b.count - a.count)
													.slice(0, 3)
													.map((month, idx) => (
														<div
															key={idx}
															className="flex justify-between items-center mb-2"
														>
															<span className="font-medium">{month.month}</span>
															<span className="px-2 py-1 bg-gray-200 rounded-md text-sm">
																{month.count} tests
															</span>
														</div>
													))}
											</div>
										</div>
									</div>

									<div className="md:col-span-2 h-84">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={getTestCountStats().byMonth}>
												<CartesianGrid strokeDasharray="3 3" stroke="rgba(47, 79, 79, 0.2)" />
												<XAxis dataKey="month" stroke="#2F4F4F" />
												<YAxis allowDecimals={false} stroke="#2F4F4F" />
												<Tooltip contentStyle={{ borderColor: "#2F4F4F" }} />
												<Legend wrapperStyle={{ color: "#2F4F4F" }} />
												<defs>
													<linearGradient
														id="darkSlateGrayGradient"
														x1="0"
														y1="0"
														x2="0"
														y2="1"
													>
														<stop offset="5%" stopColor="#2F4F4F" stopOpacity={1} />
														<stop offset="95%" stopColor="#2F4F4F" stopOpacity={0.3} />
													</linearGradient>
												</defs>
												<Bar
													dataKey="count"
													name="Number of Tests"
													fill="url(#darkSlateGrayGradient)"
													radius={[4, 4, 0, 0]}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>
						)}

						{/* Monthly Performance Chart */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold mb-4">
								Monthly Performance{" "}
								{selectedYear && `(${viewMode === "school" ? selectedYear : selectedStudentYear})`}
							</h3>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={
											viewMode === "school"
												? getMonthlySchoolPerformance()
												: getStudentMonthlyPerformance()
										}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis domain={[0, 100]} />
										<Tooltip />
										<Legend />
										{SUBJECTS.map((subject, index) => (
											<Line
												key={subject}
												type="monotone"
												dataKey={subject}
												stroke={COLORS[index % COLORS.length]}
												activeDot={{ r: 6 }}
											/>
										))}
										<Line
											type="monotone"
											dataKey="overall"
											name="Overall Average (in %) "
											stroke="#000000"
											strokeWidth={2}
											activeDot={{ r: 8 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Student Progress Over Time - Only for Student View */}
						{viewMode === "student" && selectedStudent && (
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4">Performance Progression</h3>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart
											data={getFilteredStudentPerformance().sort((a, b) => {
												// Sort by test date (approximated by month)
												const monthOrder = {
													Jan: 1,
													Feb: 2,
													Mar: 3,
													Apr: 4,
													May: 5,
													Jun: 6,
													Jul: 7,
													Aug: 8,
													Sep: 9,
													Oct: 10,
													Nov: 11,
													Dec: 12,
												};

												// If months are different, sort by month
												if (a.month !== b.month) {
													return monthOrder[a.month] - monthOrder[b.month];
												}

												// If months are the same, sort by test name
												return a.testName.localeCompare(b.testName);
											})}
										>
											<defs>
												<linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#2F4F4F" stopOpacity={0.8} />
													<stop offset="95%" stopColor="#2F4F4F" stopOpacity={0.1} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="testName"
												tick={{ fontSize: 12 }}
												interval={0}
												angle={-45}
												textAnchor="end"
												height={80}
											/>
											<YAxis domain={[0, 100]} />
											<Tooltip
												formatter={(value) => [`${value}%`, selectedStudentSubject || "Score"]}
												labelFormatter={(label) => `Test: ${label}`}
											/>
											<Legend />
											{selectedStudentSubject ? (
												<Area
													type="monotone"
													dataKey={selectedStudentSubject}
													name={selectedStudentSubject}
													fill="url(#colorGradient)"
													stroke="#2F4F4F"
													activeDot={{ r: 8 }}
												/>
											) : (
												<Area
													type="monotone"
													dataKey="overallAvg"
													name="Overall Average"
													fill="url(#colorGradient)"
													stroke="#2F4F4F"
													activeDot={{ r: 8 }}
												/>
											)}
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</div>
						)}

						{viewMode === "student" && selectedStudent && (
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4">Detailed Test Results</h3>
								<div className="overflow-x-auto">
									<table className="w-full border border-gray-200 border-collapse">
										<thead>
											<tr className="bg-gray-100">
												<th className="p-2 text-left border">Test</th>
												<th className="p-2 text-left border">Month</th>
												{SUBJECTS.map((subject) => (
													<th key={subject} className="p-2 text-center border">
														{subject}
													</th>
												))}
												<th className="p-2 text-center border">Average</th>
											</tr>
										</thead>
										<tbody>
											{getFilteredStudentPerformance()
												.sort((a, b) => {
													// Sort by month first
													const monthOrder = {
														Jan: 1,
														Feb: 2,
														Mar: 3,
														Apr: 4,
														May: 5,
														Jun: 6,
														Jul: 7,
														Aug: 8,
														Sep: 9,
														Oct: 10,
														Nov: 11,
														Dec: 12,
													};

													const monthDiff = monthOrder[a.month] - monthOrder[b.month];
													if (monthDiff !== 0) return monthDiff;

													// Then by test name
													return a.testName.localeCompare(b.testName);
												})
												.map((test, index) => (
													<tr
														key={index}
														className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
													>
														<td className="p-2 border">{test.testName}</td>
														<td className="p-2 border">{test.month}</td>
														{SUBJECTS.map((subject) => {
															// Custom darker shades of #2F4F4F with red for low marks
															const score = test[subject];
															let bgColor;

															if (score >= 90) {
																bgColor = "rgba(47, 79, 79, 0.85)"; // Very dark shade
															} else if (score >= 80) {
																bgColor = "rgba(47, 79, 79, 0.7)";
															} else if (score >= 70) {
																bgColor = "rgba(47, 79, 79, 0.55)";
															} else if (score >= 60) {
																bgColor = "rgba(220, 53, 69, 0.4)"; // Light red for low marks
															} else {
																// Darker red for very low marks
																bgColor = "rgba(220, 53, 69, 0.7)";
															}

															return (
																<td
																	key={subject}
																	className="p-2 text-center border text-white"
																	style={{ backgroundColor: bgColor }}
																>
																	{formatNumber(score)}%
																</td>
															);
														})}
														<td className="p-2 text-center font-bold border">
															{formatNumber(test.overallAvg)}%
														</td>
													</tr>
												))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Reports;
