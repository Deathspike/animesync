import * as app from '..';

export class HlsManifestLineStream {
  private readonly manifest: app.HlsManifest;
  private readonly line: app.HlsManifestLine;

  constructor(manifest: app.HlsManifest, line: app.HlsManifestLine) {
    this.manifest = manifest;
    this.line = line;
  }

  static compareFn(a: HlsManifestLineStream, b: HlsManifestLineStream) {
    if (a.resolution.width !== b.resolution.width) return b.resolution.width - a.resolution.width;
    if (a.resolution.height !== b.resolution.height) return b.resolution.height - a.resolution.height;
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
      return {width: 0, height: 0};
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
    const width = parseFloat(match[1]);
    const height = parseFloat(match[2]);
    return {width, height};
  } else {
    const width = 0;
    const height = 0;
    return {width, height};
  }
}
