/*
  Questmax destination file: Malawi
  ---------------------------------
  Destination data lives here, separate from the planner (js/planner.js).
  To add a country, copy this file's shape into js/data/<country>.js,
  register it on window.QM_DESTINATIONS, and load it in index.html.

  Every place, activity and provider carries:
    status:      "checked" | "unverified"
    source:      where the info came from
    lastChecked: "YYYY-MM-DD" or null (null = not checked yet)

  IMPORTANT: this is a beta seed list compiled from general knowledge.
  Nothing here has been confirmed with operators yet, so everything is
  marked "unverified" with lastChecked: null. When you confirm a listing
  (phone call, operator email, official site), set status: "checked",
  lastChecked to the date, and update source.

  Money: USD per person unless noted. Ranges are estimates.
*/
(function () {
  const SEED = { label: "Questmax research", note: "Compiled from general travel knowledge. Not yet confirmed with the operator." };
  const U = { status: "unverified", source: SEED, lastChecked: null };

  // Accommodation bands per person per night [low, high], by budget tier
  const STAY = {
    city:  { shoestring: [10, 25], comfortable: [40, 90],  treat: [110, 220] },
    lake:  { shoestring: [8, 20],  comfortable: [35, 85],  treat: [120, 320] },
    park:  { shoestring: [15, 35], comfortable: [80, 180], treat: [250, 520] },
    hills: { shoestring: [10, 25], comfortable: [40, 100], treat: [120, 260] }
  };

  const providers = {
    "african-parks": {
      name: "African Parks",
      kind: "Manages Majete, Liwonde and Nkhotakota with the Malawi government",
      website: "https://www.africanparks.org",
      howToContact: "Use the park pages on their website for entry fees, camps and approved lodges.",
      ...U
    },
    "lilongwe-wildlife": {
      name: "Lilongwe Wildlife Trust",
      kind: "Wildlife rescue and education centre",
      website: "https://www.lilongwewildlife.org",
      howToContact: "Check tour times on their website before you go.",
      ...U
    },
    "mulanje-trust": {
      name: "Mulanje Mountain Conservation Trust",
      kind: "Conservation trust for Mount Mulanje",
      website: "https://www.mountmulanje.org.mw",
      howToContact: "Guides, porters and mountain huts are usually arranged at Likhubula Forest Lodge or through the trust.",
      ...U
    },
    "satemwa": {
      name: "Satemwa Tea Estate",
      kind: "Family-run tea and coffee estate in Thyolo",
      website: "https://www.satemwa.com",
      howToContact: "Tastings usually need booking ahead. Ask on their website.",
      ...U
    },
    "unesco-chongoni": {
      name: "Chongoni Rock-Art Area (UNESCO listing)",
      kind: "World Heritage site background",
      website: "https://whc.unesco.org/en/list/476",
      howToContact: "Background only. Arrange a guide locally in Dedza.",
      ...U
    },
    "unesco-lake": {
      name: "Lake Malawi National Park (UNESCO listing)",
      kind: "World Heritage site background",
      website: "https://whc.unesco.org/en/list/289",
      howToContact: "Background only. Boats and guides are arranged locally in Chembe village.",
      ...U
    },
    "visit-malawi": {
      name: "Malawi Department of Tourism",
      kind: "Official tourism information",
      website: "https://www.visitmalawi.mw",
      howToContact: "Good starting point for registered operators.",
      ...U
    },
    "local-guides": {
      name: "Local guides and boat operators",
      kind: "Independent guides, usually found through your accommodation",
      website: null,
      howToContact: "Ask your lodge or guesthouse to connect you with a registered guide. Agree the price and what's included before you set off.",
      ...U
    },
    "ilala": {
      name: "Ilala lake ferry",
      kind: "Passenger ferry on Lake Malawi",
      website: null,
      howToContact: "Schedules change and the boat is sometimes out of service. Ask at Monkey Bay or Nkhata Bay harbour, or your lodge, close to your travel date.",
      ...U
    }
  };

  // lat/lon in decimal degrees
  const places = [
    { id: "lilongwe", name: "Lilongwe", region: "Central", lat: -13.96, lon: 33.79, gateway: true, airport: "Kamuzu International (LLW)",
      stay: STAY.city, fee: null,
      summary: "The capital. Spread out and green, with busy markets and a good wildlife centre. Most people fly in here.",
      why: "Easy first stop while you get your bearings.", ...U },
    { id: "blantyre", name: "Blantyre", region: "South", lat: -15.79, lon: 35.01, gateway: true, airport: "Chileka International (BLZ)",
      stay: STAY.city, fee: null,
      summary: "Malawi's commercial hub, ringed by hills. Old churches, markets and a handy base for the south.",
      why: "Gateway to the south: Mulanje, Zomba, Majete and the tea country.", ...U },
    { id: "zomba", name: "Zomba Plateau", region: "South", lat: -15.35, lon: 35.32,
      stay: STAY.hills, fee: [3, 8],
      summary: "Cool pine forest, waterfalls and big views from the old colonial capital's mountain.",
      why: "Fresh air, easy walking and cheap, good trout.", ...U },
    { id: "mulanje", name: "Mount Mulanje", region: "South", lat: -15.93, lon: 35.6,
      stay: STAY.hills, fee: [5, 15],
      summary: "A granite massif rising straight out of the tea fields. Waterfalls, mountain huts and Sapitwa Peak at 3,002 m.",
      why: "The best hiking in the country.", ...U },
    { id: "thyolo", name: "Thyolo tea country", region: "South", lat: -16.07, lon: 35.14,
      stay: STAY.hills, fee: null,
      summary: "Rolling tea estates, misty mornings and forest patches full of birds.",
      why: "Slow days, tea tastings and green everywhere.", ...U },
    { id: "majete", name: "Majete Wildlife Reserve", region: "South", lat: -15.97, lon: 34.73,
      stay: STAY.park, fee: [20, 40],
      summary: "A reserve brought back to life. Lion, leopard, elephant, rhino and buffalo now live here again.",
      why: "Malawi's Big Five reserve, close to Blantyre.", ...U, providerId: "african-parks" },
    { id: "liwonde", name: "Liwonde National Park", region: "South", lat: -14.85, lon: 35.33,
      stay: STAY.park, fee: [20, 40],
      summary: "The Shire River runs through it: hippos, crocodiles, elephants at the water's edge and great birding.",
      why: "Boat safaris. Wildlife from the water is something else.", ...U, providerId: "african-parks" },
    { id: "cape-maclear", name: "Cape Maclear", region: "South", lat: -14.02, lon: 34.84,
      stay: STAY.lake, fee: [10, 20],
      summary: "Fishing village inside Lake Malawi National Park. Clear water, colourful cichlid fish and islands to kayak to.",
      why: "The classic lake stop for swimming, snorkelling and sunsets.", ...U, providerId: "unesco-lake" },
    { id: "senga-bay", name: "Senga Bay", region: "Central", lat: -13.72, lon: 34.62,
      stay: STAY.lake, fee: null,
      summary: "The closest lake beach to Lilongwe. Sandy shore, fishing boats and an island just offshore.",
      why: "Lake time without a long drive.", ...U },
    { id: "dedza", name: "Dedza & Mua", region: "Central", lat: -14.37, lon: 34.33,
      stay: STAY.hills, fee: null,
      summary: "Highland town known for its pottery, plus ancient rock art in the hills and the KuNgoni culture centre at Mua nearby.",
      why: "Culture and history on the road between Lilongwe and the lake.", ...U },
    { id: "nkhotakota", name: "Nkhotakota Wildlife Reserve", region: "Central", lat: -12.92, lon: 34.05,
      stay: STAY.park, fee: [15, 30],
      summary: "Malawi's oldest and wildest reserve. Big rivers, thick woodland and elephants moved here in a famous translocation.",
      why: "Off the usual track, with river trips and real wilderness.", ...U, providerId: "african-parks" },
    { id: "nkhata-bay", name: "Nkhata Bay", region: "North", lat: -11.61, lon: 34.3,
      stay: STAY.lake, fee: null,
      summary: "Steep green hills tumbling into deep coves. Laid-back, social, great for kayaking.",
      why: "The lake at its most relaxed.", ...U },
    { id: "likoma", name: "Likoma Island", region: "North", lat: -12.06, lon: 34.73,
      stay: STAY.lake, fee: null, access: "ferry",
      accessNote: "Reached by the Ilala ferry or a charter flight. Schedules change, so check before you plan around it.",
      summary: "Baobabs, empty beaches and a cathedral the size of an English one, in the middle of the lake.",
      why: "Properly away from it all.", ...U },
    { id: "nyika", name: "Nyika National Park", region: "North", lat: -10.58, lon: 33.8,
      stay: STAY.park, fee: [10, 25], roughRoad: 2,
      accessNote: "The last stretch is a long, rough dirt road. A 4x4 is advised, especially in the rains.",
      summary: "High rolling grassland above 2,000 m. Zebra, roan antelope and eland, wildflowers in the rains, cold nights.",
      why: "Nowhere else in Malawi looks like this.", ...U },
    { id: "livingstonia", name: "Livingstonia", region: "North", lat: -10.6, lon: 34.11, roughRoad: 1,
      stay: STAY.hills, fee: null,
      accessNote: "The Gorode road up from the lakeshore has 20 hairpin bends and can be rough. Ask locally about conditions.",
      summary: "Old mission town on an escarpment above the lake, with waterfalls and huge views.",
      why: "History, waterfalls and the best view of the north.", ...U },
    { id: "mzuzu", name: "Mzuzu", region: "North", lat: -11.46, lon: 34.02,
      stay: STAY.city, fee: null,
      summary: "The north's main town. Useful stop for supplies, banks and Malawi-grown coffee.",
      why: "Good overnight on the long road north.", ...U }
  ];

  // tags: wildlife | water | hiking | culture | food
  // hours: time on the activity itself; cost: [low, high] USD per person
  const a = (id, placeId, name, summary, tags, hours, cost, extra = {}) =>
    ({ id, placeId, name, summary, tags, hours, cost, kidFriendly: true, providerId: "local-guides", ...U, ...extra });

  const activities = [
    a("llw-wildlife", "lilongwe", "Lilongwe Wildlife Centre", "Guided walk around a sanctuary for rescued animals. A good intro to Malawi's conservation story.", ["wildlife", "culture"], 2, [10, 20], { providerId: "lilongwe-wildlife" }),
    a("llw-market", "lilongwe", "Old Town market wander", "Fabric, produce, second-hand everything. Go in the morning when it's busiest.", ["culture", "food"], 2, [0, 10]),
    a("llw-nsima", "lilongwe", "Nsima and chambo lunch", "Malawi's staple maize dish with lake fish and relish, at a local spot. Ask your host where they eat.", ["food"], 1.5, [4, 10]),
    a("bt-heritage", "blantyre", "St Michael's Church and Mandala House", "A brick church built by missionaries in the 1890s and one of the oldest buildings in the country.", ["culture"], 2, [0, 5]),
    a("bt-market", "blantyre", "Limbe market", "Big, loud, colourful. Hire a local guide if it's your first time.", ["culture", "food"], 2, [0, 10]),
    a("bt-michiru", "blantyre", "Michiru Mountain walk", "Forest trails and views over the city, close to town.", ["hiking"], 3, [5, 15]),
    a("zp-loop", "zomba", "Plateau loop to Chingwe's Hole", "Pine forest, the Williams Falls and viewpoints that stretch to Mulanje on a clear day.", ["hiking"], 4, [5, 15]),
    a("zp-trout", "zomba", "Trout lunch and plateau berries", "Local trout, plus strawberries and raspberries from roadside sellers when in season.", ["food"], 1.5, [5, 15]),
    a("zp-horse", "zomba", "Horse ride on the plateau", "Guided ride through the forest. Has run on and off over the years, so check first.", ["hiking"], 2, [25, 45], { needsCheck: true }),
    a("zp-town", "zomba", "Zomba town and market", "Old colonial buildings and one of the country's best produce markets.", ["culture", "food"], 2, [0, 5]),
    a("ml-falls", "mulanje", "Likhubula Falls hike", "Half-day walk to a waterfall and swimming pool at the foot of the mountain.", ["hiking", "water"], 4, [10, 20], { providerId: "mulanje-trust" }),
    a("ml-chambe", "mulanje", "Climb to the Chambe plateau", "Long, steep day up to the plateau and back. Many people stay a night or two in a mountain hut instead. Sapitwa Peak needs three days.", ["hiking"], 8, [30, 70], { providerId: "mulanje-trust", kidFriendly: false }),
    a("ml-tea", "mulanje", "Tea fields at the mountain's foot", "Walk or cycle through the estates around Mulanje town.", ["culture", "hiking"], 2.5, [5, 15]),
    a("th-tasting", "thyolo", "Satemwa tea and coffee tasting", "Taste teas grown on the estate and learn how they're made.", ["food", "culture"], 2, [15, 30], { providerId: "satemwa" }),
    a("th-forest", "thyolo", "Forest and birding walk", "Patches of indigenous forest between the tea. Good for the Thyolo alethe and other forest birds.", ["wildlife", "hiking"], 3, [10, 25]),
    a("mj-drive", "majete", "Game drive in Majete", "Search for lion, elephant, rhino and buffalo with a guide.", ["wildlife"], 3, [35, 70], { providerId: "african-parks" }),
    a("mj-walk", "majete", "Guided bush walk", "On foot with an armed scout. Slower, quieter and closer to the small stuff.", ["wildlife", "hiking"], 2.5, [25, 45], { providerId: "african-parks", kidFriendly: false }),
    a("mj-community", "majete", "Community visit near Majete", "Visit a village and projects around the reserve's edge.", ["culture"], 2, [10, 25], { providerId: "african-parks", needsCheck: true }),
    a("lw-boat", "liwonde", "Shire River boat safari", "Hippos, crocs, elephants at the water and kingfishers everywhere. Late afternoon is best.", ["wildlife", "water"], 2.5, [30, 60], { providerId: "african-parks" }),
    a("lw-drive", "liwonde", "Game drive in Liwonde", "Woodland and floodplain on the hunt for elephant, sable and, with luck, cheetah.", ["wildlife"], 3, [35, 70], { providerId: "african-parks" }),
    a("lw-walk", "liwonde", "Walking safari", "Early morning on foot with a scout.", ["wildlife", "hiking"], 2.5, [25, 45], { providerId: "african-parks", kidFriendly: false }),
    a("cm-kayak", "cape-maclear", "Kayak to Thumbi West Island", "Paddle out, snorkel among cichlids, eat lunch on the rocks.", ["water", "wildlife"], 4, [20, 45]),
    a("cm-snorkel", "cape-maclear", "Snorkel off Otter Point", "Hundreds of bright fish in clear water. Bring or borrow a mask.", ["water", "wildlife"], 2, [0, 10]),
    a("cm-sunset", "cape-maclear", "Sunset boat and fish braai", "Out on a local boat as the sun drops, with grilled fish on an island.", ["water", "food"], 3, [15, 35]),
    a("cm-village", "cape-maclear", "Chembe village walk", "Fishing life, school and clinic with a guide from the village.", ["culture"], 2, [5, 15]),
    a("cm-dive", "cape-maclear", "Try a freshwater dive", "Beginner dive with a qualified instructor. Freshwater means no salt and good visibility.", ["water"], 4, [60, 110], { kidFriendly: false, needsCheck: true }),
    a("sb-beach", "senga-bay", "Beach afternoon and swim", "Sand, fishing boats and a long lazy afternoon.", ["water"], 3, [0, 5]),
    a("sb-lizard", "senga-bay", "Boat to Lizard Island", "Short trip to a rocky island with monitor lizards and birdlife.", ["water", "wildlife"], 3, [20, 40]),
    a("sb-fish", "senga-bay", "Fish market and chambo lunch", "Watch the morning catch come in, then eat it.", ["food", "culture"], 2, [5, 12]),
    a("dz-pottery", "dedza", "Dedza Pottery and café", "Workshop visit and a famously good cheesecake.", ["culture", "food"], 2, [0, 15]),
    a("dz-rockart", "dedza", "Chongoni rock art", "Ancient paintings in the hills, a UNESCO World Heritage site. Go with a local guide.", ["culture", "hiking"], 4, [10, 25], { providerId: "unesco-chongoni" }),
    a("dz-mua", "dedza", "KuNgoni Centre at Mua", "Museum on Chewa, Ngoni and Yao culture, including Gule Wamkulu masks. About 45 minutes from Dedza.", ["culture"], 3, [5, 15], { needsCheck: true }),
    a("nk-river", "nkhotakota", "Bua River trip", "Canoe or boat on the river with a guide. Look out for elephant on the banks.", ["water", "wildlife"], 3, [25, 55], { providerId: "african-parks" }),
    a("nk-walk", "nkhotakota", "Walking safari", "Thick miombo woodland on foot with a scout.", ["wildlife", "hiking"], 3, [25, 45], { providerId: "african-parks", kidFriendly: false }),
    a("nb-kayak", "nkhata-bay", "Kayak the coves", "Paddle between rocky bays and fishing villages.", ["water"], 3, [10, 25]),
    a("nb-swim", "nkhata-bay", "Chikale beach and snorkel", "Swim, snorkel, lie about. Deep, clear water.", ["water"], 2.5, [0, 5]),
    a("nb-market", "nkhata-bay", "Harbour market", "Cassava, dried fish and the bustle around the ferry.", ["food", "culture"], 1.5, [0, 8]),
    a("lk-cathedral", "likoma", "St Peter's Cathedral", "A huge Anglican cathedral finished in 1911, on a small island.", ["culture"], 1.5, [0, 5]),
    a("lk-beach", "likoma", "Beach and snorkel day", "Quiet beaches and clear water.", ["water"], 4, [0, 15]),
    a("lk-walk", "likoma", "Island walk among the baobabs", "Villages, baobabs and views across to Mozambique.", ["hiking", "culture"], 3, [5, 15]),
    a("ny-drive", "nyika", "Plateau game drive", "Zebra, roan antelope, eland and reedbuck on the open grassland.", ["wildlife"], 3, [30, 60]),
    a("ny-walk", "nyika", "Guided plateau walk", "Rolling hills and big skies with a park guide.", ["hiking", "wildlife"], 4, [15, 35]),
    a("ny-bike", "nyika", "Mountain biking", "Ride the plateau tracks. Ask about bike hire in advance.", ["hiking"], 3, [20, 40], { needsCheck: true }),
    a("lv-stonehouse", "livingstonia", "Stone House museum", "Mission history in the old house of Dr Robert Laws.", ["culture"], 1.5, [2, 8]),
    a("lv-manchewe", "livingstonia", "Manchewe Falls walk", "A 125 m waterfall with a cave behind it.", ["hiking", "water"], 3, [3, 10]),
    a("mz-coffee", "mzuzu", "Mzuzu coffee stop", "Coffee grown on the Viphya hills, roasted in town.", ["food"], 1, [2, 6], { needsCheck: true })
  ];

  window.QM_DESTINATIONS = window.QM_DESTINATIONS || {};
  window.QM_DESTINATIONS.malawi = {
    id: "malawi",
    name: "Malawi",
    currency: { code: "MWK", note: "Prices shown in US dollars. Many lodges quote in USD; markets and minibuses are paid in kwacha." },
    defaultGateway: "lilongwe",
    seasons: [
      { months: [5, 6, 7, 8], label: "Cool and dry", note: "Comfortable days, cold nights in the highlands. Good for wildlife." },
      { months: [9, 10], label: "Hot and dry", note: "Best game viewing as animals gather at water. October can be very hot at the lake." },
      { months: [11, 12, 1, 2, 3, 4], label: "Rainy season", note: "Green and beautiful, but some dirt roads and park tracks get hard or close. Leave extra time." }
    ],
    // Planning assumptions for this country. The planner reads these, it doesn't hard-code them.
    travel: {
      roadFactor: 1.35,           // straight-line km to road km
      speedKmh: { shoestring: 38, comfortable: 50, treat: 55 },
      modes: {
        shoestring: { label: "Bus or minibus", perKmPerPerson: [0.03, 0.07], shared: false },
        comfortable: { label: "Car with driver", perKmPerVehicle: [0.45, 0.7], shared: true },
        treat: { label: "Private driver", perKmPerVehicle: [0.7, 1.0], shared: true }
      },
      ferryHours: 8,
      ferryCost: [15, 60]
    },
    foodPerDay: { shoestring: [8, 15], comfortable: [20, 35], treat: [45, 80] },
    providers,
    places,
    activities
  };

  // Destinations being researched. Shown in the planner, not bookable yet.
  window.QM_COMING_SOON = ["Zambia", "Mozambique", "Tanzania", "South Africa"];
})();
