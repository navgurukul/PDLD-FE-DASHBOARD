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

const classPerformanceData = [
	{ student: "Rahul", Hindi: 82, English: 78, Sanskrit: 75, Science: 88, SocialScience: 79, Math: 90 },
	{ student: "Priya", Hindi: 90, English: 85, Sanskrit: 80, Science: 92, SocialScience: 88, Math: 94 },
	{ student: "Amir", Hindi: 75, English: 88, Sanskrit: 70, Science: 85, SocialScience: 76, Math: 82 },
	{ student: "Sonia", Hindi: 88, English: 92, Sanskrit: 85, Science: 90, SocialScience: 82, Math: 88 },
	{ student: "Rajesh", Hindi: 80, English: 76, Sanskrit: 72, Science: 78, SocialScience: 70, Math: 85 },
];

const schoolPerformanceData = [
	{ class: "Class 6", Hindi: 78, English: 80, Sanskrit: 75, Science: 82, SocialScience: 76, Math: 84 },
	{ class: "Class 7", Hindi: 80, English: 82, Sanskrit: 78, Science: 85, SocialScience: 79, Math: 86 },
	{ class: "Class 8", Hindi: 82, English: 84, Sanskrit: 80, Science: 88, SocialScience: 81, Math: 89 },
	{ class: "Class 9", Hindi: 84, English: 86, Sanskrit: 82, Science: 90, SocialScience: 83, Math: 92 },
	{ class: "Class 10", Hindi: 86, English: 88, Sanskrit: 84, Science: 92, SocialScience: 85, Math: 94 },
];

// Prepare data for pie chart
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

// Import Karla font from Google Fonts
const Reports = () => {
	const [viewMode, setViewMode] = useState("student"); // student, class, school
	const [darkMode, setDarkMode] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState("Current Student");
	const [selectedClass, setSelectedClass] = useState("Class 8");
	const [selectedTest, setSelectedTest] = useState("Final Term");

	// Colors for charts
	const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];
	const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
	const textColor = darkMode ? "text-white" : "text-gray-800";
	const cardBg = darkMode ? "bg-gray-800" : "bg-white";
	const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

	// Prepare pie chart data
	const subjectDistribution = prepareSubjectDistribution(studentPerformanceData);

	return (
		<div
			className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300 font-sans`}
			style={{ fontFamily: "Karla, sans-serif" }}
		>
			{/* Header */}
			<header className="py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
				<h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Student Performance Report</h1>
				<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
					{/* View Mode Selector */}
					<select
						className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						value={viewMode}
						onChange={(e) => setViewMode(e.target.value)}
					>
						<option value="student">Individual Student</option>
						<option value="class">Class Performance</option>
						<option value="school">School Performance</option>
					</select>
					{/* Student Selector - visible only in student mode */}
					{viewMode === "student" && (
						<select
							className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							value={selectedStudent}
							onChange={(e) => setSelectedStudent(e.target.value)}
						>
							<option value="Current Student">Current Student</option>
							<option value="Rahul">Rahul</option>
							<option value="Priya">Priya</option>
							<option value="Amir">Amir</option>
							<option value="Sonia">Sonia</option>
						</select>
					)}
					{/* Class Selector - visible in class mode */}
					{viewMode === "class" && (
						<select
							className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
							value={selectedClass}
							onChange={(e) => setSelectedClass(e.target.value)}
						>
							<option value="Class 8">Class 8</option>
							<option value="Class 9">Class 9</option>
							<option value="Class 10">Class 10</option>
						</select>
					)}
					{/* Test Selector */}
					<select
						className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						value={selectedTest}
						onChange={(e) => setSelectedTest(e.target.value)}
					>
						<option value="Final Term">Final Term</option>
						<option value="Mid Term">Mid Term</option>
						<option value="Unit Test">Unit Test</option>
					</select>
					{/* Theme Toggle */}
					<button
						className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						onClick={() => setDarkMode(!darkMode)}
					>
						{darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
					</button>
					{/* Export Options */}
					<div className="relative inline-block">
						<button
							className={`px-4 py-2 rounded-full ${cardBg} ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						>
							📥 Export
						</button>
						<div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg hidden">
							<a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
								Export as PDF
							</a>
							<a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
								Export as CSV
							</a>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="p-4 md:p-8">
				{/* Student View */}
				{viewMode === "student" && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Student Info Card */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<div className="flex items-center space-x-4 mb-4">
								<div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
									{selectedStudent[0]}
								</div>
								<div>
									<h2 className="text-xl font-bold">{selectedStudent}</h2>
									<p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
										{selectedClass} | Roll No: 12
									</p>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4 mt-4">
								<div className="text-center">
									<p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>Average</p>
									<p className="text-2xl font-bold text-green-500">87%</p>
								</div>
								<div className="text-center">
									<p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>Rank</p>
									<p className="text-2xl font-bold text-blue-500">3rd</p>
								</div>
								<div className="text-center">
									<p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
										Attendance
									</p>
									<p className="text-2xl font-bold text-purple-500">94%</p>
								</div>
							</div>
						</div>

						{/* Subject Distribution Pie Chart */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">Subject Distribution</h2>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={subjectDistribution}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
										label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

						{/* Performance Trend Line Chart */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border lg:col-span-2`}>
							<h2 className="text-xl font-bold mb-4">Performance Trend</h2>
							<ResponsiveContainer width="100%" height={300}>
								<LineChart
									data={studentPerformanceData}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
									<XAxis dataKey="month" stroke={darkMode ? "#aaa" : "#666"} />
									<YAxis stroke={darkMode ? "#aaa" : "#666"} />
									<Tooltip
										contentStyle={{
											backgroundColor: darkMode ? "#333" : "#fff",
											color: darkMode ? "#fff" : "#333",
											border: darkMode ? "1px solid #555" : "1px solid #ddd",
										}}
									/>
									<Legend />
									<Line type="monotone" dataKey="Hindi" stroke="#8884d8" activeDot={{ r: 8 }} />
									<Line type="monotone" dataKey="English" stroke="#82ca9d" />
									<Line type="monotone" dataKey="Sanskrit" stroke="#ffc658" />
									<Line type="monotone" dataKey="Science" stroke="#ff8042" />
									<Line type="monotone" dataKey="SocialScience" stroke="#0088FE" />
									<Line type="monotone" dataKey="Math" stroke="#00C49F" />
								</LineChart>
							</ResponsiveContainer>
						</div>

						{/* Subject-wise Performance Cards */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border lg:col-span-2`}>
							<h2 className="text-xl font-bold mb-4">Subject Performance</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{["Hindi", "English", "Sanskrit", "Science", "SocialScience", "Math"].map(
									(subject, index) => (
										<div
											key={subject}
											className={`p-4 rounded-lg border ${borderColor} bg-gradient-to-r ${
												index % 6 === 0
													? "from-purple-200 to-indigo-300"
													: index % 6 === 1
													? "from-blue-200 to-cyan-300"
													: index % 6 === 2
													? "from-green-200 to-emerald-300"
													: index % 6 === 3
													? "from-yellow-200 to-amber-300"
													: index % 6 === 4
													? "from-orange-200 to-red-300"
													: "from-pink-200 to-rose-300"
											} ${darkMode ? "text-gray-800" : "text-gray-800"}`}
										>
											<h3 className="font-bold text-lg">
												{subject === "SocialScience" ? "Social Science" : subject}
											</h3>
											<div className="flex justify-between items-center mt-2">
												<span className="text-2xl font-bold">
													{studentPerformanceData[studentPerformanceData.length - 1][subject]}
													%
												</span>
												<span
													className={`px-2 py-1 rounded-full text-xs ${
														studentPerformanceData[studentPerformanceData.length - 1][
															subject
														] >= 90
															? "bg-green-200 text-green-800"
															: studentPerformanceData[studentPerformanceData.length - 1][
																	subject
															  ] >= 80
															? "bg-blue-200 text-blue-800"
															: studentPerformanceData[studentPerformanceData.length - 1][
																	subject
															  ] >= 70
															? "bg-yellow-200 text-yellow-800"
															: "bg-red-200 text-red-800"
													}`}
												>
													{studentPerformanceData[studentPerformanceData.length - 1][
														subject
													] >= 90
														? "Excellent"
														: studentPerformanceData[studentPerformanceData.length - 1][
																subject
														  ] >= 80
														? "Good"
														: studentPerformanceData[studentPerformanceData.length - 1][
																subject
														  ] >= 70
														? "Average"
														: "Needs Improvement"}
												</span>
											</div>
										</div>
									)
								)}
							</div>
						</div>
					</div>
				)}

				{/* Class View */}
				{viewMode === "class" && (
					<div className="grid grid-cols-1 gap-6">
						{/* Class Summary Card */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">
								{selectedClass} - {selectedTest} Performance Overview
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center p-4 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-lg text-gray-800">
									<p className="text-sm">Class Average</p>
									<p className="text-2xl font-bold">82%</p>
								</div>
								<div className="text-center p-4 bg-gradient-to-r from-green-300 to-emerald-400 rounded-lg text-gray-800">
									<p className="text-sm">Highest Score</p>
									<p className="text-2xl font-bold">94%</p>
								</div>
								<div className="text-center p-4 bg-gradient-to-r from-amber-300 to-orange-400 rounded-lg text-gray-800">
									<p className="text-sm">Pass Rate</p>
									<p className="text-2xl font-bold">98%</p>
								</div>
								<div className="text-center p-4 bg-gradient-to-r from-purple-300 to-pink-400 rounded-lg text-gray-800">
									<p className="text-sm">Students</p>
									<p className="text-2xl font-bold">42</p>
								</div>
							</div>
						</div>

						{/* Class Performance Bar Chart */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">Subject-wise Class Performance</h2>
							<ResponsiveContainer width="100%" height={400}>
								<BarChart
									data={classPerformanceData}
									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
									<XAxis dataKey="student" stroke={darkMode ? "#aaa" : "#666"} />
									<YAxis stroke={darkMode ? "#aaa" : "#666"} />
									<Tooltip
										contentStyle={{
											backgroundColor: darkMode ? "#333" : "#fff",
											color: darkMode ? "#fff" : "#333",
											border: darkMode ? "1px solid #555" : "1px solid #ddd",
										}}
									/>
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

						{/* Top Performers */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">Top Performers</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{classPerformanceData.slice(0, 3).map((student, index) => (
									<div
										key={student.student}
										className={`p-4 rounded-lg border ${borderColor} ${
											index === 0
												? "bg-gradient-to-r from-yellow-200 to-amber-300"
												: index === 1
												? "bg-gradient-to-r from-gray-200 to-gray-300"
												: "bg-gradient-to-r from-amber-200 to-amber-300"
										} text-gray-800`}
									>
										<div className="flex items-center space-x-3">
											<div className="text-2xl font-bold">{index + 1}</div>
											<div>
												<h3 className="font-bold text-lg">{student.student}</h3>
												<p>
													Overall:{" "}
													{Math.round(
														(student.Hindi +
															student.English +
															student.Sanskrit +
															student.Science +
															student.SocialScience +
															student.Math) /
															6
													)}
													%
												</p>
											</div>
										</div>
										<div className="mt-2">
											<p>
												Top Subject:{" "}
												{
													Object.entries(student)
														.filter(([key]) => key !== "student")
														.sort((a, b) => b[1] - a[1])[0][0]
												}{" "}
												(
												{Math.max(
													...Object.entries(student)
														.filter(([key]) => key !== "student")
														.map(([, value]) => value)
												)}
												%)
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* School View */}
				{viewMode === "school" && (
					<div className="grid grid-cols-1 gap-6">
						{/* School Summary Card */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">School Performance Overview</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center p-4 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-lg text-gray-800">
									<p className="text-sm">School Average</p>
									<p className="text-2xl font-bold">84%</p>
								</div>
								<div className="text-center p-4 bg-gradient-to-r from-green-300 to-emerald-400 rounded-lg text-gray-800">
									<p className="text-sm">Top Class</p>
									<p className="text-2xl font-bold">Class 10</p>
								</div>
								<div className="text-center p-4 bg-gradient-to-r from-amber-300 to-orange-400 rounded-lg text-gray-800">
									<p className="text-sm">Pass Rate</p>
									<p className="text-2xl font-bold">96%</p>
								</div>
								<div className="text-center p-4 bg-gradient-to-r from-purple-300 to-pink-400 rounded-lg text-gray-800">
									<p className="text-sm">Total Students</p>
									<p className="text-2xl font-bold">420</p>
								</div>
							</div>
						</div>

						{/* School Class Comparison */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">Class-wise Performance</h2>
							<ResponsiveContainer width="100%" height={400}>
								<BarChart
									data={schoolPerformanceData}
									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
									<XAxis dataKey="class" stroke={darkMode ? "#aaa" : "#666"} />
									<YAxis stroke={darkMode ? "#aaa" : "#666"} />
									<Tooltip
										contentStyle={{
											backgroundColor: darkMode ? "#333" : "#fff",
											color: darkMode ? "#fff" : "#333",
											border: darkMode ? "1px solid #555" : "1px solid #ddd",
										}}
									/>
									<Legend />
									<Bar dataKey="Hindi" stackId="a" fill="#8884d8" />
									<Bar dataKey="English" stackId="a" fill="#82ca9d" />
									<Bar dataKey="Sanskrit" stackId="a" fill="#ffc658" />
									<Bar dataKey="Science" stackId="a" fill="#ff8042" />
									<Bar dataKey="SocialScience" stackId="a" fill="#0088FE" />
									<Bar dataKey="Math" stackId="a" fill="#00C49F" />
								</BarChart>
							</ResponsiveContainer>
						</div>

						{/* School Subject Trends */}
						<div className={`${cardBg} rounded-xl shadow-md p-6 ${borderColor} border`}>
							<h2 className="text-xl font-bold mb-4">Subject Trends Across Classes</h2>
							<ResponsiveContainer width="100%" height={400}>
								<AreaChart
									data={schoolPerformanceData}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
									<XAxis dataKey="class" stroke={darkMode ? "#aaa" : "#666"} />
									<YAxis stroke={darkMode ? "#aaa" : "#666"} />
									<Tooltip
										contentStyle={{
											backgroundColor: darkMode ? "#333" : "#fff",
											color: darkMode ? "#fff" : "#333",
											border: darkMode ? "1px solid #555" : "1px solid #ddd",
										}}
									/>
									<Legend />
									<Area type="monotone" dataKey="Hindi" stackId="1" stroke="#8884d8" fill="#8884d8" />
									<Area
										type="monotone"
										dataKey="English"
										stackId="1"
										stroke="#82ca9d"
										fill="#82ca9d"
									/>
									<Area
										type="monotone"
										dataKey="Sanskrit"
										stackId="1"
										stroke="#ffc658"
										fill="#ffc658"
									/>
									<Area
										type="monotone"
										dataKey="Science"
										stackId="1"
										stroke="#ff8042"
										fill="#ff8042"
									/>
									<Area
										type="monotone"
										dataKey="SocialScience"
										stackId="1"
										stroke="#0088FE"
										fill="#0088FE"
									/>
									<Area type="monotone" dataKey="Math" stackId="1" stroke="#00C49F" fill="#00C49F" />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				)}
			</main>

			{/* Footer */}
			<footer
				className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-600"} border-t ${borderColor}`}
			>
				<p>&copy; 2025 School Management System. All rights reserved.</p>
			</footer>
		</div>
	);
};

export default Reports;