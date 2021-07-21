import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';
import express from 'express';

@ncm.Controller('api/rewrite')
@ncm.UseInterceptors(app.ResponseLoggerInterceptor)
@nsg.ApiTags('rewrite')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class RewriteController {
  private readonly agentService: app.AgentService;
  private readonly hlsService: app.HlsService;
  private readonly subtitleService: app.SubtitleService;

  constructor(agentService: app.AgentService, hlsService: app.HlsService, subtitleService: app.SubtitleService) {
    this.agentService = agentService;
    this.hlsService = hlsService;
    this.subtitleService = subtitleService;
  }
  
  @ncm.Get(':emulateUrl')
  async emulateAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamEmulate,
    @ncm.Query() query: Record<string, string>,
    @ncm.Response() response: express.Response) {
    await this.agentService.emulateAsync(new URL(params.emulateUrl), response, {headers: {...headers, ...query}});
  }

  @ncm.Get('hls/master/:masterUrl/:mediaUrl')
  async hlsMasterAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamHlsMaster,
    @ncm.Query() query: Record<string, string>) {
    delete headers['range'];
    const buffer = await this.agentService.fetchAsync(new URL(params.masterUrl), {headers: {...headers, ...query}});
    const masterHls = app.HlsManifest.from(buffer.toString('utf8'));
    this.hlsService.stream(params.mediaUrl, masterHls);
    this.hlsService.rewrite(params.masterUrl, masterHls, query);
    return masterHls.toString();
  }

  @ncm.Get('hls/media/:mediaUrl')
  async hlsMediaAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamHlsMedia,
    @ncm.Query() query: Record<string, string>) {
    delete headers['range'];
    const buffer = await this.agentService.fetchAsync(new URL(params.mediaUrl), {headers: {...headers, ...query}});
    const mediaHls = app.HlsManifest.from(buffer.toString('utf8'));
    this.hlsService.rewrite(params.mediaUrl, mediaHls, query);
    return mediaHls.toString();
  }

  @ncm.Get('subtitle/:subtitleType/:subtitleUrl')
  async subtitleAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamSubtitle,
    @ncm.Query() query: Record<string, string>) {
    delete headers['range'];
    const buffer = await this.agentService.fetchAsync(new URL(params.subtitleUrl), {headers: {...headers, ...query}});
    const subtitle = buffer.toString('utf8');
    return this.subtitleService.rewrite(subtitle, params.subtitleType);
  }
}
