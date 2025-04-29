// ===========================================

// testReportData.js - Mock data for the test report system

/**
 * Mock data for test reports
 * Contains test information, school submissions, and student performance data
 */
export const MOCK_TESTS = [
	{
		id: 1,
		testName: "Class 1 English Syllabus Test",
		subject: "English",
		testClass: "1",
		testDate: "2025-04-19T00:00:00.000Z",
		date: "19 Apr 2025",
		schoolsSubmitted: 20,
		totalSchools: 50,
		overallPassRate: 72,
		schools: [
			{
				id: 1,
				name: "Delhi Public School",
				schoolName: "Delhi Public School",
				submitted: true,
				studentsTested: 42,
				passRate: 78,
				avgScore: 72,
				vsPrev: 8,
				scoreDistribution: [
					{ label: "0-20", value: 1 },
					{ label: "21-40", value: 4 },
					{ label: "41-60", value: 8 },
					{ label: "61-80", value: 17 },
					{ label: "81-100", value: 12 },
				],
				students: [
					{ id: 1, name: "Arun Sharma", score: 45 },
					{ id: 2, name: "Divya Kapoor", score: 52 },
					{ id: 3, name: "Farhan Ahmed", score: 58 },
					{ id: 4, name: "Geeta Nair", score: 63 },
					{ id: 5, name: "Hari Kumar", score: 68 },
					{ id: 6, name: "Isha Verma", score: 70 },
					{ id: 7, name: "Jai Singh", score: 72 },
					{ id: 8, name: "Kiran Patel", score: 75 },
					{ id: 9, name: "Leela Reddy", score: 75 },
					{ id: 10, name: "Manoj Kumar", score: 78 },
					{ id: 11, name: "Neha Verma", score: 78 },
					{ id: 12, name: "Omkar Joshi", score: 80 },
					{ id: 13, name: "Priya Shah", score: 80 },
					{ id: 14, name: "Rahul Mehta", score: 82 },
					{ id: 15, name: "Sanya Kapoor", score: 82 },
					{ id: 16, name: "Tarun Singh", score: 83 },
					{ id: 17, name: "Usha Patel", score: 83 },
					{ id: 18, name: "Vivek Sharma", score: 85 },
					{ id: 19, name: "Waqar Ahmed", score: 85 },
					{ id: 20, name: "Yash Singhania", score: 87 },
					{ id: 21, name: "Zara Khan", score: 88 },
					{ id: 22, name: "Ajay Prasad", score: 88 },
					{ id: 23, name: "Bhavna Desai", score: 88 },
					{ id: 24, name: "Chetan Gupta", score: 90 },
					{ id: 25, name: "Deepa Nair", score: 90 },
					{ id: 26, name: "Esha Malhotra", score: 80 },
					{ id: 27, name: "Farid Sheikh", score: 75 },
					{ id: 28, name: "Gitanjali Roy", score: 70 },
					{ id: 29, name: "Harish Choudhary", score: 68 },
					{ id: 30, name: "Indira Sen", score: 65 },
					{ id: 31, name: "Javed Khan", score: 62 }, 
				],
			},
			{
				id: 2,
				name: "St. Mary's School",
				schoolName: "St. Mary's School",
				submitted: true,
				studentsTested: 38,
				passRate: 63,
				avgScore: 61,
				vsPrev: -4,
				scoreDistribution: [
					{ label: "0-20", value: 2 },
					{ label: "21-40", value: 7 },
					{ label: "41-60", value: 12 },
					{ label: "61-80", value: 10 },
					{ label: "81-100", value: 7 },
				],
				students: [
					{ id: 1, name: "Lata Menon", score: 83 },
					{ id: 2, name: "Mohan Patel", score: 57 },
					{ id: 3, name: "Neha Sharma", score: 75 },
					{ id: 4, name: "Omkar Raut", score: 35 },
				],
			},
			{ id: 3, name: "Greenwood Academy", schoolName: "Greenwood Academy", submitted: false },
			{ id: 4, name: "Heritage International", schoolName: "Heritage International", submitted: false },
			{ id: 5, name: "Modern School", schoolName: "Modern School", submitted: false },
		],
	},
	{
		id: 2,
		testName: "Class 1 Maths Remedial Test",
		subject: "Maths",
		testClass: "1",
		testDate: "2025-04-16T00:00:00.000Z",
		date: "16 Apr 2025",
		schoolsSubmitted: 3,
		totalSchools: 5,
		overallPassRate: 69,
		schools: [
			{
				id: 1,
				name: "Delhi Public School",
				schoolName: "Delhi Public School",
				submitted: true,
				studentsTested: 45,
				passRate: 75,
				avgScore: 68,
				vsPrev: 5,
				scoreDistribution: [
					{ label: "0-20", value: 3 },
					{ label: "21-40", value: 5 },
					{ label: "41-60", value: 10 },
					{ label: "61-80", value: 20 },
					{ label: "81-100", value: 7 },
				],
				students: [
					{ id: 1, name: "Rahul Sharma", score: 82 },
					{ id: 2, name: "Priya Patel", score: 75 },
					{ id: 3, name: "Amit Kumar", score: 63 },
					{ id: 4, name: "Neha Singh", score: 92 },
				],
			},
			{
				id: 2,
				name: "St. Mary's School",
				schoolName: "St. Mary's School",
				submitted: true,
				studentsTested: 40,
				passRate: 62,
				avgScore: 64,
				vsPrev: -2,
				scoreDistribution: [
					{ label: "0-20", value: 4 },
					{ label: "21-40", value: 6 },
					{ label: "41-60", value: 9 },
					{ label: "61-80", value: 15 },
					{ label: "81-100", value: 6 },
				],
				students: [
					{ id: 1, name: "Aisha Khan", score: 88 },
					{ id: 2, name: "Bharat Reddy", score: 74 },
					{ id: 3, name: "Chitra Iyer", score: 55 },
					{ id: 4, name: "Dhruv Patel", score: 38 },
				],
			},
			{
				id: 3,
				name: "Greenwood Academy",
				schoolName: "Greenwood Academy",
				submitted: true,
				studentsTested: 42,
				passRate: 70,
				avgScore: 65,
				vsPrev: 2,
				scoreDistribution: [
					{ label: "0-20", value: 2 },
					{ label: "21-40", value: 7 },
					{ label: "41-60", value: 8 },
					{ label: "61-80", value: 16 },
					{ label: "81-100", value: 9 },
				],
				students: [
					{ id: 1, name: "Ishaan Mehta", score: 85 },
					{ id: 2, name: "Jasmine Ahmed", score: 75 },
					{ id: 3, name: "Kabir Singh", score: 32 },
					{ id: 4, name: "Leela Roy", score: 65 },
				],
			},
			{ id: 4, name: "Heritage International", schoolName: "Heritage International", submitted: false },
			{ id: 5, name: "Modern School", schoolName: "Modern School", submitted: false },
		],
	},
];

/**
 * Get a test by ID
 * @param {number|string} testId - The ID of the test to find
 * @returns {Object|null} - The test object or null if not found
 */
export function getTestById(testId) {
	const id = parseInt(testId, 10);
	return MOCK_TESTS.find((test) => test.id === id) || null;
}

/**
 * Get a school by ID within a specific test
 * @param {number|string} testId - The ID of the test
 * @param {number|string} schoolId - The ID of the school to find
 * @returns {Object|null} - The school object or null if not found
 */
export function getSchoolById(testId, schoolId) {
	const test = getTestById(testId);
	if (!test) return null;

	const id = parseInt(schoolId, 10);
	return test.schools.find((school) => school.id === id) || null;
}

/**
 * Status options for filtering
 */
export const STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "submitted", label: "Submitted" },
	{ value: "pending", label: "Pending" },
];

/**
 * Pass/Fail threshold score
 */
export const PASS_THRESHOLD = 40;

/**
 * Score range distribution labels
 */
export const SCORE_RANGES = [
	{ label: "0-20", min: 0, max: 20 },
	{ label: "21-40", min: 21, max: 40 },
	{ label: "41-60", min: 41, max: 60 },
	{ label: "61-80", min: 61, max: 80 },
	{ label: "81-100", min: 81, max: 100 },
];

/**
 * Helper function to get color code for submission status
 * @param {number} submitted - Number of schools that submitted
 * @param {number} total - Total number of schools
 * @returns {string} - CSS class name for the color
 */
export function getSubmissionColorClass(submitted, total) {
	const rate = total === 0 ? 0 : (submitted / total) * 100;
	if (rate === 0) return "bg-gray-200 text-gray-800";
	if (rate < 50) return "bg-red-100 text-red-800";
	if (rate < 80) return "bg-yellow-100 text-yellow-800";
	return "bg-green-100 text-green-800";
}

/**
 * Format date string in a consistent way
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date (e.g., "19 Apr 2025")
 */
export function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

/**
 * Calculate score distribution for a school
 * @param {Array} students - Array of student objects with scores
 * @returns {Array} - Distribution data in the format needed for charts
 */
export function calculateScoreDistribution(students) {
	// Initialize distribution with zeros
	const distribution = [
		{ label: "0-20", value: 0 },
		{ label: "21-40", value: 0 },
		{ label: "41-60", value: 0 },
		{ label: "61-80", value: 0 },
		{ label: "81-100", value: 0 },
	];

	// Count scores in each range
	students.forEach((student) => {
		const score = student.score;
		if (score <= 20) distribution[0].value++;
		else if (score <= 40) distribution[1].value++;
		else if (score <= 60) distribution[2].value++;
		else if (score <= 80) distribution[3].value++;
		else distribution[4].value++;
	});

	return distribution;
}
