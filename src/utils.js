export const PAGE_SIZE = 5;
export const STATUS_TIMEOUT = 4000;

export function formatRelativeTime(date) {
	const now = new Date();
	const diffInMs = now - date;

	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	const seconds = Math.floor(diffInMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (years > 0) return rtf.format(-years, "year");
	if (months > 0) return rtf.format(-months, "month");
	if (days > 0) return rtf.format(-days, "day");
	if (hours > 0) return rtf.format(-hours, "hour");
	if (minutes > 0) return rtf.format(-minutes, "minute");
	return rtf.format(-seconds, "second");
}

export function getWingetISOString() {
	const now = new Date();
	const offsetMs = now.getTimezoneOffset() * 60000;
	const localTime = new Date(now.getTime() - offsetMs);
	return localTime.toISOString().replace("Z", "-00:00");
}

export function buildTimestampedFilename(prefix, extension) {
	const timestamp = getWingetISOString().replace(/:/g, "_").replace(/\./g, "_");
	return `${prefix}-${timestamp}.${extension}`;
}

export function $(selector) {
	return document.querySelector(selector);
}

export function createIcon(iconName, className = "") {
	const icon = document.createElement("i");
	icon.setAttribute("data-lucide", iconName);
	if (className) {
		icon.className = className;
	}
	return icon;
}

export function findIconElement(container) {
	return (
		container.querySelector("svg.lucide") ||
		container.querySelector("i[data-lucide]") ||
		null
	);
}

export function updateIcon(iconElement, newIconName) {
	if (!iconElement) return;
	const parent = iconElement.parentElement || iconElement;
	const placeholder = createIcon(newIconName);
	iconElement.replaceWith(placeholder);
	if (window.lucide) {
		window.lucide.createIcons({ root: parent });
	}
}

export function setupIcons() {
	if (window.lucide) {
		window.lucide.createIcons();
	}
}

export function showStatus(message, type = "info") {
	const statusElement = $("#status");
	if (!statusElement) return;

	statusElement.textContent = message;
	statusElement.className = `status ${type}`;
	statusElement.style.display = "block";

	if (type !== "error") {
		setTimeout(() => {
			statusElement.style.display = "none";
		}, STATUS_TIMEOUT);
	}
}

export function updatePackageListStatus(packageList) {
	const lastUpdatedElement = $("#lastUpdated");
	if (packageList?.generatedAt && lastUpdatedElement) {
		const date = new Date(packageList.generatedAt);
		lastUpdatedElement.textContent = formatRelativeTime(date);
	}
}

export function createTitleElement(pkg, fallbackText) {
	const title = document.createElement("div");
	const linkUrl = pkg.PackageUrl || pkg.PublisherUrl;
	if (linkUrl) {
		const titleLink = document.createElement("a");
		titleLink.href = linkUrl;
		titleLink.target = "_blank";
		titleLink.rel = "noopener noreferrer";
		titleLink.referrerPolicy = "no-referrer";
		titleLink.textContent = pkg.Name || fallbackText;
		title.appendChild(titleLink);
	} else {
		title.textContent = pkg.Name || fallbackText;
	}
	return title;
}

export function createEmptyStateElement(message, className = "empty") {
	const empty = document.createElement("div");
	empty.className = className;
	empty.textContent = message;
	return empty;
}

export function createMetaElement(content, className = "meta") {
	const meta = document.createElement("div");
	meta.className = className;
	meta.textContent = content;
	return meta;
}

export function setupThemeToggle() {
	const themeToggle = document.querySelector(".theme-toggle");
	if (!themeToggle) return;

	const savedTheme = localStorage.getItem("theme") || "dark";
	document.documentElement.setAttribute("data-theme", savedTheme);
	themeToggle.setAttribute("data-theme", savedTheme);
	updateThemeToggleLabel(themeToggle, savedTheme);

	themeToggle.addEventListener("click", () => {
		const currentTheme = document.documentElement.getAttribute("data-theme");
		const newTheme = currentTheme === "dark" ? "light" : "dark";

		document.documentElement.setAttribute("data-theme", newTheme);
		themeToggle.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
		updateThemeToggleLabel(themeToggle, newTheme);
	});
}

function updateThemeToggleLabel(button, theme) {
	const isDark = theme === "dark";
	const iconElement = findIconElement(button);
	if (iconElement) updateIcon(iconElement, isDark ? "sun" : "moon");

	button.setAttribute(
		"aria-label",
		isDark ? "Switch to light theme" : "Switch to dark theme",
	);
	button.setAttribute(
		"title",
		isDark ? "Switch to light theme" : "Switch to dark theme",
	);
}
