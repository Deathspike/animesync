import * as app from '..';
import * as mobx from 'mobx';
const subtitleKey = 'preferredSubtitle';
const subtitleNone = 'none';

export class MainControlSubtitleViewModel {
  private readonly player: app.Renderer;

  constructor(player: app.Renderer, subtitles: Array<app.ISubtitle>) {
    mobx.makeObservable(this);
    this.player = player;
    this.subtitles = subtitles.sort((a, b) => a.language.localeCompare(b.language));
  }

  @mobx.action
  attach() {
    this.detectSubtitle();
  }

  @mobx.action
  clear() {
    if (!this.canSelect || !this.selectedSubtitle) return;
    app.core.store.set(subtitleKey, subtitleNone);
    this.selectedSubtitle = undefined;
    this.player.clearSubtitle();
  }

  @mobx.action
  select(subtitle: app.ISubtitle) {
    if (!this.canSelect || this.selectedSubtitle === subtitle) return;
    app.core.store.set(subtitleKey, subtitle.language);
    this.loadSubtitle(subtitle);
  }

  @mobx.computed
  get canSelect() {
    return Boolean(this.subtitles.length);
  }

  @mobx.observable
  selectedSubtitle?: app.ISubtitle = undefined;

  @mobx.observable
  subtitles: Array<app.ISubtitle> = [];

  @mobx.action
  private detectSubtitle() {
    const preferred = app.core.store.getString(subtitleKey, 'eng');
    const subtitle = this.subtitles.find(x => x.language === preferred) ?? this.subtitles.find(x => x.language === 'eng');
    if (subtitle) this.loadSubtitle(subtitle);
  }

  @mobx.action
  private loadSubtitle(subtitle: app.ISubtitle) {
    this.selectedSubtitle = subtitle;
    this.player.subtitleAsync(subtitle.type, subtitle.url).catch((error) => console.error(error));
  }
}
