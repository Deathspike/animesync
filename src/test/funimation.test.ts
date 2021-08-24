import * as app from '..';

describe('Funimation', () => {
  let coreConfig = Object.assign({}, app.settings.core);
  let credentialConfig = Object.assign({}, app.settings.credential);

  beforeAll(() => app.Server.usingAsync(async (api) => {
    await api.setting.updateCoreAsync(Object.assign({}, app.settings.source.defaultCore, fetchCore()));
    await api.setting.updateCredentialAsync(Object.assign({}, app.settings.source.defaultCredential, fetchCredential()));
  }));

  it('Series', () => app.Server.usingAsync(async (api) => {
    const series = await api.remote.seriesAsync({url: 'https://www.funimation.com/shows/blue-reflection-ray/'});
    expect(series.statusCode).toEqual(200);
    expect(series.value?.imageUrl).not.toBeNull();
    expect(series.value?.seasons).not.toEqual([]);
    expect(series.value?.synopsis).not.toBeNull();
    expect(series.value?.title).toEqual('Blue Reflection Ray');
    expect(series.value?.url).not.toBeNull();
    expect(series.value?.seasons[0].title).toEqual('Season 1');
    expect(series.value?.seasons[0].episodes[0].imageUrl).not.toBeNull();
    expect(series.value?.seasons[0].episodes[0].name).toEqual('1');
    expect(series.value?.seasons[0].episodes[0].synopsis).not.toBeNull();
    expect(series.value?.seasons[0].episodes[0].title).toEqual('The Undying Light');
    expect(series.value?.seasons[0].episodes[0].url).not.toBeNull();
  }));

  it('Stream', () => app.Server.usingAsync(async (api) => {
    const stream = await api.remote.streamAsync({url: 'https://www.funimation.com/en/shows/blue-reflection-ray/the-undying-light/'});
    expect(stream.statusCode).toEqual(200);
    expect(stream.value?.sources).not.toEqual([]);
    expect(stream.value?.subtitles).not.toEqual([]);
  }));

  afterAll(() => app.Server.usingAsync(async (api) => {
    await api.setting.updateCoreAsync(coreConfig);
    await api.setting.updateCredentialAsync(credentialConfig);
  }));
});

function fetchCore(): Partial<app.api.SettingCore> {
  const proxyServer = process.env.AST_FUNIMATION_PROXYSERVER;
  return {proxyServer};
}

function fetchCredential(): Partial<app.api.SettingCredential> {
  const funimationPassword = process.env.AST_FUNIMATION_PASSWORD;
  const funimationUsername = process.env.AST_FUNIMATION_USERNAME;
  return {funimationPassword, funimationUsername};
}
