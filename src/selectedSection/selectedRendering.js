import { elements, state } from "../app.js";
import {
	createEmptyStateElement,
	createIcon,
	createMetaElement,
	createTitleElement,
	setupIcons,
} from "../utils.js";
import { setupDragEventListeners } from "./dragDropHandling.js";
import { removeSelected } from "./selectedStateManagement.js";

function createDragHandle() {
	const dragHandle = document.createElement("div");
	dragHandle.className = "drag-handle";
	dragHandle.title = "Drag to reorder";
	dragHandle.draggable = true;
	dragHandle.appendChild(createIcon("grip-vertical"));
	return dragHandle;
}

function createLeftSection(pkg, id) {
	const left = document.createElement("div");
	left.appendChild(createTitleElement(pkg, id));
	left.appendChild(createMetaElement(id));
	return left;
}

function createRightSection(id) {
	const right = document.createElement("div");
	const btn = document.createElement("button");
	btn.className = "btn danger";
	btn.setAttribute("aria-label", `Remove ${id} from selection`);
	btn.addEventListener("click", () => removeSelected(id));
	btn.appendChild(createIcon("trash-2"));
	right.appendChild(btn);
	return right;
}

function createSelectedListItem(id, pkg, index) {
	const li = document.createElement("li");
	li.className = "selected-item";
	li.dataset.id = id;
	li.dataset.index = index;
	const dragHandle = createDragHandle();
	const left = createLeftSection(pkg, id);
	const right = createRightSection(id);
	li.appendChild(dragHandle);
	li.appendChild(left);
	li.appendChild(right);
	setupDragEventListeners(li, dragHandle);
	return li;
}

function renderSelectedList(selectedArray) {
	for (let i = 0; i < selectedArray.length; i++) {
		const [id, pkg] = selectedArray[i];
		const li = createSelectedListItem(id, pkg, i);
		elements.selectedList.appendChild(li);
	}
}

export function renderSelected() {
	elements.selectedList.innerHTML = "";
	const selectedArray = Array.from(state.selected.entries());

	if (selectedArray.length === 0) {
		elements.selectedList.appendChild(
			createEmptyStateElement("No packages selected yet.", "empty-selected"),
		);
	} else {
		renderSelectedList(selectedArray);
	}

	elements.selectedCount.textContent = String(state.selected.size);
	setupIcons();
}
