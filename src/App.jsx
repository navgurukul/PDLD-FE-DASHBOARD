import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./layout/index";
import Users from "./pages/Users";
import Reportcards from "./pages/Reportcards";
import HelpAndSupport from "./pages/HelpAndSupport";
import TestCreationForm from "./pages/TestCreationForm";
import TableList from "./pages/TableList";
import Schools from "./pages/Schools";
import PageNotFound from "./pages/PageNotFound";
import BulkUploadSchools from "./components/BulkUpload";
import BulkUploadStudent from "./components/student/bulkUploadStudent/BulkUploadStudent";
import AddSchool from "./components/AddSchool";
import UserCreationForm from "./components/UserCreationForm";
import LoginForm from "./components/LoginForm";
import AddStudent from "./components/student/AddStudent";
import StudentReportPage from "./components/student/StudentReportPage";
import SchoolPerformance from "./components/school/SchoolPerformance";
import LegalTerms from "./pages/LegalTerm";
import EnrollmentReports from "./pages/EnrollmentReports";
import SchoolPerformanceReports from "./pages/SchoolPerformanceReports";

// Auth context to manage authentication state
import { createContext } from "react";
import UploadSummary from "./components/UploadSummary";
import SchoolDetailView from "./components/SchoolDetailView";
import TestReportPage from "./pages/TestReportPage";
import SchoolReportPage from "./pages/SchoolReportPage";
import StudentProfileView from "./components/student/StudentProfileSection";
import SchoolPerformanceTable from "./components/testReport/SchoolPerformanceTable";
import QRLogin from "./pages/QRLogin";
export const AuthContext = createContext(null);

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [authChecked, setAuthChecked] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		const userData = localStorage.getItem("userData");

		if (token) {
			setIsAuthenticated(true);
			if (userData) {
				setUser(JSON.parse(userData));
			}
		}
		setAuthChecked(true); // Mark auth check as complete
	}, []);

	// Login function to be passed to login form
	const login = (token, userData) => {
		localStorage.setItem("authToken", token);
		setIsAuthenticated(true);
		setUser(userData);
	};

	// Logout function
	const logout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("userData");
		setIsAuthenticated(false);
		setUser(null);
	};

	// Protected route component
	const ProtectedRoute = ({ children }) => {
		if (!isAuthenticated) {
			return <Navigate to="/login" replace />;
		}
		return children;
	};

	if (!authChecked) {
		return null; // or a loading spinner
	}

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
			<Router>
				<Routes>
					{/* Public route for login */}
					<Route
						path="/login"
						element={isAuthenticated ? <Navigate to="/allTest" /> : <LoginForm onLogin={login} />}
					/>
					{/* Privacy Policy route */}
					<Route 
						path="/privacy-policy" 
						element={<LegalTerms />} 
					/>
					{/* QR Login redirect route */}
					<Route 
						path="/qr-login" 
						element={<QRLogin />} 
					/>


					{/* Protected routes under Layout */}
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Layout onLogout={logout} />
							</ProtectedRoute>
						}
					>
						{/* Default Route - redirect to allTest */}
						<Route index element={<Navigate to="/allTest" replace />} />

						{/* Nested Routes within Layout */}
						<Route path="/allTest" element={<TableList />} />
						<Route path="/users" element={<Users />} />
						<Route path="/users/userCreationForm" element={<UserCreationForm isEditMode={false} />} />
						<Route path="/users/update-user/:userId" element={<UserCreationForm isEditMode={true} />} />
						<Route path="/reports" element={<Reportcards />} />
						<Route path="/schools" element={<Schools />} />
						<Route path="/allTest/schoolSubmission/:testId" element={<TestReportPage />} />
						<Route
							path="/allTest/schoolSubmission/:testId/testDetails/:schoolId"
							element={<SchoolReportPage />}
						/>
						<Route path="/schools/add-school" element={<AddSchool />} />
						<Route path="/schools/schoolDetail/:schoolId" element={<SchoolDetailView />} />
						<Route path="/school/studentReport/:schoolId/:studentId" element={<StudentReportPage />} />
						<Route path="/student-profile/:schoolId/:studentId" element={<StudentProfileView />} />
						<Route
							path="/schools/schoolDetail/:schoolId/updateStudent"
							element={<AddStudent isEditMode={true} />}
						/>
						<Route path="/schools/schoolDetail/:schoolId/addStudents" element={<AddStudent />} />
						<Route path="/schools/update/:schoolId" element={<AddSchool />} />
						<Route
							path="/schools/schoolDetail/:schoolId/studentBulkUpload"
							element={<BulkUploadStudent />}
						/>
						<Route path="/schools/bulk-upload" element={<BulkUploadSchools />} />
						<Route path="/bulk-Upload-Summary" element={<UploadSummary />} />
						<Route path="/testCreationForm" element={<TestCreationForm />} />
						<Route path="/editTest/:Id" element={<TestCreationForm />} />
						<Route path="/help" element={<HelpAndSupport />} />
						{/* <Route path="/schools/schoolPerformance/:schoolId" element={<SchoolPerformance />} /> */}

						<Route
							path="/schools/schoolDetail/:schoolId/schoolPerformance"
							element={<SchoolPerformance />}
						/>
						<Route
							path="/schools/schoolDetail/:schoolId/studentReport/:studentId"
							element={<StudentReportPage />}
						/>
						<Route
							path="/schools/schoolDetail/:schoolId/student-profile/:studentId"
							element={<StudentProfileView />}
						/>
						<Route path="/reports/EnrollmentReports" element={<EnrollmentReports />} />
						<Route path="/reports/SchoolPerformanceReports" element={<SchoolPerformanceReports />} />

						{/* Fallback Route */}
						<Route path="*" element={<PageNotFound />} />
					</Route>

					{/* Redirect to allTest if logged in, otherwise redirect to login */}
					<Route
						path="*"
						element={
							isAuthenticated ? <Navigate to="/allTest" replace /> : <Navigate to="/login" replace />
						}
					/>
				</Routes>
			</Router>
		</AuthContext.Provider>
	);
}

export default App;
