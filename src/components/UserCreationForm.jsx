import { useState, useEffect } from "react";
import {
	TextField,
	Button,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	Chip,
	Box,
	Typography,
	Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiInstance from "../../api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonCustom from "./ButtonCustom";
import { toast, ToastContainer } from "react-toastify";

const theme = createTheme({
	typography: {
		fontFamily: "'Karla', sans-serif",
		color: "#2F4F4F",
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					backgroundColor: "#007BFF",
					color: "white",
					"&:hover": {
						backgroundColor: "#0069D9",
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#2F4F4F",
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					"&.Mui-focused": {
						color: "#2F4F4F",
					},
				},
			},
		},
	},
});

export default function UserCreationForm() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		role: "",
		block: "",
		cluster: "",
		school: "",
	});

	const [blocksData, setBlocksData] = useState([]);
	const [totalSchoolsSelected, setTotalSchoolsSelected] = useState(0);

	const [availableBlocks, setAvailableBlocks] = useState([]);
	const [availableClusters, setAvailableClusters] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedEntities, setSelectedEntities] = useState({
		blocks: [],
		clusters: [],
		schools: [],
	});

	const [hierarchyFields, setHierarchyFields] = useState({
		showBlock: false,
		showCluster: false,
		showSchool: false,
	});

	const roles = [
		{ value: "DO", label: "District Officer" },
		{ value: "BO", label: "Block Officer" },
		{ value: "CP", label: "Cluster Principal" },
		{ value: "CAC", label: "Cluster Academic Coordinator" },
	];

	// Fetch blocks and clusters data on component mount
	useEffect(() => {
		fetchBlocksAndClusters();
	}, []);

	// Process blocks and clusters when blocksData changes
	useEffect(() => {
		if (blocksData.length > 0) {
			// Format blocks for the dropdown
			const blocks = blocksData.map((block) => ({
				id: block.blockName,
				name: block.blockName,
			}));
			setAvailableBlocks(blocks);
		}
	}, [blocksData]);

	// Update total schools when selected clusters change
	useEffect(() => {
		calculateTotalSchools();
	}, [selectedEntities.clusters, blocksData]);

	// Calculate total schools for selected clusters
	const calculateTotalSchools = () => {
		if (!selectedEntities.clusters.length || !blocksData.length) {
			setTotalSchoolsSelected(0);
			return;
		}

		let totalSchools = 0;
		const selectedBlock = blocksData.find((block) => block.blockName === formData.block);

		if (selectedBlock) {
			selectedEntities.clusters.forEach((clusterName) => {
				const cluster = selectedBlock.clusters.find((c) => c.name === clusterName);
				if (cluster) {
					totalSchools += cluster.totalSchool;
				}
			});
		}

		setTotalSchoolsSelected(totalSchools);
	};

	// Validation function - returns true if valid, false if invalid
	const validateForm = () => {
		// Validate full name
		if (!formData.fullName.trim()) {
			toast.error("Full name is required");
			return false;
		} else if (formData.fullName.trim().length < 3) {
			toast.error("Full name must be at least 3 characters");
			return false;
		} else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
			toast.error("Full name should only contain letters and spaces");
			return false;
		}

		// Validate email if provided
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			toast.error("Please enter a valid email address");
			return false;
		}

		// Validate role
		if (!formData.role) {
			toast.error("Please select a role");
			return false;
		}

		// Validate block selection for roles that require it
		if (hierarchyFields.showBlock && !formData.block) {
			toast.error("Please select a block");
			return false;
		}

		// Validate cluster selection for roles that require it
		if (hierarchyFields.showCluster && selectedEntities.clusters.length === 0) {
			toast.error("Please select at least one cluster");
			return false;
		}

		return true;
	};

	// Handle role change to determine which fields to show
	const handleRoleChange = (event) => {
		const role = event.target.value;
		setFormData({ ...formData, role, block: "" });

		// Reset selections when role changes
		setSelectedEntities({
			blocks: [],
			clusters: [],
			schools: [],
		});

		// Determine which fields to show based on selected role
		switch (role) {
			case "DO":
				setHierarchyFields({
					showBlock: false,
					showCluster: false,
					showSchool: false,
				});
				break;
			case "BO":
				setHierarchyFields({
					showBlock: true,
					showCluster: false,
					showSchool: false,
				});
				break;
			case "CP":
				setHierarchyFields({
					showBlock: true,
					showCluster: true,
					showSchool: false,
				});
				break;
			case "CAC":
				setHierarchyFields({
					showBlock: true,
					showCluster: true,
					showSchool: false,
				});
				break;
			default:
				setHierarchyFields({
					showBlock: false,
					showCluster: false,
					showSchool: false,
				});
		}
	};

	// Fetch blocks and clusters data from API
	const fetchBlocksAndClusters = async () => {
		try {
			const response = await apiInstance.get("/dev/user/dropdown-data");
			if (response.data && response.data.success) {
				setBlocksData(response.data.data);
			} else {
				console.error("Failed to fetch blocks and clusters:", response.data.message);
			}
		} catch (error) {
			console.error("Error fetching blocks and clusters:", error);
			toast.error("Failed to load blocks and clusters data");
		}
	};

	// Update available clusters when block is selected
	const handleBlockChange = (event) => {
		const blockName = event.target.value;
		setFormData({ ...formData, block: blockName });

		// Reset cluster and school selections when block changes
		setSelectedEntities({
			...selectedEntities,
			clusters: [],
			schools: [],
		});

		// Find the selected block in the data
		const selectedBlock = blocksData.find((block) => block.blockName === blockName);

		if (selectedBlock) {
			// Format clusters for the dropdown
			const clusters = selectedBlock.clusters.map((cluster) => ({
				id: cluster.name,
				name: cluster.name,
				totalSchool: cluster.totalSchool,
			}));
			setAvailableClusters(clusters);
		} else {
			setAvailableClusters([]);
		}
	};

	const handleClusterChange = (event) => {
		// For multiselect, event.target.value will be an array
		const selectedClusters = event.target.value;

		setSelectedEntities({
			...selectedEntities,
			clusters: selectedClusters,
			schools: [],
		});
	};

	const handleRemoveCluster = (clusterName) => {
		setSelectedEntities({
			...selectedEntities,
			clusters: selectedEntities.clusters.filter((name) => name !== clusterName),
		});
	};

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	// Generate the username
	const generateUsername = (fullName, role) => {
		// Replace spaces with underscores and convert to lowercase
		const formattedName = fullName.trim().replace(/\s+/g, "_").toLowerCase();

		// Generate a random 3-digit number
		const randomDigits = Math.floor(100 + Math.random() * 900);

		// Map role values to role codes
		const roleMap = {
			DO: "DO",
			BO: "BO",
			CP: "CP",
			CAC: "CAC",
		};

		// Create the username
		return `${formattedName}_${roleMap[role]}_${randomDigits}`;
	};

	// Submit form data to API
	const handleSubmit = async (event) => {
		event.preventDefault();

		// Validate form before submission
		if (!validateForm()) {
			return;
		}

		// Generate the username based on name and role
		const username = generateUsername(formData.fullName, formData.role);

		// Prepare data for submission
		const userData = {
			username: username,
			password: formData.password || "default_password", // Use provided password or default
			name: formData.fullName,
			role: mapRoleToAPIFormat(formData.role), // Convert role to the format expected by API
			email: formData.email || "",
			assignedBlocks: formData.block ? [formData.block] : [],
			assignedClusters: selectedEntities.clusters,
			permissions: ["audit", "view_reports"], // Default permissions
		};

		try {
			setIsSubmitting(true);
			const response = await apiInstance.post("/dev/user/add", userData);

			console.log("User created:", response.data);

			// Show success toast
			toast.success("User created successfully!");

			// Navigate back to users page with success message
			navigate("/users", {
				state: { successMessage: "User created successfully!" },
			});
		} catch (error) {
			console.error("Error creating user:", error);

			// Show appropriate error message
			const errorMessage = error.response?.data?.message || "Failed to create user. Please try again.";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Helper function to map role codes to API format
	const mapRoleToAPIFormat = (role) => {
		const roleMap = {
			DO: "DISTRICT_OFFICER",
			BO: "BLOCK_OFFICER",
			CP: "CLUSTER_PRINCIPAL",
			CAC: "CLUSTER_ACADEMIC_COORDINATOR",
		};

		return roleMap[role] || role;
	};

	const capitalizeFirstLetter = (str) => {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	};

	return (
		<ThemeProvider theme={theme}>
			<Paper elevation={0} className="max-w-2xl mx-auto p-6 rounded-lg">
				<h5 className="text-lg font-bold text-[#2F4F4F]">Create New User</h5>
				<Typography variant="body1" className="text-gray-600 mb-6">
					Create a new user with a specific role and map them to schools
				</Typography>

				<form onSubmit={handleSubmit}>
					<div className="mt-4">
						<TextField
							label="Full Name"
							name="fullName"
							value={formData.fullName}
							onChange={handleInputChange}
							required
							fullWidth
							placeholder="Enter full name"
							variant="outlined"
							sx={{
								"& .MuiOutlinedInput-root": {
									height: "48px",
								},
							}}
						/>
					</div>

					<div className="my-6">
						<TextField
							label="Email (Optional)"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							fullWidth
							placeholder="Enter email"
							variant="outlined"
							sx={{
								"& .MuiOutlinedInput-root": {
									height: "48px",
								},
							}}
						/>
					</div>

					<div className="mb-6">
						<FormControl fullWidth variant="outlined" required>
							<InputLabel>Role</InputLabel>
							<Select
								displayEmpty
								value={formData.role}
								onChange={handleRoleChange}
								inputProps={{ "aria-label": "Role" }}
								label="Role"
								sx={{
									height: "48px",
									"& .MuiSelect-select": {
										height: "48px",
										display: "flex",
										alignItems: "center",
										padding: "0 14px",
									},
								}}
								renderValue={(selected) => {
									if (!selected) {
										return <span className="text-gray-500">Role *</span>;
									}
									return roles.find((role) => role.value === selected)?.label;
								}}
							>
								{roles.map((role) => (
									<MenuItem key={role.value} value={role.value}>
										{role.label} ({role.value})
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>

					{hierarchyFields.showBlock && (
						<div className="mb-6">
							<FormControl fullWidth required>
								<InputLabel>Select Block</InputLabel>
								<Select
									sx={{
										height: "48px",
										"& .MuiSelect-select": {
											height: "48px",
											display: "flex",
											alignItems: "center",
										},
									}}
									value={formData.block}
									onChange={handleBlockChange}
									label="Select Block"
								>
									{availableBlocks.map((block) => (
										<MenuItem key={block.id} value={block.id}>
											{capitalizeFirstLetter(block.name)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</div>
					)}

					{hierarchyFields.showCluster && formData.block && (
						<>
							<div className="mb-6">
								<FormControl fullWidth required>
									<InputLabel>Select Clusters in {formData.block}</InputLabel>
									<Select
										sx={{
											height: "48px",
											"& .MuiSelect-select": {
												height: "48px",
												display: "flex",
												alignItems: "center",
											},
										}}
										multiple
										value={selectedEntities.clusters}
										onChange={handleClusterChange}
										label={`Select Clusters in ${formData.block}`}
										renderValue={(selected) => (
											<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
												{selected.map((clusterName) => (
													<Chip
														key={clusterName}
														label={capitalizeFirstLetter(clusterName)}
														onDelete={() => handleRemoveCluster(clusterName)}
														onMouseDown={(event) => {
															event.stopPropagation();
														}}
														onClick={(event) => {
															event.stopPropagation();
														}}
														size="small"
														sx={{ m: 0.5 }}
													/>
												))}
											</Box>
										)}
										MenuProps={{
											PaperProps: {
												style: {
													maxHeight: 300,
												},
											},
										}}
									>
										{availableClusters.map((cluster) => (
											<MenuItem
												key={cluster.id}
												value={cluster.id}
												sx={{ display: "flex", alignItems: "center" }}
											>
												<input
													type="checkbox"
													checked={selectedEntities.clusters.includes(cluster.id)}
													readOnly
													style={{
														marginRight: "10px",
														accentColor: "#2F4F4F",
													}}
												/>
												{/* {cluster.name} */}
												{capitalizeFirstLetter(cluster.name)}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</div>
						</>
					)}

					{(formData.block || selectedEntities.clusters.length > 0) && (
						<div className="mb-6 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300 rounded-lg">
							<Typography variant="subtitle1" className="mb-4 font-semibold">
								Summary of Selected Entities
							</Typography>
							<div className="mb-2 flex">
								{formData.block && (
									<Typography
										variant="body2"
										className="
									bg-gray-200 px-2 py-1 rounded-[50px]"
									>
										1 Block ({formData.block})
									</Typography>
								)}
								{selectedEntities.clusters.length > 0 && (
									<Typography
										variant="body2"
										className="
									bg-gray-200 mx-4! px-2 py-1 rounded-[50px]"
									>
										{selectedEntities.clusters.length} Clusters
									</Typography>
								)}
								{totalSchoolsSelected > 0 && (
									<Typography
										variant="body2"
										className="
									bg-gray-200 px-2 py-1 rounded-[50px]"
									>
										{totalSchoolsSelected} Schools
									</Typography>
								)}
							</div>
						</div>
					)}

					<div className="flex justify-center mt-4">
						<ButtonCustom
							text={isSubmitting ? "Creating..." : "Create User"}
							onClick={handleSubmit}
							disabled={isSubmitting}
						/>
					</div>
				</form>
			</Paper>
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
		</ThemeProvider>
	);
}
