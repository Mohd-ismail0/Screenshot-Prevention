Object.defineProperty(window, 'visualViewport', {
    value: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      width: 1024,
      height: 768
    }
  });