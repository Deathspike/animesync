import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';

@ncm.Controller()
export class CoreController {
  @ncm.Get()
  @ncm.Redirect('/api/')
  @nsg.ApiExcludeEndpoint()
  get() {}
}
