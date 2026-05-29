# 🛠️ Archontas' Blockbench Plugins Portal

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/CD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](#-automated-deployment-pipeline)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue.svg)](LICENSE)

A premium, interactive developer portal distributing high-utility plugins for [Blockbench](https://www.blockbench.net/): **ModelEngine Format** (`meg.js`) and **ITERATIVE TEXTURE EDITING MACROS FOR I.T.E.M** (`item.js`).

The portal serves as a unified distribution hub featuring real-time, sandboxed, recursive WebGL Blockbench client viewports pre-rigged to automatically execute and demonstrate both plugins inside the browser.

---

## ⚡ Core Plugins Distributed

### 1. ModelEngine Format (`meg.js`)
*Automating Minecraft ModelEngine cuboid metadata and rigging constraints.*
* **Locator & Bone Rigging:** Instant bone Y-pivot offsets, Shadow coordinate locking, and automated hitbox adjustments.
* **VariantVisibility Arrays:** Sub-model toggling configuration compilation stored cleanly inside custom `.bbmodel` metadata.
* **Prefix Injectors:** Right-click context actions for injecting standard `h_` (head), `p_` (passenger), or `g_` (ghost) bone groupings.
* **Light Emission Mapping:** Assign brightness levels (0–15) directly to cuboid layers.

### 2. ITERATIVE TEXTURE EDITING MACROS FOR I.T.E.M (`item.js`)
*Mathematical, non-destructive voxel texture generators and color adjustments.*
* **Multi-Layer Targeting:** Scope selectors for active pixels, marquee selections, specific layer groups, or whole textures.
* **Macros Suite:** Real-time HSL shifts, Contrast/Luminance multipliers, and Spline-based quadratic Tone Curves.
* **Durability Exporters:** Batch-generate damaged cycles or gradient tracks directly into spritesheet layouts.
* **Minecraft mcmeta Compiler:** Automated frame controllers producing game-ready animation files matching custom preview tick rates.

---

## 🏗️ Technical Architecture & Sandbox WebGL Viewports

To deliver direct, interactive previews without forcing visitors to download files first, the portal serves a customized, lightweight build of the **Blockbench Web Client** in secure `<iframe>` sandbox panels:
1. **Local Sandboxing:** The portal hosts compiled Blockbench assets under `public/blockbench/`.
2. **Plugin Autoloading:** When either interactive iframe compiles, it loads a local patched client preloaded with query parameters:
   `blockbench/index.html?plugins=http://localhost:5173/meg.js`
3. **Automated Scenes:**
   * **MEG viewport** automatically generates a rigid Minecraft Zombie skeleton with coordinate-locked shadow overlays.
   * **I.T.E.M viewport** procedurally spawns a 16x16 Ruby Gem texture, overlays a responsive macro editing panel, and begins a looping canvas frame preview.

*Note: Viewports are performance-optimized and automatically set to `hidden` on mobile screens to preserve memory and rendering hardware.*

---

## 🔌 Dynamic API Release Sync

The portal is integrated directly with the GitHub REST API. At runtime, the application queries:
* `https://api.github.com/repos/Archontas123/ModelEngine-Entity-BB-Plugin/releases/latest`
* `https://api.github.com/repos/Archontas123/I.T.E.M-BB-Plugin/releases/latest`

This ensures that the portal's **version tags**, **download links**, **download counters**, and **changelog feeds** are always dynamically updated in real-time as soon as you publish a new release tag on either repository. No redeployment of the portal is ever needed.

---

## 🚀 Automated Deployment Pipeline

The repository utilizes GitHub's official **Direct Actions Pages Deployment** to build and host the portal:
* **Trigger:** Triggers automatically on every push to the `main` branch.
* **Compilation:** Runs standard `npm run build` using Node.js v20.
* **Direct Hosting:** Uploads the compiled `/dist` folder as a secure deployment artifact.
* **No `gh-pages` Branch:** Deploys directly from the workflow artifact without cluttering your repository branches.

---

## ⚙️ Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v20+ recommended)
* [npm](https://www.npmjs.com/)

### Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Compile production bundle:
   ```bash
   npm run build
   ```

---

## ⚖️ License & Compliance

The custom portal source and asset structures are licensed under the **GNU General Public License v3.0**. 

* **Blockbench Compliance:** The integrated Blockbench client (served statically under `public/blockbench`) is compiled from the modified GPLv3 source code, which is hosted at `C:\Users\Tavuc\Documents\Workspace\blockbench-src`. Distribution of these compiled binaries is fully compliant under GPL copyleft provisions.
* *Blockbench is a registered trademark of Jannis Tobias Petersen. This website is a third-party developer utility portal and is not affiliated with Jannis Tobias Petersen or the Blockbench project.*
