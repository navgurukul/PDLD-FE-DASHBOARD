import { useState, useContext } from "react";
import { TextField, Paper, Typography, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App"; // Import the AuthContext
import apiInstance from "../../api"; // Import your API instance

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
  },
});

export default function LoginForm({ onLogin }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      newErrors.username = "Username is required";
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
    
    try {
      // Call your authentication API here
      const response = await apiInstance.post('/dev/auth/login', {
        username: formData.username,
        password: formData.password
      });
      
      // If login is successful
      if (response.data && response.data.success) {
        const { token, data: userData } = response.data.data;
        
        // Store user data in localStorage for later use
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Pass the token to the login function from AuthContext
        login(token, userData);
        
        // Navigate to allTest route
        navigate("/allTest");
      } else {
        // Handle case where response is successful but doesn't indicate success
        setErrors({ general: "Login failed. Please try again." });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error scenarios
      if (error.response && error.response.status === 401) {
        setErrors({ general: "Invalid username or password. Please try again." });
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Connection error. Please try again later." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#EFF3F9'
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            maxWidth: '500px', 
            width: '100%', 
            p: 4, 
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1 
            }}
          >
            Login
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            Enter your credentials to access your account
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                component="label" 
                htmlFor="username" 
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  fontWeight: 500 
                }}
              >
                Username
              </Typography>
              <TextField
               size="small"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter your username"
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  sx: { 
                    backgroundColor: "#EFF3F9",
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                component="label" 
                htmlFor="password" 
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  fontWeight: 500 
                }}
              >
                Password
              </Typography>
              <TextField
              size="small"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter your password"
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  sx: { 
                    backgroundColor: "#EFF3F9",
                  }
                }}
              />
            </Box>
            
            {errors.general && (
              <Typography 
                color="error" 
                variant="body2" 
                align="center" 
                sx={{ mb: 2 }}
              >
                {errors.general}
              </Typography>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full  py-2 px-4 bg-[#FFD700] text-black font-medium rounded-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}