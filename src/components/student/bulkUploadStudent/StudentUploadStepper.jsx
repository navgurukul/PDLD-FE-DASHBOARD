import React from 'react';
import { Stepper, Step, StepLabel, Box } from '@mui/material';

const StudentUploadStepper = ({ activeStep }) => {
  // Define steps for the upload process
  const steps = ['Upload CSV', 'Map Columns', 'Upload Data'];

  return (
    <Box sx={{ mb: 4 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StudentUploadStepper;