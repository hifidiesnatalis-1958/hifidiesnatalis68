export function validNpm(value) {
  return typeof value==='string' && /^140310(?:0\d|1\d|2[0-5])00\d{2}$/.test(value) && !value.endsWith('0000');
}
export function publicName(value) {
  return validNpm(value) ? `Baraya ${value.slice(6,8)} · ${value.slice(-2)}` : value;
}
