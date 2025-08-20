import { updatePackageListStatus } from "./utils.js";

export async function loadPackageList(state) {
	if (state.packageList && !state.packageListLoading) {
		return state.packageList;
	}

	state.packageListLoading = true;

	try {
		const response = await fetch("data/index.json");
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		state.packageList = data;
		updatePackageListStatus(data);
		return data;
	} catch (e) {
		console.warn("Failed to load package list (data/index.json).", e);
		throw e;
	} finally {
		state.packageListLoading = false;
	}
}

export async function getLatestWinGetVersion() {
	try {
		const response = await fetch(
			"https://api.github.com/repos/microsoft/winget-cli/releases/latest",
		);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data.tag_name.replace("v", "");
	} catch (error) {
		console.warn("Failed to fetch latest WinGet version! ", error);
		return "1.0.0";
	}
}
