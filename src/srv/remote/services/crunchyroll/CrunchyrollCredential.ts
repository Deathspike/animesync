import * as app from '../..';
import playwright from 'playwright-core';

export class CrunchyrollCredential {
  static async tryAsync(page: playwright.Page, url: string) {
    if (!app.settings.credential.crunchyrollUsername || !app.settings.credential.crunchyrollPassword || await page.evaluate(isAuthenticated)) return;
    await page.goto(new URL('/login', url).toString(), {waitUntil: 'domcontentloaded'});
    await page.click('#onetrust-accept-btn-handler', {timeout: 5000}).then(() => page.waitForNavigation({waitUntil: 'domcontentloaded'})).catch(() => {});
    await page.type('#login_form_name', app.settings.credential.crunchyrollUsername);
    await page.type('#login_form_password', app.settings.credential.crunchyrollPassword);
    await page.evaluate(() => document.querySelector('.opt-in')?.remove());
    await page.click('#login_submit_button');
    await page.waitForFunction(isAuthenticated);
    await page.goto(url, {waitUntil: 'domcontentloaded'});
  }
}

function isAuthenticated() {
  return Boolean(document.querySelector('.username'));
}
