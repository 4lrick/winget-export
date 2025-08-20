import { state } from "../app.js";
import { loadPackageList } from "../dataFetching.js";
import { updateSearchInUrl } from "../urlHandling.js";
import { PAGE_SIZE } from "../utils.js";
import { rankResults } from "./ranking.js";
import { renderResults } from "./results.js";

export async function showFilteredPackages(query) {
	state.query = query.trim();
	state.searchVisibleCount = PAGE_SIZE;
	updateSearchInUrl(state.query);

	if (!state.query) {
		await showUnfilteredPackages(true);
		return;
	}

	try {
		await loadPackageList(state);
		const packages = state.packageList?.items || [];
		state.results = rankResults(
			packages,
			state.query,
			state.searchVisibleCount,
		);
		state.hasMore = false;
	} catch (e) {
		console.warn("Failed to search packages: ", e);
		state.results = [];
		state.hasMore = false;
	}

	renderResults();
}

export function showMoreFilteredPackages() {
	state.searchVisibleCount += PAGE_SIZE;
	try {
		const packages = state.packageList?.items || [];
		state.results = rankResults(
			packages,
			state.query,
			state.searchVisibleCount,
		);
	} catch (e) {
		console.warn("Failed to load more search results: ", e);
	}
	renderResults();
}

export async function showUnfilteredPackages(reset = false) {
	if (reset) {
		state.results = [];
		state.listOffset = 0;
		state.hasMore = false;
	}
	const limit = PAGE_SIZE;
	const offset = state.listOffset;
	try {
		await loadPackageList(state);
		const all = state.packageList?.items || [];
		const slice = all.slice(offset, offset + limit);
		state.results = state.results.concat(slice);
		state.listOffset += slice.length;
		state.hasMore = offset + slice.length < all.length;
	} catch (e) {
		console.warn("Failed to load results: ", e);
		state.hasMore = false;
	}
	renderResults();
}
