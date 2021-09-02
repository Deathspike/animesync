export function queryString(model: Record<string, string>) {
  return '?' + Object.entries(model)
    .filter(([_, v]) => typeof v !== 'undefined')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}
