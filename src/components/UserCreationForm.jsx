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

	const fetchSchools = async (clusterId) => {
		try {
			// const response = await apiInstance.get(`/dev/schools?clusterId=${clusterId}`);
			// setAvailableSchools(response.data.data);

			// Mock data for schools
			setAvailableSchools([
				{ id: 1, name: "School 1", clusterId: clusterId },
				{ id: 2, name: "School 2", clusterId: clusterId },
				{ id: 3, name: "School 3", clusterId: clusterId },
			]);
		} catch (error) {
			console.error("Error fetching schools:", error);
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

	const handleSchoolChange = (event) => {
		const schoolId = event.target.value;
		setSelectedEntities({
			...selectedEntities,
			schools: [...selectedEntities.schools, schoolId],
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

	const handleRemoveSchool = (schoolId) => {
		setSelectedEntities({
			...selectedEntities,
			schools: selectedEntities.schools.filter((id) => id !== schoolId),
		});
	};

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const generatePassword = () => {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < 12; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setFormData({ ...formData, password });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		// Prepare data for submission
		const userData = {
			name: formData.fullName,
			email: formData.email,
			password: formData.password,
			role: formData.role,
			blockId: formData.block,
			clusters: selectedEntities.clusters,
			schools: selectedEntities.schools,
		};

		try {
			// await apiInstance.post('/dev/users', userData);
			console.log("User created:", userData);
			navigate("/users", {
				state: { successMessage: "User created successfully!" },
			});
		} catch (error) {
			console.error("Error creating user:", error);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Paper elevation={0} className="max-w-2xl mx-auto p-6 rounded-lg">
				<h5 className="text-lg font-bold text-[#2F4F4F]">Create New User</h5>
				<Typography variant="body1" className="text-gray-600 mb-6">
					Create a new user with a specific role and map them to schools
				</Typography>

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<TextField
							label="Full Name"
							name="fullName"
							value={formData.fullName}
							onChange={handleInputChange}
							required
							fullWidth
							placeholder="Enter full name"
							margin="normal"
							variant="outlined"
							size="small"
						/>
					</div>

					<div className="mb-4">
						<TextField
							label="Email (Optional)"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							fullWidth
							placeholder="Enter email"
							margin="normal"
							variant="outlined"
							size="small"
						/>
					</div>

					<div className="mb-4 flex gap-2 items-center">
						<TextField
							label="Password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleInputChange}
							required
							fullWidth
							placeholder="Enter password"
							margin="normal"
							variant="outlined"
							size="small"
						/>
						<ButtonCustom text="Generate" onClick={generatePassword} />
					</div>

					<div className="mb-4">
						<FormControl fullWidth variant="outlined" required>
							<Select
								size="small"
								displayEmpty
								value={formData.role}
								onChange={handleRoleChange}
								inputProps={{ "aria-label": "Role" }}
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
						<div className="mb-4">
							<FormControl fullWidth margin="normal" required>
								<InputLabel>Select Block</InputLabel>
								<Select
									value={formData.block}
									onChange={handleBlockChange}
									label="Select Block"
									size="small"
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
							<div className="mb-4">
								<FormControl fullWidth margin="normal" required>
									<InputLabel>
										Select Clusters in {availableBlocks.find((b) => b.id === formData.block)?.name}
									</InputLabel>
									<Select
										multiple
										value={selectedEntities.clusters}
										onChange={handleClusterChange}
										label={`Select Clusters in ${
											availableBlocks.find((b) => b.id === formData.block)?.name
										}`}
										size="small"
										renderValue={(selected) => (
											<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
												{selected.map((clusterId) => {
													const cluster = availableClusters.find((c) => c.id === clusterId);
													return <Chip key={clusterId} label={cluster?.name} size="small" />;
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
						<div className="mb-6 mt-4 p-4 bg-gray-50 rounded-lg">
							<Typography variant="subtitle1" className="mb-2 font-semibold">
								Selected Schools ({selectedEntities.schools.length})
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

					<div className="flex justify-end">
						<ButtonCustom text="Create User" onClick={handleSubmit} />
					</div>
				</form>
			</Paper>
		</ThemeProvider>
	);
}
