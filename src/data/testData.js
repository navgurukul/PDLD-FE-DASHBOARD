// Classes 1 to 12
export const CLASS_OPTIONS = [
	"Class 1",
	"Class 2",
	"Class 3",
	"Class 4",
	"Class 5",
	"Class 6",
	"Class 7",
	"Class 8",
	"Class 9",
	"Class 10",
	"Class 11",
	"Class 12",
];

export const SUBJECT_OPTIONS = [
	"Accountancy",
	"Biology",
	"Business Studies",
	"Chemistry",
	"Computer Science",
	"Economics",
	"Geography",
	"History",
	"Home Science",
	"Physics",
	"Political Science",
	"Botany",
	"Zoology",
	"Maths",
	"Hindi",
	"Sanskrit",
	"English",
	"Regional Language",
	"Environment Studies",
	"Sports",
	"Music",
	"Science",
	"Social Studies",
	"Art Education",
	"Health & Physical Education",
];

export const STATUS_LABELS = {
	ENTER_SCORE: "Enter Score",
	SUBMITTED: "Submitted",
	DEADLINE_MISSED: "Deadline Missed",
	CANCELLED: "Cancelled",
};

export const SUBJECTS_BY_GRADE = {
	1: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	2: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	3: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	4: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	5: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	6: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	7: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	8: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	9: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	10: ["English", "Hindi", "Maths", "Science", "Sanskrit", "Social Science"],
	11: [
		"Accountancy",
		"Biology",
		"Business Studies",
		"Chemistry",
		"Computer Science",
		"Economics",
		"Geography",
		"History",
		"Home Science",
		"Physics",
		"Political Science",
		"Botany",
		"Zoology",
		"Maths",
		"Hindi",
		"Sanskrit",
		"English",
		"Regional Language",
		"Environment Studies",
		"Sports",
		"Music",
		"Science",
		"Social Studies",
		"Art Eduaction",
		"Health & Physical Eduaction",
	],
	12: [
		"Accountancy",
		"Biology",
		"Business Studies",
		"Chemistry",
		"Computer Science",
		"Economics",
		"Geography",
		"History",
		"Home Science",
		"Physics",
		"Political Science",
		"Botany",
		"Zoology",
		"Maths",
		"Hindi",
		"Sanskrit",
		"English",
		"Regional Language",
		"Environment Studies",
		"Sports",
		"Music",
		"Science",
		"Social Studies",
		"Art Eduaction",
		"Health & Physical Eduaction",
	],
};

export const SUBJECT_CATEGORIES = {
	SCIENCES: [
		"Biology",
		"Chemistry",
		"Physics",
		"Computer Science",
		"Botany",
		"Zoology",
		"Maths",
		"Environmental Studies",
	],
	HUMANITIES: ["History", "Political Science", "Geography", "Economics", "Social Studies"],
	LANGUAGES: ["Hindi", "Sanskrit", "English", "Regional Language"],
	COMMERCE: ["Accountancy", "Business Studies", "Economics"],
	HEALTH: ["Health & Physical Education", "Sports"],
	"CREATIVE ARTS": ["Art Education", "Music", "Home Science"],
};

export const studentPerformanceDataq = [
	{ month: "Jan", Hindi: 85, English: 78, Sanskrit: 70, Science: 88, SocialScience: 76, Math: 92 },
	{ month: "Feb", Hindi: 82, English: 80, Sanskrit: 75, Science: 85, SocialScience: 78, Math: 89 },
	{ month: "Mar", Hindi: 88, English: 82, Sanskrit: 78, Science: 90, SocialScience: 80, Math: 94 },
	{ month: "Apr", Hindi: 85, English: 85, Sanskrit: 80, Science: 92, SocialScience: 82, Math: 91 },
	{ month: "May", Hindi: 90, English: 88, Sanskrit: 82, Science: 94, SocialScience: 85, Math: 96 },
];

export const performanceData = [
	{ student: "Rahul", Hindi: 82, English: 78, Sanskrit: 75, Science: 88, SocialScience: 79, Math: 90 },
	{ student: "Priya", Hindi: 90, English: 85, Sanskrit: 80, Science: 92, SocialScience: 88, Math: 94 },
	{ student: "Amir", Hindi: 75, English: 88, Sanskrit: 70, Science: 85, SocialScience: 76, Math: 82 },
	{ student: "Sonia", Hindi: 88, English: 92, Sanskrit: 85, Science: 90, SocialScience: 82, Math: 88 },
	{ student: "Rajesh", Hindi: 80, English: 76, Sanskrit: 72, Science: 78, SocialScience: 70, Math: 85 },
];

// Sample data for schools and students
export const schoolsData = [
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

export const studentsData = [
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

export const STUDENT_PERFORMANCE_DATA = {
	// Data keyed by student IDs for easy lookup
	STU123: [
		// Rahul
		// January tests
		{
			testId: "T2025-Jan-1",
			studentId: "STU123",
			year: 2025,
			month: "Jan",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 82,
			English: 78,
			Sanskrit: 75,
			Science: 88,
			SocialScience: 79,
			Math: 90,
			overallAvg: 82,
		},
		{
			testId: "T2025-Jan-2",
			studentId: "STU123",
			year: 2025,
			month: "Jan",
			testName: "Unit Test 1",
			testType: "Unit Test",
			Hindi: 85,
			English: 80,
			Sanskrit: 77,
			Science: 90,
			SocialScience: 82,
			Math: 93,
			overallAvg: 84.5,
		},
		// February tests
		{
			testId: "T2025-Feb-1",
			studentId: "STU123",
			year: 2025,
			month: "Feb",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 80,
			English: 83,
			Sanskrit: 78,
			Science: 89,
			SocialScience: 81,
			Math: 92,
			overallAvg: 83.8,
		},
		{
			testId: "T2025-Feb-2",
			studentId: "STU123",
			year: 2025,
			month: "Feb",
			testName: "Monthly",
			testType: "Monthly",
			Hindi: 86,
			English: 82,
			Sanskrit: 80,
			Science: 91,
			SocialScience: 83,
			Math: 94,
			overallAvg: 86,
		},
		// March tests
		{
			testId: "T2025-Mar-1",
			studentId: "STU123",
			year: 2025,
			month: "Mar",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 84,
			English: 85,
			Sanskrit: 81,
			Science: 92,
			SocialScience: 84,
			Math: 95,
			overallAvg: 86.8,
		},
		{
			testId: "T2025-Mar-2",
			studentId: "STU123",
			year: 2025,
			month: "Mar",
			testName: "Mid Term",
			testType: "Mid Term",
			Hindi: 88,
			English: 86,
			Sanskrit: 83,
			Science: 94,
			SocialScience: 86,
			Math: 96,
			overallAvg: 88.8,
		},
		// April tests
		{
			testId: "T2025-Apr-1",
			studentId: "STU123",
			year: 2025,
			month: "Apr",
			testName: "Unit Test 2",
			testType: "Unit Test",
			Hindi: 86,
			English: 88,
			Sanskrit: 84,
			Science: 93,
			SocialScience: 85,
			Math: 97,
			overallAvg: 88.8,
		},
		// May tests
		{
			testId: "T2025-May-1",
			studentId: "STU123",
			year: 2025,
			month: "May",
			testName: "Final Term",
			testType: "Final Term",
			Hindi: 89,
			English: 90,
			Sanskrit: 86,
			Science: 95,
			SocialScience: 87,
			Math: 98,
			overallAvg: 90.8,
		},
		// 2024 data (for year-over-year comparison)
		{
			testId: "T2024-Jan-1",
			studentId: "STU123",
			year: 2024,
			month: "Jan",
			testName: "Monthly",
			testType: "Monthly",
			Hindi: 78,
			English: 75,
			Sanskrit: 72,
			Science: 84,
			SocialScience: 76,
			Math: 87,
			overallAvg: 78.7,
		},
		{
			testId: "T2024-Mar-1",
			studentId: "STU123",
			year: 2024,
			month: "Mar",
			testName: "Mid Term",
			testType: "Mid Term",
			Hindi: 80,
			English: 77,
			Sanskrit: 74,
			Science: 86,
			SocialScience: 78,
			Math: 89,
			overallAvg: 80.7,
		},
		{
			testId: "T2024-May-1",
			studentId: "STU123",
			year: 2024,
			month: "May",
			testName: "Final Term",
			testType: "Final Term",
			Hindi: 82,
			English: 79,
			Sanskrit: 76,
			Science: 88,
			SocialScience: 80,
			Math: 91,
			overallAvg: 82.7,
		},
		// 2023 data
		{
			testId: "T2023-Mar-1",
			studentId: "STU123",
			year: 2023,
			month: "Mar",
			testName: "Mid Term",
			testType: "Mid Term",
			Hindi: 75,
			English: 72,
			Sanskrit: 70,
			Science: 80,
			SocialScience: 74,
			Math: 85,
			overallAvg: 76,
		},
		{
			testId: "T2023-May-1",
			studentId: "STU123",
			year: 2023,
			month: "May",
			testName: "Final Term",
			testType: "Final Term",
			Hindi: 77,
			English: 74,
			Sanskrit: 72,
			Science: 82,
			SocialScience: 76,
			Math: 87,
			overallAvg: 78,
		},
	],
	STU124: [
		// Priya
		// January tests
		{
			testId: "T2025-Jan-1",
			studentId: "STU124",
			year: 2025,
			month: "Jan",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 90,
			English: 85,
			Sanskrit: 80,
			Science: 92,
			SocialScience: 88,
			Math: 94,
			overallAvg: 88.2,
		},
		{
			testId: "T2025-Jan-2",
			studentId: "STU124",
			year: 2025,
			month: "Jan",
			testName: "Unit Test 1",
			testType: "Unit Test",
			Hindi: 92,
			English: 87,
			Sanskrit: 82,
			Science: 94,
			SocialScience: 90,
			Math: 96,
			overallAvg: 90.2,
		},
		// February tests
		{
			testId: "T2025-Feb-1",
			studentId: "STU124",
			year: 2025,
			month: "Feb",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 91,
			English: 88,
			Sanskrit: 83,
			Science: 93,
			SocialScience: 89,
			Math: 95,
			overallAvg: 89.8,
		},
		// Add more tests for Priya...
		// 2024 data
		{
			testId: "T2024-Jan-1",
			studentId: "STU124",
			year: 2024,
			month: "Jan",
			testName: "Monthly",
			testType: "Monthly",
			Hindi: 87,
			English: 82,
			Sanskrit: 77,
			Science: 89,
			SocialScience: 85,
			Math: 92,
			overallAvg: 85.3,
		},
	],
	STU125: [
		// Amir
		// January tests
		{
			testId: "T2025-Jan-1",
			studentId: "STU125",
			year: 2025,
			month: "Jan",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 75,
			English: 88,
			Sanskrit: 70,
			Science: 85,
			SocialScience: 76,
			Math: 82,
			overallAvg: 79.3,
		},
		// Add more tests for Amir...
	],
	STU126: [
		// Sonia
		// January tests
		{
			testId: "T2025-Jan-1",
			studentId: "STU126",
			year: 2025,
			month: "Jan",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 88,
			English: 92,
			Sanskrit: 85,
			Science: 90,
			SocialScience: 82,
			Math: 88,
			overallAvg: 87.5,
		},
		// Add more tests for Sonia...
	],
	STU127: [
		// Rajesh
		// January tests
		{
			testId: "T2025-Jan-1",
			studentId: "STU127",
			year: 2025,
			month: "Jan",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 80,
			English: 76,
			Sanskrit: 72,
			Science: 78,
			SocialScience: 70,
			Math: 85,
			overallAvg: 76.8,
		},
		// Add more tests for Rajesh...
	],
	STU128: [
		// Neha
		// January tests
		{
			testId: "T2025-Jan-1",
			studentId: "STU128",
			year: 2025,
			month: "Jan",
			testName: "Weekly 1",
			testType: "Weekly",
			Hindi: 85,
			English: 82,
			Sanskrit: 78,
			Science: 87,
			SocialScience: 80,
			Math: 90,
			overallAvg: 83.7,
		},
		// Add more tests for Neha...
	],
};

export const YEARS = [2023, 2024, 2025];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const SUBJECTS = ["Hindi", "English", "Sanskrit", "Science", "SocialScience", "Math"];
export const TEST_TYPES = ["Weekly", "Monthly", "Unit Test", "Mid Term", "Final Term"];

// Function to get all student performance data as a flat array (for compatibility with existing code)
export const getAllStudentPerformanceData = () => {
	const allData = [];

	Object.values(STUDENT_PERFORMANCE_DATA).forEach((studentTests) => {
		studentTests.forEach((test) => {
			allData.push(test);
		});
	});

	return allData;
};

// Generate monthly averages for each student (for monthly performance charts)
export const generateStudentMonthlyAverages = () => {
	const monthlyData = {};

	// Initialize for each student
	Object.keys(STUDENT_PERFORMANCE_DATA).forEach((studentId) => {
		monthlyData[studentId] = {};

		YEARS.forEach((year) => {
			monthlyData[studentId][year] = {};

			MONTHS.forEach((month) => {
				monthlyData[studentId][year][month] = {
					month: month,
					year: year,
				};

				// Initialize subject counters
				SUBJECTS.forEach((subject) => {
					monthlyData[studentId][year][month][subject] = {
						total: 0,
						count: 0,
					};
				});
			});
		});
	});

	// Calculate sums and counts
	Object.entries(STUDENT_PERFORMANCE_DATA).forEach(([studentId, tests]) => {
		tests.forEach((test) => {
			const { year, month } = test;

			SUBJECTS.forEach((subject) => {
				if (test[subject] !== undefined) {
					monthlyData[studentId][year][month][subject].total += test[subject];
					monthlyData[studentId][year][month][subject].count += 1;
				}
			});
		});
	});

	// Calculate averages
	Object.entries(monthlyData).forEach(([studentId, yearData]) => {
		Object.entries(yearData).forEach(([year, monthData]) => {
			Object.entries(monthData).forEach(([month, data]) => {
				let totalAvg = 0;
				let avgCount = 0;

				SUBJECTS.forEach((subject) => {
					if (data[subject].count > 0) {
						data[subject] = Math.round(data[subject].total / data[subject].count);
						totalAvg += data[subject];
						avgCount += 1;
					} else {
						data[subject] = null; // No data for this subject/month
					}
				});

				// Calculate overall average
				if (avgCount > 0) {
					data.overall = Math.round(totalAvg / avgCount);
				} else {
					data.overall = null;
				}
			});
		});
	});

	return monthlyData;
};

// Helper function to format numbers nicely
export const formatNumber = (num) => {
	if (num === undefined || num === null) return "-";

	// Format as integer
	if (Number.isInteger(num)) {
		return num.toLocaleString();
	}

	// Format with 1 decimal place if it's a percentage
	return num.toFixed(1);
};
