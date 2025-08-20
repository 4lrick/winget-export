function createUrlWithParams(params) {
	const url = new URL(location.href);
	url.search = "";

	for (const [key, value] of Object.entries(params)) {
		if (value !== null && value !== undefined && value !== "") {
			url.searchParams.set(key, value);
		}
	}

	return url;
}

function updateUrl(url, method = "replaceState") {
	const newUrl = url.toString();
	if (newUrl !== location.href) {
		history[method](null, "", newUrl);
	}
}

export function restoreSearchFromUrl(searchElement) {
	const url = new URL(location.href);
	const query = url.searchParams.get("q");
	if (query) {
		searchElement.value = query;
		return query;
	}
	return "";
}

export function updateSearchInUrl(query) {
	const url = new URL(location.href);
	const currentIds = url.searchParams.get("ids");

	const params = {
		q: query.trim() || null,
		ids: currentIds || null,
	};

	const newUrl = createUrlWithParams(params);
	updateUrl(newUrl, "replaceState");
}

export function syncSelectedIdsToUrl(selectedMap) {
	const ids = Array.from(selectedMap.keys());
	const url = new URL(location.href);
	const currentQuery = url.searchParams.get("q");

	const params = {
		q: currentQuery || null,
		ids: ids.length > 0 ? ids.join(",") : null,
	};

	const newUrl = createUrlWithParams(params);
	updateUrl(newUrl, "pushState");
}

export function restoreSelectedIdsFromUrl() {
	const url = new URL(location.href);
	const ids = url.searchParams.get("ids");
	if (!ids) return [];
	return ids.split(",").filter(Boolean);
}

export function setupBrowserHistoryHandling(restoreStateCallback) {
	window.addEventListener("popstate", () => {
		restoreStateCallback();
	});
}
