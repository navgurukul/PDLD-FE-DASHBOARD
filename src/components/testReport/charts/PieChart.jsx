import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const PieChart = ({
  passedCount,
  totalCount,
  percentage,
  primaryColor,
  secondaryColor,
  animation,
  size,
  showAnimation,
  className,
  // New props for multi-segment support
  isMultiSegment = false,
  segmentData = [],
  colors = []
}) => {
  const [hovered, setHovered] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // Animated counter effect for simple pie chart
  useEffect(() => {
    if (isMultiSegment || !showAnimation) {
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
  }, [percentage, showAnimation, isMultiSegment]);

  // Convert angle to (x, y) point in percentage for clip-path
  const getCoordinates = (angle) => {
    const radians = (angle - 90) * (Math.PI / 180); // Rotate to start from top
    const x = 50 + 50 * Math.cos(radians);
    const y = 50 + 50 * Math.sin(radians);
    return `${x}% ${y}%`;
  };

  // Generate points for the clip path
  const generateClipPath = (startAngle, endAngle) => {
    // Start from the center
    let path = "50% 50%, ";

    // Add the first point (start angle)
    path += getCoordinates(startAngle) + ", ";

    // Add intermediate points for a smooth arc
    const step = 5; // Smaller step for smoother curve
    for (let angle = startAngle + step; angle < endAngle; angle += step) {
      path += getCoordinates(angle) + ", ";
    }

    // Add the last point (end angle)
    path += getCoordinates(endAngle) + ", ";

    // Close the path back to center
    path += "50% 50%";

    return `polygon(${path})`;
  };

  // Multi-segment pie chart render
  if (isMultiSegment && segmentData.length > 0) {
    const total = segmentData.reduce((sum, segment) => sum + segment.value, 0);
    let currentAngle = 0;
    
    const segments = segmentData.map((segment, index) => {
      const segmentPercentage = total > 0 ? (segment.value / total) * 100 : 0;
      const segmentAngle = (segmentPercentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      
      currentAngle += segmentAngle;
      
      const clipPath = generateClipPath(startAngle, endAngle);
      const color = colors[index] || `hsl(${(index * 360) / segmentData.length}, 70%, 60%)`;
      
      return {
        ...segment,
        clipPath,
        color,
        percentage: segmentPercentage
      };
    });

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
        data-testid="multi-segment-pie-chart"
      >
        {/* Background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: "#f5f5f5",
            boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.1)`,
          }}
        ></div>

        {/* Render each segment */}
        {segments.map((segment, index) => (
          <div
            key={index}
            className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
            style={{ clipPath: segment.clipPath }}
          >
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ backgroundColor: segment.color }}
            ></div>
          </div>
        ))}

        {/* Inner white circle */}
        <div
          className="absolute rounded-full bg-white transition-all duration-500"
          style={{
            inset: `${size * 0.25}px`,
            boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)`,
            filter: hovered ? `brightness(1.03)` : "none",
          }}
        ></div>

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
  }

  // Original simple pie chart logic
  const angle = (percentage / 100) * 360;
  const clipPath1 = angle <= 180 ? generateClipPath(0, angle) : generateClipPath(0, 180);
  const clipPath2 = angle > 180 ? generateClipPath(180, angle) : "";

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
      {/* Background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: "#F45050",
          boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.1)`,
        }}
      ></div>

      {/* First Segment (0° to angle or 0° to 180°) */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
        style={{ clipPath: clipPath1 }}
      >
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "#228B22" }}></div>
      </div>

      {/* Second Segment (180° to angle, only if > 50%) */}
      {angle > 180 && (
        <div
          className="absolute inset-0 rounded-full overflow-hidden transition-all duration-700"
          style={{ clipPath: clipPath2 }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#228B22" }}
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
  percentage: PropTypes.number,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
  animation: PropTypes.bool,
  size: PropTypes.number,
  showAnimation: PropTypes.bool,
  className: PropTypes.string,
  isMultiSegment: PropTypes.bool,
  segmentData: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })),
  colors: PropTypes.arrayOf(PropTypes.string)
};

PieChart.defaultProps = {
  percentage: 0,
  primaryColor: "#2F4F4F",
  secondaryColor: "#FFEBEB",
  animation: true,
  size: 160,
  showAnimation: true,
  className: "",
  isMultiSegment: false,
  segmentData: [],
  colors: []
};

export default PieChart;