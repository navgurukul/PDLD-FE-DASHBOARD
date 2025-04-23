import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const PieChart = ({ percentage, primaryColor, secondaryColor, animation, size, showAnimation, className }) => {
	const [hovered, setHovered] = useState(false);
	const [displayPercentage, setDisplayPercentage] = useState(0);

	// Generate unique IDs for gradients
	const primaryGradientId = `primaryGradient-${Math.random().toString(36).substring(2, 9)}`;
	const secondaryGradientId = `secondaryGradient-${Math.random().toString(36).substring(2, 9)}`;
	const shadowId = `shadow-${Math.random().toString(36).substring(2, 9)}`;

	// Calculate pie chart angles based on percentage
	const angle = (percentage / 100) * 360;

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

			// Use easeOutQuart for smooth animation
			const easeProgress = 1 - Math.pow(1 - progress, 4);
			const current = Math.round(easeProgress * end);

			setDisplayPercentage(current);

			if (progress === 1) {
				clearInterval(timer);
			}
		}, 16);

		return () => clearInterval(timer);
	}, [percentage, showAnimation]);

	return (
		<div
			className={`relative mx-auto transition-all duration-500 ${className}`}
			style={{
				width: `${size}px`,
				height: `${size}px`,
				transform: animation && hovered ? "scale(1.05)" : "scale(1)",
				filter: hovered ? `drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))` : "none",
			}}
			onMouseEnter={() => animation && setHovered(true)}
			onMouseLeave={() => animation && setHovered(false)}
			data-testid="pie-chart"
		>
			{/* SVG Definitions */}
			<svg width="0" height="0" className="absolute">
				<defs>
					{/* Primary color solid fill (no gradient to avoid artifacts) */}
					<linearGradient id={primaryGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
						<stop offset="100%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
					</linearGradient>

					{/* Secondary color solid fill (no gradient to avoid artifacts) */}
					<linearGradient id={secondaryGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
						<stop offset="100%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
					</linearGradient>

					{/* Filter for inner shadow */}
					<filter id={shadowId}>
						<feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
					</filter>
				</defs>
			</svg>

			{/* Background circle (representing the secondary/fail portion) */}
			<div
				className="absolute inset-0 rounded-full transition-all duration-500"
				style={{
					backgroundColor: secondaryColor,
					boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.1)`,
				}}
			></div>

			{/* First segment (0° to 180° or percentage equivalent) */}
			<div
				className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
				style={{
					clipPath: `polygon(50% 50%, 50% 0, ${
						angle <= 180
							? `${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${
									50 - 50 * Math.cos((angle * Math.PI) / 180)
							  }%`
							: "100% 0, 100% 100%, 0 100%, 0 0"
					}, 50% 50%)`,
				}}
			>
				<div
					className="absolute inset-0 rounded-full transition-all duration-700"
					style={{
						backgroundColor: primaryColor,
					}}
				></div>
			</div>

			{/* Second segment (180° to 360° if percentage > 50%) */}
			{angle > 180 && (
				<div
					className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
					style={{
						clipPath: `polygon(50% 50%, 100% 0, 100% 100%, ${50 + 50 * Math.sin(((angle - 180) * Math.PI) / 180)}% ${
							50 + 50 * Math.cos(((angle - 180) * Math.PI) / 180)
						}%, 50% 50%)`,
					}}
				>
					<div
						className="absolute inset-0 rounded-full transition-all duration-700"
						style={{
							backgroundColor: primaryColor,
						}}
					></div>
				</div>
			)}

			{/* Center white circle with shadow effect */}
			<div
				className="absolute rounded-full bg-white transition-all duration-500"
				style={{
					inset: `${size * 0.2}px`,
					boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)`,
					filter: hovered ? `brightness(1.03)` : "none",
				}}
			></div>

			{/* Percentage text with animated counter */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span
					className="font-bold transition-all duration-300"
					style={{
						fontSize: `${size * 0.18}px`,
						color: hovered ? primaryColor : "#333",
						textShadow: hovered ? `0 0 5px rgba(255, 255, 255, 0.8)` : "none",
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

			{/* Optional glowing effect when hovered */}
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
	primaryColor: "#2F4F4F", // Dark slate gray (theme color)
	secondaryColor: "#FFEBEB", // Light pink for "Needs Improvement"
	animation: true,
	size: 160, // Default size in pixels
	showAnimation: true,
	className: "",
};

export default PieChart;