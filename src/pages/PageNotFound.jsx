import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  typography: {
    fontFamily: "'Karla', sans-serif",
    color: "#2F4F4F",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "#2F4F4F",
          "&:hover": {
            backgroundColor: "#1E3535",
          },
        },
      },
    },
  },
});

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/schools"); // Navigate to the schools list page
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          p: 3,
        }}
      >
        <ErrorOutlineIcon
          sx={{ fontSize: 100, color: "#2F4F4F", mb: 3 }}
        />
        
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: "bold",
            color: "#2F4F4F",
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "bold",
            color: "#2F4F4F",
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: "#666",
            mb: 4,
            maxWidth: "500px",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Please check the URL or return to the home page.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={handleGoHome}
          sx={{
            backgroundColor: "#2F4F4F",
            color: "white",
            px: 4,
            py: 1,
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#1E3535",
            },
          }}
        >
          Go to Home
        </Button>
      </Box>
    </ThemeProvider>
  );
}