export class Future<T> {
  private readonly _timeout: number;
  private _hasReject?: boolean;
  private _hasResolve?: boolean;
  private _reject?: any;
  private _resolve?: T;
  private _resolver: (error?: any, value?: T) => void;

  constructor(timeout = 0) {
    this._resolver = () => undefined;
    this._timeout = timeout;
  }

  async getAsync() {
    return await new Promise<T>((resolve, reject) => {
      if (this._hasReject) {
        reject(this._reject);
      } else if (this._hasResolve && typeof this._resolve !== 'undefined') {
        resolve(this._resolve);
      } else if (this._timeout) {
        setTimeout(reject, this._timeout);
        this.queue(resolve, reject);
      } else {
        this.queue(resolve, reject);
      }
		});
  }

  reject(error: any) {
    if (this._hasReject || this._hasResolve) return;
    this._hasReject = true;
    this._reject = error;
    this._resolver(error);
  }

  resolve(value: T) {
    if (this._hasReject || this._hasResolve) return;
    this._hasResolve = true;
		this._resolve = value;
    this._resolver(undefined, value);
  }
  
  private queue(resolve: (value: T) => void, reject: (error?: any) => void) {
    const previousResolver = this._resolver;
    this._resolver = (error, value) => {
      if (error) {
        previousResolver(error);
        reject(error);
      } else {
        previousResolver(error, value);
        resolve(value!);
      }
    };
  }
}
