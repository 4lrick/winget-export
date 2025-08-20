import { elements, state } from "../app.js";
import { getLatestWinGetVersion } from "../dataFetching.js";
import {
	buildTimestampedFilename,
	findIconElement,
	getWingetISOString,
	showStatus,
	updateIcon,
} from "../utils.js";

export async function buildWingetJson() {
	const packages = Array.from(state.selected.keys()).map((id) => ({
		PackageIdentifier: id,
	}));
	const wingetVersion = await getLatestWinGetVersion();

	return {
		$schema: "https://aka.ms/winget-packages.schema.2.0.json",
		CreationDate: getWingetISOString(),
		Sources: [
			{
				Packages: packages,
				SourceDetails: {
					Argument: "https://cdn.winget.microsoft.com/cache",
					Identifier: "Microsoft.Winget.Source_8wekyb3d8bbwe",
					Name: "winget",
					Type: "Microsoft.PreIndexed.Package",
				},
			},
		],
		WinGetVersion: wingetVersion,
	};
}

export function buildInstallPs1() {
	const ids = Array.from(state.selected.keys());
	const parts = ids.map((id) => `winget install -e --id ${id}`);
	return parts.join(";");
}

export function download(filename, dataStr, mime = "application/json") {
	const blob = new Blob([dataStr], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export async function exportJson() {
	if (state.selected.size === 0) {
		showStatus("No packages selected.", "warning");
		return;
	}
	const data = await buildWingetJson();
	const filename = buildTimestampedFilename("winget-export", "json");
	download(filename, JSON.stringify(data, null, "\t"));
	elements.importCommand.textContent = `winget import --import-file "${filename}"`;
}

export function exportPs1() {
	if (state.selected.size === 0) {
		showStatus("No packages selected.", "warning");
		return;
	}
	const ps1 = buildInstallPs1();
	const ps1Name = buildTimestampedFilename("winget-export", "ps1");
	download(ps1Name, ps1, "application/x-powershell");
}

export async function copyPs1() {
	if (state.selected.size === 0) {
		showStatus("No packages selected.", "warning");
		return;
	}
	const ps1 = buildInstallPs1();
	const copyBtn = document.querySelector(".copy-clipboard");
	if (!copyBtn) return;
	try {
		await navigator.clipboard.writeText(ps1);
		copyBtn.disabled = true;

		const copyIcon = findIconElement(copyBtn);
		if (!copyIcon) return;
		updateIcon(copyIcon, "check");

		setTimeout(() => {
			const checkmarkIcon = findIconElement(copyBtn);
			if (!checkmarkIcon) return;
			updateIcon(checkmarkIcon, "copy");
			copyBtn.disabled = false;
		}, 1000);
	} catch {
		showStatus(
			"Copy failed. Your browser may not permit clipboard access.",
			"error",
		);
	}
}

export function updateCommand() {
	if (state.selected.size === 0) {
		elements.importCommand.textContent =
			'winget import --import-file "winget-export-YYYY-MM-DDTHH_MM_SS_sss-00_00.json"';
		return;
	}
	const filename = buildTimestampedFilename("winget-export", "json");
	elements.importCommand.textContent = `winget import --import-file "${filename}"`;
}

export function setupExportEventListeners() {
	elements.exportJson.addEventListener("click", exportJson);
	elements.exportPs1.addEventListener("click", exportPs1);
	document.querySelector(".copy-clipboard")?.addEventListener("click", copyPs1);
}
