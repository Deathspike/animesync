import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';
import express from 'express';

@ncm.Controller('api/rewrite')
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
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamEmulate,
    @ncm.Res() response: express.Response) {
    delete headers['range'];
    const result = await this.agentService.fetchAsync(new URL(params.emulateUrl), {headers: {...headers, ...query}});
    response.status(result.status);
    response.send(result.buffer);
  }

  @ncm.Get('master/:masterUrl/:mediaUrl')
  async masterAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamMaster,
    @ncm.Res() response: express.Response) {
    delete headers['range'];
    const result = await this.agentService.fetchAsync(new URL(params.masterUrl), {headers: {...headers, ...query}});
    if (result.status === 200) {
      const hls = app.HlsManifest.from(result.buffer.toString('utf8'));
      this.hlsService.stream(params.mediaUrl, hls);
      this.hlsService.rewrite(params.masterUrl, hls, query);
      response.send(hls.toString());
    } else {
      response.sendStatus(500);
    }
  }

  @ncm.Get('media/:mediaUrl')
  async mediaAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamMedia,
    @ncm.Res() response: express.Response) {
    delete headers['range'];
    const result = await this.agentService.fetchAsync(new URL(params.mediaUrl), {headers: {...headers, ...query}});
    if (result.status === 200) {
      const hls = app.HlsManifest.from(result.buffer.toString('utf8'));
      this.hlsService.rewrite(params.mediaUrl, hls, query);
      response.send(hls.toString());
    } else {
      response.sendStatus(500);
    }
  }
}
