import axios from "axios";

export const SESSION_EXPIRED_KEY = "pdld:sessionExpired";
export const RETURN_TO_KEY = "pdld:returnTo";

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // API Gateway gives up after ~30s, so a request still open at 45s will never answer
  timeout: 45000,
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
      const isLoginRequest = /\/auth\//.test(originalRequest?.url || "");
      if (window.location.pathname !== "/login" && !isLoginRequest) {
        // The login page says why they are there, and sends them back here after signing in
        if (localStorage.getItem("authToken")) {
          sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
          sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search);
        }
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiInstance;