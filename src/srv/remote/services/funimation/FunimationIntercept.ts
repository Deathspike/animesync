import * as app from '../..';
import * as fun from './typings';
import playwright from 'playwright-core';
type PlayerPromise = Promise<{body: string, experienceAlpha: fun.PlayerAlpha}>;

export class FunimationIntercept {
  private readonly agentService: app.AgentService;
  private readonly loggerService: app.LoggerService;
  private readonly observers: Array<app.Future<fun.PlayerAlpha>>;
  private response?: PlayerPromise;

  constructor(agentService: app.AgentService, loggerService: app.LoggerService, page: playwright.Page) {
    this.agentService = agentService;
    this.loggerService = loggerService;
    this.observers = [];
    page.route(x => /\/player\/([0-9]+)\/$/.test(x.pathname), this.onRoute.bind(this));
  }

  async getAsync() {
    const future = new app.Future<fun.PlayerAlpha>();
    this.observers.push(future);
    this.response?.then(x => future.resolve(x.experienceAlpha));
    return await future.getAsync(app.settings.core.chromeTimeoutNavigation);
  }

  private async onRoute(route: playwright.Route, request: playwright.Request) {
    this.loggerService.debug(`[Funimation] Controlling ${request.url()}`);
    const headers = Object.entries(request.headers()).filter(([k]) => !k.startsWith(':'));
    await (this.response ??= this.routeAsync(request.url(), headers))
      .then(x => route.fulfill(x))
      .catch(() => route.abort());
  }

  private async routeAsync(url: string, headers: Array<[string, string]>): PlayerPromise {
    const body = await this.agentService.fetchAsync(url, {headers}).then(String);
    const experienceId = Number(url.match(/\/([0-9]+)\//)?.[1]);
    const experience = JSON.parse(body.match(/var\s*show\s*=\s*({.+});/)?.[1] ?? '') as fun.Player;
    const experienceAlpha = fetchExperienceAlpha(experienceId, experience);
    if (experienceAlpha && experienceAlpha.experienceId !== experienceId) {
      this.loggerService.debug(`[Funimation] Replacing ${experienceId} with ${experienceAlpha.experienceId}`);
      return await this.routeAsync(url.replace(/\/([0-9]+)\//, () => `/${experienceAlpha.experienceId}/`), headers);
    } else if (experienceAlpha) {
      this.observers.forEach(x => x.resolve(experienceAlpha));
      return {body, experienceAlpha};
    } else {
      this.loggerService.error(`[Funimation] Unable to match alpha!`);
      throw new Error();
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
