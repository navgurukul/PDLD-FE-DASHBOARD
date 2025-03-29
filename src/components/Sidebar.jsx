import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	HideSidebar,
	CloseSidebarIcon,
	ExamMultiple,
	UserGroup,
	BrandGoogleAnalytics,
	SelReports,
	SelTests,
	SelUsers,
	UNSelUsers,
	UNSelTests,
	UNSelReports,school,unselectedschool,
} from "../utils/imagePath";

const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(true);
	const location = useLocation(); // Detects current route
	if (location.pathname.includes("testCreationForm") || location.pathname.includes("edit")) return null;

	// Menu data (path + label)
	const menuItems = [
		{
			to: "/allTest",
			label: "Test",
			selectedImage: SelTests,
			unselectedImage: UNSelTests,
		},
		{
			to: "/schools",
			label: "Schools",
			selectedImage: unselectedschool,
			unselectedImage: school,
		},
		{
			to: "/users",
			label: "Users",
			selectedImage: SelUsers,
			unselectedImage: UNSelUsers,
		},

		{
			to: "",
			label: "Reports",
			selectedImage: SelReports,
			unselectedImage: UNSelReports,
		},
	];

	return (
		<div
			className={`bg-[#2F4F4F] text-white overflow-x-hidden transition-all duration-300 overflow-y-auto ${
				isOpen ? "w-[236px]" : "w-16"
			}`}
			style={{ borderRadius: "0px 8px 8px 0px" }}
		>
			{/* Toggle Button */}
			<button className="p-2 m-2" onClick={() => setIsOpen(!isOpen)}>
				{isOpen ? (
					<div className="flex items-center pl-1">
						<img src={HideSidebar} alt="Hide" className="w-4 h-4 mr-4" />
						<span>Hide</span>
					</div>
				) : (
					<div className="flex items-center pl-1">
						<img src={CloseSidebarIcon} alt="Show" className="w-4 h-4 mr-4" />
						<span> </span>
					</div>
				)}
			</button>

			{/* Navigation */}
			<nav className="mt-4 flex flex-col space-y-2 px-2">
				{menuItems.map((item) => {
					const isActive = location.pathname === item.to;
					return (
						<Link key={item.to} to={item.to}>
							<li
								className={`list-none flex items-center rounded-md p-2 cursor-pointer
                ${isActive ? "bg-white text-[#2F4F4F] pl-2" : "bg-transparent hover:bg-[#2F4F4F] hover:text-[#white]"}
              `}
							>
								<img
									src={isActive ? item.selectedImage : item.unselectedImage}
									alt={item.label}
									className="mr-2"
								/>
								{isOpen && <span className="font-medium">{item.label}</span>}
							</li>
						</Link>
					);
				})}
			</nav>
		</div>
	);
};

export default Sidebar;
