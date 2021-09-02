import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';

@ncm.Controller()
@nsg.ApiExcludeController()
@nsg.ApiTags('core')
export class CoreController {
  @ncm.Get()
  @ncm.Redirect('/api/')
  get() {}
}
