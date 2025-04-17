import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Paper } from "@mui/material";
import { studentsData, STUDENT_PERFORMANCE_DATA } from "../../data/testData";
// Add this function at the top of your SubjectTestAnalytics.jsx file
export const getSubjectTestAnalytics = (selectedSchool, selectedYear, selectedSubject) => {
	if (!selectedSchool || !selectedYear || !selectedSubject) return null;

	// Get all students for this school
	const schoolStudents = studentsData.filter((student) => student.schoolUdise === selectedSchool.udiseCode);
	const schoolStudentIds = schoolStudents.map((student) => student.studentId);

	// Map to track unique tests
	const testsMap = new Map();

	// Process each student's test data
	schoolStudentIds.forEach((studentId) => {
		const studentData = STUDENT_PERFORMANCE_DATA[studentId] || [];

		studentData
			.filter((test) => test.year === selectedYear && test[selectedSubject] !== undefined)
			.forEach((test) => {
				if (!testsMap.has(test.testId)) {
					testsMap.set(test.testId, {
						testId: test.testId,
						month: test.month,
						testName: test.testName,
						testType: test.testType,
						students: [],
						passed: 0,
						failed: 0,
						passingScore: 40, // Customizable passing threshold
					});
				}

				const testEntry = testsMap.get(test.testId);
				const score = test[selectedSubject];
				const passed = score >= testEntry.passingScore;

				testEntry.students.push({
					studentId,
					score,
					passed,
				});

				if (passed) {
					testEntry.passed++;
				} else {
					testEntry.failed++;
				}
			});
	});

	return {
		tests: [...testsMap.values()],
		summary: {
			totalTests: testsMap.size,
			totalPassed: [...testsMap.values()].reduce((sum, test) => sum + test.passed, 0),
			totalFailed: [...testsMap.values()].reduce((sum, test) => sum + test.failed, 0),
		},
	};
};
// Add this component in your Reports.jsx file - can be placed after existing components
export const SubjectTestAnalytics = ({ selectedSchool, selectedYear, selectedSubject }) => {
	const analytics = getSubjectTestAnalytics(selectedSchool, selectedYear, selectedSubject);

	if (!analytics || analytics.tests.length === 0) {
		return (
			<div className="text-center p-4">
				<p>
					No test data available for {selectedSubject} in {selectedYear}
				</p>
			</div>
		);
	}

	// Filter tests by month if needed
	const getFilteredTests = (month) => {
		return analytics.tests.filter((test) => test.month === month);
	};

	// Get tests for the selected month (e.g., "Mar")
	const monthlyTests = getFilteredTests("Mar");

	// Calculate stats for the selected month
	const monthlyStats = {
		totalStudents:
			studentsData.filter((s) => s.schoolUdise === selectedSchool.udiseCode && s.class === "Class 7").length ||
			82,
		attended: 80,
		passed: 64,
		failed: 16,
	};

	// Sum up stats from all tests in the selected month - with defensive coding
	if (monthlyTests && monthlyTests.length > 0) {
		monthlyTests.forEach((test) => {
			if (test) {
				monthlyStats.attended += (test.students && test.students.length) || 0;
				monthlyStats.passed += test.passed || 0;
				monthlyStats.failed += test.failed || 0;
			}
		});
	}

	// Data for the pass/fail pie chart
	const pieData = [
		{ name: "Proficient", value: monthlyStats.passed, fill: "#2F4F4F" },
		{ name: "Developing ", value: monthlyStats.failed, fill: "#f44336" },
	];

	return (
		<div className="mb-8 p-6 rounded-xl shadow-md">
			<h3 className="text-lg font-semibold mb-4">{selectedSubject} Test Performance</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Pass/Fail Pie Chart */}
				<div className="h-64 pb-4">
					<h4 className="font-medium mb-2">Proficient/Developing Distribution</h4>
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={pieData}
								cx="50%"
								cy="50%"
								innerRadius={55}
								outerRadius={75}
								paddingAngle={5}
								dataKey="value"
								label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
								animationBegin={0}
								animationDuration={1200}
								animationEasing="ease-out"
							>
								{pieData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.fill} />
								))}
							</Pie>
							<Tooltip />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Stats Summary */}
				<div className="p-4 flex flex-col justify-center">
					<h4 className="font-medium mb-4">Test Statistics (Mar, Class 7)</h4>
					<div className="grid grid-cols-2 gap-4">
						<div className="p-3 bg-blue-50 rounded-md">
							<p className="font-medium">Total Students</p>
							<p className="text-2xl">{monthlyStats.totalStudents}</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-md">
							<p className="font-medium">Test Attendance</p>
							<p className="text-2xl">{monthlyStats.attended}</p>
						</div>
						<div className="p-3 bg-green-50 rounded-md">
							<p className="font-medium">Proficient</p>
							<p className="text-2xl">{monthlyStats.passed}</p>
						</div>
						<div className="p-3 bg-red-50 rounded-md">
							<p className="font-medium">Developing </p>
							<p className="text-2xl">{monthlyStats.failed}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
