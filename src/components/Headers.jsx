import notificationsIcon from "../assets/notifications.svg";
import userAvatar from "../assets/userImage.svg";
import pdldLogo from "../assets/pdld-logo.webp";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full fixed z-100 bg-white shadow-md p-4 flex justify-between items-center">
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
          <img src={notificationsIcon} alt="notifications" />
        </button>
        <img
          src={userAvatar}
          alt="User Avatar"
          className="ml-4 rounded-full w-10 h-10"
        />
      </div>
    </header>
  );
};

export default Header;
