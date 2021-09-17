import sanitizeHtml from 'sanitize-html';

export class Renderer {
  private octopus?: SubtitlesOctopus;
  readonly video: HTMLVideoElement;
  readonly vtt: HTMLDivElement;

  constructor() {
    this.video = document.createElement('video');
    this.video.autoplay = true;
    this.vtt = document.createElement('div');
  }
  
  clearSubtitle() {
    Array.from(this.video.querySelectorAll('track')).forEach(x => this.video.removeChild(x));
    this.vtt.innerHTML = '';
    this.octopus?.dispose();
    this.octopus = undefined;
  }

  subtitleAsync(type: 'ass' | 'vtt', url: string) {
    this.clearSubtitle();
    switch (type) {
      case 'ass': return this.subtitleAssAsync(url);
      case 'vtt': return this.subtitleVttAsync(url);
    }
  }
  
  private async subtitleAssAsync(url: string) {
    const text = await fetch(url).then(x => x.text());
    const fonts = ['/subtitles-octopus-4.0.0/assets/default.woff2', '/subtitles-octopus-4.0.0/assets/arabic.woff2'];
    const workerUrl = '/subtitles-octopus-4.0.0/subtitles-octopus-worker.js';
    this.octopus = new SubtitlesOctopus({video: this.video, subContent: text, workerUrl, fonts});
  }

  private subtitleVttAsync(url: string) {
    return new Promise<void>((resolve, reject) => {
      const trackElement = this.video.appendChild(document.createElement('track'));
      trackElement.default = true;
      trackElement.track.mode = 'hidden';
      trackElement.src = url;
      trackElement.addEventListener('load', () => {
        for (let i = 0; trackElement.track.cues && i < trackElement.track.cues.length; i++) {
          const cue = trackElement.track.cues[i] as VTTCue;
          const html = sanitizeHtml(cue.text, {allowedTags: ['b', 'i', 'u'], transformTags: {'em': 'b', 'strong': 'b'}});
          cue.addEventListener('exit', () => this.vtt.style.visibility = 'hidden');
          cue.addEventListener('enter', () => (this.vtt.innerHTML = html) && (this.vtt.style.visibility = 'visible'));
        }
        resolve();
      });
      trackElement.addEventListener('error', reject);
    });
  }
}
