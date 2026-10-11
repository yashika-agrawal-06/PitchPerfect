import '@testing-library/jest-dom';

// Comprehensive localStorage mock for jsdom test environment
let store = {};

const localStorageMock = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (index) => Object.keys(store)[index] || null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
