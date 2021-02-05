import * as app from '../..';
import playwright from 'playwright-core';

export class FunimationCredential {
  private readonly loginUrl: URL;
  private readonly page: playwright.Page;

  private constructor(baseUrl: string, page: playwright.Page) {
    this.loginUrl = new URL('/log-in/', baseUrl);
    this.page = page;
  }

  static async tryAsync(baseUrl: string, page: playwright.Page, url: string) {
    await new FunimationCredential(baseUrl, page).runAsync();
    if (page.url() === url) return;
    await page.goto(url, {waitUntil: 'domcontentloaded'});
  }

  private async checkAsync() {
    return await this.page.evaluate(() => {
      const username = document.querySelector('.fun');
      return Boolean(username);
    });
  }

  private async runAsync() {
    if (await this.checkAsync() || !await this.tryLoginAsync() || await this.checkAsync()) return;
    throw new Error('Invalid credentials: Funimation');
  }

  private async tryLoginAsync() {
    if (!app.settings.credential.funimationPassword || !app.settings.credential.funimationUsername) return false;
    await this.page.goto(this.loginUrl.toString(), {waitUntil: 'domcontentloaded'});
    await this.page.type('.loginBox #email2', app.settings.credential.funimationUsername);
    await this.page.type('.loginBox #password2', app.settings.credential.funimationPassword);
    await this.trySubmitAsync();
    return true;
  }

  private async trySubmitAsync() {
    const navigationPromise = this.page.waitForNavigation({waitUntil: 'domcontentloaded'});
    await this.page.click('.loginBox button[type=submit]');
    await navigationPromise;
  }
}
