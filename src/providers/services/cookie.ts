import fs from 'fs-extra';
import puppeteer from 'puppeteer-core';

export default async function cookieAsync(page: puppeteer.Page, cookiePath: string) {
  const session = await page.target().createCDPSession();
  const context = await session.send('Network.getAllCookies') as {cookies: puppeteer.Cookie[]};
  const cookies = context.cookies.map(x => [x.domain, 'TRUE', x.path, String(x.httpOnly).toUpperCase(), Math.max(0, Math.round(x.expires)), x.name, x.value]);
  await fs.writeFile(cookiePath, ['# Netscape HTTP Cookie File'].concat(...cookies.map(x => x.join('\t'))).join('\n'), {encoding: 'utf8'});
}
