import * as app from '..';

export class HlsManifestLineStream {
  private readonly manifest: app.HlsManifest;
  private readonly line: app.HlsManifestLine;

  constructor(manifest: app.HlsManifest, line: app.HlsManifestLine) {
    this.manifest = manifest;
    this.line = line;
  }

  static compareFn(a: HlsManifestLineStream, b: HlsManifestLineStream) {
    if (a.resolution.x !== b.resolution.x) return b.resolution.x - a.resolution.x;
    if (a.resolution.y !== b.resolution.y) return b.resolution.y - a.resolution.y;
    return b.bandwidth - a.bandwidth;
  }

  get bandwidth() {
    if (this.line.params['BANDWIDTH']) {
      return parseFloat(this.line.params['BANDWIDTH']);
    } else {
      return 0;
    }
  }

  get resolution() {
    if (this.line.params['RESOLUTION']) {
      return parseResolution(this.line.params['RESOLUTION']);
    } else {
      return {x: 0, y: 0};
    }
  }

  get url() {
    let index = this.manifest.indexOf(this.line);
    while (this.manifest[++index].type) continue;
    return this.manifest[index].data;
  }

  toString() {
    return this.line.toString();
  }
}

function parseResolution(value?: string) {
  const match = value?.match(/^([0-9]+)x([0-9]+)$/);
  if (match) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    return {x, y};
  } else {
    const x = 0;
    const y = 0;
    return {x, y};
  }
}
