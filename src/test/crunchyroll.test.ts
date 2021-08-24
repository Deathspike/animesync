import * as app from '..';
const core = new app.api.SettingCore(app.settings.core);
const credential = new app.api.SettingCredential(app.settings.credential);

describe('Crunchyroll', () => {
  beforeAll(() => app.Server.usingAsync(async (api) => {
    await api.setting.updateCoreAsync(new app.api.SettingCore(core, fetchCore()));
    await api.setting.updateCredentialAsync(new app.api.SettingCredential(credential, fetchCredential()));
  }));

  it('Series', () => app.Server.usingAsync(async (api) => {
    const series = await api.remote.seriesAsync({url: 'https://www.crunchyroll.com/my-next-life-as-a-villainess-all-routes-lead-to-doom'});
    expect(series.error).toBeUndefined();
    expect(series.value?.imageUrl).not.toBeUndefined();
    expect(series.value?.seasons).not.toEqual([]);
    expect(series.value?.synopsis).not.toBeUndefined();
    expect(series.value?.title).toEqual('My Next Life as a Villainess: All Routes Lead to Doom!');
    expect(series.value?.url).not.toBeUndefined();
    expect(series.value?.seasons[0].title).toEqual('My Next Life as a Villainess: All Routes Lead to Doom!');
    expect(series.value?.seasons[0].episodes[0].imageUrl).not.toBeUndefined();
    expect(series.value?.seasons[0].episodes[0].name).toEqual('1');
    expect(series.value?.seasons[0].episodes[0].synopsis).not.toBeUndefined();
    expect(series.value?.seasons[0].episodes[0].title).toEqual('I Recalled the Memories of My Past Life...');
    expect(series.value?.seasons[0].episodes[0].url).not.toBeUndefined();
  }));

  it('Stream', () => app.Server.usingAsync(async (api) => {
    const stream = await api.remote.streamAsync({url: 'https://www.crunchyroll.com/my-next-life-as-a-villainess-all-routes-lead-to-doom/episode-1-i-recalled-the-memories-of-my-past-life-794619'});
    expect(stream.error).toBeUndefined();
    expect(stream.value?.sources).not.toEqual([]);
    expect(stream.value?.subtitles).not.toEqual([]);
  }));

  afterAll(() => app.Server.usingAsync(async (api) => {
    await api.setting.updateCoreAsync(core);
    await api.setting.updateCredentialAsync(credential);
  }));
});

function fetchCore(): Partial<app.api.SettingCore> {
  const proxyServer = process.env.AST_CRUNCHYROLL_PROXYSERVER;
  return {proxyServer};
}

function fetchCredential(): Partial<app.api.SettingCredential> {
  const crunchyrollPassword = process.env.AST_CRUNCHYROLL_PASSWORD;
  const crunchyrollUsername = process.env.AST_CRUNCHYROLL_USERNAME;
  return {crunchyrollPassword, crunchyrollUsername};
}
