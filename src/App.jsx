import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Check, 
  Copy, 
  DownloadCloud, 
  Box,
  Info,
  ChevronLeft,
  Settings,
  Sliders,
  Play
} from 'lucide-react';

import './index.css';

function App() {
  const [copiedMeg, setCopiedMeg] = useState(false);
  const [copiedItem, setCopiedItem] = useState(false);
  const [iframeMegUrl, setIframeMegUrl] = useState('');
  const [iframeItemUrl, setIframeItemUrl] = useState('');

  // Lazy load flags to prevent loading 2 heavy iframes at once
  const [megLoaded, setMegLoaded] = useState(false);
  const [itemLoaded, setItemLoaded] = useState(false);

  // Floating Drawer States
  const [megDrawerOpen, setMegDrawerOpen] = useState(false);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);

  // Local plugin downloads
  const megDownloadUrl = './meg.js';
  const itemDownloadUrl = './item.js';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      let pathname = window.location.pathname;
      if (!pathname.endsWith('/')) {
        pathname += '/';
      }
      
      const megPluginUrl = origin + pathname + 'meg.js';
      const itemPluginUrl = origin + pathname + 'item.js';
      
      setIframeMegUrl(origin + pathname + 'blockbench/index.html?plugins=' + encodeURIComponent(megPluginUrl));
      setIframeItemUrl(origin + pathname + 'blockbench/index.html?plugins=' + encodeURIComponent(itemPluginUrl));
    }
  }, []);

  const copyInstallCommand = (plugin) => {
    const url = window.location.origin + window.location.pathname + (plugin === 'meg' ? 'meg.js' : 'item.js');
    navigator.clipboard.writeText(url);
    if (plugin === 'meg') {
      setCopiedMeg(true);
      setTimeout(() => setCopiedMeg(false), 2000);
    } else {
      setCopiedItem(true);
      setTimeout(() => setCopiedItem(false), 2000);
    }
  };

  return (
    <div className="split-container">
      {/* 1. Global Minimal Header */}
      <header className="split-header">
        <div className="logo">
          <Box size={18} />
          <span>Archontas' <span>Workspaces</span></span>
        </div>
        <a 
          href="https://github.com/Archontas123/archontas-bb-plugins" 
          target="_blank" 
          rel="noreferrer" 
          className="github-link"
        >
          GitHub Repo
        </a>
      </header>

      {/* 2. Left: MEG Rigging Workspace */}
      <section className="workspace-pane pane-meg">
        <div className="pane-heading">
          <div className="pane-title">
            <h2 style={{ color: 'var(--color-meg)' }}>ModelEngine Rigging</h2>
            <p>Automates bone structure formatting, prefix rigging, custom hitbox mounts, and cuboid light compiles.</p>
          </div>
          <div className="pane-actions">
            <a href={megDownloadUrl} className="retro-btn btn-meg" download>
              <DownloadCloud size={16} /> Download meg.js
            </a>
            <button onClick={() => copyInstallCommand('meg')} className="retro-btn btn-outline">
              {copiedMeg ? <Check size={16} style={{ color: 'var(--color-meg)' }} /> : <Copy size={16} />}
              {copiedMeg ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
        
        <div className="viewport-wrapper">
          {megLoaded ? (
            <>
              {/* Info Toggle Overlay */}
              <button 
                className="drawer-toggle" 
                onClick={() => setMegDrawerOpen(!megDrawerOpen)}
              >
                {megDrawerOpen ? <ChevronLeft size={14} /> : <Info size={14} />}
                {megDrawerOpen ? 'Close Details' : 'View Features'}
              </button>

              {/* Features Drawer */}
              <div className={`features-drawer ${megDrawerOpen ? 'open' : ''}`}>
                <h3 className="drawer-title" style={{ color: 'var(--color-meg)' }}>
                  <Settings size={18} /> MEG Capabilities
                </h3>
                <div className="drawer-list">
                  <div className="drawer-item">
                    <h4>1-Click Hitbox & Shadow</h4>
                    <p>Adds size bounds and locked coordinates to match standard ModelEngine rigging specifications instantly.</p>
                  </div>
                  <div className="drawer-item">
                    <h4>Bone Prefixes</h4>
                    <p>Apply rotator and passenger tags directly to rigging bones (`h_` for head rotator, `p_` for seating mounts).</p>
                  </div>
                  <div className="drawer-item">
                    <h4>Light Emission Compile</h4>
                    <p>Write custom emission levels (0–15) directly into your model metadata format for server-side processing.</p>
                  </div>
                  <div className="drawer-item">
                    <h4>VariantVisibility</h4>
                    <p>Save multiple outfit configurations as visible groupings inside a single output model.</p>
                  </div>
                </div>
              </div>

              {iframeMegUrl ? (
                <iframe src={iframeMegUrl} title="Blockbench Viewport - MEG Plugin" />
              ) : (
                <div className="loading-screen">
                  <RefreshCw size={20} className="spin" />
                  <span>Initializing MEG Environment...</span>
                </div>
              )}
            </>
          ) : (
            <div className="launch-preview">
              <Box size={40} style={{ color: 'var(--color-meg)' }} />
              <h3>ModelEngine Workspace Client</h3>
              <p>Loads a full, live Blockbench web client directly inside this viewport, preloaded with the meg.js plugin.</p>
              <button 
                onClick={() => setMegLoaded(true)} 
                className="retro-btn btn-meg"
                style={{ marginTop: '0.5rem' }}
              >
                <Play size={14} fill="currentColor" /> Launch Editor
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Right: ITEM Texture Workspace */}
      <section className="workspace-pane pane-item">
        <div className="pane-heading">
          <div className="pane-title">
            <h2 style={{ color: 'var(--color-item)' }}>I.T.E.M Texture Macros</h2>
            <p>Apply HSL adjustments, spline tone curves, and batch compile spritesheets/mcmeta animation assets.</p>
          </div>
          <div className="pane-actions">
            <a href={itemDownloadUrl} className="retro-btn btn-item" download>
              <DownloadCloud size={16} /> Download item.js
            </a>
            <button onClick={() => copyInstallCommand('item')} className="retro-btn btn-outline">
              {copiedItem ? <Check size={16} style={{ color: 'var(--color-item)' }} /> : <Copy size={16} />}
              {copiedItem ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="viewport-wrapper">
          {itemLoaded ? (
            <>
              {/* Info Toggle Overlay */}
              <button 
                className="drawer-toggle" 
                onClick={() => setItemDrawerOpen(!itemDrawerOpen)}
              >
                {itemDrawerOpen ? <ChevronLeft size={14} /> : <Info size={14} />}
                {itemDrawerOpen ? 'Close Details' : 'View Features'}
              </button>

              {/* Features Drawer */}
              <div className={`features-drawer ${itemDrawerOpen ? 'open' : ''}`}>
                <h3 className="drawer-title" style={{ color: 'var(--color-item)' }}>
                  <Sliders size={18} /> I.T.E.M Capabilities
                </h3>
                <div className="drawer-list">
                  <div className="drawer-item">
                    <h4>HSL adjustment overlays</h4>
                    <p>Fine-tune colors, contrast scales, and hue shifts directly on individual layers in real-time.</p>
                  </div>
                  <div className="drawer-item">
                    <h4>Spline Tone Curves</h4>
                    <p>Gradually scale shading weights from midtones, highlights, and shadows using cubic interpolation rules.</p>
                  </div>
                  <div className="drawer-item">
                    <h4>Frame scrubbing controllers</h4>
                    <p>Scrub through animation lists with automated debouncing to protect system performance.</p>
                  </div>
                  <div className="drawer-item">
                    <h4>mcmeta Compile</h4>
                    <p>Automatically generate valid Minecraft mcmeta structure blocks to match custom animation frame rates.</p>
                  </div>
                </div>
              </div>

              {iframeItemUrl ? (
                <iframe src={iframeItemUrl} title="Blockbench Viewport - ITEM Plugin" />
              ) : (
                <div className="loading-screen">
                  <RefreshCw size={20} className="spin" />
                  <span>Initializing ITEM Environment...</span>
                </div>
              )}
            </>
          ) : (
            <div className="launch-preview">
              <Sliders size={40} style={{ color: 'var(--color-item)' }} />
              <h3>I.T.E.M Workspace Client</h3>
              <p>Loads a full, live Blockbench web client directly inside this viewport, preloaded with the item.js plugin.</p>
              <button 
                onClick={() => setItemLoaded(true)} 
                className="retro-btn btn-item"
                style={{ marginTop: '0.5rem' }}
              >
                <Play size={14} fill="currentColor" /> Launch Editor
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
