import * as app from '../..';
import {CrunchyrollCredential} from '../crunchyroll/CrunchyrollCredential';
import playwright from 'playwright-core';

export class CrunchyrollBetaCredential {
  static async tryAsync(baseUrl: string, page: playwright.Page) {
    if (!app.settings.credential.crunchyrollUsername || !app.settings.credential.crunchyrollPassword || await page.evaluate(isAuthenticated)) return;
    await CrunchyrollCredential.tryAsync('https://crunchyroll.com/', page, baseUrl).catch(() => {});
  }
}

function isAuthenticated() {
  return Boolean(JSON.parse(localStorage.getItem('ajs_user_id') ?? 'null'));
}
