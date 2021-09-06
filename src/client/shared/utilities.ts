export function sz(px: number) {
  const vmin = px / 5;
  return `max(${vmin}vmin, ${px}px)`;
}
