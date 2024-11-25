Object.defineProperty(window, 'visualViewport', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    width: 1024,
    height: 768
  },
  writable: true,
  configurable: true
});

// Make sure mediaDevices exists in the test environment
Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getDisplayMedia: jest.fn(),
    addEventListener: jest.fn()
  },
  writable: true,
  configurable: true
});

// Mock mediaSession
Object.defineProperty(window.navigator, 'mediaSession', {
  value: {
    setActionHandler: jest.fn()
  },
  writable: true,
  configurable: true
});