import * as api from '..';

export class LibraryApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async contextAsync() {
    const url = new URL('/api/library', this.baseUrl).toString();
    return await api.ServerResponse.jsonAsync<api.LibraryContext>(url);
  } 

  async contextPostAsync(model: api.LibraryContentSeries) {
    const options = api.ServerResponse.options('POST', model);
    const url = new URL('/api/library', this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  async contextPutAsync() {
    const options = api.ServerResponse.options('PUT');
    const url = new URL('/api/library', this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  async seriesAsync(model: api.LibraryParamSeries) {
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}`, this.baseUrl).toString();
    return await api.ServerResponse.jsonAsync<api.LibrarySeries>(url);
  }

  async seriesDeleteAsync(model: api.LibraryParamSeries) {
    const options = api.ServerResponse.options('DELETE');
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}`, this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  async seriesPutAsync(model: api.LibraryParamSeries) {
    const options = api.ServerResponse.options('PUT');
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}`, this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  seriesImageAsync(model: api.LibraryParamSeries) {
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}/image`, this.baseUrl).toString();
    return Promise.resolve(url);
  }

  episodeAsync(model: api.LibraryParamSeriesEpisode) {
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}`, this.baseUrl).toString();
    return Promise.resolve(url);
  }

  async episodeDeleteAsync(model: api.LibraryParamSeriesEpisode) {
    const options = api.ServerResponse.options('DELETE');
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}`, this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  async episodePutAsync(model: api.LibraryParamSeriesEpisode) {
    const options = api.ServerResponse.options('PUT');
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}`, this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  episodeImageAsync(model: api.LibraryParamSeriesEpisode) {
    const url = new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}/image`, this.baseUrl).toString();
    return Promise.resolve(url);
  }
}
