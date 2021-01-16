import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';

@api.Controller()
export class CoreController {
  @api.Get()
  @api.Redirect('/api/')
  @swg.ApiExcludeEndpoint()
  get() {}
}
