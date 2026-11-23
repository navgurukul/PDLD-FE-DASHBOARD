import { RETURN_TO_KEY } from "../../api";

// The page someone was heading to (or on) when they were sent to the login page, if it suits this
// kind of login: school logins only go back to their own school pages, officers to any other page.
// A read only, so it is safe to call while rendering; AfterLogin clears it once used.
export function peekReturnPath(isSchool) {
	let path = null;
	try {
		path = sessionStorage.getItem(RETURN_TO_KEY);
	} catch {
		return null;
	}
	if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/login")) return null;
	return isSchool === path.startsWith("/my-school") ? path : null;
}

export function clearReturnPath() {
	try {
		sessionStorage.removeItem(RETURN_TO_KEY);
	} catch {
		// nothing to clear
	}
}
