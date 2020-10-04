import {randomBytes} from 'crypto';

export function createUniqueId() {
  const now = Date.now().toString(16);
  const random = randomBytes(24).toString('hex');
  return now + random;
}
