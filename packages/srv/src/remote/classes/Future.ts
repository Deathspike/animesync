export class Future<T> {
  private readonly value: Promise<T>;
  private rejecter?: (error: Error) => void;
  private resolver?: (value: T) => void;

  constructor() {
    this.value = new Promise<T>((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
  }

  async getAsync(timeout: number) {
    return await new Promise<T>((resolve, reject) => {
      setTimeout(reject, timeout);
      this.value.then(resolve, reject);
		});
  }

  reject(error: Error) {
    if (!this.rejecter) return;
    this.rejecter(error);
  }

  resolve(value: T) {
    if (!this.resolver) return;
    this.resolver(value);
  }
}
