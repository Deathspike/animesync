import * as acm from '..';

export class HlsManifestLineStream {
  private readonly _manifest: acm.HlsManifest;
  private readonly _line: acm.HlsManifestLine;

  constructor(manifest: acm.HlsManifest, line: acm.HlsManifestLine) {
    this._manifest = manifest;
    this._line = line;
  }

  static compareFn(a: HlsManifestLineStream, b: HlsManifestLineStream) {
    if (a.resolution.width !== b.resolution.width) return b.resolution.width - a.resolution.width;
    if (a.resolution.height !== b.resolution.height) return b.resolution.height - a.resolution.height;
    return b.bandwidth - a.bandwidth;
  }

  get bandwidth() {
    if (this._line.params['BANDWIDTH']) {
      return parseFloat(this._line.params['BANDWIDTH']);
    } else {
      return 0;
    }
  }

  get resolution() {
    if (this._line.params['RESOLUTION']) {
      return parseResolution(this._line.params['RESOLUTION']);
    } else {
      return {width: 0, height: 0};
    }
  }

  get url() {
    let index = this._manifest.indexOf(this._line);
    while (this._manifest[++index].type) continue;
    return this._manifest[index].data;
  }

  toString() {
    return this._line.toString();
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
