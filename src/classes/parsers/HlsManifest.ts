import * as app from '../..';

export class HlsManifest extends Array<app.HlsManifestLine> {
  static from(manifest: string) {
    const result = new HlsManifest();
    result.push(...manifest.split('\n').map(app.HlsManifestLine.from));
    return result;
  }

  toString() {
    return this.map(x => x.toString()).join('\n');
  }
}
