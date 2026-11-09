/* Questmax app: screens, state and interactions. */
(function () {
  const P = window.QMPlanner;
  const DESTS = window.QM_DESTINATIONS;
  const CFG = window.QM_CONFIG || {};
  const app = document.getElementById("app");
  const FRAMED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

  // ---------- tiny helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const seedOf = str => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 997;
  const r5 = n => Math.max(0, Math.round(n / 5) * 5);
  const money = ([lo, hi]) => {
    const a = r5(lo), b = r5(hi);
    if (b === 0) return "Free";
    if (a === b) return `$${a.toLocaleString()}`;
    return `$${a.toLocaleString()}–${b.toLocaleString()}`;
  };
  const hrs = h => h < 1 ? `${Math.round(h * 60)} min` : `${h % 1 ? h.toFixed(1) : h} hr${h === 1 ? "" : "s"}`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem("qm." + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("qm." + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const fmtDate = (iso, plus = 0) => {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + plus);
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  };
  const checkedLabel = x => x.lastChecked
    ? `Checked ${new Date(x.lastChecked + "T12:00:00").toLocaleDateString(undefined, { month: "short", year: "numeric" })}`
    : "";
  const srcName = s => s.url
    ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ${icon("ext", 12)}</a>`
    : esc(s.label);
  const provenance = x => x.status === "checked" && x.lastChecked
    ? `<span class="ok-mark">${icon("check", 14)} ${checkedLabel(x)}</span> · ${srcName(x.source)}`
    : `${icon("info", 14)} Source: ${srcName(x.source)}`;

  const I = {
    pin: '<path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    wallet: '<path d="M4 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5zM4 7.5 15 4v3.5"/><circle cx="16" cy="14" r="1.2"/>',
    car: '<path d="M5 16V12l2-5h10l2 5v4M5 16h14M5 16v2M19 16v2"/><circle cx="8" cy="13" r=".8"/><circle cx="16" cy="13" r=".8"/>',
    boat: '<path d="M3 16l2 3h14l2-3H3zM12 4v12M12 5l6 8h-6"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4L12 4z"/><path d="M12 10v4M12 16.8v.2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    ext: '<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>',
    swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4 0 1.1-1 1.9-2.5 1.9-1.1 0-2-.4-2.5-1.2M12 6.5v1.8M12 15.8v1.7"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    share: '<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="m8 11 8-4M8 13l8 4"/>',
    print: '<path d="M7 9V4h10v5M7 17H5v-6h14v6h-2M7 14h10v6H7z"/>',
    save: '<path d="M6 4h12v16l-6-4-6 4z"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1.5"/><path d="M5 16V5a1 1 0 0 1 1-1h9"/>',
    flag: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    slow: '<path d="M4 18c2-6 6-9 10-9 3 0 5 2 5 4s-1.5 3-3 3H4z"/><circle cx="16" cy="12.5" r=".6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    bookmark: '<path d="M6 4h12v16l-6-4-6 4z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'
  };
  const icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  const INTEREST_INFO = {
    wildlife: { label: "Wildlife", hint: "Safaris, boats, birds" },
    water: { label: "Water", hint: "Lake, beaches, kayaks" },
    hiking: { label: "Mountains & walks", hint: "Hikes, plateaus, views" },
    culture: { label: "Culture", hint: "Markets, history, people" },
    food: { label: "Food", hint: "Fish, tea, local dishes" },
    everything: { label: "A bit of everything", hint: "Mix it up" }
  };
  const TIER_INFO = {
    shoestring: "Guesthouses, campsites, buses and minibuses.",
    comfortable: "Mid-range lodges and a car with a driver.",
    treat: "Safari lodges and private transfers."
  };
  const PACE_INFO = {
    relaxed: "Fewer moves, long lunches, time to sit by the lake.",
    balanced: "A good mix. Most people pick this.",
    packed: "More places, earlier starts, shorter stays."
  };

  // ---------- state ----------
  const dest = DESTS.malawi;
  const ix = P.index(dest);
  const DEFAULT_FORM = { destination: "malawi", start: "lilongwe", end: "lilongwe", startDate: "", days: 7, interests: [], include: [], notes: "", budget: 120, group: "couple", groupSize: 2, pace: "balanced", style: "full" };
  const state = {
    form: { ...DEFAULT_FORM, ...store.get("draft", {}) },
    step: 0,
    trip: store.get("current", null),
    explore: { interest: "all", region: "all" }
  };
  if (state.trip) { try { state.trip = P.hydrate(dest, P.compact(state.trip)); state.trip.id = store.get("current", {}).id; } catch (e) { state.trip = null; } }

  function setTrip(t, msg) {
    state.trip = t;
    store.set("current", t);
    if (t.id) upsertSaved(t, false);
    renderTrip();
    if (msg) toast(msg);
  }

  // ---------- toast & sheet ----------
  let toastTimer;
  function toast(msg) {
    let el = $(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }
  const sheet = document.getElementById("sheet");
  function openSheet(title, body, bind) {
    sheet.innerHTML = `<div class="sheet-inner"><div class="sheet-head"><h2 style="font-size:1.4rem">${title}</h2><button class="btn ghost small" data-close aria-label="Close">${icon("close")}</button></div>${body}</div>`;
    $("[data-close]", sheet).onclick = closeSheet;
    if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", "");
    bind && bind(sheet);
  }
  function closeSheet() { if (sheet.open) { sheet.close ? sheet.close() : sheet.removeAttribute("open"); } }
  sheet.addEventListener("click", e => { if (e.target === sheet) closeSheet(); });

  async function copyText(text, fallbackInput) {
    try { await navigator.clipboard.writeText(text); toast("Copied"); return true; }
    catch (e) { if (fallbackInput) { fallbackInput.focus(); fallbackInput.select(); } toast("Select the text and copy it"); return false; }
  }

  // ---------- map ----------
  const proj = (lon, lat) => [(lon - 32.5) * 100, (-9.2 - lat) * 100];
  const OUTLINE = [[33.0,-9.4],[33.95,-9.4],[34.35,-9.75],[34.55,-10.2],[34.65,-10.8],[34.75,-11.4],[34.85,-12.0],[34.9,-12.5],[34.85,-13.2],[35.0,-13.7],[35.15,-14.1],[35.3,-14.4],[35.55,-14.6],[35.85,-14.9],[35.85,-15.4],[35.75,-16.1],[35.3,-16.5],[35.25,-17.1],[35.05,-17.1],[34.6,-16.6],[34.4,-16.2],[34.25,-15.8],[34.55,-15.3],[34.5,-14.6],[34.1,-14.4],[33.6,-14.5],[33.25,-14.0],[33.0,-13.5],[32.7,-13.6],[32.95,-12.8],[33.3,-12.4],[33.25,-11.6],[33.3,-10.8],[33.6,-10.5],[33.3,-10.0]];
  const LAKE = [[33.95,-9.5],[33.92,-9.95],[34.05,-10.5],[34.2,-11.0],[34.28,-11.6],[34.2,-12.2],[34.28,-12.9],[34.5,-13.4],[34.6,-13.75],[34.8,-14.05],[34.95,-14.35],[35.2,-14.45],[35.15,-14.1],[35.0,-13.7],[34.85,-13.2],[34.9,-12.5],[34.85,-12.0],[34.75,-11.4],[34.65,-10.8],[34.55,-10.2],[34.35,-9.75],[34.1,-9.5]];
  const path = pts => "M" + pts.map(([lo, la]) => proj(lo, la).map(n => n.toFixed(1)).join(",")).join("L") + "Z";

  function mapSVG({ stops = [], legs = [], fit = false, labelAll = false, title = "Map of Malawi" } = {}) {
    let vb = [0, 0, 360, 800];
    if (fit && stops.length) {
      const xy = stops.map(s => proj(s.lon, s.lat));
      const xs = xy.map(p => p[0]), ys = xy.map(p => p[1]);
      let x0 = Math.min(...xs) - 70, x1 = Math.max(...xs) + 90, y0 = Math.min(...ys) - 60, y1 = Math.max(...ys) + 60;
      if (x1 - x0 < 260) { const c = (x0 + x1) / 2; x0 = c - 130; x1 = c + 130; }
      if (y1 - y0 < 300) { const c = (y0 + y1) / 2; y0 = c - 150; y1 = c + 150; }
      vb = [x0, y0, x1 - x0, y1 - y0];
    }
    const grat = [-10, -12, -14, -16].map(la => { const y = proj(0, la)[1]; return `<line class="grat" x1="-200" x2="600" y1="${y}" y2="${y}"/><text class="grat-lbl" x="${vb[0] + 6}" y="${y - 4}">${Math.abs(la)}°S</text>`; }).join("");
    const placeDots = dest.places.map(p => {
      const [x, y] = proj(p.lon, p.lat);
      const inStops = stops.some(s => s.id === p.id);
      if (inStops) return "";
      return `<circle class="dot" cx="${x}" cy="${y}" r="3.5"/>${labelAll ? `<text class="lbl dim" x="${x + 7}" y="${y + 4}">${esc(p.name.replace(/ (National Park|Wildlife Reserve|Plateau|tea country|& Mua)$/, ""))}</text>` : ""}`;
    }).join("");
    const legPaths = legs.map(l => {
      const a = proj(ix.place[l.from].lon, ix.place[l.from].lat), b = proj(ix.place[l.to].lon, ix.place[l.to].lat);
      const mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.12, my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.12;
      return `<path class="route${l.mode === "Ferry or charter flight" ? " ferry" : ""}" d="M${a}Q${mx},${my} ${b}"/>`;
    }).join("");
    const merged = [];
    stops.forEach((s, i) => {
      const prev = merged.find(m => m.id === s.id);
      if (prev) prev.n = `${prev.n}·${s.n ?? i + 1}`; else merged.push({ ...s, n: s.n ?? i + 1 });
    });
    const stopMarks = merged.map((s, i) => {
      const [x, y] = proj(s.lon, s.lat);
      const right = x < 260;
      const wide = String(s.n).length > 2;
      return `<g>${wide ? `<rect class="stop" x="${x - 15}" y="${y - 10}" width="30" height="20" rx="10"/>` : `<circle class="stop" cx="${x}" cy="${y}" r="10"/>`}<text class="stop-n" x="${x}" y="${y}">${s.n ?? i + 1}</text><text class="lbl" x="${right ? x + (wide ? 20 : 15) : x - (wide ? 20 : 15)}" y="${y + 4}" text-anchor="${right ? "start" : "end"}">${esc(s.label || s.name)}</text></g>`;
    }).join("");
    const [lx, ly] = proj(34.42, -12.3);
    return `<svg class="map" viewBox="${vb.join(" ")}" role="img" aria-label="${esc(title)}" preserveAspectRatio="xMidYMid meet">
      ${grat}<path class="land" d="${path(OUTLINE)}"/><path class="lake" d="${path(LAKE)}"/>
      <text class="lake-lbl" x="${lx}" y="${ly}" transform="rotate(-78 ${lx} ${ly})">Lake Malawi</text>
      ${placeDots}${legPaths}${stopMarks}</svg>`;
  }

  function tripStops(trip) {
    const stops = [];
    trip.days.forEach((d, i) => {
      const last = stops[stops.length - 1];
      if (!last || last.id !== d.placeId) {
        const p = ix.place[d.placeId];
        stops.push({ id: p.id, name: p.name, lat: p.lat, lon: p.lon, label: p.name.replace(/ (National Park|Wildlife Reserve)$/, ""), firstDay: i });
      }
    });
    // number repeated gateway visits the same way the route reads
    return stops.map((s, i) => ({ ...s, n: i + 1 }));
  }

  // ---------- routing ----------
  const ROUTES = { "": renderHome, plan: renderPlanner, trip: renderTrip, explore: renderExplore, saved: renderSaved, about: renderAbout };
  function route() {
    const r = location.hash.replace("#", "");
    const fn = ROUTES[r] || renderHome;
    $$(".nav a").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#" + r ? "page" : "false"));
    fn();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  function go(r) { if (location.hash === "#" + r) route(); else location.hash = r; }

  // ---------- HOME ----------
  function sampleTrip() {
    return P.buildPlan(dest, { days: 7, interests: ["wildlife", "water"], budget: 140, pace: "balanced", group: "couple" });
  }

  function renderHome() {
    document.title = "Questmax · Make a trip of it";
    const sample = sampleTrip();
    const stops = tripStops(sample);
    const c = P.costTrip(dest, sample);
    app.innerHTML = `
    <section class="hero">${QMScene("lake", 7, { w: 1600, h: 900, cls: "scene scene-bg", fit: "xMidYMax slice", sunX: 0.6, sunY: 0.7, sunScale: 0.08, top: 0.74, waterY: 0.84 })}<div class="wrap">
      <div class="hero-copy">
        <span class="stamp"><i></i> Now planning trips in Malawi</span>
        <h1>Tell us what you’re into. We’ll help you <em>make a trip of it.</em></h1>
        <p class="lede">A few days, a set budget, a list of things you love. Questmax helps bring it all together into a trip that feels like yours.</p>
        <div class="hero-actions">
          <a class="btn primary big" href="#plan">Plan my trip</a>
          <button class="btn big" id="open-sample">See a sample week</button>
        </div>
        <p class="hint-line">Free. No sign-up. Honest price ranges, and every listing tells you who to confirm with.</p>
      </div>
      <div class="hero-art"><div class="hero-card">
        ${mapSVG({ stops, legs: sample.days.filter(d => d.travel).map(d => d.travel), fit: true, title: "Sample week in Malawi, route map" })}
        <div class="hero-note"><span class="eyebrow">Sample week</span><br>${stops.map(s => esc(s.label)).join(" → ")}<br><span class="price">${money(c.total)}</span> <span class="muted">per person, est.</span></div>
      </div></div>
    </div></section>

    <section class="section alt"><div class="wrap">
      <div class="section-head"><span class="eyebrow">How it works</span><h2>From “I want to go” to a plan you can actually take.</h2></div>
      <ol class="steps">
        <li><h3>Tell us about your trip</h3><p>Where, how long, what you love, what you want to spend, who’s coming and how fast you like to move.</p></li>
        <li><h3>Get a day-by-day plan</h3><p>Places, activities, drive times, likely costs and who to contact locally.</p></li>
        <li><h3>Make it yours</h3><p>Swap stops, slow things down or find a cheaper option. One tap each.</p></li>
        <li><h3>Take it with you</h3><p>Save it, print it, or send a link to whoever’s coming.</p></li>
      </ol>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="section-head"><span class="eyebrow">Where we cover</span><h2>One country at a time, done properly.</h2>
      <p class="muted">We add destinations as we gather local info we can stand behind. Malawi is first.</p></div>
      <div class="dest-list">
        <div class="dest"><div class="place-art">${QMScene("lake", 3, { w: 600, h: 220 })}</div><span class="chip forest">${icon("check", 14)} Open in beta</span><h3>Malawi</h3><p class="muted" style="font-size:.92rem">${dest.places.length} places, ${dest.activities.length} things to do. Lake, parks, mountains, tea.</p><a href="#explore">Browse the catalogue →</a></div>
        ${window.QM_COMING_SOON.map(n => `<div class="dest off"><span class="chip">Researching</span><h3>${esc(n)}</h3><p style="font-size:.92rem">Not yet. We’d rather wait than guess.</p></div>`).join("")}
      </div>
    </div></section>

    <section class="section alt"><div class="wrap">
      <div class="section-head"><span class="eyebrow">Straight with you</span><h2>We show our working.</h2></div>
      <div class="dest-list">
        <div class="stack"><h3>Where it came from</h3><p class="muted">Every listing shows its source, plus a Checked date once we’ve confirmed it with the provider.</p></div>
        <div class="stack"><h3>Estimates, not promises</h3><p class="muted">Prices and travel times are ranges. No live bookings, no fake availability.</p></div>
        <div class="stack"><h3>Spot something wrong?</h3><p class="muted">Every listing has a report button. Local knowledge makes this better for everyone.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="wrap"><div class="cta-band">
      <h2>You’ve got the days. Let’s figure out the rest.</h2>
      <a class="btn primary big" href="#plan">Plan my trip</a>
    </div></div></section>`;
    $("#open-sample").onclick = () => { const t = sampleTrip(); t.name = "Sample week: wildlife and water"; setTrip(t); go("trip"); };
  }

  // ---------- PLANNER ----------
  const STEPS = ["where", "days", "interests", "budget", "pace"];
  function saveDraft() { store.set("draft", state.form); }

  function renderPlanner() {
    document.title = "Plan my trip · Questmax";
    const f = state.form;
    const s = STEPS[state.step];
    const prog = STEPS.map((_, i) => `<span class="${i <= state.step ? "on" : ""}"></span>`).join("");
    let body = "";
    if (s === "where") {
      const gw = dest.places.filter(p => p.gateway);
      body = `<h1>Where are you thinking of going?</h1>
      <div class="options" role="radiogroup" aria-label="Destination">
        <button class="opt" role="radio" aria-checked="true" type="button"><strong>Malawi</strong><small>Lake, safaris, mountains</small></button>
      </div>
      <p class="hint">Next up: ${window.QM_COMING_SOON.map(esc).join(", ")}. We add a country once we’ve checked the local info.</p>
      <div class="options" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
        <div class="field"><label for="f-start">Flying into</label><select id="f-start">${gw.map(p => `<option value="${p.id}" ${f.start === p.id ? "selected" : ""}>${esc(p.name)} · ${esc(p.airport)}</option>`).join("")}</select></div>
        <div class="field"><label for="f-end">Flying home from</label><select id="f-end">${gw.map(p => `<option value="${p.id}" ${f.end === p.id ? "selected" : ""}>${esc(p.name)} · ${esc(p.airport)}</option>`).join("")}</select></div>
        <div class="field"><label for="f-date">First day <span class="muted" style="font-weight:400">(optional)</span></label><input type="date" id="f-date" value="${esc(f.startDate)}"><span class="hint" id="season-hint">${seasonHint(f.startDate)}</span></div>
      </div>`;
    } else if (s === "days") {
      body = `<h1>How many days have you got?</h1>
      <p class="muted">Count the day you land and the day you fly out.</p>
      <div class="counter"><button class="btn" type="button" id="d-minus" aria-label="One day fewer">−</button><output id="d-out" aria-live="polite">${f.days}</output><button class="btn" type="button" id="d-plus" aria-label="One day more">+</button><span class="muted">days</span></div>
      <div class="row">${[3, 5, 7, 10, 14].map(n => `<button class="btn small ${f.days === n ? "primary" : ""}" type="button" data-days="${n}">${n} days</button>`).join("")}</div>
      <p class="hint" id="days-hint">${daysHint(f.days)}</p>`;
    } else if (s === "interests") {
      body = `<h1>What do you want more of?</h1>
      <p class="muted">Pick as many as you like.</p>
      <div class="options" id="interest-opts">${Object.entries(INTEREST_INFO).map(([k, v]) => `<button class="opt" type="button" data-int="${k}" aria-pressed="${f.interests.includes(k)}"><strong>${v.label}</strong><small>${v.hint}</small></button>`).join("")}</div>
      <div class="field"><span class="label">Already know somewhere you want to go?</span>
        <div class="row" id="must-opts">${dest.places.filter(p => !p.gateway).map(p => `<button class="opt" style="min-height:40px;padding:.4rem .8rem;border-radius:99px;display:inline-flex" type="button" data-must="${p.id}" aria-pressed="${f.include.includes(p.id)}">${esc(p.name)}</button>`).join("")}</div></div>
      <div class="field"><label for="f-notes">Anything else we should know?</label>
        <textarea id="f-notes" placeholder="e.g. travelling with two kids, love birds, want a couple of lazy beach days">${esc(f.notes)}</textarea>
        <div class="picked" id="picked" aria-live="polite">${pickedChips(f.notes)}</div></div>`;
    } else if (s === "budget") {
      const tier = P.tierFor(f.budget);
      body = `<h1>What feels comfortable for your budget?</h1>
      <p class="muted">Per person, per day, covering where you sleep, eating, getting around and activities. Flights not included.</p>
      <div class="budget-read"><output id="b-out">$${f.budget}</output><span class="muted">per person / day</span><span class="chip forest" id="b-tier">${P.TIER_LABEL[tier]}</span></div>
      <input type="range" id="f-budget" min="25" max="450" step="5" value="${f.budget}" aria-label="Budget per person per day in US dollars">
      <p class="hint" id="b-hint">${TIER_INFO[tier]}</p>
      <div class="field"><span class="label">Who’s coming?</span>
        <div class="options" role="radiogroup">${[["solo", "Just me"], ["couple", "Two of us"], ["friends", "Group of friends"], ["family", "Family with kids"]].map(([k, l]) => `<button class="opt" type="button" role="radio" data-group="${k}" aria-checked="${f.group === k}"><strong>${l}</strong></button>`).join("")}</div></div>
      <div class="field" id="size-field" ${["friends", "family"].includes(f.group) ? "" : "hidden"}><label for="f-size">How many people?</label><input type="number" id="f-size" min="2" max="20" value="${f.groupSize}" style="max-width:8rem"><span class="hint">We split car costs across the group.</span></div>`;
    } else if (s === "pace") {
      body = `<h1>Do you want a full itinerary or room to wander?</h1>
      <div class="field"><span class="label">Style</span><div class="options" role="radiogroup">
        <button class="opt" type="button" role="radio" data-style="full" aria-checked="${f.style === "full"}"><strong>Full itinerary</strong><small>Plan most of each day for me.</small></button>
        <button class="opt" type="button" role="radio" data-style="wander" aria-checked="${f.style === "wander"}"><strong>Room to wander</strong><small>A few anchors, lots of free time.</small></button></div></div>
      <div class="field"><span class="label">Pace</span><div class="options" role="radiogroup">${P.PACE_ORDER.slice().reverse().map(k => `<button class="opt" type="button" role="radio" data-pace="${k}" aria-checked="${f.pace === k}"><strong>${P.PACE[k].label}</strong><small>${PACE_INFO[k]}</small></button>`).join("")}</div></div>`;
    }
    const last = state.step === STEPS.length - 1;
    app.innerHTML = `<section class="planner"><div class="wrap">
      <div class="progress" aria-label="Step ${state.step + 1} of ${STEPS.length}">${prog}</div>
      <form class="q fade" id="qform" novalidate>${body}
        <div class="planner-nav">
          ${state.step ? `<button type="button" class="btn" id="back">Back</button>` : `<a class="btn ghost" href="#">Cancel</a>`}
          <button type="submit" class="btn primary ${last ? "big" : ""}">${last ? "Build my plan" : "Next"}</button>
        </div></form></div></section>`;
    bindPlanner(s);
  }

  function seasonHint(d) {
    const s = P.seasonFor(dest, d);
    return s ? `${s.label}: ${s.note}` : "Add a date and we’ll tell you what the season’s like.";
  }
  function daysHint(n) {
    if (n <= 2) return "Short one. We’ll keep you near the airport.";
    if (n <= 5) return "Enough for one or two places without rushing.";
    if (n <= 9) return "A proper trip. Lake plus a park, or a slice of the south.";
    return "Lots of room. You can reach the far north too.";
  }
  function pickedChips(text) {
    const p = P.parseNotes(text);
    if (!p.picked.length) return "";
    return `<span class="hint">What we picked up:</span>` + p.picked.map(x => `<span class="chip forest">${esc(x)}</span>`).join("");
  }

  function bindPlanner(s) {
    const f = state.form;
    const form = $("#qform");
    const radios = (attr, key, after) => $$(`[data-${attr}]`).forEach(b => b.onclick = () => {
      f[key] = b.dataset[attr]; $$(`[data-${attr}]`).forEach(x => x.setAttribute("aria-checked", x === b)); saveDraft(); after && after();
    });
    if (s === "where") {
      $("#f-start").onchange = e => { const prevEnd = f.end; if (prevEnd === f.start) { f.end = e.target.value; $("#f-end").value = f.end; } f.start = e.target.value; saveDraft(); };
      $("#f-end").onchange = e => { f.end = e.target.value; saveDraft(); };
      $("#f-date").onchange = e => { f.startDate = e.target.value; $("#season-hint").textContent = seasonHint(f.startDate); saveDraft(); };
    }
    if (s === "days") {
      const set = n => { f.days = Math.max(1, Math.min(21, n)); $("#d-out").textContent = f.days; $("#days-hint").textContent = daysHint(f.days); $$("[data-days]").forEach(b => b.classList.toggle("primary", +b.dataset.days === f.days)); saveDraft(); };
      $("#d-minus").onclick = () => set(f.days - 1);
      $("#d-plus").onclick = () => set(f.days + 1);
      $$("[data-days]").forEach(b => b.onclick = () => set(+b.dataset.days));
    }
    if (s === "interests") {
      $$("[data-int]").forEach(b => b.onclick = () => {
        const k = b.dataset.int;
        if (k === "everything") f.interests = f.interests.includes("everything") ? [] : ["everything"];
        else { f.interests = f.interests.filter(x => x !== "everything"); f.interests = f.interests.includes(k) ? f.interests.filter(x => x !== k) : [...f.interests, k]; }
        $$("[data-int]").forEach(x => x.setAttribute("aria-pressed", f.interests.includes(x.dataset.int)));
        saveDraft();
      });
      $$("[data-must]").forEach(b => b.onclick = () => {
        const k = b.dataset.must;
        f.include = f.include.includes(k) ? f.include.filter(x => x !== k) : [...f.include, k];
        b.setAttribute("aria-pressed", f.include.includes(k)); saveDraft();
      });
      $("#f-notes").oninput = e => { f.notes = e.target.value; $("#picked").innerHTML = pickedChips(f.notes); saveDraft(); };
    }
    if (s === "budget") {
      $("#f-budget").oninput = e => {
        f.budget = +e.target.value; const t = P.tierFor(f.budget);
        $("#b-out").textContent = "$" + f.budget; $("#b-tier").textContent = P.TIER_LABEL[t]; $("#b-hint").textContent = TIER_INFO[t]; saveDraft();
      };
      radios("group", "group", () => { $("#size-field").hidden = !["friends", "family"].includes(f.group); f.groupSize = f.group === "solo" ? 1 : f.group === "couple" ? 2 : Math.max(2, +$("#f-size").value || 4); });
      $("#f-size").oninput = e => { f.groupSize = +e.target.value || 2; saveDraft(); };
    }
    if (s === "pace") { radios("style", "style"); radios("pace", "pace"); }
    const back = $("#back"); if (back) back.onclick = () => { state.step--; renderPlanner(); };
    form.onsubmit = e => {
      e.preventDefault();
      if (state.step < STEPS.length - 1) { state.step++; renderPlanner(); window.scrollTo(0, 0); return; }
      buildFromForm();
    };
  }

  function buildFromForm() {
    const f = state.form;
    const parsed = P.parseNotes(f.notes);
    const interests = [...new Set([...(f.interests.includes("everything") ? [] : f.interests), ...parsed.interests])];
    const inputs = {
      ...f,
      interests: f.interests.includes("everything") || !interests.length ? ["everything"] : interests,
      group: parsed.group || f.group,
      groupSize: parsed.group === "family" && f.group !== "family" ? 4 : f.groupSize,
      pace: parsed.pace && f.pace === "balanced" ? parsed.pace : f.pace
    };
    const t = P.buildPlan(dest, inputs);
    t.name = `${t.inputs.days} days in Malawi`;
    t.picked = parsed.picked;
    state.step = 0;
    setTrip(t);
    go("trip");
  }

  // ---------- TRIP ----------
  function renderTrip() {
    const trip = state.trip;
    if (!trip) {
      app.innerHTML = `<section class="section"><div class="wrap empty"><h2>No plan yet.</h2><p class="muted">Answer five quick questions and we’ll put one together.</p><a class="btn primary big" href="#plan">Plan my trip</a></div></section>`;
      return;
    }
    document.title = `${trip.name || "Your trip"} · Questmax`;
    const c = P.costTrip(dest, trip);
    const stops = tripStops(trip);
    const season = P.seasonFor(dest, trip.inputs.startDate);
    const fit = {
      under: [icon("check", 16), "Fits your budget", "ok"],
      close: [icon("info", 16), "Around your budget", "forest"],
      over: [icon("alert", 16), "Over your budget", "warn"]
    }[c.fit];
    const interestText = trip.inputs.interests.includes("everything") ? "a bit of everything" : trip.inputs.interests.map(k => INTEREST_INFO[k].label.toLowerCase()).join(", ");

    let dayHtml = "", lastPlace = null;
    trip.days.forEach((d, di) => {
      const p = ix.place[d.placeId];
      if (d.placeId !== lastPlace) {
        const nights = trip.days.filter((x, j) => j >= di && x.placeId === d.placeId && !x.departure).length;
        const tags = P.matchedTags(dest, p.id, trip.inputs);
        const canSwap = !p.gateway && !d.stopover;
        dayHtml += `<div class="stop-head">
          <div class="banner">${QMScene(p.scene, seedOf(p.id) + di, { w: 1000, h: 312 })}<div class="label"><span class="eyebrow">${esc(p.region)} · ${d.departure ? "Last day" : nights ? `${nights} night${nights > 1 ? "s" : ""}` : ""}${d.stopover ? " · Overnight on the way" : ""}</span><h2>${esc(p.name)}</h2></div></div>
          ${canSwap ? `<div class="row" style="justify-content:flex-end"><button class="btn ghost small no-print" data-swapstop="${p.id}">${icon("swap", 16)} Swap this stop</button></div>` : ""}
          <p class="muted">${esc(p.summary)} ${d.stopover ? "Breaks up a long drive." : tags.length ? `Here for the ${tags.map(t => INTEREST_INFO[t].label.toLowerCase()).join(" and ")}.` : esc(p.why)}</p>
          ${p.accessNote ? `<p class="check-note">${icon("alert", 16)} ${esc(p.accessNote)}</p>` : ""}
        </div>`;
        lastPlace = d.placeId;
      }
      dayHtml += dayCard(trip, d, di);
    });

    app.innerHTML = `
    <section class="trip-head"><div class="wrap">
      <div class="row" style="justify-content:space-between"><span class="eyebrow">Your plan · ${trip.inputs.days} days · ${esc(P.TIER_LABEL[trip.tier])} · ${esc(P.PACE[trip.inputs.pace].label)} pace</span>
        <a class="btn ghost small no-print" href="#plan" id="edit-inputs">${icon("edit", 16)} Change trip details</a></div>
      <h1 style="font-size:clamp(1.9rem,4.5vw,2.8rem)">${esc(trip.name || "Your trip")}</h1>
      <p class="lede">You’ve got ${trip.inputs.days} day${trip.inputs.days > 1 ? "s" : ""} and a taste for ${esc(interestText)}. Here’s a first plan. We’ve kept the travel manageable and left you some time to enjoy the place.</p>
      ${trip.picked && trip.picked.length ? `<div class="picked"><span class="hint">From your notes:</span>${trip.picked.map(x => `<span class="chip forest">${esc(x)}</span>`).join("")}</div>` : ""}
      <div class="summary">
        <div><span class="eyebrow">Days</span><b>${trip.days.length}</b></div>
        <div><span class="eyebrow">Stops</span><b>${new Set(trip.days.map(d => d.placeId)).size}</b></div>
        <div><span class="eyebrow">Est. per person</span><b>${money(c.total)}</b></div>
        <div><span class="eyebrow">Your budget</span><b>$${c.budgetTotal.toLocaleString()}</b><span class="chip ${fit[2]}" style="justify-self:start">${fit[0]} ${fit[1]}</span></div>
      </div>
      <div class="toolbar no-print">
        <button class="btn primary" id="t-save">${icon("save", 16)} ${trip.id ? "Saved" : "Save"}</button>
        ${FRAMED ? "" : `<button class="btn" id="t-share">${icon("share", 16)} Share</button><button class="btn" id="t-print">${icon("print", 16)} Print</button>`}
        <button class="btn" id="t-copy">${icon("copy", 16)} Copy as text</button>
        <span style="flex:1"></span>
        <button class="btn" id="t-slow" ${trip.inputs.pace === "relaxed" ? "disabled" : ""}>${icon("slow", 16)} Slow it down</button>
        <button class="btn" id="t-cheap">${icon("coin", 16)} Find cheaper options</button>
      </div>
      ${c.fit === "over" ? `<div class="notice">${icon("alert")}<p>This plan runs over your budget of $${trip.inputs.budget}/day. Try <strong>Find cheaper options</strong>, or drop a paid activity or two.</p></div>` : ""}
      ${trip.warnings.map(w => `<div class="notice">${icon("alert")}<p>${esc(w)}</p></div>`).join("")}
      <div class="notice calm">${icon("info")}<p>Prices and travel times are estimates. Check with the provider before you set off.${season ? ` <strong>${esc(season.label)}:</strong> ${esc(season.note)}` : ""}</p></div>
    </div></section>
    <section class="trip-body"><div class="wrap">
      <div>${dayHtml}
        <div class="card pad stack" style="margin-top:1.5rem"><h3>Cost breakdown, per person</h3>
          <table class="costs"><tbody>
            <tr><td>Places to stay</td><td>${money(c.stay)}</td></tr>
            <tr><td>Park and reserve fees</td><td>${money(c.fee)}</td></tr>
            <tr><td>Food</td><td>${money(c.food)}</td></tr>
            <tr><td>Activities</td><td>${money(c.activities)}</td></tr>
            <tr><td>Getting around (${esc(dest.travel.modes[trip.tier].label.toLowerCase())})</td><td>${money(c.transport)}</td></tr>
            <tr class="total"><td>Total estimate</td><td>${money(c.total)}</td></tr>
          </tbody></table>
          <p class="hint">${esc(dest.currency.note)} Flights, visas, insurance and tips not included.</p>
        </div>
        <div class="row no-print" style="margin-top:1.25rem"><button class="btn ghost" id="t-report">${icon("flag", 16)} Report a problem with this plan</button></div>
      </div>
      <aside class="trip-side">
        <div class="card pad stack">
          <span class="eyebrow">Route</span>
          ${mapSVG({ stops, legs: trip.days.filter(d => d.travel).map(d => d.travel), fit: true, title: "Route map for this trip" })}
          <div class="legend"><span>— road</span><span>- - ferry or flight</span><span>Schematic, not to navigate by</span></div>
        </div>
      </aside>
    </div></section>`;
    bindTrip();
  }

  function dayCard(trip, d, di) {
    const c = P.costDay(dest, trip, d);
    const date = fmtDate(trip.inputs.startDate, di);
    const p = ix.place[d.placeId];
    const legH = d.travel ? (() => {
      const from = ix.place[d.travel.from];
      return `<div class="leg">${icon(d.travel.mode.startsWith("Ferry") ? "boat" : "car", 16)}<span><strong>${esc(from.name)} → ${esc(p.name)}</strong></span>
        <span class="mono">~${d.travel.km} km</span><span>${icon("clock", 14)} about ${hrs(d.travel.hours)}</span><span>${esc(d.travel.mode)}</span><span class="price">${money(d.travel.cost)}</span>
        ${d.travel.note ? `<span class="note">${esc(d.travel.note)}</span>` : ""}</div>`;
    })() : "";
    const items = d.items.map((it, ii) => it.type === "free" ? `
      <li class="item free"><div class="item-top"><h4>${di === 0 && !d.items.some(x => x.type === "activity") ? "Land, settle in, find your feet" : d.travel && ii === 0 ? "Arrive and settle in" : "Free time"}</h4><span class="muted" style="font-size:.85rem">${hrs(it.hours)}</span></div>
        <p>${di === 0 ? "Grab some kwacha, a local SIM and a proper meal." : "Wander, swim, nap, or ask your host what’s on nearby."}</p>
        <div class="acts no-print"><button class="btn ghost small" data-fill="${di}:${ii}">${icon("plus", 14)} Fill with something</button></div></li>` : activityItem(trip, ix.act[it.id], di, ii)).join("");
    return `<article class="card day fade">
      <div class="day-top"><h3><span class="daynum">Day ${di + 1}</span>${date ? ` · <span class="muted" style="font-family:var(--f-body);font-size:.95rem">${date}</span>` : ""}</h3>
        <span class="muted" style="font-size:.9rem">${d.departure ? `Fly home from ${esc(p.name)}` : d.stopover ? `Night in ${esc(p.name)}` : ""}</span></div>
      ${legH}
      ${items ? `<ul class="items">${items}</ul>` : ""}
      ${d.departure && !d.items.length ? `<p class="muted" style="padding:0 1.1rem .9rem">Head to the airport with time to spare. Domestic roads can surprise you.</p>` : ""}
      <div class="day-cost"><span>Day estimate, per person</span><span class="price">${money(c.total)}</span></div>
    </article>`;
  }

  function activityItem(trip, a, di, ii) {
    if (!a) return "";
    const prov = dest.providers[a.providerId];
    const p = ix.place[a.placeId];
    const osm = `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=12/${p.lat}/${p.lon}`;
    return `<li class="item">
      <div class="item-top"><h4>${esc(a.name)}</h4><span class="price">${money(a.cost)}</span></div>
      <p>${esc(a.summary)}</p>
      <div class="meta"><span>${icon("clock", 14)} ${hrs(a.hours)}</span>
        <span>${a.tags.map(t => INTEREST_INFO[t].label).join(" · ")}</span>
        ${prov ? `<span>${prov.website ? `<a href="${esc(prov.website)}" target="_blank" rel="noopener">${esc(prov.name)} ${icon("ext", 13)}</a>` : esc(prov.name)}</span>` : ""}
        <span><a href="${osm}" target="_blank" rel="noopener">${icon("pin", 13)} Map</a></span></div>
      ${a.needsCheck
        ? `<p class="check-note">${icon("alert", 15)} <span>This one looks promising, but we’d confirm the details before you build your day around it. ${prov ? esc(prov.howToContact) : ""}</span></p>`
        : `<p class="provenance">${provenance(a)}${prov && a.status !== "checked" ? ` · ${esc(prov.howToContact)}` : ""}</p>`}
      <div class="acts no-print">
        <button class="btn ghost small" data-swap="${di}:${ii}">${icon("swap", 14)} Swap</button>
        <button class="btn ghost small" data-cheap="${di}:${ii}">${icon("coin", 14)} Cheaper</button>
        <button class="btn ghost small" data-remove="${di}:${ii}">${icon("trash", 14)} Remove</button>
        <button class="btn ghost small" data-report="${a.id}">${icon("flag", 14)} Report</button>
      </div></li>`;
  }

  function bindTrip() {
    const trip = state.trip;
    const idx = s => s.split(":").map(Number);
    $$("[data-swap]").forEach(b => b.onclick = () => pickActivity(...idx(b.dataset.swap), false));
    $$("[data-cheap]").forEach(b => b.onclick = () => pickActivity(...idx(b.dataset.cheap), true));
    $$("[data-fill]").forEach(b => b.onclick = () => pickActivity(...idx(b.dataset.fill), false));
    $$("[data-remove]").forEach(b => b.onclick = () => {
      const [di, ii] = idx(b.dataset.remove);
      const t = P.clone(trip); const a = ix.act[t.days[di].items[ii].id];
      t.days[di].items[ii] = { type: "free", hours: a.hours };
      mergeFree(t.days[di]);
      setTrip(t, `Removed ${a.name}. More time to wander.`);
    });
    $$("[data-report]").forEach(b => b.onclick = () => openReport(ix.act[b.dataset.report]));
    $$("[data-swapstop]").forEach(b => b.onclick = () => pickStop(b.dataset.swapstop));
    $("#t-report").onclick = () => openReport(null);
    $("#edit-inputs").onclick = e => { e.preventDefault(); const i = trip.inputs; state.form = { ...DEFAULT_FORM, ...i, interests: i.interests.includes("everything") ? ["everything"] : i.interests }; state.step = 0; saveDraft(); go("plan"); };
    $("#t-slow").onclick = () => {
      const t = P.slowDown(dest, trip); if (!t) return;
      t.name = trip.name; t.id = trip.id;
      setTrip(t, `Slowed to a ${P.PACE[t.inputs.pace].label.toLowerCase()} pace. Fewer moves, more breathing room.`);
    };
    $("#t-cheap").onclick = () => {
      const { trip: t, changes } = P.makeCheaper(dest, trip);
      t.name = trip.name; t.id = trip.id;
      const before = P.costTrip(dest, trip).total, after = P.costTrip(dest, t).total;
      openSheet("A cheaper version", `<ul class="prose" style="padding-left:1.2rem">${changes.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <p>Estimate goes from <span class="price">${money(before)}</span> to <span class="price">${money(after)}</span> per person.</p>
        <div class="row"><button class="btn primary" id="apply-cheap">Use the cheaper plan</button><button class="btn" data-close2>Keep mine</button></div>`, s => {
        $("#apply-cheap", s).onclick = () => { closeSheet(); setTrip(t, "Switched to the cheaper plan."); };
        $("[data-close2]", s).onclick = closeSheet;
      });
    };
    $("#t-save").onclick = () => {
      if (!trip.id) { trip.id = "t" + Date.now().toString(36); }
      const ok = upsertSaved(trip, true);
      store.set("current", trip);
      toast(ok ? "Saved on this device. Find it under Saved." : "Couldn’t save in this browser. Use Share or Copy instead.");
      renderTrip();
    };
    const sh = $("#t-share"); if (sh) sh.onclick = shareTrip;
    const pr = $("#t-print"); if (pr) pr.onclick = () => window.print();
    $("#t-copy").onclick = () => {
      const txt = tripText(trip);
      openSheet("Your plan as text", `<textarea id="plain" rows="12" readonly style="font-family:var(--f-mono);font-size:.8rem">${esc(txt)}</textarea><div class="row"><button class="btn primary" id="copy-plain">${icon("copy", 16)} Copy</button></div>`, s => {
        $("#copy-plain", s).onclick = () => copyText(txt, $("#plain", s));
      });
    };
  }

  function mergeFree(day) {
    const out = [];
    day.items.forEach(it => {
      const last = out[out.length - 1];
      if (it.type === "free" && last && last.type === "free") last.hours += it.hours; else out.push({ ...it });
    });
    day.items = out;
  }

  function pickActivity(di, ii, cheaper) {
    const trip = state.trip;
    const cur = trip.days[di].items[ii];
    const curAct = cur.type === "activity" ? ix.act[cur.id] : null;
    const alts = P.alternatives(dest, trip, di, ii, { cheaper });
    const place = ix.place[trip.days[di].placeId];
    const title = cheaper ? "Something cheaper" : curAct ? `Swap ${esc(curAct.name)}` : `Something to do in ${esc(place.name)}`;
    const body = alts.length
      ? `<div class="pick-list">${alts.map(a => `<button class="opt" type="button" data-pick="${a.id}"><span><strong>${esc(a.name)}</strong><br><small>${hrs(a.hours)} · ${a.tags.map(t => INTEREST_INFO[t].label).join(" · ")}</small></span><span class="price">${money(a.cost)}</span></button>`).join("")}</div>`
      : `<p class="muted">${cheaper ? "Nothing cheaper here that we know of yet." : `That’s everything we’ve got listed in ${esc(place.name)} so far.`} Free time is always an option, and your host will know what’s on.</p>`;
    openSheet(title, body + (curAct ? `<button class="btn ghost" id="to-free">Make it free time instead</button>` : ""), s => {
      $$("[data-pick]", s).forEach(b => b.onclick = () => {
        const t = P.clone(trip); const a = ix.act[b.dataset.pick];
        t.days[di].items[ii] = { type: "activity", id: a.id };
        closeSheet(); setTrip(t, curAct ? `Swapped in ${a.name}.` : `Added ${a.name}.`);
      });
      const tf = $("#to-free", s);
      if (tf) tf.onclick = () => { const t = P.clone(trip); t.days[di].items[ii] = { type: "free", hours: curAct.hours }; mergeFree(t.days[di]); closeSheet(); setTrip(t, "Freed up the time."); };
    });
  }

  function pickStop(placeId) {
    const trip = state.trip;
    const cands = P.stopCandidates(dest, trip, placeId).slice(0, 6);
    const old = ix.place[placeId];
    openSheet(`Instead of ${esc(old.name)}`, `<p class="muted">We’ll rebuild the plan around your pick. Any swaps you made by hand will reset.</p>
      <div class="pick-list">${cands.map(c => `<button class="opt" type="button" data-stop="${c.place.id}"><span><strong>${esc(c.place.name)}</strong><br><small>${esc(c.place.why)}</small></span><span class="mono muted">~${c.km} km away</span></button>`).join("")}</div>
      <button class="btn ghost" id="drop-stop">Just drop it and spread the days around</button>`, s => {
      $$("[data-stop]", s).forEach(b => b.onclick = () => {
        const t = P.swapStop(dest, trip, placeId, b.dataset.stop); t.name = trip.name; t.id = trip.id;
        closeSheet(); setTrip(t, `Rebuilt the plan with ${ix.place[b.dataset.stop].name}.`);
      });
      $("#drop-stop", s).onclick = () => { const t = P.swapStop(dest, trip, placeId, null); t.name = trip.name; t.id = trip.id; closeSheet(); setTrip(t, `Dropped ${old.name}.`); };
    });
  }

  function shareUrl(trip) {
    const base = location.href.split("#")[0].split("?")[0];
    return `${base}?t=${P.encode(trip)}#trip`;
  }
  async function shareTrip() {
    const trip = state.trip;
    const url = shareUrl(trip);
    if (navigator.share && !FRAMED) {
      try { await navigator.share({ title: trip.name || "My Questmax trip", text: "Here’s the trip I’m planning:", url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    openSheet("Share this plan", `<p class="muted">Anyone with this link sees the same plan. Nothing personal is in it, just the places and your trip settings.</p>
      <div class="copybox"><input type="text" id="share-url" readonly value="${esc(url)}" aria-label="Share link"><button class="btn primary" id="copy-share">${icon("copy", 16)} Copy</button></div>`, s => {
      $("#copy-share", s).onclick = () => copyText(url, $("#share-url", s));
    });
  }

  function tripText(trip) {
    const c = P.costTrip(dest, trip);
    const lines = [`${trip.name || "My trip"} (Questmax)`, `${trip.inputs.days} days · ${P.TIER_LABEL[trip.tier]} · est. ${money(c.total)} per person`, ""];
    trip.days.forEach((d, i) => {
      const p = ix.place[d.placeId];
      lines.push(`Day ${i + 1}${trip.inputs.startDate ? " (" + fmtDate(trip.inputs.startDate, i) + ")" : ""}: ${p.name}${d.departure ? " · fly home" : ""}`);
      if (d.travel) lines.push(`  Travel from ${ix.place[d.travel.from].name}: ~${d.travel.km} km, about ${hrs(d.travel.hours)} (${d.travel.mode})`);
      d.items.forEach(it => {
        if (it.type === "free") lines.push(`  · Free time (${hrs(it.hours)})`);
        else { const a = ix.act[it.id]; const pr = dest.providers[a.providerId]; lines.push(`  · ${a.name} (${hrs(a.hours)}, ${money(a.cost)})${pr && pr.website ? " " + pr.website : ""}`); }
      });
      lines.push("");
    });
    lines.push("Prices and travel times are estimates. Check with the provider before you set off.");
    return lines.join("\n");
  }

  // ---------- saved trips ----------
  function upsertSaved(trip, bumpDate) {
    const list = store.get("saved", []);
    const entry = { id: trip.id, name: trip.name, savedAt: bumpDate ? new Date().toISOString() : (list.find(x => x.id === trip.id) || {}).savedAt || new Date().toISOString(), data: P.compact(trip) };
    const i = list.findIndex(x => x.id === trip.id);
    if (i >= 0) list[i] = entry; else list.unshift(entry);
    return store.set("saved", list);
  }

  function renderSaved() {
    document.title = "Saved trips · Questmax";
    const list = store.get("saved", []);
    app.innerHTML = `<section class="section"><div class="wrap stack">
      <div class="section-head"><span class="eyebrow">Saved on this device</span><h1 style="font-size:clamp(1.9rem,4.5vw,2.6rem)">Your trips</h1>
      <p class="muted">Saved in this browser only. Use Share to move a plan to your phone or send it to someone.</p></div>
      ${list.length ? `<div class="places">${list.map(x => {
        let t; try { t = P.hydrate(dest, x.data); } catch (e) { return ""; }
        const c = P.costTrip(dest, t); const stops = tripStops(t);
        const hero = ix.place[(stops.find(s2 => !ix.place[s2.id].gateway) || stops[0]).id];
        return `<article class="card pad place"><div class="place-art">${QMScene(hero.scene, seedOf(hero.id), { w: 600, h: 220 })}</div><span class="eyebrow">${t.inputs.days} days · saved ${new Date(x.savedAt).toLocaleDateString()}</span>
          <h3>${esc(x.name || "My trip")}</h3><p class="muted" style="font-size:.93rem">${stops.map(s => esc(s.label)).join(" → ")}</p>
          <p><span class="price">${money(c.total)}</span> <span class="muted">per person, est.</span></p>
          <div class="row"><button class="btn primary small" data-open="${x.id}">Open</button><button class="btn ghost small" data-del="${x.id}">${icon("trash", 14)} Delete</button></div>
          <div class="row" data-confirm="${x.id}" hidden><span>Delete this trip? This can’t be undone.</span><button class="btn small" data-yes="${x.id}">Yes, delete</button><button class="btn ghost small" data-no="${x.id}">Keep it</button></div>
        </article>`;
      }).join("")}</div>` : `<div class="empty card"><h2>Nothing saved yet.</h2><p class="muted">Build a plan and hit Save. It’ll show up here.</p><a class="btn primary" href="#plan">Plan my trip</a></div>`}
    </div></section>`;
    $$("[data-open]").forEach(b => b.onclick = () => { const x = list.find(y => y.id === b.dataset.open); const t = P.hydrate(dest, x.data); t.id = x.id; t.name = x.name; setTrip(t); go("trip"); });
    $$("[data-del]").forEach(b => b.onclick = () => { $(`[data-confirm="${b.dataset.del}"]`).hidden = false; });
    $$("[data-no]").forEach(b => b.onclick = () => { $(`[data-confirm="${b.dataset.no}"]`).hidden = true; });
    $$("[data-yes]").forEach(b => b.onclick = () => {
      store.set("saved", list.filter(x => x.id !== b.dataset.yes));
      if (state.trip && state.trip.id === b.dataset.yes) { delete state.trip.id; store.set("current", state.trip); }
      toast("Deleted."); renderSaved();
    });
  }

  // ---------- EXPLORE ----------
  function renderExplore() {
    document.title = "Explore Malawi · Questmax";
    const { interest, region } = state.explore;
    const places = dest.places.filter(p => region === "all" || p.region === region).filter(p => interest === "all" || ix.byPlace[p.id].some(a => a.tags.includes(interest)));
    app.innerHTML = `<section class="section"><div class="wrap">
      <div class="section-head"><span class="eyebrow">Malawi catalogue · beta</span><h1 style="font-size:clamp(1.9rem,4.5vw,2.6rem)">Places and things to do</h1>
      <p class="muted">Everything the planner draws from. Each listing shows where the info came from and when it was last checked.</p></div>
      <div class="filters" role="group" aria-label="Filter by interest">${[["all", "Everything"], ...Object.entries(INTEREST_INFO).filter(([k]) => k !== "everything").map(([k, v]) => [k, v.label])].map(([k, l]) => `<button class="opt" type="button" data-fi="${k}" aria-pressed="${interest === k}">${l}</button>`).join("")}</div>
      <div class="filters" role="group" aria-label="Filter by region">${["all", "North", "Central", "South"].map(k => `<button class="opt" type="button" data-fr="${k}" aria-pressed="${region === k}">${k === "all" ? "All regions" : k}</button>`).join("")}</div>
      <div class="places">${places.map(placeCard).join("") || `<p class="muted">Nothing matches that combination yet.</p>`}</div>
    </div></section>`;
    $$("[data-fi]").forEach(b => b.onclick = () => { state.explore.interest = b.dataset.fi; renderExplore(); });
    $$("[data-fr]").forEach(b => b.onclick = () => { state.explore.region = b.dataset.fr; renderExplore(); });
    $$("[data-report]").forEach(b => b.onclick = () => openReport(ix.act[b.dataset.report] || ix.place[b.dataset.report]));
  }

  function placeCard(p) {
    const acts = ix.byPlace[p.id].filter(a => state.explore.interest === "all" || a.tags.includes(state.explore.interest));
    const prov = p.providerId && dest.providers[p.providerId];
    const osm = `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=11/${p.lat}/${p.lon}`;
    return `<article class="card pad place">
      <div class="place-art">${QMScene(p.scene, seedOf(p.id), { w: 600, h: 220, label: p.name + " illustration" })}</div>
      <div class="row" style="justify-content:space-between"><span class="eyebrow">${esc(p.region)}${p.gateway ? " · Airport" : ""}</span><span class="mono muted">${Math.abs(p.lat).toFixed(2)}°S ${p.lon.toFixed(2)}°E</span></div>
      <h3>${esc(p.name)}</h3>
      <p class="muted" style="font-size:.95rem">${esc(p.summary)}</p>
      ${p.accessNote ? `<p class="check-note">${icon("alert", 15)} ${esc(p.accessNote)}</p>` : ""}
      <ul>${acts.map(a => `<li><div class="row"><strong>${esc(a.name)}</strong><span class="price">${money(a.cost)}</span></div><span class="muted" style="font-size:.85rem">${hrs(a.hours)} · ${a.tags.map(t => INTEREST_INFO[t].label).join(" · ")}${a.needsCheck ? " · confirm before you go" : ""}</span></li>`).join("")}</ul>
      <p style="font-size:.9rem"><strong>Stay:</strong> <span class="price">${money(p.stay.shoestring)}</span> to <span class="price">${money(p.stay.treat)}</span> <span class="muted">per person/night</span>${p.fee ? ` · <strong>Fees:</strong> <span class="price">${money(p.fee)}</span>/day` : ""}</p>
      <div class="row" style="font-size:.9rem">${prov && prov.website ? `<a href="${esc(prov.website)}" target="_blank" rel="noopener">${esc(prov.name)} ${icon("ext", 13)}</a>` : ""}<a href="${osm}" target="_blank" rel="noopener">${icon("pin", 13)} OpenStreetMap</a></div>
      <div class="provenance">${provenance(p)} <button class="btn ghost small" data-report="${p.id}" style="margin-left:auto">${icon("flag", 14)} Report</button></div>
    </article>`;
  }

  // ---------- REPORT ----------
  function openReport(item) {
    const what = item ? item.name : "this plan";
    const emailOk = !!CFG.reportEmail;
    openSheet("Report a problem", `<form id="rep" class="stack" novalidate>
      <p class="muted">About: <strong>${esc(what)}</strong>. Thanks for helping keep this honest.</p>
      <div class="field"><label for="rep-kind">What’s wrong?</label><select id="rep-kind">
        <option>Price is off</option><option>Contact details are wrong</option><option>Closed or doesn’t exist</option><option>Travel time is off</option><option>Something else</option></select></div>
      <div class="field"><label for="rep-text">Tell us more</label><textarea id="rep-text" required placeholder="What did you find? When?"></textarea></div>
      <div class="field"><label for="rep-email">Your email <span class="muted" style="font-weight:400">(optional, only if you want a reply)</span></label><input type="email" id="rep-email" autocomplete="email"></div>
      <p class="hint" id="rep-err" hidden>Add a few words so we know what to fix.</p>
      <div class="row"><button class="btn primary" type="submit">Send report</button></div></form>`, s => {
      $("#rep", s).onsubmit = async e => {
        e.preventDefault();
        const text = $("#rep-text", s).value.trim();
        if (!text) { $("#rep-err", s).hidden = false; $("#rep-text", s).focus(); return; }
        const report = { about: what, id: item ? item.id : null, kind: $("#rep-kind", s).value, text, email: $("#rep-email", s).value.trim(), at: new Date().toISOString(), page: location.hash };
        const reports = store.get("reports", []); reports.push(report); store.set("reports", reports);
        let sent = false;
        if (CFG.reportEndpoint) {
          try { const r = await fetch(CFG.reportEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(report) }); sent = r.ok; } catch (err) { sent = false; }
        }
        const plain = `Questmax report\nAbout: ${report.about}${report.id ? " (" + report.id + ")" : ""}\nIssue: ${report.kind}\n${report.text}`;
        const inner = $(".sheet-inner", s);
        inner.innerHTML = `<div class="sheet-head"><h2 style="font-size:1.4rem">${sent ? "Thanks, got it." : "Thanks. Saved."}</h2><button class="btn ghost small" data-close aria-label="Close">${icon("close")}</button></div>
          <p class="muted">${sent ? "We’ll check it and update the listing." : "We’ve kept your report on this device. To make sure it reaches us, copy it or send it by email."}</p>
          ${sent ? "" : `<textarea id="rep-plain" readonly rows="5" style="font-family:var(--f-mono);font-size:.8rem">${esc(plain)}</textarea>
          <div class="row"><button class="btn primary" id="rep-copy">${icon("copy", 16)} Copy report</button>
          ${emailOk ? `<a class="btn" href="mailto:${esc(CFG.reportEmail)}?subject=${encodeURIComponent("Questmax report: " + report.about)}&body=${encodeURIComponent(plain)}">Open in email</a>` : ""}</div>
          ${emailOk ? `<p class="hint">Email: <span class="mono">${esc(CFG.reportEmail)}</span></p>` : ""}`}`;
        $("[data-close]", s).onclick = closeSheet;
        const cp = $("#rep-copy", s); if (cp) cp.onclick = () => copyText(plain, $("#rep-plain", s));
      };
    });
  }

  // ---------- ABOUT ----------
  function renderAbout() {
    document.title = "How we plan · Questmax";
    app.innerHTML = `<section class="section"><div class="wrap prose">
      <span class="eyebrow">How Questmax works</span>
      <h1 style="font-size:clamp(1.9rem,4.5vw,2.6rem)">A travel friend who shows their working.</h1>
      <p class="lede">We build plans from a curated list of places and simple travel rules, then tell you exactly how sure we are.</p>
      <h2>How a plan comes together</h2>
      <ul>
        <li>We match what you’re into against what each place does best, and keep stops close enough that you’re not living in a car.</li>
        <li>Drive times come from straight-line distance, adjusted for real roads and known rough tracks. Long days get split with a night on the way when your trip allows.</li>
        <li>Costs are ranges built from typical prices for your budget level: where you sleep, food, park fees, activities and getting around.</li>
        <li>We read your notes for clues (kids, a slower pace, a love of birds) and show you what we picked up, so nothing happens behind your back.</li>
      </ul>
      <h2>Where the info comes from</h2>
      <div class="card pad stack">
        <p><span class="chip ok">${icon("check", 14)} Checked</span> We confirmed this with the provider or an official source on the date shown.</p>
        <p><span class="chip">${icon("info", 14)} Questmax research</span> Our own research, and our best current information. Prices and opening times change, so confirm with the provider before you go.</p>
      </div>
      <h2>What we don’t do (yet)</h2>
      <ul><li>No live bookings and no guaranteed availability.</li><li>We don’t copy listings from map apps or present guesses as facts.</li><li>One country at a time. Malawi first, more once we can stand behind the info.</li></ul>
      <h2>Know Malawi well?</h2>
      <p>Spot a wrong price, a closed lodge or a guide we should know about? Use <strong>Report</strong> on any listing. It all goes into the next check.</p>
      <div class="row"><a class="btn primary" href="#plan">Plan my trip</a><a class="btn" href="#explore">Browse the catalogue</a></div>
    </div></section>`;
  }

  // ---------- boot ----------
  const params = new URLSearchParams(location.search);
  if (params.get("t")) {
    try {
      const t = P.decode(dest, params.get("t"));
      t.name = t.name || "A shared trip";
      state.trip = t; store.set("current", t);
      history.replaceState(null, "", location.pathname + "#trip");
    } catch (e) { setTimeout(() => toast("That share link didn’t open. Ask for a fresh one."), 300); }
  }
  route();
})();
