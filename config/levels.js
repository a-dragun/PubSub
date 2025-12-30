const levels = [
  { level: 1, name: "Pivopija", min_score: 0, max_score: 2499, icon: "/images/levels/level1.png", description: "Došao si zbog piva, ali već nešto i pogađaš." },
  { level: 2, name: "Konobar", min_score: 2500, max_score: 4999, icon: "/images/levels/level2.png", description: "Znaš pravila kviza bolje nego pitanja." },
  { level: 3, name: "Znatiželja", min_score: 5000, max_score: 7499, icon: "/images/levels/level3.png", description: "Postao si zainteresiran za kvizove i počinješ učiti." },
  { level: 4, name: "Učenik", min_score: 7500, max_score: 9999, icon: "/images/levels/level4.png", description: "Još griješiš, ali učiš na greškama." },
  { level: 5, name: "Istraživač", min_score: 10000, max_score: 12499, icon: "/images/levels/level5.png", description: "Aktivno tražiš informacije i provjeravaš odgovore." },
  { level: 6, name: "Pripravnik", min_score: 12500, max_score: 14999, icon: "/images/levels/level6.png", description: "Već znaš osnove i povremeno iznenadiš ekipu." },
  { level: 7, name: "Analitičar", min_score: 15000, max_score: 19999, icon: "/images/levels/level7.png", description: "Razmišljaš logikom kad znanje zakaže." },
  { level: 8, name: "Strateg", min_score: 20000, max_score: 24999, icon: "/images/levels/level8.png", description: "Znaš kada riskirati, a kada igrati na sigurno." },
  { level: 9, name: "Znalac", min_score: 25000, max_score: 29999, icon: "/images/levels/level9.png", description: "Često daješ točan odgovor bez previše razmišljanja." },
  { level: 10, name: "Enciklopedija", min_score: 30000, max_score: 34999, icon: "/images/levels/level10.png", description: "Imaš opsežno znanje i poznaješ širok spektar tema." },
  { level: 11, name: "Profesor", min_score: 35000, max_score: 39999, icon: "/images/levels/level11.png", description: "Znaš toliko da si počeo objašnjavati zašto je neki odgovor točan." },
  { level: 12, name: "Ekspert", min_score: 40000, max_score: 44999, icon: "/images/levels/level12.png", description: "Rijetko griješiš i imaš opsežno znanje u velikom broju tema." },
  { level: 13, name: "Genij", min_score: 45000, max_score: 49999, icon: "/images/levels/level13.png", description: "Briljiraš na kvizovima i ljudi te pamte." },
  { level: 14, name: "Velikan", min_score: 50000, max_score: 59999, icon: "/images/levels/level14.png", description: "Igrač si s autoritetom, teško te nadmašiti." },
  { level: 15, name: "Joker", min_score: 60000, max_score: 69999, icon: "/images/levels/level15.png", description: "Izvlačiš točan odgovor kad nitko drugi ne zna." },
  { level: 16, name: "Elita", min_score: 70000, max_score: 79999, icon: "/images/levels/level16.png", description: "Uvijek si na vrhu, tvoje se ime pamti." },
  { level: 17, name: "Virtuoz", min_score: 90000, max_score: 99999, icon: "/images/levels/level17.png", description: "Postao si majstor u kvizu i posjeduješ impresivno znanje u svakoj kategoriji." },
  { level: 18, name: "Stari lisac", min_score: 125000, max_score: 149999, icon: "/images/levels/level18.png", description: "Iskustvo koje posjeduješ pomaže ti u svakoj situaciji." },
  { level: 19, name: "Veteran", min_score: 150000, max_score: 199999, icon: "/images/levels/level19.png", description: "Igrao si više kvizova nego što se može izbrojati." },
  { level: 20, name: "Legenda", min_score: 200000, max_score: null, icon: "/images/levels/level20.png", description: "Postao si legenda! Tvoje se ime spominje i kad nisi prisutan." }
];


function getLevelByScore(totalScore) {
  return levels.find(level =>
    totalScore >= level.min_score && (level.max_score === null || totalScore <= level.max_score)
  );
}

module.exports = { levels, getLevelByScore };
