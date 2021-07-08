import * as ass from 'ass-compiler';

export async function rescaleSubtitleAsync(value: string) {
  const subtitle = ass.parse(value);
  changeScale(subtitle);
  return ass.stringify(subtitle);
}

function changeScale(subtitle: ass.ParsedASS) {
  const primaryStyle = /^\d+$/.test(subtitle.info.PlayResY)
    ? fetchPrimaryStyle(subtitle)
    : undefined;
  if (primaryStyle && /^\d+$/.test(primaryStyle.Fontsize)) {
    const primaryFontSize = parseInt(primaryStyle.Fontsize, 10);
    const primaryMarginV = primaryStyle.MarginV;
    const scaleY = 1 / 360 * parseInt(subtitle.info.PlayResY, 10);
    for (const style of subtitle.styles.style) {
      style.Fontsize = /^\d+$/.test(style.Fontsize)
        ? String(1 / primaryFontSize * parseInt(style.Fontsize, 10) * 16 * scaleY)
        : style.Fontsize;
      style.MarginV = style.MarginV === primaryMarginV
        ? String(18 * scaleY)
        : style.MarginV;
    }
  }
}

function fetchPrimaryStyle(content: ass.ParsedASS) {
  const result = {} as Record<string, number>;
  content.events.dialogue.forEach(c => result[c.Style] = (result[c.Style] ?? 0) + c.End - c.Start);
  const name = Object.entries(result).sort((a, b) => b[1] - a[1]).shift()?.[0];
  return content.styles.style.find(x => x.Name === name);
}
