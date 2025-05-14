import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const PieChart = ({
	percentage,
	primaryColor,
	secondaryColor,
	animation,
	size,
	showAnimation,
	className,
}) => {
	const [hovered, setHovered] = useState(false);
	const [displayPercentage, setDisplayPercentage] = useState(0);

	// Animated counter effect
	useEffect(() => {
		if (!showAnimation) {
			setDisplayPercentage(percentage);
			return;
		}

		let start = 0;
		const end = percentage;
		const duration = 1500;
		const startTime = Date.now();

		const timer = setInterval(() => {
			const timeElapsed = Date.now() - startTime;
			const progress = Math.min(timeElapsed / duration, 1);
			const easeProgress = 1 - Math.pow(1 - progress, 4);
			const current = Math.round(easeProgress * end);
			setDisplayPercentage(current);
			if (progress === 1) clearInterval(timer);
		}, 16);

		return () => clearInterval(timer);
	}, [percentage, showAnimation]);

	// Convert angle to (x, y) point in percentage for clip-path
	const getCoordinates = (angle) => {
		const radians = (angle - 90) * (Math.PI / 180); // Rotate to start from top
		const x = 50 + 50 * Math.cos(radians);
		const y = 50 + 50 * Math.sin(radians);
		return `${x}% ${y}%`;
	};

	const angle = (percentage / 100) * 360;
	const clipPath1 =
		angle <= 180
			? `polygon(50% 50%, 50% 0%, ${getCoordinates(angle)}, 50% 50%)`
			: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${getCoordinates(angle)}, 50% 50%)`;

	const clipPath2 =
		angle > 180
			? `polygon(50% 50%, 100% 0%, 100% 100%, ${getCoordinates(angle)}, 50% 50%)`
			: "";

	return (
		<div
			className={`relative mx-auto transition-all duration-500 ${className}`}
			style={{
				width: `${size}px`,
				height: `${size}px`,
				transform: animation && hovered ? "scale(1.05)" : "scale(1)",
				filter: hovered
					? `drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))`
					: "none",
			}}
			onMouseEnter={() => animation && setHovered(true)}
			onMouseLeave={() => animation && setHovered(false)}
			data-testid="pie-chart"
		>
			{/* Background */}
			<div
				className="absolute inset-0 rounded-full"
				style={{
					backgroundColor: secondaryColor,
					boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.1)`,
				}}
			></div>

			{/* First Segment */}
			<div
				className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
				style={{ clipPath: clipPath1 }}
			>
				<div
					className="absolute inset-0 rounded-full"
					style={{ backgroundColor: primaryColor }}
				></div>
			</div>

			{/* Second Segment (only for > 180) */}
			{angle > 180 && (
				<div
					className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
					style={{ clipPath: clipPath2 }}
				>
					<div
						className="absolute inset-0 rounded-full"
						style={{ backgroundColor: primaryColor }}
					></div>
				</div>
			)}

			{/* Inner white circle */}
			<div
				className="absolute rounded-full bg-white transition-all duration-500"
				style={{
					inset: `${size * 0.2}px`,
					boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)`,
					filter: hovered ? `brightness(1.03)` : "none",
				}}
			></div>

			{/* Text */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span
					className="font-bold transition-all duration-300"
					style={{
						fontSize: `${size * 0.18}px`,
						color: hovered ? primaryColor : "#333",
						textShadow: hovered
							? `0 0 5px rgba(255, 255, 255, 0.8)`
							: "none",
					}}
				>
					{displayPercentage}%
				</span>
				<span
					className="text-gray-400 transition-all duration-300"
					style={{
						fontSize: `${size * 0.05}px`,
						opacity: hovered ? 1 : 0.7,
						transform: `translateY(${size * 0.02}px)`,
					}}
				>
					{percentage >= 50 ? "ACHIEVED TARGET" : "NEEDS IMPROVEMENT"}
				</span>
			</div>

			{/* Glowing effect */}
			{hovered && (
				<div
					className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-500"
					style={{
						background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
						opacity: 0.6,
					}}
				></div>
			)}
		</div>
	);
};

PieChart.propTypes = {
	percentage: PropTypes.number.isRequired,
	primaryColor: PropTypes.string,
	secondaryColor: PropTypes.string,
	animation: PropTypes.bool,
	size: PropTypes.number,
	showAnimation: PropTypes.bool,
	className: PropTypes.string,
};

PieChart.defaultProps = {
	percentage: 0,
	primaryColor: "#2F4F4F",
	secondaryColor: "#FFEBEB",
	animation: true,
	size: 160,
	showAnimation: true,
	className: "",
};

export default PieChart;
