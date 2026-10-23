import PropTypes from "prop-types";
import { FormControl, Select, MenuItem, Chip } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { getAcademicYearStart, getAcademicYearStarts, formatAcademicYear } from "../utils/academicYear";

export const ALL_YEARS = "all";
export const CUSTOM_DATES = "custom";

// Academic year dropdown shared by the Tests list, reports and the student profile.
// value is a start year (2026 = 2026-27), ALL_YEARS, or CUSTOM_DATES (shown when a date range overrides the year).
const AcademicYearSelect = ({ value, onChange, includeAll = false, disabled = false, minWidth = 230 }) => {
  const currentStart = getAcademicYearStart();

  const renderValue = (selected) => {
    if (selected === ALL_YEARS) return "All academic years";
    if (selected === CUSTOM_DATES) return "Custom dates";
    return `Academic Year ${formatAcademicYear(selected)}`;
  };

  return (
    <FormControl size="small" sx={{ minWidth }} disabled={disabled}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value === ALL_YEARS ? ALL_YEARS : Number(e.target.value))}
        renderValue={renderValue}
        inputProps={{ "aria-label": "Academic year" }}
        startAdornment={<CalendarMonthOutlinedIcon sx={{ color: "#2F4F4F", fontSize: 20, mr: 1 }} />}
        MenuProps={{ PaperProps: { sx: { borderRadius: "8px", mt: 0.5 } } }}
        sx={{
          height: "48px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          color: "#2F4F4F",
          fontWeight: 500,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "lightgrey" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2F4F4F" },
        }}
      >
        {getAcademicYearStarts().map((startYear) => (
          <MenuItem key={startYear} value={startYear} sx={{ gap: 1 }}>
            {formatAcademicYear(startYear)}
            {startYear === currentStart && (
              <Chip label="Current" size="small" sx={{ height: 20, fontSize: 12, bgcolor: "#EAEDED", color: "#2E7D32" }} />
            )}
          </MenuItem>
        ))}
        {includeAll && <MenuItem value={ALL_YEARS}>All academic years</MenuItem>}
        {/* Only shown as the selected value; not offered as a choice */}
        {value === CUSTOM_DATES && (
          <MenuItem value={CUSTOM_DATES} sx={{ display: "none" }}>
            Custom dates
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

AcademicYearSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([ALL_YEARS, CUSTOM_DATES])]).isRequired,
  onChange: PropTypes.func.isRequired,
  includeAll: PropTypes.bool,
  disabled: PropTypes.bool,
  minWidth: PropTypes.number,
};

export default AcademicYearSelect;
