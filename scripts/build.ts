/**
 * Builds the README images: an animated banner, impact tiles and a stack strip,
 * each in a dark and a light version. Same design as https://smashysubash.github.io.
 *
 *   bun scripts/build.ts
 *
 * Fonts and the portrait are embedded, so the SVGs render identically for every viewer.
 */
const here = new URL('.', import.meta.url).pathname;
const b64 = async (p: string) => Buffer.from(await Bun.file(here + p).arrayBuffer()).toString('base64');

const FONT = {
  wide: `@font-face { font-family: 'ArchivoW'; src: url(data:font/woff2;base64,${await b64('fonts/archivo-latin-wdth-normal.woff2')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }`,
  black: `@font-face { font-family: 'ArchivoB'; src: url(data:font/woff2;base64,${await b64('fonts/archivo-latin-900-normal.woff2')}) format('woff2'); font-weight: 900; }`,
  mono400: `@font-face { font-family: 'Mono'; src: url(data:font/woff2;base64,${await b64('fonts/ibm-plex-mono-latin-400-normal.woff2')}) format('woff2'); font-weight: 400; }`,
  mono500: `@font-face { font-family: 'Mono'; src: url(data:font/woff2;base64,${await b64('fonts/ibm-plex-mono-latin-500-normal.woff2')}) format('woff2'); font-weight: 500; }`,
};
type FontKey = keyof typeof FONT;
const portrait = `data:image/webp;base64,${await b64('../assets/portrait.webp')}`;

type Theme = { name: 'dark' | 'light'; bg: string; panel: string; ink: string; muted: string; line: string; accent: string; ok: string; warm: string; dot: string };
const THEMES: Theme[] = [
  { name: 'dark', bg: '#090D15', panel: '#0D131F', ink: '#E8EDF5', muted: '#94A1B6', line: '#25314A', accent: '#7DA2FF', ok: '#3AD2AD', warm: '#FFB547', dot: '#7DA2FF' },
  { name: 'light', bg: '#EEF1F6', panel: '#FFFFFF', ink: '#0E1726', muted: '#536175', line: '#CDD5E0', accent: '#2346D8', ok: '#0A8C72', warm: '#955900', dot: '#2346D8' },
];
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Each image embeds only the fonts it uses, to keep files small. */
const svg = (w: number, h: number, t: Theme, body: string, css: string, use: FontKey[]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><style>${use.map((k) => FONT[k]).join('')}${css}</style>${body}</svg>`;

/* ---------- banner: name over the animated dot grid, with the cut-out breaking out of its card ---------- */
function banner(t: Theme) {
  const W = 1200, H = 360, R = 20, step = 26;
  let dots = '';
  for (let y = step; y < H - 8; y += step) for (let x = step; x < W - 8; x += step) {
    // diagonal wave, same feel as the site: each dot brightens as the wave passes
    const delay = (((x * 0.0042 + y * 0.003) % 6) - 6).toFixed(2);
    dots += `<circle cx="${x}" cy="${y}" r="1.7" style="animation-delay:${delay}s"/>`;
  }
  const css = `
    .d circle { fill: ${t.dot}; opacity: .16; animation: wave 6s ease-in-out infinite; }
    @keyframes wave { 0%, 100% { opacity: .14; } 50% { opacity: ${t.name === 'dark' ? '.75' : '.55'}; } }
    @media (prefers-reduced-motion: reduce) { .d circle { animation: none; } }
    .eyebrow { font: 500 15px Mono; letter-spacing: 1.5px; fill: ${t.ok}; }
    .name { font-family: ArchivoW; font-weight: 900; font-stretch: 122%; font-size: 96px; letter-spacing: -3px; fill: ${t.ink}; }
    .sub { font-family: ArchivoW; font-weight: 700; font-stretch: 105%; font-size: 38px; letter-spacing: -1px; fill: ${t.accent}; }
    .line { font: 400 17px Mono; fill: ${t.muted}; }`;
  // portrait card on the right; the head rises above the card's top edge
  const cw = 250, cx = W - cw - 70, ctop = 118, cb = H - 30, ph = Math.round(cw * (458 / 400));
  return svg(W, H, t, `
    <defs>
      <clipPath id="frame"><rect width="${W}" height="${H}" rx="${R}"/></clipPath>
      <clipPath id="body"><path d="M${cx},0 H${cx + cw} V${cb - 18} Q${cx + cw},${cb} ${cx + cw - 18},${cb} H${cx + 18} Q${cx},${cb} ${cx},${cb - 18} Z"/></clipPath>
      <radialGradient id="glow" cx="50%" cy="100%" r="85%"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.name === 'dark' ? '.45' : '.3'}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <g clip-path="url(#frame)">
      <rect width="${W}" height="${H}" fill="${t.bg}"/>
      <g class="d">${dots}</g>
      <rect x="${cx}" y="${ctop}" width="${cw}" height="${cb - ctop}" rx="18" fill="${t.panel}" stroke="${t.line}"/>
      <rect x="${cx}" y="${ctop}" width="${cw}" height="${cb - ctop}" rx="18" fill="url(#glow)"/>
      <image href="${portrait}" x="${cx}" y="${cb - ph}" width="${cw}" height="${ph}" clip-path="url(#body)"/>
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" fill="none" stroke="${t.line}"/>
    <circle cx="62" cy="70" r="5" fill="${t.ok}"/>
    <text x="76" y="75" class="eyebrow">OPEN TO REMOTE BACKEND &amp; PLATFORM ROLES · BENGALURU, IST</text>
    <text x="56" y="178" class="name">Subash S.</text>
    <text x="60" y="232" class="sub">Backend engineer who ships AI.</text>
    <text x="60" y="282" class="line">APIs · pipelines · cloud infra · and the AI that runs on top</text>
    <text x="60" y="312" class="line" fill="${t.accent}" style="fill:${t.accent}">smashysubash.github.io ↗</text>`, css, ['wide', 'mono400', 'mono500']);
}

/* ---------- impact tiles ---------- */
function impact(t: Theme) {
  const tiles = [
    ['35', '%', 'Monthly cloud bill cut', 'self-initiated'],
    ['10+', '', 'Tenants on one platform', 'designed from scratch'],
    ['30', '%', 'Faster dashboard queries', 'aggregations + indexes'],
    ['<1', 'h', 'Redis outage restored', 'no data lost'],
  ];
  const W = 1200, H = 170, gap = 14, tw = (W - gap * 3) / 4;
  const css = `
    .n { font: 900 58px ArchivoB; letter-spacing: -2px; fill: ${t.ink}; }
    .u { font: 900 30px ArchivoB; fill: ${t.accent}; }
    .w { font: 500 15px Mono; fill: ${t.ink}; }
    .h { font: 400 13px Mono; fill: ${t.muted}; }`;
  const body = tiles.map(([n, u, w, h], i) => {
    const x = i * (tw + gap);
    // the unit sits right after the number; Archivo Black digits are ~0.62em wide
    const nx = x + 24, ux = nx + n.length * 58 * 0.62 + 4;
    return `<rect x="${x + 0.5}" y=".5" width="${tw - 1}" height="${H - 1}" rx="16" fill="${t.panel}" stroke="${t.line}"/>
      <text x="${nx}" y="80" class="n">${esc(n)}</text>${u ? `<text x="${ux}" y="80" class="u">${u}</text>` : ''}
      <text x="${nx}" y="118" class="w">${esc(w)}</text>
      <text x="${nx}" y="142" class="h">${esc(h)}</text>`;
  }).join('');
  return svg(W, H, t, body, css, ['black', 'mono400', 'mono500']);
}

/* ---------- stack strip: pills, core tools filled ---------- */
function stack(t: Theme) {
  const rows: [string, [string, boolean][]][] = [
    ['BACKEND', [['Node.js', true], ['TypeScript', true], ['NestJS', false], ['Express', false], ['GraphQL', false], ['BullMQ', false]]],
    ['DATA', [['MongoDB', true], ['Redis', true]]],
    ['CLOUD', [['AWS', true], ['Azure', false], ['DigitalOcean', false], ['Docker', false], ['Nginx', false], ['GitHub Actions', false]]],
    ['AI', [['MCP', true], ['Claude API', true], ['LLM tool use', false]]],
    ['FRONTEND', [['React', true], ['React Native', false], ['Vite', false], ['Tailwind', false]]],
  ];
  const W = 1200, rowH = 46, H = rows.length * rowH + 12, fs = 14, cw = fs * 0.6;
  const css = `.l { font: 500 12px Mono; letter-spacing: 1.5px; fill: ${t.muted}; } .p { font: 500 ${fs}px Mono; }`;
  let body = '';
  rows.forEach(([label, items], r) => {
    const y = 8 + r * rowH;
    body += `<text x="0" y="${y + 23}" class="l">${label}</text>`;
    let x = 130;
    for (const [name, core] of items) {
      const w = Math.round(name.length * cw + 26);
      body += `<rect x="${x}" y="${y + 4}" width="${w}" height="30" rx="7" fill="${core ? t.accent : t.panel}" stroke="${core ? t.accent : t.line}"/>
        <text x="${x + 13}" y="${y + 24}" class="p" style="fill:${core ? t.panel : t.muted}">${esc(name)}</text>`;
      x += w + 8;
    }
  });
  return svg(W, H, t, body, css, ['mono500']);
}

for (const t of THEMES) {
  await Bun.write(`${here}../assets/banner-${t.name}.svg`, banner(t));
  await Bun.write(`${here}../assets/impact-${t.name}.svg`, impact(t));
  await Bun.write(`${here}../assets/stack-${t.name}.svg`, stack(t));
}
console.log('assets written');
