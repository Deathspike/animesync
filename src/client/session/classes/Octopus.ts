import * as app from '..';
import * as ass from 'ass-compiler';
const fonts = ['assets/default.woff2', 'assets/arabic.woff2'];
const workerUrl = 'subtitles-octopus-4.0.0/subtitles-octopus-worker.js';

export class Octopus {
  private readonly subtitle: app.ISubtitle;
  private readonly video: HTMLVideoElement;
  private worker?: SubtitlesOctopus;

  constructor(video: HTMLVideoElement, subtitle: app.ISubtitle) {
    this.subtitle = subtitle;
    this.video = video;
  }

  async loadAsync() {
    const response = await fetch(this.subtitle.url);
    const subtitle = ass.parse(await response.text());
    this.resize(subtitle);
    this.worker = new SubtitlesOctopus({video: this.video, subContent: ass.stringify(subtitle), workerUrl, fonts});
  }

  dispose() {
    try {
      this.worker?.dispose();
    } catch {
      return;
    }
  }

  private resize(subtitle: ass.ParsedASS) {
    const primaryStyle = isNumber(subtitle.info.PlayResY)
      ? fetchPrimaryStyle(subtitle)
      : undefined;
    if (primaryStyle && isNumber(primaryStyle.Fontsize)) {
      const primaryFontSize = parseInt(primaryStyle.Fontsize, 10);
      const primaryMarginV = primaryStyle.MarginV;
      const scaleY = 1 / 360 * parseInt(subtitle.info.PlayResY, 10);
      for (const style of subtitle.styles.style) {
        style.Fontsize = isNumber(style.Fontsize)
          ? String(1 / primaryFontSize * parseInt(style.Fontsize, 10) * fetchFontSize(this.subtitle) * scaleY)
          : style.Fontsize;
        style.MarginV = style.MarginV === primaryMarginV
          ? String(18 * scaleY)
          : style.MarginV;
      }
    }
  }
}

function fetchFontSize(subtitle: app.ISubtitle) {
  if (subtitle.size === 'tiny') return 8;
  if (subtitle.size === 'small') return 12;
  if (subtitle.size === 'normal') return 16;
  if (subtitle.size === 'large') return 20;
  if (subtitle.size === 'huge') return 24;
  return 16;
}

function fetchPrimaryStyle(content: ass.ParsedASS) {
  const result = {} as Record<string, number>;
  content.events.dialogue.forEach(c => result[c.Style] = (result[c.Style] ?? 0) + c.End - c.Start);
  const name = Object.entries(result).sort((a, b) => b[1] - a[1]).shift()?.[0];
  return content.styles.style.find(x => x.Name === name);
}

function isNumber(value: string) {
  return /^[0-9]+$/.test(value);
}
