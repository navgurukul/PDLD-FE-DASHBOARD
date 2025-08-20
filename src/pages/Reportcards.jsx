// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent, Typography, Button } from "@mui/material";

// const Reportcards = () => {
//   const navigate = useNavigate();

//   return (
//     <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
//       {/* Card for School Performance Reports */}
//       <Card style={{ width: "300px", cursor: "pointer" }} onClick={() => navigate("/SchoolPerformanceReports")}>
//         <CardContent>
//           <Typography variant="h5" component="div">
//             School Performance Reports
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Click to view school performance reports.
//           </Typography>
//         </CardContent>
//       </Card>

//       {/* Card for Enrollment Reports */}
//       <Card style={{ width: "300px", cursor: "pointer" }} onClick={() => navigate("/EnrollmentReports")}>
//         <CardContent>
//           <Typography variant="h5" component="div">
//             Enrollment Reports
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Click to view enrollment reports.
//           </Typography>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Reportcards;



import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Box } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";

const Reportcards = () => {
  const navigate = useNavigate();

  const cardData = [
    {
      title: "School Performance Reports",
      description: "Click to view school performance reports.",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      route: "/reports/SchoolPerformanceReports",
    },
    {
      title: "Enrollment Reports",
      description: "Click to view enrollment reports.",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      route: "/reports/EnrollmentReports",
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Heading */}
      <Typography
  variant="h4"
  fontWeight="bold"
  mb={1}
  sx={{
    color: "#2F4F4F",
    fontFamily: "'Philosopher', sans-serif",
  }}
>
  Reports Dashboard
</Typography>
<Typography variant="subtitle1" color="text.secondary" mb={6}>
  Track school performance and enrollment insights.
</Typography>

      {/* Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 3,
        }}
      >
        {cardData.map((card, index) => (
         <Card
  key={index}
  onClick={() => navigate(card.route)}
  sx={{
    p: 2,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 2,
    borderRadius: 3,
    boxShadow: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: 4,
      transform: "translateY(-4px)",
      "& .iconWrapper": {
        bgcolor: "orange",   // ✅ only bg changes
      },
    },
  }}
>
  {/* Icon with default background */}
  <Box
    className="iconWrapper"
    sx={{
      p: 2,
      borderRadius: "50%",
      bgcolor: "grey.100",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    }}
  >
    {card.icon}
  </Box>


            <CardContent sx={{ p: 0 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Reportcards;
