import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Card, CardContent, Typography, Grid, Tabs, Tab, Box, CircularProgress, Divider } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoIcon from "@mui/icons-material/Info";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpinnerPageOverlay from "../components/SpinnerPageOverlay";
import StudentDetails from "./StudentDetails";
import SchoolReport from "../components/school/SchoolReport";
import ButtonCustom from "./ButtonCustom";

const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
					borderRadius: "12px",
				},
			},
		},
		MuiTabs: {
			styleOverrides: {
				indicator: {
					backgroundColor: "#2F4F4F",
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 600,
					"&.Mui-selected": {
						color: "#2F4F4F",
					},
				},
			},
		},
	},
});

// TabPanel component for tab content
function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`school-tabpanel-${index}`}
			aria-labelledby={`school-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 2 }}>{children}</Box>}
		</div>
	);
}

export default function SchoolDetailView() {
	const { schoolId } = useParams();
	const navigate = useNavigate();
	const [school, setSchool] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const { state } = useLocation();
	const [tabValue, setTabValue] = useState(state?.selectedTab || 0);

	useEffect(() => {
		let schoolData = null;

		// First, check if we have data in location state
		if (state && state.schoolData) {
			schoolData = state.schoolData;
			// Store in localStorage for persistence
			localStorage.setItem("currentSchoolData", JSON.stringify(schoolData));
		}
		// If not in state, try localStorage
		else {
			const storedData = localStorage.getItem("currentSchoolData");
			if (storedData) {
				try {
					schoolData = JSON.parse(storedData);
				} catch (e) {
					console.error("Error parsing stored school data", e);
				}
			}
		}

		if (schoolData) {
			setSchool(schoolData);
			setIsLoading(false);
		} else {
			// In a real app, you would fetch the data from API using the schoolId
			// For now, we'll show an error
			toast.error("School data not available");
			setIsLoading(false);
		}

		// Store the schoolId in localStorage for breadcrumb use
		if (schoolId) {
			localStorage.setItem("lastSchoolId", schoolId);
		}
	}, [state, schoolId]);

	// Handle tab change
	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	// Function to capitalize only the first letter and make rest lowercase
	const capitalizeFirstLetter = (string) => {
		if (!string) return "";
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	};

	// Navigate back to school list
	const handleBack = () => {
		navigate("/schools");
	};

	// Navigate to edit school page
	const handleEditSchool = () => {
		navigate(`/schools/update/${schoolId}`, {
			state: { schoolData: school },
		});
	};

	// Get CAC name from school data
	const getCACName = () => {
		if (school.assignedCAC && school.assignedCAC.name) {
			return school.assignedCAC.name;
		}
		return "Not Assigned";
	};

	// Get CP name from school data
	const getCPName = () => {
		if (school.assignedCP && typeof school.assignedCP === "object" && school.assignedCP.name) {
			return school.assignedCP.name;
		}
		return "Not Assigned";
	};

	// Render loading state
	if (isLoading) {
		return <SpinnerPageOverlay isLoading={isLoading} />;
	}

	// Render error state if school not found
	if (!school) {
		return (
			<Box sx={{ p: 3, textAlign: "center" }}>
				<Typography variant="h5">School not found</Typography>
				<ButtonCustom
					text={"Back to Schools"}
					startIcon={<ArrowBackIcon />}
					variant="contained"
					onClick={handleBack}
				/>
			</Box>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper sm:px-4">
				<div className="header-container flex items-center justify-between mb-1">
					<div className="flex items-center">
						<h5 className="text-lg font-bold text-[#2F4F4F]">{capitalizeFirstLetter(school.schoolName)}</h5>
					</div>
				</div>

				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						aria-label="school detail tabs"
						sx={{
							"& .MuiTab-root": {
								fontFamily: "Work Sans",
								fontSize: "18px",
								fontStyle: "normal",
								lineHeight: "170%",
								textTransform: "none",
								color: "#597272",
								fontWeight: 400,
								minWidth: "unset",
								padding: "12px 0px",
								marginRight: "24px",
							},
							"& .Mui-selected": {
								color: "#2F4F4F",
								fontWeight: 600,
							},
							"& .MuiTabs-indicator": {
								backgroundColor: "#2F4F4F",
							},
						}}
					>
						<Tab label="School Details" />
						<Tab label="Students" />
						<Tab label="Report" />
					</Tabs>
				</Box>

				<TabPanel value={tabValue} index={0}>
					<Grid container spacing={3}>
						<Grid item xs={12} md={6}>
							<Card>
								<CardContent>
									<Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
										<InfoIcon sx={{ mr: 1 }} /> Basic Information
									</Typography>
									<Divider sx={{ mb: 2 }} />

									<Grid container spacing={2}>
										<Grid item xs={5}>
											<Typography variant="subtitle2" color="text.secondary">
												School Name:
											</Typography>
										</Grid>
										<Grid item xs={7}>
											<Typography variant="body1">
												{capitalizeFirstLetter(school.schoolName)}
											</Typography>
										</Grid>

										<Grid item xs={5}>
											<Typography variant="subtitle2" color="text.secondary">
												UDISE Code:
											</Typography>
										</Grid>
										<Grid item xs={7}>
											<Typography variant="body1">{school.udiseCode}</Typography>
										</Grid>

										<Grid item xs={5}>
											<Typography variant="subtitle2" color="text.secondary">
												Created On:
											</Typography>
										</Grid>
										<Grid item xs={7}>
											<Typography variant="body1">
												{new Date(school.createdAt).toLocaleDateString()}
											</Typography>
										</Grid>
									</Grid>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} md={6}>
							<Card>
								<CardContent>
									<Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
										<LocationOnIcon sx={{ mr: 1 }} /> Location Details
									</Typography>
									<Divider sx={{ mb: 2 }} />

									<Grid container spacing={2}>
										<Grid item xs={5}>
											<Typography variant="subtitle2" color="text.secondary">
												Cluster:
											</Typography>
										</Grid>
										<Grid item xs={7}>
											<Typography variant="body1">
												{capitalizeFirstLetter(school.clusterName)}
											</Typography>
										</Grid>

										<Grid item xs={5}>
											<Typography variant="subtitle2" color="text.secondary">
												Block:
											</Typography>
										</Grid>
										<Grid item xs={7}>
											<Typography variant="body1">
												{capitalizeFirstLetter(school.blockName)}
											</Typography>
										</Grid>
									</Grid>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12}>
							<Card>
								<CardContent>
									<Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
										<PersonIcon sx={{ mr: 1 }} /> Administrative Staff
									</Typography>
									<Divider sx={{ mb: 2 }} />

									<Grid container spacing={2}>
										<Grid item xs={12} md={6}>
											<Grid container spacing={2}>
												<Grid item xs={7} md={6}>
													<Typography variant="subtitle2" color="text.secondary">
														Cluster Academic Coordinator:
													</Typography>
												</Grid>
												<Grid item xs={5} md={6}>
													<Typography variant="body1">{getCACName()}</Typography>
												</Grid>
											</Grid>
										</Grid>

										<Grid item xs={12} md={6}>
											<Grid container spacing={2}>
												<Grid item xs={7} md={6}>
													<Typography variant="subtitle2" color="text.secondary">
														Cluster Principal:
													</Typography>
												</Grid>
												<Grid item xs={5} md={6}>
													<Typography variant="body1">{getCPName()}</Typography>
												</Grid>
											</Grid>
										</Grid>
									</Grid>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					{/* Use the StudentDetails component here */}
					<StudentDetails schoolId={schoolId} schoolName={school.schoolName} />
				</TabPanel>

				<TabPanel value={tabValue} index={2}>
					{/* Use the SchoolReport component here */}
					<SchoolReport schoolId={schoolId} schoolName={school.schoolName} udiseCode={school.udiseCode} />
				</TabPanel>

				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</div>
		</ThemeProvider>
	);
}
