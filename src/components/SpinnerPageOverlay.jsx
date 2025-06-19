import { CircularProgress } from "@mui/material";

const SpinnerPageOverlay = ({ isLoading }) => {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 9999999,
			}}
		>
			<CircularProgress size={60} thickness={4} sx={{ color: "#2F4F4F" }} />
		</div>
	);
};

export default SpinnerPageOverlay;
