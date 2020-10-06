import os from 'os';
import path from 'path';

export function find(executable: string) {
  if (os.platform() !== 'win32') return executable;
  return path.join(__dirname, `../../../dep/${executable}.exe`);
}
