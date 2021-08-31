import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';
import express from 'express';

@ncm.Controller('api/library')
@ncm.UseInterceptors(app.ResponseLoggerInterceptor)
@nsg.ApiTags('library')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class LibraryController {
  private readonly libraryService: app.LibraryService;

  constructor(libraryService: app.LibraryService) {
    this.libraryService = libraryService;
  }

  @app.ResponseValidator(app.api.LibraryContext)
  @ncm.Get()
  @nsg.ApiResponse({status: 200, type: app.api.LibraryContext})
  async contextAsync() {
    return await this.libraryService.contextAsync();
  }

  @ncm.Post()
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async contextPostAsync(@ncm.Body() model: app.api.LibraryContentSeries) {
    const rootPath = model.rootPath ?? app.settings.path.library;
    await this.libraryService.contextPostAsync(rootPath, model.url);
  }

  @ncm.Put()
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async contextPutAsync() {
    const context = await this.libraryService.contextAsync();
    await context.series.reduce((p, c) => p.then(() => this.libraryService.seriesPutAsync(c.path)), Promise.resolve());
  }

  @app.ResponseValidator(app.api.LibrarySeries)
  @ncm.Get(':seriesId')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200, type: app.api.LibrarySeries})
  @nsg.ApiResponse({status: 404})
  async seriesAsync(@ncm.Param() params: app.api.LibraryParamSeries) {
    return await this.fetchSeriesAsync(params.seriesId);
  }

  @ncm.Delete(':seriesId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  @nsg.ApiResponse({status: 409})
  async seriesDeleteAsync(@ncm.Param() params: app.api.LibraryParamSeries) {
    const series = await this.fetchSeriesAsync(params.seriesId);
    if (await this.libraryService.seriesDeleteAsync(series.path)) return;
    throw new ncm.ConflictException();
  }

  @ncm.Put(':seriesId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async seriesPutAsync(@ncm.Param() params: app.api.LibraryParamSeries) {
    const series = await this.fetchSeriesAsync(params.seriesId);
    await this.libraryService.seriesPutAsync(series.path)
  }

  @ncm.Get(':seriesId/image')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async seriesImageAsync(@ncm.Param() params: app.api.LibraryParamSeries, @ncm.Response() response: express.Response) {
    const series = await this.fetchSeriesAsync(params.seriesId);
    const value = await this.libraryService.seriesImageAsync(series.path) ?? app.throwNotFound();
    response.attachment(value);
    response.sendFile(value, () => response.status(404).end());
  }
  
  @ncm.Get(':seriesId/:episodeId')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async episodeAsync(@ncm.Param() params: app.api.LibraryParamSeriesEpisode, @ncm.Response() response: express.Response) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.episodeId);
    const value = await this.libraryService.episodeAsync(match.episode.path);
    response.attachment(value);
    response.sendFile(value, () => response.status(404).end());
  }

  @ncm.Delete(':seriesId/:episodeId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  @nsg.ApiResponse({status: 409})
  async episodeDeleteAsync(@ncm.Param() params: app.api.LibraryParamSeriesEpisode) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.episodeId);
    if (await this.libraryService.episodeDeleteAsync(match.episode.path)) return;
    throw new ncm.ConflictException();
  }

  @ncm.Put(':seriesId/:episodeId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async episodePutAsync(@ncm.Param() params: app.api.LibraryParamSeriesEpisode) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.episodeId);
    await this.libraryService.episodePutAsync(match.episode.path);
  }

  @ncm.Get(':seriesId/:episodeId/image')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async episodeImageAsync(@ncm.Param() params: app.api.LibraryParamSeriesEpisode, @ncm.Response() response: express.Response) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.episodeId);
    const value = await this.libraryService.episodeImageAsync(match.episode.path) ?? app.throwNotFound();
    response.attachment(value);
    response.sendFile(value, () => response.status(404).end());
  }
  
  @ncm.Get(':seriesId/:episodeId/subtitle')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async episodeSubtitleAsync(@ncm.Param() params: app.api.LibraryParamSeriesEpisode, @ncm.Response() response: express.Response) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.episodeId);
    const value = await this.libraryService.episodeSubtitleAsync(match.episode.path);
    response.attachment(value);
    response.sendFile(value, () => response.status(404).end());
  }

  private async fetchSeriesAsync(seriesId: string) {
    const context = await this.libraryService.contextAsync();
    const series = context.series.find(x => x.id === seriesId) ?? app.throwNotFound();
    return await this.libraryService.seriesAsync(series.path);
  }
  
  private async fetchEpisodeAsync(seriesId: string, episodeId: string) {
    const series = await this.fetchSeriesAsync(seriesId);
    const episode = series.seasons.flatMap(x => x.episodes).find(x => x.id === episodeId) ?? app.throwNotFound();
    return {series, episode};
  }
}
