import * as app from '..';
import * as mobx from 'mobx';
import {language} from '../language';
const subtitleKey = 'preferredSubtitle';
const subtitleNone = 'none';

export class MainControlSubtitleViewModel {
  constructor(private renderer: app.Renderer, subtitles: Array<app.ISubtitle>) {
    mobx.makeObservable(this);
    this.subtitles = subtitles.map(x => ({...x, displayNames: getSubtitleNames(x)})).sort((a, b) => a.displayNames[0].localeCompare(b.displayNames[0]));
    this.renderer.video.addEventListener('loadedmetadata', () => this.detectSubtitle());
  }

  @mobx.action
  clear() {
    if (!this.canSelectSubtitle || !this.selectedSubtitle) return;
    app.core.store.set(subtitleKey, subtitleNone);
    this.selectedSubtitle = undefined;
    this.renderer.clearSubtitle();
  }

  @mobx.action
  select(subtitle: app.ISubtitle) {
    if (!this.canSelectSubtitle || this.selectedSubtitle === subtitle) return;
    app.core.store.set(subtitleKey, subtitle.language);
    this.loadSubtitle(subtitle);
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
  selectedSubtitle?: app.ISubtitle = undefined;

  @mobx.observable
  subtitles: Array<app.ISubtitle> = [];

  @mobx.action
  private detectSubtitle() {
    const preferred = app.core.store.getString(subtitleKey, 'eng');
    if (preferred === subtitleNone || this.tryLoadSubtitle(preferred)) return;
    this.tryLoadSubtitle('eng');
  }

  @mobx.action
  private loadSubtitle(subtitle: app.ISubtitle) {
    this.selectedSubtitle = subtitle;
    this.renderer.subtitleAsync(subtitle.type, subtitle.url).catch((error) => console.error(error));
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
    case 'ara': return language.subtitleAra;
    case 'eng': return language.subtitleEng;
    case 'fre': return language.subtitleFre;
    case 'ger': return language.subtitleGer;
    case 'ita': return language.subtitleIta;
    case 'por': return language.subtitlePor;
    case 'rus': return language.subtitleRus;
    case 'spa': return language.subtitleSpa;
    case 'spa-419': return language.subtitleSpa419;
    case 'tur': return language.subtitleTur;
    default: return [subtitle.language, subtitle.language];
  }
}
