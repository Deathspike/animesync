import * as app from '../..';
import playwright from 'playwright-core';

export class FunimationCredential {
  static async tryAsync(page: playwright.Page, url: string) {
    if (!app.settings.credential.funimationUsername || !app.settings.credential.funimationPassword || await page.evaluate(isAuthenticated)) return;
    await page.goto(new URL('/log-in/', url).toString(), {waitUntil: 'domcontentloaded'});
    await page.type('.loginBox #email2', app.settings.credential.funimationUsername);
    await page.type('.loginBox #password2', app.settings.credential.funimationPassword);
    await page.click('.loginBox button[type=submit]');
    await page.waitForFunction(isAuthenticated);
    await page.goto(url, {waitUntil: 'domcontentloaded'});
  }
}

function isAuthenticated() {
  return Boolean(document.querySelector('.fun'));
}
