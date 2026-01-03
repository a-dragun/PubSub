function normalize(text) {
  const map = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '@': 'a'
  };

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[01345@]/g, ch => map[ch]);
}


// Lista neprimjerenih izraza enkodirana je u Base64 zbog izbjegavanja eksplicitnih izraza u kodu
const encodedWords = [
  'amVi',
  'a3Vydg==',
  'cGl6ZA==',
  'c3Jhbmo=',
  'Z292bg==',
  'bWFqbXVuZQ==',
  'a3JldGVudQ==',
  'cGljaw==',
  'a3VyYWM='
];

function decodeBase64(str) {
  if (typeof atob === 'function') {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

const badWords = encodedWords.map(decodeBase64);

const profanityRegex = new RegExp(
  `\\b[a-z0-9]*?(${badWords.join('|')})[a-z0-9]*\\b`
);

function hasProfanity(text) {
  return profanityRegex.test(normalize(text));
}

module.exports = {hasProfanity}