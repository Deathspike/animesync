import * as acm from '..';

export class HlsManifest extends Array<acm.HlsManifestLine> {
  static from(manifest: string) {
    const result = new HlsManifest();
    result.push(...manifest.split('\n').map(acm.HlsManifestLine.from));
    return result;
  }

  fetchStreams() {
    return this.filter(x => x.type === 'EXT-X-STREAM-INF')
      .map(x => new acm.HlsManifestLineStream(this, x))
      .sort(acm.HlsManifestLineStream.compareFn);
  }

  toString() {
    return this.map(x => x.toString()).join('\n');
  }
}
