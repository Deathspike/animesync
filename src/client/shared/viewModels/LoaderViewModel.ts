import * as mobx from 'mobx';

export class LoaderViewModel {
  @mobx.action
  async loadAsync<T>(runAsync: () => Promise<T>) {
    try {
      this.loadCount++;
      return await runAsync();
    } finally {
      this.loadCount--;
    }
  }

  @mobx.action
  async quietAsync<T>(runAsync: () => Promise<T>) {
    try {
      this.quietCount++;
      return await runAsync();
    } finally {
      this.quietCount--;
    }
  }

  @mobx.computed
  get isLoading() {
    return Boolean(this.loadCount || this.quietCount);
  }

  @mobx.computed
  get isQuiet() {
    return this.loadCount <= this.quietCount;
  }

  @mobx.observable
  private loadCount = 0;

  @mobx.observable
  private quietCount = 0;
}
