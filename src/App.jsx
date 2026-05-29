import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  Play, 
  RefreshCw, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Code, 
  SlidersHorizontal,
  Flame,
  Settings,
  Image as ImageIcon,
  Compass,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';

// Custom inline SVG component for Github icon
const GithubIcon = ({ size = 20, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function App() {
  // --- STATE FOR DYNAMIC GITHUB FETCHING ---
  const [megRelease, setMegRelease] = useState({
    version: 'v1.1.2',
    downloads: 1420,
    date: 'May 2026',
    downloadUrl: 'https://github.com/Archontas123/ModelEngine-Entity-BB-Plugin/releases/latest/download/meg.js',
    changelog: 'Added OBB hitbox support, improved HEAD bone pivot validation, and resolved flipbook detection warnings.',
    loading: true
  });
  
  const [itemRelease, setItemRelease] = useState({
    version: 'v1.0.1',
    downloads: 832,
    date: 'May 2026',
    downloadUrl: 'https://github.com/Archontas123/I.T.E.M-BB-Plugin/releases/latest/download/item.js',
    changelog: 'Implemented End Result interpolation algorithms, optimized previews with canvas frames debouncing, and stashed multi-layer exports.',
    loading: true
  });

  const [copiedMeg, setCopiedMeg] = useState(false);
  const [copiedItem, setCopiedItem] = useState(false);

  // --- STATE FOR STATIC IFRAME URL RESOLUTION ---
  const [iframeMegUrl, setIframeMegUrl] = useState('');
  const [iframeItemUrl, setIframeItemUrl] = useState('');

  // --- STATE FOR DYNAMIC SCROLL TRANSITION ---
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      let pathname = window.location.pathname;
      if (!pathname.endsWith('/')) {
        pathname += '/';
      }
      
      // Construct dynamic absolute URLs for both plugin JS files
      const megPluginUrl = origin + pathname + 'meg.js';
      const itemPluginUrl = origin + pathname + 'item.js';
      
      // Build relative static Blockbench loader links with preloaded query params
      setIframeMegUrl(origin + pathname + 'blockbench/index.html?plugins=' + encodeURIComponent(megPluginUrl));
      setIframeItemUrl(origin + pathname + 'blockbench/index.html?plugins=' + encodeURIComponent(itemPluginUrl));

      // Scroll listener to update header appearance dynamically
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 15);
      };
      
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // initial load capture

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    // Fetch MEG Release Info
    fetch('https://api.github.com/repos/Archontas123/ModelEngine-Entity-BB-Plugin/releases/latest')
      .then(res => {
        if (!res.ok) throw new Error('API Rate Limited');
        return res.json();
      })
      .then(data => {
        const downloadCount = data.assets?.reduce((sum, a) => sum + (a.download_count || 0), 0) || 1420;
        const pubDate = new Date(data.published_at);
        const formattedDate = pubDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const jsAsset = data.assets?.find(a => a.name.endsWith('.js'));
        
        setMegRelease({
          version: data.tag_name || 'v1.1.2',
          downloads: downloadCount > 0 ? downloadCount : 1420,
          date: formattedDate,
          downloadUrl: jsAsset ? jsAsset.browser_download_url : 'https://github.com/Archontas123/ModelEngine-Entity-BB-Plugin/releases/latest/download/meg.js',
          changelog: data.body ? data.body.split('\n').slice(0, 3).join(' ').replace(/[*#]/g, '') : 'MEG project structure auto-validations and custom Blockbench rigging support.',
          loading: false
        });
      })
      .catch(() => {
        setMegRelease(prev => ({ ...prev, loading: false }));
      });

    // Fetch ITEM Release Info
    fetch('https://api.github.com/repos/Archontas123/I.T.E.M-BB-Plugin/releases/latest')
      .then(res => {
        if (!res.ok) throw new Error('API Rate Limited');
        return res.json();
      })
      .then(data => {
        const downloadCount = data.assets?.reduce((sum, a) => sum + (a.download_count || 0), 0) || 832;
        const pubDate = new Date(data.published_at);
        const formattedDate = pubDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const jsAsset = data.assets?.find(a => a.name.endsWith('.js'));
        
        setItemRelease({
          version: data.tag_name || 'v1.0.1',
          downloads: downloadCount > 0 ? downloadCount : 832,
          date: formattedDate,
          downloadUrl: jsAsset ? jsAsset.browser_download_url : 'https://github.com/Archontas123/I.T.E.M-BB-Plugin/releases/latest/download/item.js',
          changelog: data.body ? data.body.split('\n').slice(0, 3).join(' ').replace(/[*#]/g, '') : 'Iterative texture generator macros, frame controllers and MCMETA animation compilation.',
          loading: false
        });
      })
      .catch(() => {
        setItemRelease(prev => ({ ...prev, loading: false }));
      });
  }, []);

  const copyInstallCommand = (plugin) => {
    if (plugin === 'meg') {
      navigator.clipboard.writeText('https://github.com/Archontas123/ModelEngine-Entity-BB-Plugin/releases/latest/download/meg.js');
      setCopiedMeg(true);
      setTimeout(() => setCopiedMeg(false), 2000);
    } else {
      navigator.clipboard.writeText('https://github.com/Archontas123/I.T.E.M-BB-Plugin/releases/latest/download/item.js');
      setCopiedItem(true);
      setTimeout(() => setCopiedItem(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-voxel-bg voxel-grid text-gray-200 font-sans selection:bg-accent-amber selection:text-black pb-24">
      
      {/* 1. Header (Glassmorphic & Floating) */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-voxel-bg/60 backdrop-blur-md border-b border-voxel-border/80 shadow-lg py-1' 
          : 'bg-transparent border-b border-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 transition-transform duration-300">
            <div className="bg-accent-amber p-1.5 border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black">
              <Code size={18} className="stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-white tracking-wider text-sm sm:text-base uppercase flex items-center gap-1.5">
              Archontas' <span className="text-accent-amber font-pixel text-2xl tracking-normal normal-case">BB Plugins</span>
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8 font-display text-sm font-semibold tracking-wide uppercase">
            <a href="#meg" className="text-gray-400 hover:text-meg-blue transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-meg-blue block"></span> ModelEngine Format
            </a>
            <a href="#item" className="text-gray-400 hover:text-item-green transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-item-green block text-xs lowercase"></span> i.t.e.ms
            </a>
            <a href="#install" className="text-gray-400 hover:text-accent-amber transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent-amber block"></span> Installation
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/Archontas123" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white p-2 border border-transparent hover:border-voxel-border bg-voxel-card/30 hover:bg-voxel-card transition-all"
            >
              <GithubIcon size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-voxel-border bg-radial-[at_center_top] from-amber-500/5 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">


          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight uppercase leading-none">
            Arch's <br className="sm:hidden" />
            <span className="text-accent-amber">
              BB Plugins
            </span>
          </h1>

          <p className="max-w-xl mx-auto mt-6 text-gray-400 text-sm sm:text-base leading-relaxed text-center">
            Hey! I'm Archontas. I made these Blockbench plugins to help out some friends, and now I'm sharing them with the community. Got feedback or issues? Send your complaints over on <a href="https://github.com/Archontas123" target="_blank" rel="noopener noreferrer" className="text-accent-amber hover:underline font-semibold">GitHub Issues</a>!
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a 
              href="#meg" 
              className="w-full sm:w-auto bg-voxel-card hover:bg-[#1a1c26] text-meg-blue border border-meg-blue shadow-[3px_3px_0px_rgba(59,130,246,0.3)] hover:shadow-[4px_4px_0px_rgba(59,130,246,0.5)] px-8 py-3.5 font-display font-extrabold uppercase text-sm blocky-button cursor-pointer text-center"
            >
              ModelEngine Format
            </a>
            <a 
              href="#item" 
              className="w-full sm:w-auto bg-voxel-card hover:bg-[#131d1d] text-item-green border border-item-green shadow-[3px_3px_0px_rgba(16,185,129,0.3)] hover:shadow-[4px_4px_0px_rgba(16,185,129,0.5)] px-8 py-3.5 font-display font-extrabold uppercase text-sm blocky-button cursor-pointer text-center"
            >
              Texture Editing Macros
            </a>
          </div>
        </div>
      </section>

      {/* 3. MEG Entity Section */}
      <section id="meg" className="py-20 border-b border-voxel-border scroll-mt-16 bg-gradient-to-b from-transparent to-meg-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Info */}
          <div className="max-w-3xl space-y-4 mb-12">
            
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase leading-none">
              ModelEngine Format / <span className="text-meg-blue font-pixel tracking-normal normal-case glow-text-blue">meg.js</span>
            </h2>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed text-left">
              Automates bone prefix tagging, passenger seating, custom light level mapping, and pivot alignments under a strict ModelEngine format.
            </p>
          </div>

          {/* REAL EMBEDDED BLOCKBENCH CLIENT: MEG Entity Plugin Preloaded */}
          <div className="hidden md:block w-full mb-16">
            
            <div className="w-full h-[620px] border border-meg-blue bg-[#0f1012] flex flex-col shadow-[12px_12px_0px_rgba(0,0,0,0.9)] relative rounded-lg overflow-hidden animate-fadeIn">

              
              {iframeMegUrl ? (
                <iframe 
                  src={iframeMegUrl} 
                  className="flex-1 w-full border-none bg-[#1e2127]"
                  title="Blockbench Web App Client - MEG Entity"
                  allow="clipboard-read; clipboard-write; fullscreen"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#181b1f] text-gray-500 font-mono text-xs">
                  <RefreshCw size={24} className="animate-spin mb-2" />
                  <span>Loading Blockbench Frame Engine...</span>
                </div>
              )}
            </div>
          </div>

          {/* Rigging Feature Details */}
          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-meg-blue" /> 1-Click Hitbox & Shadow
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Add hitbox and shadow elements dynamically inside Blockbench. Automatically initializes coordinates (pivot Y=28) and locks structures under size boundaries.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Layers size={16} className="text-meg-blue" /> Bone Behavior Prefix
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Right-click groups and select prefixes like <code>h_</code> for head rotators, <code>p_</code> for passenger seating mounts, or <code>g_</code> for ghost structural linkages.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Layers size={16} className="text-meg-blue" /> VariantVisibility Arrays
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Saves custom bone visibility states as named sub-model configurations inside the <code>.bbmodel</code> file. Allows server-side engines to dynamically toggle custom outfits or equipment skins on a single entity at runtime.
              </p>
            </div>



            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Flame size={16} className="text-meg-blue" /> Light Emission Tool
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Define custom light emission values (0–15) on cuboids. Compiles values directly into model metadata for server spawn engines to parse.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Code size={16} className="text-meg-blue" /> Scoped MEG Format
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Registers the custom <code>meg_entity</code> file type inside Blockbench. Disables incompatible mesh tools while prioritizing locators, UV maps, and animations.
              </p>
            </div>
          </div>

          {/* Download & Copy Panel */}
          <div className="bg-voxel-card border border-voxel-border p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.5)] mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="font-pixel text-meg-blue text-lg uppercase font-bold tracking-wider">Rigging Plugin Download</span>
              <p className="text-xs text-gray-400">Dynamically compiled script. Drop the downloaded `.js` file directly into your Blockbench plugins viewport.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <a 
                href={megRelease.downloadUrl}
                className="flex-1 md:flex-initial text-center bg-meg-blue hover:bg-blue-400 text-black px-6 py-2.5 font-display font-extrabold uppercase text-xs blocky-button cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={14} className="stroke-[2.5]" /> Download meg.js ({megRelease.version})
              </a>
              
              <button 
                onClick={() => copyInstallCommand('meg')}
                className="flex-1 md:flex-initial bg-voxel-bg hover:bg-voxel-border text-gray-300 hover:text-white border border-voxel-border px-5 py-2.5 font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedMeg ? <Check size={12} className="text-meg-blue" /> : <Copy size={12} />}
                {copiedMeg ? 'Copied URL!' : 'Copy Release Link'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. I.T.E.M Section */}
      <section id="item" className="py-20 border-b border-voxel-border scroll-mt-16 bg-gradient-to-b from-transparent to-item-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Info */}
          <div className="max-w-3xl space-y-4 mb-12">

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase leading-none">
              <span className="normal-case">iterative texture editing macros FOR i.t.e.ms</span> / <span className="text-item-green font-pixel tracking-normal normal-case glow-text-green">item.js</span>
            </h2>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed text-left">
              Runs HSL, contrast, and Tone Curve macros directly over selection, layer, or full texture scopes. Procedurally generate durability damage cycles or color gradients without external image editor round-trips.
            </p>
          </div>

          {/* REAL EMBEDDED BLOCKBENCH CLIENT: I.T.E.M Plugin Preloaded */}
          <div className="hidden md:block w-full mb-16">

            <div className="w-full h-[620px] border border-item-green bg-[#0f1012] flex flex-col shadow-[12px_12px_0px_rgba(0,0,0,0.9)] relative rounded-lg overflow-hidden animate-fadeIn">

              
              {iframeItemUrl ? (
                <iframe 
                  src={iframeItemUrl} 
                  className="flex-1 w-full border-none bg-[#1e2127]"
                  title="Blockbench Web App Client - I.T.E.M"
                  allow="clipboard-read; clipboard-write; fullscreen"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#181b1f] text-gray-500 font-mono text-xs">
                  <RefreshCw size={24} className="animate-spin mb-2" />
                  <span>Loading Blockbench Frame Engine...</span>
                </div>
              )}
            </div>
          </div>

          {/* Texture Feature Details */}
          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Layers size={16} className="text-item-green" /> Smart Scope detection
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Smart targeting scope filters. Automatically runs coordinates over active marquee pixel selections, specific layers, or the full texture frame.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <SlidersHorizontal size={16} className="text-item-green" /> HSL & Luminance controls
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Adjust hue angles, saturation scaling, overall brightness levels, contrast ranges, and multi-layer opacity offsets in real-time.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Eye size={16} className="text-item-green" /> Realtime frame navigator
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Scrub through iterations instantly inside the viewport preview tab. Updates are debounced to standard refresh cycles for ultra-smooth scrubbing.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <SlidersHorizontal size={16} className="text-item-green" /> Spline Tone Curves
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Fine-tune shadows, midtones, and highlights individually. Utilizes a quadratic weight blending algorithm for beautiful progressive shading.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <ImageIcon size={16} className="text-item-green" /> Spritesheet Compiler
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Batch export iteration tracks directly into active project folders as horizontal or vertical spritesheet strips with a single button.
              </p>
            </div>

            <div className="bg-voxel-card border border-voxel-border p-5 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              <h4 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                <Play size={16} className="text-item-green" /> Minecraft mcmeta Support
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left">
                Automatically generate standard Minecraft <code>.mcmeta</code> configuration script blocks matching editor framerates for immediate game deployment.
              </p>
            </div>
          </div>

          {/* Download Panel */}
          <div className="bg-voxel-card border border-voxel-border p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.5)] mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="font-pixel text-item-green text-lg uppercase font-bold tracking-wider">Texture Plugin Download</span>
              <p className="text-xs text-gray-400">Dynamically compiled macro script. Drop the downloaded `.js` file directly into your Blockbench plugins viewport.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <a 
                href={itemRelease.downloadUrl}
                className="flex-1 md:flex-initial text-center bg-item-green hover:bg-emerald-400 text-black px-6 py-2.5 font-display font-extrabold uppercase text-xs blocky-button cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={14} className="stroke-[2.5]" /> Download item.js ({itemRelease.version})
              </a>
              
              <button 
                onClick={() => copyInstallCommand('item')}
                className="flex-1 md:flex-initial bg-voxel-bg hover:bg-voxel-border text-gray-300 hover:text-white border border-voxel-border px-5 py-2.5 font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedItem ? <Check size={12} className="text-item-green" /> : <Copy size={12} />}
                {copiedItem ? 'Copied URL!' : 'Copy Release Link'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Unified Installation Guide */}
      <section id="install" className="py-20 border-b border-voxel-border scroll-mt-16 bg-radial-[at_center_bottom] from-blue-500/5 via-transparent to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              Plugin Setup <span className="text-accent-amber">Guide</span>
            </h2>
            <p className="max-w-xl mx-auto text-gray-400 text-sm sm:text-base leading-relaxed">
              Blockbench plugins are super easy to set up. Follow these fast instructions to load the compiled scripts and supercharge your viewport editor.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="bg-voxel-card border-2 border-voxel-border p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.6)] flex gap-6 items-start">
              <div className="bg-accent-amber border-2 border-black text-black font-pixel text-2xl w-12 h-12 flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                01
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold uppercase text-white text-base">Download the script file</h3>
                <p className="text-sm text-gray-400 leading-relaxed text-left">
                  Select either <a href={megRelease.downloadUrl} className="text-meg-blue hover:underline">meg.js</a> or <a href={itemRelease.downloadUrl} className="text-item-green hover:underline">item.js</a> and download the direct raw Javascript script from the latest dynamic release channel to your desktop.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-voxel-card border-2 border-voxel-border p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.6)] flex gap-6 items-start">
              <div className="bg-accent-amber border-2 border-black text-black font-pixel text-2xl w-12 h-12 flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                02
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold uppercase text-white text-base">Launch blockbench</h3>
                <p className="text-sm text-gray-400 leading-relaxed text-left">
                  Open Blockbench (Requires version <b>4.9.0</b> or later for absolute compatibility). Navigate to the top menu and select <b>File</b> → <b>Plugins...</b> to open the local extensions manager dashboard.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-voxel-card border-2 border-voxel-border p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.6)] flex gap-6 items-start">
              <div className="bg-accent-amber border-2 border-black text-black font-pixel text-2xl w-12 h-12 flex-shrink-0 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                03
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold uppercase text-white text-base">Import locally</h3>
                <p className="text-sm text-gray-400 leading-relaxed text-left">
                  Click on the <b>Load Plugin from File</b> icon (represented by a folder overlay button at the top). Choose the downloaded <code>meg.js</code> or <code>item.js</code> script file and confirm. The plugin is loaded!
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 7. Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-voxel-border pt-12 pb-16 flex flex-col items-center gap-6 text-xs text-gray-500 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
          <div className="flex items-center space-x-2">
            <Code size={14} className="text-accent-amber" />
            <span>Archontas Blockbench Portal © {new Date().getFullYear()}</span>
          </div>
          <div className="flex space-x-6">
            <a href="https://github.com/Archontas123/ModelEngine-Entity-BB-Plugin" target="_blank" className="hover:text-meg-blue transition-colors">MEG Repository</a>
            <a href="https://github.com/Archontas123/I.T.E.M-BB-Plugin" target="_blank" className="hover:text-item-green transition-colors">I.T.E.M Repository</a>
          </div>
          <div>
            <span>Crafted using React + Vite + Tailwind CSS</span>
          </div>
        </div>
        <div className="w-full text-center text-[10px] text-gray-600 leading-relaxed border-t border-voxel-border/30 pt-6">
          Blockbench is a registered trademark of Jannis Tobias Petersen. This website is a third-party developer portal and is not affiliated with, endorsed by, or associated with Jannis Tobias Petersen or the Blockbench project. Static web assets of Blockbench are distributed under the GNU General Public License v3.0.
        </div>
      </footer>
    </div>
  );
}

export default App;
