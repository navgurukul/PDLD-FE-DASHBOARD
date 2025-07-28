import { Stepper, Step, StepLabel, Box, ThemeProvider, createTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import CheckIcon from "@mui/icons-material/Check";

// Custom Connector
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#829595",
    borderTopWidth: 8,
    borderRadius: 1,
    transition: "border-color 0.3s",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: "#2F4F4F",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: "#2F4F4F",
  },
}));

// Custom Step Icon
function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  const label = icon < 10 ? `0${icon}` : icon;
  if (completed) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#2F4F4F",
          border: "2px solid #2F4F4F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon sx={{ color: "#fff", fontSize: 20 }} />
      </Box>
    );
  }
  if (active) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: "2px solid #2F4F4F",
          color: "#2F4F4F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "16px",
          fontFamily: "Work Sans",
        }}
      >
        {label}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "transparent",
        border: "2px solid #829595",
        color: "#829595",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: "16px",
        fontFamily: "Work Sans",
      }}
    >
      {label}
    </Box>
  );
}

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

const steps = ["Upload CSV", "Map Columns", "Upload Data"];

const StudentUploadStepper = ({ activeStep, completedSteps = new Set() }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<CustomConnector />}
          sx={{ width: "100%", mb: 4 }}
        >
          {steps.map((label, index) => {
            const isCompleted = completedSteps.has(index) || activeStep > index;
            return (
              <Step key={label} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={CustomStepIcon}
                  sx={{
                    ".MuiStepLabel-label": {
                      mt: 1.5,
                      fontWeight: 600,
                      fontFamily: "Work Sans",
                      fontSize: "16px",
                      textAlign: "center",
                      width: "max-content",
                      mx: "auto",
                      color:
                        activeStep === index ? "#2F4F4F" : isCompleted ? "#2F4F4F" : "#829595",
                    },
                  }}
                >
                  <span
                    style={{
                      color:
                        activeStep === index ? "#2F4F4F" : isCompleted ? "#2F4F4F" : "#829595",
                      fontWeight: 600,
                      fontFamily: "Work Sans",
                      fontSize: "14px",
                    }}
                  >
                    {label}
                  </span>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </ThemeProvider>
  );
};

export default StudentUploadStepper;
