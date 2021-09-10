export class StoreManager {
  getNumber(key: string, defaultValue: number) {
    return Number(this.getString(key, String(defaultValue)));
  }
  
  getString(key: string, defaultValue: string) {
    return localStorage.getItem(getKey(key)) ?? defaultValue;
  }

  set(key: string, value?: boolean | number | string) {
    if (typeof value === 'undefined') {
      localStorage.removeItem(getKey(key));
    } else {
      localStorage.setItem(getKey(key), String(value));
    }
  }
}

function getKey(key: string) {
  return `animesync.${key}`;
}
