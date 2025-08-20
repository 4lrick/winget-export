import { state } from "../app.js";
import { loadPackageList } from "../dataFetching.js";
import { renderResults } from "../resultsSection/results.js";
import {
	restoreSelectedIdsFromUrl,
	syncSelectedIdsToUrl,
} from "../urlHandling.js";
import { updateCommand } from "./exportHandling.js";
import { renderSelected } from "./selectedRendering.js";

export function addSelected(pkg) {
	if (!pkg?.PackageIdentifier) return;
	if (!state.selected.has(pkg.PackageIdentifier)) {
		state.selected.set(pkg.PackageIdentifier, pkg);
		renderSelected();
		updateCommand();
		syncSelectedIdsToUrl(state.selected);
	}
}

export function removeSelected(id) {
	state.selected.delete(id);
	renderSelected();
	updateCommand();
	syncSelectedIdsToUrl(state.selected);
	renderResults();
}

export function clearSelected() {
	state.selected.clear();
	renderSelected();
	updateCommand();
	syncSelectedIdsToUrl(state.selected);
	renderResults();
}

export async function restoreSelectedPackagesFromUrl() {
	const ids = restoreSelectedIdsFromUrl();

	state.selected.clear();

	for (const id of ids) {
		state.selected.set(id, { PackageIdentifier: id, Name: id });
	}

	renderSelected();
	updateCommand();
	await hydrateSelectedFromIndex();
	renderResults();
}

export async function hydrateSelectedFromIndex() {
	if (state.selected.size === 0) return;
	await loadPackageList(state);
	const map = new Map(
		(state.packageList?.items || []).map((p) => [
			String(p.PackageIdentifier || "").toLowerCase(),
			p,
		]),
	);
	let changed = false;
	for (const id of Array.from(state.selected.keys())) {
		const pkg = map.get(id.toLowerCase());
		if (pkg) {
			state.selected.set(id, pkg);
			changed = true;
		}
	}
	if (changed) renderSelected();
}

export function setupSelectedEventListeners() {
	document
		.querySelector(".clear-selected")
		?.addEventListener("click", clearSelected);
}
