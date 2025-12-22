const levels = [
  { level: 1, name: "Pivopija", min_score: 0, max_score: 2499, icon: null, description: "Došao si zbog pive, ali već nešto i pogađaš." },
  { level: 2, name: "Konobar", min_score: 2500, max_score: 4999, icon: null, description: "Znaš pravila kviza bolje nego pitanja." },
  { level: 3, name: "Znatiželja", min_score: 5000, max_score: 7499, icon: null, description: "Pitaš se 'kako to nitko ne zna?' i počinješ učiti." },
  { level: 4, name: "Učenik", min_score: 7500, max_score: 9999, icon: null, description: "Još griješiš, ali pamtiš svaku pogrešku." },
  { level: 5, name: "Istraživač", min_score: 10000, max_score: 12499, icon: null, description: "Aktivno tražiš informacije i provjeravaš odgovore." },
  { level: 6, name: "Pripravnik", min_score: 12500, max_score: 14999, icon: null, description: "Već znaš osnove i povremeno iznenadiš ekipu." },
  { level: 7, name: "Analitičar", min_score: 17500, max_score: 19999, icon: null, description: "Razmišljaš logikom kad znanje zakaže." },
  { level: 8, name: "Strateg", min_score: 20000, max_score: 24999, icon: null, description: "Znaš kada riskirati, a kada igrati na sigurno." },
  { level: 9, name: "Znalac", min_score: 25000, max_score: 29999, icon: null, description: "Često imaš točan odgovor bez razmišljanja." },
  { level: 10, name: "Enciklopedija", min_score: 30000, max_score: 34999, icon: null, description: "Imaš opsežno znanje i širok spektar tema." },
  { level: 11, name: "Profesor", min_score: 35000, max_score: 39999, icon: null, description: "Objašnjavaš odgovor prije nego što je postavljeno pitanje." },
  { level: 12, name: "Ekspert", min_score: 40000, max_score: 44999, icon: null, description: "Rijetko griješiš i znaš više nego što bi trebao." },
  { level: 13, name: "Genij", min_score: 45000, max_score: 49999, icon: null, description: "Briljiraš i publika te pamti pod pritiskom." },
  { level: 14, name: "Velikan", min_score: 50000, max_score: 59999, icon: null, description: "Igrač si velikog autoriteta, teško te nadmašiti." },
  { level: 15, name: "Joker", min_score: 60000, max_score: 69999, icon: null, description: "Izvlačiš točan odgovor kad je svima ostalima mrak." },
  { level: 16, name: "Elita", min_score: 70000, max_score: 79999, icon: null, description: "Uvijek si na vrhu, ime koje se pamti." },
  { level: 17, name: "Virtuoz", min_score: 90000, max_score: 99999, icon: null, description: "Majstorski si u kvizu i impresivan u svakoj kategoriji." },
  { level: 18, name: "Stari lisac", min_score: 125000, max_score: 149999, icon: null, description: "Iskustvo, trikovi i mirna ruka ti pomažu u svakoj situaciji." },
  { level: 19, name: "Veteran", min_score: 150000, max_score: 199999, icon: null, description: "Igrao si više kvizova nego što se može izbrojati." },
  { level: 20, name: "Legenda", min_score: 200000, max_score: null, icon: null, description: "Ime koje se spominje i kad nisi prisutan." }
];


function getLevelByScore(totalScore) {
  return levels.find(level =>
    totalScore >= level.min_score && (level.max_score === null || totalScore <= level.max_score)
  );
}

module.exports = { levels, getLevelByScore };
