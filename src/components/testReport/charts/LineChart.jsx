import React, { useState, useEffect } from "react";
import {
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
	Legend,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";

const LineChart = ({ data, averageScore, primaryColor }) => {
	const [stats, setStats] = useState({
		mean: averageScore,
		median: 0,
		mode: [],
		aboveAvg: 0,
		belowAvg: 0,
		kdeData: [],
	});

	useEffect(() => {
		if (!data || data.length === 0) return;

		// Calculate statistics
		const scores = data.map((student) => student.score).sort((a, b) => a - b);

		// Median
		const mid = Math.floor(scores.length / 2);
		const median = scores.length % 2 === 0 ? (scores[mid - 1] + scores[mid]) / 2 : scores[mid];

		// Mode
		const scoreCount = {};
		let maxCount = 0;
		let mode = [];

		scores.forEach((score) => {
			scoreCount[score] = (scoreCount[score] || 0) + 1;
			if (scoreCount[score] > maxCount) {
				maxCount = scoreCount[score];
				mode = [score];
			} else if (scoreCount[score] === maxCount) {
				mode.push(score);
			}
		});

		// Generate kernel density estimate for a smooth curve
		const bandwidth = 5;
		// Ensure we show the full range from 0-100 for better visualization
		const min = 0;
		const max = 100;
		const points = 100;
		const step = (max - min) / points;

		const kdeData = [];
		for (let x = min; x <= max; x += step) {
			let sum = 0;
			for (let i = 0; i < scores.length; i++) {
				// Gaussian kernel
				const z = (x - scores[i]) / bandwidth;
				sum += Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
			}
			sum /= scores.length;
			kdeData.push({ score: x, density: sum });
		}

		// Calculate students above and below mean
		const aboveAvg = data.filter((s) => s.score >= averageScore).length;
		const belowAvg = data.filter((s) => s.score < averageScore).length;

		setStats({
			mean: averageScore,
			median,
			mode,
			aboveAvg,
			belowAvg,
			kdeData,
		});
	}, [data, averageScore]);

	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
					<p className="text-sm font-semibold">{`Score: ${parseFloat(payload[0].payload.score).toFixed(
						1
					)}`}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="w-full h-full">
			<ResponsiveContainer width="100%" height="90%">
				<AreaChart data={stats.kdeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="score"
						domain={[0, 100]}
						type="number"
						tickCount={6}
						ticks={[15, 30, 45, 60, 75, 100]}
						label={{ value: "Score", position: "insideBottom", offset: -5 }}
					/>
					<YAxis hide />
					<Tooltip content={<CustomTooltip />} />
					<defs>
						<linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
							<stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
						</linearGradient>
					</defs>
					<Area
						type="monotone"
						dataKey="density"
						stroke={primaryColor}
						fillOpacity={1}
						fill="url(#colorDensity)"
						name="Score Distribution"
					/>

					{/* Mean reference line */}
					<ReferenceLine
						x={stats.mean}
						stroke="red"
						strokeWidth={2}
						label={{
							value: `Average: ${stats.mean}`,
							position: "top",
							fill: "red",
							fontSize: 12,
							offset: 8,
						}}
					/>

					{/* Median reference line */}
					{/* <ReferenceLine
						x={stats.median}
						stroke="blue"
						strokeWidth={2}
						strokeDasharray="5 5"
						label={{
							value: `Median: ${stats.median}`,
							position: "top",
							fill: "blue",
							fontSize: 12,
						}}
					/> */}

					{/* Mode reference line(s) - only show if we have a mode */}
					{/* {stats.mode.length > 0 && (
						<ReferenceLine
							x={stats.mode[0]}
							stroke="green"
							strokeWidth={2}
							strokeDasharray="3 3"
							label={{
								value: `Mode: ${stats.mode.join(", ")}`,
								position: "bottom",
								fill: "green",
								fontSize: 12,
								offset: 20,
							}}
						/>
					)} */}

					<Legend />
				</AreaChart>
			</ResponsiveContainer>

			{/* Stats display */}
			<div className="flex justify-between text-sm mt-2 px-4">
				<div className="text-red-500">Below Average: {stats.belowAvg} students</div>
				<div className="text-green-500">Above Average: {stats.aboveAvg} students</div>
			</div>

			{/* Hidden element to help debug - you can remove this after confirming it works */}
			<div className="hidden">
				Mean: {stats.mean}, Median: {stats.median}, Mode: {stats.mode.join(", ")}
			</div>
		</div>
	);
};

export default LineChart;
