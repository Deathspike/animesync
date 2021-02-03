export class HlsManifestLine {
  public data: string;
  public params: Record<string, string>;
  public type?: string;

  private constructor(data: string, params?: Record<string, string>, type?: string) {
    this.data = data;
    this.params = params ?? {};
    this.type = type;
  }

  static from(line: string) {
    const expression = /^#(.+?)(?:\:(?:([0-9\.]+))?(?:,?(.*)))?$/;
    const match = line.match(expression);
    if (match) {
      const data = match[2] ?? '';
      const params = parse(match[3] ?? '');
      const type = match[1] ?? '';
      return new HlsManifestLine(data, params, type);
    } else {
      return new HlsManifestLine(line);
    }
  }

  toString() {
    const params = format(this.params);
    if (this.type && this.data && params) {
      return `#${this.type}:${this.data},${params}`;
    } else if (this.type && this.data) {
      return `#${this.type}:${this.data}`;
    } else if (this.type && params) {
      return `#${this.type}:${params}`;
    } else if (this.type) {
      return `#${this.type}`;
    } else {
      return this.data;
    }
  }
}

function format(params: Record<string, string>) {
  const entries = Object.entries(params);
  const pairs = entries.map(([k, v]) => v.includes(',') ? `${k}="${v}"` : `${k}=${v}`);
  return pairs.join(',');
}

function parse(params: string) {
  let expression = /(?:^|,)(?:([^=]*)=(?:"([^"]*)"|([^,]*)))/g;
  let match: RegExpMatchArray | null;
  let result: Record<string, string> = {};
  while ((match = expression.exec(params))) result[match[1]] = match[3] ?? match[2];
  return result;
}
