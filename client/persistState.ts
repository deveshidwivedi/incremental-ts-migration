/*
  Saves and loads a snapshot of the Redux store
  state to session storage
*/
const key = 'p5js-editor';
const storage = sessionStorage;

//generic type for state to support TS+JS
export const saveState = <T = unknown>(state: T): void => {
  try {
    storage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist state to storage:', error);
  }
};

export const loadState = <T = unknown>(): T | null => {
  try {
    const item = storage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.warn('Failed to retrieve initialize state from storage:', error);
    return null;
  }
};

export const clearState = (): void => {
  storage.removeItem(key);
};
