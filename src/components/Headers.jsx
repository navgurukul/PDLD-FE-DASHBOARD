import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import notificationsIcon from "../assets/notifications.svg";
import pdldLogo from "../assets/pdld-logo.webp";
import { Link } from "react-router-dom";
import useAuth, { getUserName } from "../customHook/useAuth";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userName = getUserName();

  // Generate initials from username
  const getInitials = (name) => {
    if (!name) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return name.charAt(0).toUpperCase();
    }

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const userInitials = getInitials(userName);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  return (
    <header className="w-full fixed z-10000 bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/">
        <img
          src={pdldLogo}
          alt="pdldLogo"
          style={{
            width: "100px",
            height: "35px",
            objectFit: "contain",
            cursor: "pointer",
          }}
        />
      </Link>
      <div className="flex items-center">
        <button>
          <img src={notificationsIcon} alt="notifications" style={{ marginRight: "16px" }} />
        </button>
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="ml-4 rounded-full w-10 h-10 bg-[#FFD700] flex items-center justify-center text-black font-medium">
              {userInitials}
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
