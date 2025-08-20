import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO_URL = "https://github.com/microsoft/winget-pkgs.git";
const DATA_DIR = path.resolve("data");
const REPO_DIR = path.join(DATA_DIR, "winget-pkgs");
const MANIFESTS_DIR = path.join(REPO_DIR, "manifests");
const INDEX_PATH = path.join(DATA_DIR, "index.json");

function ensureRepo() {
	if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
	if (!fs.existsSync(REPO_DIR)) {
		execSync(`git clone --depth 1 ${REPO_URL} ${REPO_DIR}`, {
			stdio: "inherit",
		});
	} else {
		execSync(`git -C ${REPO_DIR} fetch --depth 1 origin`, { stdio: "inherit" });
		execSync(`git -C ${REPO_DIR} reset --hard origin/HEAD`, {
			stdio: "inherit",
		});
	}
}

function buildIndex() {
	if (!fs.existsSync(MANIFESTS_DIR))
		throw new Error("Manifests directory not found.");
	const packageIdToBestItem = new Map();

	traverseDirectoryFiles(MANIFESTS_DIR, (filePath) => {
		const manifestBaseName = path.basename(filePath).toLowerCase();
		if (!manifestBaseName.endsWith(".yaml")) return;
		const fileContents = fs.readFileSync(filePath, "utf8");
		const basics = parseManifestBasics(fileContents);
		if (!basics.id) return;
		if (
			basics.type &&
			basics.type !== "defaultlocale" &&
			basics.type !== "version"
		)
			return;

		if (basics.type === "defaultlocale") {
			const meta = parseDefaultLocaleYaml(fileContents);
			const candidateItem = {
				PackageIdentifier: basics.id,
				Name: meta.PackageName || meta.Name || "",
				Publisher: meta.Publisher || "",
				Moniker: meta.Moniker || "",
				Version: basics.version || meta.PackageVersion || "",
				Description: meta.ShortDescription || meta.Description || "",
				Tags: meta.Tags || [],
				PackageUrl: meta.PackageUrl || "",
				PublisherUrl: meta.PublisherUrl || "",
				__isDefaultLocale: true,
			};
			chooseBestPackageItem(packageIdToBestItem, candidateItem);
			return;
		}

		if (basics.type === "version" || !basics.type) {
			const candidateItem = {
				PackageIdentifier: basics.id,
				Name: "",
				Publisher: "",
				Moniker: "",
				Version: basics.version || "",
				Description: "",
				Tags: [],
				PackageUrl: "",
				PublisherUrl: "",
				__isDefaultLocale: false,
			};
			chooseBestPackageItem(packageIdToBestItem, candidateItem);
			return;
		}
	});

	const packages = Array.from(packageIdToBestItem.values()).map(
		({ __isDefaultLocale, ...rest }) => rest,
	);
	packages.sort((a, b) =>
		a.PackageIdentifier.localeCompare(b.PackageIdentifier),
	);
	const indexOutput = {
		generatedAt: new Date().toISOString(),
		total: packages.length,
		items: packages,
	};
	fs.writeFileSync(INDEX_PATH, JSON.stringify(indexOutput));
	return indexOutput;
}

function chooseBestPackageItem(packageIdToBestItem, candidateItem) {
	const packageIdentifier = candidateItem.PackageIdentifier || "";
	const previousItem = packageIdToBestItem.get(packageIdentifier);
	if (!previousItem) {
		packageIdToBestItem.set(packageIdentifier, candidateItem);
		return;
	}
	const versionCompare = compareVersions(
		candidateItem.Version,
		previousItem.Version || "0",
	);
	const preferDefaultLocale =
		candidateItem.__isDefaultLocale && !previousItem.__isDefaultLocale;
	if (versionCompare > 0 || (versionCompare === 0 && preferDefaultLocale)) {
		packageIdToBestItem.set(packageIdentifier, candidateItem);
	}
}

function traverseDirectoryFiles(startDirectoryPath, onFile) {
	const pendingDirectories = [startDirectoryPath];
	while (pendingDirectories.length) {
		const currentDirectoryPath = pendingDirectories.pop();
		const entries = fs
			.readdirSync(currentDirectoryPath, { withFileTypes: true })
			.sort((a, b) => a.name.localeCompare(b.name));
		for (const entry of entries) {
			const entryPath = path.join(currentDirectoryPath, entry.name);
			if (entry.isDirectory()) pendingDirectories.push(entryPath);
			else if (entry.isFile()) onFile(entryPath);
		}
	}
}

function compareVersions(versionA, versionB) {
	const partsA = String(versionA || "").split(/[.+-]/);
	const partsB = String(versionB || "").split(/[.+-]/);
	const maxLen = Math.max(partsA.length, partsB.length);
	for (let partIndex = 0; partIndex < maxLen; partIndex++) {
		const numA = parseInt(partsA[partIndex] ?? "0", 10);
		const numB = parseInt(partsB[partIndex] ?? "0", 10);
		if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
			if (numA !== numB) return numA - numB;
		} else {
			const strA = partsA[partIndex] ?? "";
			const strB = partsB[partIndex] ?? "";
			if (strA !== strB) return strA < strB ? -1 : 1;
		}
	}
	return 0;
}

function parseDefaultLocaleYaml(fileText) {
	const fileLines = fileText.split(/\r?\n/);
	const parsed = {};

	const extractFieldValue = (fieldName) =>
		extractFieldValueFromLines(fileLines, fieldName);

	const parseTags = () => {
		const startIndex = fileLines.findIndex((lineText) =>
			/^\s*Tags\s*:/.test(lineText),
		);
		if (startIndex === -1) return [];
		const tags = [];
		for (
			let lineIndex = startIndex + 1;
			lineIndex < fileLines.length;
			lineIndex++
		) {
			const lineText = fileLines[lineIndex];
			if (/^\s*-\s*/.test(lineText)) {
				const valueText = lineText.replace(/^\s*-\s*/, "").trim();
				tags.push(valueText);
			} else if (/^\s*$/.test(lineText)) {
			} else {
				break;
			}
		}
		return tags.filter(Boolean);
	};

	parsed.PackageIdentifier = extractFieldValue("PackageIdentifier");
	parsed.PackageName =
		extractFieldValue("PackageName") || extractFieldValue("Name");
	parsed.Publisher = extractFieldValue("Publisher");
	parsed.Moniker = extractFieldValue("Moniker");
	parsed.ShortDescription = extractFieldValue("ShortDescription");
	parsed.Description = extractFieldValue("Description");
	parsed.PackageVersion = extractFieldValue("PackageVersion");
	parsed.PackageUrl = extractFieldValue("PackageUrl");
	parsed.PublisherUrl = extractFieldValue("PublisherUrl");
	parsed.Tags = parseTags();
	return parsed;
}

function extractFieldValueFromLines(fileLines, fieldName) {
	const fieldRegex = new RegExp(`^\\s*${fieldName}\\s*:\\s*(.*)$`);
	for (const lineText of fileLines) {
		const match = lineText.match(fieldRegex);
		if (match) {
			const value = match[1].trim();
			return value.replace(/^['"](.*)['"]$/, "$1");
		}
	}
	return "";
}

function parseManifestBasics(fileText) {
	const lines = fileText.split(/\r?\n/);
	const type = (
		extractFieldValueFromLines(lines, "ManifestType") || ""
	).toLowerCase();
	const id = extractFieldValueFromLines(lines, "PackageIdentifier") || "";
	const version = extractFieldValueFromLines(lines, "PackageVersion") || "";
	return { type, id, version };
}

ensureRepo();
buildIndex();
