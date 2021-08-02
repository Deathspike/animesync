import * as app from '../..';
import playwright from 'playwright-core';

export class VrvCredential {
  static async tryAsync(baseUrl: string, page: playwright.Page) {
    if (app.settings.credential.vrvUsername && app.settings.credential.vrvPassword && !await page.evaluate(isAuthenticated)) {
      await page.click('.erc-anonymous-user-nav');
      await page.click('.erc-user-dropdown a.erc-user-dropdown-item:last-child');
      await page.type('.erc-signin .email-input', app.settings.credential.vrvUsername);
      await page.type('.erc-signin .password-input', app.settings.credential.vrvPassword);
      await Promise.all([page.click('.erc-signin .signin-submit'), page.waitForFunction(isAuthenticated)]);
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
    }
  }
}

function isAuthenticated() {
  return Boolean(localStorage.getItem('ajs_user_id'));
}
