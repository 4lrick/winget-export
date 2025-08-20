import { elements, state } from "../app.js";
import { createEmptyStateElement, setupIcons } from "../utils.js";
import { rankResults } from "./ranking.js";
import {
	showFilteredPackages,
	showMoreFilteredPackages,
	showUnfilteredPackages,
} from "./resultsFiltering.js";
import {
	buildResultItem,
	renderLoadingState,
	renderMoreButton,
} from "./resultsRendering.js";

function addMoreButton(container) {
	if (state.query) {
		const packages = state.packageList?.items || [];
		const totalMatched = rankResults(packages, state.query, Infinity).length;
		const hasMore = state.results.length < totalMatched;
		renderMoreButton(container, hasMore, showMoreFilteredPackages);
	} else {
		renderMoreButton(container, state.hasMore, () =>
			showUnfilteredPackages(false),
		);
	}
}

export function renderResults() {
	const resultsContainer = elements.results;
	resultsContainer.innerHTML = "";

	if (state.packageListLoading) {
		renderLoadingState(resultsContainer);
		return;
	}

	if (!state.results.length) {
		resultsContainer.appendChild(createEmptyStateElement("No results."));
		return;
	}

	const visible = state.results || [];

	for (const pkg of visible) {
		resultsContainer.appendChild(buildResultItem(pkg, state, renderResults));
	}

	setupIcons();
	addMoreButton(resultsContainer);
}

export function setupSearchEventListeners() {
	elements.search.addEventListener("input", (e) =>
		showFilteredPackages(e.target.value),
	);
}
