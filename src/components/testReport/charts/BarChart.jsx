import { useState } from "react";
import PropTypes from "prop-types";

const BarChart = ({
	data,
	primaryColor = "#2F4F4F",  
	height = 200,
	showValues = true,
	className = "",
}) => {
	const [hoveredIndex, setHoveredIndex] = useState(null);

	// Find the maximum value for scaling
	const maxValue = Math.max(...data.map((d) => d.value), 1);

	return (
		<div
			className={`bar-chart-container relative ${className}`}
			style={{
				height: `${height}px`,
				width: "100%",
				paddingBottom: "30px", // Make space for labels
			}}
		>
			{/* Grid lines */}
			<div className="absolute left-0 right-0 top-0 bottom-8 flex flex-col justify-between">
				{[4, 3, 2, 1, 0].map((_, i) => (
					<div
						key={i}
						className="w-full border-t border-gray-200"
						style={{ borderStyle: i > 0 ? "dashed" : "solid" }}
					/>
				))}
			</div>

			{/* Y-axis values */}
			<div className="absolute top-0 right-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 pr-1">
				{[4, 3, 2, 1, 0].map((i) => {
					// Calculate the actual value based on maxValue
					const value = Math.round((maxValue * i) / 4);
					return (
						<div key={i} className="flex items-center h-6 -mt-3">
							{value}
						</div>
					);
				})}
			</div>

			{/* Container for all bars */}
			<div className="absolute left-2 right-6 bottom-8 top-0 flex items-end justify-between">
				{data.map((item, index) => {
					// Calculate the height percentage
					const barHeight = item.value > 0 ? (item.value / maxValue) * 100 : 0;

					return (
						<div
							key={index}
							className="flex flex-col items-center justify-end h-full"
							style={{ width: `${100 / data.length - 4}%` }}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							{/* Tooltip */}
							{showValues && hoveredIndex === index && (
								<div
									className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow"
									style={{
										bottom: `calc(${barHeight}% + 8px)`,
									}}
								>
									{item.value} students
								</div>
							)}

							{/* The bar - solid color with no highlight */}
							<div
								className="w-full rounded-t transition-all duration-300 ease-in-out"
								style={{
									height: `${barHeight}%`,
									minHeight: item.value > 0 ? "2px" : "0",
									backgroundColor: primaryColor,
									transform: hoveredIndex === index ? "scaleY(1.03)" : "scaleY(1)",
									transformOrigin: "bottom",
									boxShadow: hoveredIndex === index ? `0 0 8px ${primaryColor}66` : "none",
								}}
							>
							</div>

							{/* Always visible value on top of the bar */}
							{item.value > 0 && (
								<div
									className="absolute text-xs font-medium transition-all duration-300"
									style={{
										bottom: `calc(${barHeight}% + 4px)`,
										color: hoveredIndex === index ? primaryColor : "#666",
									}}
								>
									{item.value}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* X-axis labels */}
			<div className="absolute left-0 right-0 bottom-0 flex justify-between px-2">
				{data.map((item, index) => (
					<div
						key={index}
						className="text-center text-xs font-medium transition-all duration-300"
						style={{
							color: hoveredIndex === index ? primaryColor : "#4a5568",
							width: `${100 / data.length}%`,
						}}
					>
						{item.label}
					</div>
				))}
			</div>
		</div>
	);
};

BarChart.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.number.isRequired,
		})
	).isRequired,
	primaryColor: PropTypes.string,
	height: PropTypes.number,
	showValues: PropTypes.bool,
	className: PropTypes.string,
};

export default BarChart;