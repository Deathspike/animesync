import * as app from '.';
import * as api from '@nestjs/common';

@api.Injectable()
export class ContextService implements api.OnModuleDestroy {
  private readonly _context: app.Future<app.Context>;

  constructor() {
    this._context = new app.Future();
    app.Context.foreverAsync()
      .then((context) => this._context.resolve(context))
      .catch((error) => this._context.reject(error));
  }

  async getAsync() {
    return await this._context.getAsync();
  }

  async onModuleDestroy() {
    const context = await this._context.getAsync();
    await context.disposeAsync();
  }
}
