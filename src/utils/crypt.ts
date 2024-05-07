
function rangeCharacters(start : string, end : string) : string {
  if (start.length !== 1 && end.length !== 1) throw Error();
  return Array.from(Array(end.charCodeAt(0) - start.charCodeAt(0) + 1).keys())
    .reduce((acc : string, key : number) => 
      `${acc}${String.fromCharCode(start.charCodeAt(0)+key)}`, '');
}

const targetCharacters = rangeCharacters('0', '9') + rangeCharacters('a', 'z');
const translationObject = Array<number>();
targetCharacters.split('').forEach((char, index) =>
  translationObject[char.charCodeAt(0)]= index);

function textToOffsets(text : string) : number[] {
  if (typeof text !== 'string') throw Error();
  return text.split('').map((char) => translationObject[char.charCodeAt(0)]);
}

function combineOffsets(offsets1: number[], offsets2: number[], length: number, subtract: boolean) {
  if (!Array.isArray(offsets1) || !Array.isArray(offsets2) ||
    typeof length !== 'number' || length <= 0) throw Error()
  let multiplier = 1;
  if (subtract === true) 
    multiplier = -1;

  return Array.from(Array<number>(length)).map((_, index) =>
    ((offsets1[index] ?? 0) + 
      (multiplier * (offsets2[index] ?? 0)) + 
        targetCharacters.length) % targetCharacters.length)
}

function offsetsToText(offsets: number[]) {
  if (!Array.isArray(offsets)) throw Error();
  return offsets.map(offset => targetCharacters[offset]).join('');
}

export function encryptText(text: string, key: string, decrypt?: boolean) {
  if (typeof text !== 'string' || typeof key !== 'string') throw Error();
  return offsetsToText(combineOffsets(textToOffsets(text), 
    textToOffsets(key), text.length, decrypt ?? false));
}

export function decryptText(text: string, key: string) {
  return encryptText(text, key, true);
}
