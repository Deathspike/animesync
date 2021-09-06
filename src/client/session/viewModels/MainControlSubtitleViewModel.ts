import * as app from '..';
import * as mobx from 'mobx';
import {language} from '../language';
const sizeKey = 'preferredSize';
const subtitleKey = 'preferredSubtitle';
const subtitleNone = 'none';

export class MainControlSubtitleViewModel implements app.IVideoHandler, app.IViewHandler {
  constructor(
    private readonly bridge: app.Bridge
  ) {}

  @mobx.action
  clear() {
    if (!this.canSelectSubtitle || !this.selectedSubtitle) return;
    app.core.store.set(subtitleKey, subtitleNone);
    this.selectedSubtitle = undefined;
    this.bridge.dispatchRequest({type: 'clearSubtitle'});
  }

  @mobx.action
  selectSize(size: app.ISubtitle['size']) {
    if (!this.canSelectSize || !this.selectedSubtitle || this.selectedSubtitle.size === size) return;
    app.core.store.set(sizeKey, size);
    this.loadSubtitle(this.selectedSubtitle);
  }

  @mobx.action
  selectSubtitle(subtitle: app.ISubtitle) {
    if (!this.canSelectSubtitle || this.selectedSubtitle === subtitle) return;
    app.core.store.set(subtitleKey, subtitle.language);
    this.loadSubtitle(subtitle);
  }

  @mobx.action
  onVideoRequest(event: app.VideoRequest) {
    switch (event.type) {
      case 'subtitles':
        this.subtitles = event.subtitles.map(x => ({...x, displayNames: getSubtitleNames(x)})).sort((a, b) => a.displayNames[0].localeCompare(b.displayNames[0]));
        this.detectSubtitle();
        break;
    }
  }
  
  @mobx.action
  onViewMount() {
    this.bridge.subscribe(this);
  }

  @mobx.action
  onViewUnmount() {
    this.bridge.unsubscribe(this);
  }

  @mobx.computed
  get canSelectSize() {
    return Boolean(this.selectedSubtitle);
  }

  @mobx.computed
  get canSelectSubtitle() {
    return Boolean(this.subtitles.length);
  }

  @mobx.observable
  selectedSubtitle?: app.ISubtitle;

  @mobx.observable
  subtitles: Array<app.ISubtitle> = [];

  @mobx.action
  private detectSubtitle() {
    const preferred = app.core.store.getString(subtitleKey, 'en-US');
    if (preferred === subtitleNone || this.tryLoadSubtitle(preferred)) return;
    this.tryLoadSubtitle('en-US');
  }

  @mobx.action
  private loadSubtitle(subtitle: app.ISubtitle) {
    const size = app.core.store.getString(sizeKey, 'normal') as app.ISubtitle['size'];
    this.selectedSubtitle = {...subtitle, size};
    this.bridge.dispatchRequest({type: 'loadSubtitle', subtitle: this.selectedSubtitle});
  }

  @mobx.action
  private tryLoadSubtitle(language: string | null) {
    const subtitle = this.subtitles.find(x => x.language === language);
    if (subtitle) {
      this.loadSubtitle(subtitle);
      return true;
    } else {
      return false;
    }
  }
}

function getSubtitleNames(subtitle: app.ISubtitle) {
  switch (subtitle.language) {
    case 'ar-ME': return language.subtitleArMe;
    case 'de-DE': return language.subtitleDeDe;
    case 'en-US': return language.subtitleEnUs;
    case 'es-ES': return language.subtitleEsEs;
    case 'es-LA': return language.subtitleEsLa;
    case 'fr-FR': return language.subtitleFrFr;
    case 'it-IT': return language.subtitleItIt;
    case 'pt-BR': return language.subtitlePtBr;
    case 'ru-RU': return language.subtitleRuRu;
    case 'tr-TR': return language.subtitleTrTr;
    default: throw new Error();
  }
}
