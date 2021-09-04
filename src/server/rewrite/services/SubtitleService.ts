import * as app from '..';
import * as ass from 'ass-compiler';
import * as ncm from '@nestjs/common';
import * as sub from 'subtitle';

@ncm.Injectable()
export class SubtitleService {
  rewrite(subtitle: string, subtitleType: app.api.RewriteParamSubtitle['subtitleType']) {
    switch (subtitleType) {
      case 'ass':
        const content = ass.parse(subtitle);
        changeScale(content);
        return ass.stringify(content);
      case 'srt':
        const nodes = sub.parseSync(subtitle);
        const result = sub.stringifySync(nodes, {format: 'SRT'});
        return result;
    }
  }
}

function changeScale(content: ass.ParsedASS) {
  const primaryStyle = /^\d+$/.test(content.info.PlayResY)
    ? fetchPrimaryStyle(content)
    : undefined;
  if (primaryStyle && /^\d+$/.test(primaryStyle.Fontsize)) {
    const primaryFontSize = parseInt(primaryStyle.Fontsize, 10);
    const primaryMarginV = primaryStyle.MarginV;
    const scaleY = 1 / 360 * parseInt(content.info.PlayResY, 10);
    for (const style of content.styles.style) {
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
  const result: Record<string, number> = {};
  content.events.dialogue.forEach(c => result[c.Style] = (result[c.Style] ?? 0) + c.End - c.Start);
  const name = Object.entries(result).sort((a, b) => b[1] - a[1]).shift()?.[0];
  return content.styles.style.find(x => x.Name === name);
}
