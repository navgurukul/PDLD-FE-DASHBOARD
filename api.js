import axios from "axios";

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Request interceptor to add authentication token to all requests
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common error scenarios
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // You could implement token refresh logic here
      
      // For now, redirect to login page if token is invalid
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiInstance;