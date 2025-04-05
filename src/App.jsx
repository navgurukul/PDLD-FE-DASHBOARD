import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./layout/index";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import HelpAndSupport from "./pages/HelpAndSupport";
import TestCreationForm from "./pages/TestCreationForm";
import TableList from "./pages/TableList";
import Schools from "./pages/Schools";
import PageNotFound from "./pages/PageNotFound";
import BulkUploadSchools from "./components/BulkUpload";
import BulkUploadStudent from "./components/student/bulkUploadStudent/BulkUploadStudent"
import AddSchool from "./components/AddSchool";
import UserCreationForm from "./components/UserCreationForm";
import LoginForm from "./components/LoginForm";
import AddStudent from "./components/student/AddStudent"

// Auth context to manage authentication state
import { createContext } from "react";
import UploadSummary from "./components/UploadSummary";
import SchoolDetailView from "./components/SchoolDetailView";
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

					{/* Protected routes under Layout */}
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Layout onLogout={logout} />
							</ProtectedRoute>
						}
					>
						{/* Default Route (renders TableList by default) */}
						<Route index element={<TableList />} />

						{/* Nested Routes within Layout */}
						<Route path="/allTest" element={<TableList />} />
						<Route path="/users" element={<Users />} />
						<Route path="/users/userCreationForm" element={<UserCreationForm isEditMode={false} />} />
						<Route path="/users/update-user/:userId" element={<UserCreationForm isEditMode={true} />} />
						<Route path="/reports" element={<Reports />} />
						<Route path="/schools" element={<Schools />} />
						<Route path="/schools/add-school" element={<AddSchool />} />
						<Route path="/schools/schoolDetail/:schoolId" element={<SchoolDetailView />} />
						<Route path="/schools/schoolDetail/addStudents" element={<AddStudent />} />
						<Route path="/schools/update/:schoolId" element={<AddSchool />} />
						<Route path="/schools/bulk-upload" element={<BulkUploadSchools />} />
						<Route path="/schools/bulk-upload/student" element={<BulkUploadStudent />} />
						<Route path="/bulk-Upload-Summary" element={<UploadSummary />} />
						<Route path="/testCreationForm" element={<TestCreationForm />} />
						<Route path="/editTest/:Id" element={<TestCreationForm />} />
						<Route path="/help" element={<HelpAndSupport />} />

						{/* Fallback Route */}
						<Route path="*" element={<PageNotFound />} />
					</Route>

					{/* Redirect to login if trying to access any other route without authentication */}
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
