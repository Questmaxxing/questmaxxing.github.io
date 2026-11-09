/* Place photos: Wikimedia Commons, free licences. Each shows a credit and links to its source page. */
(function(){
  const photos = {
  "lilongwe": {
    "src": "img/places/lilongwe.jpg",
    "title": "Lilongwe (Malawi) - crafts market",
    "author": "Hans Hillewaert",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=561901",
    "caption": "Crafts market, Lilongwe"
  },
  "blantyre": {
    "src": "img/places/blantyre.jpg",
    "title": "St Michael and All Angels Church, Blantyre, Malawi Back",
    "author": "AndrewDressel",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=28645392",
    "caption": "St Michael and All Angels Church, Blantyre"
  },
  "zomba": {
    "src": "img/places/zomba.jpg",
    "title": "Panorama Blick auf das Zomba Plateau vom Ndangopuma Hügel",
    "author": "Rockwurm",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=14878458",
    "caption": "Zomba Plateau from Ndangopuma hill"
  },
  "mulanje": {
    "src": "img/places/mulanje.jpg",
    "title": "Mount Mulanje (15691666391)",
    "author": "David Davies from Birmingham, UK",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=57977296",
    "caption": "Mount Mulanje above the tea fields"
  },
  "thyolo": {
    "src": "img/places/thyolo.jpg",
    "title": "Mount Mulanje (15507716559)",
    "author": "David Davies from Birmingham, UK",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=57977306",
    "caption": "Tea fields below Mount Mulanje, in the same tea belt"
  },
  "majete": {
    "src": "img/places/majete.jpg",
    "title": "Elephant at Majete wildlife reserve (15073475793)",
    "author": "David Davies from Birmingham, UK",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=68543554",
    "caption": "Elephant in Majete Wildlife Reserve"
  },
  "liwonde": {
    "src": "img/places/liwonde.jpg",
    "title": "Flora in Liwonde Park (14874711337)",
    "author": "Ludger Heide",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=75080079",
    "caption": "Baobab and palms in Liwonde National Park"
  },
  "cape-maclear": {
    "src": "img/places/cape-maclear.jpg",
    "title": "Cape McLear, Malawi (2498445835)",
    "author": "Joachim Huber from Switzerland",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=22488470",
    "caption": "Rocks and clear water at Cape Maclear"
  },
  "senga-bay": {
    "src": "img/places/senga-bay.jpg",
    "title": "Senga Bay Strand",
    "author": "Brian Dell",
    "license": "Public domain",
    "licenseUrl": "",
    "page": "https://commons.wikimedia.org/w/index.php?curid=5189730",
    "caption": "Senga Bay beach"
  },
  "dedza": {
    "src": "img/places/dedza.jpg",
    "title": "Chongoni Rock-Art Area-110124",
    "author": "Lazare Eloundou Assomo",
    "license": "CC BY-SA 3.0 igo",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/igo/deed.en",
    "page": "https://commons.wikimedia.org/w/index.php?curid=58155424",
    "caption": "Chongoni rock art near Dedza"
  },
  "nkhotakota": {
    "src": "img/places/nkhotakota.jpg",
    "title": "Flickr - ggallice - Nkhotakota Game Reserve",
    "author": "Geoff Gallice from Gainesville, FL, USA",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=22441078",
    "caption": "Woodland in Nkhotakota Wildlife Reserve"
  },
  "nkhata-bay": {
    "src": "img/places/nkhata-bay.jpg",
    "title": "Nkhata Bay Lake Malawi",
    "author": "Avi Alpert",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=92098850",
    "caption": "Boats in Nkhata Bay"
  },
  "likoma": {
    "src": "img/places/likoma.jpg",
    "title": "Likoma Island Cathedral - Malawi",
    "author": "TravelingOtter",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=160864060",
    "caption": "St Peter's Cathedral, Likoma Island"
  },
  "nyika": {
    "src": "img/places/nyika.jpg",
    "title": "Nyika Plateau II (14874700438)",
    "author": "Ludger Heide",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=36868774",
    "caption": "Rolling hills of the Nyika Plateau"
  },
  "livingstonia": {
    "src": "img/places/livingstonia.jpg",
    "title": "Livingstonia Mission Church, Malawi 02",
    "author": "Mara 1",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "page": "https://commons.wikimedia.org/w/index.php?curid=160849912",
    "caption": "Livingstonia Mission Church"
  },
  "mzuzu": {
    "src": "img/places/mzuzu.jpg",
    "title": "MzuzuMalawi",
    "author": "Malawiana",
    "license": "Public domain",
    "licenseUrl": "",
    "page": "https://commons.wikimedia.org/w/index.php?curid=4953897",
    "caption": "A street in Mzuzu"
  }
};
  const d = window.QM_DESTINATIONS.malawi;
  d.places.forEach(p => { if (photos[p.id]) p.photo = photos[p.id]; });
})();
