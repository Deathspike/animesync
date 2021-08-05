import * as app from '../..';
import * as fun from './typings';
import playwright from 'playwright-core';

export class FunimationIntercept {
  private readonly agentService: app.AgentService;
  private readonly response: app.Future<fun.PlayerAlpha>;

  constructor(agentService: app.AgentService, page: playwright.Page) {
    this.agentService = agentService;
    this.response = new app.Future(app.settings.core.chromeTimeoutNavigation);
    page.route(/\/player\/([0-9]+)\//, this.onRoute.bind(this));
  }

  getAsync() {
    return [this.response.getAsync()];
  }

  private async onRoute(route: playwright.Route, request: playwright.Request) {
    const headers = Object.entries(request.headers()).filter(([k]) => !k.startsWith(':'));
    const body = await this.tryRouteAsync(request.url(), headers);
    await route.fulfill({body});
  }

  private async tryRouteAsync(url: string, headers: Array<[string, string]>): Promise<string> {
    if (this.response.isFulfilled) throw new Error();
    const text = await this.agentService.fetchAsync(url, {headers}).then(x => x.toString('utf-8'));
    const experienceId = Number(url.match(/\/([0-9]+)\//)?.[1]);
    const experience = JSON.parse(text.match(/var\s*show\s*=\s*({.+});/)?.[1] ?? '') as fun.Player;
    const experienceAlpha = fetchExperienceAlpha(experienceId, experience);
    if (experienceAlpha && experienceAlpha.experienceId !== experienceId) {
      return await this.tryRouteAsync(url.replace(/\/([0-9]+)\//, () => `/${experienceAlpha.experienceId}/`), headers);
    } else if (experienceAlpha) {
      this.response.resolve(experienceAlpha);
      return text;
    } else {
      return text;
    }
  }
}

function fetchExperienceAlpha(experienceId: number, experience: fun.Player): fun.PlayerAlpha | void {
  for (const season of experience.seasons) {
    for (const episode of season.episodes) {
      for (const language of Object.values(episode.languages)) {
        if (Object.values(language.alpha).some(x => x.experienceId === experienceId)) {
          const bestLanguage = episode.languages.japanese 
            ? episode.languages.japanese.alpha
            : language.alpha;
          return Object.entries(bestLanguage)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, v]) => v)
            .shift();
        }
      }
    }
  }
}
