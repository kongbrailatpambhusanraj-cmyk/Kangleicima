export interface SeriesInfo {
  coreTitle: string;
  partNumber: number | null;
  rawPart: string | null;
}

const ROMAN_MAP: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
};

const STOP_WORDS = new Set([
  'manipuri',
  'film',
  'movie',
  'cinema',
  'shumang',
  'sumang',
  'leela',
  'lila',
  'khumhei',
  'kumhei',
  'drama',
  'full',
  'official',
  'release',
  'latest',
  'new',
  'video',
  'webseries',
  'series',
  'teaser',
  'trailer',
  'presents',
  'association',
  'artistes',
  'hd',
  '4k',
  'ultra',
  '1080p',
  '720p',
]);

export function parseSeriesInfo(rawTitle: string): SeriesInfo {
  if (!rawTitle) return { coreTitle: '', partNumber: null, rawPart: null };

  // 1. Clean noisy symbols without deleting parts behind pipes
  let clean = rawTitle
    .replace(/[|\[\]\(\)\{\}\-_/\\:"]/g, ' ')
    .replace(/&quot;/g, ' ')
    .replace(/&amp;/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();

  let partNumber: number | null = null;
  let rawPart: string | null = null;

  // 2. Keyword matching: Part 1, Episode 2, Scene 3, Vol 1, Last Part
  const explicitPartRegex = /\b(?:part|pt|episode|ep|scene|vol|volume|last\s*part)[\s.:#]*([0-9]+|[ivx]+)?\b/i;
  const explicitMatch = clean.match(explicitPartRegex);

  if (explicitMatch) {
    const matchedString = explicitMatch[0];
    const capturedVal = (explicitMatch[1] || '').toLowerCase();

    if (matchedString.toLowerCase().includes('last part')) {
      partNumber = 999;
      rawPart = 'LAST PART';
    } else if (capturedVal) {
      partNumber = ROMAN_MAP[capturedVal] || parseInt(capturedVal, 10) || null;
      rawPart = `PART ${partNumber}`;
    }

    clean = clean.replace(matchedString, ' ');
  }

  // 3. Extract core tokens, discarding catalog stop words and standalone years
  const tokens = clean
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w) && !/^(19|20)\d{2}$/.test(w));

  // 4. Standalone trailing numbers (e.g. "Nungshibagi Saiyon 1" vs "Nungshibagi Saiyon 2")
  if (partNumber === null && tokens.length > 1) {
    const lastToken = tokens[tokens.length - 1];

    if (/^[0-9]+$/.test(lastToken)) {
      const parsedNum = parseInt(lastToken, 10);
      if (parsedNum >= 1 && parsedNum <= 30) {
        partNumber = parsedNum;
        rawPart = `PART ${partNumber}`;
        tokens.pop();
      }
    } else if (ROMAN_MAP[lastToken]) {
      partNumber = ROMAN_MAP[lastToken];
      rawPart = `PART ${partNumber}`;
      tokens.pop();
    } else if (/^([1-9]|1[0-9])(st|nd|rd|th)$/.test(lastToken)) {
      partNumber = parseInt(lastToken, 10);
      rawPart = `PART ${partNumber}`;
      tokens.pop();
    }
  }

  const coreTitle = tokens.join(' ').trim();

  return {
    coreTitle,
    partNumber,
    rawPart,
  };
}