import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const LineChart = ({ data, averageScore, primaryColor }) => {
  const [stats, setStats] = useState({
    mean: 0,
    aboveAvg: 0,
    belowAvg: 0,
    kdeData: [],
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Filter out absent students
    const validStudents = data.filter(
      (student) => !student.isAbsent && student.score !== undefined
    );
    
    if (validStudents.length === 0) return;

    // Use the provided average or calculate it
    const mean = averageScore || 
      Math.round(validStudents.reduce((sum, s) => sum + s.score, 0) / validStudents.length);
    
    // Count students above and below average
    const studentsAbove = validStudents.filter((s) => s.score >= mean);
    const studentsBelow = validStudents.filter((s) => s.score < mean);
    
    // Get all scores for distribution
    const scores = validStudents.map((s) => s.score);
    
    // Simple distribution curve data
    const distributionData = generateDistributionData(scores, mean);

    setStats({
      mean,
      aboveAvg: studentsAbove.length,
      belowAvg: studentsBelow.length,
      kdeData: distributionData,
    });
  }, [data, averageScore]);

  // Generate a smooth distribution curve
  const generateDistributionData = (scores, mean) => {
    const min = 0;
    const max = 100;
    const points = 50;
    const step = (max - min) / points;
    const bandwidth = 8; // Controls smoothness
    
    const result = [];
    for (let x = min; x <= max; x += step) {
      let density = 0;
      for (const score of scores) {
        const z = (x - score) / bandwidth;
        density += Math.exp(-0.5 * z * z);
      }
      
      // Scale for visibility
      density = density * 100 / scores.length;
      
      result.push({
        score: x,
        density: density,
      });
    }
    
    return result;
  };

  // Custom tooltip that shows how many students around this score
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const score = Math.round(payload[0].payload.score);
      // Find students within ±5 points of this score
      const range = 5;
      const studentsInRange = data
        .filter(s => !s.isAbsent && s.score !== undefined)
        .filter(s => Math.abs(s.score - score) <= range)
        .length;
      
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="text-sm font-bold">{`Score: ${score}`}</p>
          <p className="text-xs">{`${studentsInRange} students around this score`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {/* Average and Count Header */}
      <div className="mb-2 text-center">
        <div className="font-medium text-lg">
          Class Average: <span className="font-bold">{stats.mean}</span>
        </div>
        <div className="flex justify-center mt-1 space-x-8">
          <div className="text-center">
            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded font-medium">
              {stats.belowAvg} students below average
            </span>
          </div>
          <div className="text-center">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
              {stats.aboveAvg} students above average
            </span>
          </div>
        </div>
      </div>

      {/* Simple Distribution Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={stats.kdeData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="score"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            label={{ value: "Score", position: "insideBottom", offset: -10 }}
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
            fill="url(#colorDensity)"
            strokeWidth={2}
          />
          
          {/* Average score line */}
          <ReferenceLine
            x={stats.mean}
            stroke="#FF4444"
            strokeWidth={2}
            label={{
              position: "top",
              value: `Average: ${stats.mean}`,
              fill: "#FF4444",
              fontSize: 12,
              fontWeight: "bold"
            }}
          />
          
          {/* Pass threshold line */}
          <ReferenceLine
            x={33}
            stroke="#FF9800"
            strokeDasharray="3 3"
            label={{
              position: "insideBottomRight",
              value: "Pass: 33",
              fill: "#FF9800",
              fontSize: 12
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Bottom Stats */}
      <div className="flex justify-center space-x-4 text-sm mt-4">
        <div className="px-3 py-2 bg-red-50 rounded-full text-red-800">
          <span className="font-bold">{stats.belowAvg}</span> below average 
          ({Math.round((stats.belowAvg / (stats.aboveAvg + stats.belowAvg) * 100))}%)
        </div>
        <div className="px-3 py-2 bg-green-50 rounded-full text-green-800">
          <span className="font-bold">{stats.aboveAvg}</span> above average
          ({Math.round((stats.aboveAvg / (stats.aboveAvg + stats.belowAvg) * 100))}%)
        </div>
      </div>
    </div>
  );
};

export default LineChart;