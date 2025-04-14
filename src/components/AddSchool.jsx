import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	TextField,
	FormHelperText,
	CircularProgress,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Autocomplete,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import apiInstance from "../../api";
import ButtonCustom from "./ButtonCustom";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function AddSchool({ onClose, onSave }) {
	const { schoolId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [formData, setFormData] = useState({
		schoolName: "",
		udiseCode: "",
		clusterName: "",
		blockName: "",
	});

	const [loading, setLoading] = useState(false);
	const [fetchingSchool, setFetchingSchool] = useState(false);
	const [blocksData, setBlocksData] = useState([]);
	const [availableClusters, setAvailableClusters] = useState([]);
	const [blockInput, setBlockInput] = useState("");
	const [clusterInput, setClusterInput] = useState("");
	const [allClusters, setAllClusters] = useState([]);

	const [errors, setErrors] = useState({
		schoolName: false,
		udiseCode: false,
		clusterName: false,
		blockName: false,
	});

	// Fetch blocks and clusters data on component mount
	useEffect(() => {
		fetchBlocksAndClusters();
	}, []);

	// Extract all unique clusters from all blocks
	useEffect(() => {
		if (blocksData.length > 0) {
			const allClusterNames = blocksData.flatMap((block) =>
				block.clusters.map((cluster) => ({
					id: cluster.name,
					name: cluster.name,
				}))
			);

			// Remove duplicates
			const uniqueClusters = allClusterNames.filter(
				(cluster, index, self) => self.findIndex((c) => c.id === cluster.id) === index
			);

			setAllClusters(uniqueClusters);
		}
	}, [blocksData]);

	// Update available clusters when block changes
	useEffect(() => {
		if (formData.blockName && blocksData.length > 0) {
			loadAvailableClusters(formData.blockName);
		}
	}, [formData.blockName, blocksData]);

	const fetchBlocksAndClusters = async () => {
		try {
			const response = await apiInstance.get("/dev/user/dropdown-data");
			if (response.data && response.data.success) {
				setBlocksData(response.data.data);
			} else {
				console.error("Failed to fetch blocks and clusters:", response.data?.message);
			}
		} catch (error) {
			console.error("Error fetching blocks and clusters:", error);
			toast.error("Failed to load blocks and clusters data");
		}
	};

	const loadAvailableClusters = (blockName) => {
		if (!blockName || !blocksData.length) return;

		// Find the selected block in the data
		const selectedBlock = blocksData.find((block) => block.blockName.toLowerCase() === blockName.toLowerCase());

		if (selectedBlock) {
			// Format clusters for the dropdown
			const clusters = selectedBlock.clusters.map((cluster) => ({
				id: cluster.name,
				name: cluster.name,
			}));
			setAvailableClusters(clusters);
		} else {
			setAvailableClusters([]);
		}
	};

	// Check for school data - either from route state or fetch from API
	useEffect(() => {
		if (schoolId) {
			// If we have school data in location state, use that
			if (location.state?.schoolData) {
				const schoolData = location.state.schoolData;
				setFormData({
					schoolName: schoolData.schoolName || "",
					udiseCode: schoolData.udiseCode || "",
					clusterName: schoolData.clusterName || "",
					blockName: schoolData.blockName || "",
				});
				setBlockInput(schoolData.blockName || "");
				setClusterInput(schoolData.clusterName || "");
			} else {
				// Otherwise fetch from API
				setFetchingSchool(true);
				apiInstance
					.get(`/dev/school/${schoolId}`)
					.then((response) => {
						if (response.data && response.data.data) {
							const schoolData = response.data.data;
							setFormData({
								schoolName: schoolData.schoolName || "",
								udiseCode: schoolData.udiseCode || "",
								clusterName: schoolData.clusterName || "",
								blockName: schoolData.blockName || "",
							});
							setBlockInput(schoolData.blockName || "");
							setClusterInput(schoolData.clusterName || "");
						} else {
							toast.error("Failed to fetch school data");
							navigate("/schools");
						}
					})
					.catch((error) => {
						console.error("Error fetching school data:", error);
						toast.error("Error fetching school data");
						navigate("/schools");
					})
					.finally(() => {
						setFetchingSchool(false);
					});
			}
		}
	}, [schoolId, navigate, location.state]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// For UDISE, only allow numeric input
		if (name === "udiseCode" && value !== "" && !/^\d+$/.test(value)) {
			return; // Don't update state if non-numeric characters are entered
		}

		setFormData({
			...formData,
			[name]: value,
		});

		// Clear error when user types
		if (value.trim()) {
			setErrors({
				...errors,
				[name]: false,
			});
		}
	};

	// Handle creating a new block
	const handleCreateNewBlock = (newBlockName) => {
		// Trimming to ensure clean data
		const trimmedBlockName = newBlockName.trim();
		if (trimmedBlockName) {
			setFormData({
				...formData,
				blockName: trimmedBlockName,
				clusterName: "", // Reset cluster when block changes
			});
			setBlockInput(trimmedBlockName);
			setClusterInput("");

			// Show success toast when a new block is created
			toast.success(`New block "${trimmedBlockName}" added successfully!`);

			// Clear error
			setErrors({
				...errors,
				blockName: false,
			});
		}
	};

	// Handle creating a new cluster
	const handleCreateNewCluster = (newClusterName) => {
		// Trimming to ensure clean data
		const trimmedClusterName = newClusterName.trim();
		if (trimmedClusterName) {
			setFormData({
				...formData,
				clusterName: trimmedClusterName,
			});
			setClusterInput(trimmedClusterName);

			// Show success toast when a new cluster is created
			toast.success(`New cluster "${trimmedClusterName}" added successfully!`);

			// Clear error
			setErrors({
				...errors,
				clusterName: false,
			});
		}
	};

	// Handle block selection changes
	const handleBlockChange = (event, newValue) => {
		// If newValue is a string with "Create new: " prefix, extract actual block name
		if (typeof newValue === "string" && newValue.startsWith("Create new: ")) {
			const newBlockName = newValue.replace("Create new: ", "");
			handleCreateNewBlock(newBlockName);
		}
		// Handle special option for creating new block
		else if (newValue && newValue.isCreateNew) {
			handleCreateNewBlock(newValue.blockName);
		}
		// For regular string input (direct typing + enter)
		else if (typeof newValue === "string") {
			setFormData({
				...formData,
				blockName: newValue.trim(),
				clusterName: "", // Reset cluster when block changes
			});
			setBlockInput(newValue.trim());
			setClusterInput("");

			// Clear error
			if (newValue.trim()) {
				setErrors({
					...errors,
					blockName: false,
				});
			}
		}
		// User selected an existing block from dropdown
		else if (newValue && newValue.blockName) {
			setFormData({
				...formData,
				blockName: newValue.blockName,
				clusterName: "", // Reset cluster when block changes
			});
			setBlockInput(newValue.blockName);
			setClusterInput("");

			// Clear error
			setErrors({
				...errors,
				blockName: false,
			});
		}
		// User cleared the selection
		else {
			setFormData({
				...formData,
				blockName: "",
				clusterName: "", // Reset cluster when block changes
			});
			setBlockInput("");
			setClusterInput("");
		}
	};

	// Handle cluster selection changes
	const handleClusterChange = (event, newValue) => {
		// If newValue is a string with "Create new: " prefix, extract actual cluster name
		if (typeof newValue === "string" && newValue.startsWith("Create new: ")) {
			const newClusterName = newValue.replace("Create new: ", "");
			handleCreateNewCluster(newClusterName);
		}
		// Handle special option for creating new cluster
		else if (newValue && newValue.isCreateNew) {
			handleCreateNewCluster(newValue.name);
		}
		// For regular string input (direct typing + enter)
		else if (typeof newValue === "string") {
			setFormData({
				...formData,
				clusterName: newValue.trim(),
			});
			setClusterInput(newValue.trim());

			// Clear error
			if (newValue.trim()) {
				setErrors({
					...errors,
					clusterName: false,
				});
			}
		}
		// User selected an existing cluster from dropdown
		else if (newValue && newValue.name) {
			setFormData({
				...formData,
				clusterName: newValue.name,
			});
			setClusterInput(newValue.name);

			// Clear error
			setErrors({
				...errors,
				clusterName: false,
			});
		}
		// User cleared the selection
		else {
			setFormData({
				...formData,
				clusterName: "",
			});
			setClusterInput("");
		}
	};

	const capitalizeFirstLetter = (str) => {
		if (!str) return "";
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	};

	const validateForm = () => {
		const newErrors = {
			schoolName: !formData.schoolName.trim(),
			udiseCode: !formData.udiseCode.trim(),
			blockName: !formData.blockName.trim(),
			clusterName: !formData.clusterName.trim(),
		};

		// Add UDISE code length validation
		if (formData.udiseCode.trim().length !== 11) {
			newErrors.udiseCode = true;
			toast.error("UDISE MUST BE 11 digit");
			return false;
		}

		setErrors(newErrors);

		// Return true if no errors (all fields filled)
		return !Object.values(newErrors).some((error) => error);
	};

	const handleSubmit = async () => {
		if (validateForm()) {
			try {
				setLoading(true);

				// Prepare payload based on the expected structure
				const payload = {
					schoolName: formData.schoolName,
					udiseCode: formData.udiseCode,
					blockName: formData.blockName,
					clusterName: formData.clusterName,
				};

				let response;

				// For the update existing school case (when schoolId exists)
				if (schoolId) {
					try {
						// Update existing school
						response = await apiInstance.put(`/dev/school/update/${schoolId}`, payload);

						// Success message
						toast.success("School updated successfully!");

						// Call onSave if provided
						if (onSave && typeof onSave === "function") {
							onSave(response.data?.data || formData);
						}

						// Force immediate navigation
						setTimeout(() => {
							navigate("/schools", {
								state: { successMessage: "School updated successfully!" },
								replace: true, // Force navigation
							});
						}, 100);
					} catch (error) {
						console.log(error, "ERROR");
					}
				} else {
					// Create new school
					response = await apiInstance.post("/dev/school/add", payload);

					// Check response status and show appropriate message
					if (response.status === 200 || response.status === 201) {
						toast.success("School created successfully!");

						// Call onSave with the created school data if needed
						if (onSave && typeof onSave === "function") {
							onSave(response.data?.data || formData);
						}

						// Close the form or navigate away
						if (onClose && typeof onClose === "function") {
							onClose();
						} else {
							// Navigate back to schools list
							navigate("/schools", {
								state: { successMessage: "School created successfully!" },
							});
						}
					} else {
						// Handle unexpected success responses
						toast.warning(
							"Request succeeded but with an unexpected response. Please verify the school was created."
						);
					}
				}
			} catch (error) {
				// Handle error cases
				console.error(schoolId ? "Error updating school:" : "Error creating school:", error);

				// Show appropriate error message based on the error response
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					const errorMessage =
						error.response.data?.message ||
						(schoolId
							? "Failed to update school. Please try again."
							: "Failed to create school. Please try again.");
					toast.error(errorMessage);
				} else if (error.request) {
					// The request was made but no response was received
					toast.error("Server did not respond. Please check your connection and try again.");
				} else {
					// Something happened in setting up the request that triggered an Error
					toast.error(
						schoolId
							? "An error occurred while updating the school. Please try again."
							: "An error occurred while creating the school. Please try again."
					);
				}
			} finally {
				setLoading(false);
			}
		} else {
			toast.error("Please fill all required fields");
		}
	};

	if (fetchingSchool) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
				<CircularProgress />
			</Box>
		);
	}

	// Filter function for autocomplete - only shows "Create new" when no partial matches exist
	const filterBlockOptions = (options, params) => {
		if (!params.inputValue) {
			return options;
		}

		const inputValue = params.inputValue.toLowerCase().trim();

		// Check for any partial matches (case-insensitive)
		const partialMatches = options.filter((option) => option.blockName.toLowerCase().includes(inputValue));

		// If we have any partial matches, just return those without adding "Create new"
		if (partialMatches.length > 0) {
			return partialMatches;
		}

		// Check if there's an exact match (case-insensitive)
		const exactMatch = options.some((option) => option.blockName.toLowerCase() === inputValue);

		// Only add "Create new" option if there are no partial matches and no exact match
		if (!exactMatch && inputValue) {
			return [
				{
					blockName: params.inputValue,
					isCreateNew: true,
				},
			];
		}

		return []; // Return empty array if no matches and input is not valid for creation
	};

	// Filter function for cluster autocomplete - only shows "Create new" when no partial matches exist
	const filterClusterOptions = (options, params) => {
		if (!params.inputValue) {
			return options;
		}

		const inputValue = params.inputValue.toLowerCase().trim();

		// Check for any partial matches (case-insensitive)
		const partialMatches = options.filter((option) => option.name.toLowerCase().includes(inputValue));

		// If we have any partial matches, just return those without adding "Create new"
		if (partialMatches.length > 0) {
			return partialMatches;
		}

		// Check if there's an exact match (case-insensitive)
		const exactMatch = options.some((option) => option.name.toLowerCase() === inputValue);

		// Only add "Create new" option if there are no partial matches and no exact match
		if (!exactMatch && inputValue) {
			return [
				{
					name: params.inputValue,
					isCreateNew: true,
				},
			];
		}

		return []; // Return empty array if no matches and input is not valid for creation
	};

	return (
		<Box sx={{ py: 3, px: 1, maxWidth: "700px", margin: "0 auto" }}>
			<h5 className="text-lg font-bold text-[#2F4F4F]">{schoolId ? "Edit School" : "Add New School"}</h5>
			<Typography variant="body1" sx={{ color: "#666", mb: 1 }}>
				{schoolId ? "Update school details below" : "Create a school by filling in the details below"}
			</Typography>

			<Box sx={{ py: 2 }}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
					<Box>
						<TextField
							fullWidth
							label="School Name"
							name="schoolName"
							value={formData.schoolName}
							onChange={handleChange}
							placeholder="Enter school name"
							error={errors.schoolName}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
									height: "48px",
								},
								"& .MuiInputLabel-root": {
									fontSize: "16px",
								},
								"& .MuiInputBase-input": {
									fontSize: "16px",
								},
							}}
						/>
						{errors.schoolName && <FormHelperText error>School name is required</FormHelperText>}
					</Box>

					<Box>
						<TextField
							fullWidth
							label="UDISE Code"
							name="udiseCode"
							value={formData.udiseCode}
							onChange={handleChange}
							placeholder="Enter UDISE code"
							error={errors.udiseCode}
							disabled={!!schoolId}
							type="tel"
							inputProps={{
								maxLength: 11,
								inputMode: "numeric",
							}}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
									height: "48px",
								},
								"& .MuiInputLabel-root": {
									fontSize: "16px",
								},
								"& .MuiInputBase-input": {
									fontSize: "16px",
								},
							}}
						/>
						{errors.udiseCode && <FormHelperText error>UDISE code is required</FormHelperText>}
					</Box>

					<Box className="h-full">
						<Autocomplete
							freeSolo
							options={blocksData}
							filterOptions={filterBlockOptions}
							getOptionLabel={(option) => {
								if (typeof option === "string") {
									return option;
								}
								if (option.isCreateNew) {
									return `Create new: ${option.blockName}`;
								}
								return option.blockName || "";
							}}
							value={formData.blockName || null}
							inputValue={blockInput}
							onInputChange={(event, newInputValue) => {
								setBlockInput(newInputValue);
								// If user is typing manually and blurs the field
								if (!event) {
									const trimmedValue = newInputValue.trim();
									setFormData({
										...formData,
										blockName: trimmedValue,
										clusterName: "",
									});
								}
							}}
							onChange={handleBlockChange}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Block Name"
									placeholder="Search or add new block"
									required
									error={errors.blockName}
									helperText={
										errors.blockName
											? "Block name is required"
											: "Type to search, or select 'Create new' option for a new block"
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
											height: "48px",
										},
										"& .MuiInputLabel-root": {
											fontSize: "16px",
										},
										"& .MuiInputBase-input": {
											fontSize: "16px",
										},
									}}
								/>
							)}
							renderOption={(props, option) => (
								<li
									style={{
										fontSize: "16px",
										fontWeight: option.isCreateNew ? "bold" : "normal",
										color: option.isCreateNew ? "#2F4F4F" : "inherit",
									}}
									{...props}
								>
									{option.isCreateNew
										? `Create new: ${capitalizeFirstLetter(option.blockName)}`
										: capitalizeFirstLetter(option.blockName)}
								</li>
							)}
						/>
					</Box>

					<Box>
						<Autocomplete
							freeSolo
							disabled={!formData.blockName}
							options={availableClusters.length > 0 ? availableClusters : allClusters}
							filterOptions={filterClusterOptions}
							getOptionLabel={(option) => {
								if (typeof option === "string") {
									return option;
								}
								if (option.isCreateNew) {
									return `Create new: ${option.name}`;
								}
								return option.name || "";
							}}
							value={formData.clusterName || null}
							inputValue={clusterInput}
							onInputChange={(event, newInputValue) => {
								setClusterInput(newInputValue);
								// If user is typing manually and blurs the field
								if (!event) {
									const trimmedValue = newInputValue.trim();
									setFormData({
										...formData,
										clusterName: trimmedValue,
									});
								}
							}}
							onChange={handleClusterChange}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Cluster Name"
									placeholder="Search or add new cluster"
									required
									error={errors.clusterName}
									helperText={
										errors.clusterName
											? "Cluster name is required"
											: "Type to search, or select 'Create new' option for a new cluster"
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "8px",
											height: "48px",
										},
										"& .MuiInputLabel-root": {
											fontSize: "16px",
										},
										"& .MuiInputBase-input": {
											fontSize: "16px",
										},
									}}
								/>
							)}
							renderOption={(props, option) => (
								<li
									style={{
										fontSize: "16px",
										fontWeight: option.isCreateNew ? "bold" : "normal",
										color: option.isCreateNew ? "#2F4F4F" : "inherit",
									}}
									{...props}
								>
									{option.isCreateNew
										? `Create new: ${capitalizeFirstLetter(option.name)}`
										: capitalizeFirstLetter(option.name)}
								</li>
							)}
						/>
					</Box>
				</Box>
				<div style={{ display: "flex", justifyContent: "center", marginTop: "65px" }}>
					<ButtonCustom
						text={
							loading
								? schoolId
									? "Updating..."
									: "Creating..."
								: schoolId
								? "Update School"
								: "Create School"
						}
						onClick={handleSubmit}
					/>
				</div>
			</Box>
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
		</Box>
	);
}
