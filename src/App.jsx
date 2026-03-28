import { useState, useCallback, useMemo, useRef } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────
const F = "'Space Mono', monospace";
const ACCENT = "#e8ff47";

// ─── DEFAULT COLORS ─────────────────────────────────────────────
const DEFAULT_COLORS = {
  dark:      { bg:"#0a0a0a", fg:"#d4d4d4", label:"Dark",      g:"core" },
  light:     { bg:"#f0f0ec", fg:"#0a0a0a", label:"Light",     g:"core" },
  acid:      { bg:"#0a0a0a", fg:"#e8ff47", label:"Acid",      g:"core" },
  mono:      { bg:"#ffffff", fg:"#000000", label:"Mono",      g:"core" },
  inverted:  { bg:"#e8ff47", fg:"#0a0a0a", label:"Inverted",  g:"core" },
  blueprint: { bg:"#0b1628", fg:"#4a9eff", label:"Blueprint", g:"tone" },
  ember:     { bg:"#0a0a0a", fg:"#ff6b35", label:"Ember",     g:"tone" },
  phantom:   { bg:"#0a0a0a", fg:"#8b5cf6", label:"Phantom",   g:"tone" },
  ice:       { bg:"#0a0a0a", fg:"#67e8f9", label:"Ice",       g:"tone" },
  rose:      { bg:"#0a0a0a", fg:"#fb7185", label:"Rose",      g:"tone" },
  forest:    { bg:"#0a0a0a", fg:"#4ade80", label:"Forest",    g:"tone" },
  sand:      { bg:"#1a1814", fg:"#d4c5a0", label:"Sand",      g:"tone" },
  steel:     { bg:"#111318", fg:"#94a3b8", label:"Steel",     g:"tone" },
  amber:     { bg:"#0a0a0a", fg:"#fbbf24", label:"Amber",     g:"tone" },
  mint:      { bg:"#0a0a0a", fg:"#34d399", label:"Mint",      g:"tone" },
  lavender:  { bg:"#0a0a0a", fg:"#c4b5fd", label:"Lavender",  g:"tone" },
  cream:     { bg:"#faf8f2", fg:"#2d2926", label:"Cream",     g:"neutral" },
  fog:       { bg:"#e8e8e8", fg:"#333333", label:"Fog",       g:"neutral" },
  midnight:  { bg:"#0f172a", fg:"#e2e8f0", label:"Midnight",  g:"neutral" },
  paper:     { bg:"#f5f0e6", fg:"#3d3529", label:"Paper",     g:"neutral" },
  carbon:    { bg:"#1c1c1c", fg:"#a0a0a0", label:"Carbon",    g:"neutral" },
};

const GROUPS = [
  { key:"core", label:"CORE" },
  { key:"tone", label:"TONE" },
  { key:"neutral", label:"NEUTRAL" },
  { key:"custom", label:"CUSTOM" },
];

// ─── SVG MARK PRIMITIVES ────────────────────────────────────────

function die(fg,s){return `<g transform="scale(${s/100})"><rect x="10" y="10" width="80" height="80" stroke="${fg}" stroke-width="1.3" fill="none"/><rect x="26" y="26" width="48" height="48" stroke="${fg}" stroke-width="0.8" fill="none"/><line x1="30" y1="10" x2="30" y2="0" stroke="${fg}" stroke-width="1"/><line x1="50" y1="10" x2="50" y2="0" stroke="${fg}" stroke-width="1"/><line x1="70" y1="10" x2="70" y2="0" stroke="${fg}" stroke-width="1"/><line x1="30" y1="90" x2="30" y2="100" stroke="${fg}" stroke-width="1"/><line x1="50" y1="90" x2="50" y2="100" stroke="${fg}" stroke-width="1"/><line x1="70" y1="90" x2="70" y2="100" stroke="${fg}" stroke-width="1"/><line x1="10" y1="30" x2="0" y2="30" stroke="${fg}" stroke-width="1"/><line x1="10" y1="50" x2="0" y2="50" stroke="${fg}" stroke-width="1"/><line x1="10" y1="70" x2="0" y2="70" stroke="${fg}" stroke-width="1"/><line x1="90" y1="30" x2="100" y2="30" stroke="${fg}" stroke-width="1"/><line x1="90" y1="50" x2="100" y2="50" stroke="${fg}" stroke-width="1"/><line x1="90" y1="70" x2="100" y2="70" stroke="${fg}" stroke-width="1"/><path d="M42 64 L50 36 L58 64" stroke="${fg}" stroke-width="1.5" fill="none"/><line x1="44.5" y1="55" x2="55.5" y2="55" stroke="${fg}" stroke-width="1"/><circle cx="18" cy="18" r="3" stroke="${fg}" stroke-width="0.8" fill="none"/></g>`;}

function node(fg,s){return `<g transform="scale(${s/100})"><circle cx="50" cy="50" r="30" stroke="${fg}" stroke-width="1.3" fill="none"/><circle cx="50" cy="50" r="3" fill="${fg}"/><line x1="50" y1="18" x2="50" y2="0" stroke="${fg}" stroke-width="1"/><line x1="50" y1="82" x2="50" y2="100" stroke="${fg}" stroke-width="1"/><line x1="18" y1="50" x2="0" y2="50" stroke="${fg}" stroke-width="1"/><line x1="82" y1="50" x2="100" y2="50" stroke="${fg}" stroke-width="1"/><line x1="28.8" y1="28.8" x2="14.6" y2="14.6" stroke="${fg}" stroke-width="1"/><line x1="71.2" y1="28.8" x2="85.4" y2="14.6" stroke="${fg}" stroke-width="1"/><line x1="28.8" y1="71.2" x2="14.6" y2="85.4" stroke="${fg}" stroke-width="1"/><line x1="71.2" y1="71.2" x2="85.4" y2="85.4" stroke="${fg}" stroke-width="1"/><line x1="50" y1="24" x2="50" y2="32" stroke="${fg}" stroke-width="0.6"/><line x1="50" y1="68" x2="50" y2="76" stroke="${fg}" stroke-width="0.6"/><line x1="24" y1="50" x2="32" y2="50" stroke="${fg}" stroke-width="0.6"/><line x1="68" y1="50" x2="76" y2="50" stroke="${fg}" stroke-width="0.6"/></g>`;}

const FS = `<style>@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&amp;display=swap');.f{font-family:'Space Mono',monospace;}</style>`;

// ─── 40 SVG GENERATORS ──────────────────────────────────────────

const GEN = {
  // ── CORE MARKS ──
  original:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="620" height="400" viewBox="0 0 620 400">${FS}<rect width="620" height="400" fill="${b}"/><text x="175" y="72" class="f" fill="${f}" font-size="15" letter-spacing="2" opacity="0.7">AL-2026</text><text x="175" y="96" class="f" fill="${f}" font-size="15" letter-spacing="3">EXPERIMENTAL SOFTWARE</text><text x="175" y="120" class="f" fill="${f}" font-size="13" letter-spacing="2" opacity="0.5">THEALXLABS.CA</text><line x1="20" y1="195" x2="70" y2="195" stroke="${f}" stroke-width="1.2" opacity="0.6"/><line x1="30" y1="205" x2="70" y2="205" stroke="${f}" stroke-width="1.2" opacity="0.5"/><line x1="15" y1="215" x2="70" y2="215" stroke="${f}" stroke-width="1.2" opacity="0.4"/><line x1="35" y1="225" x2="70" y2="225" stroke="${f}" stroke-width="1.2" opacity="0.3"/><g transform="translate(85,150)">${die(f,100)}</g><g transform="translate(195,150)">${node(f,100)}</g><text x="320" y="195" class="f" fill="${f}" font-size="22" font-weight="700" letter-spacing="1">The Alx Labs</text><text x="320" y="220" class="f" fill="${f}" font-size="13" letter-spacing="3" opacity="0.7">DEVS FOR DEVS</text><text x="320" y="248" class="f" fill="${f}" font-size="16" opacity="0.4">\u00A9</text><text x="175" y="310" class="f" fill="${f}" font-size="15" letter-spacing="2" opacity="0.7">AL-2026</text><text x="175" y="334" class="f" fill="${f}" font-size="15" letter-spacing="3">EXPERIMENTAL SOFTWARE</text><text x="175" y="358" class="f" fill="${f}" font-size="13" letter-spacing="2" opacity="0.5">THEALXLABS.CA</text></svg>`,

  vertical:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="380" viewBox="0 0 240 380">${FS}<rect width="240" height="380" fill="${b}"/><text x="120" y="32" class="f" fill="${f}" font-size="9" letter-spacing="3" opacity="0.5" text-anchor="middle">AL-2026</text><line x1="90" y1="42" x2="150" y2="42" stroke="${f}" stroke-width="0.6" opacity="0.2"/><g transform="translate(88,56)">${die(f,64)}</g><text x="120" y="138" class="f" fill="${f}" font-size="8" opacity="0.25" text-anchor="middle">\u00D7</text><g transform="translate(88,148)">${node(f,64)}</g><line x1="90" y1="225" x2="150" y2="225" stroke="${f}" stroke-width="0.6" opacity="0.2"/><text x="120" y="254" class="f" fill="${f}" font-size="15" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="120" y="278" class="f" fill="${f}" font-size="9" letter-spacing="3" opacity="0.6" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><text x="120" y="300" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.35" text-anchor="middle">THEALXLABS.CA  \u00A9</text><text x="120" y="360" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.2" text-anchor="middle">DEVS FOR DEVS</text></svg>`,

  technical:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="220" viewBox="0 0 500 220">${FS}<rect width="500" height="220" fill="${b}"/><line x1="20" y1="16" x2="480" y2="16" stroke="${f}" stroke-width="0.5" opacity="0.15"/><line x1="20" y1="12" x2="20" y2="20" stroke="${f}" stroke-width="0.5" opacity="0.25"/><line x1="480" y1="12" x2="480" y2="20" stroke="${f}" stroke-width="0.5" opacity="0.25"/><text x="250" y="13" class="f" fill="${f}" font-size="6" letter-spacing="2" opacity="0.3" text-anchor="middle">THEALXLABS.CA</text><text x="52" y="70" class="f" fill="${f}" font-size="7" opacity="0.4" letter-spacing="1" text-anchor="end">MARK.01</text><text x="52" y="82" class="f" fill="${f}" font-size="6" opacity="0.25" letter-spacing="1" text-anchor="end">IC\u2014DIE</text><line x1="58" y1="75" x2="78" y2="75" stroke="${f}" stroke-width="0.6" opacity="0.3"/><circle cx="80" cy="75" r="1.5" fill="${f}" opacity="0.3"/><g transform="translate(90,35)">${die(f,80)}</g><text x="200" y="80" class="f" fill="${f}" font-size="8" opacity="0.2">\u00D7</text><g transform="translate(220,35)">${node(f,80)}</g><circle cx="315" cy="75" r="1.5" fill="${f}" opacity="0.3"/><line x1="317" y1="75" x2="337" y2="75" stroke="${f}" stroke-width="0.6" opacity="0.3"/><text x="343" y="70" class="f" fill="${f}" font-size="7" opacity="0.4" letter-spacing="1">MARK.02</text><text x="343" y="82" class="f" fill="${f}" font-size="6" opacity="0.25" letter-spacing="1">SIGNAL\u2014NODE</text><line x1="160" y1="140" x2="340" y2="140" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="250" y="166" class="f" fill="${f}" font-size="16" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="195" y="192" class="f" fill="${f}" font-size="9" letter-spacing="3" opacity="0.5">EXPERIMENTAL SOFTWARE</text><text x="425" y="192" class="f" fill="${f}" font-size="9" opacity="0.3">AL-2026 \u00A9</text></svg>`,

  monumental:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="340" height="260" viewBox="0 0 340 260">${FS}<rect width="340" height="260" fill="${b}"/><text x="24" y="28" class="f" fill="${f}" font-size="7" letter-spacing="3" opacity="0.4">AL-2026 \u2014 EXPERIMENTAL SOFTWARE</text><g transform="translate(24,44)">${die(f,110)}</g><text x="150" y="92" class="f" fill="${f}" font-size="30" font-weight="700" letter-spacing="1">The</text><text x="150" y="124" class="f" fill="${f}" font-size="30" font-weight="700" letter-spacing="1">Alx</text><text x="150" y="156" class="f" fill="${f}" font-size="30" font-weight="700" letter-spacing="1">Labs</text><text x="24" y="195" class="f" fill="${f}" font-size="9" letter-spacing="2" opacity="0.5">DEVS FOR DEVS</text><text x="200" y="195" class="f" fill="${f}" font-size="8" opacity="0.3" letter-spacing="1.5">THEALXLABS.CA \u00A9</text><line x1="24" y1="210" x2="316" y2="210" stroke="${f}" stroke-width="0.5" opacity="0.1"/><g transform="translate(24,220)">${node(f,28)}</g><text x="60" y="240" class="f" fill="${f}" font-size="7" opacity="0.2" letter-spacing="2">TORONTO, CANADA</text></svg>`,

  specimen:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="540" height="340" viewBox="0 0 540 340">${FS}<rect width="540" height="340" fill="${b}"/><text x="24" y="32" class="f" fill="${f}" font-size="16" font-weight="700" letter-spacing="2">The Alx Labs</text><text x="24" y="48" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.5">MARK SPECIMEN SHEET</text><text x="460" y="32" class="f" fill="${f}" font-size="8" opacity="0.5" letter-spacing="1.5" text-anchor="end">REV. 01</text><text x="516" y="32" class="f" fill="${f}" font-size="8" opacity="0.35" letter-spacing="1" text-anchor="end">2026-03-27</text><line x1="24" y1="58" x2="516" y2="58" stroke="${f}" stroke-width="0.5" opacity="0.15"/><rect x="80" y="80" width="120" height="120" stroke="${f}" stroke-width="0.5" opacity="0.1" fill="none"/><g transform="translate(90,90)">${die(f,100)}</g><text x="140" y="220" class="f" fill="${f}" font-size="7" opacity="0.4" letter-spacing="2" text-anchor="middle">FIG.01 \u2014 THE DIE</text><text x="140" y="234" class="f" fill="${f}" font-size="6" opacity="0.25" letter-spacing="1" text-anchor="middle">IC PACKAGE / TOP VIEW</text><rect x="340" y="80" width="120" height="120" stroke="${f}" stroke-width="0.5" opacity="0.1" fill="none"/><g transform="translate(350,90)">${node(f,100)}</g><text x="400" y="220" class="f" fill="${f}" font-size="7" opacity="0.4" letter-spacing="2" text-anchor="middle">FIG.02 \u2014 THE NODE</text><text x="400" y="234" class="f" fill="${f}" font-size="6" opacity="0.25" letter-spacing="1" text-anchor="middle">SIGNAL BROADCAST</text><line x1="24" y1="260" x2="516" y2="260" stroke="${f}" stroke-width="0.5" opacity="0.15"/><text x="24" y="282" class="f" fill="${f}" font-size="8" opacity="0.4" letter-spacing="2">AL-2026</text><text x="130" y="282" class="f" fill="${f}" font-size="8" opacity="0.4" letter-spacing="2">EXPERIMENTAL SOFTWARE</text><text x="516" y="282" class="f" fill="${f}" font-size="8" opacity="0.3" letter-spacing="1" text-anchor="end">\u00A9 THEALXLABS.CA</text><text x="24" y="320" class="f" fill="${f}" font-size="6" opacity="0.15" letter-spacing="2">MADE IN TORONTO, CANADA</text></svg>`,

  wordmark:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="440" height="100" viewBox="0 0 440 100">${FS}<rect width="440" height="100" fill="${b}"/><line x1="20" y1="20" x2="420" y2="20" stroke="${f}" stroke-width="0.4" opacity="0.08"/><text x="220" y="52" class="f" fill="${f}" font-size="28" font-weight="700" letter-spacing="6" text-anchor="middle">The Alx Labs</text><text x="220" y="74" class="f" fill="${f}" font-size="10" letter-spacing="5" opacity="0.4" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="20" y1="84" x2="420" y2="84" stroke="${f}" stroke-width="0.4" opacity="0.08"/></svg>`,

  icon_only:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${FS}<rect width="200" height="200" fill="${b}"/><g transform="translate(40,40)">${die(f,120)}</g><text x="100" y="186" class="f" fill="${f}" font-size="6" letter-spacing="3" opacity="0.2" text-anchor="middle">THE DIE</text></svg>`,

  dual_icon:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="140" viewBox="0 0 300 140">${FS}<rect width="300" height="140" fill="${b}"/><g transform="translate(40,20)">${die(f,100)}</g><text x="150" y="76" class="f" fill="${f}" font-size="8" opacity="0.15" text-anchor="middle">\u00D7</text><g transform="translate(160,20)">${node(f,100)}</g></svg>`,

  // ── DIGITAL ──
  website_footer:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60" viewBox="0 0 400 60">${FS}<rect width="400" height="60" fill="${b}"/><line x1="0" y1="0" x2="400" y2="0" stroke="${f}" stroke-width="0.5" opacity="0.1"/><g transform="translate(16,13)">${die(f,34)}</g><g transform="translate(54,13)">${node(f,34)}</g><text x="100" y="26" class="f" fill="${f}" font-size="9" font-weight="700" letter-spacing="1.5">The Alx Labs</text><text x="100" y="42" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.4">DEVS FOR DEVS</text><text x="300" y="26" class="f" fill="${f}" font-size="7" opacity="0.35" letter-spacing="1.5" text-anchor="end">AL-2026</text><text x="300" y="42" class="f" fill="${f}" font-size="7" opacity="0.25" letter-spacing="1" text-anchor="end">\u00A9 THEALXLABS.CA</text><line x1="316" y1="14" x2="316" y2="46" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="384" y="35" class="f" fill="${f}" font-size="7" opacity="0.2" letter-spacing="2" text-anchor="end">TORONTO</text></svg>`,

  header_strip:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="50" viewBox="0 0 700 50">${FS}<rect width="700" height="50" fill="${b}"/><line x1="0" y1="0" x2="700" y2="0" stroke="${f}" stroke-width="0.5" opacity="0.15"/><line x1="0" y1="49" x2="700" y2="49" stroke="${f}" stroke-width="0.5" opacity="0.15"/><text x="16" y="30" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.45">AL-2026</text><line x1="90" y1="12" x2="90" y2="38" stroke="${f}" stroke-width="0.5" opacity="0.15"/><g transform="translate(100,11)">${die(f,28)}</g><g transform="translate(132,11)">${node(f,28)}</g><line x1="168" y1="12" x2="168" y2="38" stroke="${f}" stroke-width="0.5" opacity="0.15"/><text x="180" y="30" class="f" fill="${f}" font-size="12" font-weight="700" letter-spacing="1.5">The Alx Labs</text><text x="440" y="30" class="f" fill="${f}" font-size="8" letter-spacing="2.5" opacity="0.5">EXPERIMENTAL SOFTWARE</text><line x1="640" y1="12" x2="640" y2="38" stroke="${f}" stroke-width="0.5" opacity="0.15"/><text x="654" y="28" class="f" fill="${f}" font-size="8" opacity="0.35">\u00A9</text><text x="668" y="30" class="f" fill="${f}" font-size="7" opacity="0.3" letter-spacing="1">THEALXLABS.CA</text></svg>`,

  social_avatar:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${FS}<rect width="200" height="200" fill="${b}"/><g transform="translate(36,30)">${die(f,60)}</g><g transform="translate(104,30)">${node(f,60)}</g><text x="100" y="120" class="f" fill="${f}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="100" y="142" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="40" y1="155" x2="160" y2="155" stroke="${f}" stroke-width="0.5" opacity="0.12"/><text x="100" y="174" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.35" text-anchor="middle">AL-2026  \u00A9  THEALXLABS.CA</text></svg>`,

  video_watermark:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50">${FS}<rect width="160" height="50" fill="${b}" opacity="0.75"/><g transform="translate(8,9)">${die(f,32)}</g><g transform="translate(42,9)">${node(f,32)}</g><text x="82" y="22" class="f" fill="${f}" font-size="8" font-weight="700" letter-spacing="1" opacity="0.8">The Alx Labs</text><text x="82" y="36" class="f" fill="${f}" font-size="6" letter-spacing="1.5" opacity="0.4">AL-2026</text></svg>`,

  og_image:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${FS}<rect width="1200" height="630" fill="${b}"/><g transform="translate(340,120)">${die(f,160)}</g><g transform="translate(540,120)">${node(f,160)}</g><text x="600" y="360" class="f" fill="${f}" font-size="40" font-weight="700" letter-spacing="4" text-anchor="middle">The Alx Labs</text><text x="600" y="400" class="f" fill="${f}" font-size="16" letter-spacing="6" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="200" y1="430" x2="1000" y2="430" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="600" y="470" class="f" fill="${f}" font-size="14" letter-spacing="3" opacity="0.3" text-anchor="middle">AL-2026  \u00A9  THEALXLABS.CA  \u2014  TORONTO, CANADA</text><text x="600" y="560" class="f" fill="${f}" font-size="12" letter-spacing="4" opacity="0.15" text-anchor="middle">DEVS FOR DEVS</text></svg>`,

  email_sig:(b,f,t)=>`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="80" viewBox="0 0 360 80">${FS}<rect width="360" height="80" fill="${b}"/><line x1="0" y1="4" x2="360" y2="4" stroke="${f}" stroke-width="0.5" opacity="0.1"/><g transform="translate(12,18)">${die(f,24)}</g><g transform="translate(38,18)">${node(f,24)}</g><text x="70" y="30" class="f" fill="${f}" font-size="10" font-weight="700" letter-spacing="1">${(t&&t.name)||"Alexander Wondwossen"}</text><text x="70" y="44" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.5">${(t&&t.title)||"THE ALX LABS \u2014 FOUNDER"}</text><text x="70" y="58" class="f" fill="${f}" font-size="7" letter-spacing="1" opacity="0.35">${(t&&t.contact)||"havn@thealxlabs.ca \u2014 thealxlabs.ca"}</text><text x="70" y="70" class="f" fill="${f}" font-size="6" letter-spacing="1.5" opacity="0.2">${(t&&t.location)||"TORONTO, CANADA"}\u00A0\u00A0\u00A9 2026</text></svg>`,

  favicon:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${FS}<rect width="64" height="64" fill="${b}"/><g transform="translate(7,7)">${die(f,50)}</g></svg>`,

  readme_badge:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="24" viewBox="0 0 200 24">${FS}<rect width="200" height="24" rx="3" fill="${b}" stroke="${f}" stroke-width="0.5" opacity="0.8"/><g transform="translate(4,3)">${die(f,18)}</g><text x="26" y="15" class="f" fill="${f}" font-size="8" font-weight="700" letter-spacing="0.5">thealxlabs</text><line x1="106" y1="4" x2="106" y2="20" stroke="${f}" stroke-width="0.5" opacity="0.2"/><text x="114" y="15" class="f" fill="${f}" font-size="7" letter-spacing="0.5" opacity="0.6">experimental</text></svg>`,

  loading_screen:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${FS}<rect width="400" height="300" fill="${b}"/><g transform="translate(150,70)">${die(f,100)}</g><text x="200" y="210" class="f" fill="${f}" font-size="16" font-weight="700" letter-spacing="3" text-anchor="middle">The Alx Labs</text><text x="200" y="240" class="f" fill="${f}" font-size="8" letter-spacing="4" opacity="0.4" text-anchor="middle">LOADING</text><rect x="140" y="256" width="120" height="2" fill="${f}" opacity="0.1" rx="1"/><rect x="140" y="256" width="60" height="2" fill="${f}" opacity="0.4" rx="1"/></svg>`,

  error_page:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${FS}<rect width="400" height="300" fill="${b}"/><g transform="translate(168,40)">${die(f,64)}</g><text x="200" y="132" class="f" fill="${f}" font-size="48" font-weight="700" letter-spacing="4" text-anchor="middle" opacity="0.15">404</text><text x="200" y="170" class="f" fill="${f}" font-size="10" letter-spacing="3" opacity="0.5" text-anchor="middle">PAGE NOT FOUND</text><line x1="140" y1="185" x2="260" y2="185" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="200" y="210" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.3" text-anchor="middle">The Alx Labs \u00A9 2026</text><text x="200" y="230" class="f" fill="${f}" font-size="7" letter-spacing="1.5" opacity="0.2" text-anchor="middle">THEALXLABS.CA</text></svg>`,

  app_icon:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${FS}<defs><clipPath id="rr"><rect width="200" height="200" rx="40"/></clipPath></defs><g clip-path="url(#rr)"><rect width="200" height="200" fill="${b}"/><g transform="translate(36,32)">${die(f,60)}</g><g transform="translate(104,32)">${node(f,60)}</g><text x="100" y="122" class="f" fill="${f}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="100" y="142" class="f" fill="${f}" font-size="7" letter-spacing="2.5" opacity="0.45" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="40" y1="156" x2="160" y2="156" stroke="${f}" stroke-width="0.4" opacity="0.1"/><text x="100" y="176" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.25" text-anchor="middle">AL-2026</text></g></svg>`,

  social_cover:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="500" viewBox="0 0 1500 500">${FS}<rect width="1500" height="500" fill="${b}"/><line x1="80" y1="60" x2="1420" y2="60" stroke="${f}" stroke-width="0.4" opacity="0.06"/><g transform="translate(520,80)">${die(f,140)}</g><g transform="translate(700,80)">${node(f,140)}</g><text x="750" y="290" class="f" fill="${f}" font-size="36" font-weight="700" letter-spacing="5" text-anchor="middle">The Alx Labs</text><text x="750" y="330" class="f" fill="${f}" font-size="14" letter-spacing="6" opacity="0.45" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="300" y1="360" x2="1200" y2="360" stroke="${f}" stroke-width="0.4" opacity="0.08"/><text x="750" y="400" class="f" fill="${f}" font-size="12" letter-spacing="4" opacity="0.25" text-anchor="middle">AL-2026  \u00A9  THEALXLABS.CA  \u2014  DEVS FOR DEVS</text><line x1="80" y1="440" x2="1420" y2="440" stroke="${f}" stroke-width="0.4" opacity="0.06"/></svg>`,

  podcast_cover:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">${FS}<rect width="500" height="500" fill="${b}"/><text x="250" y="48" class="f" fill="${f}" font-size="9" letter-spacing="4" opacity="0.35" text-anchor="middle">AL-2026</text><line x1="100" y1="62" x2="400" y2="62" stroke="${f}" stroke-width="0.4" opacity="0.1"/><g transform="translate(130,80)">${die(f,110)}</g><g transform="translate(260,80)">${node(f,110)}</g><line x1="100" y1="210" x2="400" y2="210" stroke="${f}" stroke-width="0.4" opacity="0.1"/><text x="250" y="260" class="f" fill="${f}" font-size="28" font-weight="700" letter-spacing="3" text-anchor="middle">The Alx</text><text x="250" y="296" class="f" fill="${f}" font-size="28" font-weight="700" letter-spacing="3" text-anchor="middle">Labs</text><text x="250" y="340" class="f" fill="${f}" font-size="11" letter-spacing="4" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="100" y1="366" x2="400" y2="366" stroke="${f}" stroke-width="0.4" opacity="0.1"/><text x="250" y="400" class="f" fill="${f}" font-size="9" letter-spacing="3" opacity="0.3" text-anchor="middle">DEVS FOR DEVS</text><text x="250" y="430" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.2" text-anchor="middle">\u00A9 THEALXLABS.CA</text><text x="250" y="476" class="f" fill="${f}" font-size="7" letter-spacing="3" opacity="0.12" text-anchor="middle">TORONTO, CANADA</text></svg>`,

  newsletter_header:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="100" viewBox="0 0 600 100">${FS}<rect width="600" height="100" fill="${b}"/><line x1="0" y1="2" x2="600" y2="2" stroke="${f}" stroke-width="1" opacity="0.15"/><g transform="translate(20,22)">${die(f,56)}</g><g transform="translate(80,22)">${node(f,56)}</g><text x="155" y="46" class="f" fill="${f}" font-size="16" font-weight="700" letter-spacing="2">The Alx Labs</text><text x="155" y="66" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.5">EXPERIMENTAL SOFTWARE</text><line x1="400" y1="28" x2="400" y2="72" stroke="${f}" stroke-width="0.4" opacity="0.1"/><text x="420" y="46" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.35">AL-2026</text><text x="420" y="62" class="f" fill="${f}" font-size="7" letter-spacing="1" opacity="0.25">\u00A9 THEALXLABS.CA</text><line x1="0" y1="98" x2="600" y2="98" stroke="${f}" stroke-width="1" opacity="0.15"/></svg>`,

  // ── PHYSICAL ──
  clothing_label:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="280" viewBox="0 0 160 280">${FS}<rect width="160" height="280" fill="${b}"/><line x1="12" y1="12" x2="148" y2="12" stroke="${f}" stroke-width="0.5" opacity="0.15"/><text x="80" y="36" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.4" text-anchor="middle">AL-2026</text><line x1="50" y1="46" x2="110" y2="46" stroke="${f}" stroke-width="0.4" opacity="0.15"/><g transform="translate(48,58)">${die(f,64)}</g><text x="80" y="140" class="f" fill="${f}" font-size="7" opacity="0.2" text-anchor="middle">\u00D7</text><g transform="translate(48,150)">${node(f,64)}</g><line x1="50" y1="225" x2="110" y2="225" stroke="${f}" stroke-width="0.4" opacity="0.15"/><text x="80" y="245" class="f" fill="${f}" font-size="10" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="80" y="259" class="f" fill="${f}" font-size="6" letter-spacing="2" opacity="0.4" text-anchor="middle">\u00A9 THEALXLABS.CA</text><line x1="12" y1="268" x2="148" y2="268" stroke="${f}" stroke-width="0.5" opacity="0.15"/></svg>`,

  stamp:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${FS}<rect width="200" height="200" fill="${b}"/><line x1="10" y1="10" x2="30" y2="10" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="10" y1="10" x2="10" y2="30" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="170" y1="10" x2="190" y2="10" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="190" y1="10" x2="190" y2="30" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="10" y1="170" x2="10" y2="190" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="10" y1="190" x2="30" y2="190" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="190" y1="170" x2="190" y2="190" stroke="${f}" stroke-width="0.8" opacity="0.4"/><line x1="170" y1="190" x2="190" y2="190" stroke="${f}" stroke-width="0.8" opacity="0.4"/><text x="100" y="26" class="f" fill="${f}" font-size="7" letter-spacing="3" opacity="0.5" text-anchor="middle">AL-2026</text><g transform="translate(42,55)">${die(f,54)}</g><g transform="translate(104,55)">${node(f,54)}</g><text x="100" y="148" class="f" fill="${f}" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="100" y="166" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><text x="100" y="182" class="f" fill="${f}" font-size="7" opacity="0.3" text-anchor="middle">\u00A9 THEALXLABS.CA</text></svg>`,

  sticker:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">${FS}<circle cx="100" cy="100" r="98" fill="${b}" stroke="${f}" stroke-width="1" opacity="0.3"/><circle cx="100" cy="100" r="88" fill="none" stroke="${f}" stroke-width="0.5" opacity="0.15"/><g transform="translate(46,38)">${die(f,50)}</g><g transform="translate(104,38)">${node(f,50)}</g><text x="100" y="115" class="f" fill="${f}" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="100" y="134" class="f" fill="${f}" font-size="7" letter-spacing="2.5" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><text x="100" y="152" class="f" fill="${f}" font-size="6" letter-spacing="1.5" opacity="0.3" text-anchor="middle">THEALXLABS.CA  \u00A9  2026</text><text x="100" y="172" class="f" fill="${f}" font-size="6" letter-spacing="3" opacity="0.2" text-anchor="middle">TORONTO</text></svg>`,

  document_header:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="50" viewBox="0 0 500 50">${FS}<rect width="500" height="50" fill="${b}"/><g transform="translate(10,9)">${die(f,32)}</g><text x="50" y="22" class="f" fill="${f}" font-size="10" font-weight="700" letter-spacing="1.5">The Alx Labs</text><text x="50" y="38" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.4">EXPERIMENTAL SOFTWARE</text><line x1="220" y1="10" x2="220" y2="40" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="236" y="22" class="f" fill="${f}" font-size="7" opacity="0.35" letter-spacing="1.5">AL-2026</text><text x="236" y="38" class="f" fill="${f}" font-size="7" opacity="0.25" letter-spacing="1">THEALXLABS.CA</text><text x="490" y="30" class="f" fill="${f}" font-size="8" opacity="0.2" text-anchor="end">\u00A9</text></svg>`,

  hang_tag:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="220" viewBox="0 0 140 220">${FS}<rect width="140" height="220" fill="${b}" stroke="${f}" stroke-width="0.5" opacity="0.15"/><circle cx="70" cy="16" r="6" fill="none" stroke="${f}" stroke-width="0.8" opacity="0.3"/><text x="70" y="50" class="f" fill="${f}" font-size="7" letter-spacing="3" opacity="0.4" text-anchor="middle">AL-2026</text><g transform="translate(38,60)">${die(f,64)}</g><text x="70" y="142" class="f" fill="${f}" font-size="7" opacity="0.2" text-anchor="middle">\u00D7</text><text x="70" y="162" class="f" fill="${f}" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx</text><text x="70" y="178" class="f" fill="${f}" font-size="11" font-weight="700" letter-spacing="2" text-anchor="middle">Labs</text><line x1="30" y1="190" x2="110" y2="190" stroke="${f}" stroke-width="0.4" opacity="0.15"/><text x="70" y="205" class="f" fill="${f}" font-size="6" letter-spacing="2" opacity="0.35" text-anchor="middle">\u00A9 THEALXLABS.CA</text></svg>`,

  business_card:(b,f,t)=>`<svg xmlns="http://www.w3.org/2000/svg" width="350" height="200" viewBox="0 0 350 200">${FS}<rect width="350" height="200" fill="${b}"/><g transform="translate(24,24)">${die(f,48)}</g><g transform="translate(76,24)">${node(f,48)}</g><text x="24" y="100" class="f" fill="${f}" font-size="14" font-weight="700" letter-spacing="1">${(t&&t.name)||"Alexander Wondwossen"}</text><text x="24" y="118" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.5">${(t&&t.title)||"FOUNDER \u2014 THE ALX LABS"}</text><line x1="24" y1="132" x2="326" y2="132" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="24" y="152" class="f" fill="${f}" font-size="7" letter-spacing="1" opacity="0.4">${(t&&t.contact)||"havn@thealxlabs.ca"}</text><text x="24" y="168" class="f" fill="${f}" font-size="7" letter-spacing="1" opacity="0.4">${(t&&t.website)||"thealxlabs.ca"}</text><text x="326" y="152" class="f" fill="${f}" font-size="7" letter-spacing="1.5" opacity="0.3" text-anchor="end">${(t&&t.location)||"TORONTO, CANADA"}</text><text x="326" y="168" class="f" fill="${f}" font-size="7" letter-spacing="1.5" opacity="0.2" text-anchor="end">AL-2026 \u00A9</text></svg>`,

  packaging:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">${FS}<rect width="300" height="300" fill="${b}"/><rect x="10" y="10" width="280" height="280" fill="none" stroke="${f}" stroke-width="0.5" opacity="0.1"/><g transform="translate(85,40)">${die(f,60)}</g><g transform="translate(155,40)">${node(f,60)}</g><text x="150" y="128" class="f" fill="${f}" font-size="16" font-weight="700" letter-spacing="3" text-anchor="middle">The Alx Labs</text><text x="150" y="150" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="50" y1="166" x2="250" y2="166" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="150" y="190" class="f" fill="${f}" font-size="8" letter-spacing="2" opacity="0.3" text-anchor="middle">DEVS FOR DEVS</text><text x="150" y="214" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.25" text-anchor="middle">AL-2026  \u00A9  THEALXLABS.CA</text><line x1="50" y1="236" x2="250" y2="236" stroke="${f}" stroke-width="0.5" opacity="0.08"/><text x="150" y="260" class="f" fill="${f}" font-size="6" letter-spacing="3" opacity="0.15" text-anchor="middle">TORONTO, CANADA</text></svg>`,

  certificate:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">${FS}<rect width="120" height="120" fill="${b}"/><circle cx="60" cy="46" r="30" fill="none" stroke="${f}" stroke-width="0.5" opacity="0.15"/><g transform="translate(35,21)">${die(f,50)}</g><text x="60" y="90" class="f" fill="${f}" font-size="7" font-weight="700" letter-spacing="2" text-anchor="middle">VERIFIED</text><text x="60" y="104" class="f" fill="${f}" font-size="6" letter-spacing="1.5" opacity="0.4" text-anchor="middle">THEALXLABS \u00A9</text></svg>`,

  invoice:(b,f,t)=>`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="80" viewBox="0 0 500 80">${FS}<rect width="500" height="80" fill="${b}"/><line x1="0" y1="0" x2="500" y2="0" stroke="${f}" stroke-width="0.5" opacity="0.15"/><g transform="translate(16,16)">${die(f,48)}</g><text x="76" y="32" class="f" fill="${f}" font-size="12" font-weight="700" letter-spacing="1.5">The Alx Labs</text><text x="76" y="48" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.5">EXPERIMENTAL SOFTWARE \u2014 AL-2026</text><text x="76" y="64" class="f" fill="${f}" font-size="7" letter-spacing="1" opacity="0.35">${(t&&t.website)||"thealxlabs.ca"} \u2014 ${(t&&t.contact)||"havn@thealxlabs.ca"} \u2014 ${(t&&t.location)||"Toronto, Canada"}</text><text x="488" y="42" class="f" fill="${f}" font-size="16" opacity="0.15" text-anchor="end">\u00A9</text></svg>`,

  qr_frame:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="280" viewBox="0 0 220 280">${FS}<rect width="220" height="280" fill="${b}"/><text x="110" y="24" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.4" text-anchor="middle">AL-2026</text><g transform="translate(78,32)">${die(f,30)}</g><g transform="translate(112,32)">${node(f,30)}</g><line x1="30" y1="72" x2="190" y2="72" stroke="${f}" stroke-width="0.4" opacity="0.12"/><line x1="40" y1="82" x2="40" y2="100" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="40" y1="82" x2="58" y2="82" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="162" y1="82" x2="180" y2="82" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="180" y1="82" x2="180" y2="100" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="40" y1="200" x2="40" y2="218" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="40" y1="218" x2="58" y2="218" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="162" y1="218" x2="180" y2="218" stroke="${f}" stroke-width="0.6" opacity="0.3"/><line x1="180" y1="200" x2="180" y2="218" stroke="${f}" stroke-width="0.6" opacity="0.3"/><text x="110" y="155" class="f" fill="${f}" font-size="8" opacity="0.1" text-anchor="middle">QR</text><line x1="30" y1="232" x2="190" y2="232" stroke="${f}" stroke-width="0.4" opacity="0.12"/><text x="110" y="252" class="f" fill="${f}" font-size="9" font-weight="700" letter-spacing="2" text-anchor="middle">The Alx Labs</text><text x="110" y="268" class="f" fill="${f}" font-size="6" letter-spacing="2" opacity="0.3" text-anchor="middle">\u00A9 THEALXLABS.CA</text></svg>`,

  monogram:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">${FS}<rect width="160" height="160" fill="${b}"/><rect x="12" y="12" width="136" height="136" stroke="${f}" stroke-width="0.5" opacity="0.1" fill="none"/><rect x="20" y="20" width="120" height="120" stroke="${f}" stroke-width="0.3" opacity="0.06" fill="none"/><text x="80" y="92" class="f" fill="${f}" font-size="52" font-weight="700" letter-spacing="4" text-anchor="middle" opacity="0.12">AL</text><g transform="translate(42,42)">${die(f,76)}</g><text x="80" y="148" class="f" fill="${f}" font-size="6" letter-spacing="3" opacity="0.3" text-anchor="middle">THEALXLABS</text></svg>`,

  // ── COMPACT ──
  corner:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">${FS}<rect width="200" height="120" fill="${b}"/><path d="M198 0 L198 118 L0 118" stroke="${f}" stroke-width="0.8" fill="none" opacity="0.15"/><g transform="translate(14,14)">${die(f,42)}</g><g transform="translate(60,14)">${node(f,42)}</g><text x="14" y="76" class="f" fill="${f}" font-size="11" font-weight="700" letter-spacing="1.5">The Alx Labs</text><text x="14" y="92" class="f" fill="${f}" font-size="7" letter-spacing="2" opacity="0.5">EXPERIMENTAL SOFTWARE</text><text x="14" y="106" class="f" fill="${f}" font-size="6" opacity="0.35" letter-spacing="1.5">AL-2026  \u00A9  THEALXLABS.CA</text></svg>`,

  micro:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="32" viewBox="0 0 180 32">${FS}<rect width="180" height="32" fill="${b}"/><g transform="translate(6,5)">${die(f,22)}</g><g transform="translate(30,5)">${node(f,22)}</g><text x="58" y="20" class="f" fill="${f}" font-size="8" font-weight="700" letter-spacing="1">THEALXLABS</text></svg>`,

  atom:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="28" viewBox="0 0 60 28">${FS}<rect width="60" height="28" fill="${b}"/><g transform="translate(3,3)">${die(f,22)}</g><text x="30" y="18" class="f" fill="${f}" font-size="8" font-weight="700" letter-spacing="1" opacity="0.7">AL</text></svg>`,

  inline_text:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="20" viewBox="0 0 240 20">${FS}<rect width="240" height="20" fill="${b}"/><g transform="translate(2,1)">${die(f,18)}</g><text x="24" y="14" class="f" fill="${f}" font-size="8" letter-spacing="1" opacity="0.6">The Alx Labs  \u00B7  AL-2026  \u00B7  \u00A9</text></svg>`,

  watermark_tile:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">${FS}<rect width="300" height="300" fill="${b}"/><g opacity="0.06"><g transform="translate(20,20)">${die(f,60)}</g><g transform="translate(120,20)">${die(f,60)}</g><g transform="translate(220,20)">${die(f,60)}</g><g transform="translate(70,100)">${node(f,60)}</g><g transform="translate(170,100)">${node(f,60)}</g><g transform="translate(20,180)">${die(f,60)}</g><g transform="translate(120,180)">${die(f,60)}</g><g transform="translate(220,180)">${die(f,60)}</g></g><text x="150" y="155" class="f" fill="${f}" font-size="8" letter-spacing="3" opacity="0.08" text-anchor="middle">THEALXLABS</text></svg>`,

  presentation:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">${FS}<rect width="960" height="540" fill="${b}"/><g transform="translate(330,100)">${die(f,140)}</g><g transform="translate(490,100)">${node(f,140)}</g><text x="480" y="310" class="f" fill="${f}" font-size="32" font-weight="700" letter-spacing="4" text-anchor="middle">The Alx Labs</text><text x="480" y="350" class="f" fill="${f}" font-size="14" letter-spacing="5" opacity="0.5" text-anchor="middle">EXPERIMENTAL SOFTWARE</text><line x1="200" y1="380" x2="760" y2="380" stroke="${f}" stroke-width="0.5" opacity="0.1"/><text x="480" y="420" class="f" fill="${f}" font-size="11" letter-spacing="3" opacity="0.3" text-anchor="middle">AL-2026  \u00A9  THEALXLABS.CA  \u2014  TORONTO, CANADA</text><text x="480" y="490" class="f" fill="${f}" font-size="10" letter-spacing="4" opacity="0.15" text-anchor="middle">DEVS FOR DEVS</text></svg>`,

  banner_wide:(b,f)=>`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="160" viewBox="0 0 800 160">${FS}<rect width="800" height="160" fill="${b}"/><line x1="0" y1="3" x2="800" y2="3" stroke="${f}" stroke-width="0.8" opacity="0.12"/><text x="24" y="34" class="f" fill="${f}" font-size="7" letter-spacing="3" opacity="0.35">AL-2026</text><line x1="24" y1="46" x2="776" y2="46" stroke="${f}" stroke-width="0.3" opacity="0.06"/><g transform="translate(24,56)">${die(f,48)}</g><g transform="translate(76,56)">${node(f,48)}</g><text x="140" y="76" class="f" fill="${f}" font-size="20" font-weight="700" letter-spacing="3">The Alx Labs</text><text x="140" y="98" class="f" fill="${f}" font-size="9" letter-spacing="3" opacity="0.5">EXPERIMENTAL SOFTWARE \u2014 DEVS FOR DEVS</text><text x="776" y="76" class="f" fill="${f}" font-size="8" opacity="0.3" letter-spacing="1.5" text-anchor="end">THEALXLABS.CA</text><text x="776" y="92" class="f" fill="${f}" font-size="7" opacity="0.2" letter-spacing="1" text-anchor="end">TORONTO, CANADA \u00A9 2026</text><line x1="24" y1="116" x2="776" y2="116" stroke="${f}" stroke-width="0.3" opacity="0.06"/><text x="24" y="140" class="f" fill="${f}" font-size="6" letter-spacing="2" opacity="0.15">OPEN SOURCE \u00B7 MIT LICENSE \u00B7 CRAFTED WITH INTENT</text><line x1="0" y1="157" x2="800" y2="157" stroke="${f}" stroke-width="0.8" opacity="0.12"/></svg>`,
};

// ─── DIMENSIONS LOOKUP ──────────────────────────────────────────

const DIMS = {};
Object.keys(GEN).forEach(id => {
  const svg = GEN[id]("#000","#fff");
  const wm = svg.match(/width="(\d+)"/);
  const hm = svg.match(/height="(\d+)"/);
  DIMS[id] = { w: wm ? +wm[1] : 400, h: hm ? +hm[1] : 300 };
});

// ─── CATALOG ────────────────────────────────────────────────────

const CATS = [
  { name:"CORE MARKS", designs:[
    { id:"original",     label:"Original",          desc:"Sandwich layout \u2014 the signature" },
    { id:"vertical",     label:"Vertical Stack",    desc:"Specimen plate \u2014 column" },
    { id:"technical",    label:"Technical Drawing", desc:"Engineering annotations" },
    { id:"monumental",   label:"Monumental",        desc:"Large die + stacked type" },
    { id:"specimen",     label:"Specimen Sheet",    desc:"Patent-drawing format" },
    { id:"wordmark",     label:"Wordmark",          desc:"Pure typography \u2014 no marks" },
    { id:"icon_only",    label:"Icon Only",         desc:"Die mark \u2014 standalone" },
    { id:"dual_icon",    label:"Dual Icon",         desc:"Die + Node \u2014 marks only" },
  ]},
  { name:"DIGITAL", designs:[
    { id:"website_footer",   label:"Website Footer",     desc:"Inline page bottom bar" },
    { id:"header_strip",     label:"Header Strip",       desc:"Full-width thin banner" },
    { id:"social_avatar",    label:"Social Avatar",      desc:"Square 1:1 profile" },
    { id:"video_watermark",  label:"Video Watermark",    desc:"Semi-transparent overlay" },
    { id:"og_image",         label:"OG Image",           desc:"1200\u00D7630 social share" },
    { id:"email_sig",        label:"Email Signature",    desc:"Signature block" },
    { id:"favicon",          label:"Favicon",            desc:"64\u00D764 die mark icon" },
    { id:"readme_badge",     label:"README Badge",       desc:"GitHub badge style" },
    { id:"loading_screen",   label:"Loading Screen",     desc:"Splash + progress bar" },
    { id:"error_page",       label:"404 Page",           desc:"Error page layout" },
    { id:"app_icon",         label:"App Icon",           desc:"Rounded mobile icon" },
    { id:"social_cover",     label:"Social Cover",       desc:"1500\u00D7500 banner image" },
    { id:"podcast_cover",    label:"Podcast Cover",      desc:"Square artwork 500\u00D7500" },
    { id:"newsletter_header",label:"Newsletter Header",  desc:"Email newsletter top" },
  ]},
  { name:"PHYSICAL", designs:[
    { id:"clothing_label", label:"Clothing Label",   desc:"Tall narrow woven/print" },
    { id:"stamp",          label:"Stamp / Seal",     desc:"Square + corner brackets" },
    { id:"sticker",        label:"Sticker",          desc:"Circular die-cut" },
    { id:"document_header",label:"Document Header",  desc:"Wide letterhead bar" },
    { id:"hang_tag",       label:"Hang Tag",         desc:"Product tag with hole" },
    { id:"business_card",  label:"Business Card",    desc:"3.5\u00D72 card layout" },
    { id:"packaging",      label:"Packaging",        desc:"Box/envelope label" },
    { id:"certificate",    label:"Certificate Seal", desc:"Verified badge" },
    { id:"invoice",        label:"Invoice Header",   desc:"Billing document top" },
    { id:"qr_frame",       label:"QR Frame",         desc:"Decorative QR holder" },
    { id:"monogram",       label:"Monogram",         desc:"Layered AL mark" },
  ]},
  { name:"COMPACT", designs:[
    { id:"corner",         label:"Corner Mark",    desc:"L-bracket corner placement" },
    { id:"micro",          label:"Micro Inline",   desc:"Marks + name only" },
    { id:"atom",           label:"Atom",           desc:"Smallest \u2014 die + AL" },
    { id:"inline_text",    label:"Inline Text",    desc:"Single-line text mark" },
    { id:"watermark_tile", label:"Watermark Tile", desc:"Repeating pattern" },
    { id:"presentation",   label:"Presentation",   desc:"16:9 title slide" },
    { id:"banner_wide",    label:"Wide Banner",    desc:"800\u00D7160 promotional" },
  ]},
];

const ALL = CATS.flatMap(c => c.designs);

// ─── EXPORT UTILITIES ───────────────────────────────────────────

function dlSVG(id, ck) {
  const { bg, fg } = COLORS[ck];
  const s = GEN[id](bg, fg);
  const bl = new Blob([s], { type: "image/svg+xml" });
  const u = URL.createObjectURL(bl);
  const a = document.createElement("a");
  a.href = u;
  a.download = `thealxlabs-${id}-${ck}.svg`;
  a.click();
  URL.revokeObjectURL(u);
}

async function dlPNG(id, ck, scale = 4) {
  const { bg, fg } = COLORS[ck];
  const s = GEN[id](bg, fg);
  const d = DIMS[id];
  const c = document.createElement("canvas");
  c.width = d.w * scale;
  c.height = d.h * scale;
  const ctx = c.getContext("2d");
  const img = new Image();
  const bl = new Blob([s], { type: "image/svg+xml;charset=utf-8" });
  const u = URL.createObjectURL(bl);
  return new Promise(r => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, d.w * scale, d.h * scale);
      URL.revokeObjectURL(u);
      c.toBlob(pb => {
        const pu = URL.createObjectURL(pb);
        const a = document.createElement("a");
        a.href = pu;
        a.download = `thealxlabs-${id}-${ck}-${d.w * scale}x${d.h * scale}.png`;
        a.click();
        URL.revokeObjectURL(pu);
        r();
      }, "image/png");
    };
    img.src = u;
  });
}

// ─── GLOBAL CSS ─────────────────────────────────────────────────

const CSS = `
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  button { cursor: pointer; transition: all 0.15s ease; font-family: 'Space Mono', monospace; }
  button:hover { opacity: 0.85; }
  button:active { transform: scale(0.97); }
  input { outline: none; font-family: 'Space Mono', monospace; }
  input::placeholder { color: #555; }

  .sidebar-item { transition: background 0.12s ease, border-color 0.12s ease; }
  .sidebar-item:hover { background: #0d0d0d !important; }

  .swatch { transition: all 0.12s ease; }
  .swatch:hover { transform: scale(1.2); z-index: 2; }

  .export-btn {
    background: none; border: 1px solid #1a1a1a; color: #999;
    font-size: 10px; letter-spacing: 1.5px; padding: 7px 16px;
    transition: all 0.15s ease;
  }
  .export-btn:hover { border-color: #444; color: #ccc; }
  .export-btn.primary { background: ${ACCENT}; color: #0a0a0a; border-color: ${ACCENT}; font-weight: 700; }
  .export-btn.primary:hover { opacity: 0.9; }
  .export-btn.active { border-color: #4ade80; color: #4ade80; }

  .zoom-btn {
    background: #0e0e0e; border: 1px solid #222; color: #888;
    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
    font-size: 14px; padding: 0; line-height: 1;
  }
  .zoom-btn:hover { border-color: #444; color: #bbb; }

  .cat-header { transition: all 0.12s ease; }
  .cat-header:hover { background: #0a0a0a; }

  .dot-grid {
    background-image: radial-gradient(circle, #151515 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .thumb-wrap img { transition: opacity 0.15s ease; }
`;

// ─── INLINE MARK FOR HEADER ─────────────────────────────────────

function HeaderMark() {
  const svg = `<svg width="48" height="20" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,0) scale(0.5)">${die(ACCENT, 50)}</g>
    <g transform="translate(35,0) scale(0.5)">${node(ACCENT, 50)}</g>
  </svg>`;
  return <span dangerouslySetInnerHTML={{ __html: svg }} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 10 }} />;
}

// ─── APP ────────────────────────────────────────────────────────

// ─── LOAD/SAVE CUSTOM COLORS ────────────────────────────────────

function loadCustomColors() {
  try {
    const raw = localStorage.getItem("alx-custom-colors");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCustomColors(customs) {
  localStorage.setItem("alx-custom-colors", JSON.stringify(customs));
}

export default function App() {
  const [sel, setSel] = useState("original");
  const [col, setCol] = useState("acid");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openCats, setOpenCats] = useState(() => new Set(CATS.map(c => c.name)));
  const [customColors, setCustomColors] = useState(loadCustomColors);
  const [showColorCreator, setShowColorCreator] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorBg, setNewColorBg] = useState("#0a0a0a");
  const [newColorFg, setNewColorFg] = useState("#ffffff");
  const [textFields, setTextFields] = useState({
    name: "", title: "", contact: "", website: "", location: "",
  });
  const previewRef = useRef(null);

  const COLORS = useMemo(() => ({ ...DEFAULT_COLORS, ...customColors }), [customColors]);

  // Which designs support custom text
  const TEXT_FIELDS = {
    email_sig:      ["name", "title", "contact", "location"],
    business_card:  ["name", "title", "contact", "website", "location"],
    invoice:        ["contact", "website", "location"],
  };
  const FIELD_PLACEHOLDERS = {
    name: "Full name",
    title: "Role / Title",
    contact: "Email address",
    website: "Website URL",
    location: "City, Country",
  };
  const hasTextFields = TEXT_FIELDS[sel];

  // Build text param from filled fields only
  const textParam = useMemo(() => {
    const t = {};
    let any = false;
    for (const [k, v] of Object.entries(textFields)) {
      if (v.trim()) { t[k] = v.trim(); any = true; }
    }
    return any ? t : null;
  }, [textFields]);

  const { bg, fg } = COLORS[col] || COLORS.acid;
  const info = ALL.find(d => d.id === sel);
  const dim = DIMS[sel];

  // ── Custom color handlers ──
  const addCustomColor = useCallback(() => {
    const name = newColorName.trim();
    if (!name) return;
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (DEFAULT_COLORS[key]) return;
    const next = { ...customColors, [key]: { bg: newColorBg, fg: newColorFg, label: name, g: "custom" } };
    setCustomColors(next);
    saveCustomColors(next);
    setCol(key);
    setNewColorName("");
    setShowColorCreator(false);
  }, [newColorName, newColorBg, newColorFg, customColors]);

  const deleteCustomColor = useCallback((key) => {
    const next = { ...customColors };
    delete next[key];
    setCustomColors(next);
    saveCustomColors(next);
    if (col === key) setCol("acid");
  }, [customColors, col]);

  // ── Filtered catalog ──
  const filtered = useMemo(() => {
    if (!search.trim()) return CATS;
    const q = search.toLowerCase();
    return CATS
      .map(c => ({ ...c, designs: c.designs.filter(d =>
        d.label.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
      )}))
      .filter(c => c.designs.length > 0);
  }, [search]);

  // ── Handlers ──
  const toggleCat = useCallback((name) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const copy = useCallback(async () => {
    const c = COLORS[col] || COLORS.acid;
    await navigator.clipboard.writeText(GEN[sel](c.bg, c.fg, textParam));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sel, col, COLORS, textParam]);

  const dlSVGDynamic = useCallback((id, ck) => {
    const c = COLORS[ck] || COLORS.acid;
    const s = GEN[id](c.bg, c.fg, textParam);
    const bl = new Blob([s], { type: "image/svg+xml" });
    const u = URL.createObjectURL(bl);
    const a = document.createElement("a");
    a.href = u;
    a.download = `thealxlabs-${id}-${ck}.svg`;
    a.click();
    URL.revokeObjectURL(u);
  }, [COLORS, textParam]);

  const dlPNGDynamic = useCallback(async (id, ck, scale = 4) => {
    const c = COLORS[ck] || COLORS.acid;
    const s = GEN[id](c.bg, c.fg, textParam);
    const d = DIMS[id];
    const cv = document.createElement("canvas");
    cv.width = d.w * scale;
    cv.height = d.h * scale;
    const ctx = cv.getContext("2d");
    const img = new Image();
    const bl = new Blob([s], { type: "image/svg+xml;charset=utf-8" });
    const u = URL.createObjectURL(bl);
    return new Promise(r => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, d.w * scale, d.h * scale);
        URL.revokeObjectURL(u);
        cv.toBlob(pb => {
          const pu = URL.createObjectURL(pb);
          const a = document.createElement("a");
          a.href = pu;
          a.download = `thealxlabs-${id}-${ck}-${d.w * scale}x${d.h * scale}.png`;
          a.click();
          URL.revokeObjectURL(pu);
          r();
        }, "image/png");
      };
      img.src = u;
    });
  }, [COLORS, textParam]);

  const png = useCallback(async (s) => {
    setBusy(true);
    await dlPNGDynamic(sel, col, s);
    setBusy(false);
  }, [sel, col, dlPNGDynamic]);

  const allSVG = useCallback(async () => {
    setBusy(true);
    for (const d of ALL) {
      dlSVGDynamic(d.id, col);
      await new Promise(r => setTimeout(r, 80));
    }
    setBusy(false);
  }, [col, dlSVGDynamic]);

  const zoomIn = () => setZoom(z => Math.min(z + 25, 300));
  const zoomOut = () => setZoom(z => Math.max(z - 25, 25));
  const zoomReset = () => setZoom(100);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback((e) => {
    const idx = ALL.findIndex(d => d.id === sel);
    if (e.key === "ArrowDown" && idx < ALL.length - 1) { e.preventDefault(); setSel(ALL[idx + 1].id); }
    if (e.key === "ArrowUp" && idx > 0) { e.preventDefault(); setSel(ALL[idx - 1].id); }
  }, [sel]);

  return (
    <div
      style={{ height: "100vh", background: "#040404", color: "#999", fontFamily: F, display: "flex", flexDirection: "column" }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <style>{CSS}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: "10px 24px",
        borderBottom: "1px solid #111",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        background: "#040404",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <HeaderMark />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: ACCENT }}>THEALXLABS</span>
          <span style={{ fontSize: 10, opacity: 0.45, letterSpacing: 2, marginLeft: 8, color: "#888" }}>BRAND SYSTEM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 9, opacity: 0.5, letterSpacing: 1.5, color: "#777" }}>{ALL.length} DESIGNS</span>
          <span style={{ fontSize: 9, opacity: 0.3, color: "#555" }}>{"\u00B7"}</span>
          <span style={{ fontSize: 9, opacity: 0.5, letterSpacing: 1.5, color: "#777" }}>{Object.keys(COLORS).length} COLORS</span>
          <span style={{ fontSize: 9, opacity: 0.3, color: "#555" }}>{"\u00B7"}</span>
          <span style={{ fontSize: 9, opacity: 0.4, letterSpacing: 1.5, color: "#666" }}>branding.thealxlabs.ca</span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ═══ SIDEBAR ═══ */}
        <div style={{
          width: 340,
          flexShrink: 0,
          borderRight: "1px solid #111",
          display: "flex",
          flexDirection: "column",
          background: "#060606",
        }}>
          {/* Search */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #0e0e0e" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, opacity: 0.2, pointerEvents: "none" }}>
                {"\u2315"}
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search designs..."
                style={{
                  width: "100%",
                  background: "#0a0a0a",
                  border: "1px solid #151515",
                  color: "#aaa",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  padding: "8px 12px 8px 28px",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={e => e.target.style.borderColor = "#222"}
                onBlur={e => e.target.style.borderColor = "#151515"}
              />
            </div>
          </div>

          {/* Design list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {filtered.map(cat => (
              <div key={cat.name} style={{ marginBottom: 2 }}>
                {/* Category header */}
                <button
                  className="cat-header"
                  onClick={() => toggleCat(cat.name)}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid #0a0a0a",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#555", transition: "transform 0.15s", transform: openCats.has(cat.name) ? "rotate(0deg)" : "rotate(-90deg)" }}>
                      {"\u25BE"}
                    </span>
                    <span style={{ fontSize: 10, letterSpacing: 3, color: ACCENT, opacity: 0.8 }}>{cat.name}</span>
                  </div>
                  <span style={{
                    fontSize: 9,
                    letterSpacing: 1,
                    color: "#666",
                    background: "#0e0e0e",
                    padding: "2px 8px",
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                    {cat.designs.length}
                  </span>
                </button>

                {/* Design items */}
                {openCats.has(cat.name) && cat.designs.map(d => (
                  <button
                    key={d.id}
                    className="sidebar-item"
                    onClick={() => { setSel(d.id); setZoom(100); }}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                      background: sel === d.id ? "#0c0c0c" : "transparent",
                      border: "none",
                      borderLeft: sel === d.id ? `2px solid ${ACCENT}` : "2px solid transparent",
                      padding: "8px 14px",
                    }}
                  >
                    {/* Mini thumbnail */}
                    <div style={{
                      width: 52,
                      height: 34,
                      flexShrink: 0,
                      overflow: "hidden",
                      background: "#080808",
                      border: sel === d.id ? `1px solid ${ACCENT}22` : "1px solid #111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <img
                        src={`data:image/svg+xml,${encodeURIComponent(GEN[d.id](COLORS[col].bg, COLORS[col].fg))}`}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                    {/* Text */}
                    <div style={{ minWidth: 0 }}>
                      <span style={{
                        fontSize: 11,
                        color: sel === d.id ? ACCENT : "#bbb",
                        letterSpacing: 0.5,
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: sel === d.id ? 700 : 400,
                      }}>{d.label}</span>
                      <span style={{
                        fontSize: 9,
                        color: "#666",
                        letterSpacing: 0.3,
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>{d.desc}</span>
                    </div>
                    {/* Dimensions */}
                    <span style={{
                      fontSize: 8,
                      color: "#444",
                      letterSpacing: 0.5,
                      marginLeft: "auto",
                      flexShrink: 0,
                    }}>{DIMS[d.id].w}{"\u00D7"}{DIMS[d.id].h}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ MAIN AREA ═══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Color bar */}
          <div style={{
            padding: "10px 20px",
            borderBottom: "1px solid #111",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            flexWrap: "wrap",
          }}>
            {GROUPS.map((g, gi) => {
              const groupColors = Object.entries(COLORS).filter(([, v]) => v.g === g.key);
              if (g.key === "custom" && groupColors.length === 0 && !showColorCreator) return null;
              return (
              <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, color: "#666", marginRight: 4 }}>{g.label}</span>
                {groupColors.map(([k, v]) => (
                  <div key={k} style={{ position: "relative", display: "inline-flex" }}>
                    <button
                      className="swatch"
                      onClick={() => setCol(k)}
                      title={`${v.label} — ${v.bg} / ${v.fg}`}
                      style={{
                        width: 22,
                        height: 22,
                        border: col === k ? `2px solid ${ACCENT}` : "1px solid #222",
                        background: v.bg,
                        position: "relative",
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: v.fg,
                      }} />
                    </button>
                    {v.g === "custom" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomColor(k); }}
                        title="Delete color"
                        style={{
                          position: "absolute", top: -5, right: -5,
                          width: 14, height: 14, borderRadius: "50%",
                          background: "#333", border: "none", color: "#999",
                          fontSize: 9, lineHeight: 1, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          zIndex: 3, padding: 0,
                        }}
                      >{"\u00D7"}</button>
                    )}
                  </div>
                ))}
                {gi < GROUPS.length - 1 && groupColors.length > 0 && (
                  <div style={{ width: 1, height: 16, background: "#151515", marginLeft: 8, marginRight: 4 }} />
                )}
              </div>
              );
            })}

            {/* Add custom color button */}
            <button
              onClick={() => setShowColorCreator(!showColorCreator)}
              title="Create custom color"
              style={{
                width: 22, height: 22,
                border: showColorCreator ? `1px solid ${ACCENT}` : "1px dashed #333",
                background: showColorCreator ? "#111" : "transparent",
                color: showColorCreator ? ACCENT : "#555",
                fontSize: 14, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, flexShrink: 0,
              }}
            >+</button>

            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: ACCENT, letterSpacing: 1.5, opacity: 0.8, fontWeight: 700 }}>
              {(COLORS[col] || COLORS.acid).label.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, color: "#555", letterSpacing: 0.5 }}>
              {(COLORS[col] || COLORS.acid).bg} / {(COLORS[col] || COLORS.acid).fg}
            </span>
          </div>

          {/* Color creator panel */}
          {showColorCreator && (
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid #111",
              background: "#080808",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
              animation: "fadeIn 0.15s ease",
            }}>
              <span style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>NEW COLOR</span>
              <input
                value={newColorName}
                onChange={e => setNewColorName(e.target.value)}
                placeholder="Name..."
                maxLength={20}
                style={{
                  background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#ccc",
                  fontSize: 11, padding: "6px 10px", width: 140,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: "#666" }}>BG</span>
                <input
                  type="color"
                  value={newColorBg}
                  onChange={e => setNewColorBg(e.target.value)}
                  style={{ width: 28, height: 28, border: "1px solid #222", background: "none", padding: 0, cursor: "pointer" }}
                />
                <span style={{ fontSize: 9, color: "#777", letterSpacing: 0.5 }}>{newColorBg}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: "#666" }}>FG</span>
                <input
                  type="color"
                  value={newColorFg}
                  onChange={e => setNewColorFg(e.target.value)}
                  style={{ width: 28, height: 28, border: "1px solid #222", background: "none", padding: 0, cursor: "pointer" }}
                />
                <span style={{ fontSize: 9, color: "#777", letterSpacing: 0.5 }}>{newColorFg}</span>
              </div>
              {/* Live preview swatch */}
              <div style={{
                width: 36, height: 36, background: newColorBg,
                border: "1px solid #333", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: newColorFg }} />
              </div>
              <button
                onClick={addCustomColor}
                disabled={!newColorName.trim()}
                style={{
                  background: newColorName.trim() ? ACCENT : "#1a1a1a",
                  color: newColorName.trim() ? "#0a0a0a" : "#444",
                  border: "none", fontSize: 10, fontWeight: 700,
                  letterSpacing: 1.5, padding: "7px 16px",
                }}
              >ADD</button>
              <button
                onClick={() => setShowColorCreator(false)}
                style={{
                  background: "none", border: "1px solid #222",
                  color: "#666", fontSize: 10, padding: "7px 12px",
                }}
              >CANCEL</button>
            </div>
          )}

          {/* Text customization panel */}
          {hasTextFields && (
            <div style={{
              padding: "10px 20px",
              borderBottom: "1px solid #111",
              background: "#070707",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 10, color: ACCENT, letterSpacing: 2, opacity: 0.7, marginRight: 4 }}>CUSTOMIZE TEXT</span>
              {hasTextFields.map(field => (
                <input
                  key={field}
                  value={textFields[field]}
                  onChange={e => setTextFields(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={FIELD_PLACEHOLDERS[field]}
                  style={{
                    background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#ccc",
                    fontSize: 10, padding: "6px 10px", width: 150,
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#333"}
                  onBlur={e => e.target.style.borderColor = "#1a1a1a"}
                />
              ))}
              {Object.values(textFields).some(v => v.trim()) && (
                <button
                  onClick={() => setTextFields({ name: "", title: "", contact: "", website: "", location: "" })}
                  style={{
                    background: "none", border: "1px solid #222", color: "#777",
                    fontSize: 9, padding: "6px 10px", letterSpacing: 1,
                  }}
                >RESET</button>
              )}
            </div>
          )}

          {/* Preview area */}
          <div
            ref={previewRef}
            className="dot-grid"
            style={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              padding: 32,
            }}
          >
            {/* Registration marks */}
            <div style={{ position: "absolute", top: 16, left: 16, opacity: 0.15 }}>
              <div style={{ width: 20, height: 1, background: "#555" }} />
              <div style={{ width: 1, height: 20, background: "#555", marginTop: -1 }} />
            </div>
            <div style={{ position: "absolute", top: 16, right: 16, opacity: 0.15 }}>
              <div style={{ width: 20, height: 1, background: "#555", marginLeft: "auto" }} />
              <div style={{ width: 1, height: 20, background: "#555", marginLeft: "auto", marginTop: -1 }} />
            </div>
            <div style={{ position: "absolute", bottom: 16, left: 16, opacity: 0.15 }}>
              <div style={{ width: 1, height: 20, background: "#555" }} />
              <div style={{ width: 20, height: 1, background: "#555", marginTop: -1 }} />
            </div>
            <div style={{ position: "absolute", bottom: 16, right: 16, opacity: 0.15 }}>
              <div style={{ width: 1, height: 20, background: "#555", marginLeft: "auto" }} />
              <div style={{ width: 20, height: 1, background: "#555", marginLeft: "auto", marginTop: -1 }} />
            </div>

            {/* Zoom controls */}
            <div style={{ position: "absolute", top: 16, right: 20, display: "flex", alignItems: "center", gap: 2, zIndex: 5 }}>
              <button className="zoom-btn" onClick={zoomOut}>{"\u2212"}</button>
              <button
                className="zoom-btn"
                onClick={zoomReset}
                style={{ width: "auto", padding: "0 8px", fontSize: 8, letterSpacing: 1 }}
              >
                {zoom}%
              </button>
              <button className="zoom-btn" onClick={zoomIn}>+</button>
            </div>

            {/* SVG Preview */}
            <div
              key={`${sel}-${col}-${JSON.stringify(textParam)}`}
              style={{
                animation: "fadeIn 0.25s ease",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
                maxWidth: zoom <= 100 ? "100%" : "none",
              }}
              dangerouslySetInnerHTML={{ __html: GEN[sel](bg, fg, textParam) }}
            />

            {/* Info label */}
            <div style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: "fadeIn 0.3s ease",
            }}>
              <span style={{ fontSize: 10, letterSpacing: 2, color: "#777" }}>
                {info?.label?.toUpperCase()}
              </span>
              <span style={{ fontSize: 9, color: "#333" }}>{"\u2014"}</span>
              <span style={{ fontSize: 10, letterSpacing: 1.5, color: "#666" }}>
                {(COLORS[col] || COLORS.acid).label.toUpperCase()}
              </span>
              <span style={{ fontSize: 9, color: "#333" }}>{"\u2014"}</span>
              <span style={{ fontSize: 10, letterSpacing: 1, color: "#555" }}>
                {dim.w}{"\u00D7"}{dim.h}
              </span>
            </div>
          </div>

          {/* Export bar */}
          <div style={{
            padding: "10px 20px",
            borderTop: "1px solid #111",
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
            flexShrink: 0,
            background: "#050505",
          }}>
            <button className="export-btn primary" onClick={() => dlSVGDynamic(sel, col)}>
              SVG
            </button>
            <button className="export-btn" onClick={() => png(2)} disabled={busy} style={busy ? { opacity: 0.3 } : {}}>
              PNG @2x
            </button>
            <button className="export-btn" onClick={() => png(4)} disabled={busy} style={busy ? { opacity: 0.3 } : {}}>
              {busy ? "..." : "PNG @4x"}
            </button>
            <button className="export-btn" onClick={() => png(8)} disabled={busy} style={busy ? { opacity: 0.3 } : {}}>
              PNG @8x
            </button>

            <div style={{ width: 1, height: 20, background: "#151515", margin: "0 4px" }} />

            <button
              className={`export-btn ${copied ? "active" : ""}`}
              onClick={copy}
            >
              {copied ? "COPIED" : "COPY SVG"}
            </button>

            <div style={{ flex: 1 }} />

            <span style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginRight: 6 }}>
              {dim.w * 4}{"\u00D7"}{dim.h * 4}px @4x
            </span>
            <button
              className="export-btn"
              onClick={allSVG}
              disabled={busy}
              style={busy ? { opacity: 0.3 } : {}}
            >
              ALL {ALL.length} AS SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
