import { useState } from "react";
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
} from "recharts";

// Sample data - in a real application, this would come from an API
const studentPerformanceData = [
	{ month: "Jan", Hindi: 85, English: 78, Sanskrit: 70, Science: 88, SocialScience: 76, Math: 92 },
	{ month: "Feb", Hindi: 82, English: 80, Sanskrit: 75, Science: 85, SocialScience: 78, Math: 89 },
	{ month: "Mar", Hindi: 88, English: 82, Sanskrit: 78, Science: 90, SocialScience: 80, Math: 94 },
	{ month: "Apr", Hindi: 85, English: 85, Sanskrit: 80, Science: 92, SocialScience: 82, Math: 91 },
	{ month: "May", Hindi: 90, English: 88, Sanskrit: 82, Science: 94, SocialScience: 85, Math: 96 },
];

const performanceData = [
	{ student: "Rahul", Hindi: 82, English: 78, Sanskrit: 75, Science: 88, SocialScience: 79, Math: 90 },
	{ student: "Priya", Hindi: 90, English: 85, Sanskrit: 80, Science: 92, SocialScience: 88, Math: 94 },
	{ student: "Amir", Hindi: 75, English: 88, Sanskrit: 70, Science: 85, SocialScience: 76, Math: 82 },
	{ student: "Sonia", Hindi: 88, English: 92, Sanskrit: 85, Science: 90, SocialScience: 82, Math: 88 },
	{ student: "Rajesh", Hindi: 80, English: 76, Sanskrit: 72, Science: 78, SocialScience: 70, Math: 85 },
];

// Sample data for schools and students
const schoolsData = [
	{
		name: "Delhi Public School",
		udiseCode: "DPS123456",
		classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
	},
	{
		name: "Kendriya Vidyalaya",
		udiseCode: "KV789012",
		classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
	},
	{
		name: "Modern Public School",
		udiseCode: "MPS345678",
		classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
	},
];

const studentsData = [
	// Delhi Public School students
	{ name: "Rahul", studentId: "STU123", class: "Class 8", schoolUdise: "DPS123456", rollNo: 12 },
	{ name: "Priya", studentId: "STU124", class: "Class 8", schoolUdise: "DPS123456", rollNo: 13 },
	{ name: "Amir", studentId: "STU125", class: "Class 9", schoolUdise: "DPS123456", rollNo: 15 },

	// Kendriya Vidyalaya students
	{ name: "Sonia", studentId: "STU126", class: "Class 10", schoolUdise: "KV789012", rollNo: 8 },
	{ name: "Rajesh", studentId: "STU127", class: "Class 7", schoolUdise: "KV789012", rollNo: 22 },

	// Modern Public School students
	{ name: "Neha", studentId: "STU128", class: "Class 8", schoolUdise: "MPS345678", rollNo: 5 },
];

// Function to get students by school UDISE code
const getStudentsBySchoolUdise = (schoolUdise) => {
	return studentsData.filter((student) => student.schoolUdise === schoolUdise);
};

const Reports = () => {
	const [viewMode, setViewMode] = useState("student"); // student, class, school
	const [darkMode, setDarkMode] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [selectedClass, setSelectedClass] = useState(null);
	const [selectedTest, setSelectedTest] = useState("Final Term");
	const [selectedSchool, setSelectedSchool] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchType, setSearchType] = useState("school"); // school or student
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [studentSearch, setStudentSearch] = useState("");

	// Colors for charts
	const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
	const textColor = darkMode ? "text-white" : "text-gray-800";
	const cardBg = darkMode ? "bg-gray-800" : "bg-white";
	const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

	const prepareSubjectDistribution = (data) => {
		// Take the latest month's data
		const latestData = data[data.length - 1];
		return [
			{ name: "Hindi", value: latestData.Hindi },
			{ name: "English", value: latestData.English },
			{ name: "Sanskrit", value: latestData.Sanskrit },
			{ name: "Science", value: latestData.Science },
			{ name: "Social Science", value: latestData.SocialScience },
			{ name: "Math", value: latestData.Math },
		];
	};
	// Prepare pie chart data
	const subjectDistribution = prepareSubjectDistribution(studentPerformanceData);

	// Filter students based on selected school and class
	const filteredStudents = studentsData.filter((student) => {
		// Must have both school and class selected
		if (!selectedSchool || !selectedClass) return false;

		// Debug logs to check matching
		console.log("School UDISE:", selectedSchool.udiseCode);
		console.log("Student School:", student.schoolUdise);

		// Match school UDISE code exactly
		const schoolMatch = student.schoolUdise === selectedSchool.udiseCode;

		// Match class exactly
		const classMatch = student.class === selectedClass;

		return schoolMatch && classMatch;
	});

	// Handle search for schools and students
	const handleSearch = () => {
		if (searchQuery.trim() === "") {
			setSearchResults([]);
			setShowSearchResults(false);
			return;
		}

		const query = searchQuery.toLowerCase();
		if (searchType === "school") {
			const results = schoolsData.filter(
				(school) => school.name.toLowerCase().includes(query) || school.udiseCode.toLowerCase().includes(query)
			);
			setSearchResults(results);
		} else {
			const results = studentsData.filter(
				(student) =>
					student.name.toLowerCase().includes(query) || student.udiseCode.toLowerCase().includes(query)
			);
			setSearchResults(results);
		}
		setShowSearchResults(true);
	};

	// Handle selection of school
	const handleSelectSchool = (school) => {
		setSelectedSchool(school);
		setSelectedClass(null);
		setSelectedStudent(null);
		setShowSearchResults(false);
		setViewMode("school");
		setSearchQuery("");
	};

	// Handle selection of class
	const handleSelectClass = (className) => {
		setSelectedClass(className);
		setSelectedStudent(null);
		setViewMode("class");
	};

	// Handle selection of student // Handle selection of student
	const handleSelectStudent = (student) => {
		setSelectedStudent(student);
		setSelectedClass(student.class);
		setSelectedSchool(schoolsData.find((s) => s.udiseCode === student.schoolUdise));
		setViewMode("student");
	};

	// ... your existing data declarations ...

	// Add these right here:
	const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

	return (
		<div className={`min-h-screen ${bgColor} ${textColor} p-4 md:p-8`}>
			<div className="max-w-7xl mx-auto">
				{/* Header with dark mode toggle */}
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">Student Performance Reports</h1>
					<button
						onClick={() => setDarkMode(!darkMode)}
						className={`px-4 py-2 rounded-md ${
							darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
						}`}
					>
						{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
					</button>
				</div>

				{/* Search Card */}
				<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border mb-6`}>
					<h2 className="text-xl font-bold mb-4">Search for School or Student</h2>
					<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex items-center space-x-4 md:w-1/4">
							<label className="inline-flex items-center">
								<input
									type="radio"
									name="searchType"
									value="school"
									checked={searchType === "school"}
									onChange={() => setSearchType("school")}
									className="form-radio h-5 w-5 text-blue-600"
								/>
								<span className="ml-2">School</span>
							</label>
							<label className="inline-flex items-center">
								<input
									type="radio"
									name="searchType"
									value="student"
									checked={searchType === "student"}
									onChange={() => setSearchType("student")}
									className="form-radio h-5 w-5 text-blue-600"
								/>
								<span className="ml-2">Student</span>
							</label>
						</div>
						<div className="flex-grow relative">
							<input
								type="text"
								placeholder={`Search by ${
									searchType === "school" ? "School" : "Student"
								} Name or UDISE Code`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={`w-full px-4 py-2 rounded-full ${cardBg} ${borderColor} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
								onKeyUp={(e) => e.key === "Enter" && handleSearch()}
							/>
							{searchQuery && (
								<button
									onClick={() => {
										setSearchQuery("");
										setSearchResults([]);
										setShowSearchResults(false);
									}}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									✕
								</button>
							)}
						</div>
						<button
							onClick={handleSearch}
							className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
						>
							Search
						</button>
					</div>

					{/* Search Results */}
					{showSearchResults && searchResults.length > 0 && (
						<div className={`mt-4 ${cardBg} rounded-xl p-4 ${borderColor} border max-h-80 overflow-y-auto`}>
							<h3 className="text-lg font-bold mb-2">Search Results</h3>
							<ul className="divide-y divide-gray-200 dark:divide-gray-700">
								{searchType === "school"
									? searchResults.map((school) => (
											<li
												key={school.udiseCode}
												className="py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2"
											>
												<div>
													<p className="font-medium">{school.name}</p>
													<p
														className={`text-sm ${
															darkMode ? "text-gray-400" : "text-gray-600"
														}`}
													>
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
												className="py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2"
											>
												<div>
													<p className="font-medium">{student.name}</p>
													<p
														className={`text-sm ${
															darkMode ? "text-gray-400" : "text-gray-600"
														}`}
													>
														UDISE: {student.studentId} | {student.class} |{" "}
														{student.schoolUdise}
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
						</div>
					)}
				</div>

				{/* Selection Path Display */}
				{selectedSchool && (
					<div className={`mb-6 ${cardBg} rounded-xl p-4 ${borderColor} border`}>
						<div className="flex flex-wrap items-center">
							<div className="flex items-center">
								<span className="font-medium">School:</span>
								<span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
									{selectedSchool.name} ({selectedSchool.udiseCode})
								</span>
							</div>

							{selectedClass && (
								<>
									<span className="mx-2">→</span>
									<div className="flex items-center">
										<span className="font-medium">Class:</span>
										<span className="ml-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md">
											{selectedClass}
										</span>
									</div>
								</>
							)}

							{selectedStudent && (
								<>
									<span className="mx-2">→</span>
									<div className="flex items-center">
										<span className="font-medium">Student:</span>
										<span className="ml-2 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-md">
											{selectedStudent.name} ({selectedStudent.udiseCode})
										</span>
									</div>
								</>
							)}
						</div>

						{/* Class Selection */}
						{selectedSchool && !selectedClass && (
							<div className="mt-4">
								<h4 className="font-medium mb-2">Select Class:</h4>
								<div className="flex flex-wrap gap-2">
									{selectedSchool.classes.map((className) => (
										<button
											key={className}
											onClick={() => handleSelectClass(className)}
											className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition"
										>
											{className}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Student Selection */}
						{selectedSchool && (
							<div className="mt-4">
								<h4 className="font-medium mb-2">Select Student:</h4>
								<div className="flex flex-wrap gap-2">
									<select
										className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
										value={selectedStudent?.studentId || ""}
										onChange={(e) => {
											const student = studentsData.find((s) => s.studentId === e.target.value);
											if (student) handleSelectStudent(student);
										}}
									>
										<option value="">Select Student</option>
										{studentsData
											.filter((student) => student.schoolUdise === selectedSchool.udiseCode)
											.map((student) => (
												<option key={student.studentId} value={student.studentId}>
													{student.name} (Roll: {student.rollNo})
												</option>
											))}
									</select>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Performance Charts */}
				{(selectedSchool || selectedClass || selectedStudent) && (
					<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border mb-6`}>
						<h2 className="text-xl font-bold mb-4">
							{viewMode === "student"
								? `Student Performance - ${selectedStudent?.name}`
								: viewMode === "class"
								? `Class Performance - ${selectedClass}`
								: `School Performance - ${selectedSchool?.name}`}
						</h2>

						{/* Test Selection */}
						<div className="mb-6">
							<label className="block font-medium mb-2">Select Test:</label>
							<div className="flex flex-wrap gap-2">
								{["Unit Test 1", "Unit Test 2", "Mid Term", "Final Term"].map((test) => (
									<button
										key={test}
										onClick={() => setSelectedTest(test)}
										className={`px-3 py-1 rounded-md ${
											selectedTest === test
												? "bg-blue-500 text-white"
												: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
										}`}
									>
										{test}
									</button>
								))}
							</div>
						</div>

						{/* Line Chart - Performance Over Time */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={performanceData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey={
												viewMode === "student"
													? "month"
													: viewMode === "class"
													? "student"
													: "class"
											}
										/>
										<YAxis />
										<Tooltip />
										<Legend />
										<Line type="monotone" dataKey="Hindi" stroke="#8884d8" />
										<Line type="monotone" dataKey="English" stroke="#82ca9d" />
										<Line type="monotone" dataKey="Sanskrit" stroke="#ffc658" />
										<Line type="monotone" dataKey="Science" stroke="#ff8042" />
										<Line type="monotone" dataKey="SocialScience" stroke="#0088FE" />
										<Line type="monotone" dataKey="Math" stroke="#00C49F" />
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Bar Chart - Subject Comparison */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold mb-4">Subject-wise Comparison</h3>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={performanceData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey={
												viewMode === "student"
													? "month"
													: viewMode === "class"
													? "student"
													: "class"
											}
										/>
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar dataKey="Hindi" fill="#8884d8" />
										<Bar dataKey="English" fill="#82ca9d" />
										<Bar dataKey="Sanskrit" fill="#ffc658" />
										<Bar dataKey="Science" fill="#ff8042" />
										<Bar dataKey="SocialScience" fill="#0088FE" />
										<Bar dataKey="Math" fill="#00C49F" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Pie Chart - Subject Distribution */}
						{viewMode === "student" && (
							<div className="mb-8">
								<h3 className="text-lg font-semibold mb-4">Subject Distribution (Latest)</h3>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={subjectDistribution}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
											>
												{subjectDistribution.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip />
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</div>
						)}

						{/* Area Chart - Overall Performance */}
						<div>
							<h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={performanceData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey={
												viewMode === "student"
													? "month"
													: viewMode === "class"
													? "student"
													: "class"
											}
										/>
										<YAxis />
										<Tooltip />
										<Legend />
										<Area type="monotone" dataKey="Hindi" stroke="#8884d8" fill="#8884d8" />
										<Area type="monotone" dataKey="English" stroke="#82ca9d" fill="#82ca9d" />
										<Area type="monotone" dataKey="Sanskrit" stroke="#ffc658" fill="#ffc658" />
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				)}

				{/* Footer */}
				<footer
					className={`p-4 text-center ${
						darkMode ? "text-gray-400" : "text-gray-600"
					} border-t ${borderColor}`}
				>
					<p>&copy; 2025 School Management System. All rights reserved.</p>
				</footer>
			</div>
		</div>
	);
};

export default Reports;
