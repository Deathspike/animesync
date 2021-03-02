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
  
  @ncm.Get(':url')
  async emulateAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamEmulate,
    @ncm.Res() response: express.Response) {
    await this.agentService.forwardAsync(new URL(params.url), response, {headers: {...headers, ...query}});
  }

  @ncm.Get('hls/:url')
  async hlsAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: app.api.RewriteParamHls,
    @ncm.Res() response: express.Response) {
    delete headers['range'];
    const result = await this.agentService.fetchAsync(new URL(params.url), {headers: {...headers, ...query}});
    if (result.status === 200) {
      const manifest = await result.text();
      response.send(this.hlsService.rewrite(params.url, manifest, query));
    } else {
      response.sendStatus(500);
    }
  }
}
