import * as apx from '..';

export class HlsManifest extends Array<apx.HlsManifestLine> {
  static from(manifest: string) {
    const result = new HlsManifest();
    result.push(...manifest.split('\n').map(apx.HlsManifestLine.from));
    return result;
  }

  fetchStreams() {
    return this.filter(x => x.type === 'EXT-X-STREAM-INF')
      .map(x => new apx.HlsManifestLineStream(this, x))
      .sort(apx.HlsManifestLineStream.compareFn);
  }

  toString() {
    return this.map(x => x.toString()).join('\n');
  }
}
