(function () {
	'use strict';

	var iterateAction;

	function clamp(v, lo, hi) {
		return v < lo ? lo : v > hi ? hi : v;
	}

	function rgbToHsl(r, g, b) {
		r /= 255; g /= 255; b /= 255;
		let max = Math.max(r, g, b), min = Math.min(r, g, b);
		let h = 0, s = 0, l = (max + min) / 2;
		if (max !== min) {
			let d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
				case g: h = ((b - r) / d + 2) / 6; break;
				case b: h = ((r - g) / d + 4) / 6; break;
			}
		}
		return [h, s, l];
	}

	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}

	function hslToRgb(h, s, l) {
		if (s === 0) { let v = Math.round(l * 255); return [v, v, v]; }
		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
		return [
			Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
			Math.round(hue2rgb(p, q, h) * 255),
			Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
		];
	}

	function blendToComposite(mode) {
		switch (mode) {
			case 'set_opacity': return 'source-atop';
			case 'color':       return 'color';
			case 'behind':      return 'destination-over';
			case 'multiply':    return 'multiply';
			case 'add':         return 'lighter';
			case 'darken':      return 'darken';
			case 'lighten':     return 'lighten';
			case 'screen':      return 'screen';
			case 'overlay':     return 'overlay';
			case 'difference':  return 'difference';
			default:            return 'source-over';
		}
	}

	function applyToneCurve(v, shadows, midtones, highlights) {
		let t = v / 255;
		let sw = (1 - t) * (1 - t), hw = t * t, mw = 4 * t * (1 - t);
		let sum = sw + mw + hw;
		let delta = (sw / sum) * shadows * 2.55 + (mw / sum) * midtones * 2.55 + (hw / sum) * highlights * 2.55;
		return clamp(Math.round(v + delta), 0, 255);
	}

	function processImageData(src, adj) {
		let dst = new Uint8ClampedArray(src.data);
		let { brightness, contrast, hue, saturation, opacity, invert, curves_shadows, curves_midtones, curves_highlights } = adj;
		// Precompute to avoid per-pixel division
		let cf = contrast !== 0 ? (259 * (contrast + 255)) / (255 * (259 - contrast)) : 1;
		let hasCurves = curves_shadows !== 0 || curves_midtones !== 0 || curves_highlights !== 0;

		for (let i = 0; i < dst.length; i += 4) {
			let r = dst[i], g = dst[i + 1], b = dst[i + 2], a = dst[i + 3];
			if (brightness !== 0) {
				r = clamp(r + brightness, 0, 255);
				g = clamp(g + brightness, 0, 255);
				b = clamp(b + brightness, 0, 255);
			}
			if (contrast !== 0) {
				r = clamp(Math.round(cf * (r - 128) + 128), 0, 255);
				g = clamp(Math.round(cf * (g - 128) + 128), 0, 255);
				b = clamp(Math.round(cf * (b - 128) + 128), 0, 255);
			}
			if (hue !== 0 || saturation !== 0) {
				let [h, s, l] = rgbToHsl(r, g, b);
				h = ((h + hue / 360) % 1 + 1) % 1;
				s = clamp(s + saturation / 100, 0, 1);
				[r, g, b] = hslToRgb(h, s, l);
			}
			if (hasCurves) {
				r = applyToneCurve(r, curves_shadows, curves_midtones, curves_highlights);
				g = applyToneCurve(g, curves_shadows, curves_midtones, curves_highlights);
				b = applyToneCurve(b, curves_shadows, curves_midtones, curves_highlights);
			}
			if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }
			if (opacity !== 0) a = clamp(Math.round(a + opacity * 2.55), 0, 255);
			dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = a;
		}
		return new ImageData(dst, src.width, src.height);
	}

	function buildAdjForStep(settings, step, total) {
		let t = settings.mode === 'end_result' ? step / total : step;
		return {
			brightness:        Math.round(settings.brightness * t),
			contrast:          Math.round(settings.contrast * t),
			hue:               settings.hue * t,
			saturation:        settings.saturation * t,
			opacity:           settings.opacity * t,
			invert:            settings.invert,
			curves_shadows:    settings.curves_shadows * t,
			curves_midtones:   settings.curves_midtones * t,
			curves_highlights: settings.curves_highlights * t,
		};
	}

	function textureToFreshCanvas(texture) {
		let src = (texture.canvas && texture.canvas.width > 0 && texture.canvas.height > 0) ? texture.canvas : null;
		let img = texture.img || null;
		let w = src ? src.width  : (img && img.naturalWidth  > 0 ? img.naturalWidth  : (texture.width  || 16));
		let h = src ? src.height : (img && img.naturalHeight > 0 ? img.naturalHeight : (texture.height || 16));
		let c = document.createElement('canvas');
		c.width = w; c.height = h;
		let ctx = c.getContext('2d');
		if (src) ctx.drawImage(src, 0, 0);
		else if (img) ctx.drawImage(img, 0, 0);
		return c;
	}

	function getSourceInfo(texture) {
		let baseCanvas = textureToFreshCanvas(texture);
		let fullW = baseCanvas.width, fullH = baseCanvas.height;
		let baseCtx = baseCanvas.getContext('2d');

		// BB Rectangle uses start_x/start_y, not x/y
		if (texture.selection && texture.selection.is_custom && texture.selection.hasSelection()) {
			try {
				let rect = texture.selection.getBoundingRect(false);
				let rx = isFinite(rect.start_x) ? rect.start_x : (isFinite(rect.x) ? rect.x : null);
				let ry = isFinite(rect.start_y) ? rect.start_y : (isFinite(rect.y) ? rect.y : null);
				if (rx !== null && ry !== null && rect.width > 0 && rect.height > 0) {
					let imageData = baseCtx.getImageData(rx, ry, rect.width, rect.height);
					return {
						imageData,
						toFullCanvas(processed) {
							let c = textureToFreshCanvas(texture);
							c.getContext('2d').putImageData(processed, rx, ry);
							return c;
						},
					};
				}
			} catch (e) {}
		}

		if (texture.layers_enabled && texture.selected_layer) {
			let layer = texture.selected_layer;
			if (layer.canvas && layer.canvas.width > 0 && layer.canvas.height > 0) {
				let lw = layer.canvas.width, lh = layer.canvas.height;
				let ox = isFinite(layer.offset && layer.offset[0]) ? layer.offset[0] : 0;
				let oy = isFinite(layer.offset && layer.offset[1]) ? layer.offset[1] : 0;
				let lc = document.createElement('canvas');
				lc.width = lw; lc.height = lh;
				lc.getContext('2d').drawImage(layer.canvas, 0, 0);
				let imageData = lc.getContext('2d').getImageData(0, 0, lw, lh);
				return {
					imageData,
					toFullCanvas(processed) {
						let c = document.createElement('canvas');
						c.width = fullW; c.height = fullH;
						let ctx = c.getContext('2d');
						ctx.imageSmoothingEnabled = false;
						for (let l of texture.layers) {
							if (l.visible === false || l.opacity === 0 || !l.canvas || l.canvas.width === 0) continue;
							let lox = l.offset ? (l.offset[0] || 0) : 0;
							let loy = l.offset ? (l.offset[1] || 0) : 0;
							let lsw = l.scaled_width || l.canvas.width;
							let lsh = l.scaled_height || l.canvas.height;
							ctx.filter = `opacity(${(l.opacity ?? 100) / 100})`;
							ctx.globalCompositeOperation = blendToComposite(l.blend_mode);
							if (l === layer) {
								let tmp = document.createElement('canvas');
								tmp.width = lw; tmp.height = lh;
								tmp.getContext('2d').putImageData(processed, 0, 0);
								ctx.drawImage(tmp, lox, loy, lsw, lsh);
							} else {
								ctx.drawImage(l.canvas, lox, loy, lsw, lsh);
							}
						}
						ctx.filter = '';
						ctx.globalCompositeOperation = 'source-over';
						return c;
					},
				};
			}
		}

		let imageData = baseCtx.getImageData(0, 0, fullW, fullH);
		return {
			imageData,
			toFullCanvas(processed) {
				let c = document.createElement('canvas');
				c.width = fullW; c.height = fullH;
				c.getContext('2d').putImageData(processed, 0, 0);
				return c;
			},
		};
	}

	function canvasToTexture(canvas, name) {
		return new Texture({ name, internal: true }).fromDataURL(canvas.toDataURL('image/png')).add(true);
	}

	function outputDuplicates(texture, src, settings, frames) {
		let base = texture.name.replace(/\.png$/i, '');
		if (settings.include_source) canvasToTexture(texture.canvas, `${base}_iter_0.png`);
		frames.forEach((processed, i) => canvasToTexture(src.toFullCanvas(processed), `${base}_iter_${i + 1}.png`));
		Blockbench.showQuickMessage(`ITEM: ${frames.length} iteration${frames.length !== 1 ? 's' : ''} created`, 3000);
	}

	function outputSpritesheet(texture, src, settings, frames) {
		let base = texture.name.replace(/\.png$/i, '');
		let baseCanvas = textureToFreshCanvas(texture);
		let w = baseCanvas.width, h = baseCanvas.height;
		let total = frames.length + (settings.include_source ? 1 : 0);

		function doCreate() {
			let sheet = document.createElement('canvas');
			sheet.width = w; sheet.height = h * total;
			let ctx = sheet.getContext('2d');
			let row = 0;
			if (settings.include_source) { ctx.drawImage(texture.canvas, 0, 0); row++; }
			frames.forEach(processed => { ctx.drawImage(src.toFullCanvas(processed), 0, row++ * h); });
			let sheetName = `${base}_spritesheet.png`;
			canvasToTexture(sheet, sheetName);
			let mcmeta = { animation: { frametime: settings.frame_time || 5 } };
			if (settings.frame_interpolate) mcmeta.animation.interpolate = true;
			Blockbench.export({ type: 'JSON', name: sheetName + '.mcmeta', content: JSON.stringify(mcmeta, null, '\t') }, () => {});
			Blockbench.showQuickMessage(`ITEM: Spritesheet created — ${total} frames`, 3000);
		}

		if (h * total > 32768) {
			Blockbench.showMessageBox({
				title: 'ITEM — Canvas Size Warning',
				message: `Spritesheet would be ${h * total}px tall (${total} × ${h}px). This may exceed canvas limits. Continue?`,
				buttons: ['Cancel', 'Continue'],
			}, btn => { if (btn === 1) doCreate(); });
		} else {
			doCreate();
		}
	}

	function runIterate(texture, raw) {
		// BB form inputs can come back as strings
		let s = {
			mode:              raw.mode || 'end_result',
			count:             Math.max(1, parseInt(raw.count, 10) || 5),
			output:            raw.output || 'spritesheet',
			include_source:    !!raw.include_source,
			frame_time:        Math.max(1, parseInt(raw.frame_time, 10) || 5),
			frame_interpolate: !!raw.frame_interpolate,
			brightness:        parseFloat(raw.brightness)        || 0,
			contrast:          parseFloat(raw.contrast)          || 0,
			hue:               parseFloat(raw.hue)               || 0,
			saturation:        parseFloat(raw.saturation)        || 0,
			opacity:           parseFloat(raw.opacity)           || 0,
			invert:            !!raw.invert,
			curves_shadows:    parseFloat(raw.curves_shadows)    || 0,
			curves_midtones:   parseFloat(raw.curves_midtones)   || 0,
			curves_highlights: parseFloat(raw.curves_highlights) || 0,
		};

		try {
			let src = getSourceInfo(texture);
			let frames = [];
			for (let i = 1; i <= s.count; i++) frames.push(processImageData(src.imageData, buildAdjForStep(s, i, s.count)));
			s.output === 'spritesheet' ? outputSpritesheet(texture, src, s, frames) : outputDuplicates(texture, src, s, frames);
		} catch (err) {
			console.error('[ITEM]', err);
			Blockbench.showMessageBox({ title: 'ITEM — Error', message: err && err.message ? err.message : String(err), buttons: ['OK'] });
		}
	}

	function openIterateDialog(texture) {
		if (!texture) {
			Blockbench.showMessageBox({ title: 'ITEM', message: 'No texture selected.', buttons: ['OK'] });
			return;
		}

		let srcInfo;
		try { srcInfo = getSourceInfo(texture); }
		catch (err) {
			Blockbench.showMessageBox({ title: 'ITEM — Error', message: String(err && err.message || err), buttons: ['OK'] });
			return;
		}

		let scope = (texture.selection && texture.selection.is_custom && texture.selection.hasSelection()) ? 'selection'
			: (texture.layers_enabled && texture.selected_layer) ? texture.selected_layer.name
			: null;

		let live = {
			mode: 'end_result', count: 5, output: 'spritesheet',
			include_source: true, frame_time: 5, frame_interpolate: false,
			brightness: 0, contrast: 0, hue: 0, saturation: 0, opacity: 0,
			invert: false, curves_shadows: 0, curves_midtones: 0, curves_highlights: 0,
		};

		let SH  = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;opacity:.4;margin:14px 0 8px;display:block;';
		let ROW = 'display:flex;align-items:center;margin-bottom:7px;';
		let LBL = 'flex:0 0 110px;font-size:13px;';
		let VAL = 'flex:0 0 32px;text-align:right;font-size:12px;opacity:.55;';

		let dialog = new Dialog({
			id: 'item_iterate',
			title: 'I.T.E.M — Iterate Texture',
			width: 860,
			component: {
				data() {
					return { ...live, frames: [textureToFreshCanvas(texture).toDataURL()], frameIndex: 0 };
				},
				created() { this._rafPending = false; },
				mounted() { this.rebuild(); },
				watch: {
					mode(v)              { live.mode = v; },
					output(v)            { live.output = v; },
					include_source(v)    { live.include_source = v; },
					frame_time(v)        { live.frame_time = v; },
					frame_interpolate(v) { live.frame_interpolate = v; },
					count(v)             { live.count = v;             this.rebuild(); },
					brightness(v)        { live.brightness = v;        this.rebuild(); },
					contrast(v)          { live.contrast = v;          this.rebuild(); },
					hue(v)               { live.hue = v;               this.rebuild(); },
					saturation(v)        { live.saturation = v;        this.rebuild(); },
					opacity(v)           { live.opacity = v;           this.rebuild(); },
					invert(v)            { live.invert = v;            this.rebuild(); },
					curves_shadows(v)    { live.curves_shadows = v;    this.rebuild(); },
					curves_midtones(v)   { live.curves_midtones = v;   this.rebuild(); },
					curves_highlights(v) { live.curves_highlights = v; this.rebuild(); },
				},
				methods: {
					rebuild() {
						if (this._rafPending) return;
						this._rafPending = true;
						requestAnimationFrame(() => {
							this._rafPending = false;
							try {
								let frames = [textureToFreshCanvas(texture).toDataURL()];
								for (let i = 1; i <= live.count; i++) {
									let processed = processImageData(srcInfo.imageData, buildAdjForStep(live, i, live.count));
									frames.push(srcInfo.toFullCanvas(processed).toDataURL());
								}
								this.frames = frames;
								if (this.frameIndex >= frames.length) this.frameIndex = frames.length - 1;
							} catch (e) {}
						});
					},
					prev() { if (this.frames.length) this.frameIndex = (this.frameIndex - 1 + this.frames.length) % this.frames.length; },
					next() { if (this.frames.length) this.frameIndex = (this.frameIndex + 1) % this.frames.length; },
				},
				template: `
					<div style="display:flex;gap:24px;">
						<div style="flex:1;overflow-y:auto;max-height:600px;padding-right:6px;">

							<div style="margin-bottom:14px;">
								<b>${texture.name}</b>${scope ? `<span style="opacity:.4;margin-left:8px;font-size:12px;">${scope}</span>` : ''}
							</div>

							<span style="${SH}">Output</span>
							<div style="${ROW}">
								<span style="${LBL}">Mode</span>
								<select v-model="mode" style="flex:1;">
									<option value="end_result">End Result</option>
									<option value="per_step">Per Step</option>
								</select>
							</div>
							<div style="${ROW}">
								<span style="${LBL}">Iterations</span>
								<input type="number" v-model.number="count" min="1" max="64" style="width:64px;" />
							</div>
							<div style="${ROW}">
								<span style="${LBL}">Format</span>
								<select v-model="output" style="flex:1;">
									<option value="spritesheet">Spritesheet + .mcmeta</option>
									<option value="duplicate">Duplicate Textures</option>
								</select>
							</div>
							<template v-if="output === 'spritesheet'">
								<div style="${ROW}">
									<span style="${LBL}">Include source</span>
									<input type="checkbox" v-model="include_source" />
								</div>
								<div style="${ROW}">
									<span style="${LBL}">Frame time</span>
									<input type="number" v-model.number="frame_time" min="1" max="72000" style="width:64px;" />
									<span style="opacity:.4;font-size:11px;margin-left:8px;">ticks</span>
								</div>
								<div style="${ROW}">
									<span style="${LBL}">Interpolate</span>
									<input type="checkbox" v-model="frame_interpolate" />
								</div>
							</template>

							<hr style="margin:14px 0;opacity:.12;" />
							<span style="${SH}">Adjustments</span>
							<div style="${ROW}"><span style="${LBL}">Brightness</span><input type="range" v-model.number="brightness" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{brightness}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Contrast</span><input type="range" v-model.number="contrast" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{contrast}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Hue</span><input type="range" v-model.number="hue" min="-180" max="180" style="flex:1;" /><span style="${VAL}">{{hue}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Saturation</span><input type="range" v-model.number="saturation" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{saturation}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Opacity</span><input type="range" v-model.number="opacity" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{opacity}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Invert</span><input type="checkbox" v-model="invert" /></div>

							<hr style="margin:14px 0;opacity:.12;" />
							<span style="${SH}">Tone Curves</span>
							<div style="${ROW}"><span style="${LBL}">Shadows</span><input type="range" v-model.number="curves_shadows" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{curves_shadows}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Midtones</span><input type="range" v-model.number="curves_midtones" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{curves_midtones}}</span></div>
							<div style="${ROW}"><span style="${LBL}">Highlights</span><input type="range" v-model.number="curves_highlights" min="-100" max="100" style="flex:1;" /><span style="${VAL}">{{curves_highlights}}</span></div>

						</div>

						<div style="flex:0 0 220px;display:flex;flex-direction:column;align-items:center;gap:10px;padding-top:36px;">
							<span style="${SH}margin:0 0 6px;">Preview</span>
							<div style="background:repeating-conic-gradient(#444 0% 25%,#2b2b2b 0% 50%) 0/16px 16px;border:1px solid rgba(255,255,255,.07);width:200px;height:200px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
								<img :src="frames[frameIndex]" style="max-width:200px;max-height:200px;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;" />
							</div>
							<div style="display:flex;align-items:center;gap:10px;justify-content:center;">
								<button @click="prev" :disabled="frames.length <= 1" style="padding:2px 10px;">&#9664;</button>
								<span style="font-size:12px;opacity:.55;min-width:72px;text-align:center;">{{frameIndex === 0 ? 'Source' : 'Iter. ' + frameIndex}} / {{frames.length - 1}}</span>
								<button @click="next" :disabled="frames.length <= 1" style="padding:2px 10px;">&#9654;</button>
							</div>
						</div>
					</div>
				`,
			},
			onConfirm() { dialog.hide(); runIterate(texture, live); },
		});
		dialog.show();
	}

	function injectTextureMenu() {
		let menu = Texture.prototype.menu;
		if (!menu) return;
		if (typeof menu.addAction === 'function') {
			if (!menu.structure || !menu.structure.includes('item_iterate_texture')) menu.addAction('item_iterate_texture');
		} else if (Array.isArray(menu.structure)) {
			if (!menu.structure.includes('item_iterate_texture')) menu.structure.push('item_iterate_texture');
		}
	}

	function ejectTextureMenu() {
		let menu = Texture.prototype.menu;
		if (!menu) return;
		if (typeof menu.removeAction === 'function') try { menu.removeAction('item_iterate_texture'); } catch (e) {}
		if (Array.isArray(menu.structure)) {
			let idx = menu.structure.indexOf('item_iterate_texture');
			if (idx !== -1) menu.structure.splice(idx, 1);
		}
	}

	function createDemoTexture() {
		if (typeof ModelProject === 'undefined' || typeof Texture === 'undefined') return;
		if (ModelProject.all.length === 0) {
			let proj = new ModelProject({
				name: 'ITEM_Texture_Sandbox',
				format: 'free'
			});
			proj.select();
		}
		
		// Create canvas for 16x16 red ruby gem
		let canvas = document.createElement('canvas');
		canvas.width = 16;
		canvas.height = 16;
		let ctx = canvas.getContext('2d');
		
		// Draw ruby gem
		ctx.fillStyle = '#4a0814';
		ctx.fillRect(6, 1, 4, 1);
		ctx.fillRect(4, 2, 2, 1); ctx.fillRect(10, 2, 2, 1);
		ctx.fillRect(2, 4, 2, 8); ctx.fillRect(12, 4, 2, 8);
		ctx.fillRect(4, 13, 2, 1); ctx.fillRect(10, 13, 2, 1);
		ctx.fillRect(6, 14, 4, 1);
		
		ctx.fillStyle = '#b81432';
		ctx.fillRect(6, 2, 4, 11);
		ctx.fillRect(4, 3, 8, 10);
		ctx.fillRect(3, 4, 10, 8);
		
		ctx.fillStyle = '#f85878';
		ctx.fillRect(5, 4, 2, 2);
		ctx.fillRect(4, 5, 2, 2);
		ctx.fillRect(6, 3, 2, 1);
		
		ctx.fillStyle = '#7a0c20';
		ctx.fillRect(9, 10, 3, 2);
		ctx.fillRect(10, 8, 2, 2);
		ctx.fillRect(7, 11, 2, 2);

		let dataUrl = canvas.toDataURL();
		let tex = new Texture({ name: 'ruby_gem.png' }).fromDataURL(dataUrl).add(true);
		
		setTimeout(() => {
			if (typeof Mode !== 'undefined' && Mode.all && Mode.all.edit) {
				Mode.all.edit.select();
			}
			openIterateDialog(tex);
			Blockbench.showQuickMessage('Auto-Loaded I.T.E.M Texture evolution macro!', 4500);
		}, 800);
	}

	function setup() {
		iterateAction = new Action('item_iterate_texture', {
			name: 'Iterate Texture...',
			description: 'Generate progressive texture iterations as duplicates or an animated spritesheet',
			icon: 'gradient',
			category: 'textures',
			click() { openIterateDialog(Texture.selected || (Texture.all.length ? Texture.all[0] : null)); },
		});
		MenuBar.addAction(iterateAction, 'edit');
		injectTextureMenu();
	}

	function teardown() {
		ejectTextureMenu();
		if (iterateAction) { iterateAction.delete(); iterateAction = null; }
	}

	Plugin.register('item', {
		title: 'I.T.E.M',
		author: 'Archontas',
		icon: 'gradient',
		description: 'Iterative Texture Evolution Macro — generate progressive texture variations as duplicate textures or an animated spritesheet.',
		version: '1.0.0',
		min_version: '4.9.0',
		variant: 'both',
		await_loading: true,
		onload()     { 
			setup(); 
			if (typeof window !== 'undefined' && window.location && (window.location.search.includes('item.js') || window.location.search.includes('item'))) {
				setTimeout(createDemoTexture, 1500);
			}
		},
		onunload()   { this.onuninstall(); },
		onuninstall(){ teardown(); },
	});
})();
