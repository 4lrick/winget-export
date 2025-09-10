<p align="center">
  <img src="Assets/winget-export-logo.svg" width="180" height="151" alt="Winget Export Logo">
</p>

<h1 align="center">Winget Export</h1>

<p align="center">
  <strong>Browse Windows Package Manager packages, select what you need, and export them for quick installation.</strong>
</p>

<p align="center">
  <em><!-- LAST_UPDATE_START -->Package latest update: September 10, 2025 at 00:51 UTC<!-- LAST_UPDATE_END --></em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#license">License</a>
</p>

---

## Overview

Winget Export provides an interface for browsing Windows Package Manager (winget) packages. The package list is updated every day to ensure an access to the latest available packages. You can search through them, select the ones you need, and export them as a JSON file, PowerShell script or as a command line that can be imported directly with winget.

## Usage

1. **Search**: Type in the search box to find packages (e.g., "PowerToys", "Firefox", "Git")
2. **Select**: Click the checkbox next to packages you want to install
3. **Reorder**: Drag packages in your selection to change the installation order
4. **Export**: Choose to export as JSON file, PowerShell script, or copy the command line to your clipboard
5. **Import**: For JSON exports, use the generated command to install all packages:
   ```bash
   winget import --import-file "winget-export-YYYY-MM-DDTHH_MM_SS_sss-00_00.json"
   ```

## Development

### Local Development

- Serve the folder with an HTTP server:
  ```bash
  python3 -m http.server 8080
  ```
  Then navigate to http://localhost:8080/

### Building the Package Index

The package data is stored in `data/index.json` and can be updated in two ways:

**Local Build:**
```bash
pnpm run build
```

**Automated CI:**
- The `.github/workflows/update-index.yml` workflow runs daily and on push to the `main` branch
- Automatically builds `data/index.json` and commits changes if the package list has been updated

## License

MIT