import { elements, state } from "../app.js";
import { syncSelectedIdsToUrl } from "../urlHandling.js";
import { updateCommand } from "./exportHandling.js";
import { renderSelected } from "./selectedRendering.js";

let draggedIndex = -1;

function handleDragStart(e) {
	draggedIndex = parseInt(this.dataset.index, 10);
	this.classList.add("dragging");
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/html", this.outerHTML);
}

function handleDragOver(e) {
	e.preventDefault();
	e.dataTransfer.dropEffect = "move";

	const targetIndex = parseInt(this.dataset.index, 10);

	elements.selectedList.querySelectorAll(".selected-item").forEach((item) => {
		item.classList.remove("drop-above", "drop-below");
	});

	if (draggedIndex < targetIndex) {
		this.classList.add("drop-below");
	} else {
		this.classList.add("drop-above");
	}
}

function handleDrop(e) {
	e.preventDefault();

	const targetIndex = parseInt(this.dataset.index, 10);
	if (draggedIndex === targetIndex) return;

	const selectedArray = Array.from(state.selected.entries());
	const [draggedId] = selectedArray[draggedIndex];

	selectedArray.splice(draggedIndex, 1);
	selectedArray.splice(targetIndex, 0, [
		draggedId,
		state.selected.get(draggedId),
	]);

	state.selected.clear();
	for (const [id, pkg] of selectedArray) {
		state.selected.set(id, pkg);
	}

	renderSelected();
	syncSelectedIdsToUrl(state.selected);
	updateCommand();
}

function handleDragEnd() {
	this.classList.remove("dragging");

	elements.selectedList.querySelectorAll(".selected-item").forEach((item) => {
		item.classList.remove("drop-above", "drop-below");
	});

	draggedIndex = -1;
}

export function setupDragEventListeners(listItem, dragHandle) {
	dragHandle.addEventListener("dragstart", (e) => {
		handleDragStart.call(listItem, e);
	});
	dragHandle.addEventListener("dragend", (e) => {
		handleDragEnd.call(listItem, e);
	});
	listItem.addEventListener("dragover", (e) =>
		handleDragOver.call(listItem, e),
	);
	listItem.addEventListener("drop", handleDrop);
}
