import { useState } from "react";
import {
	Typography,
	Box,
	Paper,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Grid,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme } from "@mui/material/styles";
// Dummy data for academic tests
const academicData = {
	academicYear: "2024-25",
	syllabusTests: [
		{
			month: "April",
			expanded: true,
			subjects: [
				{ name: "Hindi", score: "82/100" },
				{ name: "English", score: "82/100" },
				{ name: "Mathematics", score: "82/100" },
				{ name: "Social Science", score: "82/100" },
				{ name: "Science", score: "82/100" },
				{ name: "Sanskrit", score: "82/100" },
			],
		},
		{
			month: "June",
			expanded: false,
			subjects: [
				{ name: "Hindi", score: "80/100" },
				{ name: "English", score: "79/100" },
				{ name: "Mathematics", score: "85/100" },
				{ name: "Social Science", score: "82/100" },
				{ name: "Science", score: "88/100" },
				{ name: "Sanskrit", score: "84/100" },
			],
		},
		{
			month: "October",
			expanded: false,
			subjects: [
				{ name: "Hindi", score: "90/100" },
				{ name: "English", score: "87/100" },
				{ name: "Mathematics", score: "92/100" },
				{ name: "Social Science", score: "89/100" },
				{ name: "Science", score: "91/100" },
				{ name: "Sanskrit", score: "86/100" },
			],
		},
	],
	remedialTests: [
		{
			month: "May",
			subjects: [
				{ name: "Hindi", level: "Beginner" },
				{ name: "Mathematics", level: "Single Digit" },
			],
		},
		{
			month: "July",
			subjects: [
				{ name: "Hindi", level: "Beginner" },
				{ name: "Mathematics", level: "Single Digit" },
			],
		},
	],
};

const StudentAcademics = ({ studentData }) => {
	const theme = useTheme();
	const [month, setMonth] = useState("All");
	const [subject, setSubject] = useState("All");
	const [expanded, setExpanded] = useState("April");
	const [allExpanded, setAllExpanded] = useState(false);

	// Handle month filter change
	const handleMonthChange = (event) => {
		setMonth(event.target.value);
	};

	// Handle subject filter change
	const handleSubjectChange = (event) => {
		setSubject(event.target.value);
	};

	// Handle accordion expansion
	const handleAccordionChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};

	// Handle expand/collapse all
	const handleExpandCollapseAll = () => {
		if (allExpanded) {
			setExpanded(false);
			setAllExpanded(false);
		} else {
			setExpanded("all");
			setAllExpanded(true);
		}
	};

	// Filter syllabus tests based on selected month
	const filteredSyllabusTests =
		month === "All"
			? academicData.syllabusTests
			: academicData.syllabusTests.filter((test) => test.month === month);

	return (
		<Box className="">
			{/* Academic Year Header */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					borderRadius: "8px",
					backgroundColor: "#F5F7F8",
					marginBottom: 3,
				}}
			>
				<h6 className="flex justify-center">Academic Year {academicData.academicYear}</h6>
			</Paper>

			{/* Main content grid - Syllabus and Remedial tests side by side */}
			<Grid container spacing={3} className="">
				{/* Syllabus Test Section */}
				<Grid item xs={12} md={6}>
					<Box>
						<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
							<h6 className="">Syllabus Test</h6>
							<Button
								onClick={handleExpandCollapseAll}
								disableRipple={true}
								sx={{
									fontSize: "14px",
									fontFamily: "Work Sans",
									"&:hover": {
										backgroundColor: "transparent",
									},
								}}
							>
								{allExpanded ? "Collapse" : "Expand All"}
							</Button>
						</Box>

						{/* Filters */}
						<Box sx={{ display: "flex", gap: 2, mb: 3 }}>
							<FormControl sx={{ minWidth: 120 }} size="small">
								<InputLabel>Month</InputLabel>
								<Select
									value={month}
									onChange={handleMonthChange}
									label="Month"
									IconComponent={KeyboardArrowDownIcon}
									sx={{
										height: "48px",
										borderRadius: "8px",
									}}
								>
									<MenuItem value="All">All</MenuItem>
									<MenuItem value="April">April</MenuItem>
									<MenuItem value="June">June</MenuItem>
									<MenuItem value="October">October</MenuItem>
								</Select>
							</FormControl>

							<FormControl sx={{ minWidth: 120, borderRadius: "8px" }} size="small">
								<InputLabel>Subject</InputLabel>
								<Select
									value={subject}
									onChange={handleSubjectChange}
									label="Subject"
									IconComponent={KeyboardArrowDownIcon}
									sx={{
										height: "48px",
										borderRadius: "8px",
									}}
								>
									<MenuItem value="All">All</MenuItem>
									<MenuItem value="Hindi">Hindi</MenuItem>
									<MenuItem value="English">English</MenuItem>
									<MenuItem value="Mathematics">Mathematics</MenuItem>
									<MenuItem value="Science">Science</MenuItem>
									<MenuItem value="Social Science">Social Science</MenuItem>
									<MenuItem value="Sanskrit">Sanskrit</MenuItem>
								</Select>
							</FormControl>
						</Box>

						{/* Accordion List */}
						{filteredSyllabusTests.map((test, index) => (
							<Accordion
								key={test.month}
								expanded={expanded === test.month || expanded === "all"}
								onChange={handleAccordionChange(test.month)}
								sx={{
									mb: 1,
									boxShadow: "none",
									"&:before": {
										display: "none",
									},
									border: "1px solid #e0e0e0",
									borderRadius: "8px",
									overflow: "hidden",
									"&.Mui-expanded": {
										margin: 0,
										mb: 1,
									},
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{
										backgroundColor: expanded === test.month ? "#F5F7F8" : "transparent",
										borderBottom: expanded === test.month ? "1px solid #e0e0e0" : "none",
										"&.Mui-expanded": {
											minHeight: "48px",
										},
									}}
								>
									<Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
										{test.month}
									</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Box sx={{ p: 1 }}>
										{test.subjects
											.filter((subj) => subject === "All" || subj.name === subject)
											.map((subject, subIndex, filteredArray) => (
												<Box
													key={subIndex}
													sx={{
														display: "flex",
														justifyContent: "space-between",
														py: 1.5,
														borderBottom:
															subIndex < filteredArray.length - 1
																? "1px solid #f0f0f0"
																: "none",
													}}
												>
													<Typography variant="body1" sx={{ color: "#555" }}>
														{subject.name}
													</Typography>
													<Typography variant="body1" sx={{ fontWeight: "medium" }}>
														{subject.score}
													</Typography>
												</Box>
											))}
									</Box>
								</AccordionDetails>
							</Accordion>
						))}

						{filteredSyllabusTests.length === 0 && (
							<Box
								sx={{
									p: 3,
									textAlign: "center",
									color: "#666",
									border: "1px dashed #ccc",
									borderRadius: "8px",
								}}
							>
								<Typography variant="body1">No tests available for the selected filters</Typography>
							</Box>
						)}
					</Box>
				</Grid>

				{/* Remedial Test Section */}
				<Grid item xs={12} md={6}>
					<Box>
						<h6 className="mb-2">Remedial Test</h6>

						{academicData.remedialTests.length > 0 ? (
							academicData.remedialTests.map((test, index) => (
								<Box key={index} sx={{ mb: 3 }}>
									<Typography
										variant="subtitle1"
										sx={{
											backgroundColor: "#F5F7F8",
											p: 1.5,
											borderRadius: "8px 8px 0 0",
											borderTop: "1px solid #e0e0e0",
											borderLeft: "1px solid #e0e0e0",
											borderRight: "1px solid #e0e0e0",
											fontWeight: "medium",
										}}
									>
										{test.month}
									</Typography>

									<Box
										sx={{
											border: "1px solid #e0e0e0",
											borderRadius: "0 0 8px 8px",
											overflow: "hidden",
										}}
									>
										{test.subjects.map((subject, subIndex) => (
											<Box
												key={subIndex}
												sx={{
													display: "flex",
													justifyContent: "space-between",
													p: 1.5,
													borderBottom:
														subIndex < test.subjects.length - 1
															? "1px solid #f0f0f0"
															: "none",
												}}
											>
												<Typography variant="body1" sx={{ color: "#555" }}>
													{subject.name}
												</Typography>
												<Typography
													variant="body1"
													sx={{
														fontWeight: "medium",
													}}
												>
													{subject.level}
												</Typography>
											</Box>
										))}
									</Box>
								</Box>
							))
						) : (
							<Box sx={{ p: 3, textAlign: "center", color: "#666" }}>
								<Typography variant="body1">
									No remedial assessments have been conducted for this student yet
								</Typography>
							</Box>
						)}
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
};

export default StudentAcademics;
