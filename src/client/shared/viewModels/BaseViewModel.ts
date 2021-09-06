import * as app from '..';
import * as mobx from 'mobx';

export class BaseViewModel implements app.IViewHandler {
  @mobx.action
  onViewMount() {
    this.isViewMounted = true;
  }
  
  @mobx.action
  onViewUnmount() {
    this.isViewMounted = false;
  }

  @mobx.observable
  protected isViewMounted = true;
}
