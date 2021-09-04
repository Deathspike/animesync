import * as api from '.';

export class LibraryApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async contextAsync() {
    const url = new URL('/api/library', this.baseUrl).toString();
    return await api.ServerResponse.jsonAsync<api.LibraryContext>(url);
  } 

  async contextPostAsync(model: api.LibraryCreateSeries) {
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

  seriesImageUrl(model: api.LibraryParamSeries) {
    return new URL(`/api/library/${encodeURIComponent(model.seriesId)}/image`, this.baseUrl).toString();
  }

  episodeUrl(model: api.LibraryParamSeriesEpisode) {
    return new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}`, this.baseUrl).toString();
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

  episodeImageUrl(model: api.LibraryParamSeriesEpisode) {
    return new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}/image`, this.baseUrl).toString();
  }

  episodeSubtitleUrl(model: api.LibraryParamSeriesEpisode) {
    return new URL(`/api/library/${encodeURIComponent(model.seriesId)}/${encodeURIComponent(model.episodeId)}/subtitle`, this.baseUrl).toString();
  }
}
