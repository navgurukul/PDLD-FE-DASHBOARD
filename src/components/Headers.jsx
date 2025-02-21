import notificationsIcon from "../assets/notifications.svg";
import userAvatar from "../assets/userImage.svg";
import pdldLogo from "../assets/pdld-logo.webp";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center">
      <img
        src={pdldLogo}
        alt="pdldLogo"
        style={{ width: "100px", height: "35px", objectFit: "contain" }}
      />

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
