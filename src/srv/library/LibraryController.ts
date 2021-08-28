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
  async contextGetAsync() {
    return await this.libraryService.contextGetAsync();
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
    const context = await this.libraryService.contextGetAsync();
    await context.series.reduce((p, c) => p.then(() => this.libraryService.seriesPutAsync(c.path)), Promise.resolve());
  }

  @ncm.Delete(':seriesId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  @nsg.ApiResponse({status: 409})
  async seriesDeleteAsync(@ncm.Param() params: app.api.LibraryParamSeries) {
    const series = await this.fetchSeriesAsync(params.seriesId);
    if (await this.libraryService.seriesDeleteAsync(series.path)) return;
    app.error.conflict();
  }

  @app.ResponseValidator(app.api.LibrarySeries)
  @ncm.Get(':seriesId')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200, type: app.api.LibrarySeries})
  @nsg.ApiResponse({status: 404})
  async seriesGetAsync(@ncm.Param() params: app.api.LibraryParamSeries) {
    return await this.fetchSeriesAsync(params.seriesId);
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
    const value = await this.libraryService.seriesImageAsync(series.path) ?? app.error.notFound();
    response.sendFile(value.filePath, () => response.status(404).end());
  }
  
  @nsg.ApiBasicAuth() // NotYetImplemented
  @ncm.Delete(':seriesId/:seasonId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async seasonDeleteAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeason) {
    console.log(params);
    throw new ncm.UnauthorizedException();
  }

  @nsg.ApiBasicAuth() // NotYetImplemented
  @app.ResponseValidator(app.api.LibrarySeriesSeason)
  @ncm.Get(':seriesId/:seasonId')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200, type: app.api.LibrarySeriesSeason})
  @nsg.ApiResponse({status: 404})
  async seasonGetAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeason) {
    console.log(params);
    throw new ncm.UnauthorizedException();
  }

  @nsg.ApiBasicAuth() // NotYetImplemented
  @ncm.Put(':seriesId/:seasonId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async seasonPutAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeason) {
    console.log(params);
    throw new ncm.UnauthorizedException();
  }

  @nsg.ApiBasicAuth() // NotYetImplemented
  @ncm.Get(':seriesId/:seasonId/image')
  @ncm.HttpCode(200)
  @nsg.ApiNotImplementedResponse()
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async seasonImageAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeason) {
    console.log(params);
    throw new ncm.UnauthorizedException();
  }

  @ncm.Delete(':seriesId/:seasonId/:episodeId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async episodeDeleteAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeasonEpisode) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.seasonId, params.episodeId);
    await this.libraryService.episodeDeleteAsync(match.episode.path);
  }

  @ncm.Get(':seriesId/:seasonId/:episodeId')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async episodeGetAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeasonEpisode, @ncm.Response() response: express.Response) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.seasonId, params.episodeId);
    const value = await this.libraryService.episodeGetAsync(match.episode.path);
    response.sendFile(value.filePath, () => response.status(404).end());
  }

  @ncm.Put(':seriesId/:seasonId/:episodeId')
  @ncm.HttpCode(204)
  @nsg.ApiResponse({status: 204})
  @nsg.ApiResponse({status: 404})
  async episodePutAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeasonEpisode) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.seasonId, params.episodeId);
    await this.libraryService.episodePutAsync(match.episode.path);
  }

  @ncm.Get(':seriesId/:seasonId/:episodeId/image')
  @ncm.HttpCode(200)
  @nsg.ApiResponse({status: 200})
  @nsg.ApiResponse({status: 404})
  async episodeImageAsync(@ncm.Param() params: app.api.LibraryParamSeriesSeasonEpisode, @ncm.Response() response: express.Response) {
    const match = await this.fetchEpisodeAsync(params.seriesId, params.seasonId, params.episodeId);
    const value = await this.libraryService.episodeImageAsync(match.episode.path) ?? app.error.notFound();
    response.sendFile(value.filePath, () => response.status(404).end());
  }

  private async fetchSeriesAsync(seriesId: string) {
    const context = await this.libraryService.contextGetAsync();
    const series = context.series.find(x => x.id === seriesId) ?? app.error.notFound();
    return await this.libraryService.seriesGetAsync(series.path);
  }
  
  private async fetchEpisodeAsync(seriesId: string, seasonId: string, episodeId: string) {
    const series = await this.fetchSeriesAsync(seriesId);
    const season = series.seasons.find(x => x.id === seasonId) ?? app.error.notFound();
    const episode = season.episodes.find(x => x.id === episodeId) ?? app.error.notFound();
    return {series, season, episode};
  }
}
