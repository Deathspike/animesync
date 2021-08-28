export class Supervisor {
  private readonly entries: Record<string, Promise<void>>;

  constructor() {
    this.entries = {};
  }

  async createOrAttachAsync(key: string, valueFactory: () => Promise<void>) {
    this.entries[key] ??= valueFactory().finally(() => delete this.entries[key]);
    return await this.entries[key];
  }

  contains(key: string) {
    return Object.keys(this.entries).some(x => x.startsWith(key));
  }
}
