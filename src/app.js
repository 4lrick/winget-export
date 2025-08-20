import { setupSearchEventListeners } from "./resultsSection/results.js";
import {
	showFilteredPackages,
	showUnfilteredPackages,
} from "./resultsSection/resultsFiltering.js";
import { setupExportEventListeners } from "./selectedSection/exportHandling.js";
import {
	restoreSelectedPackagesFromUrl,
	setupSelectedEventListeners,
} from "./selectedSection/selectedStateManagement.js";
import {
	restoreSearchFromUrl,
	setupBrowserHistoryHandling,
} from "./urlHandling.js";
import { $, PAGE_SIZE, setupIcons, setupThemeToggle } from "./utils.js";

export const state = {
	query: "",
	results: [],
	selected: new Map(),
	listOffset: 0,
	hasMore: false,
	searchVisibleCount: PAGE_SIZE,
	packageList: null,
	packageListLoading: false,
};

export const elements = {
	search: $("#searchInput"),
	results: $("#results"),
	selectedList: $("#selectedList"),
	selectedCount: $("#selectedCount"),
	exportJson: $("#exportJson"),
	exportPs1: $("#exportPs1"),
	importCommand: $("#importCommand"),
	lastUpdated: $("#lastUpdated"),
};

async function main() {
	setupIcons();
	setupBrowserHistoryHandling(restoreSelectedPackagesFromUrl);
	setupSearchEventListeners();
	setupSelectedEventListeners();
	setupExportEventListeners();
	setupThemeToggle();

	const searchQuery = restoreSearchFromUrl(elements.search);
	await restoreSelectedPackagesFromUrl();

	if (searchQuery) {
		showFilteredPackages(searchQuery);
	} else {
		showUnfilteredPackages(true);
	}
}

main();
