import * as app from '../..';
import playwright from 'playwright-core';

export class CrunchyrollCredential {
  private readonly loginUrl: URL;
  private readonly page: playwright.Page;

  private constructor(baseUrl: string, page: playwright.Page) {
    this.loginUrl = new URL('/login', baseUrl);
    this.page = page;
  }

  static async tryAsync(baseUrl: string, page: playwright.Page, url: string) {
    await new CrunchyrollCredential(baseUrl, page).runAsync();
    if (page.url() === url) return;
    await page.goto(url, {waitUntil: 'domcontentloaded'});
  }

  private async checkAsync() {
    return await this.page.evaluate(() => {
      const username = document.querySelector('.username');
      return Boolean(username);
    });
  }

  private async runAsync() {
    if (await this.checkAsync() || !await this.tryLoginAsync() || await this.checkAsync()) return;
    throw new Error('Invalid credentials: Crunchyroll');
  }

  private async tryLoginAsync() {
    if (!app.settings.credential.crunchyrollPassword || !app.settings.credential.crunchyrollUsername) return false;
    await this.page.goto(this.loginUrl.toString(), {waitUntil: 'domcontentloaded'});
    await this.page.type('#login_form_name', app.settings.credential.crunchyrollUsername);
    await this.page.type('#login_form_password', app.settings.credential.crunchyrollPassword);
    await this.trySubmitAsync();
    return true;
  }

  private async trySubmitAsync() {
    const navigationPromise = this.page.waitForNavigation({waitUntil: 'domcontentloaded'});
    const submitButton = '#login_submit_button'
    await this.page.evaluate(removeBetaOptIn);
    this.page.click('#onetrust-accept-btn-handler')
      .then(() => this.page.click(submitButton))
      .catch(() => {});
    this.page.click(submitButton)
      .catch(() => {});
    await navigationPromise;
  }
}

function removeBetaOptIn() {
  const optin = document.querySelector('.opt-in');
  if (!optin || !optin.parentNode) return;
  optin.parentNode.removeChild(optin);
}
