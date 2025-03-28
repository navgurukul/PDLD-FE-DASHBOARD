import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

const Breadcrumb = () => {
	const location = useLocation();
	const pathnames = location.pathname.split("/").filter((x) => x);

	// Define path to label mapping
	const pathMap = {
		schools: "School Management",
		"add-school": "Add School",
		upload: "Bulk Upload",
		users: "User Management",
		userCreationForm: "Add User",
		reports: "Reports",
		allTest: "All Tests",
		testCreationForm: "Create Test",
		edit: "Edit",
		testCreation: "Test",
		help: "Help & Support",
	};

	return (
		<Breadcrumbs
			separator={<NavigateNextIcon fontSize="small" />}
			aria-label="breadcrumb"
			sx={{
				mb: 2,
				pl: 6,
				mt: 5,
				fontFamily: "'Karla', sans-serif", // Add the custom font
				fontSize: "14px", // Adjust font size
			}}
		>
			<Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#757575" }}>
				<HomeIcon sx={{ mr: 0.5, fontSize: "16px" }} />
				Home
			</Link>

			{pathnames.map((value, index) => {
				const last = index === pathnames.length - 1;
				const to = `/${pathnames.slice(0, index + 1).join("/")}`;

				// Handle numeric IDs in the path
				if (!isNaN(value)) {
					return last ? (
						<Typography key={to} color="text.primary">
							{value}
						</Typography>
					) : (
						<Link
							key={to}
							to={to}
							// style={{ textDecoration: 'none', color: last ? '#2F4F4F' : '#757575' }}
							style={{
								textDecoration: "none",
								color: last ? "#2F4F4F" : "#757575",
								fontFamily: "'Karla', sans-serif",
								fontSize: "16px",
								fontWeight: "400",
							}}
						>
							{value}
						</Link>
					);
				}

				// Use the path map to get a friendly name, or capitalize the first letter
				const displayName = pathMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

				return last ? (
					<Typography
						key={to}
						color="text.primary"
						fontWeight="medium"
						style={{
							textDecoration: "none",
							fontFamily: "'Karla', sans-serif",
							fontSize: "14px",
						}}
					>
						{displayName}
					</Typography>
				) : (
					<Link
						key={to}
						to={to}
						style={{
							textDecoration: "none",
							color: last ? "#2F4F4F" : "#757575",
							fontFamily: "'Karla', sans-serif",
							fontSize: "14px",
							fontWeight: "400",
						}}
					>
						{displayName}
					</Link>
				);
			})}
		</Breadcrumbs>
	);
};

export default Breadcrumb;
