# Blockbench Plugins Portal

This repository contains the source code for the Blockbench plugins distribution portal. It serves as a static homepage where developers can preview and download plugins directly in their browsers.

🔗 **Live Website:** [https://Archontas123.github.io/archontas-bb-plugins/](https://Archontas123.github.io/archontas-bb-plugins/)

## Features

- **Hosted Plugins:** Serves `meg.js` (ModelEngine Format) and `item.js` (I.T.E.M).
- **Interactive Viewports:** Integrates sandboxed Blockbench Web Client frames to allow live in-browser previewing of both plugins.
- **Dynamic Releases:** Integrates with the GitHub REST API to dynamically fetch download links, download counters, and changelogs from the latest GitHub releases.

## Local Development

Ensure you have Node.js installed, then run:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Compile the production static site
npm run build
```

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE) for details.
