# 🛠️ Archontas' Blockbench Plugins Portal

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/CD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](#-automated-deployment-pipeline)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue.svg)](LICENSE)

> 🔗 **Live Website Portal:** **[https://Archontas123.github.io/archontas-bb-plugins/](https://Archontas123.github.io/archontas-bb-plugins/)**

A premium, interactive developer portal distributing high-utility plugins for [Blockbench](https://www.blockbench.net/): **ModelEngine Format** (`meg.js`) and **ITERATIVE TEXTURE EDITING MACROS FOR I.T.E.M** (`item.js`).

The portal serves as a unified distribution hub featuring real-time, sandboxed, recursive WebGL Blockbench client viewports pre-rigged to automatically execute and demonstrate both plugins inside the browser.

---

## ⚡ Core Plugins Distributed

### 1. ModelEngine Format (`meg.js`)
*Automating Minecraft ModelEngine cuboid metadata and rigging constraints.*
* **Locator & Bone Rigging:** Instant Y-pivot offsets, Shadow coordinate locking, and automated hitbox element initialization.
* **Prefix Injectors:** Right-click context actions for injecting standard prefixes like `h_` (head), `p_` (seat), or `g_` (ghost) bone groups.
* **Light Emission Mapping:** Assign brightness levels (0–15) directly to cuboid layers, automatically compiled into metadata.

### 2. ITERATIVE TEXTURE EDITING MACROS FOR I.T.E.M (`item.js`)
*Mathematical, non-destructive voxel texture generators and HSL color adjustments.*
* **Multi-Layer Targeting:** Adjust active pixel marquees, selected layers, or full textures.
* **Macros Suite:** Real-time HSL shifts, Contrast/Luminance multipliers, and Spline-based quadratic Tone Curves.
* **Spritesheet & mcmeta Exporters:** Compile animations into vertically-stacked PNGs with matching `.mcmeta` game files.

---

## 🏗️ Technical Sandbox Viewports

To deliver direct previews without forcing manual installation, the portal hosts and serves a customized WebGL **Blockbench Web Client** in secure `<iframe>` sandbox panels:
* **Plugin Autoloading:** Loads a local patched client preloaded with query parameters:  
  `blockbench/index.html?plugins=./meg.js`
* **Automated Scenes:** The MEG viewport spawns a rigid Zombie skeleton, while the I.T.E.M viewport procedurally generates a Ruby Gem texture with an active macro editing panel.

---

## 🔌 Dynamic API Release Sync

The portal is integrated directly with the GitHub REST API. At runtime, it queries:
* `https://api.github.com/repos/Archontas123/ModelEngine-Entity-BB-Plugin/releases/latest`
* `https://api.github.com/repos/Archontas123/I.T.E.M-BB-Plugin/releases/latest`

This ensures that the portal's **version tags**, **download links**, **download counters**, and **changelog feeds** are always dynamically updated in real-time as soon as you publish a new release tag on either repository. No website rebuilds required.

---

## 🚀 Automated Deployment Pipeline

The repository utilizes GitHub's official **Direct Actions Pages Deployment** to build and host the portal:
* **Trigger:** Triggers automatically on every push to the `main` branch.
* **Build Step:** Compiles static production React assets using Gulp/Vite under Node.js v20.
* **Direct Hosting:** Uploads the compiled `/dist` folder as a secure deployment artifact, bypassing the need for a separate `gh-pages` branch.

---

## ⚙️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Compile production bundle
npm run build
```

---

## ⚖️ License & Compliance

Licensed under the **GNU General Public License v3.0**. 

* **Blockbench Compliance:** The integrated Blockbench client (served statically under `public/blockbench`) is compiled from the modified GPLv3 source code, which is hosted at `C:\Users\Tavuc\Documents\Workspace\blockbench-src`. Distribution of these compiled binaries is fully compliant under GPL copyleft provisions.
* *Blockbench is a registered trademark of Jannis Tobias Petersen. This website is a third-party developer utility portal and is not affiliated with Jannis Tobias Petersen or the Blockbench project.*
