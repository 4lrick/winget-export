import {
	addSelected,
	removeSelected,
} from "../selectedSection/selectedStateManagement.js";
import {
	createEmptyStateElement,
	createIcon,
	createMetaElement,
	createTitleElement,
} from "../utils.js";

export function renderLoadingState(container) {
	container.appendChild(createEmptyStateElement("Loading packages…"));
}

function createTags(pkg) {
	if (!pkg.Tags || !pkg.Tags.length) return null;
	const tags = document.createElement("div");
	tags.className = "tags";
	for (const tag of pkg.Tags) {
		const tagElement = document.createElement("span");
		tagElement.className = "tag";
		tagElement.textContent = tag;
		tags.appendChild(tagElement);
	}
	return tags;
}

function createLeftSection(pkg) {
	const left = document.createElement("div");
	left.appendChild(createTitleElement(pkg, pkg.PackageIdentifier));

	const metaContent = [pkg.PackageIdentifier, pkg.Publisher, pkg.Version]
		.filter(Boolean)
		.join(" • ");
	left.appendChild(createMetaElement(metaContent));

	if (pkg.Description) {
		left.appendChild(createMetaElement(pkg.Description));
	}
	const tags = createTags(pkg);
	if (tags) left.appendChild(tags);
	return left;
}

function createRightSection(pkg, state, renderResults) {
	const right = document.createElement("div");
	const isSelected = state.selected.has(pkg.PackageIdentifier);
	const button = document.createElement("button");
	button.className = `btn secondary select-toggle${isSelected ? " active" : ""}`;
	const labelBase = pkg.Name || pkg.PackageIdentifier;
	button.setAttribute(
		"aria-label",
		(isSelected ? "Deselect " : "Select ") + labelBase,
	);

	button.appendChild(createIcon(isSelected ? "check" : "plus"));
	button.addEventListener("click", () => {
		if (isSelected) removeSelected(pkg.PackageIdentifier);
		else addSelected(pkg);
		renderResults();
	});
	right.appendChild(button);
	return right;
}

export function buildResultItem(pkg, state, renderResults) {
	const resultItem = document.createElement("div");
	resultItem.className = "result-item";
	const left = createLeftSection(pkg);
	const right = createRightSection(pkg, state, renderResults);
	resultItem.appendChild(left);
	resultItem.appendChild(right);
	return resultItem;
}

export function renderMoreButton(container, hasMore, showMore) {
	if (!hasMore) return;

	const moreButton = document.createElement("button");
	moreButton.textContent = "Show more";
	moreButton.className = "btn secondary";
	moreButton.addEventListener("click", showMore);

	const moreContainer = document.createElement("div");
	moreContainer.style.padding = "16px";
	moreContainer.style.textAlign = "center";
	moreContainer.appendChild(moreButton);
	container.appendChild(moreContainer);
}
