import { useState, useContext, useEffect } from "react";
import { TextField, Paper, Typography, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App"; // Import the AuthContext
import apiInstance, { SESSION_EXPIRED_KEY, RETURN_TO_KEY } from "../../api"; // Import your API instance
import { getErrorMessage } from "../utils/apiError";
import { Eye, EyeOff } from "lucide-react";
import ButtonCustom from "./ButtonCustom";
import mixpanel from '../utils/mixpanel';

const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
	},
	components: {
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					backgroundColor: "#EFF3F9",
					borderRadius: "0.5rem",
					height: "48px", // Fixed height
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#0d6efd",
						borderWidth: "1px",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "#0d6efd",
					},
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "transparent",
					},
					// Ensure input area doesn't grow beyond the specified height
					"& .MuiOutlinedInput-input": {
						padding: "12px 14px", // Adjust padding to fit within the 48px height
						height: "24px", // Set explicit height for the input element itself
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					"&.Mui-focused": {
						color: "#0d6efd",
					},
				},
			},
		}, 
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					marginTop: 4, // Add some space between input and helper text
					position: "absolute", // Position absolutely
					bottom: "-20px", // Position below the input
				},
			},
		},
	},
});

// Why sign-in failed, in words the user can act on
function loginErrorMessage(error, wrongDetails) {
	const status = error?.response?.status;
	const serverText = String(error?.response?.data?.error || "");
	if (status === 401 && /inactive/i.test(serverText)) {
		return "This account has been turned off. Ask your district office to turn it on again.";
	}
	if (status === 401) return wrongDetails;
	if (status >= 500) return "The server could not sign you in right now. Please try again in a minute.";
	return getErrorMessage(error, "Could not sign in. Please try again.");
}

// The page they were on when the session expired, if it belongs to this kind of login
function takeReturnPath(isSchool) {
	const path = sessionStorage.getItem(RETURN_TO_KEY);
	sessionStorage.removeItem(RETURN_TO_KEY);
	if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/login")) return null;
	return isSchool === path.startsWith("/my-school") ? path : null;
}

export default function LoginForm({ onLogin }) {
	const navigate = useNavigate();
	const { login } = useContext(AuthContext);
	const [showPassword, setShowPassword] = useState(false);
	// "officer": username login; "school": a headmaster signs in with the school's UDISE code
	const [mode, setMode] = useState("officer");

	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	// The API sets this when a saved login stops working; cleared after it is shown once
	const [sessionExpired] = useState(() => sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1");
	useEffect(() => {
		sessionStorage.removeItem(SESSION_EXPIRED_KEY);
	}, []);

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });

		// Clear error when user types
		if (errors[name]) {
			setErrors({ ...errors, [name]: "" });
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.username.trim()) {
			newErrors.username = mode === "school" ? "UDISE code is required" : "Username is required";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		if (mode === "school") {
			try {
				const response = await apiInstance.post("/auth/school-login", {
					udiseCode: formData.username.trim(),
					password: formData.password,
				});
				const { token, data: school } = response.data.data;
				const userData = {
					role: "SCHOOL",
					schoolId: school.id,
					schoolName: school.schoolName,
					udiseCode: school.udiseCode,
					name: school.schoolName,
				};
				localStorage.setItem("userData", JSON.stringify(userData));
				try {
					mixpanel.track("Login", { role: "SCHOOL", udiseCode: school.udiseCode, loginTime: new Date().toISOString() });
				} catch {
					// analytics must not block sign-in
				}
				login(token, userData);
				navigate(takeReturnPath(true) || "/my-school");
			} catch (error) {
				setErrors({ general: loginErrorMessage(error, "Wrong UDISE code or password. Please try again.") });
			} finally {
				setIsLoading(false);
			}
			return;
		}

		try {
			// Call your authentication API here
			const response = await apiInstance.post("/auth/login", {
				username: formData.username,
				password: formData.password,
			});

			// If login is successful
			if (response.data && response.data.success) {
				const { token, data: userData } = response.data.data;

				// Store user data in localStorage for later use
				localStorage.setItem("userData", JSON.stringify(userData));

				const uniqueId = String(userData.userId ?? userData.id ?? userData._id ?? userData.username ?? userData.email ?? '');

				if (uniqueId) {
					try {
						const currentDistinctId = mixpanel.get_distinct_id && mixpanel.get_distinct_id();
						const aliasKey = `mixpanel_aliased_${uniqueId}`;

						if (currentDistinctId && currentDistinctId !== uniqueId && !localStorage.getItem(aliasKey)) {
							mixpanel.alias(uniqueId);
							localStorage.setItem(aliasKey, '1');
						}

						mixpanel.identify(uniqueId);
						mixpanel.people.set({
							$name: userData.name,
							$email: userData.email,
							role: userData.role,
							username: userData.username,
							district: userData.district,
							block: userData.block,
							cluster: userData.cluster,
						});

						mixpanel.track('Login', {
							userId: uniqueId,
							username: userData.username,
							email: userData.email,
							role: userData.role,
							name: userData.name,
							loginTime: new Date().toISOString(),
						});
					} catch (mpErr) {
						
					}
				} else {
					mixpanel.track('Login', {
						username: userData.username ?? 'unknown',
						loginTime: new Date().toISOString(),
					});
				}

				// Pass the token to the login function from AuthContext
				login(token, userData);

				// Back to the page they were on when the session expired, otherwise the tests list
				navigate(takeReturnPath(false) || "/allTest");
			} else {
				// Handle case where response is successful but doesn't indicate success
				setErrors({ general: "Could not sign in. Please try again." });
			}
		} catch (error) {
			setErrors({ general: loginErrorMessage(error, "Wrong username or password. Please try again.") });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					backgroundColor: "#EFF3F9",
				}}
			>
				<Paper
					elevation={0}
					sx={{
						maxWidth: "500px",
						width: "100%",
						p: 4,
						borderRadius: "8px",
						boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
					}}
				>
					<Typography
						variant="h4"
						component="h1"
						align="center"
						sx={{
							fontWeight: "bold",
							mb: 1,
						}}
					>
						Login
					</Typography>

					<Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
						Enter your credentials to access your account
					</Typography>

					<div
						role="group"
						aria-label="Sign in as"
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#EFF3F9", borderRadius: 10, padding: 4, marginBottom: 20 }}
					>
						{[["officer", "Officer"], ["school", "School (headmaster)"]].map(([key, label]) => (
							<button
								key={key}
								type="button"
								aria-pressed={mode === key}
								onClick={() => { setMode(key); setErrors({}); }}
								style={{
									minHeight: 44, border: "none", borderRadius: 8, cursor: "pointer", font: "inherit", fontWeight: mode === key ? 700 : 500,
									background: mode === key ? "#2F4F4F" : "transparent", color: mode === key ? "#ffffff" : "#2F4F4F",
								}}
							>
								{label}
							</button>
						))}
					</div>

					<form onSubmit={handleSubmit}>
						<Box sx={{ mb: 2, position: "relative" }}>
							<Typography
								variant="subtitle1"
								component="label"
								htmlFor="username"
								sx={{
									display: "block",
									fontWeight: 500,
								}}
							>
								{mode === "school" ? "School UDISE code*" : "Username*"}
							</Typography>
							<TextField
								id="username"
								name="username"
								value={formData.username}
								onChange={handleInputChange}
								fullWidth
								variant="outlined"
								placeholder={mode === "school" ? "11-digit UDISE code" : "Enter your username"}
								inputMode={mode === "school" ? "numeric" : undefined}
								error={!!errors.username}
								helperText={errors.username}
								InputProps={{
									style: { height: "48px" }, // Additional inline height enforcement
								}}
							/>
						</Box>

						<Box sx={{ mb: 4, position: "relative" }}>
							<Typography
								variant="subtitle1"
								component="label"
								htmlFor="password"
								sx={{
									display: "block",
									fontWeight: 500,
								}}
							>
								Password*
							</Typography>
							<TextField
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={handleInputChange}
								fullWidth
								variant="outlined"
								placeholder="Enter your password"
								error={!!errors.password}
								helperText={errors.password}
								InputProps={{
									style: { height: "48px" }, // Additional inline height enforcement
									endAdornment: (
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												padding: "4px",
											}}
										>
											{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
										</button>
									),
								}}
							/>
						</Box>

						{sessionExpired && !errors.general && (
							<Typography variant="body2" align="center" sx={{ mb: 2, color: "#8A5A00", backgroundColor: "#FFF4E0", borderRadius: "8px", p: 1.5 }} role="status">
								Your session expired. Please sign in again to continue where you left off.
							</Typography>
						)}

						{errors.general && (
							<Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
								{errors.general}
							</Typography>
						)}

						<div className="mt-8">
							<ButtonCustom
								btnWidth={500}
								disabled={isLoading}
								text={isLoading ? "Signing In..." : "Sign In"}
								onClick={handleSubmit}
								type="submit"
							/>
						</div>
					</form>
				</Paper>
			</Box>
		</ThemeProvider>
	);
}
