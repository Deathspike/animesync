import * as ace from '..';
import * as acm from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';
import express from 'express';

@ncm.Controller('api/rewrite')
@nsg.ApiTags('rewrite')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class RewriteController {
  private readonly _agentService: ace.shr.AgentService;
  private readonly _hlsService: acm.HlsService;

  constructor(agentService: ace.shr.AgentService, hlsService: acm.HlsService) {
    this._agentService = agentService;
    this._hlsService = hlsService;
  }
  
  @ncm.Get(':url')
  async emulateAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: ace.api.RewriteParamEmulate,
    @ncm.Res() response: express.Response) {
    await this._agentService.forwardAsync(new URL(params.url), response, {headers: {...headers, ...query}});
  }

  @ncm.Get('hls/:url')
  async hlsAsync(
    @ncm.Headers() headers: Record<string, string>,
    @ncm.Query() query: Record<string, string>,
    @ncm.Param() params: ace.api.RewriteParamHls,
    @ncm.Res() response: express.Response) {
    delete headers['range'];
    const result = await this._agentService.fetchAsync(new URL(params.url), {headers: {...headers, ...query}});
    if (result.status === 200) {
      const manifest = await result.text();
      const streamUrl = this._hlsService.getBestStreamUrl(manifest);
      if (streamUrl) await this.hlsAsync(headers, query, {url: streamUrl}, response);
      else response.send(this._hlsService.rewrite(manifest, query));
    } else {
      response.sendStatus(500);
    }
  }
}
