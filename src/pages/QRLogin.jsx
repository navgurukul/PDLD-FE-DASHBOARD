import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const QRLogin = () => {
  const location = useLocation();

  useEffect(() => {
    // Function to get query parameters
    const getQueryParams = () => {
      const params = {};
      location.search
        .substr(1)
        .split("&")
        .forEach((item) => {
          const [key, value] = item.split("=");
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
      return params;
    };

    // Function to open the app
    const openApp = () => {
      const params = getQueryParams();
      const username = encodeURIComponent(params.username || "");
      const password = encodeURIComponent(params.password || "");

      const schemeURL = `pdld://qr-login?username=${username}&password=${password}`;
      const fallbackURL = "https://play.google.com/store/apps/details?id=org.samyarth.pdld";

      // Attempt to open the app
      window.location.href = schemeURL;

      // If not installed, redirect to Play Store after delay
      setTimeout(() => {
        window.location.href = fallbackURL;
      }, 2000); // 2 seconds delay
    };

    // Execute the redirect logic
    openApp();
  }, [location.search]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#2F4F4F'
    }}>
      <p>Redirecting to the app...</p>
    </div>
  );
};

export default QRLogin;
