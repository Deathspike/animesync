export class Supervisor {
  private readonly entries: Record<string, Promise<any>>;

  constructor() {
    this.entries = {};
  }

  contains(key: string) {
    const lowerKey = key.toLowerCase();
    return Object.keys(this.entries).some(x => x.startsWith(lowerKey));
  }

  async createOrAttachAsync<T>(key: string, valueFactory: () => Promise<T>) {
    const lowerKey = key.toLowerCase();
    this.entries[lowerKey] ??= valueFactory().finally(() => delete this.entries[lowerKey]);
    return await this.entries[lowerKey] as T;
  }
}
