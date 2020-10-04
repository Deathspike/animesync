import {randomBytes} from 'crypto';

export function createUniqueId() {
  const now = Date.now().toString(16);
  const random = randomBytes(24).toString('hex');
  return now + random;
}

export function promisify<T>(cb: (fn: (error?: Error | null, value?: T) => void) => void) {
  return new Promise<T>((resolve, reject) => {
    cb((error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}
