import * as app from '..';

export class HlsManifest extends Array<app.HlsManifestLine> {
  static from(manifest: string) {
    const result = new HlsManifest();
    result.push(...manifest.split('\n').map(app.HlsManifestLine.from));
    return result;
  }

  fetchStreams() {
    return this.filter(x => x.type === 'EXT-X-STREAM-INF')
      .map(x => new app.HlsManifestLineStream(this, x))
      .sort(app.HlsManifestLineStream.compareFn);
  }

  toString() {
    return this.map(x => x.toString()).join('\n');
  }
}
