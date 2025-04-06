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
	const [tabValue, setTabValue] = useState(0);

	// Get the school data from location state instead of API
	const { state } = useLocation();

	useEffect(() => {
		// Check if we have school data in the navigation state
		if (state && state.schoolData) {
			setSchool(state.schoolData);
			setIsLoading(false);
		} else {
			// If no data in navigation state, this is a direct access or refresh
			// In a real app, you'd fetch from API, but here we'll just show an error
			toast.error("School data not available");
			setIsLoading(false);
		}
	}, [state]);

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

	// Render loading state
	if (isLoading) {
		return <SpinnerPageOverlay isLoading={isLoading} />;
	}

	// Render error state if school not found
	if (!school) {
		return (
			<Box sx={{ p: 3, textAlign: "center" }}>
				<Typography variant="h5">School not found</Typography>
				<ButtonCustom text={"Back to Schools"} startIcon={<ArrowBackIcon />} variant="contained" onClick={handleBack} />
			</Box>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<div className="main-page-wrapper sm:px-4">
				<div className="header-container flex items-center justify-between mb-4">
					<div className="flex items-center">
						<h5 className="text-lg font-bold text-[#2F4F4F]">{capitalizeFirstLetter(school.schoolName)}</h5>
					</div>
				</div>

				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs value={tabValue} onChange={handleTabChange} aria-label="school detail tabs">
						<Tab label="School Details" />
						<Tab label="Students" />
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
													<Typography variant="body1">
														{school.academicCoordinator || "Assigned CAC"}
													</Typography>
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
													<Typography variant="body1">
														{school.clusterPrincipal || "Assigned CP"}
													</Typography>
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

				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
			</div>
		</ThemeProvider>
	);
}
