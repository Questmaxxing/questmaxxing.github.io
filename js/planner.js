/*
  Questmax planner
  ----------------
  Pure planning logic. Knows nothing about Malawi specifically: every
  place, price and travel assumption comes from the destination file.
  Exposed as window.QMPlanner.
*/
(function () {
  const PACE = {
    relaxed:  { label: "Relaxed",  travelMax: 4, dayHours: 5, perBase: 3 },
    balanced: { label: "Balanced", travelMax: 6, dayHours: 7, perBase: 2.2 },
    packed:   { label: "Packed",   travelMax: 8, dayHours: 9, perBase: 1.6 }
  };
  const PACE_ORDER = ["packed", "balanced", "relaxed"];
  const TIERS = ["shoestring", "comfortable", "treat"];
  const TIER_LABEL = { shoestring: "Shoestring", comfortable: "Comfortable", treat: "Treat yourself" };
  const INTERESTS = ["wildlife", "water", "hiking", "culture", "food"];

  const round = (n, step = 0.5) => Math.round(n / step) * step;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const ZERO = [0, 0];

  function tierFor(budget) {
    if (budget < 75) return "shoestring";
    if (budget < 200) return "comfortable";
    return "treat";
  }

  function index(dest) {
    if (!dest._idx) {
      dest._idx = {
        place: Object.fromEntries(dest.places.map(p => [p.id, p])),
        act: Object.fromEntries(dest.activities.map(a => [a.id, a])),
        byPlace: dest.places.reduce((m, p) => (m[p.id] = dest.activities.filter(a => a.placeId === p.id), m), {})
      };
    }
    return dest._idx;
  }

  function haversine(a, b) {
    const R = 6371, toR = x => x * Math.PI / 180;
    const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function leg(dest, fromId, toId, tier, groupSize) {
    const ix = index(dest);
    const from = ix.place[fromId], to = ix.place[toId];
    if (!from || !to || fromId === toId) return null;
    const t = dest.travel;
    if (from.access === "ferry" || to.access === "ferry") {
      const other = from.access === "ferry" ? to : from;
      return {
        from: fromId, to: toId, km: Math.round(haversine(from, to) * t.roadFactor),
        hours: t.ferryHours, mode: "Ferry or charter flight", cost: t.ferryCost.slice(),
        needsCheck: true,
        note: (from.access === "ferry" ? from : to).accessNote + (other.region !== "North" ? " The ferry is easiest from Nkhata Bay." : "")
      };
    }
    const km = Math.round(haversine(from, to) * t.roadFactor);
    const rough = Math.max(from.roughRoad || 0, to.roughRoad || 0);
    const hours = Math.max(0.5, round(km / t.speedKmh[tier] + rough));
    const m = t.modes[tier];
    const cost = m.shared ? mul(m.perKmPerVehicle, km / Math.max(1, groupSize)) : mul(m.perKmPerPerson, km);
    return {
      from: fromId, to: toId, km, hours, mode: m.label, cost,
      needsCheck: false,
      note: rough ? (to.roughRoad ? to.accessNote : from.accessNote) : null
    };
  }

  function interestWeights(interests) {
    const all = !interests.length || interests.includes("everything");
    return Object.fromEntries(INTERESTS.map(k => [k, all ? 1 : (interests.includes(k) ? 2 : 0)]));
  }

  function actScore(act, w) {
    return 0.4 + act.tags.reduce((s, t) => s + (w[t] || 0), 0);
  }

  function eligible(act, inputs) {
    return !(inputs.group === "family" && act.kidFriendly === false);
  }

  function placeScore(dest, place, inputs, w) {
    const acts = index(dest).byPlace[place.id].filter(a => eligible(a, inputs));
    const top = acts.map(a => actScore(a, w)).sort((x, y) => y - x).slice(0, 3);
    return top.reduce((s, x) => s + x, 0);
  }

  function matchedTags(dest, placeId, inputs) {
    const w = interestWeights(inputs.interests);
    const tags = new Set();
    index(dest).byPlace[placeId].forEach(a => a.tags.forEach(t => { if (w[t] >= 2) tags.add(t); }));
    return [...tags];
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr];
    const out = [];
    arr.forEach((x, i) => permutations(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(p => out.push([x, ...p])));
    return out;
  }

  function bestOrder(dest, ids, startId, endId) {
    const ix = index(dest);
    const d = (a, b) => haversine(ix.place[a], ix.place[b]);
    let best = ids, bestKm = Infinity;
    for (const p of permutations(ids)) {
      let km = d(startId, p[0]) + d(p[p.length - 1], endId);
      for (let i = 1; i < p.length; i++) km += d(p[i - 1], p[i]);
      if (km < bestKm) { bestKm = km; best = p; }
    }
    return best;
  }

  function seasonFor(dest, startDate) {
    if (!startDate) return null;
    const m = new Date(startDate + "T12:00:00").getMonth() + 1;
    return dest.seasons.find(s => s.months.includes(m)) || null;
  }

  // ---------- Read free text ("anything else?") ----------
  const KEYWORDS = {
    wildlife: ["wildlife", "safari", "animal", "elephant", "lion", "bird", "birding", "hippo", "game drive", "rhino"],
    water: ["lake", "beach", "swim", "snorkel", "kayak", "dive", "diving", "boat", "water", "paddle"],
    hiking: ["hike", "hiking", "trek", "walk", "climb", "mountain", "trail", "outdoors", "bike", "cycling"],
    culture: ["culture", "history", "museum", "village", "market", "art", "music", "people", "church", "craft"],
    food: ["food", "eat", "coffee", "tea", "cook", "fish", "local dishes", "restaurant", "foodie"]
  };
  function parseNotes(text) {
    const t = (text || "").toLowerCase();
    const found = { interests: [], pace: null, group: null, picked: [] };
    if (!t.trim()) return found;
    for (const [k, words] of Object.entries(KEYWORDS)) {
      const hit = words.find(wd => t.includes(wd));
      if (hit) { found.interests.push(k); found.picked.push(`"${hit}" → more ${k}`); }
    }
    if (/\b(kid|kids|child|children|toddler|family)\b/.test(t)) { found.group = "family"; found.picked.push("travelling with kids → family-friendly only"); }
    if (/\b(slow|chill|relax|relaxed|easy|lazy|rest)\b/.test(t)) { found.pace = "relaxed"; found.picked.push("sounds like you want it slow → relaxed pace"); }
    if (/\b(see everything|packed|busy|as much as)\b/.test(t)) { found.pace = "packed"; found.picked.push("want to fit a lot in → packed pace"); }
    return found;
  }

  // ---------- Build a plan ----------
  function buildPlan(dest, rawInputs) {
    const inputs = normalise(dest, rawInputs);
    const ix = index(dest);
    const pace = PACE[inputs.pace];
    const tier = inputs.tierOverride || tierFor(inputs.budget);
    const w = interestWeights(inputs.interests);
    const D = inputs.days;
    const startG = inputs.start, endG = inputs.end;
    const warnings = [];

    // 1. choose bases
    let nBases = D <= 2 ? 0 : clamp(Math.round((D - 1) / pace.perBase), 1, 7);
    const scored = dest.places
      .filter(p => !p.gateway && !inputs.exclude.includes(p.id))
      .map(p => ({ p, s: placeScore(dest, p, inputs, w) }));

    const chosen = [];
    inputs.include.forEach(id => { const c = scored.find(x => x.p.id === id); if (c) chosen.push(c); });
    const kmScale = 10 + D * 5; // longer trips can roam further
    while (chosen.length < nBases) {
      let best = null, bestEff = -Infinity;
      for (const c of scored) {
        if (chosen.includes(c)) continue;
        const anchors = [ix.place[startG], ix.place[endG], ...chosen.map(x => x.p)];
        const dist = Math.min(...anchors.map(a => haversine(a, c.p)));
        const eff = c.s - dist / kmScale - (c.p.access === "ferry" && D < 9 ? 3 : 0);
        if (eff > bestEff) { bestEff = eff; best = c; }
      }
      if (!best) break;
      chosen.push(best);
    }
    nBases = chosen.length;

    // 2. order and allocate days
    let order = nBases ? bestOrder(dest, chosen.map(c => c.p.id), startG, endG) : [];
    const blocks = [];
    let budgetDays = D - 1; // last day is for getting to the airport
    if (!order.length) {
      blocks.push({ placeId: startG, days: Math.max(1, budgetDays) });
    } else {
      const arrival = leg(dest, startG, order[0], tier, inputs.groupSize);
      if (arrival && arrival.hours > 4.5 && budgetDays > order.length) {
        blocks.push({ placeId: startG, days: 1 });
        budgetDays -= 1;
      }
      while (order.length > budgetDays) {
        const weakest = chosen.filter(c => order.includes(c.p.id) && !inputs.include.includes(c.p.id))
          .sort((x, y) => x.s - y.s)[0] || chosen.find(c => order.includes(c.p.id));
        order = order.filter(id => id !== weakest.p.id);
      }
      const baseBlocks = order.map(id => ({ placeId: id, days: 1, s: chosen.find(c => c.p.id === id).s }));
      let extra = budgetDays - baseBlocks.length;
      while (extra > 0) {
        baseBlocks.sort((x, y) => (y.s / y.days) - (x.s / x.days));
        baseBlocks[0].days++;
        extra--;
      }
      const ordered = order.map(id => baseBlocks.find(b => b.placeId === id));
      blocks.push(...ordered.map(b => ({ placeId: b.placeId, days: b.days })));

      const lastId = blocks[blocks.length - 1].placeId;
      const out = leg(dest, lastId, endG, tier, inputs.groupSize);
      if (out && out.hours > pace.travelMax - 1) {
        const donor = blocks.filter(b => b.placeId !== startG).sort((x, y) => y.days - x.days)[0];
        if (donor && donor.days > 1) {
          donor.days--;
          blocks.push({ placeId: endG, days: 1 });
        } else {
          warnings.push(`It's about ${out.hours} hours from ${ix.place[lastId].name} to ${ix.place[endG].name} on your last day. Book a late flight, or add a day.`);
        }
      }
    }

    // 3. lay out days
    const days = [];
    let prev = startG;
    const inTrip = new Set(blocks.map(b => b.placeId));
    blocks.forEach(b => {
      let first = leg(dest, prev, b.placeId, tier, inputs.groupSize);
      let n = b.days;
      // Split very long road days with a night on the way, if we can spare one
      if (first && first.mode !== "Ferry or charter flight" && first.hours > pace.travelMax + 1 && n >= 2) {
        let best = null, bestMax = first.hours * 0.7;
        dest.places.forEach(p => {
          if ((inTrip.has(p.id) && !p.gateway) || p.access === "ferry" || p.roughRoad) return;
          const l1 = leg(dest, prev, p.id, tier, inputs.groupSize), l2 = leg(dest, p.id, b.placeId, tier, inputs.groupSize);
          if (!l1 || !l2) return;
          const mx = Math.max(l1.hours, l2.hours);
          if (mx < bestMax) { bestMax = mx; best = p.id; }
        });
        if (best) {
          days.push({ placeId: best, travel: leg(dest, prev, best, tier, inputs.groupSize), items: [], departure: false, stopover: true });
          first = leg(dest, best, b.placeId, tier, inputs.groupSize);
          n--;
        }
      }
      for (let i = 0; i < n; i++) {
        days.push({ placeId: b.placeId, travel: i === 0 ? first : null, items: [], departure: false });
      }
      prev = b.placeId;
    });
    days.push({ placeId: endG, travel: leg(dest, prev, endG, tier, inputs.groupSize), items: [], departure: true });
    if (D === 1) { days.length = 0; days.push({ placeId: startG, travel: null, items: [], departure: true }); }

    const trip = { v: 1, destination: dest.id, inputs, tier, days, warnings, createdAt: new Date().toISOString() };
    fillActivities(dest, trip);
    collectWarnings(dest, trip);
    return trip;
  }

  function normalise(dest, i) {
    const days = clamp(parseInt(i.days, 10) || 5, 1, 21);
    const groupSize = i.group === "solo" ? 1 : i.group === "couple" ? 2 : clamp(parseInt(i.groupSize, 10) || 4, 2, 20);
    const interests = (i.interests || []).filter(Boolean);
    return {
      destination: dest.id,
      start: i.start || dest.defaultGateway,
      end: i.end || i.start || dest.defaultGateway,
      days,
      startDate: i.startDate || "",
      interests: interests.length ? interests : ["everything"],
      budget: clamp(parseInt(i.budget, 10) || 120, 20, 1000),
      group: i.group || "couple",
      groupSize,
      pace: PACE[i.pace] ? i.pace : "balanced",
      style: i.style === "wander" ? "wander" : "full",
      notes: i.notes || "",
      include: i.include || [],
      exclude: i.exclude || [],
      tierOverride: i.tierOverride || null
    };
  }

  function fillActivities(dest, trip) {
    const ix = index(dest);
    const { inputs } = trip;
    const pace = PACE[inputs.pace];
    const w = interestWeights(inputs.interests);
    const used = new Set();
    trip.days.forEach((day, n) => {
      let hours = pace.dayHours - (day.travel ? day.travel.hours : 0);
      if (n === 0) hours -= 2;              // landing, getting cash, finding your feet
      if (day.departure) hours -= 3;        // airport buffer
      hours = Math.max(0, hours);
      const cap = inputs.style === "wander" ? hours * 0.55 : hours;
      let left = cap;
      const pool = ix.byPlace[day.placeId]
        .filter(a => eligible(a, inputs) && !used.has(a.id))
        .filter(a => trip.tier === "treat" || a.cost[0] <= inputs.budget * 0.7)
        .sort((x, y) => actScore(y, w) - actScore(x, w) || x.cost[0] - y.cost[0]);
      for (const a of pool) {
        if (a.hours <= left + 0.01 && actScore(a, w) >= 1) {
          day.items.push({ type: "activity", id: a.id });
          used.add(a.id);
          left -= a.hours;
        }
      }
      const spare = round(hours - (cap - left));
      if (!day.departure && (spare >= 1.5 || !day.items.length)) {
        day.items.push({ type: "free", hours: Math.max(1, spare) });
      }
    });
  }

  function collectWarnings(dest, trip) {
    const ix = index(dest);
    const pace = PACE[trip.inputs.pace];
    const season = seasonFor(dest, trip.inputs.startDate);
    trip.days.forEach(d => {
      if (d.travel && d.travel.hours > pace.travelMax) {
        trip.warnings.push(d.travel.mode === "Ferry or charter flight"
          ? `Getting to or from ${ix.place[ix.place[d.travel.from].access === "ferry" ? d.travel.from : d.travel.to].name} takes most of a day by ferry, or about an hour on a charter flight. Check schedules before you plan around it.`
          : `The drive to ${ix.place[d.placeId].name} is around ${d.travel.hours} hours. Start early, or split it with a night on the way.`);
      }
    });
    if (season && season.label === "Rainy season") {
      const rough = [...new Set(trip.days.map(d => ix.place[d.placeId]).filter(p => p.roughRoad))];
      if (rough.length) trip.warnings.push(`You're travelling in the rains. Roads to ${rough.map(p => p.name).join(" and ")} can get slow or close. Ask locally a few days before.`);
    }
    trip.warnings = [...new Set(trip.warnings)];
  }

  // ---------- Costs ----------
  function costDay(dest, trip, day) {
    const ix = index(dest);
    const place = ix.place[day.placeId];
    const c = { stay: ZERO, fee: ZERO, food: ZERO, activities: ZERO, transport: ZERO };
    if (!day.departure) c.stay = place.stay[trip.tier].slice();
    const acts = day.items.filter(i => i.type === "activity").map(i => ix.act[i.id]).filter(Boolean);
    if (place.fee && (acts.length || !day.departure)) c.fee = place.fee.slice();
    c.food = dest.foodPerDay[trip.tier].slice();
    c.activities = acts.reduce((s, a) => add(s, a.cost), ZERO);
    if (day.travel) c.transport = day.travel.cost.slice();
    c.total = Object.values(c).reduce((s, x) => add(s, x), ZERO);
    return c;
  }

  function costTrip(dest, trip) {
    const parts = { stay: ZERO, fee: ZERO, food: ZERO, activities: ZERO, transport: ZERO, total: ZERO };
    trip.days.forEach(d => {
      const c = costDay(dest, trip, d);
      Object.keys(parts).forEach(k => { parts[k] = add(parts[k], c[k]); });
    });
    const budgetTotal = trip.inputs.budget * trip.days.length;
    parts.budgetTotal = budgetTotal;
    const mid = (parts.total[0] + parts.total[1]) / 2;
    parts.fit = parts.total[1] <= budgetTotal ? "under" : mid <= budgetTotal * 1.1 ? "close" : "over";
    return parts;
  }

  // ---------- Editing ----------
  function usedActivityIds(trip) {
    return new Set(trip.days.flatMap(d => d.items.filter(i => i.type === "activity").map(i => i.id)));
  }

  function alternatives(dest, trip, dayIdx, itemIdx, { cheaper = false } = {}) {
    const ix = index(dest);
    const day = trip.days[dayIdx];
    const item = day.items[itemIdx];
    const current = item && item.type === "activity" ? ix.act[item.id] : null;
    const used = usedActivityIds(trip);
    const w = interestWeights(trip.inputs.interests);
    return ix.byPlace[day.placeId]
      .filter(a => !used.has(a.id) && eligible(a, trip.inputs))
      .filter(a => !cheaper || !current || a.cost[1] < current.cost[1])
      .sort((x, y) => cheaper ? (x.cost[1] - y.cost[1]) : (actScore(y, w) - actScore(x, w)));
  }

  function makeCheaper(dest, trip) {
    const ix = index(dest);
    const next = clone(trip);
    const changes = [];
    const ti = TIERS.indexOf(next.tier);
    if (ti > 0) {
      next.tier = TIERS[ti - 1];
      next.inputs.tierOverride = next.tier;
      changes.push(`Switched stays and transport to ${TIER_LABEL[next.tier].toLowerCase()} options.`);
      next.days.forEach(d => {
        if (d.travel) d.travel = leg(dest, d.travel.from, d.travel.to, next.tier, next.inputs.groupSize);
      });
    }
    next.days.forEach((d, di) => {
      d.items.forEach((it, ii) => {
        if (it.type !== "activity") return;
        const a = ix.act[it.id];
        if (a.cost[1] < 40) return;
        const alt = alternatives(dest, next, di, ii, { cheaper: true }).find(x => x.hours <= a.hours + 1);
        if (alt) {
          d.items[ii] = { type: "activity", id: alt.id };
          changes.push(`Swapped ${a.name} for ${alt.name}.`);
        }
      });
    });
    if (!changes.length) changes.push("This plan is already about as lean as we can make it. Fewer paid activities is the next lever.");
    return { trip: next, changes };
  }

  function slowDown(dest, trip) {
    const i = PACE_ORDER.indexOf(trip.inputs.pace);
    if (i === PACE_ORDER.length - 1) return null;
    return buildPlan(dest, { ...trip.inputs, pace: PACE_ORDER[i + 1] });
  }

  function swapStop(dest, trip, oldId, newId) {
    const include = trip.inputs.include.filter(x => x !== oldId);
    if (newId) include.push(newId);
    const exclude = [...new Set([...trip.inputs.exclude.filter(x => x !== newId), oldId])];
    return buildPlan(dest, { ...trip.inputs, include, exclude });
  }

  function stopCandidates(dest, trip, oldId) {
    const inTrip = new Set(trip.days.map(d => d.placeId));
    const w = interestWeights(trip.inputs.interests);
    const old = index(dest).place[oldId];
    return dest.places
      .filter(p => !p.gateway && !inTrip.has(p.id))
      .map(p => ({ place: p, score: placeScore(dest, p, trip.inputs, w), km: Math.round(haversine(old, p) * dest.travel.roadFactor) }))
      .sort((x, y) => (y.score - y.km / 120) - (x.score - x.km / 120));
  }

  // ---------- Save / share ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function compact(trip) {
    return {
      v: 1, i: trip.inputs, t: trip.tier, n: trip.name || "",
      d: trip.days.map(d => [d.placeId, d.travel ? d.travel.from : 0, d.items.map(it => it.type === "free" ? "f" + it.hours : it.id), d.departure ? 1 : 0])
    };
  }

  function hydrate(dest, c) {
    if (!c || c.v !== 1) throw new Error("Unknown trip format");
    const ix = index(dest);
    const days = c.d.map(([placeId, from, items, dep]) => {
      if (!ix.place[placeId]) throw new Error("Unknown place " + placeId);
      return {
        placeId,
        travel: from ? leg(dest, from, placeId, c.t, c.i.groupSize) : null,
        items: items.map(x => String(x).startsWith("f") && !ix.act[x] ? { type: "free", hours: parseFloat(String(x).slice(1)) } : { type: "activity", id: x }).filter(it => it.type === "free" || ix.act[it.id]),
        departure: !!dep
      };
    });
    const trip = { v: 1, destination: dest.id, inputs: c.i, tier: c.t, days, warnings: [], name: c.n || "" };
    collectWarnings(dest, trip);
    return trip;
  }

  function encode(trip) {
    const json = JSON.stringify(compact(trip));
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decode(dest, str) {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    return hydrate(dest, JSON.parse(decodeURIComponent(escape(atob(b64)))));
  }

  window.QMPlanner = {
    PACE, PACE_ORDER, TIERS, TIER_LABEL, INTERESTS,
    index, tierFor, leg, buildPlan, costDay, costTrip, seasonFor, parseNotes, matchedTags,
    alternatives, makeCheaper, slowDown, swapStop, stopCandidates, clone, compact, hydrate, encode, decode
  };
})();
