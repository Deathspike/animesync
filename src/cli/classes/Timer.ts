export class Timer {
  private readonly creationTime: number;

  constructor() {
    this.creationTime = Date.now();
  }

  toString() {
    let elapsedTime = Date.now() - this.creationTime;
    let seconds = String(Math.floor(elapsedTime / 1000) % 60).padStart(2, '0');
    let minutes = String(Math.floor(elapsedTime / 1000 / 60) % 60).padStart(2, '0');
    let hours = String(Math.floor(elapsedTime / 1000 / 60 / 60)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
