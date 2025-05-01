import  { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Typography, Box, Radio, RadioGroup, FormControlLabel, Paper } from "@mui/material";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const currentData = payload[0].payload;

  return (
    <Paper
      sx={{
        p: 2,
        border: "1px dashed #c9d6ff", 
        borderRadius: "4px",
        boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
        maxWidth: "300px",
        bgcolor: "#fff",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: "#DCB900",
          fontWeight: "bold",
          mb: 1.5,
        }}
      >
        {label.toUpperCase()}
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 500, color: "#2F4F4F" }}>Average Score</span>
          <span style={{ fontWeight: 500, color: "#2F4F4F" }}>{currentData.overall}%</span>
        </Typography>
      </Box>

      {currentData.totalScore && (
        <Box
          sx={{
            display: "inline-block",
            bgcolor: "#ff6b6b",
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: "4px",
            mb: 1,
            fontWeight: "bold",
          }}
        >
          {currentData.totalScore}
        </Box>
      )}

      <Box
        sx={{
          borderTop: "1px dashed #E0E0E0",
          pt: 1,
          mt: 1,
        }}
      >
        {Object.entries(currentData)
          .filter(([key]) =>
            ["english", "hindi", "mathematics", "science", "socialStudies", "sanskrit"].includes(key)
          )
          .map(([subject, score]) => (
            <Box
              key={subject}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.5,
                borderBottom: subject === "mathematics" ? "1px dashed #E0E0E0" : "none",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: subject === "mathematics" ? "#1976d2" : "text.primary",
                  fontWeight: subject === "mathematics" ? 500 : 400,
                }}
              >
                {subject.charAt(0).toUpperCase() +
                  subject
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim()}
              </Typography>
              <Typography variant="body2">{score}/50</Typography>
            </Box>
          ))}
      </Box>
    </Paper>
  );
};

const AcademicOverviewGraph = ({ chartData }) => {
  const [selectedSubject, setSelectedSubject] = useState("overall");
  const [graphData, setGraphData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle subject change
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  useEffect(() => {
    setGraphData(chartData);
    setIsLoading(false);
  }, [chartData]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: "8px",
        background: "#FFF",
        marginTop: "40px",
        boxShadow:
          "0px 1px 2px 0px rgba(47, 79, 79, 0.06), 0px 2px 1px 0px rgba(47, 79, 79, 0.04), 0px 1px 5px 0px rgba(47, 79, 79, 0.08)",
      }}
    >
      <Box>
        <h5 className="mb-4 text-lg font-bold text-[#2F4F4F]">Academic Overview</h5>

        <RadioGroup row value={selectedSubject} onChange={handleSubjectChange} sx={{ mb: 4 }}>
          <FormControlLabel
            value="overall"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="Overall"
          />
          <FormControlLabel
            value="english"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="English"
          />
          <FormControlLabel
            value="hindi"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="Hindi"
          />
          <FormControlLabel
            value="mathematics"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="Mathematics"
          />
          <FormControlLabel
            value="science"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="Science"
          />
          <FormControlLabel
            value="socialStudies"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="Social Studies"
          />
          <FormControlLabel
            value="sanskrit"
            control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
            label="Sanskrit"
          />
        </RadioGroup>

        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                domain={[0, 100]}
                tickCount={11}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                label={{
                  value: "Scores in Percentage",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#666", fontSize: 12 },
                }}
              />
              <Tooltip
                content={selectedSubject === "overall" ? <CustomTooltip /> : null}
                formatter={(value) => (selectedSubject !== "overall" ? [`${value}%`, "Score"] : value)}
                contentStyle={
                  selectedSubject !== "overall"
                    ? {
                        backgroundColor: "white",
                        border: "1px solid #E0E0E0",
                        borderRadius: "4px",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                      }
                    : null
                }
              />
              <Line
                type="monotone"
                dataKey={selectedSubject}
                stroke="#FFCC00"
                strokeWidth={2}
                dot={{ r: 4, fill: "#FFCC00", strokeWidth: 2, stroke: "#FFCC00" }}
                activeDot={{ r: 6, fill: "#FFCC00", stroke: "white", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
};

export default AcademicOverviewGraph;