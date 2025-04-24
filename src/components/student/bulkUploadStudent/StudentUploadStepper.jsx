import { Stepper, Step, StepLabel, Box, ThemeProvider, createTheme } from "@mui/material";
import theme from "../../../theme/theme";

const StudentUploadStepper = ({ activeStep }) => {
	const theme = createTheme({
		typography: {
			fontFamily: "'Karla', sans-serif",
			color: "#2F4F4F",
		},
		palette: {
			primary: {
				main: "#2F4F4F",
			},
		},
		components: {
			MuiButton: {
				styleOverrides: {
					containedPrimary: {
						backgroundColor: "#0d6efd",
						"&:hover": {
							backgroundColor: "#0b5ed7",
						},
					},
				},
			},
		},
	});
	// Define steps for the upload process
	const steps = ["Upload CSV", "Map Columns", "Upload Data"];

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ display: "flex", justifyContent: "center" }}>
				<Stepper activeStep={activeStep} sx={{ width: "70%", mb: 2 }}>
					{steps.map((label) => (
						<Step key={label}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>
			</Box>
		</ThemeProvider>
	);
};

export default StudentUploadStepper;
