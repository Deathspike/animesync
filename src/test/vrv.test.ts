import * as app from '../server';
const core = new app.api.SettingCore(app.settings.core);
const credential = new app.api.SettingCredential(app.settings.credential);

describe('Vrv', () => {
  beforeAll(() => app.Server.usingAsync(async (api) => {
    await api.setting.corePutAsync(new app.api.SettingCore(core, fetchCore()));
    await api.setting.credentialPutAsync(new app.api.SettingCredential(credential, fetchCredential()));
  }));

  it('Series', () => app.Server.usingAsync(async (api) => {
    const series = await api.remote.seriesAsync({url: 'https://vrv.co/series/GR49G9VP6/Sword-Art-Online'});
    expect(series.error).toBeUndefined();
    expect(series.value?.imageUrl).not.toBeUndefined();
    expect(series.value?.seasons).not.toEqual([]);
    expect(series.value?.synopsis).not.toBeUndefined();
    expect(series.value?.title).toEqual('Sword Art Online');
    expect(series.value?.url).not.toBeUndefined();
    expect(series.value?.seasons[0].title).toEqual('Sword Art Online');
    expect(series.value?.seasons[0].episodes[0].imageUrl).not.toBeUndefined();
    expect(series.value?.seasons[0].episodes[0].name).toEqual('1');
    expect(series.value?.seasons[0].episodes[0].synopsis).not.toBeUndefined();
    expect(series.value?.seasons[0].episodes[0].title).toEqual('The World of Swords');
    expect(series.value?.seasons[0].episodes[0].url).not.toBeUndefined();
  }));

  it('Stream', () => app.Server.usingAsync(async (api) => {
    const stream = await api.remote.streamAsync({url: 'https://vrv.co/watch/GRJQKQWVY/Sword-Art-Online:The-World-of-Swords'});
    expect(stream.error).toBeUndefined();
    expect(stream.value?.sources).not.toEqual([]);
    expect(stream.value?.subtitles).not.toEqual([]);
  }));
  
  afterAll(() => app.Server.usingAsync(async (api) => {
    await api.setting.corePutAsync(core);
    await api.setting.credentialPutAsync(credential);
  }));
});

function fetchCore(): Partial<app.api.SettingCore> {
  const proxyServer = process.env.AST_VRV_PROXYSERVER || undefined;
  return {proxyServer};
}

function fetchCredential(): Partial<app.api.SettingCredential> {
  const vrvPassword = process.env.AST_VRV_PASSWORD || undefined;
  const vrvUsername = process.env.AST_VRV_USERNAME || undefined;
  return {vrvPassword, vrvUsername};
}
