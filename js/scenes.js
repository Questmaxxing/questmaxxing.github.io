/*
  Questmax landscapes
  -------------------
  Small generated illustrations for each kind of place (lake, park, river,
  hills, mountain, plateau, city). Deterministic: the same seed always draws
  the same picture. Swap for real, licensed photos when you have them.
  Exposed as window.QMScene(kind, seed, options) and window.QMLogo(size).
*/
(function () {
  let uid = 0;
  const PALETTES = {
    lake:     { sky: ["#FFE7AE", "#F7A65B", "#E2683C"], sun: "#FFF4D2", layers: ["#C9765A", "#94504A", "#5A3644"], water: ["#EE9460", "#6B4058"], fg: "#3A2530" },
    river:    { sky: ["#FFEDBD", "#F4B66C"], sun: "#FFF6DC", layers: ["#BDA66E", "#7F8A4F", "#4F6342"], water: ["#A7CFC8", "#3C6E6E"], fg: "#2F3A28" },
    park:     { sky: ["#FFE9AE", "#F4A655"], sun: "#FFF4D4", layers: ["#DDA963", "#AD7841", "#6E4C2D"], fg: "#2B2320" },
    hills:    { sky: ["#FDF1D4", "#CFE8DA"], sun: "#FFF9E8", layers: ["#AFD2BA", "#73AB8B", "#3F8463", "#1E5A44"], fg: "#174636", row: "#8FCBA2" },
    mountain: { sky: ["#FFE9C6", "#EDB98C", "#B98886"], sun: "#FFF2D8", layers: ["#BFA0A0", "#85717F", "#4D5262", "#20413A"], fg: "#16322C" },
    plateau:  { sky: ["#EEF5E6", "#BFDCD2"], sun: "#FFFBEA", layers: ["#D6DEAA", "#A8C07C", "#6E9257"], fg: "#4E7040" },
    city:     { sky: ["#FCD6A6", "#E58E73", "#6E5470"], sun: "#FFEBC4", layers: ["#A07070", "#61475C"], fg: "#2E2537" }
  };

  function rng(seed) {
    let a = (seed * 2654435761) >>> 0 || 1;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  function ridge(r, w, h, base, amp, opt = {}) {
    const f = [0.004 + r() * 0.004, 0.011 + r() * 0.01, 0.025 + r() * 0.02];
    const p = [r() * 6, r() * 6, r() * 6];
    const peakX = opt.peak ? w * (0.25 + r() * 0.5) : 0;
    let d = `M0,${h}`;
    for (let x = 0; x <= w + 20; x += 20) {
      let y = base - amp * (0.55 * Math.sin(x * f[0] + p[0]) + 0.3 * Math.sin(x * f[1] + p[1]) + 0.15 * Math.sin(x * f[2] + p[2]));
      if (opt.peak) y -= opt.peak * Math.exp(-(((x - peakX) / (w * 0.13)) ** 2));
      d += `L${x},${y.toFixed(1)}`;
    }
    return { d: d + `L${w + 20},${h}Z`, peakX };
  }

  function acacia(x, y, s, c) {
    return `<g fill="${c}"><path d="M${x},${y} l${-1.2 * s},${-9 * s} l${1.4 * s},0 l${-0.2 * s},${-2 * s} l${3 * s},${-2.5 * s} l${-2.2 * s},${2.8 * s} l${0.6 * s},${1.7 * s}z"/><ellipse cx="${x - 0.2 * s}" cy="${y - 12 * s}" rx="${7 * s}" ry="${1.8 * s}"/><ellipse cx="${x + 2.6 * s}" cy="${y - 13.2 * s}" rx="${4.5 * s}" ry="${1.4 * s}"/></g>`;
  }

  function dhow(x, y, s, c) {
    return `<g fill="${c}"><path d="M${x - 9 * s},${y} q${9 * s},${4 * s} ${20 * s},0 z"/><path d="M${x},${y - 1} L${x},${y - 18 * s} L${x + 9 * s},${y - 2 * s}z"/></g>`;
  }

  function birds(r, w, h, c) {
    let g = "";
    const n = 2 + Math.floor(r() * 3), bx = w * (0.15 + r() * 0.4), by = h * (0.15 + r() * 0.15);
    for (let i = 0; i < n; i++) {
      const x = bx + i * (18 + r() * 16), y = by + (r() - 0.5) * 20, s = 4 + r() * 3;
      g += `<path d="M${x - s},${y} q${s / 2},${-s / 2} ${s},0 q${s / 2},${-s / 2} ${s},0" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    return g;
  }

  window.QMScene = function (kind, seed = 1, o = {}) {
    const P = PALETTES[kind] || PALETTES.hills;
    const r = rng(seed + kind.length * 97);
    const w = o.w || 1200, h = o.h || 400;
    const id = "qs" + (++uid);
    const sunX = o.sunX != null ? w * o.sunX : w * (0.55 + r() * 0.3);
    const sunY = h * (o.sunY != null ? o.sunY : kind === "city" || kind === "lake" ? 0.5 : 0.36);
    const sunR = Math.min(w, h) * (o.sunScale || 0.09);
    const water = kind === "lake" || kind === "river";
    const nL = P.layers.length;
    let body = "";

    // sky + sun
    body += `<rect width="${w}" height="${h}" fill="url(#${id}s)"/>`;
    body += `<g class="sun"><circle cx="${sunX}" cy="${sunY}" r="${sunR * 2.2}" fill="${P.sun}" opacity=".25"/><circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${P.sun}"/></g>`;
    if (kind !== "city" && kind !== "plateau") body += birds(r, w, h, P.layers[nL - 1]);

    // land layers, far to near
    const top = o.top != null ? o.top : kind === "mountain" ? 0.42 : kind === "plateau" ? 0.62 : 0.52;
    const span = water ? 0.14 : 0.32;
    let nearPath = "";
    P.layers.forEach((c, i) => {
      const t = i / Math.max(1, nL - 1);
      let base = h * (top + t * span);
      if (water && i === nL - 1) base = h * 0.98;
      const amp = h * (kind === "mountain" ? 0.12 - t * 0.05 : kind === "plateau" ? 0.03 : 0.07 - t * 0.02);
      const peak = kind === "mountain" && i === 0 ? h * 0.22 : 0;
      const rd = ridge(r, w, h, base, amp, { peak });
      if (water && i === nL - 1) return; // near layer drawn after water
      body += `<path d="${rd.d}" fill="${c}" class="layer l${i}"/>`;
      nearPath = rd.d;
    });

    if (water) {
      const wy = h * (o.waterY != null ? o.waterY : kind === "lake" ? 0.66 : 0.7);
      body += `<rect x="0" y="${wy}" width="${w}" height="${h - wy}" fill="url(#${id}w)"/>`;
      for (let i = 0; i < 7; i++) {
        const y = wy + 6 + i * (h - wy) / 9, len = sunR * (1.6 - i * 0.16);
        body += `<rect x="${sunX - len / 2}" y="${y}" width="${len}" height="2.2" rx="1.1" fill="${P.sun}" opacity="${0.7 - i * 0.08}" class="shimmer"/>`;
      }
      if (kind === "lake") {
        body += dhow(w * (0.18 + r() * 0.2), wy + (h - wy) * 0.45, Math.max(1, w / 900), P.fg);
        body += `<path d="M0,${h} L0,${h * 0.86} Q${w * 0.12},${h * 0.8} ${w * 0.26},${h * 0.9} T${w * 0.45},${h} Z" fill="${P.fg}"/>`;
      } else {
        const bank = ridge(r, w, h, h * 0.9, h * 0.03);
        body += `<path d="${bank.d}" fill="${P.layers[nL - 1]}"/>`;
        nearPath = bank.d;
        for (let i = 0; i < 3; i++) body += acacia(w * (0.1 + r() * 0.8), h * 0.9, w / 500 + r(), P.fg);
      }
    }

    if (kind === "park") {
      for (let i = 0; i < 4; i++) body += acacia(w * (0.06 + r() * 0.88), h * (0.82 + r() * 0.12), w / 480 + r() * 1.2, P.fg);
    }
    if (kind === "hills") {
      body += `<clipPath id="${id}c"><path d="${nearPath}"/></clipPath><g clip-path="url(#${id}c)">`;
      for (let i = 0; i < 9; i++) {
        const y = h * (0.74 + i * 0.035);
        body += `<path d="M-20,${y} Q${w / 2},${y - h * 0.08} ${w + 20},${y}" fill="none" stroke="${P.row}" stroke-width="${2 + i * 0.4}" opacity=".55"/>`;
      }
      body += `</g>`;
    }
    if (kind === "plateau") {
      for (let i = 0; i < 40; i++) body += `<circle cx="${r() * w}" cy="${h * (0.86 + r() * 0.13)}" r="${1.5 + r() * 2}" fill="${["#F4D35E", "#F7F1E3", "#E58E73"][i % 3]}" opacity=".85"/>`;
    }
    if (kind === "mountain") {
      body += `<path d="M0,${h} L0,${h * 0.92} Q${w * 0.5},${h * 0.84} ${w},${h * 0.93} L${w},${h}Z" fill="${P.fg}"/>`;
    }
    if (kind === "city") {
      let x = w * 0.05, g = "";
      while (x < w * 0.95) {
        const bw = w * (0.025 + r() * 0.04), bh = h * (0.08 + r() * 0.2);
        g += `<rect x="${x}" y="${h * 0.9 - bh}" width="${bw}" height="${bh + h * 0.1}" fill="${P.fg}"/>`;
        for (let k = 0; k < 3; k++) if (r() > 0.45) g += `<rect x="${x + bw * (0.2 + r() * 0.5)}" y="${h * 0.9 - bh + bh * (0.15 + r() * 0.6)}" width="${Math.max(2, bw * 0.12)}" height="${Math.max(2, bw * 0.12)}" fill="#FFD27A"/>`;
        x += bw + w * (0.004 + r() * 0.02);
      }
      body += g + `<rect x="0" y="${h * 0.95}" width="${w}" height="${h * 0.05}" fill="${P.fg}"/>`;
    }

    const stops = P.sky.map((c, i) => `<stop offset="${(i / (P.sky.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("");
    const wstops = water ? `<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.water[0]}"/><stop offset="1" stop-color="${P.water[1]}"/></linearGradient>` : "";
    const aria = o.label ? `role="img" aria-label="${o.label.replace(/"/g, "&quot;")}"` : `aria-hidden="true"`;
    return `<svg class="${o.cls || "scene"}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${o.fit || "xMidYMid slice"}" ${aria}><defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>${wstops}</defs>${body}</svg>`;
  };

  // The Questmax mark: a Q drawn as a sunrise over hills and the lake, with a trail for its tail.
  window.QMLogo = function (size = 34) {
    const id = "qml" + (++uid);
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" class="logo-mark">
      <defs><clipPath id="${id}"><circle cx="18.5" cy="18.5" r="14"/></clipPath>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98C"/><stop offset="1" stop-color="#F08A4B"/></linearGradient></defs>
      <circle cx="18.5" cy="18.5" r="16.5" fill="#17423A"/>
      <g clip-path="url(#${id})">
        <rect x="0" y="0" width="40" height="40" fill="url(#${id}g)"/>
        <circle cx="21" cy="19" r="5.2" fill="#FFF4D2"/>
        <path d="M2 25 L10 16.5 L15 21 L21.5 13.5 L35 26 V40 H2Z" fill="#2E7A5C"/>
        <path d="M2 28 L9 22.5 L16 26.5 L35 24 V40 H2Z" fill="#17423A"/>
        <rect x="2" y="28.5" width="34" height="12" fill="#2E7D86"/>
        <rect x="14" y="30.5" width="8" height="1.4" rx=".7" fill="#FFF4D2" opacity=".8"/>
      </g>
      <path d="M27.5 27.5 L36 36" stroke="#E8693A" stroke-width="4.6" stroke-linecap="round"/>
      <circle cx="36" cy="36" r="1.2" fill="#FFF4D2"/>
    </svg>`;
  };
})();
