import { createTheme } from "@mui/material";
import { breakpoints } from "./contant";

let theme = createTheme();

theme = createTheme(theme, {
	breakpoints,
	palette: {
		mode: "light",
		default: {
			main: "#FFFFFF",
			light: "#0066FF",
			contrastText: "#ffffff",
		},
		primary: {
			main: "#2F4F4F",
			light: "#D4DAE8",
			dark: "#192954",
			contrastText: "#FFFFFF",
		},

		secondary: {
			main: "#F55C38",
			light: "#EAEDED",
			dark: "#933722",
			contrastText: "#ffffff",
		},

		pink: {
			main: "#F091B2",
			light: "#FCE9F0",
			dark: "#90576B",
			contrastText: "#ffffff",
		},

		typhoon: {
			main: "#049796",
			light: "#CDEAEA",
			dark: "#025B5A",
			contrastText: "#ffffff",
		},

		orange: {
			main: "#FFAD33",
			light: "#FFEFD6",
			dark: "#99681F",
			contrastText: "#2E2E2E",
		},

		twilight: {
			main: "#FFF2F2",
			light: "#FFF7F7",
			dark: "#999191",
			contrastText: "#ffffff",
		},

		error: {
			main: "#F44336",
			light: "#FFE5E3",
			dark: "#C3362B",
			contrastText: "#ffffff",
		},

		success: {
			main: "#219464",
			light: "#E9F5E9",
			dark: "#3A8137",
			contrastText: "#ffffff",
		},

		Grey: {
			main: "#949494",
			light: "#DEDEDE",
			// dark: "#3A8137",
			contrastText: "#ffffff",
		},

		text: {
			primary: "#2F4F4F",
			secondary: "#597272", // Updated to match the specified tab text color
			disabled: "#BDBDBD",
			hint: "#BDBDBD",
		},

		background: {
			default: "#FFFFFF",
			paper: "#FFFFFF",
		},
		black: {
			main: "#2E2E2E",
			contrastText: "#FFFFFF",
		},
		divider: "#949494",
	},

	typography: {
		fontFamily: ["Karla", "sans-serif"].join(","),
		fontSize: 18,
		h5: {
			fontFamily: "Karla",
			fontSize: "2rem",
			fontWeight: 800,
			lineHeight: "130%",
			letterSpacing: 0,
			textAlign: "center",
			[theme.breakpoints.down("sm")]: {
				fontSize: "1.5rem",
			},
		},
		h6: {
			fontFamily: "Karla",
			fontSize: "1.5rem",
			fontWeight: 800,
			lineHeight: "150%",
			letterSpacing: 0,
			textAlign: "center",
			[theme.breakpoints.down("sm")]: {
				fontSize: "1.25rem",
			},
		},
		subtitle1: {
			fontFamily: "Work Sans",
			fontSize: "1.125rem",
			fontWeight: 600,
			lineHeight: "170%",
			letterSpacing: 0,
			color: "#2F4F4F",
			[theme.breakpoints.down("sm")]: {
				fontSize: "1rem",
			},
		},
		subtitle2: {
			fontFamily: "Work Sans",
			marginBottm: "8px",
			fontSize: "0.875rem",
			fontWeight: 600,
			lineHeight: "170%",
			letterSpacing: 0,
			[theme.breakpoints.down("sm")]: {
				fontSize: "1rem",
			},
		},
		body1: {
			fontFamily: "Karla",
			color: "#2F4F4F",
			fontSize: "1.125rem",
			fontWeight: 500,
			lineHeight: "170%",
			letterSpacing: 0,
			[theme.breakpoints.down("sm")]: {
				fontSize: "1rem",
			},
		},
		body2: {
			fontFamily: "Karla",
			color: "#2F4F4F",
			fontSize: "0.875rem",
			fontWeight: 500,
			lineHeight: "170%",
			letterSpacing: 0,
		},
		caption: {
			fontFamily: "Karla",
			fontSize: "0.75rem",
			fontWeight: 500,
			lineHeight: "150%",
			letterSpacing: 0,
		},
		button: {
			fontFamily: "Noto Sans",
			fontSize: "1.125rem",
			fontWeight: 600,
			lineHeight: "170%",
			letterSpacing: 0,
			textTransform: "unset",
			[theme.breakpoints.down("sm")]: {
				fontSize: "1rem",
			},
		},
		ButtonLarge: {
			fontFamily: "Karla",
			fontSize: "1.125rem",
			fontWeight: 700,
			lineHeight: "170%",
			letterSpacing: 1,
			[theme.breakpoints.down("sm")]: {
				fontSize: "1rem",
			},
		},
	},
});

theme.components = {
	MuiButton: {
		styleOverrides: {
			root: {
				minWidth: "max-content",
				height: "48px",
				borderRadius: "100px",
				padding: "8px 16px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: "8px",
			},
		},
	},
	// Add Tab styling
	MuiTab: {
		styleOverrides: {
			root: {
				fontFamily: "Work Sans",
				fontSize: "18px",
				fontStyle: "normal",
				lineHeight: "170%",
				textTransform: "none",
				color: "#597272", // Unselected tab color
				fontWeight: 400,
				minWidth: "unset",
				padding: "12px 2px",
				marginRight: "24px",
				"&.Mui-selected": {
					color: "#2F4F4F", // Selected tab color
					fontWeight: 600,
				},
			},
		},
	},
	// Add Tabs indicator styling
	MuiTabs: {
		styleOverrides: {
			indicator: {
				backgroundColor: "#2F4F4F",
			},
		},
	},

	MuiPaper: {
		styleOverrides: {
			root: {
				padding: theme.spacing(3),
				borderRadius: "8px",
				background: "#FFF",
				boxShadow:
					"0px 1px 2px 0px rgba(47, 79, 79, 0.06), 0px 2px 1px 0px rgba(47, 79, 79, 0.04), 0px 1px 5px 0px rgba(47, 79, 79, 0.08)",
				border: "none",
			},
		},
	},
};

export default theme;
