import {CrunchyrollCredential} from '../crunchyroll/CrunchyrollCredential';
import playwright from 'playwright-core';

export class CrunchyrollBetaCredential {
  static async tryAsync(baseUrl: string, page: playwright.Page) {
    if (page.url().includes('beta')) return;
    await CrunchyrollCredential.tryAsync('https://crunchyroll.com/', page, baseUrl).catch(() => {});
  }
}
