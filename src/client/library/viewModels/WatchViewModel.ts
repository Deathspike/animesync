import * as app from '..';
import * as mobx from 'mobx';
const api = app.shared.core.api;

export class WatchViewModel {  
  constructor() {
    mobx.makeObservable(this);
  }

  @mobx.action
  async loadAsync(seriesId: string, episodeId: string) {
    const seriesPromise = api.library.seriesAsync({seriesId});
    const subtitlePromise = fetch(api.library.episodeSubtitleUrl({seriesId, episodeId}));
    const series = await seriesPromise;
    const subtitle = await subtitlePromise;
    if (series.value && subtitle.status === 200) {
      this.detach();

      const navigator = new app.Navigator(series.value, episodeId);
      const subtitles: Array<app.session.ISubtitle> = [];
      
      await subtitle.blob().then(x => extractSubtitlesAsync(x, subtitles));
      
      this.player = new app.session.Renderer();
      this.session = new app.session.MainViewModel(navigator, this.player, subtitles);
      
      this.session.attach();
      this.player.video.src = api.library.episodeUrl({seriesId, episodeId});

    } else if (series.statusCode === 404) {
      // Handle not found.
    } else {
      // Handle error.
    }
  }

  detach() {
    // TODO: call me! detach stuff, release subs
    this.session?.detach();
  }

  @mobx.observable
  player?: app.session.Renderer = undefined;

  @mobx.observable
  session?: app.session.MainViewModel = undefined;
}

import JSZip from 'jszip';
async function extractSubtitlesAsync(zip: Blob, subtitles: Array<app.session.ISubtitle>) {
  for (const file of await JSZip.loadAsync(zip).then(x => Object.values(x.files))) {
    const match = file.name.match(/\.(.+)\.(ass|srt)$/);
    if (match) {
      const language = match[1];
      const text = await file.async('text');
      const type = match[2] as 'ass' | 'srt';
      if (type === 'srt') {
        const value = text.replace(/(\d+:\d+:\d+)+,(\d+)/g, "$1.$2");
        const vtt = `WEBVTT\r\n\r\n${value}`;
        const url = URL.createObjectURL(new Blob([vtt]));
        subtitles.push({language, type: 'vtt', url});
      } else {
        const url = URL.createObjectURL(new Blob([text]));
        subtitles.push({language, type, url});
      }
    }
  }
}
