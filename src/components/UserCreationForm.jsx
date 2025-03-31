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

	const [availableBlocks, setAvailableBlocks] = useState([]);
	const [availableClusters, setAvailableClusters] = useState([]);
	const [availableSchools, setAvailableSchools] = useState([]);
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

	// Handle role change to determine which fields to show
	const handleRoleChange = (event) => {
		const role = event.target.value;
		setFormData({ ...formData, role });

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
				fetchBlocks();
				break;
			case "CP":
				setHierarchyFields({
					showBlock: true,
					showCluster: true,
					showSchool: false,
				});
				fetchBlocks();
				break;
			case "CAC":
				setHierarchyFields({
					showBlock: true,
					showCluster: true,
					showSchool: false,
				});
				fetchBlocks();
				break;
			default:
				setHierarchyFields({
					showBlock: false,
					showCluster: false,
					showSchool: false,
				});
		}
	};

	// Mock API functions - replace with actual implementations
	const fetchBlocks = async () => {
		try {
			// const response = await apiInstance.get('/dev/blocks');
			// setAvailableBlocks(response.data.data);

			// Mock data for blocks
			setAvailableBlocks([
				{ id: 1, name: "Block 1" },
				{ id: 2, name: "Block 2" },
				{ id: 3, name: "Block 3" },
			]);
		} catch (error) {
			console.error("Error fetching blocks:", error);
		}
	};

	const fetchClusters = async (blockId) => {
		try {
			// const response = await apiInstance.get(`/dev/clusters?blockId=${blockId}`);
			// setAvailableClusters(response.data.data);

			// Mock data for clusters
			setAvailableClusters([
				{ id: 1, name: "Cluster 1", blockId: blockId },
				{ id: 2, name: "Cluster 2", blockId: blockId },
				{ id: 3, name: "Cluster 3", blockId: blockId },
				{ id: 4, name: "Cluster 4", blockId: blockId },
			]);
		} catch (error) {
			console.error("Error fetching clusters:", error);
		}
	};

	const handleBlockChange = (event) => {
		const blockId = event.target.value;
		setFormData({ ...formData, block: blockId });

		// Reset cluster and school selections when block changes
		setSelectedEntities({
			...selectedEntities,
			clusters: [],
			schools: [],
		});

		fetchClusters(blockId);
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

	const handleRemoveCluster = (clusterId) => {
		setSelectedEntities({
			...selectedEntities,
			clusters: selectedEntities.clusters.filter((id) => id !== clusterId),
			schools: selectedEntities.schools.filter(
				(school) => !availableSchools.find((s) => s.id === school && s.clusterId === clusterId)
			),
		});
	};

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	// Add this function to generate the username
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

	// Modify the handleSubmit function to use the API
	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!formData.fullName || !formData.role) {
			alert("Please fill in all required fields");
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
			assignedBlocks: formData.block ? [availableBlocks.find((b) => b.id === formData.block)?.name] : [],
			assignedClusters: selectedEntities.clusters.map((id) => availableClusters.find((c) => c.id === id)?.name),
			permissions: ["audit", "view_reports"], // Default permissions
		};

		try {
			setIsSubmitting(true); // Add this state variable
			const response = await apiInstance.post("/dev/user/add", userData);

			console.log("User created:", response.data);

			// Navigate back to users page with success message
			navigate("/users", {
				state: { successMessage: "User created successfully!" },
			});
		} catch (error) {
			console.error("Error creating user:", error);

			// Show appropriate error message
			const errorMessage = error.response?.data?.message || "Failed to create user. Please try again.";
			alert(errorMessage); // Replace with toast or other notification
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
							<Select
								displayEmpty
								value={formData.role}
								onChange={handleRoleChange}
								inputProps={{ "aria-label": "Role" }}
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
						<div className="">
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
											{block.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</div>
					)}

					{hierarchyFields.showCluster && formData.block && (
						<>
							<div className="mt-6">
								<FormControl fullWidth required>
									<InputLabel>
										Select Clusters in {availableBlocks.find((b) => b.id === formData.block)?.name}
									</InputLabel>
									<Select
										sx={{
											height: "48px",
											"& .MuiSelect-select": {
												minHeight: "48px",
												display: "flex",
												alignItems: "center",
											},
										}}
										multiple
										value={selectedEntities.clusters}
										onChange={handleClusterChange}
										label={`Select Clusters in ${
											availableBlocks.find((b) => b.id === formData.block)?.name
										}`}
										renderValue={(selected) => (
											<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
												{selected.map((clusterId) => {
													const cluster = availableClusters.find((c) => c.id === clusterId);
													return (
														<Chip
															key={clusterId}
															label={cluster?.name}
															onDelete={() => handleRemoveCluster(clusterId)}
															onMouseDown={(event) => {
																event.stopPropagation();
															}}
															onClick={(event) => {
																event.stopPropagation();
															}}
															size="small"
															sx={{ m: 0.5 }}
														/>
													);
												})}
											</Box>
										)}
									>
										{availableClusters.map((cluster) => (
											<MenuItem key={cluster.id} value={cluster.id}>
												{cluster.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</div>
						</>
					)}

					{(selectedEntities.blocks.length > 0 ||
						selectedEntities.clusters.length > 0 ||
						selectedEntities.schools.length > 0) && (
						<div className="mb-6 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300 rounded-lg">
							<Typography variant="subtitle1" className="mb-4 font-semibold">
								Summary of Selected Entities
							</Typography>
							<div className="flex flex-wrap gap-2">
								{formData.block && (
									<Chip
										label={`${availableBlocks.find((b) => b.id === formData.block)?.name}`}
										color="default"
									/>
								)}
								{selectedEntities.clusters.length > 0 && (
									<Chip
										label={`${selectedEntities.clusters.length} cluster${
											selectedEntities.clusters.length > 1 ? "s" : ""
										}`}
										color="default"
									/>
								)}
								{selectedEntities.schools.length > 0 && (
									<Chip
										label={`${selectedEntities.schools.length} school${
											selectedEntities.schools.length > 1 ? "s" : ""
										}`}
										color="default"
									/>
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
		</ThemeProvider>
	);
}
