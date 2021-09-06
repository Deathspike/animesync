import sanitizeHtml from 'sanitize-html';

export class WebVtt {
  private readonly container: HTMLElement;
  private readonly track: HTMLTrackElement;

  private constructor(container: HTMLElement, track: HTMLTrackElement) {
    this.container = container;
    this.track = track;
  }

  static attach(container: HTMLDivElement, track: HTMLTrackElement) {
    const webvtt = new WebVtt(container, track);
    webvtt.attach();
  }

  attach() {
    this.track.track.mode = 'hidden';
    for (let i = 0; this.track.track.cues && i < this.track.track.cues.length; i++) {
      const cue = this.track.track.cues[i] as VTTCue;
      cue.addEventListener('enter', () => (this.container.innerHTML = this.sanitize(cue.text)) && (this.container.style.visibility = 'visible'));
      cue.addEventListener('exit', () => this.container.style.visibility = 'hidden');
    }
  }

  private sanitize(text: string) {
    return sanitizeHtml(text, {
      allowedTags: ['b', 'i', 'u'],
      transformTags: {'em': 'b', 'strong': 'b'}
    });
  }
}
