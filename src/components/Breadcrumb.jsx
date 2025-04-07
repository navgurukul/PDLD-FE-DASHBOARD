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
		schoolDetail: "School Detail",
		addStudents: "Add Students"
	};

	// Check if a string is a UUID
	const isUUID = (str) => {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
	};

	// Create breadcrumb items with proper path handling
	const breadcrumbItems = [];
	let currentPath = "";
	
	// Add Home link as the first item
	breadcrumbItems.push(
		<Link key="home" to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#757575" }}>
			<HomeIcon sx={{ mr: 0.5, fontSize: "16px" }} />
			Home
		</Link>
	);

	// Process each pathname segment
	for (let i = 0; i < pathnames.length; i++) {
		const value = pathnames[i];
		currentPath += `/${value}`;
		
		// If this is a UUID, add it to the path but don't display it in the breadcrumb
		if (isUUID(value)) {
			continue;
		}
		
		// Determine if this is the last visible item
		const isLast = i === pathnames.length - 1 || 
			(i < pathnames.length - 1 && isUUID(pathnames[i + 1]) && i + 1 === pathnames.length - 1);
		
		// Special handling for schoolDetail to include UUID
		let linkTo = currentPath;
		if (value === "schoolDetail" && i < pathnames.length - 1 && isUUID(pathnames[i + 1])) {
			linkTo = `${currentPath}/${pathnames[i + 1]}`;
		}
		
		// Use the path map to get a friendly name, or capitalize the first letter
		const displayName = pathMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
		
		if (isLast) {
			breadcrumbItems.push(
				<Typography
					key={linkTo}
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
			);
		} else {
			breadcrumbItems.push(
				<Link
					key={linkTo}
					to={linkTo}
					style={{
						textDecoration: "none",
						color: "#757575",
						fontFamily: "'Karla', sans-serif",
						fontSize: "14px",
						fontWeight: "400",
					}}
				>
					{displayName}
				</Link>
			);
		}
	}

	return (
		<Breadcrumbs
			separator={<NavigateNextIcon fontSize="small" />}
			aria-label="breadcrumb"
			sx={{
				mb: 1,
				pl: 10,
				mt: 5,
				fontFamily: "'Karla', sans-serif",
				fontSize: "14px",
			}}
		>
			{breadcrumbItems}
		</Breadcrumbs>
	);
};

export default Breadcrumb;