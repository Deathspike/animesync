import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';
import express from 'express';

@ncm.Controller('api/rewrite')
@ncm.UseInterceptors(app.ResponseLoggerInterceptor)
@nsg.ApiExcludeController()
@nsg.ApiTags('rewrite')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class RewriteController {
  private readonly agentService: app.AgentService;
  private readonly hlsService: app.HlsService;

  constructor(agentService: app.AgentService, hlsService: app.HlsService) {
    this.agentService = agentService;
    this.hlsService = hlsService;
  }
  
  @ncm.Get(':emulateUrl')
  async emulateAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamEmulate,
    @ncm.Query() query: Record<string, string>,
    @ncm.Response() response: express.Response) {
    await this.agentService.emulateAsync(params.emulateUrl, response, {headers: {...headers, ...query}});
  }

  @ncm.Get('master/:masterUrl/:mediaUrl')
  async masterAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamMaster,
    @ncm.Query() query: Record<string, string>) {
    delete headers['range'];
    const buffer = await this.agentService.fetchAsync(params.masterUrl, {headers: {...headers, ...query}});
    const masterHls = app.HlsManifest.from(buffer.toString());
    this.hlsService.stream(params.mediaUrl, masterHls);
    this.hlsService.rewrite(params.masterUrl, masterHls, query);
    return masterHls.toString();
  }

  @ncm.Get('media/:mediaUrl')
  async mediaAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamMedia,
    @ncm.Query() query: Record<string, string>) {
    delete headers['range'];
    const buffer = await this.agentService.fetchAsync(params.mediaUrl, {headers: {...headers, ...query}});
    const mediaHls = app.HlsManifest.from(buffer.toString());
    this.hlsService.rewrite(params.mediaUrl, mediaHls, query);
    return mediaHls.toString();
  }
}
