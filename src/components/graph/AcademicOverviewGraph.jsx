import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Typography, Box, Radio, RadioGroup, FormControlLabel, Paper } from "@mui/material";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const currentData = payload[0].payload;

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: "4px",
        boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
        maxWidth: "300px",
        width: "276px",
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
        {currentData.fullMonthLabel ? currentData.fullMonthLabel.toUpperCase() : ""}
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
          pt: 1,
          mt: 1,
        }}
      >
        {Object.entries(currentData)
          .filter(
            ([key]) =>
              key !== "month" &&
              key !== "totalScore" &&
              key !== "overall" &&
              key !== "fullMonthLabel" &&
              !key.endsWith("_raw")
          )
          .map(([subject, score]) => {
            const raw = currentData[`${subject}_raw`];
            return (
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
                <Typography variant="body2">
                  {raw ? `${raw.score}/${raw.maxScore}` : score}
                </Typography>
              </Box>
            );
          })}
      </Box>
    </Paper>
  );
};

const SubjectTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const currentData = payload[0].payload;
  const subject = payload[0].dataKey;
  const raw = currentData[`${subject}_raw`];

  // Aggregate percentage calculation
  let aggregate = "-";
  if (raw && raw.maxScore > 0) {
    aggregate = Math.round((raw.score / raw.maxScore) * 100);
  }

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: "4px",
        boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
        width: "266px",
        bgcolor: "#fff",
      }}
    >
      <div
        style={{
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          color: "#CCAC00",
          marginBottom: 8,
        }}
      >
        {currentData.fullMonthLabel ? currentData.fullMonthLabel.toUpperCase() : ""}
      </div>
      {/* Aggregate Percentage Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          color: "#2F4F4F",
          marginBottom: 8,
        }}
      >
        <span>Aggregate Percentage</span>
        <span>{aggregate !== "-" ? `${aggregate}%` : "-"}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          color: "#2F4F4F",
        }}
      >
        <span>Score</span>
        <span>{raw ? `${raw.score}/${raw.maxScore}` : payload[0].value + "%"}</span>
      </div>
    </Paper>
  );
};

const transformStudentDataForGraph = (studentData) => {
  if (!studentData || !studentData.academic || !studentData.academic.months) {
    return [];
  }

  return studentData.academic.months.map((monthData) => {
    // Initialize with month
    let year = "";
    let fullYear = "";
    const firstTestWithDate = monthData.tests.find((t) => t.testDate);
    if (firstTestWithDate) {
      const dateObj = new Date(firstTestWithDate.testDate); // 👈 yeh line add karo
      year = dateObj.getFullYear().toString().slice(-2); // 2 digit for X-axis
      fullYear = dateObj.getFullYear().toString(); // full year for tooltip
    }
    const monthLabel = year ? `${monthData.month} ${year}` : monthData.month;
    const fullMonthLabel = fullYear ? `${monthData.month} ${fullYear}` : monthData.month;
    const monthObj = { month: monthLabel, fullMonthLabel };
    // Track scores for each subject
    const subjectScores = {};
    const subjectCounts = {};
    const subjectRawScores = {};

    // Process each test in the month
    monthData.tests.forEach((test) => {
      if (test.testType === "SYLLABUS" && test.score !== null) {
        // Normalize subject name (lowercase, no spaces)
        const subject = test.subject.toLowerCase().replace(/\s+/g, "");

        // Initialize if first encounter
        if (!subjectScores[subject]) {
          subjectScores[subject] = 0;
          subjectCounts[subject] = 0;
          subjectRawScores[subject] = { score: 0, maxScore: 0 };
        }

        // Calculate percentage score
        const normalizedScore = (test.score / test.maxScore) * 100;

        // Add to totals
        subjectScores[subject] += normalizedScore;
        subjectCounts[subject]++;

        subjectRawScores[subject].score += test.score;
        subjectRawScores[subject].maxScore += test.maxScore;
      }
    });

    // Calculate average for each subject
    Object.keys(subjectScores).forEach((subject) => {
      monthObj[subject] = Math.round(subjectScores[subject] / subjectCounts[subject]);
      // Add raw score/maxScore for tooltip
      monthObj[`${subject}_raw`] = {
        score: subjectRawScores[subject].score,
        maxScore: subjectRawScores[subject].maxScore,
      };
    });

    // Calculate overall average
    let totalScore = 0,
      totalTests = 0;
    Object.values(subjectScores).forEach((score, index) => {
      totalScore += score;
      totalTests += Object.values(subjectCounts)[index];
    });

    monthObj.overall = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

    return monthObj;
  });
};

const AcademicOverviewGraph = ({ studentData }) => {
  const [selectedSubject, setSelectedSubject] = useState("overall");
  const [graphData, setGraphData] = useState([]);

  const [availableSubjects, setAvailableSubjects] = useState(["overall"]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle subject change
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  useEffect(() => {
    if (studentData && studentData.academic && studentData.academic.months) {
      // Discover all subjects
      const subjects = new Set();
      subjects.add("overall"); // Always include overall

      // Find all subjects in the student data
      studentData.academic.months.forEach((monthData) => {
        monthData.tests.forEach((test) => {
          if (test.testType === "SYLLABUS" && test.score !== null) {
            // Normalize subject names
            const subject = test.subject.toLowerCase().replace(/\s+/g, "");
            subjects.add(subject);
          }
        });
      });

      // Store available subjects array
      setAvailableSubjects(Array.from(subjects));

      // Transform the data using our function
      const transformedData = transformStudentDataForGraph(studentData);
      setGraphData(transformedData);
    } else {
      setAvailableSubjects(["overall"]);
      setGraphData([]);
    }
    setIsLoading(false);
  }, [studentData]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  const formatSubjectName = (subject) => {
    if (subject === "overall") return "Overall";
    return subject
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

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
        <h5
          className="mb-4 text-[#2F4F4F]"
          style={{ fontFamily: "Philosopher", fontWeight: "700", fontSize: "24px" }}
        >
          Academic Overview
        </h5>

        <RadioGroup row value={selectedSubject} onChange={handleSubjectChange} sx={{ mb: 4 }}>
          {/* Dynamic radio buttons based on available subjects */}
          {availableSubjects.map((subject) => (
            <FormControlLabel
              key={subject}
              value={subject}
              control={<Radio sx={{ color: "#2F4F4F", "&.Mui-checked": { color: "#2F4F4F" } }} />}
              label={formatSubjectName(subject)}
            />
          ))}
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
              tickFormatter={(value) => `${value}%`}
              <YAxis
                domain={[0, 100]}
                tickCount={11}
                interval={0}
                allowDataOverflow={false}
                allowDecimals={false}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                tickFormatter={(value) => `${value}%`} // ✅ Yahan likho
                label={{
                  value: "Scores in Percentage",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#666", fontSize: 12 },
                }}
              />
              <Tooltip
                content={selectedSubject === "overall" ? <CustomTooltip /> : <SubjectTooltip />}
                contentStyle={null}
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
