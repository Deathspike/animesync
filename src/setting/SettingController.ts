import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';

@ncm.Controller('api/setting')
@nsg.ApiTags('setting')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class SettingController {
  private readonly settingService: app.SettingService;

  constructor(settingService: app.SettingService) {
    this.settingService = settingService;
  }

  @app.ResponseValidator(app.api.SettingCore)
  @ncm.Get()
  @nsg.ApiResponse({status: 200, type: app.api.SettingCore})
  core() {
    return app.settings.core;
  }

  @ncm.Put()
  @ncm.HttpCode(204)
  async coreAsync(@ncm.Body() model: app.api.SettingCore) {
    await this.settingService.coreAsync(model);
  }

  @app.ResponseValidator(app.api.SettingPath)
  @ncm.Get('path')
  @nsg.ApiResponse({status: 200, type: app.api.SettingPath})
  path() {
    return app.settings.path;
  }

  @ncm.Put('path')
  @ncm.HttpCode(204)
  async pathAsync(@ncm.Body() model: app.api.SettingPath) {
    await this.settingService.pathAsync(model);
  }
}
