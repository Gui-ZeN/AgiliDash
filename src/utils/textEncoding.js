const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const countMatches = (text = '', regex) => (text.match(regex) || []).length;

const scoreDecodedText = (text, markers = []) => {
  if (!text) return Number.NEGATIVE_INFINITY;

  const normalizedText = normalizeText(text);
  const normalizedMarkers = markers.map((marker) => normalizeText(marker)).filter(Boolean);
  const markerHits = normalizedMarkers.reduce(
    (acc, marker) => acc + (normalizedText.includes(marker) ? 1 : 0),
    0
  );

  const replacementChars = countMatches(text, /\uFFFD/g);
  // Common mojibake sequences when UTF-8 is decoded as ANSI/Latin-1.
  const mojibake = countMatches(text, /Ã[\u0080-\u00FF]|Â[\u0080-\u00FF]|â[\u0080-\u00FF]/g);
  const semicolons = countMatches(text, /;/g);
  const commas = countMatches(text, /,/g);

  return (
    markerHits * 25 +
    Math.min(semicolons, 200) * 0.06 +
    Math.min(commas, 200) * 0.03 -
    replacementChars * 30 -
    mojibake * 3
  );
};

const decodeWithEncoding = (bytes, encoding) => {
  try {
    return new TextDecoder(encoding, { fatal: false }).decode(bytes);
  } catch {
    return '';
  }
};

const toUint8Array = (value) => {
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return null;
};

const fallbackDecodeWithoutTextDecoder = (bytes) => {
  let text = '';
  const chunkSize = 8192;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    text += String.fromCharCode.apply(null, bytes.slice(i, i + chunkSize));
  }

  return text;
};

export const decodeTextWithEncodingFallback = (buffer, markers = []) => {
  if (typeof buffer === 'string') return buffer;

  const bytes = toUint8Array(buffer);
  if (!bytes) return String(buffer || '');

  if (typeof TextDecoder === 'undefined') {
    return fallbackDecodeWithoutTextDecoder(bytes);
  }

  const encodings = ['utf-8', 'windows-1252', 'iso-8859-1'];

  let bestText = '';
  let bestScore = Number.NEGATIVE_INFINITY;

  encodings.forEach((encoding) => {
    const decoded = decodeWithEncoding(bytes, encoding);
    const score = scoreDecodedText(decoded, markers);
    if (score > bestScore) {
      bestScore = score;
      bestText = decoded;
    }
  });

  return bestText || decodeWithEncoding(bytes, 'utf-8');
};
